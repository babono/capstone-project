from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io  # Import the io module explicitly
from typing import List, Dict
import chardet

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
async def upload_csv(file: UploadFile = File(...)) -> List[Dict]:
    """
    Endpoint to upload a CSV file, process it with pandas, and return the data as JSON.
    """
    try:
        contents = await file.read()

        # Detect the encoding
        encoding_result = chardet.detect(contents)
        encoding = encoding_result['encoding']
        confidence = encoding_result['confidence']

        if encoding:
            decoded_contents = contents.decode(encoding)  # Use the detected encoding
            df = pd.read_csv(io.StringIO(decoded_contents), encoding=encoding)
            return df.to_dict(orient="records")
        else:
            return {"error": "Unable to detect file encoding."}

    except Exception as e:
        return {"error": str(e)}

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}
