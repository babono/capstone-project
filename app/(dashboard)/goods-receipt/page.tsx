// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image";
import iconDT from "../../../public/ic-dt.svg";
import MaterialsVariance from "../common/charts/materials-variance";
import { GENERATE_RESULT_CAPTIONS, GOODS_RECEIPT_BUCKET_URL, GOODS_RECEIPT_CHART_ID, MATERIAL_LEVEL_CHART_ID, PAGE_KEYS, PAGE_LABELS, QUANTITY_BY_PLANT_CHART_ID, TRANSACTIONS_CHART_ID, VARIANCE_CHART_ID } from "@/app/constants";
import OverallByMaterialNumber from "../common/charts/overall-by-material-number";
import TotalTransaction from "../common/charts/total-transaction";
import GlobalFilter from "../common/global-filter";
import FileUploader from "../common/file-uploader";
import MaterialLevelAnalysis from "./material-level-analysis/material-level-analysis";
import DownloadReport from "../common/download-report";
import GenerateResultCaption from "../common/generate-result-caption";
import ErrorBoundary from "../common/error-boundary";

export default function GoodsReceiptPage() {
  return (
    <ErrorBoundary>
      <GoodsReceipt />
    </ErrorBoundary>
  );
}

function GoodsReceipt() {
  // NextAuth session
  const { data: session, status } = useSession()
  const router = useRouter()

  // State Variables
  const [plotData, setPlotData] = useState([]);
  const [topN, setTopN] = useState(10);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  const PAGE_LABEL = PAGE_LABELS.GOODS_RECEIPT;

  // Other States
  const [plants, setPlants] = useState([]);
  const [sites, setSites] = useState([]);
  const [vendors, setVendors] = useState([]);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleUploadComplete = async (data) => {
    setPlotData(data);

    // Extract unique values for filters
    const uniquePlants = [...new Set(data.map((item) => item["Plant"]))];
    const uniqueSites = [...new Set(data.map((item) => item["Site"]))];
    const uniqueVendors = [...new Set(data.map((item) => item["Vendor Number"]))];

    setPlants(uniquePlants);
    setSites(uniqueSites);
    setVendors(uniqueVendors);

    // Automatically select all plants, suppliers, and vendors
    setSelectedPlants(uniquePlants);
    setSelectedSites(uniqueSites);
    setSelectedVendors(uniqueVendors);

    // Extract date range from the data
    const dates = data.map((item) => new Date(item["Pstng Date"]));
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

  // Filter the variance data to align with the top N materials
  const filteredVarianceData = varianceData.filter((material) =>
    filteredData.some((topMaterial) => topMaterial["Material Number"] === material.materialNumber)
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{PAGE_LABEL} Analysis</h1>
      <FileUploader
        type={PAGE_KEYS.GOODS_RECEIPT}
        title={PAGE_LABEL}
        fileBucketURL={GOODS_RECEIPT_BUCKET_URL}
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
            sites={sites}
            selectedSites={selectedSites}
            setSelectedSites={setSelectedSites}
            vendors={vendors}
            selectedVendors={selectedVendors}
            setSelectedVendors={setSelectedVendors}
            suppliers={[]}  // Intentionally left empty
            selectedSuppliers={[]} // Intentionally left empty
            setSelectedSuppliers={() => { }}  // Intentionally left empty
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
              yAxisFieldName={"Quantity"}
            />
            <MaterialsVariance
              chartId={VARIANCE_CHART_ID}
              varianceData={filteredVarianceData}
            />
            <MaterialLevelAnalysis
              chartId={MATERIAL_LEVEL_CHART_ID}
              chartIdQuantity={QUANTITY_BY_PLANT_CHART_ID}
              materialData={plotData}
            />
          </div>
        </>
      )}
    </div>
  );
}
