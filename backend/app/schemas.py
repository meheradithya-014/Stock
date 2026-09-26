from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "warehouse_staff"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CategoryCreate(BaseModel):
    name: str

class ProductCreate(BaseModel):
    name: str
    sku: str
    category_id: int
    unit: str
    reorder_level: float = Field(default=0, ge=0)
    initial_stock: float = Field(default=0, ge=0)
    warehouse_id: int | None = None

class ProductUpdate(BaseModel):
    name: str | None = None
    category_id: int | None = None
    unit: str | None = None
    reorder_level: float | None = Field(default=None, ge=0)

class WarehouseCreate(BaseModel):
    name: str
    location: str | None = None

class WarehouseUpdate(BaseModel):
    name: str | None = None
    location: str | None = None

class ReceiptCreate(BaseModel):
    supplier: str
    product_id: int
    warehouse_id: int
    quantity: float = Field(gt=0)

class DeliveryCreate(BaseModel):
    customer: str
    product_id: int
    warehouse_id: int
    quantity: float = Field(gt=0)

class TransferCreate(BaseModel):
    product_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: float = Field(gt=0)

class AdjustmentCreate(BaseModel):
    product_id: int
    warehouse_id: int
    counted_quantity: float = Field(ge=0)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6)
