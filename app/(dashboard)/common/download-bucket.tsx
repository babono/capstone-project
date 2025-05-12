import React from "react";
import { Button } from "@mui/material";

interface DownloadButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const DownloadBucket: React.FC<DownloadButtonProps> = ({ onClick, isLoading }) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? "Downloading..." : "Download Sample File"}
    </Button>
  );
};

export default DownloadBucket;
