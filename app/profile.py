from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import schemas, models
from .auth import get_current_user, get_db

profile_router = APIRouter(tags=["profile"])


@profile_router.get("/profile", response_model=schemas.UserOut)
def get_profile(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return user


@profile_router.get("/profile/transactions", response_model=list[schemas.BonusTransactionOut])
def bonus_history(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    txs = db.query(models.BonusTransaction).filter(models.BonusTransaction.user_id == user.id).order_by(models.BonusTransaction.created_at.desc()).all()
    return txs