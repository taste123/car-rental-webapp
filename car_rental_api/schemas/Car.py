from pydantic import BaseModel
from typing import Optional


class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    price_per_day: float
    available: Optional[bool] = True
    image_url: Optional[str] = None
    description: Optional[str] = None


class CarCreate(CarBase):
    pass


class CarResponse(CarBase):
    id: int

    class Config:
        from_attributes = True


class CarAvailabilityUpdate(BaseModel):
    available: bool
