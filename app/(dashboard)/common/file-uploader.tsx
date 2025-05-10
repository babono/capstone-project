import React, { useState } from "react";
import { Box, Typography, LinearProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFileUpload } from "@/app/hooks/useFileUpload";
import { ERR_BUCKET_LOAD_PREFIX, PAGE_KEYS } from "@/app/constants";
import DownloadBucket from "./download-bucket";
import useFetchWithProgress from "@/app/hooks/useFetchWithProgress";

type FileUploaderProps = {
  type: PAGE_KEYS;
  title: string;
  fileBucketURL: string;
  onDataRetrieved: (data: any) => void;
};

const FileUploader: React.FC<FileUploaderProps> = ({ type, title, fileBucketURL, onDataRetrieved }) => {
  const { file, setFile, getRootProps, getInputProps, isDragActive, uploadProgress } = useFileUpload({
    type,
    onDataRetrieved,
  });

  const { fetchJsonWithProgress, downloadProgress } = useFetchWithProgress();
  const [downloadedFileName, setDownloadedFileName] = useState<string | null>(null);

  const handleDownloadFromBucket = () => {
    fetchJsonWithProgress(fileBucketURL)
      .then((parsedData) => {
        onDataRetrieved(parsedData);
        setDownloadedFileName("Sample file has been downloaded");
      })
      .catch((error) => {
        console.error(ERR_BUCKET_LOAD_PREFIX, error);
      });
  };

  const handleReset = () => {
    setDownloadedFileName(null); // Reset the downloaded file state
    setFile(null); // Reset the file state
  };

  const isUploading = uploadProgress > 0 && uploadProgress < 100;
  const isDownloading = downloadProgress > 0 && downloadProgress < 100;
  const isDataProcessing = isUploading || isDownloading;
  const percentageToShow = isUploading ? uploadProgress : downloadProgress;

  return (
    <div>
      {/* File Uploader */}
      {!isDataProcessing && !downloadedFileName && (
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed #3719D3",
            borderRadius: "8px",
            padding: "48px 16px",
            textAlign: "center",
            backgroundColor: isDragActive ? "#e3f2fd" : "#fafafa",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography variant="body1" color="primary">
              Drop the file here...
            </Typography>
          ) : (
            <Typography variant="body1" color="textSecondary">
              {`Drag and drop the ${title} file here to start the analysis, or click to select a file`}
            </Typography>
          )}
          {file && (
            <Typography variant="body2" color="textSecondary" sx={{ marginTop: "8px" }}>
              Selected file: {file.name}
            </Typography>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ marginTop: "16px" }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption">{uploadProgress}%</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Show progress bar during download and upload */}
      {isDataProcessing && (
        <div style={{ width: "100%", marginBottom: 16 }}>
          <LinearProgress variant="determinate" value={percentageToShow} />
          <p>{Math.round(percentageToShow || 0)}% Progress</p>
        </div>
      )}

      {/* Show downloaded file name with reset button */}
      {downloadedFileName && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "2px dashed #3719D3",
            borderRadius: "8px",
            padding: "8px 16px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="textSecondary">
            {downloadedFileName}
          </Typography>
          <IconButton onClick={handleReset} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {/* Button to trigger download from public bucket */}
      {!downloadedFileName && (
        <div style={{ marginTop: 16 }} className="mb-4">
          <DownloadBucket onClick={handleDownloadFromBucket} isLoading={isDataProcessing} />
        </div>
      )}
    </div>
  );
};

export default FileUploader;
