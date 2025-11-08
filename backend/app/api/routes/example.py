from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()


class Item(BaseModel):
    id: int
    name: str
    description: str | None = None


# In-memory storage for demo purposes
items_db: List[Item] = [
    Item(id=1, name="Example Item 1", description="This is an example item"),
    Item(id=2, name="Example Item 2", description="Another example item"),
]


@router.get("/items")
async def get_items():
    """Get all items"""
    return {"items": items_db}


@router.get("/items/{item_id}")
async def get_item(item_id: int):
    """Get a specific item by ID"""
    item = next((item for item in items_db if item.id == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/items")
async def create_item(item: Item):
    """Create a new item"""
    # Check if item with same ID already exists
    if any(existing_item.id == item.id for existing_item in items_db):
        raise HTTPException(status_code=400, detail="Item with this ID already exists")

    items_db.append(item)
    return {"message": "Item created successfully", "item": item}


@router.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    """Update an existing item"""
    for idx, existing_item in enumerate(items_db):
        if existing_item.id == item_id:
            items_db[idx] = item
            return {"message": "Item updated successfully", "item": item}

    raise HTTPException(status_code=404, detail="Item not found")


@router.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """Delete an item"""
    for idx, item in enumerate(items_db):
        if item.id == item_id:
            deleted_item = items_db.pop(idx)
            return {"message": "Item deleted successfully", "item": deleted_item}

    raise HTTPException(status_code=404, detail="Item not found")
