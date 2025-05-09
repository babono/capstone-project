import React, { useState, useMemo, useEffect } from "react";
import { Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, startOfWeek, startOfMonth, startOfQuarter } from "date-fns";
import { Plot } from "@/app/constants";
import AskGeminiButton from "../../common/ask-gemini";

type MaterialLevelAnalysisProps = {
  materialData: any[];
  chartId: string;
};

const MaterialLevelAnalysis: React.FC<MaterialLevelAnalysisProps> = ({
  materialData,
  chartId,
}) => {
  // States for filters and selections
  const [plants, setPlants] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [minDate, setMinDate] = useState<Date | undefined>();
  const [maxDate, setMaxDate] = useState<Date | undefined>();
  const [selectedMaterialNum, setSelectedMaterial] = useState<string | null>(null);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [aggregationLevel, setAggregationLevel] = useState<string>("Daily");

  // Helper function to update filters based on material
  const updateFilters = (filteredData: any[]) => {
    const uniquePlants = [...new Set(filteredData.map((item) => item["Plant"]))];
    const uniqueSuppliers = [...new Set(filteredData.map((item) => item["Supplier"] || "Unknown"))];
    const uniqueVendors = [...new Set(filteredData.map((item) => item["Vendor Number"] || "Unknown"))];

    setPlants(uniquePlants);
    setSuppliers(uniqueSuppliers);
    setVendors(uniqueVendors);

    setSelectedPlants(uniquePlants);
    setSelectedSuppliers(uniqueSuppliers);
    setSelectedVendors(uniqueVendors);

    const timestamps = filteredData.map((item) => new Date(item["Document Date"]).getTime());
    const oldestDate = new Date(Math.min(...timestamps));
    const newestDate = new Date(Math.max(...timestamps));

    setMinDate(oldestDate);
    setMaxDate(newestDate);
    setDateRange([oldestDate, newestDate]);
  };

  // Automatically set the first material number and adjust filters
  useEffect(() => {
    if (materialData.length > 0) {
      const firstMaterial = materialData[0]["Material Number"];
      setSelectedMaterial(firstMaterial);
      const filteredData = materialData.filter((item) => item["Material Number"] === firstMaterial);
      updateFilters(filteredData);
    }
  }, [materialData]);

  // Adjust filters dynamically when the material number changes
  useEffect(() => {
    if (selectedMaterialNum) {
      const filteredData = materialData.filter((item) => item["Material Number"] === selectedMaterialNum);
      updateFilters(filteredData);
    }
  }, [selectedMaterialNum, materialData]);

  // Filtered data based on selected material and filters
  const filteredData = useMemo(() => {
    let filtered = materialData;
    const startDate = dateRange[0];
    const endDate = dateRange[1];

    if (selectedMaterialNum) {
      filtered = filtered.filter((item) => item["Material Number"] === selectedMaterialNum);
    }

    if (selectedPlants.length > 0) {
      filtered = filtered.filter((item) => selectedPlants.includes(item["Plant"]));
    }

    if (selectedSuppliers.length > 0) {
      filtered = filtered.filter((item) => selectedSuppliers.includes(item["Supplier"] || "Unknown"));
    }

    if (selectedVendors.length > 0) {
      filtered = filtered.filter((item) => selectedVendors.includes(item["Vendor Number"] || "Unknown"));
    }

    if (startDate && endDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item["Document Date"]) >= startDate! &&
          new Date(item["Document Date"]) <= endDate!
      );
    }

    return filtered;
  }, [materialData, selectedMaterialNum, selectedPlants, selectedSuppliers, selectedVendors, dateRange]);

  // Aggregated data for visualization
  const aggregatedData = useMemo(() => {
    const groupedData: { [key: string]: { Quantity: number; TransactionCount: number } } = {};

    const dateSet = new Set<string>();
    const dateCursor = dateRange[0] ? new Date(dateRange[0]) : null;
    const endDate = dateRange[1] ? new Date(dateRange[1]) : null;

    // Generate all expected date keys (e.g., every day/month/etc)
    const allKeys: string[] = [];
    while (dateCursor && endDate && dateCursor <= endDate) {
      let key = "";

      if (aggregationLevel === "Daily") {
        key = format(dateCursor, "yyyy-MM-dd");
        dateCursor.setDate(dateCursor.getDate() + 1);
      } else if (aggregationLevel === "Weekly") {
        key = format(startOfWeek(dateCursor), "yyyy-MM-dd");
        dateCursor.setDate(dateCursor.getDate() + 7);
      } else if (aggregationLevel === "Monthly") {
        key = format(startOfMonth(dateCursor), "yyyy-MM");
        dateCursor.setMonth(dateCursor.getMonth() + 1);
      } else if (aggregationLevel === "Quarterly") {
        key = format(startOfQuarter(dateCursor), "yyyy-'Q'Q");
        dateCursor.setMonth(dateCursor.getMonth() + 3);
      }

      if (!dateSet.has(key)) {
        dateSet.add(key);
        allKeys.push(key);
      }
    }

    // Aggregate actual data
    filteredData.forEach((item) => {
      const date = new Date(item["Document Date"]);
      let key = "";

      if (aggregationLevel === "Daily") key = format(date, "yyyy-MM-dd");
      else if (aggregationLevel === "Weekly") key = format(startOfWeek(date), "yyyy-MM-dd");
      else if (aggregationLevel === "Monthly") key = format(startOfMonth(date), "yyyy-MM");
      else if (aggregationLevel === "Quarterly") key = format(startOfQuarter(date), "yyyy-'Q'Q");

      if (!groupedData[key]) {
        groupedData[key] = { Quantity: 0, TransactionCount: 0 };
      }

      groupedData[key].Quantity += item["Order Quantity"];
      groupedData[key].TransactionCount += 1;
    });

    // Fill missing keys with zeros
    return allKeys.map((key) => ({
      date: key,
      Quantity: groupedData[key]?.Quantity || 0,
      TransactionCount: groupedData[key]?.TransactionCount || 0,
    }));
  }, [filteredData, aggregationLevel, dateRange]);

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">Material-Level Analysis</h1>

      {/* Material Selection */}
      <FormControl fullWidth sx={{ marginBottom: "16px" }}>
        <InputLabel id="material-select-label">Select a Material Number</InputLabel>
        <Select
          labelId="material-select-label"
          value={selectedMaterialNum || ""}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          label="Select a Material Number"
        >
          {Array.from(new Set(materialData.map((item) => item["Material Number"]))).map((material) => (
            <MenuItem key={material} value={material}>
              {material}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <div className="mb-6">
        <Autocomplete
          multiple
          options={plants}
          value={selectedPlants}
          onChange={(event, newValue) => setSelectedPlants(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Plants" variant="outlined" />}
          sx={{ marginBottom: "16px", width: "100%" }}
        />
        <Autocomplete
          multiple
          options={suppliers}
          value={selectedSuppliers}
          onChange={(event, newValue) => setSelectedSuppliers(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Suppliers" variant="outlined" />}
          sx={{ marginBottom: "16px", width: "100%" }}
        />
        <Autocomplete
          multiple
          options={vendors}
          value={selectedVendors}
          onChange={(event, newValue) => setSelectedVendors(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Vendors" variant="outlined" />}
          sx={{ marginBottom: "16px", width: "100%" }}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            value={dateRange}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(newValue) => setDateRange(newValue)}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { marginBottom: "16px" },
              },
            }}
            format="yyyy/MM/dd"
          />
        </LocalizationProvider>
      </div>

      {/* Aggregation Level */}
      <FormControl fullWidth sx={{ marginBottom: "16px" }}>
        <InputLabel id="aggregation-level-label">Aggregation Level</InputLabel>
        <Select
          labelId="aggregation-level-label"
          value={aggregationLevel}
          onChange={(e) => setAggregationLevel(e.target.value)}
          label="Aggregation Level"
        >
          <MenuItem value="Daily">Daily</MenuItem>
          <MenuItem value="Weekly">Weekly</MenuItem>
          <MenuItem value="Monthly">Monthly</MenuItem>
          <MenuItem value="Quarterly">Quarterly</MenuItem>
        </Select>
      </FormControl>

      {/* Visualization */}
      <p className="text-l font-semibold">
        {`Order Placement Trend and Transaction Count (${aggregationLevel}) for ${selectedMaterialNum}`}
      </p>
      <Plot
        divId={chartId}
        data={[
          {
            x: aggregatedData.map((item) => item.date),
            y: aggregatedData.map((item) => item.Quantity),
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "blue" },
            name: "Order Quantity",
          },
          {
            x: aggregatedData.map((item) => item.date),
            y: aggregatedData.map((item) => item.TransactionCount),
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "#8880FA" },
            name: "Transaction Count",
            yaxis: "y2",
          },
        ]}
        layout={{
          xaxis: { title: "Date" },
          yaxis: { title: "Order Quantity" },
          yaxis2: {
            title: "Transaction Count",
            overlaying: "y",
            side: "right",
          },
          hoverlabel: {
            align: "left",
          },
        }}
        style={{ width: "100%", height: "100%" }}
      />
      <AskGeminiButton chartId={chartId} />
    </div>
  );
};

export default MaterialLevelAnalysis;
