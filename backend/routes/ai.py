from fastapi import APIRouter, Depends

from database import get_connection
from schemas.schemas import AIQuestion
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Assistant"]
)


@router.post("/ask")
def ask_ai(
    question: AIQuestion,
    current_user: dict = Depends(get_current_user)
):

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            user_question = question.question.lower().strip()

            # -----------------------------------
            # TOTAL CUSTOMERS
            # -----------------------------------

            if "customer" in user_question:

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM customers
                    """
                )

                total_customers = cursor.fetchone()[0]

                return {
                    "question": question.question,
                    "answer": (
                        f"You currently have "
                        f"{total_customers} customer(s) "
                        f"in your business database."
                    )
                }

            # -----------------------------------
            # TOTAL ORDERS
            # -----------------------------------

            elif "order" in user_question:

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM orders
                    """
                )

                total_orders = cursor.fetchone()[0]

                return {
                    "question": question.question,
                    "answer": (
                        f"You currently have "
                        f"{total_orders} order(s)."
                    )
                }

            # -----------------------------------
            # TOTAL APPOINTMENTS
            # -----------------------------------

            elif "appointment" in user_question:

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM appointments
                    """
                )

                total_appointments = cursor.fetchone()[0]

                return {
                    "question": question.question,
                    "answer": (
                        f"You currently have "
                        f"{total_appointments} appointment(s)."
                    )
                }

            # -----------------------------------
            # REVENUE
            # -----------------------------------

            elif (
                "revenue" in user_question
                or "earning" in user_question
            ):

                cursor.execute(
                    """
                    SELECT COALESCE(SUM(amount), 0)
                    FROM invoices
                    WHERE payment_status = 'paid'
                    """
                )

                revenue = cursor.fetchone()[0]

                return {
                    "question": question.question,
                    "answer": (
                        f"Your current paid revenue is "
                        f"₹{float(revenue):,.2f}."
                    )
                }

            # -----------------------------------
            # UNPAID AMOUNT
            # -----------------------------------

            elif (
                "unpaid" in user_question
                or "pending payment" in user_question
            ):

                cursor.execute(
                    """
                    SELECT COALESCE(SUM(amount), 0)
                    FROM invoices
                    WHERE payment_status = 'unpaid'
                    """
                )

                unpaid_amount = cursor.fetchone()[0]

                return {
                    "question": question.question,
                    "answer": (
                        f"The current unpaid invoice amount is "
                        f"₹{float(unpaid_amount):,.2f}."
                    )
                }

            # -----------------------------------
            # SERVICES
            # -----------------------------------

            elif "service" in user_question:

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM services
                    WHERE status = 'active'
                    """
                )

                total_services = cursor.fetchone()[0]

                return {
                    "question": question.question,
                    "answer": (
                        f"You currently have "
                        f"{total_services} active service(s)."
                    )
                }

            # -----------------------------------
            # GENERAL BUSINESS SUMMARY
            # -----------------------------------

            elif (
                "business" in user_question
                or "summary" in user_question
                or "overview" in user_question
            ):

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM customers
                    """
                )
                customers = cursor.fetchone()[0]

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM appointments
                    """
                )
                appointments = cursor.fetchone()[0]

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM orders
                    """
                )
                orders = cursor.fetchone()[0]

                cursor.execute(
                    """
                    SELECT COALESCE(SUM(amount), 0)
                    FROM invoices
                    WHERE payment_status = 'paid'
                    """
                )
                revenue = cursor.fetchone()[0]

                return {
                    "question": question.question,
                    "answer": (
                        "Here is your business summary: "
                        f"{customers} customer(s), "
                        f"{appointments} appointment(s), "
                        f"{orders} order(s), and "
                        f"₹{float(revenue):,.2f} in paid revenue."
                    )
                }

            # -----------------------------------
            # UNKNOWN QUESTION
            # -----------------------------------

            else:

                return {
                    "question": question.question,
                    "answer": (
                        "I can currently help you with "
                        "customers, orders, appointments, "
                        "services, revenue, unpaid payments, "
                        "and your business summary."
                    )
                }

    finally:
        connection.close()