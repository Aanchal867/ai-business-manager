from fastapi import APIRouter, HTTPException, Depends

from database import get_connection
from schemas.schemas import SettingsUpdate
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"]
)


# =========================
# GET SETTINGS
# =========================

@router.get("")
def get_settings(
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    business_name,
                    phone,
                    email,
                    address
                FROM business_settings
                ORDER BY id
                LIMIT 1
                """
            )

            settings = cursor.fetchone()

            # Agar settings table empty hai
            if not settings:
                return {
                    "id": None,
                    "business_name": "AI Business Manager",
                    "phone": None,
                    "email": None,
                    "address": None
                }

            return {
                "id": settings[0],
                "business_name": settings[1],
                "phone": settings[2],
                "email": settings[3],
                "address": settings[4]
            }

    finally:
        connection.close()


# =========================
# UPDATE SETTINGS
# =========================

@router.put("")
def update_settings(
    settings: SettingsUpdate,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # Check existing settings
            cursor.execute(
                """
                SELECT id
                FROM business_settings
                ORDER BY id
                LIMIT 1
                """
            )

            existing_settings = cursor.fetchone()

            # Agar settings pehle se nahi hain
            if not existing_settings:

                cursor.execute(
                    """
                    INSERT INTO business_settings
                    (
                        business_name,
                        phone,
                        email,
                        address
                    )
                    VALUES (%s, %s, %s, %s)
                    RETURNING
                        id,
                        business_name,
                        phone,
                        email,
                        address
                    """,
                    (
                        settings.business_name,
                        settings.phone,
                        settings.email,
                        settings.address
                    )
                )

            # Agar settings already exist karti hain
            else:

                settings_id = existing_settings[0]

                cursor.execute(
                    """
                    UPDATE business_settings
                    SET
                        business_name = %s,
                        phone = %s,
                        email = %s,
                        address = %s
                    WHERE id = %s
                    RETURNING
                        id,
                        business_name,
                        phone,
                        email,
                        address
                    """,
                    (
                        settings.business_name,
                        settings.phone,
                        settings.email,
                        settings.address,
                        settings_id
                    )
                )

            updated_settings = cursor.fetchone()

            if not updated_settings:
                raise HTTPException(
                    status_code=500,
                    detail="Unable to update settings"
                )

            connection.commit()

            return {
                "message": "Settings updated successfully",
                "settings": {
                    "id": updated_settings[0],
                    "business_name": updated_settings[1],
                    "phone": updated_settings[2],
                    "email": updated_settings[3],
                    "address": updated_settings[4]
                }
            }

    finally:
        connection.close()
        