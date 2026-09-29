from fastapi import APIRouter, HTTPException, Depends

from database import get_connection
from schemas.schemas import ServiceCreate, ServiceUpdate
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/services",
    tags=["Services"]
)


# --------------------------------------------------
# CREATE SERVICE
# --------------------------------------------------

@router.post("")
def create_service(
    service: ServiceCreate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO services (
                    name,
                    description,
                    price,
                    status
                )
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, description, price, status
                """,
                (
                    service.name,
                    service.description,
                    service.price,
                    service.status
                )
            )

            new_service = cursor.fetchone()
            connection.commit()

            return {
                "message": "Service created successfully",
                "service": {
                    "id": new_service[0],
                    "name": new_service[1],
                    "description": new_service[2],
                    "price": float(new_service[3]),
                    "status": new_service[4]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# GET ALL SERVICES
# --------------------------------------------------

@router.get("")
def get_services(
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, description, price, status
                FROM services
                ORDER BY id
                """
            )

            rows = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "description": row[2],
                    "price": float(row[3]),
                    "status": row[4]
                }
                for row in rows
            ]

    finally:
        connection.close()


# --------------------------------------------------
# GET SINGLE SERVICE
# --------------------------------------------------

@router.get("/{service_id}")
def get_service(
    service_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, description, price, status
                FROM services
                WHERE id = %s
                """,
                (service_id,)
            )

            service = cursor.fetchone()

            if not service:
                raise HTTPException(
                    status_code=404,
                    detail="Service not found"
                )

            return {
                "id": service[0],
                "name": service[1],
                "description": service[2],
                "price": float(service[3]),
                "status": service[4]
            }

    finally:
        connection.close()


# --------------------------------------------------
# UPDATE SERVICE
# --------------------------------------------------

@router.put("/{service_id}")
def update_service(
    service_id: int,
    service: ServiceUpdate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE services
                SET
                    name = %s,
                    description = %s,
                    price = %s,
                    status = %s
                WHERE id = %s
                RETURNING id, name, description, price, status
                """,
                (
                    service.name,
                    service.description,
                    service.price,
                    service.status,
                    service_id
                )
            )

            updated_service = cursor.fetchone()

            if not updated_service:
                raise HTTPException(
                    status_code=404,
                    detail="Service not found"
                )

            connection.commit()

            return {
                "message": "Service updated successfully",
                "service": {
                    "id": updated_service[0],
                    "name": updated_service[1],
                    "description": updated_service[2],
                    "price": float(updated_service[3]),
                    "status": updated_service[4]
                }
            }

    finally:
        connection.close()


# --------------------------------------------------
# DELETE SERVICE
# --------------------------------------------------

@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM services
                WHERE id = %s
                RETURNING id
                """,
                (service_id,)
            )

            deleted_service = cursor.fetchone()

            if not deleted_service:
                raise HTTPException(
                    status_code=404,
                    detail="Service not found"
                )

            connection.commit()

            return {
                "message": "Service deleted successfully"
            }

    finally:
        connection.close()