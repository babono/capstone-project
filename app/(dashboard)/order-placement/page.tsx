// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import iconDT from "../../../public/ic-dt.svg"
import { GENERATE_RESULT_CAPTIONS, GOODS_RECEIPT_CHART_ID, MATERIAL_LEVEL_CHART_ID, ORDER_PLACEMENT_BUCKET_URL, PAGE_KEYS, PAGE_LABELS, TRANSACTIONS_CHART_ID, VARIANCE_CHART_ID } from "@/app/constants";
import FileUploader from "../common/file-uploader";
import MaterialsVariance from "../common/charts/materials-variance";
import OverallByMaterialNumber from "../common/charts/overall-by-material-number";
import TotalTransaction from "../common/charts/total-transaction";
import GlobalFilter from "../common/global-filter";
import MaterialLevelAnalysis from "./material-level-analysis/material-level-analysis";
import DownloadReport from "../common/download-report";
import GenerateResultCaption from "../common/generate-result-caption";
import ErrorBoundary from "../common/error-boundary";

export default function OrderPlacementPage() {
  return (
    <ErrorBoundary>
      <OrderPlacement />
    </ErrorBoundary>
  );
}

function OrderPlacement() {
  // NextAuth session
  const { data: session, status } = useSession()
  const router = useRouter()

  // State Variables
  const [plotData, setPlotData] = useState([]);
  const [topN, setTopN] = useState(10);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  const PAGE_LABEL = PAGE_LABELS.ORDER_PLACEMENT;

  // Other States
  const [plants, setPlants] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [vendors, setVendors] = useState([]);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleUploadComplete = async (data) => {
    setPlotData(data);

    // Extract unique values for filters
    const uniquePlants = [...new Set(data.map((item) => item["Plant"]))];
    const uniqueSuppliers = [...new Set(data.map((item) => item["Supplier"]))];
    const uniqueVendors = [...new Set(data.map((item) => item["Vendor Number"]))]; // Adjusted to use "Vendor Number"

    setPlants(uniquePlants);
    setSuppliers(uniqueSuppliers);
    setVendors(uniqueVendors);

    // Automatically select all plants, suppliers, and vendors
    setSelectedPlants(uniquePlants);
    setSelectedSuppliers(uniqueSuppliers);
    setSelectedVendors(uniqueVendors);

    // Extract date range from the data
    const dates = data.map((item) => new Date(item["Document Date"]));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    setMinDate(oldestDate);
    setMaxDate(newestDate);

    // Automatically set the date range to the full range
    setDateRange([oldestDate, newestDate]);
  };

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

  // Filter the plotData based on the selected filters
  const filteredPlotData = plotData.filter((item) => {
    const isPlantMatch = selectedPlants.length === 0 || selectedPlants.includes(item["Plant"]);
    const isSupplierMatch = selectedSuppliers.length === 0 || selectedSuppliers.includes(item["Supplier"]);
    const isVendorMatch = selectedVendors.length === 0 || selectedVendors.includes(item["Vendor Number"]);
    const isDateMatch =
      (!dateRange[0] || new Date(item["Document Date"]) >= dateRange[0]) &&
      (!dateRange[1] || new Date(item["Document Date"]) <= dateRange[1]);

    return isPlantMatch && isSupplierMatch && isVendorMatch && isDateMatch;
  });

  // Group and aggregate data by Material Number
  const aggregatedData = Object.values(
    filteredPlotData.reduce((acc, item) => {
      const materialNumber = item["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { "Material Number": materialNumber, "Order Quantity": 0 };
      }
      acc[materialNumber]["Order Quantity"] += item["Order Quantity"];
      return acc;
    }, {})
  );

  // Filter the top N materials based on the aggregated data
  const filteredData = aggregatedData
    .sort((a, b) => b["Order Quantity"] - a["Order Quantity"]) // Sort descending by Order Quantity
    .slice(0, topN !== "All" ? topN : aggregatedData.length); // Limit to top N or show all

  // Group and count the number of transactions per Material Number
  const transactionData = Object.values(
    filteredPlotData.reduce((acc, item) => {
      const materialNumber = item["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { "Material Number": materialNumber, "Transaction Count": 0 };
      }
      acc[materialNumber]["Transaction Count"] += 1; // Increment transaction count
      return acc;
    }, {})
  );

  // Filter the top N materials based on the transaction data
  const filteredTransactionData = transactionData
    .sort((a, b) => b["Transaction Count"] - a["Transaction Count"]) // Sort descending by Transaction Count
    .slice(0, topN !== "All" ? topN : transactionData.length); // Limit to top N or show all

  // Calculate variance for each material
  const varianceData = Object.values(
    filteredPlotData.reduce((acc, item) => {
      const materialNumber = item["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { "Material Number": materialNumber, values: [] };
      }
      acc[materialNumber].values.push(item["Order Quantity"]);
      return acc;
    }, {})
  ).map((material) => ({
    materialNumber: material["Material Number"],
    values: material.values,
  }));

  // Filter the variance data to align with the top N materials
  const filteredVarianceData = varianceData.filter((material) =>
    filteredData.some((topMaterial) => topMaterial["Material Number"] === material.materialNumber)
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{PAGE_LABEL} Analysis</h1>
      <FileUploader
        type={PAGE_KEYS.ORDER_PLACEMENT}
        title={PAGE_LABEL}
        fileBucketURL={ORDER_PLACEMENT_BUCKET_URL}
        onDataRetrieved={handleUploadComplete}
      />
      {plotData.length === 0 && (
        <GenerateResultCaption message={GENERATE_RESULT_CAPTIONS.NO_FILES_UPLOADED} />
      )}
      {plotData.length > 0 && (
        <>
          {/* ===== Global Filters ===== */}
          <GlobalFilter
            plants={plants}
            selectedPlants={selectedPlants}
            setSelectedPlants={setSelectedPlants}
            sites={[]}  // Intentionally left empty
            selectedSites={[]}  // Intentionally left empty
            setSelectedSites={() => { }}  // Intentionally left empty
            vendors={vendors}
            selectedVendors={selectedVendors}
            setSelectedVendors={setSelectedVendors}
            suppliers={suppliers}
            selectedSuppliers={selectedSuppliers}
            setSelectedSuppliers={setSelectedSuppliers}
            dateRange={dateRange}
            setDateRange={setDateRange}
            minDate={minDate}
            maxDate={maxDate}
            topN={topN}
            setTopN={setTopN}
          />
          <DownloadReport reportRefObj={reportRef} />
          {/* ===== Chart Renders ===== */}
          <div ref={reportRef}>
            <TotalTransaction
              chartId={TRANSACTIONS_CHART_ID}
              filteredTransactionData={filteredTransactionData}
            />
            <OverallByMaterialNumber
              customKey={PAGE_LABEL}
              chartId={GOODS_RECEIPT_CHART_ID}
              filteredData={filteredData}
              yAxisFieldName={"Order Quantity"}
            />
            <MaterialsVariance
              chartId={VARIANCE_CHART_ID}
              varianceData={filteredVarianceData}
            />
            <MaterialLevelAnalysis
              chartId={MATERIAL_LEVEL_CHART_ID}
              materialData={plotData}
            />
          </div>
        </>
      )}
    </div>
  );
}
