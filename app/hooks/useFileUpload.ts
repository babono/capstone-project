import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { PAGE_KEYS } from "../constants";
import JSZip from 'jszip';

type UseFileUploadProps = {
  type: PAGE_KEYS;
  onDataRetrieved: (data: any) => void;
};

export const useFileUpload = ({ type, onDataRetrieved }: UseFileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0); // New state

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
        return "/api/py/uploadShortageXlsx"; // Modified endpoint name
      default:
        throw new Error("Invalid type provided to useFileUpload");
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const apiEndpoint = getApiEndpoint();
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      console.error(`Failed to upload ${file.name}`);
      return false; // Indicate failure
    }
    return await response.json();
  };

  const handleZipUpload = async (zipFile: File) => {
    try {
      const zip = await JSZip.loadAsync(zipFile);
      const files = Object.values(zip.files).filter(file => !file.dir && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))); // Filter out directories and non-excel files

      // Sort files by name in ascending order using natural sorting
      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
      files.sort((a, b) => collator.compare(a.name, b.name));

      console.log("Extracted files:", files);
      const uploadResults = [];
      setUploadProgress(0); // Reset progress

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = await file.async("blob");
        const fileObject = new File([blob], file.name);
        const result = await uploadFile(fileObject);
        console.log("Uploaded data:", result);
        uploadResults.push(result);
        // Update progress based on number of files processed
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      onDataRetrieved(uploadResults); // Pass the uploaded data back to the parent component
    } catch (error) {
      console.error("Error extracting or uploading files from zip:", error);
      alert("Failed to process the zip file. Please try again.");
    }
  };

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    if (selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip')) {
      await handleZipUpload(selectedFile);
    } else {
      const data = await uploadFile(selectedFile);
      setUploadProgress(100); // Complete for non-zip file
      onDataRetrieved(data);
    }
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
    onError: (error) => {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file. Please try again.");
    }
  });

  return { file, getRootProps, getInputProps, isDragActive, uploadProgress };
};
