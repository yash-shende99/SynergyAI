import asyncio
import urllib.parse
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.core.config import supabase
from app.core.security import get_current_user_id, get_project_member_auth, get_project_admin_auth
from app.core.cache import enhanced_cache


router = APIRouter(tags=["Projects"])

class ProjectCreate(BaseModel):
    name: str
    company_cin: str
    team_emails: List[str]

class TeamInvite(BaseModel):
    email: str
    role: str # 'Editor' or 'Viewer'

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: Optional[str] = None

class ProjectUserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    project_role: str
    avatar_url: Optional[str] = None

@router.get("/api/projects", response_model=List[Dict]) 
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """Fetches all projects the current user is a member of."""
    try:
        result = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch projects.")

@router.post("/api/projects")
async def create_project(project_data: ProjectCreate, user_id: str = Depends(get_current_user_id)):
    """Creates a new project and registers the creator and invited team members."""
    try:
        result = supabase.rpc('create_project_and_add_members', {
            'p_name': project_data.name,
            'p_company_cin': project_data.company_cin,
            'p_creator_id': user_id,
            'p_team_emails': project_data.team_emails
        }).execute()
        
        if result.data:
            return {"message": f"Project '{project_data.name}' created successfully.", "project_id": result.data}
        else:
            raise Exception("Database function did not return a project ID.")
            
    except Exception as e:
        print(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=f"Could not create project: {e}")

@router.post("/api/projects/{project_id}/prefetch")
async def prefetch_project_data(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Manually trigger cache warming for a specific project. Call this when a user navigates to a project."""
    try:
        # Import dynamically here to avoid circular imports
        from app.main import warm_all_project_caches
        asyncio.create_task(warm_all_project_caches(project_id, user_id))
        return {"message": "Cache warming initiated", "project_id": project_id}
    except Exception as e:
        return {"message": "Cache warming failed", "error": str(e)}
    
@router.post("/api/projects/{project_id}/cache/clear")
async def clear_project_cache(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Clear all cache entries for a specific project"""
    try:
        pattern = f"project_id:{project_id}"
        await enhanced_cache.delete_pattern(pattern)
        return {"message": f"Cache cleared for project: {project_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache clear failed: {e}")

# Call this when project data changes
async def invalidate_project_cache(project_id: str):
    """Invalidate all cached data for a project when its data changes"""
    try:
        patterns = [
            f"project_id:{project_id}",
            f"mission_control:project_id:{project_id}",
            f"risk_profile:project_id:{project_id}",
            f"synergy_score:project_id:{project_id}",
            f"project_intelligence:project_id:{project_id}",
            f"vdr_documents:project_id:{project_id}",
            f"project_ai_chats:project_id:{project_id}"
        ]
        
        for pattern in patterns:
            await enhanced_cache.delete_pattern(pattern)
            
        print(f"✅ Invalidated all cache for project: {project_id}")
    except Exception as e:
        print(f"❌ Error invalidating project cache: {e}")

@router.get("/api/projects/{project_id}/team", response_model=List[Dict])
async def get_project_team(project_id: str, user_id: str = Depends(get_project_member_auth)):
    """Fetches all team members for a specific project."""
    try:
        result = supabase.rpc('get_project_team_members', {'p_project_id': project_id}).execute()
        return result.data if result.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch team members.")

@router.get("/api/projects/{project_id}/invitations")
async def get_project_invitations(project_id: str, user_id: str = Depends(get_project_member_auth)):
    """Fetches all pending invitations for a specific project."""
    try:
        result = supabase.table('project_invitations').select('*').eq('project_id', project_id).eq('status', 'Pending').order('created_at').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch invitations.")

@router.post("/api/projects/{project_id}/team/invite")
async def invite_team_member(project_id: str, invite_data: TeamInvite, admin_id: str = Depends(get_project_admin_auth)):
    """Invites a new member by email (adds an invitation record). Only callable by project admin."""
    try:
        result = supabase.table('project_invitations').insert({
            'project_id': project_id,
            'invited_by_user_id': admin_id,
            'invited_email': invite_data.email,
            'role': invite_data.role
        }).execute()
        return {"message": f"Invitation sent to {invite_data.email} successfully."}
    except Exception as e:
        if "duplicate key" in str(e):
            raise HTTPException(status_code=409, detail="An invitation for this email is already pending.")
        raise HTTPException(status_code=500, detail="Could not send invitation.")

@router.get("/api/projects/{project_id}/roles")
async def get_project_roles(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Returns permissions configuration for roles in the project."""
    try:
        roles_config = [
            {
                "name": "Admin",
                "description": "Full control over the project, including managing team members and project settings.",
                "permissions": [
                    {"feature": "VDR Documents", "access": "Full"},
                    {"feature": "Analytics & Risk", "access": "Full"},
                    {"feature": "Valuation Models", "access": "Full"},
                    {"feature": "Reports & Memos", "access": "Full"},
                    {"feature": "Team Management", "access": "Full"}
                ]
            },
            {
                "name": "Editor",
                "description": "Can create and edit content within the project, but cannot manage team members.",
                "permissions": [
                    {"feature": "VDR Documents", "access": "Edit"},
                    {"feature": "Analytics & Risk", "access": "View Only"},
                    {"feature": "Valuation Models", "access": "Edit"},
                    {"feature": "Reports & Memos", "access": "Edit"},
                    {"feature": "Team Management", "access": "None"}
                ]
            },
            {
                "name": "Viewer",
                "description": "Can only view existing content within the project. Cannot upload, edit, or delete.",
                "permissions": [
                    {"feature": "VDR Documents", "access": "View Only"},
                    {"feature": "Analytics & Risk", "access": "View Only"},
                    {"feature": "Valuation Models", "access": "View Only"},
                    {"feature": "Reports & Memos", "access": "View Only"},
                    {"feature": "Team Management", "access": "None"}
                ]
            }
        ]
        return roles_config
    except Exception as e:
        print(f"Error fetching roles: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch role permissions.")

@router.post("/api/invitations/{invitation_id}/resend")
async def resend_invitation(invitation_id: str, admin_id: str = Depends(get_project_admin_auth)):
    """Simulates resending a project invitation."""
    print(f"Resending invitation {invitation_id}")
    return {"message": "Invitation resent successfully."}

@router.delete("/api/invitations/{invitation_id}")
async def revoke_invitation(invitation_id: str, admin_id: str = Depends(get_project_admin_auth)):
    """Revokes a pending invitation."""
    try:
        result = supabase.table('project_invitations').update({'status': 'Revoked'}).eq('id', invitation_id).execute()
        return {"message": "Invitation revoked successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not revoke invitation.")

async def get_or_sync_user(user_id: str, token: Optional[str] = None) -> dict:
    """Helper to fetch user profile, syncing with Supabase Auth if not in DB or missing fields."""
    try:
        result = supabase.table('users').select('id, name, email, image').eq('id', user_id).execute()
        user_data = result.data[0] if result.data else None
        
        # If user not found, or name/email is missing/None
        if not user_data or not user_data.get('name') or not user_data.get('email'):
            try:
                auth_user = None
                if token:
                    user_res = supabase.auth.get_user(token)
                    auth_user = user_res.user
                else:
                    auth_user_res = supabase.auth.admin.get_user_by_id(user_id)
                    auth_user = auth_user_res.user
                    
                if auth_user:
                    email = auth_user.email
                    name = auth_user.user_metadata.get('full_name') or email.split('@')[0]
                    avatar_url = auth_user.user_metadata.get('avatar_url')
                    
                    profile_data = {
                        "id": user_id,
                        "email": email,
                        "name": name,
                        "image": avatar_url
                    }
                    
                    if not user_data:
                        # Insert new
                        supabase.table('users').insert(profile_data).execute()
                    else:
                        # Update existing
                        supabase.table('users').update({
                            "email": email if not user_data.get('email') else user_data.get('email'),
                            "name": name if not user_data.get('name') else user_data.get('name'),
                            "image": avatar_url if not user_data.get('image') else user_data.get('image')
                        }).eq('id', user_id).execute()
                        
                    # Re-fetch
                    result = supabase.table('users').select('id, name, email, image').eq('id', user_id).execute()
                    user_data = result.data[0] if result.data else None
            except Exception as auth_err:
                print(f"⚠️ Auth sync error for {user_id}: {auth_err}")
                
        if user_data:
            return {
                "id": user_data.get('id', user_id),
                "name": user_data.get('name') or "User",
                "email": user_data.get('email') or "user@email.com",
                "avatar_url": user_data.get('image')
            }
            
        return {"id": user_id, "name": "User", "email": "user@email.com", "avatar_url": None}
    except Exception as e:
        print(f"Error in get_or_sync_user: {e}")
        return {"id": user_id, "name": "User", "email": "user@email.com", "avatar_url": None}


@router.get("/api/user/profile", response_model=UserProfileResponse)
async def get_user_profile(request: Request, user_id: str = Depends(get_current_user_id)):
    """Get current user's profile data for global sidebar."""
    try:
        token = request.headers.get("Authorization", "").split(" ")[-1] if request.headers.get("Authorization") else None
        user_info = await get_or_sync_user(user_id, token)
        return UserProfileResponse(
            id=user_info["id"],
            name=user_info["name"],
            email=user_info["email"],
            avatar_url=user_info.get("avatar_url")
        )
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return UserProfileResponse(id=user_id, name="User", email="user@email.com", avatar_url=None)


@router.get("/api/projects/{project_id}/user-profile", response_model=ProjectUserProfileResponse)
async def get_project_user_profile(project_id: str, request: Request, user_id: str = Depends(get_current_user_id)):
    """Get current user's profile and their specific role in a project sidebar."""
    try:
        token = request.headers.get("Authorization", "").split(" ")[-1] if request.headers.get("Authorization") else None
        user_info = await get_or_sync_user(user_id, token)
        
        try:
            role_result = supabase.rpc('get_user_project_role', {
                'p_user_id': user_id,
                'p_project_id': project_id
            }).execute()
            
            project_role = "Member"
            if role_result.data and len(role_result.data) > 0:
                project_role = role_result.data[0].get('role', 'Member')
        except Exception as role_error:
            print(f"⚠️ Role fetch error, using default: {role_error}")
            project_role = "Member"
        
        return ProjectUserProfileResponse(
            id=user_info["id"],
            name=user_info["name"],
            email=user_info["email"],
            project_role=project_role,
            avatar_url=user_info.get("avatar_url")
        )
    except Exception as e:
        print(f"Error fetching project user profile: {e}")
        return ProjectUserProfileResponse(
            id=user_id, name="User", email="user@email.com", project_role="Member", avatar_url=None
        )


# --- ADDITIONAL PROJECT CORE ENDPOINTS ---

STATUS_OPTIONS = [
    "Sourcing",
    "Diligence",
    "Evaluation",
    "Negotiation",
    "Signing",
    "Closing",
    "Integration",
    "Archived"
]

class ProjectUpdate(BaseModel):
    name: str
    status: str

class DeleteConfirmation(BaseModel):
    projectName: str

@router.get("/api/projects/{project_id}")
async def get_project_details(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetches the detailed information for a single project."""
    try:
        # We call our existing RPC function to get projects the user has access to
        result = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        
        # Find the specific project from the user's list to ensure they have access
        project = next((p for p in result.data if p['id'] == project_id), None)
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or access denied.")
            
        return project
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching project details: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch project details.")

@router.put("/api/projects/{project_id}")
async def update_project_details(project_id: str, project_data: ProjectUpdate, user_id: str = Depends(get_current_user_id)):
    """Updates the core details of a project using RPC function."""
    try:
        print(f"🔧 Updating project {project_id} with data: {project_data}")
        
        # Validate status
        if project_data.status not in STATUS_OPTIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(STATUS_OPTIONS)}"
            )

        # Use RPC function to update
        result = supabase.rpc('update_project_details', {
            'p_project_id': project_id,
            'p_name': project_data.name,
            'p_status': project_data.status,
            'p_user_id': user_id
        }).execute()

        print(f"🔧 RPC update result: {result}")

        if not result.data or not result.data[0].get('success'):
            error_msg = result.data[0].get('error', 'Update failed') if result.data else 'Update failed'
            raise HTTPException(status_code=500, detail=error_msg)

        return {
            "message": "Project details updated successfully.",
            "updated_id": project_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating project: {e}")
        raise HTTPException(status_code=500, detail=f"Could not update project details: {str(e)}")

@router.put("/api/projects/{project_id}/archive")
async def archive_project(project_id: str, admin_id: str = Depends(get_project_admin_auth)):
    """
    Archives a project by setting its status to 'Archived'. Admin only.
    This is a 'soft delete' and can be reversed.
    """
    try:
        supabase.table('projects').update({'status': 'Archived'}).eq('id', project_id).execute()
        return {"message": "Project has been successfully archived."}
    except Exception as e:
        print(f"Error archiving project: {e}")
        raise HTTPException(status_code=500, detail="Could not archive project.")

@router.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, confirmation: DeleteConfirmation, admin_id: str = Depends(get_project_admin_auth)):
    """
    Permanently deletes a project and all its associated data. Admin only.
    Requires the project name for confirmation to prevent accidental deletion.
    """
    try:
        # Step 1: Verify the project name as a security measure
        project_res = supabase.table('projects').select('name').eq('id', project_id).single().execute()
        if not project_res.data or project_res.data['name'] != confirmation.projectName:
            raise HTTPException(status_code=400, detail="Project name confirmation failed. Please check your spelling.")

        # Step 2: Perform the hard delete. The 'ON DELETE CASCADE' in our database
        # will automatically clean up all related data (members, tasks, docs, etc.).
        supabase.table('projects').delete().eq('id', project_id).execute()
        return {"message": "Project has been successfully deleted."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting project: {e}")
        raise HTTPException(status_code=500, detail="Could not delete project.")


class NotificationSettingsUpdate(BaseModel):
    email_frequency: str
    in_app_new_document: bool
    in_app_mention: bool
    in_app_task_assigned: bool
    ai_critical_risk: bool
    ai_negative_news: bool
    ai_valuation_change: bool


@router.get("/api/notifications")
async def get_notifications(user_id: str = Depends(get_current_user_id)):
    """Fetches all notifications for the currently authenticated user."""
    try:
        # A professional query to fetch notifications, ordered by creation date
        result = supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(50).execute()
        
        # Adapt the data to the frontend's 'Notification' type
        notifications = [{
            "id": n['id'],
            "type": n['type'],
            "title": n['title'],
            "timestamp": n['created_at'],
            "isRead": n['is_read'],
            "priority": n.get('priority')
        } for n in result.data]
        return notifications
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch notifications.")


@router.put("/api/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, user_id: str = Depends(get_current_user_id)):
    """Marks a specific notification as read."""
    try:
        # We also verify the user_id to ensure a user can only mark their own notifications
        supabase.table('notifications').update({'is_read': True}).eq('id', notification_id).eq('user_id', user_id).execute()
        return {"message": "Notification marked as read."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not update notification.")


@router.get("/api/projects/{project_id}/notifications/settings", response_model=Dict)
async def get_notification_settings(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Fetches the current user's complete notification settings for a specific project,
    including AI triggers. Returns sensible defaults if no settings exist.
    """
    # Define the complete default state
    default_settings = {
        "email_frequency": "Instantly", 
        "in_app_new_document": True,
        "in_app_mention": True, 
        "in_app_task_assigned": True,
        "ai_critical_risk": False, 
        "ai_negative_news": True, 
        "ai_valuation_change": False
    }
    
    try:
        result = supabase.table('project_notification_settings').select('*').eq('project_id', project_id).eq('user_id', user_id).execute()
        
        if result.data and len(result.data) > 0:
            # Merge fetched data with defaults to ensure all keys are present
            return {**default_settings, **result.data[0]}
        else:
            return default_settings
            
    except Exception as e:
        print(f"Error fetching notification settings: {e}")
        return default_settings  # Always return defaults on any error


@router.put("/api/projects/{project_id}/notifications/settings")
async def update_notification_settings(
    project_id: str,
    settings: NotificationSettingsUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Updates the current user's complete notification settings for a specific project,
    including AI triggers. Upserts the record in `project_notification_settings`.
    """
    try:
        # Check if project exists and user has access
        member_check = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).execute()
        if not member_check.data:
            raise HTTPException(status_code=403, detail="No access to project")

        # Prepare settings dict
        settings_data = settings.model_dump()
        settings_data.update({
            "project_id": project_id,
            "user_id": user_id
        })

        # Perform check-then-insert/update
        check_exist = supabase.table('project_notification_settings').select('id').eq('project_id', project_id).eq('user_id', user_id).execute()
        if check_exist.data and len(check_exist.data) > 0:
            record_id = check_exist.data[0]['id']
            supabase.table('project_notification_settings').update(settings_data).eq('id', record_id).execute()
        else:
            supabase.table('project_notification_settings').insert(settings_data).execute()

        return {"message": "Notification settings updated successfully."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating notification settings: {e}")
        raise HTTPException(status_code=500, detail="Could not update notification settings.")


@router.get("/api/projects/{project_id}/notifications")
async def get_project_notifications(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Fetches the reverse-chronological notification/activity log for a single project,
    scoped to the current user.
    """
    try:
        # We fetch from the 'notifications' table, but scoped to this project AND the current user
        result = supabase.table('notifications').select('*') \
            .eq('project_id', project_id) \
            .eq('user_id', user_id) \
            .order('created_at', desc=True).limit(50).execute()
        
        # Adapt the data to the frontend's 'Notification' type
        activity_log = [{
            "id": n['id'],
            "type": n['type'],
            "title": n['title'],
            "timestamp": n['created_at'],
            "isRead": n['is_read'],
            "priority": n.get('priority')
        } for n in result.data]
        
        return activity_log
    except Exception as e:
        print(f"Error fetching project notifications: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch project activity log.")


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    job_title: Optional[str] = None
    contact_number: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class DraftCreate(BaseModel):
    template_id: str
    template_name: str


class DraftUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[dict] = None
    status: Optional[str] = None


def get_template_sections(template_id: str) -> List[str]:
    """Helper function to get sections for a template"""
    templates = {
        'tpl-1': ['Valuation Summary', 'Comparable Analysis', 'DCF Model', 'Conclusion'],
        'tpl-2': ['Financial Risk', 'Legal Risk', 'Operational Risk', 'AI Insights'],
        'tpl-3': ['Executive Summary', 'Key Metrics', 'Recommendation'],
        'tpl-4': ['Introduction', 'Market Analysis', 'Due Diligence Findings', 'Synergy Analysis', 'Valuation', 'Recommendation'],
    }
    return templates.get(template_id, [])


@router.get("/api/users/me", response_model=Dict)
async def get_current_user_profile(request: Request, user_id: str = Depends(get_current_user_id)):
    """Fetches the complete profile for the currently authenticated user."""
    try:
        select_query = 'id, name, email, job_title, contact_number, avatar_url:image'
        result = supabase.table('users').select(select_query).eq('id', user_id).single().execute()
        
        if not result.data:
            token = request.headers.get("Authorization", "").split(" ")[-1] if request.headers.get("Authorization") else None
            auth_user = None
            if token:
                user_res = supabase.auth.get_user(token)
                auth_user = user_res.user
            else:
                auth_user_res = supabase.auth.admin.get_user_by_id(user_id)
                auth_user = auth_user_res.user
                
            new_profile_data = {
                "id": auth_user.id,
                "email": auth_user.email,
                "name": auth_user.user_metadata.get('full_name'),
                "image": auth_user.user_metadata.get('avatar_url')
            }
            supabase.table('users').insert(new_profile_data).execute()
            result = supabase.table('users').select(select_query).eq('id', user_id).single().execute()

        return result.data
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch user profile.")


@router.put("/api/users/me")
async def update_current_user_profile(profile_data: UserProfileUpdate, user_id: str = Depends(get_current_user_id)):
    """Updates the profile for the currently authenticated user."""
    try:
        update_data = profile_data.model_dump(exclude_unset=True)
        if not update_data:
            return {"message": "No fields to update."}
        supabase.table('users').update(update_data).eq('id', user_id).execute()
        return {"message": "Profile updated successfully."}
    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail="Could not update user profile.")


@router.post("/api/users/me/change-password")
async def change_user_password(password_data: PasswordChangeRequest, user_id: str = Depends(get_current_user_id)):
    """Securely handles a password change request for the authenticated user."""
    try:
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(status_code=400, detail="New passwords do not match.")
        if len(password_data.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

        user_res = supabase.table('users').select('email').eq('id', user_id).single().execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found.")
        
        email = user_res.data['email']
        supabase.auth.sign_in_with_password({"email": email, "password": password_data.current_password})

        supabase.auth.update_user({
            "password": password_data.new_password
        })

        return {"message": "Password updated successfully."}
    except Exception as e:
        if "Invalid login credentials" in str(e):
            raise HTTPException(status_code=401, detail="The current password you entered is incorrect.")
        print(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail=f"Could not change password: {str(e)}")


@router.get("/api/reports/templates")
async def get_report_templates(user_id: str = Depends(get_current_user_id)):
    """Returns a list of available, high-quality report templates."""
    try:
        templates = [
            { 
                "id": 'tpl-1', 
                "name": 'Standard Valuation Report', 
                "category": 'Financial', 
                "description": 'A comprehensive template for DCF and Comps.', 
                "createdBy": 'System', 
                "sections": ['Valuation Summary', 'Comparable Analysis', 'DCF Model', 'Conclusion'] 
            },
            { 
                "id": 'tpl-2', 
                "name": 'Full Risk Profile', 
                "category": 'Risk', 
                "description": 'Detailed breakdown of all identified risk categories.', 
                "createdBy": 'System', 
                "sections": ['Financial Risk', 'Legal Risk', 'Operational Risk', 'AI Insights'] 
            },
            { 
                "id": 'tpl-3', 
                "name": 'One-Page Deal Summary', 
                "category": 'Strategic', 
                "description": 'A concise, high-level overview for executive review.', 
                "createdBy": 'Team', 
                "sections": ['Executive Summary', 'Key Metrics', 'Recommendation'] 
            },
            { 
                "id": 'tpl-4', 
                "name": 'Final Investment Memo', 
                "category": 'Investment Memo', 
                "description": 'The complete, final memo for investment committee approval.', 
                "createdBy": 'System', 
                "sections": ['Introduction', 'Market Analysis', 'Due Diligence Findings', 'Synergy Analysis', 'Valuation', 'Recommendation'] 
            },
        ]
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch report templates.")


@router.post("/api/projects/{project_id}/drafts")
async def create_report_draft(project_id: str, draft_data: DraftCreate, user_id: str = Depends(get_current_user_id)):
    """Creates a new report draft for a project based on a selected template."""
    try:
        initial_content = {
            "template_id": draft_data.template_id,
            "sections": get_template_sections(draft_data.template_id),
            "content": {
                "executiveSummary": f"New draft based on {draft_data.template_name}",
                "lastUpdated": datetime.utcnow().isoformat()
            }
        }

        result = supabase.table('report_drafts').insert({
            'project_id': project_id,
            'created_by_user_id': user_id,
            'title': draft_data.template_name,
            'content': initial_content,
            'status': 'Draft'
        }).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create draft")
            
        return result.data[0]
    except Exception as e:
        print(f"Error creating report draft: {e}")
        raise HTTPException(status_code=500, detail="Could not create report draft.")


@router.put("/api/drafts/{draft_id}")
async def update_draft(draft_id: str, draft_update: DraftUpdate, user_id: str = Depends(get_current_user_id)):
    """Update draft content, title, or status"""
    try:
        update_data = {}
        if draft_update.title is not None:
            update_data['title'] = draft_update.title
        if draft_update.content is not None:
            update_data['content'] = draft_update.content
        if draft_update.status is not None:
            update_data['status'] = draft_update.status
            
        result = supabase.table('report_drafts').update(update_data).eq('id', draft_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Draft not found")
            
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not update draft")


@router.get("/api/projects/{project_id}/drafts")
async def get_project_drafts(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get all drafts for a project"""
    try:
        result = supabase.table('report_drafts')\
            .select('*, users:created_by_user_id(name, avatar_url)')\
            .eq('project_id', project_id)\
            .order('last_modified', desc=True)\
            .execute()
            
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch drafts")


