import io, json
import pandas as pd
import logging
import zipfile
import asyncio
import requests  # Added for HTTP requests
from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from decouple import config

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
        logger.info("Starting uploadExcelMaterialConsumption endpoint")
        contents = await file.read()
        logger.info("File read successfully")
        data = pd.read_excel(io.BytesIO(contents))
        logger.info("Excel file loaded into DataFrame")
        data = data.applymap(lambda x: x.strip() if isinstance(x, str) else x)
        data.columns = data.columns.str.strip()
        logger.info("Stripped leading and trailing spaces from columns and data")
        data.replace(["", " ", None], "Unknown", inplace=True)
        logger.info("Replaced empty strings with 'Unknown'")
        if 'Pstng Date' in data.columns:
            data['Pstng Date'] = pd.to_datetime(data['Pstng Date'], errors='coerce')
            logger.info("'Pstng Date' column converted to datetime")
        if 'SLED/BBD' in data.columns:
            data['SLED/BBD'] = pd.to_datetime(data['SLED/BBD'], errors='coerce')
            logger.info("'SLED/BBD' column converted to datetime")
        if 'Quantity' in data.columns:
            data['Quantity'] = data['Quantity'].abs()
            logger.info("Negative values in 'Quantity' converted to positive")
        if 'Quantity in UnE' in data.columns:
            data['Quantity in UnE'] = data['Quantity in UnE'].abs()
            logger.info("Negative values in 'Quantity in UnE' converted to positive")
        result = data.to_dict(orient="records")
        logger.info("Data converted to dictionary and returned")
        return result
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
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

async def extract_data_from_zip(zip_file: UploadFile):
    """Extracts data from XLSX files within a ZIP archive and returns a raw json"""

    try:
        content = await zip_file.read()
        zip_buffer = io.BytesIO(content)

        with zipfile.ZipFile(zip_buffer, "r") as zip_archive:
            data = {}
            for filename in zip_archive.namelist():
                # log the filename
                logger.info(f"Processing file: {filename}")
                print(f"Processing file: {filename}")
                if filename.endswith(".xlsx"):
                    try:
                        excel_file = zip_archive.open(filename)
                        df = pd.read_excel(excel_file)

                        # Handle NaN values by replacing them with empty strings
                        df = df.fillna('')

                        data[filename] = df.to_dict(orient="records")  # Convert to list of dictionaries for JSON
                        # log the current data
                        logger.info(f"Data extracted from {filename}: {data[filename]}")
                        print(f"Data extracted from {filename}: {data[filename]}")
                    except Exception as e:
                        logger.error(f"Error reading {filename}: {e}", exc_info=True)  # Log the error with traceback
                        raise HTTPException(status_code=500, detail=f"Error reading {filename}: {e}")  # Abort and return error and message

            return data  # The data dict has the filename and the corresponding json.
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}", exc_info=True)  # Log the unexpected error with traceback
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/api/py/uploadShortageZip")
async def upload_zip(file: UploadFile = File(...)):
    """Upload a ZIP file containing XLSX files and get the raw data in JSON format."""

    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only ZIP files are allowed.")

    try:
        data = await extract_data_from_zip(file)  # Call the function to extract data

        return data  #Return the response to the client.
    except HTTPException as http_exc:
        raise http_exc  #Re-raise HTTPExceptions to preserve their status codes.
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/api/py/uploadShortageXlsx")
async def upload_xlsx(file: UploadFile = File(...)):
    """Upload an XLSX file and get the raw data in JSON format (optimized)."""
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only XLSX or XLS files are allowed.")

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        df = df.fillna('')

        # Use Pandas to_json to quickly convert the DataFrame to a JSON string
        json_data = df.to_json(orient="records")
        return Response(content=json_data, media_type="application/json")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/py/fetchWaterfallJson")
async def fetch_public_json():
    """
    Fetches a JSON file using the public URL:
    https://storage.googleapis.com/babono_bucket/uploadedData.json
    """
    public_url = "https://storage.googleapis.com/babono_bucket/uploadedData.json"
    try:
        response = requests.get(public_url)
        response.raise_for_status()
        data = response.json()
        return data
    except Exception as e:
        logger.error(f"Error fetching JSON from public URL: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
