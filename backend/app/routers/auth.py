from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.core.config import supabase

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class UserSignUpCredentials(BaseModel):
    name: str
    email: str
    password: str
    confirmPassword: str = Field(..., alias='confirmPassword')

class UserLoginCredentials(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup_user(credentials: UserSignUpCredentials):
    """Handles new user registration with name and password confirmation."""
    if credentials.password != credentials.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    try:
        res = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": { "data": { 'full_name': credentials.name } }
        })

        if res.user:
            # After signup, also insert the name into our public 'users' table
            supabase.table('users').update({'name': credentials.name}).eq('id', res.user.id).execute()
            return {"message": "Signup successful! Please check your email for confirmation."}
        elif res.user is None and res.session is None:
            raise HTTPException(status_code=400, detail="User with this email already exists.")
        else:
            raise HTTPException(status_code=500, detail="An unknown error occurred during signup.")
             
    except Exception as e:
        error_message = str(e.args[0]) if e.args else "An unexpected error occurred."
        raise HTTPException(status_code=400, detail=f"Signup failed: {error_message}")

@router.post("/login")
async def login_user(credentials: UserLoginCredentials):
    """Handles user login and returns a session object."""
    try:
        res = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        if res.session:
            return {"message": "Login successful!", "session": res.session.model_dump_json()}
        else:
            raise HTTPException(status_code=401, detail="Invalid login credentials.")
           
    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(status_code=400, detail=f"Login failed: {str(e)}")
