Set-Location "$PSScriptRoot\backend"
if (!(Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
  } else {
@"
MONGO_URL=mongodb://localhost:27017
DB_NAME=aqp_autos
ADMIN_PIN=1234
YAPE_NUMERO=938567871
YAPE_TITULAR=GNPS Autos
PUBLIC_BASE_URL=http://localhost:8001
MAX_IMAGE_BASE64_CHARS=6000000
"@ | Set-Content -Encoding UTF8 ".env"
  }
}
if (!(Test-Path ".venv")) {
  python -m venv .venv
}
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
