from contextlib import closing
import logging

import psycopg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from database import get_connection

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/contact",
    tags=["Contact"]
)


class ContactMessage(BaseModel):
    name: str = Field(max_length=100)
    email: EmailStr
    business: str | None = Field(default=None, max_length=150)
    message: str


@router.post("")
def create_contact_message(data: ContactMessage):

    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Name is required.")

    if not data.message.strip():
        raise HTTPException(status_code=400, detail="Message is required.")

    try:
        with closing(get_connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO contact_messages
                            (name, email, business, message)
                        VALUES
                            (%s, %s, %s, %s)
                        RETURNING id, created_at
                        """,
                        (
                            data.name.strip(),
                            str(data.email),
                            data.business.strip() if data.business else None,
                            data.message.strip()
                        )
                    )

                    result = cursor.fetchone()

        return {
            "status": "success",
            "message": "Your message has been received successfully.",
            "id": result[0],
            "created_at": result[1]
        }

    except psycopg.Error as error:
        logger.exception("Failed to save contact message")
        raise HTTPException(
            status_code=500,
            detail="Unable to save contact message. Please try again later."
        ) from error