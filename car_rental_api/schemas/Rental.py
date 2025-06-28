# schemas/Rental.py
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime # Import datetime

class RentalStatus(str, Enum):
    pending = "pending"
    cancelled = "cancelled"
    ongoing = "ongoing"
    finished = "finished"

# Hapus RentalBase jika Anda menggunakannya hanya untuk mengelompokkan atribut umum
# Jika RentalBase tidak punya atribut lain selain yang sudah di RentalCreate/Response, ini lebih bersih.

class RentalCreate(BaseModel): # <-- INHERIT LANGSUNG DARI BASEMODEL, BUKAN RentalBase
    car_id: int
    start_date: datetime # <-- Tipe ini harus datetime (Pydantic akan parse ISO string)
    end_date: datetime   # <-- Tipe ini harus datetime (Pydantic akan parse ISO string)

class RentalResponse(BaseModel): # <-- INHERIT LANGSUNG DARI BASEMODEL
    # Semua field untuk respons API
    id: int
    user_id: int # user_id DIKEMBALIKAN dalam respons
    car_id: int
    start_date: datetime
    end_date: datetime
    total_price: float
    status: RentalStatus

    class Config:
        from_attributes = True
        # json_encoders = {datetime: lambda dt: dt.isoformat()} # Opsional: Pastikan backend mengirim format ISO