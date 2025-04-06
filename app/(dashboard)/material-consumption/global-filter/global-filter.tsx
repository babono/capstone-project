import React from "react";
import { Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

type GlobalFilterProps = {
  plants: string[];
  selectedPlants: string[];
  setSelectedPlants: (value: string[]) => void;
  sites: string[];
  selectedSites: string[];
  setSelectedSites: (value: string[]) => void;
  vendors: string[];
  selectedVendors: string[];
  setSelectedVendors: (value: string[]) => void;
  dateRange: [Date | null, Date | null];
  setDateRange: (value: [Date | null, Date | null]) => void;
  minDate: Date | undefined;
  maxDate: Date | undefined;
  topN: number | "All";
  setTopN: (value: number | "All") => void;
};

const GlobalFilter: React.FC<GlobalFilterProps> = ({
  plants,
  selectedPlants,
  setSelectedPlants,
  sites,
  selectedSites,
  setSelectedSites,
  vendors,
  selectedVendors,
  setSelectedVendors,
  dateRange,
  setDateRange,
  minDate,
  maxDate,
  topN,
  setTopN,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Global Filters</h2>
      <Box sx={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <Autocomplete
          multiple
          options={plants}
          value={selectedPlants}
          onChange={(event, newValue) => setSelectedPlants(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Plants" variant="outlined" />}
          sx={{ width: "50%" }}
        />
        <Autocomplete
          multiple
          options={sites}
          value={selectedSites}
          onChange={(event, newValue) => setSelectedSites(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Sites" variant="outlined" />}
          sx={{ width: "50%" }}
        />
      </Box>
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
          minDate={minDate}
          maxDate={maxDate}
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
      <div className="mt-4">
        <FormControl fullWidth>
          <InputLabel id="topN-label">Select Top N Materials</InputLabel>
          <Select
            labelId="topN-label"
            id="topN"
            value={topN}
            onChange={(e) => setTopN(e.target.value === "All" ? "All" : parseInt(e.target.value as string))}
            label="Select Top N Materials"
          >
            <MenuItem value={5}>Top 5</MenuItem>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value="All">All</MenuItem>
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default GlobalFilter;
