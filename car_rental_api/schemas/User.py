# schemas/User.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    customer = "customer"

class UserBase(BaseModel):
    # Atribut dasar yang dimiliki oleh semua representasi User
    username: str = Field(..., max_length=50)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None # Alamat bisa berupa string biasa dan opsional

class UserCreate(UserBase):
    # Untuk membuat user baru, password wajib
    password: str
    role: Optional[UserRole] = UserRole.customer # Default role saat registrasi

class UserResponse(UserBase):
    # Untuk respons API, sertakan ID dan role
    id: int
    role: UserRole

    class Config:
        from_attributes = True # Ini sudah benar untuk Pydantic v2

# --- SCHEMA BARU UNTUK UPDATE PROFIL ---
class UserUpdate(BaseModel):
    # Field yang bisa diupdate pada profil pengguna
    # Semua field bersifat Optional karena update bisa parsial (PATCH-like behavior for PUT)
    username: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    # Jika ingin mengizinkan admin mengubah role user, tambahkan ini:
    # role: Optional[UserRole] = None