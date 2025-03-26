import io
import pandas as pd

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Union
from utils import data_logic

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# Configure CORS (Cross-Origin Resource Sharing) to allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your React app's origin in production (e.g., "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/py/upload")
async def upload_excel(file: UploadFile = File(...)) -> Union[Dict, Dict[str, str]]:
    """
    Endpoint to upload an Excel file, process it with pandas, and return the data as JSON.
    """
    try:
        contents = await file.read()

        # Read the Excel file into a pandas DataFrame
        df = pd.read_excel(io.BytesIO(contents))
        result = data_logic.material_consumption_upload(df)

        return result  # Ensure `result` is a dictionary

    except Exception as e:
        # Return an error response as a dictionary
        return {"error": str(e)}

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}
