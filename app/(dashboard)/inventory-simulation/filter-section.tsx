// @ts-nocheck
"use client";

import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";

export default function FilterSection({
  materialConsumptionData,
  demandSurgeWeekOptions,
  selectedMaterial,
  setSelectedMaterial,
  selectedPlant,
  setSelectedPlant,
  selectedSite,
  setSelectedSite,
  numWeeks,
  setNumWeeks,
  leadTime,
  setLeadTime,
  leadTimeStdDev,
  setLeadTimeStdDev,
  initialInventory,
  setInitialInventory,
  demandSurgeWeeks,
  setDemandSurgeWeeks,
  demandSurgeFactor,
  setDemandSurgeFactor,
  consumptionType,
  setConsumptionType,
  fixedConsumptionValue,
  setFixedConsumptionValue,
  minOrderQuantity,
  setMinOrderQuantity,
  numMonteCarloSimulations,
  setNumMonteCarloSimulations,
  desiredServiceLevel,
  setDesiredServiceLevel,
  orderQuantityType,
  setOrderQuantityType,
  orderQuantity,
  setOrderQuantity,
  reorderPoint,
  setReorderPoint,
}) {
  return (
    <div>
      {/* 1st Form Grid */}
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
                  materialConsumptionData.map((row) => row["Material Number"])
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

      {/* 2nd Form Grid */}
      <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
        {/* Number of Simulation Weeks */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Number of Simulation Weeks"
            type="number"
            value={numWeeks}
            onChange={(e) => setNumWeeks(Number(e.target.value))}
            inputProps={{
              min: 1,
              max: 104,
            }}
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              Set the number of weeks for the simulation.
            </Typography>
          </Box>
        </Grid>

        {/* Lead Time (weeks) */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Lead Time (weeks)"
            type="number"
            value={leadTime}
            onChange={(e) => {
              const value = Math.min(
                20.0,
                Math.max(1.0, parseFloat(e.target.value))
              );
              setLeadTime(value);
            }}
            inputProps={{
              min: 1.0,
              max: 20.0,
              step: 0.1,
            }}
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              The time (in weeks) it takes for an order to arrive after it is
              placed.
            </Typography>
          </Box>
        </Grid>

        {/* Lead Time Std Dev (weeks) */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Lead Time Std Dev (weeks)"
            type="number"
            value={leadTimeStdDev}
            onChange={(e) => {
              const value = Math.min(
                10.0,
                Math.max(0.0, parseFloat(e.target.value))
              );
              setLeadTimeStdDev(value);
            }}
            inputProps={{
              min: 0.0,
              max: 10.0,
              step: 0.1,
            }}
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              The standard deviation of the lead time, representing variability.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 3rd Form Grid */}
      <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
        {/* Initial Inventory */}
        <Grid item xs={12} sm={4}>
          <TextField
            label={`Initial Inventory`}
            type="number"
            value={initialInventory}
            onChange={(e) => {
              const value = Math.min(
                20000,
                Math.max(10, parseInt(e.target.value) || 0)
              );
              setInitialInventory(value);
            }}
            inputProps={{
              min: 10,
              max: 20000,
              step: 1,
            }}
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              The starting inventory level for the simulation.
            </Typography>
          </Box>
        </Grid>

        {/* Demand Surge Weeks */}
        <Grid item xs={12} sm={4}>
          <Autocomplete
            multiple
            options={demandSurgeWeekOptions}
            value={demandSurgeWeeks}
            onChange={(event, newValue) => setDemandSurgeWeeks(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Demand Surge Weeks"
                placeholder="Select Weeks"
              />
            )}
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              The number of weeks during which demand surges.
            </Typography>
          </Box>
        </Grid>

        {/* Demand Surge Factor */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Demand Surge Factor"
            type="number"
            value={demandSurgeFactor}
            onChange={(e) => setDemandSurgeFactor(Number(e.target.value))}
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              Enter the factor by which demand will increase during the selected
              weeks. (e.g., 2.0 doubles demand)
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 4th Form Grid */}
      <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
        {/* Consumption Type & Fixed Consumption Value */}
        <Grid item xs={12} sm={4}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel>Consumption Type</FormLabel>
            <RadioGroup
              row
              value={consumptionType}
              onChange={(e) => setConsumptionType(e.target.value)}
            >
              <FormControlLabel
                value="Fixed"
                control={<Radio />}
                label="Fixed"
              />
              <FormControlLabel
                value="Distribution"
                control={<Radio />}
                label="Distribution"
              />
            </RadioGroup>
          </FormControl>
          {consumptionType === "Fixed" && (
            <TextField
              label="Fixed Consumption Value"
              type="number"
              value={fixedConsumptionValue}
              onChange={(e) => setFixedConsumptionValue(Number(e.target.value))}
              fullWidth
              sx={{ marginTop: "8px" }}
            />
          )}
        </Grid>

        {/* Minimum Order Quantity */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Minimum Order Quantity"
            type="number"
            value={minOrderQuantity}
            onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              Select the minimum order quantity for this material number to
              prevent small orders during simulation.
            </Typography>
          </Box>
        </Grid>

        {/* Number of Monte Carlo Simulations */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Number of Monte Carlo Simulations"
            type="number"
            value={numMonteCarloSimulations}
            onChange={(e) =>
              setNumMonteCarloSimulations(Number(e.target.value))
            }
            fullWidth
          />
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              The number of Monte Carlo simulations to run. A higher number
              provides more accurate results but requires more computation.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 5th Form Grid */}
      <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
        {/* Desired Service Level (%) */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Desired Service Level (%)"
            type="number"
            value={desiredServiceLevel}
            onChange={(e) => setDesiredServiceLevel(Number(e.target.value))}
            fullWidth
          />
        </Grid>

        {/* Order Quantity Type & Order Quantity */}
        <Grid item xs={12} sm={4}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel>Order Quantity Type</FormLabel>
            <RadioGroup
              row
              value={orderQuantityType}
              onChange={(e) => setOrderQuantityType(e.target.value)}
            >
              <FormControlLabel
                value="Fixed"
                control={<Radio />}
                label="Fixed"
              />
              <FormControlLabel
                value="Variable"
                control={<Radio />}
                label="Variable"
              />
            </RadioGroup>
          </FormControl>
          {orderQuantityType === "Fixed" && (
            <TextField
              label="Order Quantity"
              type="number"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(Number(e.target.value))}
              fullWidth
              sx={{ marginTop: "8px" }}
            />
          )}
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
          <Box
            sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="caption">
              The inventory level at which a new order is placed.{" "}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => console.log("Run Simulation")}
      >
        Run Simulation
      </button>
    </div>
  );
}
