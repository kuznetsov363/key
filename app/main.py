import uvicorn
from fastapi import FastAPI

from .database import Base, engine
from .auth import auth_router
from .orders import orders_router
from .profile import profile_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Key Maker Bonus Service API")

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(orders_router)


@app.get("/")
def root():
    return {"message": "Key Maker Bonus API is running"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)