import os
import uuid
import shutil
import json
import httpx
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.core.config import supabase, OLLAMA_SERVER_URL, CUSTOM_MODEL_NAME
from app.core.security import get_current_user_id
from app.core.cache_decorator import cached
from rag_pipeline import rag_system


router = APIRouter(tags=["Virtual Data Room (VDR)"])

class DocumentCreate(BaseModel):
    project_id: str
    file_name: str
    category: Optional[str] = "General"

class VdrSearchQuery(BaseModel):
    query: str
    mode: str  # 'semantic' or 'fulltext'

class VDRQuery(BaseModel):
    question: str
    existing_messages: List[Dict]

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/api/vdr/documents")
async def upload_document_metadata(doc: DocumentCreate, user_id: str = Depends(get_current_user_id)):
    """Creates a document record and simulates processing."""
    try:
        insert_data = {
            'project_id': doc.project_id,
            'file_name': doc.file_name,
            'uploaded_by_user_id': user_id,
            'file_path': f"uploads/{doc.project_id}/{doc.file_name}",
            'category': doc.category,
            'analysis_status': 'Pending',
            'uploaded_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('vdr_documents').insert(insert_data).execute()
        new_document = result.data[0]
        
        # Simulate processing time
        import asyncio
        await asyncio.sleep(2)
        
        update_data = {
            'analysis_status': 'Success',
        }
        supabase.table('vdr_documents').update(update_data).eq('id', new_document['id']).execute()
        
        return new_document
        
    except Exception as e:
        print(f"Error creating document metadata: {e}")
        raise HTTPException(status_code=500, detail="Could not create document record.")

@router.get("/api/projects/{project_id}/vdr/categories-list")
async def get_categories_list(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get list of available categories"""
    try:
        result = supabase.table('vdr_documents').select('category').eq('project_id', project_id).not_.is_('category', None).not_.eq('category', '').execute()
        
        categories = set()
        for item in result.data:
            if item['category']:
                categories.add(item['category'])
        
        if not categories:
            categories = {"Financials", "Legal & Compliance", "Human Resources", "Intellectual Property", "General"}
        else:
            categories.add("General")
        
        return sorted(list(categories))
        
    except Exception as e:
        print(f"Error fetching categories list: {e}")
        return ["Financials", "Legal & Compliance", "Human Resources", "Intellectual Property", "General"]

@router.get("/api/projects/{project_id}/vdr/documents")
async def get_vdr_documents(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetches the most recent VDR documents for a given project."""
    try:
        result = supabase.table('vdr_documents').select('*').eq('project_id', project_id).order('uploaded_at', desc=True).limit(10).execute()
        return result.data
    except Exception as e:
        print(f"Error fetching VDR documents: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch VDR documents.")

@router.post("/api/vdr/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    project_id: str = Form(...),
    file: UploadFile = File(...),
    category: str = Form("General"),
    user_id: str = Depends(get_current_user_id)
):
    """Upload a document file and store it with metadata"""
    try:
        # Create project directory if it doesn't exist
        project_dir = UPLOAD_DIR / project_id
        project_dir.mkdir(exist_ok=True)
        
        # Generate a safe filename
        original_filename = file.filename
        file_extension = Path(original_filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = project_dir / unique_filename
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create database record
        insert_data = {
            'project_id': project_id,
            'file_name': original_filename,
            'uploaded_by_user_id': user_id,
            'file_path': str(file_path),
            'category': category,
            'analysis_status': 'Success',
            'file_size': os.path.getsize(file_path),
            'mime_type': file.content_type
        }
        
        result = supabase.table('vdr_documents').insert(insert_data).execute()
        
        # Trigger ingestion asynchronously
        background_tasks.add_task(rag_system.ingest_document, str(file_path), original_filename)
        
        return result.data[0]
        
    except Exception as e:
        print(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail="Could not upload document")

@router.get("/api/vdr/documents/{document_id}/download")
async def download_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Securely fetches a document and returns it for download/viewing."""
    try:
        # Get document info from database
        result = supabase.table('vdr_documents').select('*').eq('id', document_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = result.data[0]
        file_path = Path(document.get('file_path'))
        
        # Check if file exists
        if not file_path.exists():
            # Fallback: create a mock file for existing records
            if not UPLOAD_DIR.exists():
                UPLOAD_DIR.mkdir(exist_ok=True)
            
            project_dir = UPLOAD_DIR / document.get('project_id', 'default')
            project_dir.mkdir(exist_ok=True)
            mock_file_path = project_dir / f"mock_{document.get('file_name', 'document.txt')}"
            
            mock_content = (
                f"Document: {document.get('file_name', 'Unknown')}\n"
                f"Project: {document.get('project_id', 'N/A')}\n"
                f"Category: {document.get('category', 'N/A')}\n"
                f"Uploaded by: {document.get('uploaded_by_user_id', 'N/A')}\n"
                f"Uploaded at: {document.get('uploaded_at', 'N/A')}\n\n"
                "This is a mock file since the original wasn't stored.\n"
            )
            with open(mock_file_path, 'w') as f:
                f.write(mock_content)
            
            file_path = mock_file_path
        
        return FileResponse(
            path=file_path,
            filename=document.get('file_name'),
            media_type=document.get('mime_type', 'application/octet-stream')
        )
        
    except Exception as e:
        print(f"Error downloading document: {e}")
        raise HTTPException(status_code=500, detail=f"Could not download document: {str(e)}")

@router.get("/api/projects/{project_id}/vdr/categories")
async def get_categories(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get all categories for a project including counts."""
    try:
        result = supabase.rpc('get_categories_with_counts', {'project_id_param': project_id}).execute()
        if not result.data:
            return [
                {'name': 'Financials', 'document_count': 0},
                {'name': 'Legal & Compliance', 'document_count': 0},
                {'name': 'Human Resources', 'document_count': 0},
                {'name': 'Intellectual Property', 'document_count': 0},
                {'name': 'Uncategorized', 'document_count': 0}
            ]
        return result.data
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return [
            {'name': 'Financials', 'document_count': 0},
            {'name': 'Legal & Compliance', 'document_count': 0},
            {'name': 'Human Resources', 'document_count': 0},
            {'name': 'Intellectual Property', 'document_count': 0},
            {'name': 'Uncategorized', 'document_count': 0}
        ]

@router.get("/api/projects/{project_id}/vdr/documents/category/{category}")
async def get_documents_by_category(project_id: str, category: str, user_id: str = Depends(get_current_user_id)):
    """Get VDR documents by category (including uncategorized)."""
    try:
        if category.lower() in ['uncategorized', 'null', 'none', '']:
            result = supabase.table('vdr_documents').select('*').eq('project_id', project_id).or_(f'category.is.null,category.eq.""').order('uploaded_at', desc=True).execute()
        else:
            result = supabase.table('vdr_documents').select('*').eq('project_id', project_id).eq('category', category).order('uploaded_at', desc=True).execute()
        return result.data
    except Exception as e:
        print(f"Error fetching documents by category: {e}")
        return []

@router.delete("/api/vdr/documents/{document_id}")
async def delete_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a VDR document metadata and file."""
    try:
        result = supabase.table('vdr_documents').select('*').eq('id', document_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = result.data[0]
        if document['uploaded_by_user_id'] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this document")
        
        supabase.table('vdr_documents').delete().eq('id', document_id).execute()
        
        if os.path.exists(document['file_path']):
            os.remove(document['file_path'])
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail="Could not delete document")

@router.get("/api/vdr/documents/{document_id}/preview")
async def preview_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Get document content text for preview."""
    try:
        result = supabase.table('vdr_documents').select('*').eq('id', document_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = result.data[0]
        file_path = Path(document.get('file_path'))
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        file_extension = file_path.suffix.lower()
        if file_extension == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content
        elif file_extension == '.pdf':
            return f"PDF document: {document.get('file_name')}\n\nPDF preview would be implemented here with a proper PDF viewer library."
        else:
            return f"File: {document.get('file_name')}\nType: {file_extension}\n\nContent preview not available for this file type."
        
    except Exception as e:
        print(f"Error previewing document: {e}")
        raise HTTPException(status_code=500, detail=f"Could not preview document: {str(e)}")

@router.post("/api/projects/{project_id}/vdr/search")
async def vdr_search(project_id: str, search_query: VdrSearchQuery, user_id: str = Depends(get_current_user_id)):
    """Performs a search scoped ONLY to the documents within a specific project's VDR."""
    try:
        docs_res = supabase.table('vdr_documents').select('file_name').eq('project_id', project_id).execute()
        allowed_filenames = [doc['file_name'] for doc in docs_res.data]
        
        if not allowed_filenames:
            return []

        if search_query.mode == 'semantic':
            context_chunks = rag_system.search(search_query.query, k=10, allowed_sources=allowed_filenames)
            results = []
            for chunk in context_chunks:
                highlighted_excerpt = chunk['content'].replace(search_query.query, f"<mark>{search_query.query}</mark>")
                results.append({ "docName": chunk['source'], "excerpt": f"...{highlighted_excerpt}..." })
            return results
        else:
            fulltext_res = supabase.table('vdr_documents').select('id, file_name').eq('project_id', project_id).ilike('file_name', f"%{search_query.query}%").limit(10).execute()
            return [{ "docName": doc['file_name'], "excerpt": "Keyword match found in document title." } for doc in fulltext_res.data]

    except Exception as e:
        print(f"Error during VDR search: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during VDR search.")

@router.get("/api/projects/{project_id}/vdr/chat")
async def get_vdr_chat_history(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get VDR QA history for this project."""
    try:
        result = supabase.table('vdr_qa_sessions').select('id, messages').eq('project_id', project_id).limit(1).single().execute()
        if not result.data:
            return {"id": None, "messages": []}
        result.data['messages'] = json.loads(result.data.get('messages', '[]'))
        return result.data
    except Exception as e:
        if "PGRST116" not in str(e):
            print(f"Error fetching VDR chat: {e}")
        return {"id": None, "messages": []}

@router.post("/api/projects/{project_id}/vdr/qa")
async def vdr_qa_and_save(project_id: str, query: VDRQuery, user_id: str = Depends(get_current_user_id)):
    """Perform Q&A scoped to this project's VDR, saving the interaction."""
    try:
        docs_res = supabase.table('vdr_documents').select('id, file_name').eq('project_id', project_id).execute()
        filename_to_id_map = {doc['file_name']: doc['id'] for doc in docs_res.data}
        allowed_filenames = list(filename_to_id_map.keys())
        context_chunks = rag_system.search(query.question, k=5, allowed_sources=allowed_filenames)
        
        context_text = "No relevant context found."
        sources = []
        if context_chunks:
            context_text = "\n\n---\n\n".join([f"From '{c['source']}':\n{c['content']}" for c in context_chunks])
            sources = [{"docId": filename_to_id_map.get(c['source']), "docName": c['source'], "excerpt": c['content']} for c in context_chunks]

        prompt = f"""Instruction: You are an AI paralegal assistant examining a Virtual Data Room for the target company. Use the provided VDR excerpts to answer the human's question professionally, with citations where possible. If you don't know the answer, say you don't know.

Context:
{context_text}

Question: {query.question}

Answer:"""
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
        
        final_answer = response.json().get('response', 'Error generating response.').strip()
        assistant_message = {"role": "assistant", "content": final_answer, "sources": sources}
        updated_messages = query.existing_messages + [{"role": "user", "content": query.question}, assistant_message]
        
        supabase.table('vdr_qa_sessions').upsert({
            'project_id': project_id,
            'user_id': user_id,
            'messages': json.dumps(updated_messages)
        }, on_conflict='project_id').execute()
        
        return assistant_message
    except Exception as e:
        print(f"VDR QA failed: {e}")
        raise HTTPException(status_code=500, detail="VDR Q&A process failed.")


class AnnotationCreate(BaseModel):
    document_id: str
    highlighted_text: str
    comment_text: str
    page_number: Optional[int] = None
    x_position: Optional[float] = None
    y_position: Optional[float] = None


class AnnotationReply(BaseModel):
    comment_text: str


class AnnotationUpdate(BaseModel):
    resolved: Optional[bool] = None


async def get_user_info_safe(user_id: str) -> dict:
    """Safely get user information with fallback values."""
    try:
        user_res = supabase.table('users')\
            .select('name, image, email')\
            .eq('id', user_id)\
            .execute()
        
        if user_res.data and len(user_res.data) > 0:
            user_data = user_res.data[0]
            return {
                'name': user_data.get('name') or user_data.get('email', 'Unknown User').split('@')[0],
                'image': user_data.get('image')
            }
        else:
            try:
                auth_user_res = supabase.auth.admin.get_user_by_id(user_id)
                if auth_user_res.user:
                    return {
                        'name': auth_user_res.user.email.split('@')[0],
                        'image': None
                    }
            except:
                pass
            return {'name': 'Unknown User', 'image': None}
    except Exception as e:
        print(f"Error fetching user info for {user_id}: {e}")
        return {'name': 'Unknown User', 'image': None}


async def get_pdf_page_count(file_path: Path) -> int:
    """Get the number of pages in a PDF file."""
    try:
        import PyPDF2
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            return len(pdf_reader.pages)
    except:
        return 1  # Default to 1 page if can't determine


@router.get("/api/projects/{project_id}/vdr/annotated_documents", response_model=List[Dict])
async def get_annotated_documents(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetches ALL documents for the project with annotation counts."""
    try:
        docs_result = supabase.table('vdr_documents')\
            .select('id, file_name, uploaded_at, category')\
            .eq('project_id', project_id)\
            .order('uploaded_at', desc=True)\
            .execute()
        
        if not docs_result.data:
            return []
        
        documents_with_counts = []
        for doc in docs_result.data:
            annotations_result = supabase.table('document_annotations')\
                .select('*', count='exact')\
                .eq('document_id', doc['id'])\
                .execute()
            
            total_annotations = annotations_result.count or 0
            
            unresolved_result = supabase.table('document_annotations')\
                .select('*', count='exact')\
                .eq('document_id', doc['id'])\
                .eq('resolved', False)\
                .execute()
            
            unresolved_count = unresolved_result.count or 0
            
            documents_with_counts.append({
                "id": doc["id"],
                "name": doc["file_name"],
                "comment_count": total_annotations,
                "unresolved_count": unresolved_count,
                "uploaded_at": doc.get("uploaded_at"),
                "category": doc.get("category", "Uncategorized")
            })
        
        return documents_with_counts
    except Exception as e:
        print(f"Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch documents.")


@router.get("/api/documents/{document_id}/annotations", response_model=List[Dict])
async def get_document_annotations(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetches all annotation threads for a specific document."""
    try:
        result = supabase.table('document_annotations')\
            .select('*')\
            .eq('document_id', document_id)\
            .order('created_at', desc=True)\
            .execute()
        
        if not result.data:
            return []
        
        annotations = []
        for anno in result.data:
            user_info = await get_user_info_safe(anno['created_by_user_id'])
            
            try:
                comment_thread = json.loads(anno.get('comment_thread', '[]'))
            except (json.JSONDecodeError, TypeError):
                comment_thread = []
            
            annotations.append({
                "id": anno['id'],
                "highlightedText": anno['highlighted_text'],
                "pageNumber": anno.get('page_number'),
                "xPosition": anno.get('x_position'),
                "yPosition": anno.get('y_position'),
                "resolved": anno.get('resolved', False),
                "createdBy": {
                    "id": anno['created_by_user_id'],
                    "name": user_info.get('name', 'Unknown User'),
                    "avatarUrl": user_info.get('image')
                },
                "createdAt": anno['created_at'],
                "comments": comment_thread
            })
        return annotations
    except Exception as e:
        print(f"Error fetching annotations: {e}")
        return []


@router.post("/api/annotations/create")
async def create_annotation(annotation_data: AnnotationCreate, user_id: str = Depends(get_current_user_id)):
    """Creates a new annotation thread with an initial comment."""
    try:
        user_res = supabase.table('users').select('name, image').eq('id', user_id).single().execute()
        user_profile = user_res.data or {}

        initial_comment = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "userName": user_profile.get('name', 'Anonymous'),
            "avatarUrl": user_profile.get('image', ''),
            "text": annotation_data.comment_text,
            "timestamp": datetime.utcnow().isoformat(),
            "type": "comment"
        }

        annotation_data_dict = {
            'document_id': annotation_data.document_id,
            'created_by_user_id': user_id,
            'highlighted_text': annotation_data.highlighted_text,
            'comment_thread': json.dumps([initial_comment]),
            'resolved': False
        }
        
        if annotation_data.page_number is not None:
            annotation_data_dict['page_number'] = annotation_data.page_number
        if annotation_data.x_position is not None:
            annotation_data_dict['x_position'] = annotation_data.x_position
        if annotation_data.y_position is not None:
            annotation_data_dict['y_position'] = annotation_data.y_position

        result = supabase.table('document_annotations').insert(annotation_data_dict).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create annotation")
            
        return result.data[0]
    except Exception as e:
        print(f"Error creating annotation: {e}")
        raise HTTPException(status_code=500, detail=f"Could not create annotation: {e}")


@router.post("/api/annotations/{annotation_id}/reply")
async def reply_to_annotation(annotation_id: str, reply: AnnotationReply, user_id: str = Depends(get_current_user_id)):
    """Adds a new reply to an existing annotation thread."""
    try:
        user_res = supabase.table('users').select('name, image').eq('id', user_id).single().execute()
        user_profile = user_res.data or {}

        anno_res = supabase.table('document_annotations').select('comment_thread').eq('id', annotation_id).single().execute()
        if not anno_res.data:
            raise HTTPException(status_code=404, detail="Annotation not found.")
        
        current_thread = json.loads(anno_res.data.get('comment_thread', '[]'))
        
        new_reply = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "userName": user_profile.get('name', 'Anonymous'),
            "avatarUrl": user_profile.get('image', ''),
            "text": reply.comment_text,
            "timestamp": datetime.utcnow().isoformat(),
            "type": "comment"
        }
        current_thread.append(new_reply)
        
        result = supabase.table('document_annotations')\
            .update({
                'comment_thread': json.dumps(current_thread),
                'updated_at': datetime.utcnow().isoformat()
            })\
            .eq('id', annotation_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to add reply")
            
        return new_reply
    except Exception as e:
        print(f"Error posting reply: {e}")
        raise HTTPException(status_code=500, detail=f"Could not post reply: {e}")


@router.put("/api/annotations/{annotation_id}/resolve")
async def resolve_annotation(annotation_id: str, update_data: AnnotationUpdate, user_id: str = Depends(get_current_user_id)):
    """Marks an annotation as resolved or unresolved."""
    try:
        result = supabase.table('document_annotations')\
            .update({
                'resolved': update_data.resolved,
                'updated_at': datetime.utcnow().isoformat()
            })\
            .eq('id', annotation_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Annotation not found")
            
        return {"message": f"Annotation {'resolved' if update_data.resolved else 'unresolved'} successfully"}
    except Exception as e:
        print(f"Error updating annotation: {e}")
        raise HTTPException(status_code=500, detail=f"Could not update annotation: {e}")


@router.delete("/api/annotations/{annotation_id}")
async def delete_annotation(annotation_id: str, user_id: str = Depends(get_current_user_id)):
    """Deletes an annotation thread."""
    try:
        anno_res = supabase.table('document_annotations').select('created_by_user_id, project_id').eq('id', annotation_id).single().execute()
        if not anno_res.data:
            raise HTTPException(status_code=404, detail="Annotation not found")
            
        if anno_res.data['created_by_user_id'] != user_id:
            admin_check = supabase.table('project_members')\
                .select('role')\
                .eq('project_id', anno_res.data['project_id'])\
                .eq('user_id', user_id)\
                .eq('role', 'Admin')\
                .execute()
            if not admin_check.data:
                raise HTTPException(status_code=403, detail="Not authorized to delete this annotation")
        
        supabase.table('document_annotations').delete().eq('id', annotation_id).execute()
        return {"message": "Annotation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting annotation: {e}")
        raise HTTPException(status_code=500, detail=f"Could not delete annotation: {e}")


@router.get("/api/documents/{document_id}/ai_annotations")
@cached(request_type="ai_heavy")
async def get_ai_annotation_suggestions(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Uses AI to suggest potential annotations for important clauses."""
    try:
        doc_res = supabase.table('vdr_documents').select('file_name, file_path').eq('id', document_id).single().execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document_content = f"Document: {doc_res.data['file_name']}"
        rag_context = rag_system.search("important clauses legal terms risks liabilities obligations", k=5)
        context_text = "\n\n".join([chunk['content'] for chunk in rag_context])
        
        prompt = f"""Instruction: Analyze this document and identify 3-5 key clauses that should be annotated for legal review. For each, provide: the exact text snippet, why it's important, and a suggested comment. Respond with JSON: {{"suggestions": [{{"text": "exact text", "importance": "high/medium", "suggestedComment": "comment"}}]}}

Document Context: {document_content}
Related Clauses: {context_text}

Response:"""
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={
                "model": CUSTOM_MODEL_NAME, 
                "prompt": prompt, 
                "stream": False
            })
            response.raise_for_status()
            
        ai_response = response.json().get('response', '{}')
        suggestions = json.loads(ai_response)
        return suggestions.get('suggestions', [])
    except Exception as e:
        print(f"Error generating AI annotations: {e}")
        return []


@router.get("/api/documents/{document_id}/content")
async def get_document_content(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Get the actual content of a document for viewing."""
    try:
        doc_res = supabase.table('vdr_documents').select('*').eq('id', document_id).single().execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = doc_res.data
        file_path = Path(document.get('file_path'))
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Document file not found")
        
        file_extension = file_path.suffix.lower()
        
        if file_extension == '.pdf':
            return {
                "type": "pdf",
                "url": f"/api/vdr/documents/{document_id}/download",
                "name": document.get('file_name'),
                "pages": await get_pdf_page_count(file_path)
            }
        elif file_extension in ['.txt', '.md', '.csv']:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {
                "type": "text",
                "content": content,
                "name": document.get('file_name')
            }
        elif file_extension in ['.doc', '.docx']:
            return {
                "type": "doc",
                "url": f"/api/vdr/documents/{document_id}/download",
                "name": document.get('file_name')
            }
        else:
            return {
                "type": "file",
                "url": f"/api/vdr/documents/{document_id}/download", 
                "name": document.get('file_name')
            }
    except Exception as e:
        print(f"Error getting document content: {e}")
        raise HTTPException(status_code=500, detail="Could not load document content")

