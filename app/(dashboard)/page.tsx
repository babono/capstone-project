// @ts-nocheck
"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import iconDT from "../../public/ic-dt.svg"
import { ERR_BUCKET_LOAD_PREFIX, PAGE_KEYS, PAGE_LABELS, WATERFALL_BUCKET_URL } from "@/app/constants"
import FileUploader from "./common/file-uploader"
import html2canvas from "html2canvas"
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
  LinearProgress  // <-- Import LinearProgress for the progress bar
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import dynamic from "next/dynamic";
import DownloadBucket from "./common/download-bucket"
import { Plot } from "@/app/constants";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#3719D3",
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

  // New states for progressive filtering.
  const [filteredPlants, setFilteredPlants] = useState<string[]>([]);
  const [filteredSites, setFilteredSites] = useState<string[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

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
      const uniqueMaterialNumbers = [...new Set(flattenedData.map((item) => item["Material Number"]))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
      const uniquePlants = [...new Set(flattenedData.map((item) => item["Plant"]))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
      const uniqueSites = [...new Set(flattenedData.map((item) => item["Site"]))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
      const uniqueStartWeeks = Array.from({ length: 51 }, (_, i) => `WW${String(i + 2).padStart(2, "0")}`);
      setMaterialNumbers(uniqueMaterialNumbers);
      setPlants(uniquePlants);
      setSites(uniqueSites);
      setStartWeeks(uniqueStartWeeks);
    }
  }, [uploadData]);

  // Update filteredPlants when a material is selected.
  useEffect(() => {
    if (uploadData && Array.isArray(uploadData)) {
      const flatData = uploadData.flat();
      if (selectedMaterialNumber) {
        const uniquePlants = [
          ...new Set(
            flatData
              .filter((item) => item["Material Number"] === selectedMaterialNumber)
              .map((item) => item["Plant"])
          )
        ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        setFilteredPlants(uniquePlants);
      } else {
        setFilteredPlants(plants);
      }
    }
  }, [uploadData, selectedMaterialNumber, plants]);

  useEffect(() => {
    if (selectedPlant && !filteredPlants.includes(selectedPlant)) {
      setSelectedPlant(null);
    }
  }, [filteredPlants, selectedPlant]);

  useEffect(() => {
    if (uploadData && Array.isArray(uploadData)) {
      const flatData = uploadData.flat();
      let filtered = flatData;
      if (selectedMaterialNumber) {
        filtered = filtered.filter((item) => item["Material Number"] === selectedMaterialNumber);
      }
      if (selectedPlant) {
        filtered = filtered.filter((item) => item["Plant"] === selectedPlant);
      }
      const uniqueSites = [
        ...new Set(filtered.map((item) => item["Site"]))
      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      setFilteredSites(uniqueSites);
    } else {
      setFilteredSites(sites);
    }
  }, [uploadData, selectedMaterialNumber, selectedPlant]);

  useEffect(() => {
    if (selectedSite && !filteredSites.includes(selectedSite)) {
      setSelectedSite(null);
    }
  }, [filteredSites, selectedSite]);

  // Preserve the existing handleUploadComplete function
  const handleUploadComplete = (data) => {
    setUploadData(data);
    const uniqueMaterialNumbers = [...new Set(data.map((item) => item["Material Number"]))];
    const uniquePlants = [...new Set(data.map((item) => item["Plant"]))];
    const uniqueSites = [...new Set(data.map((item) => item["Site"]))];
    const uniqueStartWeeks = [...new Set(data.map((item) => item["Snapshot"]))];
    setMaterialNumbers(uniqueMaterialNumbers);
    setPlants(uniquePlants);
    setSites(uniqueSites);
    setStartWeeks(uniqueStartWeeks);
  };

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

  const plotStockPredictionPlotly = (data: any[], weeksRange: string[]) => {
    console.log(data);
    if (!data || data.length === 0 || !weeksRange || weeksRange.length === 0) {
      console.warn("No data or weeks range to plot.");
      return null;
    }

    // Only use the portion of weeksRange up until (and including) the start week.
    // The start week is assumed to be at index 'numberOfWeeks', so we slice from index 0.
    const chartWeeksRange = weeksRange.slice(0, numberOfWeeks + 1);

    const actualValues: number[] = [];
    const projectedValues: number[] = [];

    // Filter only rows where Measures === "Weeks of Stock"
    const wosRows = data.filter((row) => row.Measures === "Weeks of Stock");

    for (let i = 0; i < chartWeeksRange.length; i++) {
      const week = chartWeeksRange[i];
      // Get the actual value from the row with matching Snapshot
      const row = wosRows.find((r) => r.Snapshot === week);
      let actual = null;
      if (row && row[week] !== undefined && row[week] !== "") {
        actual = parseFloat(row[week]);
        if (isNaN(actual)) actual = null;
      }
      // For actual values, if missing (and not for the first week),
      // use the previous actual value as fallback.
      if (i === 0) {
        actualValues.push(actual !== null ? actual : 0);
      } else {
        actualValues.push(actual !== null ? actual : actualValues[i - 1]);
      }

      // For predicted values:
      if (i === 0) {
        // Use actual value if available; fallback to 0 if missing
        projectedValues.push(actual !== null ? actual : 0);
      } else {
        let projected;
        // Try to extract prediction from the previous week's row for the current week
        const prevWeek = chartWeeksRange[i - 1];
        const prevRow = wosRows.find((r) => r.Snapshot === prevWeek);
        if (prevRow && prevRow[week] !== undefined && prevRow[week] !== "") {
          projected = parseFloat(prevRow[week]);
          if (isNaN(projected)) {
            projected = projectedValues[i - 1]; // fallback to previous predicted value
          }
        } else {
          // If missing, fallback to the previous predicted value.
          projected = projectedValues[i - 1];
        }
        projectedValues.push(projected);
      }
    }

    const plotData = {
      data: [
        {
          x: chartWeeksRange,
          y: actualValues,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Actual Weeks of Stock',
          line: { color: '#0000FF', width: 3 }, // Blue color
          marker: { color: '#0000FF', size: 8 },
          connectgaps: true,
        },
        {
          x: chartWeeksRange,
          y: projectedValues,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Predicted Weeks of Stock',
          line: { color: '#8080FA', width: 3 }, // Purple color
          marker: { color: '#8080FA', size: 8 },
          connectgaps: true,
        },
      ],
      layout: {
        xaxis: {
          title: { text: 'Week', font: { color: "black" } },
          automargin: true,
        },
        yaxis: {
          title: { text: 'Weeks of Stock', font: { color: "black" } },
          automargin: true,
        },
        autosize: true,
        legend: { x: 1, y: 0.5, font: { size: 16 } },
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
        const plotData = plotStockPredictionPlotly(result, weeksRange);
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

  const handleDownloadReport = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current, { scrollY: -window.scrollY }).then(canvas => {
        const link = document.createElement("a");
        link.download = "report.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    } else {
      alert("No report available to download");
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

      <FileUploader
        type={PAGE_KEYS.HOME}
        title={PAGE_LABELS.HOME}
        fileBucketURL={WATERFALL_BUCKET_URL}
        onDataRetrieved={handleUploadComplete}
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
              // Reset downstream selections
              setSelectedPlant(null);
              setSelectedSite(null);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Material Number" />
            )}
            sx={{ width: '100%', marginBottom: 2 }}
          />

          <Autocomplete
            disablePortal
            id="plant-autocomplete"
            options={filteredPlants}
            value={selectedPlant || null}
            onChange={(event, newValue) => {
              setSelectedPlant(newValue);
              setSelectedSite(null);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Plant" />
            )}
            sx={{ width: '100%', marginBottom: 2 }}
          />

          <Autocomplete
            disablePortal
            id="site-autocomplete"
            options={filteredSites}
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

      {(analysisResult && plotData) && (
        <>
          <div className="mt-4">
            <Button variant="outlined" color="secondary" onClick={handleDownloadReport}>
              Download Report
            </Button>
          </div>
          <div ref={reportRef} style={{ padding: "20px" }}>
            {analysisResult && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Waterfall Table</h2>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell colSpan={3 + weeksRange.length} align="center">
                          <strong>Material Number:</strong> {selectedMaterialNumber} | <strong>Plant:</strong> {selectedPlant} | <strong>Site:</strong> {selectedSite}
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
                      {analysisResult.map((row, rowIndex) => (
                        <StyledTableRow key={rowIndex}>
                          <StyledTableCell component="th" scope="row">
                            {row.Snapshot}
                          </StyledTableCell>
                          <StyledTableCell align="right">{row.Measures}</StyledTableCell>
                          <StyledTableCell align="right">{row["Inventory-On-Hand"] || row["Inventory\nOn-Hand"]}</StyledTableCell>
                          {weeksRange.map((week, weekIndex) => {
                            let cellContent = "";
                            let cellBgColor = "inherit";
                            let cellTextColor = "inherit";

                            if (row.Measures === "Weeks of Stock") {
                              // Apply conditional formatting for "Weeks of Stock" rows.
                              const numericValue = parseFloat(row[week]);
                              if (!isNaN(numericValue)) {
                                if (numericValue === 0) {
                                  // 0 value: pastel yellow background with orange text.
                                  cellBgColor = "#FFF9C4";
                                  cellTextColor = "#EF6C00";
                                  cellContent = numericValue.toFixed(1);
                                } else if (numericValue > 0) {
                                  // Positive: pastel green background with dark green text.
                                  cellBgColor = "#C8E6C9";
                                  cellTextColor = "#2E7D32";
                                  cellContent = numericValue.toFixed(4);
                                } else if (numericValue < 0) {
                                  // Negative: pastel red background with dark red text.
                                  cellBgColor = "#FFCDD2";
                                  cellTextColor = "#C62828";
                                  cellContent = `(${Math.abs(numericValue).toFixed(4)})`;
                                }
                              } else {
                                // Fallback for non-numeric values.
                                cellBgColor = "#FFF9C4";
                                cellTextColor = "#EF6C00";
                                cellContent = `0`;
                              }
                              // Now apply the waterfall effect logic on top—even for "Weeks of Stock" rows.
                              if (weekIndex < weeksRange.length - 1) {
                                const cutoff = parseInt(weeksRange[weekIndex + 1].replace("WW", ""), 10);
                                const rowSnapshotNum = parseInt(row.Snapshot.replace("WW", ""), 10);
                                if (rowSnapshotNum >= cutoff) {
                                  cellBgColor = "#ADD8E6"; // blue pastel for waterfall
                                  cellTextColor = "transparent";
                                  cellContent = "";
                                }
                              }
                            } else {
                              // For non–"Weeks of Stock" rows, apply the waterfall effect logic.
                              let isWaterfall = false;
                              if (weekIndex < weeksRange.length - 1) {
                                const cutoff = parseInt(weeksRange[weekIndex + 1].replace("WW", ""), 10);
                                const rowSnapshotNum = parseInt(row.Snapshot.replace("WW", ""), 10);
                                // If the row's snapshot is greater than or equal to the next week's number, mark as waterfall.
                                isWaterfall = rowSnapshotNum >= cutoff;
                              }
                              if (isWaterfall) {
                                cellBgColor = "#ADD8E6"; // blue pastel
                                cellTextColor = "transparent";
                                cellContent = "";
                              } else {
                                if (row[week] !== undefined && row[week] !== "" && !isNaN(Number(row[week]))) {
                                  cellContent = parseFloat(row[week]).toFixed(1);
                                } else {
                                  cellContent = row[week] || "-";
                                }
                              }
                            }

                            return (
                              <StyledTableCell
                                key={week}
                                align="right"
                                sx={{
                                  backgroundColor: cellBgColor,
                                  color: cellTextColor,
                                }}
                              >
                                {cellContent}
                              </StyledTableCell>
                            );
                          })}
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {plotData && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Actual vs. Predicted Weeks of Stock</h2>
                <Plot data={plotData.data} layout={plotData.layout} style={{ width: "100%", height: "100%" }} />
              </div>
            )}

            {/* Conclusion Section */}
            {plotData && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Conclusion</h2>
                <Paper variant="outlined" sx={{ p: 2, background: "#fff" }}>
                  <div style={{ background: "#BFE4F6", color: "#228B22", fontWeight: "bold", padding: "4px 8px", marginBottom: 8 }}>
                    NO RISK.<br />
                    <span style={{ color: "#228B22" }}>No shortage within lead time.{analysisMessages}</span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Root cause</strong>
                    <div style={{ marginLeft: 16 }}>
                      Insufficient PO coverage to consider on hand expiry &amp; 13 WOS demand during IQ to QU<br />
                      <span style={{ color: "#D32F2F", fontWeight: "bold" }}>
                        Material expired 28kg on 8/6 WW32. Based on LT 9 weeks, order should be loaded by WW23 from NPI team to cover 13 wos based on demand with buffer.<br />
                        Actual PO loaded time: WW27
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Inventory status</strong>
                    <div style={{ marginLeft: 16 }}>
                      Confirmed with POM &amp; ZH: forwarded 44kg to HVM, keep 16kg for NPI Build (Samsung)<br />
                      <strong>Action:</strong> Explore expired material for NPI build
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Current demand status</strong>
                    <div style={{ marginLeft: 16 }}>
                      <strong>Action:</strong> Request MP to clarify the demand is included in NPI (DC/DOQ/QS)
                    </div>
                  </div>
                  <div>
                    <strong>Current PO status:</strong>
                    <div style={{ marginLeft: 16 }}>
                      NPI PO: 60kg ETA 8/8 (received), another 30kg just loaded on 8/6 WW32. no ETA yet.<br />
                      As per WW32, no HVM open order. Highlighted to MP to review and raise manual PO if needed to cover Dec onwards based on 44kg available stock.
                    </div>
                  </div>
                </Paper>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}