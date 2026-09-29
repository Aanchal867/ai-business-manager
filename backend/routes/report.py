from fastapi import APIRouter, Depends

from database import get_connection
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("")
def get_reports(
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

            # Completed appointments
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM appointments
                WHERE status = 'completed'
                """
            )
            completed_appointments = cursor.fetchone()[0]

            # Total orders
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM orders
                """
            )
            total_orders = cursor.fetchone()[0]

            # Completed orders
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM orders
                WHERE status = 'completed'
                """
            )
            completed_orders = cursor.fetchone()[0]

            # Total order value
            cursor.execute(
                """
                SELECT COALESCE(SUM(total_amount), 0)
                FROM orders
                """
            )
            total_order_value = cursor.fetchone()[0]

            # Paid revenue
            cursor.execute(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM invoices
                WHERE payment_status = 'paid'
                """
            )
            paid_revenue = cursor.fetchone()[0]

            # Unpaid invoice amount
            cursor.execute(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM invoices
                WHERE payment_status = 'unpaid'
                """
            )
            unpaid_amount = cursor.fetchone()[0]

            # Monthly revenue for current year
            cursor.execute(
                """
                SELECT
                    TO_CHAR(
                        DATE_TRUNC('month', created_at),
                        'YYYY-MM'
                    ) AS month,
                    SUM(amount)
                FROM invoices
                WHERE payment_status = 'paid'
                  AND EXTRACT(YEAR FROM created_at)
                      = EXTRACT(YEAR FROM CURRENT_DATE)
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at)
                """
            )

            monthly_revenue_rows = cursor.fetchall()

            monthly_revenue = [
                {
                    "month": row[0],
                    "revenue": float(row[1])
                }
                for row in monthly_revenue_rows
            ]

            # Orders by status
            cursor.execute(
                """
                SELECT
                    status,
                    COUNT(*)
                FROM orders
                GROUP BY status
                ORDER BY status
                """
            )

            order_status_rows = cursor.fetchall()

            orders_by_status = [
                {
                    "status": row[0],
                    "count": row[1]
                }
                for row in order_status_rows
            ]

            # Appointments by status
            cursor.execute(
                """
                SELECT
                    status,
                    COUNT(*)
                FROM appointments
                GROUP BY status
                ORDER BY status
                """
            )

            appointment_status_rows = cursor.fetchall()

            appointments_by_status = [
                {
                    "status": row[0],
                    "count": row[1]
                }
                for row in appointment_status_rows
            ]

            return {
                "summary": {
                    "total_customers": total_customers,
                    "total_appointments": total_appointments,
                    "completed_appointments": completed_appointments,
                    "total_orders": total_orders,
                    "completed_orders": completed_orders,
                    "total_order_value": float(total_order_value),
                    "paid_revenue": float(paid_revenue),
                    "unpaid_amount": float(unpaid_amount)
                },
                "monthly_revenue": monthly_revenue,
                "orders_by_status": orders_by_status,
                "appointments_by_status": appointments_by_status
            }

    finally:
        connection.close()