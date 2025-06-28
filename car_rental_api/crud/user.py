# crud/User.py
from sqlalchemy.orm import Session
from models.User import User # Pastikan ini mengacu ke models.User yang sudah diperbarui
# Pastikan Anda mengimpor UserCreate dan UserUpdate
from schemas.User import UserCreate, UserUpdate
from utils.security import get_password_hash # Pastikan ini dari lokasi yang benar

def get_user_by_username(db: Session, username: str):
    """Mengambil pengguna berdasarkan username."""
    return db.query(User).filter(User.username == username).first()

def get_user(db: Session, user_id: int):
    """Mengambil pengguna berdasarkan ID."""
    return db.query(User).filter(User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Mengambil daftar semua pengguna dengan pagination."""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    """Membuat pengguna baru."""
    # Pastikan user.role adalah nilai string dari Enum
    role_value = user.role.value if hasattr(user.role, 'value') else user.role

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=role_value,
        # --- Tambahkan atribut baru saat membuat user ---
        full_name=user.full_name,
        phone_number=user.phone_number,
        address=user.address
        # -----------------------------------------------
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    """Memperbarui informasi profil pengguna."""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None # User tidak ditemukan

    # Konversi Pydantic model ke dictionary, hanya sertakan yang di-set (exclude_unset=True)
    update_data = user_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        # Lewati hashed_password atau field lain yang tidak boleh diupdate langsung
        if key == "password": # UserUpdate tidak punya password, tapi jaga-jaga
            continue
        setattr(db_user, key, value) # Perbarui atribut model SQLAlchemy

    db.add(db_user) # Menambahkan kembali untuk memastikan perubahan dilacak
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """Menghapus pengguna berdasarkan ID."""
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False