# HackChange Backend API

FastAPI backend for the HackChange project.

## Setup

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Server

### Development Mode (with auto-reload):
```bash
python run.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive API docs (Swagger): http://localhost:8000/docs
- Alternative API docs (ReDoc): http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and configuration
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py    # Health check endpoint
│   │       └── example.py   # Example CRUD routes
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py        # App configuration and settings
│   └── models/
│       └── __init__.py
├── venv/                    # Virtual environment
├── requirements.txt         # Python dependencies
├── run.py                   # Development server runner
├── .env.example            # Environment variables template
└── README.md               # This file
```

## API Endpoints

### Health Check
- `GET /health` - Check API health status

### Example CRUD Operations
- `GET /api/items` - Get all items
- `GET /api/items/{item_id}` - Get specific item
- `POST /api/items` - Create new item
- `PUT /api/items/{item_id}` - Update item
- `DELETE /api/items/{item_id}` - Delete item

## Features

- FastAPI with automatic API documentation
- CORS configured for React frontend
- Pydantic models for request/response validation
- SQLAlchemy ready for database integration
- Environment-based configuration
- Hot reload during development

## Next Steps

1. Add database models in `app/models/`
2. Create additional routes in `app/api/routes/`
3. Implement authentication/authorization
4. Add database migrations with Alembic
5. Configure production settings
