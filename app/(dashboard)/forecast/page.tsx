// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import FileUploader from "../common/file-uploader";
import { GENERATE_RESULT_CAPTIONS, PAGE_KEYS, PAGE_LABELS } from "@/app/constants";
// ARIMA import is no longer needed here as it's on the backend
import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  SelectChangeEvent
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import GenerateResultCaption from "../common/generate-result-caption";
import ErrorBoundary from "../common/error-boundary";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(
  () => import("react-plotly.js").then(mod => mod.default as any),
  { ssr: false }
);

// Helper function to get ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

interface ForecastResult {
  year: number;
  week: number;
  predicted_consumption: number;
}

interface UploadedRecord {
  "Material Number": string;
  [key: string]: any; // For WWx_Consumption fields
}

export default function ForecastPage() {
  return (
    <ErrorBoundary>
      <Forecast />
    </ErrorBoundary>
  );
}

function Forecast() {
  const [uploadedData, setUploadedData] = useState<UploadedRecord[] | null>(null);
  const [materialNumbers, setMaterialNumbers] = useState<string[]>([]);
  const [selectedMaterialNumber, setSelectedMaterialNumber] = useState<string>("");
  const [forecastWeeks, setForecastWeeks] = useState<number>(6);
  const [seasonality, setSeasonality] = useState<"Yes" | "No">("Yes");
  const [forecastResult, setForecastResult] = useState<ForecastResult[] | null>(null);
  const [plotData, setPlotData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalTimeSeries, setHistoricalTimeSeries] = useState<number[]>([]);
  const [historicalDataYear, setHistoricalDataYear] = useState<number | null>(null);

  const handleUploadComplete = (data: UploadedRecord[]) => {
    setUploadedData(data);
    setForecastResult(null);
    setPlotData(null);
    setError(null);
    setHistoricalTimeSeries([]);
    setHistoricalDataYear(null);
    if (data && data.length > 0) {
      const uniqueMaterials = [...new Set(data.map(item => item["Material Number"]).filter(Boolean))].sort();
      setMaterialNumbers(uniqueMaterials);
      if (uniqueMaterials.length > 0) {
        setSelectedMaterialNumber(uniqueMaterials[0]);
      } else {
        setSelectedMaterialNumber("");
      }
    } else {
      setMaterialNumbers([]);
      setSelectedMaterialNumber("");
    }
  };

  useEffect(() => {
    if (uploadedData) {
      const uniqueMaterials = [...new Set(uploadedData.map(item => item["Material Number"]).filter(Boolean))].sort();
      setMaterialNumbers(uniqueMaterials);
      if (uniqueMaterials.length > 0 && !uniqueMaterials.includes(selectedMaterialNumber)) {
        setSelectedMaterialNumber(uniqueMaterials[0]);
      } else if (uniqueMaterials.length === 0) {
        setSelectedMaterialNumber("");
      }
      setForecastResult(null);
      setPlotData(null);
      setHistoricalTimeSeries([]);
      setHistoricalDataYear(null);
    }
  }, [uploadedData]);

  const handleRunForecast = async () => {
    if (!uploadedData || !selectedMaterialNumber) {
      setError("Please upload data and select a material number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setForecastResult(null);
    setPlotData(null);
    setHistoricalTimeSeries([]);
    setHistoricalDataYear(null);

    try {
      // Filter data for the selected material
      const materialTransactions = uploadedData.filter(
        item => item["Material Number"] === selectedMaterialNumber && item["Pstng Date"] && typeof item["Quantity"] === 'number'
      );

      if (materialTransactions.length === 0) {
        throw new Error("No valid transaction data found for the selected material.");
      }

      // Determine the year of the historical data (assuming it's mostly from one year)
      // A more robust solution would handle data spanning multiple years for aggregation.
      const firstTransactionDate = new Date(materialTransactions[0]["Pstng Date"]);
      const dataYear = firstTransactionDate.getFullYear();
      setHistoricalDataYear(dataYear);

      // Aggregate transactions by week
      const weeklyConsumption: { [week: number]: number } = {};
      for (let i = 1; i <= 52; i++) {
        weeklyConsumption[i] = 0; // Initialize all weeks to 0
      }

      materialTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction["Pstng Date"]);
        if (transactionDate.getFullYear() === dataYear) { // Process only transactions from the determined year
          const weekNumber = getISOWeek(transactionDate);
          if (weekNumber >= 1 && weekNumber <= 52) {
            weeklyConsumption[weekNumber] += transaction["Quantity"];
          }
        }
      });

      const timeSeries: number[] = [];
      for (let i = 1; i <= 52; i++) {
        timeSeries.push(weeklyConsumption[i] || 0);
      }

      if (timeSeries.every(val => val === 0)) { // Check if all values are zero after aggregation
        throw new Error("Aggregated consumption data is all zero for the selected material and year.");
      }
      setHistoricalTimeSeries(timeSeries);

      const response = await fetch('/api/forecast/arima', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeSeries,
          forecastWeeks,
          seasonality,
          // Pass the historical data year to the API so it can calculate forecast years correctly
          lastHistoricalYear: dataYear
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const results: ForecastResult[] = data.forecast;

      setForecastResult(results);

      const historicalPlotWeeks = timeSeries.map((_, i) => `${dataYear} - WW${i + 1}`);
      const forecastPlotWeeks = results.map(r => `${r.year} - WW${r.week}`);

      setPlotData({
        data: [
          {
            x: historicalPlotWeeks,
            y: timeSeries,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Actual Consumption (${dataYear})`,
            line: { color: '#0000FF', width: 3 }, // Blue color
            marker: { color: '#0000FF', size: 8 },
          },
          {
            x: forecastPlotWeeks,
            y: results.map(r => r.predicted_consumption),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Forecasted Consumption',
            line: { color: '#8080FA', width: 3 }, // Purple color
            marker: { color: '#8080FA', size: 8 },
          },
        ],
        layout: {
          title: `Consumption Forecast for Material ${selectedMaterialNumber}`,
          xaxis: {
            title: { text: 'Year - Week', font: { color: "black" } },
            automargin: true,
          },
          yaxis: {
            title: { text: 'Demand (Units)', font: { color: "black" } },
            automargin: true,
          },
        },
      });

    } catch (e: any) {
      console.error("Forecast error:", e);
      setError(e.message || "An error occurred during forecasting.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Forecast Model</h1>

      <FileUploader
        type={PAGE_KEYS.MATERIAL_CONSUMPTION}
        title={`Upload ${PAGE_LABELS.MATERIAL_CONSUMPTION} Data (Excel with WWx_Consumption columns)`}
        onUploadComplete={handleUploadComplete}
      />

      {!uploadedData && (
        <GenerateResultCaption message={GENERATE_RESULT_CAPTIONS.NO_FILES_UPLOADED} />
      )}

      {uploadedData && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Forecast Parameters</h2>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="material-number-label">Select Material Number</InputLabel>
                <Select
                  labelId="material-number-label"
                  value={selectedMaterialNumber}
                  label="Select Material Number"
                  onChange={(e: SelectChangeEvent<string>) => setSelectedMaterialNumber(e.target.value)}
                >
                  {materialNumbers.map(mn => (
                    <MenuItem key={mn} value={mn}>{mn}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="model-label">Select Model</InputLabel>
                <Select
                  labelId="model-label"
                  value="ARIMA"
                  label="Select Model"
                  disabled
                >
                  <MenuItem value="ARIMA">ARIMA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  label="Forecast Weeks"
                  type="number"
                  value={forecastWeeks}
                  onChange={(e) => setForecastWeeks(Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{ inputProps: { min: 1, max: 52 } }}
                  sx={{ mr: 1, flexGrow: 1 }}
                />
                <IconButton onClick={() => setForecastWeeks(prev => Math.max(1, prev - 1))}><Remove /></IconButton>
                <IconButton onClick={() => setForecastWeeks(prev => Math.min(52, prev + 1))}><Add /></IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="seasonality-label">Seasonality</InputLabel>
                <Select
                  labelId="seasonality-label"
                  value={seasonality}
                  label="Seasonality"
                  onChange={(e: SelectChangeEvent<"Yes" | "No">) => setSeasonality(e.target.value as "Yes" | "No")}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleRunForecast}
                disabled={isLoading || !selectedMaterialNumber}
                fullWidth
              >
                {isLoading ? <CircularProgress size={24} /> : "Run Forecast"}
              </Button>
            </Grid>
          </Grid>
        </div>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}

      {forecastResult && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Forecast Result</h2>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Week</TableCell>
                  <TableCell align="right">Predicted Consumption</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecastResult.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{row.week}</TableCell>
                    <TableCell align="right">{row.predicted_consumption}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {plotData && (
        <Plot
          data={plotData.data}
          layout={plotData.layout}
          style={{ width: '100%', height: '450px' }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}