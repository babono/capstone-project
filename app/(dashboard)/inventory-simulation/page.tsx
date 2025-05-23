// @ts-nocheck
"use client";
import { useSession } from "next-auth/react";
import ErrorBoundary from "../common/error-boundary";
import { useRouter } from "next/navigation";
import { GENERATE_RESULT_CAPTIONS, PAGE_LABELS } from "@/app/constants";
import { useEffect, useState } from "react";
import FileUploaderSection from "./file-uploader-section";
import GenerateResultCaption from "../common/generate-result-caption";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

export default function InventorySimulationPage() {
  return (
    <ErrorBoundary>
      <InventorySimulation />
    </ErrorBoundary>
  );
}

function InventorySimulation() {
  // NextAuth session
  const { data: session, status } = useSession();
  const router = useRouter();
  const PAGE_LABEL = PAGE_LABELS.INVENTORY_SIMULATION;

  // State Variables
  const [materialConsumptionData, setMaterialConsumptionData] = useState([]);
  const [orderPlacementData, setOrderPlacementData] = useState([]);
  const [goodsReceiptData, setGoodsReceiptData] = useState([]);
  const [shortageReportData, setShortageReportData] = useState([]);
  const [simulationResults, setSimulationResults] = useState(null);

  // Filtered Data
  const [filteredConsumption, setFilteredConsumption] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [filteredShortage, setFilteredShortage] = useState([]);

  // Simulation Parameters
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [initialInventory, setInitialInventory] = useState(50);
  const [reorderPoint, setReorderPoint] = useState(100);
  const [orderQuantity, setOrderQuantity] = useState(50);
  const [leadTime, setLeadTime] = useState(2);
  const [leadTimeStdDev, setLeadTimeStdDev] = useState(0.5);
  const [demandSurgeWeeks, setDemandSurgeWeeks] = useState([]);
  const [demandSurgeFactor, setDemandSurgeFactor] = useState(2.0);
  const [numWeeks, setNumWeeks] = useState(52);

  // State fir storing the filter data

  // Data Filter Handling

  // Plotly Chart States

  // Other States

  // Colors

  // Others

  const preprocess_data_consumption = (data) => {
    // TODO: Complete this
    return data;
  };

  const preprocess_data_GR = (data) => {
    // TODO: Complete this
    return data;
  };

  const preprocess_data_OP = (data) => {
    // TODO: Complete this
    return data;
  };

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/login");
  }, [session, status, router]);

  // Functions for Handling Uploaded Data
  const handleConsumptionData = (data) => {
    const processedData = preprocess_data_consumption(data);
    setMaterialConsumptionData(processedData);
  };

  const handleGoodsReceiptData = (data) => {
    const processedData = preprocess_data_GR(data);
    setGoodsReceiptData(processedData);
  };

  const handleOrderPlacementData = (data) => {
    const processedData = preprocess_data_OP(data);
    setOrderPlacementData(processedData);
  };

  const handleShortageData = (data) => {
    setShortageReportData(data);
  };

  // Filter Data Based on Selected Material, Plant, and Site
  useEffect(() => {
    if (selectedMaterial && selectedPlant && selectedSite) {
      setFilteredConsumption(
        materialConsumptionData.filter(
          (row) =>
            row["Material Number"] === selectedMaterial &&
            row["Plant"] === selectedPlant &&
            row["Site"] === selectedSite
        )
      );
      setFilteredOrders(
        orderPlacementData.filter(
          (row) =>
            row["Material Number"] === selectedMaterial &&
            row["Plant"] === selectedPlant
        )
      );
      setFilteredReceipts(
        goodsReceiptData.filter(
          (row) =>
            row["Material Number"] === selectedMaterial &&
            row["Plant"] === selectedPlant &&
            row["Site"] === selectedSite
        )
      );
      setFilteredShortage(
        shortageReportData.filter(
          (row) =>
            row["Material Number"] === selectedMaterial &&
            row["Plant"] === selectedPlant &&
            row["Site"] === selectedSite
        )
      );
    }
  }, [
    selectedMaterial,
    selectedPlant,
    selectedSite,
    materialConsumptionData,
    orderPlacementData,
    goodsReceiptData,
    shortageReportData,
  ]);

  const runSimulation = () => {
    // TODO: Complete this
  };

  console.log(materialConsumptionData);

  const isUploadFilesIncomplete =
    materialConsumptionData.length === 0 ||
    goodsReceiptData.length === 0 ||
    orderPlacementData.length === 0 ||
    shortageReportData.length === 0;
  const isUploadFilesComplete =
    materialConsumptionData.length > 0 &&
    goodsReceiptData.length > 0 &&
    orderPlacementData.length > 0 &&
    shortageReportData.length > 0;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{PAGE_LABEL} Analysis</h1>
      <FileUploaderSection
        handleMaterialConsumptionData={handleConsumptionData}
        handleGoodsReceiptData={handleGoodsReceiptData}
        handleOrderPlacementData={handleOrderPlacementData}
        handleShortageReportData={handleShortageData}
      />
      {isUploadFilesIncomplete && (
        <GenerateResultCaption
          message={GENERATE_RESULT_CAPTIONS.NO_FILES_UPLOADED}
        />
      )}
      {isUploadFilesIncomplete && (
        <div>
          <Grid container spacing={2} sx={{ marginBottom: "16px" }}>

            {/* Material Selection */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="material-select-label">Select Material</InputLabel>
                <Select
                  label="Select Material"
                  labelId="material-select-label"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select Material</em>
                  </MenuItem>
                  {Array.from(
                    new Set(
                      materialConsumptionData.map(
                        (row) => row["Material Number"]
                      )
                    )
                  ).map((material) => (
                    <MenuItem key={material} value={material}>
                      {material}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Plant Selection */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="plant-select-label">Select Plant</InputLabel>
                <Select
                  label="Select Plant"
                  labelId="plant-select-label"
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select Plant</em>
                  </MenuItem>
                  {Array.from(
                    new Set(materialConsumptionData.map((row) => row["Plant"]))
                  ).map((plant) => (
                    <MenuItem key={plant} value={plant}>
                      {plant}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Site Selection */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="site-select-label">Select Site</InputLabel>
                <Select
                  label="Select Site"
                  labelId="site-select-label"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select Site</em>
                  </MenuItem>
                  {Array.from(
                    new Set(materialConsumptionData.map((row) => row["Site"]))
                  ).map((site) => (
                    <MenuItem key={site} value={site}>
                      {site}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
            {/* Initial Inventory */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Initial Inventory"
                type="number"
                value={initialInventory}
                onChange={(e) => setInitialInventory(Number(e.target.value))}
                fullWidth
              />
            </Grid>

            {/* Reorder Point */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Reorder Point"
                type="number"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(Number(e.target.value))}
                fullWidth
              />
            </Grid>

            {/* Order Quantity */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Order Quantity"
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
            {/* Lead Time */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Lead Time (weeks)"
                type="number"
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                fullWidth
              />
            </Grid>

            {/* Lead Time Std Dev */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Lead Time Std Dev"
                type="number"
                value={leadTimeStdDev}
                onChange={(e) => setLeadTimeStdDev(Number(e.target.value))}
                fullWidth
              />
            </Grid>
          </Grid>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => console.log("Run Simulation")}
          >
            Run Simulation
          </button>
        </div>
      )}
    </div>
  );
}
