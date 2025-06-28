from sqlalchemy.orm import Session
import models, schemas

def create_car(db: Session, car: schemas.CarCreate):
    db_car = models.Car(**car.dict())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

def get_cars(db: Session):
    return db.query(models.Car).all()

def get_car_by_id(db: Session, car_id: int):
    return db.query(models.Car).filter(models.Car.id == car_id).first()

def update_car(db: Session, car_id: int, car_update: schemas.CarCreate):
    db_car = get_car_by_id(db, car_id)
    if not db_car:
        return None
    for key, value in car_update.dict().items():
        setattr(db_car, key, value)
    db.commit()
    db.refresh(db_car)
    return db_car

def delete_car(db: Session, car_id: int):
    db_car = get_car_by_id(db, car_id)
    if not db_car:
        return False
    db.delete(db_car)
    db.commit()
    return True
