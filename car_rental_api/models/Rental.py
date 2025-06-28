# models/Rental.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime # Import DateTime
from sqlalchemy.orm import relationship
import enum
from database import Base

class RentalStatus(str, enum.Enum):
    pending = "pending"
    cancelled = "cancelled"
    ongoing = "ongoing"
    finished = "finished"

class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    # --- UBAH TIPE DATA INI ---
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    # -------------------------
    total_price = Column(Float, nullable=False)
    status = Column(Enum(RentalStatus), default=RentalStatus.pending, nullable=False)

    user = relationship("User", back_populates="rentals")
    car = relationship("Car", back_populates="rentals")