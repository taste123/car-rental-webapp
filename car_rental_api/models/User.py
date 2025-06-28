# models/User.py
from sqlalchemy import Column, Integer, String, Enum, Text # Import Text untuk kolom address
from sqlalchemy.orm import relationship
import enum
from database import Base # Asumsi database.py ada dan mendefinisikan Base

class UserRole(str, enum.Enum):
    admin = "admin"
    customer = "customer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)

    # --- KOLOM BARU DITAMBAHKAN ---
    full_name = Column(String(100), nullable=True) # Nama lengkap, bisa kosong
    phone_number = Column(String(20), unique=True, nullable=True) # Nomor telepon, unik, bisa kosong
    address = Column(Text, nullable=True) # Alamat lengkap, bisa kosong
    # -----------------------------

    rentals = relationship("Rental", back_populates="user")