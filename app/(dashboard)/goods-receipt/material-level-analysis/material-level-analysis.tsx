import React, { useState, useMemo, useEffect } from "react";
import { Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, startOfWeek, startOfMonth, startOfQuarter } from "date-fns";
import { Plot } from "@/app/constants";
import AskGeminiButton from "../../common/ask-gemini";

type MaterialLevelAnalysisProps = {
  materialData: any[];
  chartId: string;
  chartIdQuantity: string;
};

const MaterialLevelAnalysis: React.FC<MaterialLevelAnalysisProps> = ({
  materialData,
  chartId,
  chartIdQuantity,
}) => {
  // States for filters and selections
  const [plants, setPlants] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [minDate, setMinDate] = useState<Date | undefined>();
  const [maxDate, setMaxDate] = useState<Date | undefined>();
  const [selectedMaterialNum, setSelectedMaterial] = useState<string | null>(null);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [aggregationLevel, setAggregationLevel] = useState<string>("Daily");

  // Helper function to update filters based on material
  const updateFilters = (filteredData: any[]) => {
    const uniquePlants = [...new Set(filteredData.map((item) => item["Plant"]))];
    const uniqueSites = [...new Set(filteredData.map((item) => item["Site"]))];
    const uniqueVendors = [...new Set(filteredData.map((item) => item["Vendor Number"]))];

    setPlants(uniquePlants);
    setSites(uniqueSites);
    setVendors(uniqueVendors);

    setSelectedPlants(uniquePlants);
    setSelectedSites(uniqueSites);
    setSelectedVendors(uniqueVendors);

    const timestamps = filteredData.map((item) => new Date(item["Pstng Date"]).getTime());
    setMinDate(new Date(Math.min(...timestamps)));
    setMaxDate(new Date(Math.max(...timestamps)));
    setDateRange([new Date(Math.min(...timestamps)), new Date(Math.max(...timestamps))]);
  };

  // Automatically set the first material number and adjust filters
  useEffect(() => {
    if (materialData.length > 0) {
      const firstMaterial = materialData[0]["Material Number"];
      setSelectedMaterial(firstMaterial);
      updateFilters(materialData.filter((item) => item["Material Number"] === firstMaterial));
    }
  }, [materialData]);

  // Adjust filters dynamically when the material number changes
  useEffect(() => {
    if (selectedMaterialNum) {
      updateFilters(materialData.filter((item) => item["Material Number"] === selectedMaterialNum));
    }
  }, [selectedMaterialNum, materialData]);

  // Filtered data based on selected material and filters
  const filteredData = useMemo(() => {
    return materialData.filter((item) => {
      const isMaterialMatch = !selectedMaterialNum || item["Material Number"] === selectedMaterialNum;
      const isPlantMatch = selectedPlants.length === 0 || selectedPlants.includes(item["Plant"]);
      const isSiteMatch = selectedSites.length === 0 || selectedSites.includes(item["Site"]);
      const isVendorMatch = selectedVendors.length === 0 || selectedVendors.includes(item["Vendor Number"]);
      const isDateMatch =
        (!dateRange[0] || new Date(item["Pstng Date"]) >= dateRange[0]) &&
        (!dateRange[1] || new Date(item["Pstng Date"]) <= dateRange[1]);

      return isMaterialMatch && isPlantMatch && isSiteMatch && isVendorMatch && isDateMatch;
    });
  }, [materialData, selectedMaterialNum, selectedPlants, selectedSites, selectedVendors, dateRange]);

  // Aggregated data for visualization
  const aggregatedData = useMemo(() => {
    const groupedData: { [key: string]: { Quantity: number; TransactionCount: number } } = {};
    const allKeys: string[] = [];
    const dateCursor = dateRange[0] ? new Date(dateRange[0]) : null;
    const endDate = dateRange[1] ? new Date(dateRange[1]) : null;

    // Generate all expected date keys
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
      allKeys.push(key);
    }

    // Aggregate actual data
    filteredData.forEach((item) => {
      const date = new Date(item["Pstng Date"]);
      const key =
        aggregationLevel === "Daily"
          ? format(date, "yyyy-MM-dd")
          : aggregationLevel === "Weekly"
            ? format(startOfWeek(date), "yyyy-MM-dd")
            : aggregationLevel === "Monthly"
              ? format(startOfMonth(date), "yyyy-MM")
              : format(startOfQuarter(date), "yyyy-'Q'Q");

      if (!groupedData[key]) {
        groupedData[key] = { Quantity: 0, TransactionCount: 0 };
      }
      groupedData[key].Quantity += item["Quantity"];
      groupedData[key].TransactionCount += 1;
    });

    // Fill missing keys with zeros
    return allKeys.map((key) => ({
      date: key,
      quantity: groupedData[key]?.Quantity || 0,
      transactionCount: groupedData[key]?.TransactionCount || 0,
    }));
  }, [filteredData, aggregationLevel, dateRange]);

  // Aggregated data for Quantity by Plant over Time
  const plantAggregatedData = useMemo(() => {
    const groupedData: { [key: string]: { [plant: string]: number } } = {};
    const allDates = new Set<string>();
    const allPlants = new Set<string>(plants);

    filteredData.forEach((item) => {
      const date = new Date(item["Pstng Date"]);
      const key =
        aggregationLevel === "Daily"
          ? format(date, "yyyy-MM-dd")
          : aggregationLevel === "Weekly"
            ? format(startOfWeek(date), "yyyy-MM-dd")
            : aggregationLevel === "Monthly"
              ? format(startOfMonth(date), "yyyy-MM")
              : format(startOfQuarter(date), "yyyy-'Q'Q");

      allDates.add(key);

      if (!groupedData[key]) {
        groupedData[key] = {};
      }
      groupedData[key][item["Plant"]] = (groupedData[key][item["Plant"]] || 0) + item["Quantity"];
    });

    // Fill missing combinations of dates and plants with zeros
    const result: { date: string; plant: string; quantity: number }[] = [];
    allDates.forEach((date) => {
      allPlants.forEach((plant) => {
        result.push({
          date,
          plant,
          quantity: groupedData[date]?.[plant] || 0,
        });
      });
    });

    return result;
  }, [filteredData, aggregationLevel, plants]);

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
        <Box sx={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <Autocomplete
            multiple
            options={plants}
            value={selectedPlants}
            onChange={(event, newValue) => setSelectedPlants(newValue)}
            renderInput={(params) => <TextField {...params} label="Select Plants" variant="outlined" />}
            sx={{ width: "33.33%" }}
          />
          <Autocomplete
            multiple
            options={sites}
            value={selectedSites}
            onChange={(event, newValue) => setSelectedSites(newValue)}
            renderInput={(params) => <TextField {...params} label="Select Sites" variant="outlined" />}
            sx={{ width: "33.33%" }}
          />
          <Autocomplete
            multiple
            options={vendors}
            value={selectedVendors}
            onChange={(event, newValue) => setSelectedVendors(newValue)}
            renderInput={(params) => <TextField {...params} label="Select Vendors" variant="outlined" />}
            sx={{ width: "33.33%" }}
          />
        </Box>
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
        {`Goods Receipt Trend and Transaction Count (${aggregationLevel}) for ${selectedMaterialNum}`}
      </p>
      <Plot
        divId={chartId}
        data={[
          {
            x: aggregatedData.map((item) => item.date),
            y: aggregatedData.map((item) => item.quantity),
            type: "scatter",
            mode: "lines+markers",
            name: "Quantity",
          },
          {
            x: aggregatedData.map((item) => item.date),
            y: aggregatedData.map((item) => item.transactionCount),
            type: "scatter",
            mode: "lines+markers",
            name: "Transaction Count",
            yaxis: "y2",
          },
        ]}
        layout={{
          xaxis: { title: "Date" },
          yaxis: { title: "Quantity" },
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
      <br></br>

      {/* Goods Receipt Quality*/}
      <h1 className="text-2xl font-bold mb-4">Goods Receipt Quantity by Plant Over Time</h1>
      <p className="text-l font-semibold">
        {`Goods Receipt Quantity by Plant (${aggregationLevel}) for ${selectedMaterialNum}`}
      </p>
      <Plot
        divId={chartIdQuantity}
        data={plants.map((plant) => ({
          x: plantAggregatedData.filter((item) => item.plant === plant).map((item) => item.date),
          y: plantAggregatedData.filter((item) => item.plant === plant).map((item) => item.quantity),
          type: "bar",
          name: plant,
          marker: { color: "blue" },
        }))}
        layout={{
          barmode: "group",
          xaxis: { title: "Date" },
          yaxis: { title: "Quantity" },
          title: `Goods Receipt Quantity by Plant Over Time (${aggregationLevel})`,
        }}
        style={{ width: "100%", height: "100%" }}
      />
      <AskGeminiButton chartId={chartIdQuantity} />
    </div>
  );
};

export default MaterialLevelAnalysis;
