from fastapi import HTTPException
from ..models import Inventory, Product, Warehouse, LedgerEntry

def get_or_create_inventory(db, product_id, warehouse_id):
    item = db.query(Inventory).filter(
        Inventory.product_id == product_id,
        Inventory.warehouse_id == warehouse_id
    ).first()
    if not item:
        item = Inventory(product_id=product_id, warehouse_id=warehouse_id, quantity=0)
        db.add(item)
        db.flush()
    return item

def change_stock(db, product_id, warehouse_id, delta, operation_type, reference_id=None):
    if not db.query(Product).filter(Product.id == product_id).first():
        raise HTTPException(404, "Product not found")
    if not db.query(Warehouse).filter(Warehouse.id == warehouse_id).first():
        raise HTTPException(404, "Warehouse not found")
    item = get_or_create_inventory(db, product_id, warehouse_id)
    before = item.quantity
    after = before + delta
    if after < 0:
        raise HTTPException(400, "Insufficient stock")
    item.quantity = after
    db.add(LedgerEntry(
        operation_type=operation_type,
        product_id=product_id,
        warehouse_id=warehouse_id,
        quantity_change=delta,
        before_quantity=before,
        after_quantity=after,
        reference_id=reference_id
    ))
    return item
