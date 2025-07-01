from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import models, schemas
from .auth import get_current_user, get_db

orders_router = APIRouter(prefix="/orders", tags=["orders"])


@orders_router.post("/", response_model=schemas.OrderOut)
def create_order(order_in: schemas.OrderCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    order = models.Order(user_id=user.id, amount_rub=None)  # amount may be set later
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@orders_router.post("/{order_id}/close", response_model=schemas.OrderOut)
def close_order(order_id: int, close_data: schemas.OrderClose, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id, models.Order.user_id == user.id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.closed_at:
        raise HTTPException(status_code=400, detail="Order already closed")

    if close_data.bonus_to_spend > user.bonus_balance:
        raise HTTPException(status_code=400, detail="Not enough bonus balance")
    if close_data.bonus_to_spend > close_data.amount_rub:
        raise HTTPException(status_code=400, detail="Cannot spend more bonuses than order amount")

    # Spend bonuses
    if close_data.bonus_to_spend > 0:
        user.bonus_balance -= close_data.bonus_to_spend
        spend_tx = models.BonusTransaction(user_id=user.id, delta=-close_data.bonus_to_spend, reason=f"Spend bonuses on order {order.id}")
        db.add(spend_tx)

    # Earn bonuses equal to amount paid with money (after spending)
    paid_money = close_data.amount_rub - close_data.bonus_to_spend
    earned = paid_money  # 1:1 rule
    if earned > 0:
        user.bonus_balance += earned
        earn_tx = models.BonusTransaction(user_id=user.id, delta=earned, reason=f"Earn bonuses for order {order.id}")
        db.add(earn_tx)

    # Update order
    order.amount_rub = close_data.amount_rub
    order.bonus_spent = close_data.bonus_to_spend
    order.bonus_earned = earned
    order.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order


@orders_router.get("/", response_model=list[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == user.id).order_by(models.Order.created_at.desc()).all()
    return orders