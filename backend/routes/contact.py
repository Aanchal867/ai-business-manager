from contextlib import closing
import logging
from typing import Literal

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Path as PathParam, Query
from pydantic import BaseModel, EmailStr, Field

from database import get_connection
from routes.auth import require_admin

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


class ContactMessageStatus(BaseModel):
    status: Literal["new", "read", "replied"]


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


@router.get("", dependencies=[Depends(require_admin)])
def list_contact_messages(
    search: str | None = Query(default=None, max_length=255),
    status: Literal["new", "read", "replied"] | None = None,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0)
):
    conditions = []
    parameters = []

    if search and search.strip():
        conditions.append(
            "(name ILIKE %s OR email ILIKE %s OR business ILIKE %s OR message ILIKE %s)"
        )
        search_term = f"%{search.strip()}%"
        parameters.extend([search_term] * 4)

    if status:
        conditions.append("status = %s")
        parameters.append(status)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    try:
        with closing(get_connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT
                            COUNT(*) AS total_count,
                            COUNT(*) FILTER (WHERE status = 'new') AS new_count,
                            COUNT(*) FILTER (WHERE status = 'read') AS read_count,
                            COUNT(*) FILTER (WHERE status = 'replied') AS replied_count
                        FROM contact_messages
                        """
                    )
                    totals = cursor.fetchone()

                    cursor.execute(
                        f"""
                        SELECT COUNT(*)
                        FROM contact_messages
                        {where_clause}
                        """,
                        parameters
                    )
                    filtered_total = cursor.fetchone()[0]

                    cursor.execute(
                        f"""
                        SELECT id, name, email, business, message, status, created_at
                        FROM contact_messages
                        {where_clause}
                        ORDER BY created_at DESC, id DESC
                        LIMIT %s OFFSET %s
                        """,
                        (*parameters, limit, offset)
                    )
                    rows = cursor.fetchall()

        return {
            "items": [
                {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "business": row[3],
                    "message": row[4],
                    "status": row[5],
                    "created_at": row[6]
                }
                for row in rows
            ],
            "total": filtered_total,
            "counts": {
                "total": totals[0],
                "new": totals[1],
                "read": totals[2],
                "replied": totals[3]
            }
        }
    except psycopg.Error as error:
        logger.exception("Failed to list contact messages")
        raise HTTPException(
            status_code=500,
            detail="Unable to load contact messages. Please try again later."
        ) from error


@router.get("/{message_id}", dependencies=[Depends(require_admin)])
def get_contact_message(message_id: int = PathParam(..., ge=1)):
    try:
        with closing(get_connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT id, name, email, business, message, status, created_at
                        FROM contact_messages
                        WHERE id = %s
                        """,
                        (message_id,)
                    )
                    row = cursor.fetchone()

        if row is None:
            raise HTTPException(status_code=404, detail="Contact message not found.")

        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "business": row[3],
            "message": row[4],
            "status": row[5],
            "created_at": row[6]
        }
    except psycopg.Error as error:
        logger.exception("Failed to retrieve contact message %s", message_id)
        raise HTTPException(
            status_code=500,
            detail="Unable to load contact message. Please try again later."
        ) from error


@router.patch("/{message_id}", dependencies=[Depends(require_admin)])
def update_contact_message_status(
    data: ContactMessageStatus,
    message_id: int = PathParam(..., ge=1)
):
    try:
        with closing(get_connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        UPDATE contact_messages
                        SET status = %s
                        WHERE id = %s
                        RETURNING id, name, email, business, message, status, created_at
                        """,
                        (data.status, message_id)
                    )
                    row = cursor.fetchone()

        if row is None:
            raise HTTPException(status_code=404, detail="Contact message not found.")

        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "business": row[3],
            "message": row[4],
            "status": row[5],
            "created_at": row[6]
        }
    except psycopg.Error as error:
        logger.exception("Failed to update contact message %s", message_id)
        raise HTTPException(
            status_code=500,
            detail="Unable to update contact message. Please try again later."
        ) from error


@router.delete("/{message_id}", dependencies=[Depends(require_admin)])
def delete_contact_message(message_id: int = PathParam(..., ge=1)):
    try:
        with closing(get_connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "DELETE FROM contact_messages WHERE id = %s RETURNING id",
                        (message_id,)
                    )
                    deleted = cursor.fetchone()

        if deleted is None:
            raise HTTPException(status_code=404, detail="Contact message not found.")

        return {"status": "success", "id": deleted[0]}
    except psycopg.Error as error:
        logger.exception("Failed to delete contact message %s", message_id)
        raise HTTPException(
            status_code=500,
            detail="Unable to delete contact message. Please try again later."
        ) from error