// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Autocomplete from "@mui/material/Autocomplete";
import TypeIt from "typeit-react";
import html2canvas from "html2canvas"; // For capturing chart snapshots
import ReactMarkdown from "react-markdown"; // Import react-markdown

// Handle dynamic import for Plotly JS for Next.js
const Plot = dynamic(
  () =>
    import("react-plotly.js").then(
      (mod) =>
        mod.default as React.ComponentType<{
          data: any;
          layout: any;
          frames: any;
          config: any;
        }>
    ),
  { ssr: false }
);

export default function OrderPlacement() {
  const [file, setFile] = useState(null);
  const [plotData, setPlotData] = useState([]); // State to store API response
  const [topN, setTopN] = useState(10); // State to store the number of top materials to display
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]); // State for selected date range
  const [minDate, setMinDate] = useState(null); // Oldest date in the data
  const [maxDate, setMaxDate] = useState(null); // Newest date in the data

  const [plants, setPlants] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [insight, setInsight] = useState(""); // State to store the insight
  const [loadingInsight, setLoadingInsight] = useState(false); // State to show loading

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://127.0.0.1:8000/api/py/uploadExcel", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setPlotData(data); // Store the API response in state
    console.log(data);

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

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      handleUpload(selectedFile); // Automatically upload the file
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls", // Accept only Excel files
    multiple: false, // Allow only one file
  });

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

  const handleInterpret = async (chartId) => {
    setLoadingInsight(true);
    setInsight(""); // Clear previous insight

    try {
      // Get the Plotly chart element
      const chartElement = document.getElementById(chartId);

      if (!chartElement) {
        throw new Error("Chart element not found");
      }

      // Use Plotly's toImage function to generate a static image
      const imageData = await window.Plotly.toImage(chartElement, {
        format: "png", // Image format (e.g., png, jpeg)
        width: 800,    // Image width
        height: 600,   // Image height
      });

      // Convert imageData (data URL) to base64
      const base64Image = imageData.split(",")[1]; // Remove the data URL prefix
      console.log(base64Image);

      // Send request to Google Gemini API
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
      console.log(data);

      setInsight(data.response || "No insight available.");
    } catch (error) {
      console.error("Error fetching insight:", error);
      setInsight("Failed to fetch insight. Please try again.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order Placement</h1>      

      {/* Dropzone for file upload */}
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #1976d2",
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
            Drag and drop the Order Placement Excel file here to start the analysis, or click to select a file
          </Typography>
        )}
        {file && (
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: "8px" }}>
            Selected file: {file.name}
          </Typography>
        )}
      </Box>

      {plotData.length > 0 && (
        <>
          {/* Filters */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Global Filters</h2>

            {/* Plants Filter */}
            <Autocomplete
              multiple
              options={plants}
              value={selectedPlants}
              onChange={(event, newValue) => setSelectedPlants(newValue)}
              renderInput={(params) => <TextField {...params} label="Select Plants" variant="outlined" />}
              sx={{ marginBottom: "16px", width: "100%" }}
            />

            {/* Suppliers Filter */}
            <Autocomplete
              multiple
              options={suppliers}
              value={selectedSuppliers}
              onChange={(event, newValue) => setSelectedSuppliers(newValue)}
              renderInput={(params) => <TextField {...params} label="Select Suppliers" variant="outlined" />}
              sx={{ marginBottom: "16px", width: "100%" }}
            />

            {/* Vendors Filter */}
            <Autocomplete
              multiple
              options={vendors}
              value={selectedVendors}
              onChange={(event, newValue) => setSelectedVendors(newValue)}
              renderInput={(params) => <TextField {...params} label="Select Vendors" variant="outlined" />}
              sx={{ marginBottom: "16px", width: "100%" }}
            />

            {/* Date Range Filter */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateRangePicker
                startText="Start Date"
                endText="End Date"
                value={dateRange}
                onChange={(newValue) => setDateRange(newValue)}
                minDate={minDate} // Disable dates before the oldest date
                maxDate={maxDate} // Disable dates after the newest date
                renderInput={(startProps, endProps) => (
                  <>
                    <TextField {...startProps} sx={{ marginRight: "16px", width: "50%" }} />
                    <TextField {...endProps} sx={{ width: "50%" }} />
                  </>
                )}
              />
            </LocalizationProvider>
          </div>
          <div className="mt-4">
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="topN-label">Select Top N Materials</InputLabel>
              <Select
                labelId="topN-label"
                id="topN"
                value={topN}
                onChange={(e) => setTopN(e.target.value === "All" ? "All" : parseInt(e.target.value))}
                label="Select Top N Materials"
              >
                <MenuItem value={5}>Top 5</MenuItem>
                <MenuItem value={10}>Top 10</MenuItem>
                <MenuItem value={15}>Top 15</MenuItem>
                <MenuItem value="All">All</MenuItem>
              </Select>
            </FormControl>
          </div>

          <h2 className="mt-6 text-xl font-semibold">Number of Transactions per Material Number</h2>
          <div>
            <Plot
              divId="transactions-chart"
              data={[
                {
                  x: filteredTransactionData.map((item) => item["Material Number"]),
                  y: filteredTransactionData.map((item) => item["Transaction Count"]),
                  type: "bar",
                  marker: { color: "blue" },
                  text: filteredTransactionData.map(
                    (item) =>
                      `Material Number: ${item["Material Number"]}<br>Transaction Count: ${item["Transaction Count"]}`
                  ),
                  hoverinfo: "text",
                  textposition: "none",
                },
              ]}
              layout={{
                xaxis: {
                  title: { text: "Material Number", font: { color: "black" } },
                  automargin: true,
                },
                yaxis: {
                  title: { text: "Transaction Count", font: { color: "black" } },
                  automargin: true,
                },
                showlegend: false,
                autosize: true,
              }}
              style={{ width: "100%", height: "100%" }}
              config={{
                displayModeBar: false,
              }}
            />
          </div>
          <button
            onClick={() => handleInterpret("transactions-chart")}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 transition"
          >
            Interpret
          </button>

          <h2 className="mt-6 text-xl font-semibold">Overall Order Placement by Material Number</h2>
          <div id="order-placement-chart">
            <Plot
              data={[
                {
                  x: filteredData.map((item) => item["Material Number"]),
                  y: filteredData.map((item) => item["Order Quantity"]),
                  type: "bar",
                  marker: { color: "blue" },
                  text: filteredData.map(
                    (item) =>
                      `Material Number: ${item["Material Number"]}<br>Order Quantity: ${item["Order Quantity"]}`
                  ),
                  hoverinfo: "text",
                  textposition: "none",
                },
              ]}
              layout={{
                xaxis: {
                  title: { text: "Material Number", font: { color: "black" } },
                  automargin: true,
                },
                yaxis: {
                  title: { text: "Order Quantity", font: { color: "black" } },
                  automargin: true,
                },
                showlegend: false,
                autosize: true,
              }}
              style={{ width: "100%", height: "100%" }}
              config={{
                displayModeBar: false,
              }}
            />
          </div>
          <button
            onClick={() => handleInterpret("order-placement-chart")}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 transition"
          >
            Interpret
          </button>

          <h2 className="mt-6 text-xl font-semibold">Materials by Variance</h2>
          <div id="variance-chart">
            <Plot
              data={filteredVarianceData.map((material) => ({
                y: material.values,
                name: material.materialNumber,
                type: "box",
                marker: { color: "blue" }
              }))}
              layout={{
                xaxis: {
                  title: { text: "Material Number", font: { color: "black" } },
                  automargin: true,
                },
                yaxis: {
                  title: { text: "Order Quantity", font: { color: "black" } },
                  automargin: true,
                },
                showlegend: false,
                autosize: true,
              }}
              style={{ width: "100%", height: "100%" }}
              config={{
                displayModeBar: false,
              }}
            />
          </div>
          <button
            onClick={() => handleInterpret("variance-chart")}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 transition"
          >
            Interpret
          </button>

          {/* Insight Display */}
          {loadingInsight && <p className="mt-4 text-gray-600">Fetching insight...</p>}
          {insight && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-black">Generated Insight</h3>
              <TypeIt options={{ speed: 50 }}>
                <ReactMarkdown>{insight}</ReactMarkdown>
              </TypeIt>
            </div>
          )}
        </>
      )}
    </div>
  );
}