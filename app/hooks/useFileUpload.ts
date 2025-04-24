import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { PAGE_KEYS } from "../constants";

type UseFileUploadProps = {
  type: PAGE_KEYS;
  onUploadComplete: (data: any) => void;
};

export const useFileUpload = ({ type, onUploadComplete }: UseFileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);

  // Determine the API endpoint based on the type
  const getApiEndpoint = () => {
    switch (type) {
      case PAGE_KEYS.MATERIAL_CONSUMPTION:
        return "/api/py/uploadExcelMaterialConsumption";
      case PAGE_KEYS.ORDER_PLACEMENT:
        return "/api/py/uploadExcelOrderPlacement";
      case PAGE_KEYS.GOODS_RECEIPT:
        return "/api/py/uploadExcelGoodsReceipt";
      case PAGE_KEYS.HOME:
        return "/api/py/uploadShortageZip";
      default:
        throw new Error("Invalid type provided to useFileUpload");
    }
  };

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    const apiEndpoint = getApiEndpoint();
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      alert("Failed to upload the file. Please try again.");
      return;
    }
    const data = await response.json();
    onUploadComplete(data); // Pass the uploaded data back to the parent component
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/zip": [".zip"],
    },
    multiple: false,
  });

  return { file, getRootProps, getInputProps, isDragActive };
};
