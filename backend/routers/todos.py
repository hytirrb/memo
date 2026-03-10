import time
from datetime import date
from fastapi import APIRouter, HTTPException
from ..models import TodoCreate, TodoUpdate
from ..database import load_todos, save_todos

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("")
def get_todos():
    return load_todos()


@router.post("")
def create_todo(todo: TodoCreate):
    todos = load_todos()
    new_todo = {
        "id": int(time.time() * 1000),
        "title": todo.title,
        "description": todo.description,
        "date": todo.date,
        "priority": todo.priority,
        "completed": False,
        "created_at": str(date.today())
    }
    todos.append(new_todo)
    save_todos(todos)
    return new_todo


@router.put("/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate):
    todos = load_todos()
    for t in todos:
        if t["id"] == todo_id:
            if todo.title is not None:
                t["title"] = todo.title
            if todo.description is not None:
                t["description"] = todo.description
            if todo.priority is not None:
                t["priority"] = todo.priority
            if todo.completed is not None:
                t["completed"] = todo.completed
            save_todos(todos)
            return t
    raise HTTPException(status_code=404, detail="Todo not found")


@router.delete("/{todo_id}")
def delete_todo(todo_id: int):
    todos = load_todos()
    new_todos = [t for t in todos if t["id"] != todo_id]
    if len(new_todos) == len(todos):
        raise HTTPException(status_code=404, detail="Todo not found")
    save_todos(new_todos)
    return {"message": "Deleted"}


@router.patch("/{todo_id}/toggle")
def toggle_todo(todo_id: int):
    todos = load_todos()
    for t in todos:
        if t["id"] == todo_id:
            t["completed"] = not t["completed"]
            save_todos(todos)
            return t
    raise HTTPException(status_code=404, detail="Todo not found")
