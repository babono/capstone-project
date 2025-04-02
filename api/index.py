import io
import pandas as pd
import logging

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Union

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.post("/api/py/uploadExcelMaterialConsumption")
async def upload_file(file: UploadFile):
    try:
        # Log the start of the process
        logger.info("Starting uploadExcelMaterialConsumption endpoint")

        # Read the file contents
        contents = await file.read()
        logger.info("File read successfully")

        # Load the Excel file into a DataFrame
        data = pd.read_excel(io.BytesIO(contents))
        logger.info("Excel file loaded into DataFrame")

        # Strip leading and trailing spaces from all string columns
        data = data.applymap(lambda x: x.strip() if isinstance(x, str) else x)
        data.columns = data.columns.str.strip()
        logger.info("Stripped leading and trailing spaces from columns and data")

        # Replace empty strings or unexpected values with "Unknown"
        data.replace(["", " ", None], "Unknown", inplace=True)
        logger.info("Replaced empty strings and unexpected values with 'Unknown'")

        # Convert 'Pstng Date' to datetime
        if 'Pstng Date' in data.columns:
            data['Pstng Date'] = pd.to_datetime(data['Pstng Date'], errors='coerce')
            logger.info("'Pstng Date' column converted to datetime")

        # Convert 'SLED/BBD' to datetime, handling errors
        if 'SLED/BBD' in data.columns:
            data['SLED/BBD'] = pd.to_datetime(data['SLED/BBD'], errors='coerce')
            logger.info("'SLED/BBD' column converted to datetime")

        # Convert negative consumption values to positive
        if 'Quantity' in data.columns:
            data['Quantity'] = data['Quantity'].abs()
            logger.info("Negative values in 'Quantity' column converted to positive")

        if 'Quantity in UnE' in data.columns:
            data['Quantity in UnE'] = data['Quantity in UnE'].abs()
            logger.info("Negative values in 'Quantity in UnE' column converted to positive")

        # Convert to dictionary and return
        result = data.to_dict(orient="records")
        logger.info("Data successfully converted to dictionary and returned")
        return result

    except Exception as e:
        # Log the exception
        logger.error(f"An error occurred: {e}", exc_info=True)
        return {"error": "An internal server error occurred. Please check the logs for more details."}

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