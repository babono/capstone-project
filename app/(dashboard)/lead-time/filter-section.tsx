// @ts-nocheck
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const FiltersSection = ({
  suppliers,
  selectedSupplier,
  handleSupplierChange,
  dateRange,
  minDate,
  maxDate,
  handleDateRangeChange,
}) => {
  return (
    <div>
      {/* Supplier Selection */}
      <div className="mb-4">
        <FormControl fullWidth>
          <InputLabel>Select Supplier (Optional)</InputLabel>
          <Select
            id="supplier"
            labelId="supplier-label"
            label="Select Supplier (Optional)"
            value={selectedSupplier}
            onChange={handleSupplierChange}
          >
            {[
              "All",
              "Unknown",
              ...suppliers
                .filter((supplier) => supplier !== "All" && supplier !== "Unknown")
                .sort((a, b) => a.localeCompare(b)),
            ].map((supplier) => (
              <MenuItem key={supplier} value={supplier}>
                {supplier}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Date Range Selection */}
      <div className="mb-4">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            value={dateRange}
            minDate={minDate}
            maxDate={maxDate}
            onChange={handleDateRangeChange}
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
    </div>
  );
};

export default FiltersSection;
