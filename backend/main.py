from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import json
import re

from database import Base, engine, SessionLocal
from models.models_task import Task
from models.models_log import AuditLog
from schemas.schemas_task import TaskCreate, TaskUpdate, TaskOut, TaskListOut
from schemas.schemas_log import AuditLogOut
from auth import get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Simple input sanitizer – strips HTML tags
TAG_RE = re.compile(r"<.*?>")


def sanitize_text(text: str) -> str:
    return TAG_RE.sub("", text or "").strip()


def log_action(
    db: Session,
    action: str,
    task_id: int,
    updated_content: Optional[dict] = None,
) -> None:
    encoded = json.dumps(updated_content) if updated_content else None
    log = AuditLog(
        action=action,
        task_id=task_id,
        updated_content=encoded,
    )
    db.add(log)
    db.commit()


@app.get("/")
def root():
    return {"message": "Task Manager API running"}


# -------- TASKS --------

@app.post("/api/tasks", response_model=TaskOut)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    title = sanitize_text(payload.title)
    description = sanitize_text(payload.description)

    if not title or not description:
        raise HTTPException(
            status_code=400, detail="Title and Description must not be empty."
        )

    task = Task(title=title, description=description)
    db.add(task)
    db.commit()
    db.refresh(task)

    log_action(
        db,
        action="Create Task",
        task_id=task.id,
        updated_content={
            "title": task.title,
            "description": task.description,
        },
    )

    return task


@app.get("/api/tasks", response_model=TaskListOut)
def list_tasks(
    page: int = 1,
    limit: int = 5,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    if page < 1:
        page = 1
    if limit < 1:
        limit = 5

    query = db.query(Task)

    if search:
        s = search.strip()
        if s:
            pattern = f"%{s}%"
            query = query.filter(
                (Task.title.like(pattern)) | (Task.description.like(pattern))
            )

    total = query.count()
    tasks = (
        query.order_by(Task.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return TaskListOut(data=tasks, page=page, limit=limit, total=total)


@app.put("/api/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    changed_fields = {}

    if payload.title is not None:
        new_title = sanitize_text(payload.title)
        if not new_title:
            raise HTTPException(
                status_code=400, detail="Title must not be empty."
            )
        if new_title != task.title:
            changed_fields["title"] = new_title
            task.title = new_title

    if payload.description is not None:
        new_desc = sanitize_text(payload.description)
        if not new_desc:
            raise HTTPException(
                status_code=400, detail="Description must not be empty."
            )
        if new_desc != task.description:
            changed_fields["description"] = new_desc
            task.description = new_desc

    db.commit()
    db.refresh(task)

    if changed_fields:
        log_action(
            db,
            action="Update Task",
            task_id=task.id,
            updated_content=changed_fields,
        )

    return task


@app.delete("/api/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    log_action(db, action="Delete Task", task_id=task_id, updated_content=None)

    return {"message": "Task deleted successfully"}
    

# -------- AUDIT LOGS --------

@app.get("/api/logs", response_model=List[AuditLogOut])
def get_logs(
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    result: List[AuditLogOut] = []

    for log in logs:
        data = None
        if log.updated_content:
            try:
                data = json.loads(log.updated_content)
            except json.JSONDecodeError:
                data = None

        result.append(
            AuditLogOut(
                id=log.id,
                timestamp=log.timestamp,
                action=log.action,
                task_id=log.task_id,
                updated_content=data,
            )
        )

    return result
