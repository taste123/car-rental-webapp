from fastapi import FastAPI, Depends, HTTPException, status, Path, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import math

import models
import schemas
import crud
import auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Rental API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- USERS ---
@app.post("/users/register", response_model=schemas.UserResponse, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar")
    return crud.create_user(db=db, user=user)

@app.post("/users/token", response_model=schemas.Token, tags=["Users"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = auth.authenticate_user(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    role = user.role.value if hasattr(user.role, "value") else user.role
    access_token = auth.create_access_token(data={"sub": user.username, "role": role, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "role": role, "user_id": user.id}

@app.get("/users/me", response_model=schemas.UserResponse, tags=["Users"])
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
def read_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != schemas.UserRole.admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Tidak memiliki izin melihat data ini.")
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    return db_user

@app.put("/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
def update_user_profile(user_id: int, user_update: schemas.UserUpdate = Body(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.id != user_id and current_user.role != schemas.UserRole.admin:
        raise HTTPException(status_code=403, detail="Tidak memiliki izin mengupdate data ini.")

    if user_update.username and user_update.username != current_user.username:
        existing_user = crud.get_user_by_username(db, username=user_update.username)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=400, detail="Username sudah digunakan")
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=400, detail="Email sudah digunakan")
    if user_update.phone_number and user_update.phone_number != current_user.phone_number:
        existing_phone = db.query(models.User).filter(models.User.phone_number == user_update.phone_number).first()
        if existing_phone and existing_phone.id != user_id:
            raise HTTPException(status_code=400, detail="Nomor telepon sudah digunakan")

    db_user = crud.update_user(db, user_id, user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    return db_user


# --- CARS ---
@app.post("/cars", response_model=schemas.CarResponse, status_code=201, tags=["Cars"])
def add_car(car: schemas.CarCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    return crud.create_car(db=db, car=car)

@app.get("/cars", response_model=List[schemas.CarResponse], tags=["Cars"])
def list_cars(db: Session = Depends(get_db)):
    return crud.get_cars(db=db)

@app.put("/cars/{car_id}", response_model=schemas.CarResponse, tags=["Cars"])
def update_car_endpoint(car_id: int, car_update: schemas.CarCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    db_car = crud.update_car(db, car_id, car_update)
    if not db_car:
        raise HTTPException(status_code=404, detail="Mobil tidak ditemukan")
    return db_car

@app.delete("/cars/{car_id}", status_code=204, tags=["Cars"])
def delete_car_endpoint(car_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    success = crud.delete_car(db, car_id)
    if not success:
        raise HTTPException(status_code=404, detail="Mobil tidak ditemukan")

@app.put("/cars/{car_id}/availability", response_model=schemas.CarResponse, tags=["Cars"])
def update_car_availability(car_id: int, availability: schemas.CarAvailabilityUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Mobil tidak ditemukan")
    car.available = availability.available
    db.commit()
    db.refresh(car)
    return car


# --- RENTALS ---
@app.post("/rentals", response_model=schemas.RentalResponse, status_code=201, tags=["Rentals"])
def create_rental(rental_request: schemas.RentalCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != schemas.UserRole.customer:
        raise HTTPException(status_code=403, detail="Hanya customer yang dapat menyewa mobil.")

    car = db.query(models.Car).filter(models.Car.id == rental_request.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Mobil tidak ditemukan.")
    if not car.available:
        raise HTTPException(status_code=400, detail="Mobil tidak tersedia.")

    start = rental_request.start_date
    end = rental_request.end_date
    if start > end:
        raise HTTPException(status_code=400, detail="Tanggal selesai harus setelah mulai.")

    durasi_hari = math.ceil((end - start).total_seconds() / (24 * 3600))
    durasi_hari = max(durasi_hari, 1)
    total_price = float(durasi_hari * car.price_per_day)

    return crud.create_rental(db, rental_request, current_user.id, total_price)

@app.get("/rentals/me", response_model=List[schemas.RentalResponse], tags=["Rentals"])
def get_my_rentals(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_user_rentals(db=db, user_id=current_user.id)

@app.get("/rentals", response_model=List[schemas.RentalResponse], tags=["Rentals"])
def get_all_rentals(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    return crud.get_rental_history(db=db)

@app.patch("/rentals/{rental_id}/status", response_model=schemas.RentalResponse, tags=["Rentals"])
def update_rental_status(rental_id: int, status_update: schemas.RentalStatus = Body(..., embed=True, alias="status"), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    rental = db.query(models.Rental).filter(models.Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    car = db.query(models.Car).filter(models.Car.id == rental.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Mobil tidak ditemukan")

    if status_update == schemas.RentalStatus.ongoing and rental.status == schemas.RentalStatus.pending:
        durasi = rental.end_date - rental.start_date
        rental.start_date = datetime.now()
        rental.end_date = rental.start_date + durasi

        durasi_hari = math.ceil(durasi.total_seconds() / (24 * 3600))
        durasi_hari = max(durasi_hari, 1)
        rental.total_price = float(durasi_hari * car.price_per_day)

    if status_update == schemas.RentalStatus.finished:
        car.available = True

    rental.status = status_update
    db.commit()
    db.refresh(rental)
    return rental





# from fastapi import FastAPI, Depends, HTTPException, status, Path, Body
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from typing import List
# from fastapi.security import OAuth2PasswordRequestForm
# from enum import Enum 

# # Import datetime, timedelta, dan math
# from datetime import datetime, timedelta
# import math # <--- PASTIKAN INI ADA

# # Import paket utama. Pastikan __init__.py di setiap folder mengekspos yang dibutuhkan.
# import models
# import schemas
# import crud
# import auth

# # Mengimpor engine dan get_db dari database.py
# from database import engine, get_db

# # Pastikan semua model terdaftar dengan Base SQLAlchemy
# models.Base.metadata.create_all(bind=engine)

# app = FastAPI(title="Car Rental API", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], # Izinkan semua origin untuk development, sesuaikan di production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- Users Endpoints ---
# @app.post("/users/register", response_model=schemas.UserResponse, tags=["Users"])
# def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
#     db_user = crud.get_user_by_username(db, username=user.username)
#     if db_user:
#         raise HTTPException(status_code=400, detail="Username sudah terdaftar")
#     return crud.create_user(db=db, user=user)

# @app.post("/users/token", response_model=schemas.Token, tags=["Users"])
# def login_for_access_token(
#     form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
# ):
#     user = auth.authenticate_user(
#         db, username=form_data.username, password=form_data.password
#     )
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Username atau password salah",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     role = user.role.value if hasattr(user.role, "value") else user.role
#     access_token = auth.create_access_token(data={"sub": user.username, "role": role, "user_id": user.id})
#     return {"access_token": access_token, "token_type": "bearer", "role": role, "user_id": user.id}


# @app.get("/users/me", response_model=schemas.UserResponse, tags=["Users"])
# def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
#     """Mendapatkan detail profil user yang sedang login."""
#     return current_user

# @app.get("/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
# def read_user_by_id(
#     user_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_user)
# ):
#     """
#     Mendapatkan detail profil pengguna berdasarkan ID.
#     Hanya user itu sendiri atau admin yang diizinkan melihat.
#     """
#     if current_user.role != schemas.UserRole.admin and current_user.id != user_id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Tidak memiliki izin untuk melihat profil pengguna lain."
#         )
    
#     db_user = crud.get_user(db, user_id)
#     if not db_user:
#         raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
#     return db_user

# @app.put("/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
# def update_user_profile(
#     user_id: int,
#     user_update: schemas.UserUpdate = Body(...),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_user)
# ):
#     """
#     Memperbarui detail profil pengguna.
#     Hanya user itu sendiri atau admin yang diizinkan mengupdate.
#     """
#     if current_user.id != user_id and current_user.role != schemas.UserRole.admin:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Tidak memiliki izin untuk mengupdate profil pengguna ini."
#         )
    
#     if user_update.username and user_update.username != current_user.username:
#         existing_user = crud.get_user_by_username(db, username=user_update.username)
#         if existing_user and existing_user.id != user_id:
#             raise HTTPException(status_code=400, detail="Username sudah digunakan")

#     if user_update.email and user_update.email != current_user.email:
#         existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
#         if existing_user and existing_user.id != user_id:
#             raise HTTPException(status_code=400, detail="Email sudah digunakan")
            
#     if user_update.phone_number and user_update.phone_number != current_user.phone_number:
#         existing_phone = db.query(models.User).filter(models.User.phone_number == user_update.phone_number).first()
#         if existing_phone and existing_phone.id != user_id:
#             raise HTTPException(status_code=400, detail="Nomor telepon sudah digunakan")

#     db_user = crud.update_user(db, user_id, user_update)
#     if not db_user:
#         raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
#     return db_user



# ## Cars Endpoints ---
# @app.post(
#     "/cars",
#     response_model=schemas.CarResponse,
#     status_code=status.HTTP_201_CREATED,
#     tags=["Cars"],
# )
# def add_car(
#     car: schemas.CarCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_admin),
# ):
#     return crud.create_car(db=db, car=car)


# @app.get("/cars", response_model=List[schemas.CarResponse], tags=["Cars"])
# def list_cars(
#     db: Session = Depends(get_db),
# ):
#     return crud.get_cars(db=db)


# @app.put("/cars/{car_id}", response_model=schemas.CarResponse, tags=["Cars"])
# def update_car_endpoint(
#     car_id: int = Path(..., gt=0),
#     car_update: schemas.CarCreate = Body(...),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_admin),
# ):
#     db_car = crud.update_car(db, car_id, car_update)
#     if not db_car:
#         raise HTTPException(status_code=404, detail="Mobil tidak ditemukan")
#     return db_car


# @app.delete("/cars/{car_id}", status_code=204, tags=["Cars"])
# def delete_car_endpoint(
#     car_id: int = Path(..., gt=0),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_admin),
# ):
#     success = crud.delete_car(db, car_id)
#     if not success:
#         raise HTTPException(status_code=404, detail="Mobil tidak ditemukan")
#     return


# @app.put(
#     "/cars/{car_id}/availability", response_model=schemas.CarResponse, tags=["Cars"]
# )
# def update_car_availability(
#     car_id: int = Path(..., gt=0),
#     availability: schemas.CarAvailabilityUpdate = Body(...),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_admin),
# ):
#     car = db.query(models.Car).filter(models.Car.id == car_id).first()
#     if not car:
#         raise HTTPException(status_code=404, detail="Mobil tidak ditemukan")

#     car.available = availability.available
#     db.commit()
#     db.refresh(car)
#     return car



# ## Rentals Endpoints ---
# @app.post(
#     "/rentals",
#     response_model=schemas.RentalResponse,
#     status_code=status.HTTP_201_CREATED,
#     tags=["Rentals"],
# )
# def create_rental(
#     rental_request: schemas.RentalCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_user),
# ):
#     try:
#         # --- DEBUGGING: Cetak data yang diterima ---
#         print(f"[{datetime.now()}] Menerima permintaan rental:")
#         print(f"  Car ID: {rental_request.car_id}")
#         print(f"  Start Date: {rental_request.start_date}")
#         print(f"  End Date: {rental_request.end_date}")
#         print(f"  User ID: {current_user.id}, Role: {current_user.role}")

#         # Validasi role pengguna
#         if current_user.role != schemas.UserRole.customer:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Hanya customer yang dapat membuat rental."
#             )

#         # Ambil detail mobil untuk mendapatkan harga per hari
#         car = db.query(models.Car).filter(models.Car.id == rental_request.car_id).first()
#         if not car:
#             raise HTTPException(status_code=404, detail="Mobil tidak ditemukan.")
#         if not car.available:
#             raise HTTPException(status_code=400, detail="Mobil tidak tersedia untuk disewa.")
        
#         # --- PERBAIKAN PENTING: Menggunakan 'price_per_day' ---
#         # Validasi bahwa car.price_per_day ada dan merupakan angka
#         if not hasattr(car, 'price_per_day') or not isinstance(car.price_per_day, (int, float)):
#             print(f"[{datetime.now()}] ERROR: car.price_per_day tidak ditemukan atau bukan angka untuk car ID: {car.id}. Value: {getattr(car, 'price_per_day', 'N/A')}")
#             raise HTTPException(status_code=500, detail="Harga rental mobil per hari tidak valid pada objek mobil.")

#         # Hitung durasi dan total harga
#         start_date_obj = rental_request.start_date
#         end_date_obj = rental_request.end_date

#         # Pastikan tanggal valid dan end_date setelah start_date (atau sama untuk minimal 1 hari)
#         if start_date_obj > end_date_obj:
#             raise HTTPException(status_code=400, detail="Tanggal selesai harus setelah tanggal mulai.")
        
#         duration_delta = end_date_obj - start_date_obj

#         # Perhitungan jumlah hari sewa
#         # Jika tanggal mulai dan selesai sama persis (delta.total_seconds() == 0), hitung 1 hari.
#         # Jika ada durasi positif, bulatkan ke atas.
#         if duration_delta.total_seconds() <= 0:
#             rental_days_for_pricing = 1
#         else:
#             rental_days_for_pricing = math.ceil(duration_delta.total_seconds() / (24 * 3600))
#             # Pastikan minimal 1 hari jika durasi positif tapi kurang dari 24 jam (yang mungkin dibulatkan ke 0)
#             if rental_days_for_pricing == 0 and duration_delta.total_seconds() > 0:
#                 rental_days_for_pricing = 1
        
#         # Hitung total harga menggunakan 'price_per_day'
#         total_price_calculated = float(rental_days_for_pricing * car.price_per_day)
#         print(f"[{datetime.now()}] Calculated rental days: {rental_days_for_pricing}, Total Price: {total_price_calculated}")

#         # Panggil crud.create_rental dengan total_price yang sudah dihitung
#         return crud.create_rental(
#             db=db, 
#             rental=rental_request,
#             user_id=current_user.id,
#             total_price=total_price_calculated
#         )
#     except HTTPException as e:
#         # Tangkap HTTPException yang sudah didefinisikan agar tidak diubah menjadi 500 generik
#         raise e
#     except Exception as e:
#         # --- DEBUGGING: Log exception lengkap di server side ---
#         print(f"[{datetime.now()}] FATAL Error in create_rental endpoint: {e}", exc_info=True)
#         raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


# @app.get("/rentals/me", response_model=List[schemas.RentalResponse], tags=["Rentals"])
# def get_my_rentals(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_user),
# ):
#     return crud.get_user_rentals(db=db, user_id=current_user.id)


# @app.get("/rentals", response_model=List[schemas.RentalResponse], tags=["Rentals"])
# def get_all_rentals(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_admin),
# ):
#     return crud.get_rental_history(db=db)


# @app.patch(
#     "/rentals/{rental_id}/status",
#     response_model=schemas.RentalResponse,
#     tags=["Rentals"],
# )
# def update_rental_status(
#     rental_id: int = Path(..., gt=0),
#     status_update: schemas.RentalStatus = Body(..., embed=True, alias="status"),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_admin),
# ):
#     rental = db.query(models.Rental).filter(models.Rental.id == rental_id).first()
#     if not rental:
#         raise HTTPException(status_code=404, detail="Rental not found")

#     # Logika untuk mengupdate tanggal saat status menjadi 'ongoing'
#     if status_update == schemas.RentalStatus.ongoing and rental.status == schemas.RentalStatus.pending:
#         original_start_date: datetime = rental.start_date
#         original_end_date: datetime = rental.end_date
        
#         duration: timedelta = original_end_date - original_start_date
        
#         rental.start_date = datetime.now()
#         rental.end_date = rental.start_date + duration
        
#         car_details = db.query(models.Car).filter(models.Car.id == rental.car_id).first()
#         if car_details:
#             # --- PERBAIKAN PENTING: Menggunakan 'price_per_day' di sini juga ---
#             if not hasattr(car_details, 'price_per_day') or not isinstance(car_details.price_per_day, (int, float)):
#                 print(f"[{datetime.now()}] WARNING: Harga rental mobil per hari tidak valid saat update status untuk car ID: {car_details.id}.")
#                 pass # Lanjutkan tanpa mengupdate harga jika tidak valid

#             new_duration_seconds = (rental.end_date - rental.start_date).total_seconds()
            
#             # Bulatkan ke atas dan pastikan minimal 1 hari jika durasi > 0
#             if new_duration_seconds <= 0:
#                 rental_days_for_pricing_update = 1
#             else:
#                 rental_days_for_pricing_update = math.ceil(new_duration_seconds / (24 * 3600))
#                 if rental_days_for_pricing_update == 0 and new_duration_seconds > 0:
#                     rental_days_for_pricing_update = 1
            
#             # Hanya update total_price jika price_per_day valid
#             if isinstance(car_details.price_per_day, (int, float)):
#                 rental.total_price = float(rental_days_for_pricing_update * car_details.price_per_day)

#     # Perbarui status
#     rental.status = status_update
    
#     db.commit()
#     db.refresh(rental)
#     return rental