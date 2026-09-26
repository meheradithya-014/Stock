from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Product, Inventory, Receipt, Delivery, Transfer

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
def dashboard(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total_products = db.query(Product).count()
    total_units = db.query(func.sum(Inventory.quantity)).scalar() or 0
    low = db.query(Inventory).join(Product,Inventory.product_id==Product.id).filter(Inventory.quantity <= Product.reorder_level, Inventory.quantity > 0).count()
    out = db.query(Inventory).filter(Inventory.quantity <= 0).count()
    return {
        "total_products": total_products,
        "total_stock_units": total_units,
        "low_stock_items": low,
        "out_of_stock_items": out,
        "pending_receipts": db.query(Receipt).filter(Receipt.status != "Done").count(),
        "pending_deliveries": db.query(Delivery).filter(Delivery.status != "Done").count(),
        "internal_transfers_scheduled": db.query(Transfer).filter(Transfer.status != "Done").count()
    }
