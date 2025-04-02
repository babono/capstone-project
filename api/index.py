import io
import pandas as pd

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Union

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# Configure CORS (Cross-Origin Resource Sharing) to allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your React app's origin in production (e.g., "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.post("/api/py/uploadExcelMaterialConsumption")
async def upload_file(file: UploadFile):
    contents = await file.read()
    data = pd.read_excel(io.BytesIO(contents))

    # Strip leading and trailing spaces from all string columns
    data = data.applymap(lambda x: x.strip() if isinstance(x, str) else x)
    data.columns = data.columns.str.strip()

    # Replace empty strings or unexpected values with Unknown
    data.replace(["", " ", None], "Unknown", inplace=True)

    # Convert 'Pstng Date' to datetime
    data['Pstng Date'] = pd.to_datetime(data['Pstng Date'], errors='coerce')

    # Convert 'SLED/BBD' to datetime, handling errors
    data['SLED/BBD'] = pd.to_datetime(data['SLED/BBD'], errors='coerce')

    # Convert negative consumption values to positive
    if 'Quantity' in data.columns:
        data['Quantity'] = data['Quantity'].abs()
    
    if 'Quantity in UnE' in data.columns:
        data['Quantity in UnE'] = data['Quantity in UnE'].abs()
   
    # Convert to dictionary and return
    result = data.to_dict(orient="records")
    return result

@app.post("/api/py/uploadExcelOrderPlacement")
async def upload_file(file: UploadFile):
    contents = await file.read()
    data = pd.read_excel(io.BytesIO(contents))
    data = data.applymap(lambda x: x.strip() if isinstance(x, str) else x)
    data.columns = data.columns.str.strip()
    data['Order Quantity'] = pd.to_numeric(data['Order Quantity'], errors='coerce')
    return data.to_dict(orient="records")

@app.post("/api/py/uploadExcelGoodsReceipt")
async def upload_file(file: UploadFile):
    # Read the file contents
    contents = await file.read()
    data = pd.read_excel(io.BytesIO(contents))

    # Strip leading and trailing spaces from all string columns
    data = data.applymap(lambda x: x.strip() if isinstance(x, str) else x)
    data.columns = data.columns.str.strip()

    # Replace empty strings or unexpected values with Unknown
    data.replace(["", " ", None], "Unknown", inplace=True)

    # Convert 'Pstng Date' to datetime
    data['Pstng Date'] = pd.to_datetime(data['Pstng Date'], errors='coerce')

    # Convert 'SLED/BBD' to datetime, handling errors
    data['SLED/BBD'] = pd.to_datetime(data['SLED/BBD'], errors='coerce')

    # Convert negative consumption values to positive
    if 'Quantity' in data.columns:
        data['Quantity'] = data['Quantity'].abs()

    # Convert to dictionary and return
    result = data.to_dict(orient="records")
    return result


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