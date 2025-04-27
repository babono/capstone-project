// @ts-nocheck
"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import iconDT from "../../public/ic-dt.svg"
import { PAGE_KEYS, PAGE_LABELS } from "@/app/constants"
import FileUploader from "./common/file-uploader"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,  
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import dynamic from "next/dynamic";

// Handle dynamic import for Plotly JS for Next.js. For different components usage
// DO NOT use: import Plot from "react-plotly.js" at other components, because it will cause SSR error

const Plot = dynamic(
  () =>
    import("react-plotly.js").then(
      (mod) =>
        mod.default as React.ComponentType<{
          divId: string;
          data: any;
          layout: any;
          style: any;
          config?: any;
        }>
    ),
  { ssr: false }
);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploadData, setUploadData] = useState<any[] | null>(null);
  const [materialNumbers, setMaterialNumbers] = useState<string[]>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [startWeeks, setStartWeeks] = useState<string[]>([]);
  const [selectedMaterialNumber, setSelectedMaterialNumber] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedStartWeek, setSelectedStartWeek] = useState<string | null>(null);
  const [numberOfWeeks, setNumberOfWeeks] = useState<number>(12);
  const [analysisResult, setAnalysisResult] = useState<any[] | null>(null);
  const [plotData, setPlotData] = useState<any | null>(null);
  const [analysisMessages, setAnalysisMessages] = useState<string[]>([]);
  const [weeksRange, setWeeksRange] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login")
  }, [session, status, router])

  useEffect(() => {
    console.log(uploadData)
  }, [uploadData])

  useEffect(() => {
    if (uploadData && Array.isArray(uploadData)) {
      // Flatten the array of arrays
      const flattenedData = uploadData.flat();

      // Extract unique values for filters and sort them numerically
      const uniqueMaterialNumbers = [...new Set(flattenedData.map((item) => item["Material Number"]))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const uniquePlants = [...new Set(flattenedData.map((item) => item["Plant"]))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const uniqueSites = [...new Set(flattenedData.map((item) => item["Site"]))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const uniqueStartWeeks = Array.from({ length: 51 }, (_, i) => `WW${String(i + 2).padStart(2, '0')}`);

      setMaterialNumbers(uniqueMaterialNumbers);
      setPlants(uniquePlants);
      setSites(uniqueSites);
      setStartWeeks(uniqueStartWeeks);
    }
  }, [uploadData]);

  const handleUploadComplete = async (data) => {
    console.log("Uploaded data:", data);
    setUploadData(data);
  };

  // Load data from the JSON file in the public folder on component mount
  useEffect(() => {
    const fileName = "uploadedData.json";
    const filePath = `/${fileName}`;

    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load uploaded data");
        }
        return response.json();
      })
      .then((parsedData) => {
        setUploadData(parsedData);

        // Extract unique values for filters
        const uniqueMaterialNumbers = [...new Set(parsedData.map((item) => item["Material Number"]))];
        const uniquePlants = [...new Set(parsedData.map((item) => item["Plant"]))];
        const uniqueSites = [...new Set(parsedData.map((item) => item["Site"]))];
        const uniqueStartWeeks = [...new Set(parsedData.map((item) => item["Snapshot"]))];

        setMaterialNumbers(uniqueMaterialNumbers);
        setPlants(uniquePlants);
        setSites(uniqueSites);
        setStartWeeks(uniqueStartWeeks);
      })
      .catch((error) => {
        console.error("Error loading uploaded data:", error);
      });
  }, []);

  // Function to extract and aggregate weekly data (similar to Python function)
  const extractAndAggregateWeeklyData = (
    data: any[], // data is uploadData
    materialNumber: string | null,
    plant: string | null,
    site: string | null,
    startWeek: string | null,
    numWeeks: number = 12
  ) => {
    if (!data || !materialNumber || !plant || !site || !startWeek) {
      console.warn("Missing filter criteria. Please ensure all filters are selected.");
      return null;
    }

    const startWeekNumber = parseInt(startWeek.replace("WW", ""), 10);
    const generatedWeeksRange = generateWeeksRange(startWeekNumber, numWeeks);
    setWeeksRange(generatedWeeksRange); // Update the weeksRange state
    console.log("Weeks Range:", generatedWeeksRange);

    const selectedData: any[] = [];
    const allowedMeasures = [
      "Demand w/o Buffer",
      "Supply",
      "Expired",
      "EOH w/o Buffer",
      "EOH with Buffer",
      "Weeks of Stock",
    ];

    // Iterate through the weeks from (startWeek - numWeeks) to startWeek
    for (let i = -numWeeks; i <= 0; i++) {
      const weekIndex = (startWeekNumber + i - 1 + 52) % 52; // Calculate week index (0-51), handle negative weeks
      const weekSnapshot = `WW${String(weekIndex + 1).padStart(2, '0')}`; // Format week as WWXX

      // Get the data for the current week index
      const weekData = data[weekIndex];

      if (weekData) {
        // Filter the data for the current week based on the selected criteria
        const filteredData = weekData.filter(
          (item) =>
            item["Material Number"] === materialNumber &&
            item["Plant"] === plant &&
            item["Site"] === site &&
            allowedMeasures.includes(item["Measures"]) // Include only allowed measures
        );

        // Add the snapshot column, measures column, and inventory on-hand column
        const filteredDataWithSnapshot = filteredData.map((item) => {
          const row = {
            ...item,
            Snapshot: weekSnapshot,
            Measures: item["Measures"] || "N/A", // Add Measures column if available
            "InventoryOn-Hand": item["Inventory\nOn-Hand"] || "", // Add Inventory On-Hand column if available
          };

          // Add dynamic projection columns
          generatedWeeksRange.forEach((week) => {
            row[week] = item[week] || ""; // Add the value for the week or leave it empty
          });

          return row;
        });

        selectedData.push(...filteredDataWithSnapshot);
      } else {
        console.log(`No data found for week index ${weekIndex}`);
      }
    }

    console.log("Selected Data:", selectedData);
    return selectedData;
  };

  function generateWeeksRange(startWeek: number, numWeeks: number): string[] {
    const weeksRange: string[] = [];
    for (let i = 0; i < 2 * numWeeks + 1; i++) {
      const week = (startWeek + i - numWeeks) % 52 || 52;
      if (startWeek - numWeeks < 1 && week > startWeek + numWeeks) {
        continue;
      }
      weeksRange.push(`WW${String(week).padStart(2, '0')}`);
    }
    console.log(weeksRange);
    return weeksRange;
  }

  const plotStockPredictionPlotly = (data: any[]) => {
    if (!data || data.length === 0) {
      console.warn("No data to plot.");
      return null;
    }

    const weeks = data.map((item) => item.Snapshot);
    const actualStock = data.map((item) => item["InventoryOn-Hand"]);

    const plotData = {
      data: [
        {
          x: weeks,
          y: actualStock,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Actual Inventory',
        },
      ],
      layout: {
        title: 'Inventory Over Time',
        xaxis: { title: 'Week' },
        yaxis: { title: 'Inventory On-Hand' },
      },
    };

    return plotData;
  };

  const checkWosAgainstLeadTime = () => {
    const messages: string[] = [];
    // Implement your logic here to compare Weeks of Supply against Lead Time
    // and generate messages.
    return messages;
  };

  const handleAnalyze = () => {
    if (uploadData && Array.isArray(uploadData)) {
      const result = extractAndAggregateWeeklyData(
        uploadData,
        selectedMaterialNumber,
        selectedPlant,
        selectedSite,
        selectedStartWeek,
        numberOfWeeks
      );

      if (result) {
        setAnalysisResult(result);
        const plotData = plotStockPredictionPlotly(result);
        setPlotData(plotData);
        const messages = checkWosAgainstLeadTime(result);
        setAnalysisMessages(messages);
      } else {
        setAnalysisResult(null);
        setPlotData(null);
        setAnalysisMessages([]);
        alert("No data found for the selected filters.");
      }
    } else {
      alert("Please upload data first.");
    }
  };

  // Redirect if not logged in
  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Image src={iconDT} alt="Loading..." width={100} height={100} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Waterfall</h1>
      <h2>Still undergoing development, can check other features first</h2>
      <FileUploader
        type={PAGE_KEYS.HOME}
        title={PAGE_LABELS.HOME}
        onUploadComplete={handleUploadComplete}
      />

      {/* Filters */}
      {uploadData && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Filters</h2>

          <Autocomplete
            disablePortal
            id="material-number-autocomplete"
            options={materialNumbers}
            value={selectedMaterialNumber || null}
            onChange={(event, newValue) => {
              setSelectedMaterialNumber(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Material Number" />
            )}
            sx={{ width: '100%', marginBottom: 2 }}
          />

          <Autocomplete
            disablePortal
            id="plant-autocomplete"
            options={plants}
            value={selectedPlant || null}
            onChange={(event, newValue) => {
              setSelectedPlant(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Plant" />
            )}
            sx={{ width: '100%', marginBottom: 2 }}
          />

          <Autocomplete
            disablePortal
            id="site-autocomplete"
            options={sites}
            value={selectedSite || null}
            onChange={(event, newValue) => {
              setSelectedSite(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Site" />
            )}
            sx={{ width: '100%', marginBottom: 2 }}
          />

          <Autocomplete
            disablePortal
            id="start-week-autocomplete"
            options={startWeeks}
            value={selectedStartWeek || null}
            onChange={(event, newValue) => {
              setSelectedStartWeek(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Start Week" />
            )}
            sx={{ width: '100%', marginBottom: 2 }}
          />

          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="number-of-weeks-label">Number of Weeks</InputLabel>
            <Select
              labelId="number-of-weeks-label"
              id="number-of-weeks"
              value={numberOfWeeks}
              label="Number of Weeks"
              onChange={(e) => setNumberOfWeeks(parseInt(e.target.value))}
            >
              {[...Array(52)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleAnalyze}>
            Analyze
          </Button>
        </div>
      )}

      {analysisResult && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Analysis Result</h2>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <StyledTableCell colSpan={3 + weeksRange.length} align="center">
                    <strong>Material Number:</strong> {selectedMaterialNumber}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell colSpan={3 + weeksRange.length} align="center">
                    <strong>Plant:</strong> {selectedPlant}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell colSpan={3 + weeksRange.length} align="center">
                    <strong>Site:</strong> {selectedSite}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Snapshot</StyledTableCell>
                  <StyledTableCell align="right">Measures</StyledTableCell>
                  <StyledTableCell align="right">Inventory On-Hand</StyledTableCell>
                  {weeksRange.map((week) => (
                    <StyledTableCell key={week} align="right">{week}</StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {analysisResult.map((row, index) => (
                  <StyledTableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledTableCell component="th" scope="row">
                      {row.Snapshot}
                    </StyledTableCell>
                    <StyledTableCell align="right">{row.Measures}</StyledTableCell>
                    <StyledTableCell align="right">{row["InventoryOn-Hand"]}</StyledTableCell>
                    {weeksRange.map((week) => (
                        <StyledTableCell key={week} align="right">
                        {row[week] !== undefined && row[week] !== "" && row[week] !== "0" 
                          ? parseFloat(row[week]).toFixed(1) 
                          : "0"} {/* Format to 1 decimal place or display "0" */}
                        </StyledTableCell>
                    ))}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {plotData && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Inventory Plot</h2>
          <Plot data={plotData.data} layout={plotData.layout} />
        </div>
      )}

      {analysisMessages && analysisMessages.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Analysis Messages</h2>
          <ul>
            {analysisMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}