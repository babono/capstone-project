import React from "react";
import { Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";

type CSVUploaderProps = {
  onDrop: (acceptedFiles: File[]) => void;
  file: File | null;
};

const FileUploader: React.FC<CSVUploaderProps> = ({ onDrop, file }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  return (
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
          Drag and drop the Material Consumption Excel file here to start the analysis, or click to select a file
        </Typography>
      )}
      {file && (
        <Typography variant="body2" color="textSecondary" sx={{ marginTop: "8px" }}>
          Selected file: {file.name}
        </Typography>
      )}
    </Box>
  );
};

export default FileUploader;
