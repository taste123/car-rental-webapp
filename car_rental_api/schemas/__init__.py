# schemas/__init__.py
from .User import UserCreate, UserResponse, UserUpdate, UserRole # <-- Tambahkan UserRole di sini
from .Car import CarCreate, CarResponse, CarAvailabilityUpdate
from .Rental import RentalCreate, RentalResponse, RentalStatus
from .Token import Token