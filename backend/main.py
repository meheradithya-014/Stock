from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .models import Category, Warehouse
from .routers import auth, master_data, operations, dashboard

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            db.add_all([Category(name="Raw Materials"),Category(name="Finished Goods"),Category(name="Electronics"),Category(name="Furniture")])
        if db.query(Warehouse).count() == 0:
            db.add_all([Warehouse(name="Main Warehouse",location="Main Store"),Warehouse(name="Production Floor",location="Production Rack")])
        db.commit()
    finally:
        db.close()

seed()

app = FastAPI(title="StockSense Inventory Management API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(master_data.router)
app.include_router(operations.router)
app.include_router(dashboard.router)

@app.get("/")
def root(): return {"message":"StockSense API is running"}

@app.get("/health")
def health(): return {"status":"ok"}
