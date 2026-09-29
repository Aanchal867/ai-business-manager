from fastapi import APIRouter, HTTPException, Depends

from database import get_connection
from schemas.schemas import AppointmentCreate, AppointmentUpdate
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/appointments",
    tags=["Appointments"]
)


# --------------------------------------------------
# CREATE APPOINTMENT
# --------------------------------------------------

@router.post("")
def create_appointment(
    appointment: AppointmentCreate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # Check whether customer exists
            cursor.execute(
                """
                SELECT id
                FROM customers
                WHERE id = %s
                """,
                (appointment.customer_id,)
            )

            customer = cursor.fetchone()

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer ID does not exist"
                )

            cursor.execute(
                """
                INSERT INTO appointments (
                    customer_id,
                    appointment_date,
                    appointment_time,
                    service,
                    status
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING
                    id,
                    customer_id,
                    appointment_date,
                    appointment_time,
                    service,
                    status
                """,
                (
                    appointment.customer_id,
                    appointment.appointment_date,
                    appointment.appointment_time,
                    appointment.service,
                    appointment.status
                )
            )

            new_appointment = cursor.fetchone()

            connection.commit()

            return {
                "message": "Appointment created successfully",
                "appointment": {
                    "id": new_appointment[0],
                    "customer_id": new_appointment[1],
                    "appointment_date": new_appointment[2],
                    "appointment_time": new_appointment[3],
                    "service": new_appointment[4],
                    "status": new_appointment[5]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# GET ALL APPOINTMENTS
# --------------------------------------------------

@router.get("")
def get_appointments(
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    a.id,
                    a.customer_id,
                    c.name,
                    a.appointment_date,
                    a.appointment_time,
                    a.service,
                    a.status
                FROM appointments AS a
                JOIN customers AS c
                    ON a.customer_id = c.id
                ORDER BY
                    a.appointment_date,
                    a.appointment_time
                """
            )

            rows = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "customer_id": row[1],
                    "customer_name": row[2],
                    "appointment_date": row[3],
                    "appointment_time": row[4],
                    "service": row[5],
                    "status": row[6]
                }
                for row in rows
            ]

    finally:
        connection.close()


# --------------------------------------------------
# GET SINGLE APPOINTMENT
# --------------------------------------------------

@router.get("/{appointment_id}")
def get_appointment(
    appointment_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    a.id,
                    a.customer_id,
                    c.name,
                    a.appointment_date,
                    a.appointment_time,
                    a.service,
                    a.status
                FROM appointments AS a
                JOIN customers AS c
                    ON a.customer_id = c.id
                WHERE a.id = %s
                """,
                (appointment_id,)
            )

            appointment = cursor.fetchone()

            if not appointment:
                raise HTTPException(
                    status_code=404,
                    detail="Appointment not found"
                )

            return {
                "id": appointment[0],
                "customer_id": appointment[1],
                "customer_name": appointment[2],
                "appointment_date": appointment[3],
                "appointment_time": appointment[4],
                "service": appointment[5],
                "status": appointment[6]
            }

    finally:
        connection.close()


# --------------------------------------------------
# UPDATE APPOINTMENT
# --------------------------------------------------

@router.put("/{appointment_id}")
def update_appointment(
    appointment_id: int,
    appointment: AppointmentUpdate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # Check whether customer exists
            cursor.execute(
                """
                SELECT id
                FROM customers
                WHERE id = %s
                """,
                (appointment.customer_id,)
            )

            customer = cursor.fetchone()

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer ID does not exist"
                )

            cursor.execute(
                """
                UPDATE appointments
                SET
                    customer_id = %s,
                    appointment_date = %s,
                    appointment_time = %s,
                    service = %s,
                    status = %s
                WHERE id = %s
                RETURNING
                    id,
                    customer_id,
                    appointment_date,
                    appointment_time,
                    service,
                    status
                """,
                (
                    appointment.customer_id,
                    appointment.appointment_date,
                    appointment.appointment_time,
                    appointment.service,
                    appointment.status,
                    appointment_id
                )
            )

            updated_appointment = cursor.fetchone()

            if not updated_appointment:
                raise HTTPException(
                    status_code=404,
                    detail="Appointment not found"
                )

            connection.commit()

            return {
                "message": "Appointment updated successfully",
                "appointment": {
                    "id": updated_appointment[0],
                    "customer_id": updated_appointment[1],
                    "appointment_date": updated_appointment[2],
                    "appointment_time": updated_appointment[3],
                    "service": updated_appointment[4],
                    "status": updated_appointment[5]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# DELETE APPOINTMENT
# --------------------------------------------------

@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM appointments
                WHERE id = %s
                RETURNING id
                """,
                (appointment_id,)
            )

            deleted_appointment = cursor.fetchone()

            if not deleted_appointment:
                raise HTTPException(
                    status_code=404,
                    detail="Appointment not found"
                )

            connection.commit()

            return {
                "message": "Appointment deleted successfully"
            }

    finally:
        connection.close()