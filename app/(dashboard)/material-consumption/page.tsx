// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Image from "next/image";
import iconDT from "../../../public/ic-dt.svg";
import logoGemini from "../../../public/logo-gemini.svg";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Autocomplete from "@mui/material/Autocomplete";
import TypeIt from "typeit-react";
import ReactMarkdown from "react-markdown";
import FiniteShelf from "./charts/finite-shelf";
import InfiniteShelf from "./charts/infinite-shelf";
import AskGeminiButton from "../common/ask-gemini";
import MaterialsVariance from "./charts/materials-variance";
import OverallMaterialConsumption from "./charts/overall-material-consumption";
import MaterialTotalTransaction from "./charts/material-total-consumption";
import { FINITE_SHELF_CHART_ID, GOODS_RECEIPT_CHART_ID, MATERIAL_LEVEL_CHART_ID, TRANSACTIONS_CHART_ID, VARIANCE_CHART_ID } from "@/app/constants/plot";
import MaterialLevelAnalysis from "./material-level-analysis/material-level-analysis";
import FileUploader from "./file-uploader/file-uploader";
import GlobalFilter from "./global-filter/global-filter";

export default function MaterialConsumption() {
  // NextAuth session
  const { data: session, status } = useSession()
  const router = useRouter()

  // State variables
  const [file, setFile] = useState(null);
  const [plotData, setPlotData] = useState([]);
  const [topN, setTopN] = useState(10);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  // Shelf Data
  const [finiteShelfData, setFiniteShelfLifeData] = useState([]);
  const [infiniteShelfData, setInfiniteShelfLifeData] = useState([]);

  // Separate states for each chart's insight and loading status
  const [transactionsInsight, setTransactionsInsight] = useState("");
  const [loadingTransactionsInsight, setLoadingTransactionsInsight] = useState(false);

  const [MaterialConsumptionInsight, setMaterialConsumptionInsight] = useState("");
  const [loadingMaterialConsumptionInsight, setLoadingMaterialConsumptionInsight] = useState(false);

  const [varianceInsight, setVarianceInsight] = useState("");
  const [loadingVarianceInsight, setLoadingVarianceInsight] = useState(false);

  const [finiteShelfInsight, setFiniteShelfInsight] = useState("");
  const [loadingFiniteShelfInsight, setLoadingFiniteShelfInsight] = useState(false);

  const [materialAnalysisInsight, setMaterialAnalysisInsight] = useState("");
  const [loadingMaterialAnalysisInsight, setLoadingMaterialAnalysisInsight] = useState(false);

  // Other States
  const [plants, setPlants] = useState([]);
  const [sites, setSites] = useState([]);
  const [vendors, setVendors] = useState([]);

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/py/uploadExcelMaterialConsumption", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setPlotData(data);

    const uniquePlants = [...new Set(data.map((item) => item["Plant"]))];
    const uniqueSites = [...new Set(data.map((item) => item["Site"]))];
    const uniqueVendors = [...new Set(data.map((item) => item["Vendor Number"]))];

    setPlants(uniquePlants);
    setSites(uniqueSites);
    setVendors(uniqueVendors);

    setSelectedPlants(uniquePlants);
    setSelectedSites(uniqueSites);
    setSelectedVendors(uniqueVendors);

    const dates = data.map((item) => new Date(item["Pstng Date"]));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    setMinDate(oldestDate);
    setMaxDate(newestDate);

    setDateRange([oldestDate, newestDate]);
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
    multiple: false,
  });

  useEffect(() => {
    if (plotData.length > 0) {
      const modifiedData = plotData.map((item) => ({
        ...item,
        remainingShelfLife: Math.ceil(
          (new Date(item["SLED/BBD"]) - new Date(item["Pstng Date"])) /
          (1000 * 60 * 60 * 24)
        ),
      }));
      const finiteShelfLife = modifiedData.filter((item) => item["SLED/BBD"] !== "2100-01-01");
      const infiniteShelfLife = modifiedData
        .filter((item) => item["SLED/BBD"] === "NaT")
        .map((item) => ({
          ...item,
          "SLED/BBD": "No Expiry",
        }));

      setFiniteShelfLifeData(finiteShelfLife);
      setInfiniteShelfLifeData(infiniteShelfLife);
    }
  }, [plotData]);

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login")
  }, [session, status, router])

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Image src={iconDT} alt="Loading..." width={100} height={100} className="animate-spin" />
      </div>
    )
  }

  const filteredPlotData = plotData.filter((item) => {
    const isPlantMatch = selectedPlants.length === 0 || selectedPlants.includes(item["Plant"]);
    const isSiteMatch = selectedSites.length === 0 || selectedSites.includes(item["Site"]);
    const isVendorMatch = selectedVendors.length === 0 || selectedVendors.includes(item["Vendor Number"]);
    const isDateMatch =
      (!dateRange[0] || new Date(item["Pstng Date"]) >= dateRange[0]) &&
      (!dateRange[1] || new Date(item["Pstng Date"]) <= dateRange[1]);

    return isPlantMatch && isSiteMatch && isVendorMatch && isDateMatch;
  });

  const aggregatedData = Object.values(
    filteredPlotData.reduce((acc, item) => {
      const materialNumber = item["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { "Material Number": materialNumber, "Quantity": 0, "Transaction Count": 0 };
      }
      acc[materialNumber]["Transaction Count"] += 1;
      acc[materialNumber]["Quantity"] += item["Quantity"];
      return acc;
    }, {})
  );

  const filteredData = aggregatedData
    .sort((a, b) => b["Quantity"] - a["Quantity"])
    .slice(0, topN !== "All" ? topN : aggregatedData.length);

  const filteredTransactionData = aggregatedData
    .sort((a, b) => b["Transaction Count"] - a["Transaction Count"])
    .slice(0, topN !== "All" ? topN : aggregatedData.length);

  const varianceData = Object.values(
    filteredPlotData.reduce((acc, item) => {
      const materialNumber = item["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { "Material Number": materialNumber, values: [] };
      }
      acc[materialNumber].values.push(item["Quantity"]);
      return acc;
    }, {})
  ).map((material) => ({
    materialNumber: material["Material Number"],
    values: material.values,
  }));

  const filteredVarianceData = varianceData.filter((material) =>
    filteredData.some((topMaterial) => topMaterial["Material Number"] === material.materialNumber)
  );

  const handleInterpret = async (chartId, setLoading, setInsight) => {
    setLoading(true);
    setInsight("");

    try {
      const chartElement = document.getElementById(chartId);

      if (!chartElement) {
        throw new Error("Chart element not found");
      }

      const imageData = await window.Plotly.toImage(chartElement, {
        format: "png",
        width: 800,
        height: 600,
      });

      const base64Image = imageData.split(",")[1];

      const response = await fetch("/api/insightImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chartImage: base64Image,
        }),
      });

      const data = await response.json();
      setInsight(data.response || "No insight available.");
    } catch (error) {
      console.error("Error fetching insight:", error);
      setInsight("Failed to fetch insight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Material Consumption Analysis</h1>
      <FileUploader onDrop={onDrop} file={file} />
      {plotData.length > 0 && (
        <>
          {/* ===== Global Filters ===== */}
          <GlobalFilter
            plants={plants}
            selectedPlants={selectedPlants}
            setSelectedPlants={setSelectedPlants}
            sites={sites}
            selectedSites={selectedSites}
            setSelectedSites={setSelectedSites}
            vendors={vendors}
            selectedVendors={selectedVendors}
            setSelectedVendors={setSelectedVendors}
            dateRange={dateRange}
            setDateRange={setDateRange}
            minDate={minDate}
            maxDate={maxDate}
            topN={topN}
            setTopN={setTopN}
          />

          {/* ===== Chart Renders ===== */}
          <MaterialTotalTransaction
            chartId={TRANSACTIONS_CHART_ID}
            filteredTransactionData={filteredTransactionData}
            loading={loadingTransactionsInsight}
            insight={transactionsInsight}
            onAskGemini={() =>
              handleInterpret(TRANSACTIONS_CHART_ID, setLoadingTransactionsInsight, setTransactionsInsight)
            }
          />
          <OverallMaterialConsumption
            chartId={GOODS_RECEIPT_CHART_ID}
            filteredData={filteredData}
            loading={loadingMaterialConsumptionInsight}
            insight={MaterialConsumptionInsight}
            onAskGemini={() =>
              handleInterpret(GOODS_RECEIPT_CHART_ID, setLoadingMaterialConsumptionInsight, setMaterialConsumptionInsight)
            }
          />
          <MaterialsVariance
            chartId={VARIANCE_CHART_ID}
            varianceData={filteredVarianceData}
            loading={loadingVarianceInsight}
            insight={varianceInsight}
            onAskGemini={() =>
              handleInterpret(VARIANCE_CHART_ID, setLoadingVarianceInsight, setVarianceInsight)
            }
          />
          <FiniteShelf
            chartId={FINITE_SHELF_CHART_ID}
            shelfData={finiteShelfData}
            loading={loadingFiniteShelfInsight}
            insight={finiteShelfInsight}
            onAskGemini={() =>
              handleInterpret(FINITE_SHELF_CHART_ID, setLoadingFiniteShelfInsight, setFiniteShelfInsight)
            }
          />
          <InfiniteShelf shelfData={infiniteShelfData} />
          <MaterialLevelAnalysis
            chartId={MATERIAL_LEVEL_CHART_ID}
            materialData={plotData}
            loading={loadingMaterialAnalysisInsight}
            insight={materialAnalysisInsight}
            onAskGemini={() =>
              handleInterpret(MATERIAL_LEVEL_CHART_ID, setLoadingMaterialAnalysisInsight, setMaterialAnalysisInsight)
            }
          />
        </>
      )}
    </div>
  );
}
