import React, { useState, useMemo, useEffect } from "react";
import { Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Plot } from "@/app/constants/plot";
import { ChartProps } from "@/app/types/materialConsumption";
import AskGeminiButton from "../common/ask-gemini";

type MaterialLevelAnalysisProps = ChartProps & {
  materialData: any[];
  materialColumn: string;
};

const MaterialLevelAnalysis: React.FC<MaterialLevelAnalysisProps> = ({
  materialData,
  materialColumn = "Material Number",
  chartId,
  loading,
  insight,
  onAskGemini
}) => {
  // States for Storing Unique Data
  const [plants, setPlants] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);

  // State variables for filters and selections
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [aggregationLevel, setAggregationLevel] = useState<string>("Daily");

  // Filtered data based on selected material and filters
  const filteredData = useMemo(() => {
    let filtered = materialData;

    if (selectedMaterial) {
      filtered = filtered.filter((item) => item["Material Number"] === selectedMaterial);
    }

    if (selectedPlants.length > 0) {
      filtered = filtered.filter((item) => selectedPlants.includes(item["Plant"]));
    }

    if (selectedSites.length > 0) {
      filtered = filtered.filter((item) => selectedSites.includes(item["Site"]));
    }

    if (selectedVendors.length > 0) {
      filtered = filtered.filter((item) => selectedVendors.includes(item["Vendor Number"]));
    }

    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(
        (item) =>
          new Date(item["Pstng Date"]) >= dateRange[0]! &&
          new Date(item["Pstng Date"]) <= dateRange[1]!
      );
    }

    return filtered;
  }, [materialData, selectedMaterial, selectedPlants, selectedSites, selectedVendors, dateRange]);

  // Aggregated data for visualization
  const aggregatedData = useMemo(() => {
    const groupedData: { [key: string]: { Quantity: number; TransactionCount: number } } = {};

    filteredData.forEach((item) => {
      const dateKey = new Date(item["Pstng Date"]).toISOString().split("T")[0]; // Group by date
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { Quantity: 0, TransactionCount: 0 };
      }
      groupedData[dateKey].Quantity += item["Quantity"];
      groupedData[dateKey].TransactionCount += 1;
    });

    const sortedData = Object.entries(groupedData)
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedData;
  }, [filteredData]);

  useEffect(() => {
    // Setting up the filters. Need to be specific to the selected materials
    if (materialData.length > 0) {
      const uniquePlants = [...new Set(materialData.map((item) => item["Plant"]))];
      const uniqueSites = [...new Set(materialData.map((item) => item["Site"]))];
      const uniqueVendors = [...new Set(materialData.map((item) => item["Vendor Number"]))];

      setPlants(uniquePlants);
      setSites(uniqueSites);
      setVendors(uniqueVendors);

      setSelectedPlants(uniquePlants);
      setSelectedSites(uniqueSites);
      setSelectedVendors(uniqueVendors);

      const timestamps = materialData.map((item) => new Date(item["Pstng Date"]).getTime());
      const oldestDate = new Date(Math.min(...timestamps));
      const newestDate = new Date(Math.max(...timestamps));

      setMinDate(oldestDate);
      setMaxDate(newestDate);
      setDateRange([oldestDate, newestDate]);
    }
  }, [materialData]);

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">Material-Level Analysis</h1>

      {/* Material Selection */}
      <FormControl fullWidth sx={{ marginBottom: "16px" }}>
        <InputLabel id="material-select-label">Select a Material Number</InputLabel>
        <Select
          labelId="material-select-label"
          value={selectedMaterial || ""}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          label="Select a Material Number"
          variant="outlined"
        >
          {Array.from(new Set(materialData.map((item) => item[materialColumn]))).map((material) => (
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
          options={sites}
          value={selectedSites}
          onChange={(event, newValue) => setSelectedSites(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Sites" variant="outlined" />}
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
            onChange={(newValue) => setDateRange(newValue)}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { marginBottom: "16px" },
              },
            }}
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
      <Plot
        divId={chartId}
        data={[
          {
            x: aggregatedData.map((item) => item.date),
            y: aggregatedData.map((item) => item.Quantity),
            type: "scatter",
            mode: "lines+markers",
            name: "Quantity",
          },
          {
            x: aggregatedData.map((item) => item.date),
            y: aggregatedData.map((item) => item.TransactionCount),
            type: "scatter",
            mode: "lines+markers",
            name: "Transaction Count",
            yaxis: "y2",
          },
        ]}
        layout={{
          title: `Consumption Trend and Transaction Count (${aggregationLevel})`,
          xaxis: { title: "Date" },
          yaxis: { title: "Quantity" },
          yaxis2: {
            title: "Transaction Count",
            overlaying: "y",
            side: "right",
          },
        }}
        style={{ width: "100%", height: "400px" }}
      />

      <AskGeminiButton
        loading={loading}
        insight={insight}
        onAskGemini={onAskGemini}
      />
    </div>
  );
};

export default MaterialLevelAnalysis;
