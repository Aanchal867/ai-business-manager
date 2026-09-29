from fastapi import APIRouter, HTTPException, Depends

from database import get_connection
from schemas.schemas import CustomerCreate, CustomerUpdate
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


# --------------------------------------------------
# CREATE CUSTOMER
# --------------------------------------------------

@router.post("")
def create_customer(
    customer: CustomerCreate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO customers (name, phone, email, address)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, phone, email, address
                """,
                (
                    customer.name,
                    customer.phone,
                    customer.email,
                    customer.address
                )
            )

            new_customer = cursor.fetchone()
            connection.commit()

            return {
                "message": "Customer created successfully",
                "customer": {
                    "id": new_customer[0],
                    "name": new_customer[1],
                    "phone": new_customer[2],
                    "email": new_customer[3],
                    "address": new_customer[4]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# GET ALL CUSTOMERS
# --------------------------------------------------

@router.get("")
def get_customers(
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, phone, email, address
                FROM customers
                ORDER BY id
                """
            )

            rows = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "phone": row[2],
                    "email": row[3],
                    "address": row[4]
                }
                for row in rows
            ]

    finally:
        connection.close()


# --------------------------------------------------
# GET SINGLE CUSTOMER
# --------------------------------------------------

@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, phone, email, address
                FROM customers
                WHERE id = %s
                """,
                (customer_id,)
            )

            customer = cursor.fetchone()

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer not found"
                )

            return {
                "id": customer[0],
                "name": customer[1],
                "phone": customer[2],
                "email": customer[3],
                "address": customer[4]
            }

    finally:
        connection.close()


# --------------------------------------------------
# UPDATE CUSTOMER
# --------------------------------------------------

@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE customers
                SET
                    name = %s,
                    phone = %s,
                    email = %s,
                    address = %s
                WHERE id = %s
                RETURNING id, name, phone, email, address
                """,
                (
                    customer.name,
                    customer.phone,
                    customer.email,
                    customer.address,
                    customer_id
                )
            )

            updated_customer = cursor.fetchone()

            if not updated_customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer not found"
                )

            connection.commit()

            return {
                "message": "Customer updated successfully",
                "customer": {
                    "id": updated_customer[0],
                    "name": updated_customer[1],
                    "phone": updated_customer[2],
                    "email": updated_customer[3],
                    "address": updated_customer[4]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# DELETE CUSTOMER
# --------------------------------------------------

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM customers
                WHERE id = %s
                RETURNING id
                """,
                (customer_id,)
            )

            deleted_customer = cursor.fetchone()

            if not deleted_customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer not found"
                )

            connection.commit()

            return {
                "message": "Customer deleted successfully"
            }

    finally:
        connection.close()