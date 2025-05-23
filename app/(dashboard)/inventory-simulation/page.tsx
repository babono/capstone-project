// @ts-nocheck
"use client";
import { useSession } from "next-auth/react";
import ErrorBoundary from "../common/error-boundary";
import { useRouter } from "next/navigation";
import { GENERATE_RESULT_CAPTIONS, PAGE_LABELS } from "@/app/constants";
import { useEffect, useState } from "react";
import FileUploaderSection from "./file-uploader-section";
import GenerateResultCaption from "../common/generate-result-caption";
import FilterSection from "./filter-section";

export default function InventorySimulationPage() {
  return (
    <ErrorBoundary>
      <InventorySimulation />
    </ErrorBoundary>
  );
}

function InventorySimulation() {
  // === NextAuth session ===
  const { data: session, status } = useSession();
  const router = useRouter();
  const PAGE_LABEL = PAGE_LABELS.INVENTORY_SIMULATION;

  // === State Variables ===
  const [materialConsumptionData, setMaterialConsumptionData] = useState([]);
  const [orderPlacementData, setOrderPlacementData] = useState([]);
  const [goodsReceiptData, setGoodsReceiptData] = useState([]);
  const [shortageReportData, setShortageReportData] = useState([]);

  // === Filtered Data ===
  const [filteredConsumption, setFilteredConsumption] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [filteredShortage, setFilteredShortage] = useState([]);

  // === States for Simulation ===

  // 1st Row
  const [uniqueMaterials, setUniqueMaterials] = useState([]);
  const [uniquePlants, setUniquePlants] = useState([]);
  const [uniqueSites, setUniqueSites] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedSite, setSelectedSite] = useState("");

  // 2nd Row
  const [numWeeks, setNumWeeks] = useState(52);
  const [leadTime, setLeadTime] = useState(6);
  const [leadTimeStdDev, setLeadTimeStdDev] = useState(0);

  // 3rd Row
  const [initialInventory, setInitialInventory] = useState(50);
  const [demandSurgeWeeks, setDemandSurgeWeeks] = useState([]);
  const [demandSurgeWeekOptions, setDemandSurgeWeekOptions] = useState([]);
  const [demandSurgeFactor, setDemandSurgeFactor] = useState(2);

  // 4th Row
  const [consumptionType, setConsumptionType] = useState("Fixed");
  const [fixedConsumptionValue, setFixedConsumptionValue] = useState(10);
  const [minOrderQuantity, setMinOrderQuantity] = useState(50);
  const [numMonteCarloSimulations, setNumMonteCarloSimulations] = useState(1);

  // 5th Row
  const [desiredServiceLevel, setDesiredServiceLevel] = useState(95);
  const [orderQuantityType, setOrderQuantityType] = useState("Fixed");
  const [orderQuantity, setOrderQuantity] = useState(50);
  const [reorderPoint, setReorderPoint] = useState(60);

  // Data Filter Handling

  // Plotly Chart States

  // Other States

  // Colors

  // Others

  // === Preprocessing Functions ===

  const preprocess_data_consumption = (data) => {
    // Step 1: Trim column names
    const trimmedData = data.map((row) => {
      const trimmedRow = {};
      Object.keys(row).forEach((key) => {
        trimmedRow[key.trim()] = row[key];
      });
      return trimmedRow;
    });

    // Step 2: Convert 'Pstng Date' to a Date object
    const validData = trimmedData.filter((row) => {
      row["Pstng Date"] = new Date(row["Pstng Date"]);
      return !isNaN(row["Pstng Date"]);
    });

    // Step 3: Extract the week number of the year
    validData.forEach((row) => {
      const date = row["Pstng Date"];
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      row["Week"] = Math.ceil(
        (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
      );
    });

    // Step 4: Group by Material Number, Plant, Site, and Week, then sum the Quantity
    const groupedData = {};
    validData.forEach((row) => {
      const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}_${row["Week"]}`;
      if (!groupedData[key]) {
        groupedData[key] = { ...row, Quantity: 0 };
      }
      groupedData[key].Quantity += Math.abs(row["Quantity"]);
    });

    // Step 5: Pivot the data to get quantities per week as columns
    const pivotData = {};
    Object.values(groupedData).forEach((row) => {
      const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}`;
      if (!pivotData[key]) {
        pivotData[key] = {
          "Material Number": row["Material Number"],
          Plant: row["Plant"],
          Site: row["Site"],
          BUn: row["BUn"],
        };
      }
      pivotData[key][`WW${row["Week"]}_Consumption`] = row["Quantity"];
    });

    // Convert pivotData to an array and fill missing values with 0
    return Object.values(pivotData).map((row) => {
      Object.keys(row).forEach((key) => {
        if (key.startsWith("WW") && row[key] === undefined) {
          row[key] = 0;
        }
      });
      return row;
    });
  };

  const preprocess_data_GR = (data) => {
    // TODO: Complete this
    return data;
  };

  const preprocess_data_OP = (data) => {
    // TODO: Complete this
    return data;
  };

  // === Functions for Handling Uploaded Data ===

  // Handle Consumption Data Upload
  const handleConsumptionData = (data) => {
    const processedData = preprocess_data_consumption(data);
    setMaterialConsumptionData(processedData);

    // Extract unique values for Material, Plant, and Site
    const materials = Array.from(
      new Set(processedData.map((row) => row["Material Number"]))
    );
    const plants = Array.from(
      new Set(processedData.map((row) => row["Plant"]))
    );
    const sites = Array.from(new Set(processedData.map((row) => row["Site"])));

    setUniqueMaterials(materials);
    setUniquePlants(plants);
    setUniqueSites(sites);

    // Set default values to the first available option
    if (materials.length > 0) setSelectedMaterial(materials[0]);
    if (plants.length > 0) setSelectedPlant(plants[0]);
    if (sites.length > 0) setSelectedSite(sites[0]);
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

  // Others

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/login");
  }, [session, status, router]);

  const isUploadFilesIncomplete =
    materialConsumptionData.length === 0 ||
    goodsReceiptData.length === 0 ||
    orderPlacementData.length === 0 ||
    shortageReportData.length === 0;

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
      {!isUploadFilesIncomplete && (
        <FilterSection
          materialConsumptionData={materialConsumptionData}
          demandSurgeWeekOptions={demandSurgeWeekOptions}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          selectedPlant={selectedPlant}
          setSelectedPlant={setSelectedPlant}
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
          numWeeks={numWeeks}
          setNumWeeks={setNumWeeks}
          leadTime={leadTime}
          setLeadTime={setLeadTime}
          leadTimeStdDev={leadTimeStdDev}
          setLeadTimeStdDev={setLeadTimeStdDev}
          initialInventory={initialInventory}
          setInitialInventory={setInitialInventory}
          demandSurgeWeeks={demandSurgeWeeks}
          setDemandSurgeWeeks={setDemandSurgeWeeks}
          demandSurgeFactor={demandSurgeFactor}
          setDemandSurgeFactor={setDemandSurgeFactor}
          consumptionType={consumptionType}
          setConsumptionType={setConsumptionType}
          fixedConsumptionValue={fixedConsumptionValue}
          setFixedConsumptionValue={setFixedConsumptionValue}
          minOrderQuantity={minOrderQuantity}
          setMinOrderQuantity={setMinOrderQuantity}
          numMonteCarloSimulations={numMonteCarloSimulations}
          setNumMonteCarloSimulations={setNumMonteCarloSimulations}
          desiredServiceLevel={desiredServiceLevel}
          setDesiredServiceLevel={setDesiredServiceLevel}
          orderQuantityType={orderQuantityType}
          setOrderQuantityType={setOrderQuantityType}
          orderQuantity={orderQuantity}
          setOrderQuantity={setOrderQuantity}
          reorderPoint={reorderPoint}
          setReorderPoint={setReorderPoint}
        />
      )}
    </div>
  );
}
