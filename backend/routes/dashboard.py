from fastapi import APIRouter, Depends

from database import get_connection
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("")
def get_dashboard(
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # Total customers
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM customers
                """
            )
            total_customers = cursor.fetchone()[0]

            # Total appointments
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM appointments
                """
            )
            total_appointments = cursor.fetchone()[0]

            # Total orders
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM orders
                """
            )
            total_orders = cursor.fetchone()[0]

            # Total revenue
            cursor.execute(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM invoices
                WHERE payment_status = 'paid'
                """
            )
            total_revenue = cursor.fetchone()[0]

            # Pending orders
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM orders
                WHERE status = 'pending'
                """
            )
            pending_orders = cursor.fetchone()[0]

            # Pending appointments
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM appointments
                WHERE status = 'pending'
                """
            )
            pending_appointments = cursor.fetchone()[0]

            # Recent appointments
            cursor.execute(
                """
                SELECT
                    a.id,
                    c.name,
                    a.appointment_date,
                    a.appointment_time,
                    a.service,
                    a.status
                FROM appointments AS a
                JOIN customers AS c
                    ON a.customer_id = c.id
                ORDER BY
                    a.appointment_date DESC,
                    a.appointment_time DESC
                LIMIT 5
                """
            )

            recent_appointments = cursor.fetchall()

            # Recent orders
            cursor.execute(
                """
                SELECT
                    o.id,
                    c.name,
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
                ORDER BY o.created_at DESC
                LIMIT 5
                """
            )

            recent_orders = cursor.fetchall()

            return {
                "summary": {
                    "total_customers": total_customers,
                    "total_appointments": total_appointments,
                    "total_orders": total_orders,
                    "total_revenue": float(total_revenue),
                    "pending_orders": pending_orders,
                    "pending_appointments": pending_appointments
                },

                "recent_appointments": [
                    {
                        "id": row[0],
                        "customer_name": row[1],
                        "appointment_date": row[2],
                        "appointment_time": row[3],
                        "service": row[4],
                        "status": row[5]
                    }
                    for row in recent_appointments
                ],

                "recent_orders": [
                    {
                        "id": row[0],
                        "customer_name": row[1],
                        "service_name": row[2],
                        "quantity": row[3],
                        "total_amount": float(row[4]),
                        "status": row[5],
                        "created_at": row[6]
                    }
                    for row in recent_orders
                ]
            }

    finally:
        connection.close()