export const maxDuration = 300;
import React from "react";
import { Box, Typography } from "@mui/material";
import { useFileUpload } from "@/app/hooks/useFileUpload";
import { PAGE_KEYS } from "@/app/constants";

type FileUploaderProps = {
  type: PAGE_KEYS;
  title: string;
  onUploadComplete: (data: any) => void;
};

const FileUploader: React.FC<FileUploaderProps> = ({ type, onUploadComplete, title }) => {
  const { file, getRootProps, getInputProps, isDragActive } = useFileUpload({
    type,
    onUploadComplete,
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
          {`Drag and drop the ${title} file here to start the analysis, or click to select a file`}
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
