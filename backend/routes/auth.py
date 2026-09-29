from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os

import jwt
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import get_connection
from schemas.schemas import SignupRequest, LoginRequest


router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# --------------------------------------------------
# JWT SETTINGS
# --------------------------------------------------

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is missing from the environment."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# --------------------------------------------------
# PASSWORD HASHING
# --------------------------------------------------

def hash_password(password: str) -> str:
    """
    Creates a secure password hash using PBKDF2.
    """

    salt = os.urandom(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000
    )

    return (
        salt.hex()
        + ":"
        + password_hash.hex()
    )


def verify_password(password: str, stored_password: str) -> bool:
    """
    Checks whether the entered password matches
    the stored password hash.
    """

    try:
        salt_hex, hash_hex = stored_password.split(":")

        salt = bytes.fromhex(salt_hex)
        stored_hash = bytes.fromhex(hash_hex)

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            100000
        )

        return hmac.compare_digest(
            password_hash,
            stored_hash
        )

    except Exception:
        return False


# --------------------------------------------------
# JWT TOKEN
# --------------------------------------------------

def create_access_token(user_id: int, email: str):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# --------------------------------------------------
# GET CURRENT USER
# --------------------------------------------------

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if user_id is None or email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        return {
            "id": int(user_id),
            "email": email
        }

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


# --------------------------------------------------
# SIGNUP
# --------------------------------------------------

@router.post("/signup")
def signup(data: SignupRequest):

    connection = get_connection()

    try:

        cursor = connection.cursor()

        # Check whether email already exists

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE email = %s
            """,
            (data.email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Hash password

        password_hash = hash_password(
            data.password
        )

        # Create user

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING id, name, email
            """,
            (
                data.name,
                data.email,
                password_hash
            )
        )

        user = cursor.fetchone()

        connection.commit()

        return {
            "message": "User registered successfully",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }

    finally:

        connection.close()


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@router.post("/login")
def login(data: LoginRequest):

    connection = get_connection()

    try:

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, name, email, password
            FROM users
            WHERE email = %s
            """,
            (data.email,)
        )

        user = cursor.fetchone()

        if not user:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        user_id = user[0]
        name = user[1]
        email = user[2]
        stored_password = user[3]

        # Verify password

        if not verify_password(
            data.password,
            stored_password
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        # Create JWT

        access_token = create_access_token(
            user_id=user_id,
            email=email
        )

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "name": name,
                "email": email
            }
        }

    finally:

        connection.close()


# --------------------------------------------------
# PROTECTED TEST ROUTE
# --------------------------------------------------

@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user)
):

    return {
        "message": "Authentication successful",
        "user": current_user
    }