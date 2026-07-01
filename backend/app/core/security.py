from fastapi import Request, Depends, HTTPException
from app.core.config import supabase

async def get_current_user_id(request: Request) -> str:
    """Dependency to retrieve the current user's authenticated ID from Supabase JWT."""
    token = request.query_params.get("token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Not authenticated")
        token = auth_header.split(" ")[-1]
    
    try:
        user_res = supabase.auth.get_user(token)
        if user_res.user:
            return user_res.user.id
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_project_member_auth(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Verifies that the current user is a member of the project (Admin, Editor, or Viewer)."""
    try:
        res = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=403, detail="Forbidden: User is not a member of this project.")
        return user_id
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: Could not verify project membership.")

async def get_project_admin_auth(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Verifies that the current user is an ADMIN of the project."""
    try:
        res = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).single().execute()
        if not res.data or res.data['role'] != 'Admin':
            raise HTTPException(status_code=403, detail="Forbidden: User is not an admin of this project.")
        return user_id
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: Could not verify project permissions.")
