from fastapi import APIRouter, HTTPException, Depends

from database import get_connection
from schemas.schemas import OrderCreate, OrderUpdate
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


# --------------------------------------------------
# CREATE ORDER
# --------------------------------------------------

@router.post("")
def create_order(
    order: OrderCreate,
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
                (order.customer_id,)
            )

            customer = cursor.fetchone()

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer ID does not exist"
                )

            # Get service and price
            cursor.execute(
                """
                SELECT id, name, price
                FROM services
                WHERE id = %s
                AND status = 'active'
                """,
                (order.service_id,)
            )

            service = cursor.fetchone()

            if not service:
                raise HTTPException(
                    status_code=404,
                    detail="Service ID does not exist or service is inactive"
                )

            service_id = service[0]
            service_name = service[1]
            service_price = service[2]

            total_amount = service_price * order.quantity

            # Create order
            cursor.execute(
                """
                INSERT INTO orders (
                    customer_id,
                    service_id,
                    quantity,
                    total_amount,
                    status
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING
                    id,
                    customer_id,
                    service_id,
                    quantity,
                    total_amount,
                    status,
                    created_at
                """,
                (
                    order.customer_id,
                    service_id,
                    order.quantity,
                    total_amount,
                    order.status
                )
            )

            new_order = cursor.fetchone()

            connection.commit()

            return {
                "message": "Order created successfully",
                "order": {
                    "id": new_order[0],
                    "customer_id": new_order[1],
                    "service_id": new_order[2],
                    "service_name": service_name,
                    "quantity": new_order[3],
                    "total_amount": float(new_order[4]),
                    "status": new_order[5],
                    "created_at": new_order[6]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# GET ALL ORDERS
# --------------------------------------------------

@router.get("")
def get_orders(
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    o.id,
                    o.customer_id,
                    c.name,
                    o.service_id,
                    s.name,
                    o.quantity,
                    o.total_amount,
                    o.status,
                    o.created_at
                FROM orders AS o
                JOIN customers AS c
                    ON o.customer_id = c.id
                JOIN services AS s
                    ON o.service_id = s.id
                ORDER BY o.id DESC
                """
            )

            rows = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "customer_id": row[1],
                    "customer_name": row[2],
                    "service_id": row[3],
                    "service_name": row[4],
                    "quantity": row[5],
                    "total_amount": float(row[6]),
                    "status": row[7],
                    "created_at": row[8]
                }
                for row in rows
            ]

    finally:
        connection.close()


# --------------------------------------------------
# GET SINGLE ORDER
# --------------------------------------------------

@router.get("/{order_id}")
def get_order(
    order_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    o.id,
                    o.customer_id,
                    c.name,
                    o.service_id,
                    s.name,
                    o.quantity,
                    o.total_amount,
                    o.status,
                    o.created_at
                FROM orders AS o
                JOIN customers AS c
                    ON o.customer_id = c.id
                JOIN services AS s
                    ON o.service_id = s.id
                WHERE o.id = %s
                """,
                (order_id,)
            )

            order = cursor.fetchone()

            if not order:
                raise HTTPException(
                    status_code=404,
                    detail="Order not found"
                )

            return {
                "id": order[0],
                "customer_id": order[1],
                "customer_name": order[2],
                "service_id": order[3],
                "service_name": order[4],
                "quantity": order[5],
                "total_amount": float(order[6]),
                "status": order[7],
                "created_at": order[8]
            }

    finally:
        connection.close()


# --------------------------------------------------
# UPDATE ORDER
# --------------------------------------------------

@router.put("/{order_id}")
def update_order(
    order_id: int,
    order: OrderUpdate,
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
                (order.customer_id,)
            )

            customer = cursor.fetchone()

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer ID does not exist"
                )

            # Check service
            cursor.execute(
                """
                SELECT id, name, price
                FROM services
                WHERE id = %s
                AND status = 'active'
                """,
                (order.service_id,)
            )

            service = cursor.fetchone()

            if not service:
                raise HTTPException(
                    status_code=404,
                    detail="Service ID does not exist or service is inactive"
                )

            service_price = service[2]
            total_amount = service_price * order.quantity

            cursor.execute(
                """
                UPDATE orders
                SET
                    customer_id = %s,
                    service_id = %s,
                    quantity = %s,
                    total_amount = %s,
                    status = %s
                WHERE id = %s
                RETURNING
                    id,
                    customer_id,
                    service_id,
                    quantity,
                    total_amount,
                    status,
                    created_at
                """,
                (
                    order.customer_id,
                    order.service_id,
                    order.quantity,
                    total_amount,
                    order.status,
                    order_id
                )
            )

            updated_order = cursor.fetchone()

            if not updated_order:
                raise HTTPException(
                    status_code=404,
                    detail="Order not found"
                )

            connection.commit()

            return {
                "message": "Order updated successfully",
                "order": {
                    "id": updated_order[0],
                    "customer_id": updated_order[1],
                    "service_id": updated_order[2],
                    "quantity": updated_order[3],
                    "total_amount": float(updated_order[4]),
                    "status": updated_order[5],
                    "created_at": updated_order[6]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# DELETE ORDER
# --------------------------------------------------

@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM orders
                WHERE id = %s
                RETURNING id
                """,
                (order_id,)
            )

            deleted_order = cursor.fetchone()

            if not deleted_order:
                raise HTTPException(
                    status_code=404,
                    detail="Order not found"
                )

            connection.commit()

            return {
                "message": "Order deleted successfully"
            }

    finally:
        connection.close()