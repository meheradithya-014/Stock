from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Category, Product, Warehouse, Inventory
from ..schemas import CategoryCreate, ProductCreate, ProductUpdate, WarehouseCreate, WarehouseUpdate

router = APIRouter(tags=["Master Data"])

@router.get("/categories")
def categories(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Category).order_by(Category.name).all()

@router.post("/categories")
def create_category(data: CategoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(400, "Category already exists")
    c = Category(name=data.name); db.add(c); db.commit(); db.refresh(c); return c

@router.post("/products")
def create_product(data: ProductCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(400, "SKU already exists")
    if not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(404, "Category not found")
    p = Product(name=data.name, sku=data.sku, category_id=data.category_id, unit=data.unit, reorder_level=data.reorder_level)
    db.add(p); db.flush()
    if data.initial_stock > 0:
        if not data.warehouse_id:
            raise HTTPException(400, "warehouse_id is required for initial stock")
        inv = Inventory(product_id=p.id, warehouse_id=data.warehouse_id, quantity=data.initial_stock)
        db.add(inv)
    db.commit(); db.refresh(p); return p

@router.get("/products")
def products(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Product, Category).join(Category, Product.category_id == Category.id).all()
    return [{"id": p.id, "name": p.name, "sku": p.sku, "category_id": p.category_id, "category": c.name, "unit": p.unit, "reorder_level": p.reorder_level} for p,c in rows]

@router.get("/products/{product_id}")
def product(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    return p

@router.put("/products/{product_id}")
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(p,k,v)
    db.commit(); db.refresh(p); return p

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    db.delete(p); db.commit(); return {"message":"Product deleted"}

@router.post("/warehouses")
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    w = Warehouse(**data.model_dump()); db.add(w); db.commit(); db.refresh(w); return w

@router.get("/warehouses")
def warehouses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Warehouse).order_by(Warehouse.id.desc()).all()

@router.get("/warehouses/{warehouse_id}")
def warehouse(warehouse_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w: raise HTTPException(404, "Warehouse not found")
    return w

@router.put("/warehouses/{warehouse_id}")
def update_warehouse(warehouse_id: int, data: WarehouseUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w: raise HTTPException(404, "Warehouse not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(w,k,v)
    db.commit(); db.refresh(w); return w

@router.delete("/warehouses/{warehouse_id}")
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w: raise HTTPException(404, "Warehouse not found")
    db.delete(w); db.commit(); return {"message":"Warehouse deleted"}
