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

@app.post("/api/py/uploadExcel")
async def upload_file(file: UploadFile):
    contents = await file.read()
    data = pd.read_excel(io.BytesIO(contents))
    data = data.applymap(lambda x: x.strip() if isinstance(x, str) else x)
    data.columns = data.columns.str.strip()
    data['Order Quantity'] = pd.to_numeric(data['Order Quantity'], errors='coerce')
    return data.to_dict(orient="records")

@app.post("/api/py/filter/")
async def filter_data(data: list, filters: dict):
    df = pd.DataFrame(data)
    if "plants" in filters:
        df = df[df["Plant"].isin(filters["plants"])]
    if "suppliers" in filters:
        df = df[df["Supplier"].isin(filters["suppliers"])]
    return df.to_dict(orient="records")

@app.post("/api/py/visualization/")
async def visualization_data(data: list, material_column: str = "Material Number"):
    df = pd.DataFrame(data)
    material_counts = df[material_column].value_counts().reset_index()
    material_counts.columns = [material_column, "Transaction Count"]
    return material_counts.to_dict(orient="records")