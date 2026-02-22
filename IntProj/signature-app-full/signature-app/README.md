# ✍️ SignFlow — Document Signature App

A DocuSign-style digital signature platform built with **FastAPI + Python** backend and **React** frontend.

---

## 🏗️ Architecture

```
signflow/
├── backend/          → FastAPI Python API
│   ├── main.py       → App entrypoint + CORS
│   ├── database.py   → SQLAlchemy + session management
│   ├── models/       → SQLAlchemy DB models
│   ├── schemas/      → Pydantic request/response schemas
│   ├── routers/      → API route handlers
│   ├── services/     → Business logic (auth, PDF, audit)
│   └── middleware/   → JWT auth dependency
│
└── frontend/         → React/Next.js UI
    └── src/
        ├── components/  → Reusable UI components
        ├── pages/       → Route pages
        └── utils/       → API client, auth helpers
```

---

## 🚀 Quick Start — Backend

### 1. Prerequisites
- Python 3.10+
- PostgreSQL (or SQLite for dev)

### 2. Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your DB connection string and a strong SECRET_KEY
```

### 4. Run
```bash
uvicorn main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

---

## 🎨 Quick Start — Frontend

### Option A: Use the standalone HTML preview
Open `signflow-app.html` in any browser — fully functional demo with mock data.

### Option B: React/Next.js setup
```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:3000
```

Configure your API base URL in `src/utils/api.js`:
```js
const API_BASE = 'http://localhost:8000';
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | None |
| POST | `/api/auth/login` | Get JWT token | None |
| GET | `/api/auth/me` | Current user | ✓ JWT |
| POST | `/api/docs/upload` | Upload PDF | ✓ JWT |
| GET | `/api/docs` | List documents | ✓ JWT |
| GET | `/api/docs/{id}` | Get document | ✓ JWT |
| GET | `/api/docs/{id}/download` | Download PDF | ✓ JWT |
| POST | `/api/docs/send-link` | Generate signing link | ✓ JWT |
| DELETE | `/api/docs/{id}` | Delete document | ✓ JWT |
| POST | `/api/signatures` | Place signature | Optional |
| GET | `/api/signatures/{docId}` | Get signatures | ✓ JWT |
| POST | `/api/signatures/finalize` | Embed + lock PDF | ✓ JWT |
| POST | `/api/signatures/sign-with-token` | Public signing | None |
| GET | `/api/audit/{docId}` | Audit trail | ✓ JWT |

---

## 🔐 Security Features

- **JWT Authentication** — all protected routes require Bearer tokens
- **bcrypt Password Hashing** — via Passlib
- **One-time Signing Tokens** — 7-day expiry, URL-safe 32-byte secrets
- **Immutable Signed PDFs** — PyMuPDF embeds + flattens signatures
- **Audit Trail** — every action logged with timestamp, user, and IP

---

## 📄 PDF Signing Flow

1. User uploads PDF → stored on disk, metadata in DB
2. User creates signature (draw/type/image)
3. User clicks PDF to place signature at coordinates (x%, y%)
4. `POST /api/signatures` saves position to DB
5. `POST /api/signatures/finalize` calls PyMuPDF to:
   - Open original PDF
   - Insert signature PNG at saved coordinates
   - Add signer name annotation
   - Save as `{docname}_signed.pdf`
6. Document status → `SIGNED`, audit log updated

---

## 🗄️ Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | String | Unique |
| full_name | String | |
| hashed_password | String | bcrypt |
| is_active | Boolean | |
| created_at | DateTime | |

### Document
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| owner_id | UUID | FK → User |
| title | String | |
| filename | String | |
| file_path | String | Disk path |
| signed_file_path | String | After finalize |
| status | Enum | draft/sent/signed/expired |
| signing_token | String | One-time link token |
| signer_email | String | |

### Signature
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| document_id | UUID | FK → Document |
| signature_data | Text | Base64 PNG |
| page_number | Int | |
| x_position | Float | % of page width |
| y_position | Float | % of page height |
| ip_address | String | |

### AuditLog
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| document_id | UUID | FK → Document |
| event_type | String | uploaded/viewed/signed/etc |
| actor_email | String | |
| ip_address | String | |
| created_at | DateTime | Immutable |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | FastAPI |
| ASGI Server | Uvicorn |
| ORM | SQLAlchemy |
| Database | PostgreSQL / SQLite (dev) |
| Auth | JWT (python-jose) + Passlib bcrypt |
| PDF Engine | PyMuPDF (fitz) |
| Image Processing | Pillow |
| Frontend | React / Next.js |
| Styling | Tailwind CSS |
| PDF Viewer | react-pdf |
| Drag & Drop | dnd-kit |

---

## 📦 Deployment

### Backend (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=<generate with: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE_MB=10
```

---

## 📚 Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [FastAPI JWT Security Guide](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [PyMuPDF Tutorial](https://pymupdf.readthedocs.io/en/latest/tutorial.html)
- [SQLAlchemy ORM Guide](https://docs.sqlalchemy.org/en/20/orm/)

---

Built with 🐍 Python + ⚡ FastAPI · Enterprise-grade · Portfolio-ready
