from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    phone: str
    email: Optional[str] = None


class UserCreate(UserBase):
    pass  # Could include sms_code in production


class UserOut(UserBase):
    id: int
    bonus_balance: int
    created_at: datetime

    class Config:
        orm_mode = True


class OrderCreate(BaseModel):
    amount_rub: int  # initial amount; may be updated when closing


class OrderClose(BaseModel):
    amount_rub: int
    bonus_to_spend: int = 0


class OrderOut(BaseModel):
    id: int
    user_id: int
    amount_rub: Optional[int]
    bonus_spent: int
    bonus_earned: int
    created_at: datetime
    closed_at: Optional[datetime]

    class Config:
        orm_mode = True


class BonusTransactionOut(BaseModel):
    id: int
    delta: int
    reason: str
    created_at: datetime

    class Config:
        orm_mode = True