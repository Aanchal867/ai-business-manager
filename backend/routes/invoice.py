from fastapi import APIRouter, HTTPException, Depends

from database import get_connection
from schemas.schemas import InvoiceCreate, InvoiceUpdate
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/invoices",
    tags=["Invoices"]
)


# =========================
# CREATE INVOICE
# =========================

@router.post("")
def create_invoice(
    invoice: InvoiceCreate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # Check customer
            cursor.execute(
                """
                SELECT id
                FROM customers
                WHERE id = %s
                """,
                (invoice.customer_id,)
            )

            customer = cursor.fetchone()

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer ID does not exist"
                )

            # If an order ID is provided, verify that it exists
            if invoice.order_id is not None:
                cursor.execute(
                    """
                    SELECT id, customer_id, total_amount
                    FROM orders
                    WHERE id = %s
                    """,
                    (invoice.order_id,)
                )

                order = cursor.fetchone()

                if not order:
                    raise HTTPException(
                        status_code=404,
                        detail="Order ID does not exist"
                    )

                # Make sure the order belongs to the same customer
                if order[1] != invoice.customer_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Order does not belong to this customer"
                    )

            # Check duplicate invoice number
            cursor.execute(
                """
                SELECT id
                FROM invoices
                WHERE invoice_number = %s
                """,
                (invoice.invoice_number,)
            )

            existing_invoice = cursor.fetchone()

            if existing_invoice:
                raise HTTPException(
                    status_code=400,
                    detail="Invoice number already exists"
                )

            cursor.execute(
                """
                INSERT INTO invoices (
                    customer_id,
                    order_id,
                    invoice_number,
                    amount,
                    payment_status
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING
                    id,
                    customer_id,
                    order_id,
                    invoice_number,
                    amount,
                    payment_status,
                    created_at
                """,
                (
                    invoice.customer_id,
                    invoice.order_id,
                    invoice.invoice_number,
                    invoice.amount,
                    invoice.payment_status
                )
            )

            new_invoice = cursor.fetchone()

            connection.commit()

            return {
                "message": "Invoice created successfully",
                "invoice": {
                    "id": new_invoice[0],
                    "customer_id": new_invoice[1],
                    "order_id": new_invoice[2],
                    "invoice_number": new_invoice[3],
                    "amount": float(new_invoice[4]),
                    "payment_status": new_invoice[5],
                    "created_at": new_invoice[6]
                }
            }

    finally:
        connection.close()


# =========================
# GET ALL INVOICES
# =========================

@router.get("")
def get_invoices(
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    i.id,
                    i.customer_id,
                    c.name,
                    i.order_id,
                    i.invoice_number,
                    i.amount,
                    i.payment_status,
                    i.created_at
                FROM invoices AS i
                JOIN customers AS c
                    ON i.customer_id = c.id
                ORDER BY i.id DESC
                """
            )

            rows = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "customer_id": row[1],
                    "customer_name": row[2],
                    "order_id": row[3],
                    "invoice_number": row[4],
                    "amount": float(row[5]),
                    "payment_status": row[6],
                    "created_at": row[7]
                }
                for row in rows
            ]

    finally:
        connection.close()


# =========================
# GET SINGLE INVOICE
# =========================

@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    i.id,
                    i.customer_id,
                    c.name,
                    i.order_id,
                    i.invoice_number,
                    i.amount,
                    i.payment_status,
                    i.created_at
                FROM invoices AS i
                JOIN customers AS c
                    ON i.customer_id = c.id
                WHERE i.id = %s
                """,
                (invoice_id,)
            )

            invoice = cursor.fetchone()

            if not invoice:
                raise HTTPException(
                    status_code=404,
                    detail="Invoice not found"
                )

            return {
                "id": invoice[0],
                "customer_id": invoice[1],
                "customer_name": invoice[2],
                "order_id": invoice[3],
                "invoice_number": invoice[4],
                "amount": float(invoice[5]),
                "payment_status": invoice[6],
                "created_at": invoice[7]
            }

    finally:
        connection.close()


# =========================
# UPDATE INVOICE
# =========================

@router.put("/{invoice_id}")
def update_invoice(
    invoice_id: int,
    invoice: InvoiceUpdate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # Check customer
            cursor.execute(
                """
                SELECT id
                FROM customers
                WHERE id = %s
                """,
                (invoice.customer_id,)
            )

            customer = cursor.fetchone()

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer ID does not exist"
                )

            # Check order if provided
            if invoice.order_id is not None:
                cursor.execute(
                    """
                    SELECT id, customer_id
                    FROM orders
                    WHERE id = %s
                    """,
                    (invoice.order_id,)
                )

                order = cursor.fetchone()

                if not order:
                    raise HTTPException(
                        status_code=404,
                        detail="Order ID does not exist"
                    )

                if order[1] != invoice.customer_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Order does not belong to this customer"
                    )

            # Check duplicate invoice number
            cursor.execute(
                """
                SELECT id
                FROM invoices
                WHERE invoice_number = %s
                AND id != %s
                """,
                (
                    invoice.invoice_number,
                    invoice_id
                )
            )

            existing_invoice = cursor.fetchone()

            if existing_invoice:
                raise HTTPException(
                    status_code=400,
                    detail="Invoice number already exists"
                )

            cursor.execute(
                """
                UPDATE invoices
                SET
                    customer_id = %s,
                    order_id = %s,
                    invoice_number = %s,
                    amount = %s,
                    payment_status = %s
                WHERE id = %s
                RETURNING
                    id,
                    customer_id,
                    order_id,
                    invoice_number,
                    amount,
                    payment_status,
                    created_at
                """,
                (
                    invoice.customer_id,
                    invoice.order_id,
                    invoice.invoice_number,
                    invoice.amount,
                    invoice.payment_status,
                    invoice_id
                )
            )

            updated_invoice = cursor.fetchone()

            if not updated_invoice:
                raise HTTPException(
                    status_code=404,
                    detail="Invoice not found"
                )

            connection.commit()

            return {
                "message": "Invoice updated successfully",
                "invoice": {
                    "id": updated_invoice[0],
                    "customer_id": updated_invoice[1],
                    "order_id": updated_invoice[2],
                    "invoice_number": updated_invoice[3],
                    "amount": float(updated_invoice[4]),
                    "payment_status": updated_invoice[5],
                    "created_at": updated_invoice[6]
                }
            }

    finally:
        connection.close()


# =========================
# DELETE INVOICE
# =========================

@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                DELETE FROM invoices
                WHERE id = %s
                RETURNING id
                """,
                (invoice_id,)
            )

            deleted_invoice = cursor.fetchone()

            if not deleted_invoice:
                raise HTTPException(
                    status_code=404,
                    detail="Invoice not found"
                )

            connection.commit()

            return {
                "message": "Invoice deleted successfully"
            }

    finally:
        connection.close()