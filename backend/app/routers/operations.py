from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Receipt, Delivery, Transfer, Adjustment, LedgerEntry, Product, Category, Warehouse, Inventory
from ..schemas import ReceiptCreate, DeliveryCreate, TransferCreate, AdjustmentCreate
from ..services.inventory_service import change_stock, get_or_create_inventory

router = APIRouter(prefix="/operations", tags=["Inventory Operations"])

@router.post("/receipts")
def receipt(data: ReceiptCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = change_stock(db, data.product_id, data.warehouse_id, data.quantity, "RECEIPT")
    r = Receipt(supplier=data.supplier, product_id=data.product_id, warehouse_id=data.warehouse_id, quantity=data.quantity)
    db.add(r); db.flush()
    db.query(LedgerEntry).filter(LedgerEntry.reference_id == None, LedgerEntry.operation_type=="RECEIPT").order_by(LedgerEntry.id.desc()).first().reference_id = str(r.id)
    db.commit()
    return {"message":"Receipt completed","receipt_id":r.id,"stock":item.quantity}

@router.get("/receipts")
def receipts(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Receipt).order_by(Receipt.id.desc()).all()

@router.post("/deliveries")
def delivery(data: DeliveryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = change_stock(db, data.product_id, data.warehouse_id, -data.quantity, "DELIVERY")
    d = Delivery(customer=data.customer, product_id=data.product_id, warehouse_id=data.warehouse_id, quantity=data.quantity)
    db.add(d); db.flush()
    entry = db.query(LedgerEntry).filter(LedgerEntry.reference_id == None, LedgerEntry.operation_type=="DELIVERY").order_by(LedgerEntry.id.desc()).first()
    if entry: entry.reference_id = str(d.id)
    db.commit()
    return {"message":"Delivery completed","delivery_id":d.id,"stock":item.quantity}

@router.get("/deliveries")
def deliveries(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Delivery).order_by(Delivery.id.desc()).all()

@router.post("/transfers")
def transfer(data: TransferCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if data.from_warehouse_id == data.to_warehouse_id: raise HTTPException(400,"Source and destination must differ")
    source = change_stock(db,data.product_id,data.from_warehouse_id,-data.quantity,"TRANSFER_OUT")
    dest = change_stock(db,data.product_id,data.to_warehouse_id,data.quantity,"TRANSFER_IN")
    t = Transfer(product_id=data.product_id,from_warehouse_id=data.from_warehouse_id,to_warehouse_id=data.to_warehouse_id,quantity=data.quantity)
    db.add(t); db.commit()
    return {"message":"Transfer completed","transfer_id":t.id,"source_stock":source.quantity,"destination_stock":dest.quantity}

@router.get("/transfers")
def transfers(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Transfer).order_by(Transfer.id.desc()).all()

@router.post("/adjustments")
def adjustment(data: AdjustmentCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = get_or_create_inventory(db,data.product_id,data.warehouse_id)
    recorded = item.quantity
    delta = data.counted_quantity - recorded
    item = change_stock(db,data.product_id,data.warehouse_id,delta,"ADJUSTMENT")
    a = Adjustment(product_id=data.product_id,warehouse_id=data.warehouse_id,recorded_quantity=recorded,counted_quantity=data.counted_quantity,difference=delta)
    db.add(a); db.commit()
    return {"message":"Adjustment completed","adjustment_id":a.id,"stock":item.quantity}

@router.get("/adjustments")
def adjustments(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Adjustment).order_by(Adjustment.id.desc()).all()

@router.get("/ledger")
def ledger(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(LedgerEntry).order_by(LedgerEntry.id.desc()).all()

@router.get("/stock")
def stock(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Inventory, Product, Warehouse).join(Product,Inventory.product_id==Product.id).join(Warehouse,Inventory.warehouse_id==Warehouse.id).all()
    return [{"product_id":p.id,"product":p.name,"sku":p.sku,"warehouse_id":w.id,"warehouse":w.name,"quantity":i.quantity,"unit":p.unit,"reorder_level":p.reorder_level} for i,p,w in rows]
