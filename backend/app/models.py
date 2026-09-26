from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey

from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="warehouse_staff")
    created_at = Column(DateTime, default=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    unit = Column(String(50), nullable=False)
    reorder_level = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    location = Column(String(255))

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Float, default=0)

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True)
    supplier = Column(String(150), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String(30), default="Done")
    created_at = Column(DateTime, default=datetime.utcnow)

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True)
    customer = Column(String(150), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String(30), default="Done")
    created_at = Column(DateTime, default=datetime.utcnow)

class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    from_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    to_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String(30), default="Done")
    created_at = Column(DateTime, default=datetime.utcnow)

class Adjustment(Base):
    __tablename__ = "adjustments"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    recorded_quantity = Column(Float, nullable=False)
    counted_quantity = Column(Float, nullable=False)
    difference = Column(Float, nullable=False)
    status = Column(String(30), default="Done")
    created_at = Column(DateTime, default=datetime.utcnow)

class LedgerEntry(Base):
    __tablename__ = "stock_ledger"
    id = Column(Integer, primary_key=True)
    operation_type = Column(String(50), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity_change = Column(Float, nullable=False)
    before_quantity = Column(Float, nullable=False)
    after_quantity = Column(Float, nullable=False)
    reference_id = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class OTP(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False, index=True)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
