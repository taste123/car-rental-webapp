# crud/Rental.py
from sqlalchemy.orm import Session
# Impor model yang dibutuhkan secara langsung
from models.Rental import Rental
from models.Car import Car # Pastikan models/Car.py ada dan mendefinisikan kelas Car
# --- GANTI BARIS IMPOR SCHEMAS INI ---
# Impor skema yang dibutuhkan secara langsung, termasuk RentalStatus
import schemas
from schemas.Rental import RentalCreate, RentalResponse, RentalStatus # <-- Tambahkan RentalStatus di sini
# -------------------------------------
from datetime import datetime, timedelta

# Anda dapat menghapus baris ini:
# import models # Karena Anda mengimpor model spesifik di atas
# Anda juga dapat menghapus alias ini jika Anda mengimpor RentalStatus langsung dari schemas.Rental:
# from models.Rental import RentalStatus as ModelRentalStatus 

def create_rental(db: Session, rental: schemas.RentalCreate, user_id: int, total_price: float):
    """
    Membuat catatan rental baru.
    total_price diharapkan sudah dihitung oleh endpoint sebelum memanggil fungsi ini.
    """
    db_rental = Rental(
        user_id=user_id,
        car_id=rental.car_id,
        start_date=rental.start_date,
        end_date=rental.end_date,
        total_price=total_price,
        status=RentalStatus.pending # <-- Sekarang RentalStatus diimpor langsung
    )

    car = db.query(Car).filter(Car.id == rental.car_id).first()
    if car:
        car.available = False
        db.add(car)
        
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental

def get_user_rentals(db: Session, user_id: int):
    return db.query(Rental).filter(Rental.user_id == user_id).all()

def get_rental_history(db: Session):
    return db.query(Rental).all()