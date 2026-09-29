from datetime import date, time
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


# =========================================================
# CUSTOMER
# =========================================================

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None


# =========================================================
# APPOINTMENT
# =========================================================

class AppointmentCreate(BaseModel):
    customer_id: int
    appointment_date: date
    appointment_time: time
    service: str
    status: Literal[
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ] = "pending"


class AppointmentUpdate(BaseModel):
    customer_id: int
    appointment_date: date
    appointment_time: time
    service: str
    status: Literal[
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ] = "pending"


# =========================================================
# SERVICE
# =========================================================

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal = Field(gt=0)
    status: Literal["active", "inactive"] = "active"


class ServiceUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal = Field(gt=0)
    status: Literal["active", "inactive"] = "active"


# =========================================================
# ORDER
# =========================================================

class OrderCreate(BaseModel):
    customer_id: int
    service_id: int
    quantity: int = Field(gt=0)
    status: Literal[
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ] = "pending"


class OrderUpdate(BaseModel):
    customer_id: int
    service_id: int
    quantity: int = Field(gt=0)
    status: Literal[
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ] = "pending"


# =========================================================
# INVOICE
# =========================================================

class InvoiceCreate(BaseModel):
    customer_id: int
    order_id: Optional[int] = None
    invoice_number: str
    amount: Decimal = Field(gt=0)
    payment_status: Literal[
        "unpaid",
        "paid",
        "partial"
    ] = "unpaid"


class InvoiceUpdate(BaseModel):
    customer_id: int
    order_id: Optional[int] = None
    invoice_number: str
    amount: Decimal = Field(gt=0)
    payment_status: Literal[
        "unpaid",
        "paid",
        "partial"
    ] = "unpaid"


# =========================================================
# SETTINGS
# =========================================================

class SettingsUpdate(BaseModel):
    business_name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None


# =========================================================
# AUTHENTICATION
# =========================================================

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================================================
# AI ASSISTANT
# =========================================================

class AIQuestion(BaseModel):
    question: str


# =========================================================
# COMMON RESPONSE
# =========================================================

class MessageResponse(BaseModel):
    message: str