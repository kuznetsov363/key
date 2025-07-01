import uvicorn
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

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

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", response_class=HTMLResponse)
def root_page():
    """Serve a simple HTML page with JS client for quick testing."""
    try:
        with open("app/static/index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return {"message": "Key Maker Bonus API is running. Swagger: /docs"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)