from sqlalchemy import Column, Integer, String, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base

class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    price_per_day = Column(Float, nullable=False)
    available = Column(Boolean, default=True)
    image_url = Column(String(250), nullable=True)
    description = Column(String(500), nullable=True)

    rentals = relationship("Rental", back_populates="car")
