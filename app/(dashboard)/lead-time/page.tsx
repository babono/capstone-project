// @ts-nocheck
"use client";
import { GOODS_RECEIPT_BUCKET_URL, ORDER_PLACEMENT_BUCKET_URL, PAGE_KEYS, PAGE_LABELS, SHORTAGE_REPORT_BUCKET_URL } from "@/app/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUploader from "../common/file-uploader";
import { useEffect, useState } from "react";
import { Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function LeadTime() {
  // NextAuth session
  const { data: session, status } = useSession();
  const router = useRouter();
  const PAGE_LABEL = PAGE_LABELS.LEAD_TIME;

  // State Variables
  const [orderPlacementData, setOrderPlacementData] = useState([]);
  const [goodsReceiptData, setGoodsReceiptData] = useState([]);
  const [shortageReportData, setShortageReportData] = useState([]);

  // Processed Data States
  const [matchedData, setMatchedData] = useState([]);
  const [unmatchedOpData, setUnmatchedOpData] = useState([]);
  const [unmatchedGrData, setUnmatchedGrData] = useState([]);
  const [actualLeadTimeData, setActualLeadTimeData] = useState([]);
  const [leadTimeSummary, setLeadTimeSummary] = useState([]);
  const [leadTimeDifferences, setLeadTimeDifferences] = useState([]);

  // State for storing the filter data
  const [filteredFinalResult, setFilteredFinalResult] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [suppliers, setSuppliers] = useState([]);

  // Date Filter Handling
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/login");
  }, [session, status, router]);

  const handleOrderPlacementData = (data) => {
    setOrderPlacementData(data);
  };

  const handleGoodsReceiptData = (data) => {
    setGoodsReceiptData(data);

    setMinDate(oldestDate);
    setMaxDate(newestDate);
    setDateRange([oldestDate, newestDate]);
  };

  const handleShortageReportData = (data) => {
    setShortageReportData(data);
  };

  // To process JSON data retrieved from the backend project
  const processDataframes = (opDf, grDf) => {
    const merged = [];

    // Iterate through opDf and find all matches in grDf
    opDf.forEach((opRow) => {
      const matches = grDf.filter(
        (grRow) =>
          opRow["Material Number"] === grRow["Material Number"] &&
          opRow["Purchasing Document"] === grRow["Purchasing Document"] &&
          opRow["Plant"] === grRow["Plant"]
      );

      if (matches.length > 0) {
        // Add all matching rows to the merged array
        matches.forEach((match) => {
          merged.push({
            ...opRow,
            ...match,
            _merge: "both",
          });
        });
      } else {
        // Add unmatched rows from opDf
        merged.push({
          ...opRow,
          _merge: "left_only",
        });
      }
    });

    // Add unmatched rows from grDf
    grDf.forEach((grRow) => {
      const isMatched = opDf.some(
        (opRow) =>
          opRow["Material Number"] === grRow["Material Number"] &&
          opRow["Purchasing Document"] === grRow["Purchasing Document"] &&
          opRow["Plant"] === grRow["Plant"]
      );

      if (!isMatched) {
        merged.push({
          ...grRow,
          _merge: "right_only",
        });
      }
    });

    // Filter for matches
    const matched = merged.filter((row) => row._merge === "both").map((row) => {
      return {
        ...row,
        "Combined Date": `${row["Document Date"] || ""} | ${row["Pstng Date"] || ""}`,
      };
    });

    // Filter for unmatched rows
    const unmatchedOp = merged.filter((row) => row._merge === "left_only");
    const unmatchedGr = merged.filter((row) => row._merge === "right_only");

    return { matched, unmatchedOp, unmatchedGr };
  };

  // To process actual lead time calculation
  const calculateActualLeadTime = (matchedData) => {
    if (!Array.isArray(matchedData) || matchedData.length === 0) {
      console.warn("Invalid or empty matchedData provided.");
      return [];
    }

    return matchedData.map((row) => {
      const documentDate = new Date(row["Document Date"]);
      const postingDate = new Date(row["Pstng Date"]);

      // Ensure both dates are valid
      if (isNaN(documentDate.getTime()) || isNaN(postingDate.getTime())) {
        return {
          ...row,
          "Actual Lead Time": null, // Invalid dates result in null lead time
        };
      }

      // Calculate the difference in days
      const actualLeadTime = Math.ceil((postingDate.getTime() - documentDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...row,
        "Actual Lead Time": actualLeadTime,
      };
    });
  };

  // To process lead time summary
  const calculateLeadTimeSummary = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("Invalid or empty shortageReportData provided.");
      return [];
    }

    const leadTimeCol = "Lead Time\n(Week)";
    const grouped = data.reduce((acc, row) => {
      const materialNum = row["Material Number"];
      if (!acc[materialNum]) acc[materialNum] = [];
      acc[materialNum].push(row);
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([materialNum, group]) => {
      const plant = group[0]["Plant"];
      const site = group[0]["Site"];
      const materialGroup = group[0]["Material Group"];
      const supplier = group[0]["Supplier"];
      const leadTimes = group[0][leadTimeCol];

      const maxLeadTime = leadTimes || null;
      const minLeadTime = leadTimes || null;

      return {
        Plant: plant,
        Site: site,
        "Material Group": materialGroup,
        "Material Number": materialNum,
        Supplier: supplier,
        "Max Lead Time": maxLeadTime,
        "Min Lead Time": minLeadTime,
      };
    });

    return result;
  };

  // To calculate lead time differences
  const calculateLeadTimeDifferences = (finalData, actualData) => {
    if (!Array.isArray(finalData) || !Array.isArray(actualData)) {
      console.warn("Invalid input data provided.");
      return [];
    }

    // Step 1: Find common Material-Plant combinations
    const materialPlantInBoth = finalData.filter((finalRow) =>
      actualData.some(
        (actualRow) =>
          finalRow["Material Number"] === actualRow["Material Number"] &&
          finalRow["Plant"] === actualRow["Plant"]
      )
    );

    // Step 2: Convert Max and Min Lead Time to days
    const processedFinalData = materialPlantInBoth.map((row) => ({
      ...row,
      "Max Lead Time (Days)": row["Max Lead Time"] * 7,
      "Min Lead Time (Days)": row["Min Lead Time"] * 7,
      "Mean Final Lead Time Days":
        (row["Max Lead Time"] * 7 + row["Min Lead Time"] * 7) / 2,
    }));

    // Step 3: Compute Mean Actual Lead Time per Material Number
    const meanActualLeadTime = actualData.reduce((acc, row) => {
      const materialNumber = row["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { total: 0, count: 0 };
      }
      acc[materialNumber].total += row["Actual Lead Time"];
      acc[materialNumber].count += 1;
      return acc;
    }, {});

    const meanActualLeadTimeArray = Object.entries(meanActualLeadTime).map(
      ([materialNumber, { total, count }]) => ({
        "Material Number": materialNumber,
        "Mean Actual Lead Time (Days)": total / count,
      })
    );

    // Step 4: Merge Mean Actual Lead Time with Final Data
    const mergedData = processedFinalData.map((finalRow) => {
      const actualRow = meanActualLeadTimeArray.find(
        (actual) => actual["Material Number"] === finalRow["Material Number"]
      );

      const meanActualLeadTimeDays = actualRow
        ? actualRow["Mean Actual Lead Time (Days)"]
        : null;

      // Step 5: Compute Lead Time Difference
      const leadTimeDifference =
        meanActualLeadTimeDays !== null
          ? meanActualLeadTimeDays - finalRow["Mean Final Lead Time Days"]
          : null;

      return {
        ...finalRow,
        "Mean Actual Lead Time (Days)": meanActualLeadTimeDays,
        "Lead Time Difference (Days)": leadTimeDifference,
      };
    });

    return mergedData;
  };

  // Process DataFrames when both datasets are available
  useEffect(() => {
    if (orderPlacementData.length > 0 && goodsReceiptData.length > 0) {
      const { matched, unmatchedOp, unmatchedGr } = processDataframes(orderPlacementData, goodsReceiptData);
      setMatchedData(matched);
      setUnmatchedOpData(unmatchedOp);
      setUnmatchedGrData(unmatchedGr);
    }
  }, [orderPlacementData, goodsReceiptData]);

  // Calculate Actual Lead Time when matchedData is updated
  useEffect(() => {
    if (matchedData.length > 0) {
      const calculatedData = calculateActualLeadTime(matchedData);
      setActualLeadTimeData(calculatedData);
    }
  }, [matchedData]);

  // Calculate Lead Time Summary when shortageReportData is updated
  useEffect(() => {
    if (shortageReportData.length > 0) {
      const summary = calculateLeadTimeSummary(shortageReportData);
      setLeadTimeSummary(summary);
    }
  }, [shortageReportData]);

  // Calculate Lead Time Differences when both leadTimeSummary and actualLeadTimeData are available
  useEffect(() => {
    if (leadTimeSummary.length > 0 && actualLeadTimeData.length > 0) {
      const differences = calculateLeadTimeDifferences(leadTimeSummary, actualLeadTimeData);
      setLeadTimeDifferences(differences);
      setFilteredFinalResult(differences);
    }
  }, [leadTimeSummary, actualLeadTimeData]);

  // Populate suppliers when leadTimeDifferences changes
  useEffect(() => {
    if (leadTimeDifferences.length > 0) {
      const uniqueSuppliers = [
        "All",
        ...new Set(leadTimeDifferences.map((row) => row["Supplier"] || "Unknown")),
      ];
      setSuppliers(uniqueSuppliers);
    }
  }, [leadTimeDifferences]);

  // Handle Supplier Selection
  const handleSupplierChange = (event) => {
    const value = event.target.value;
    setSelectedSupplier(value);

    if (value === "All") {
      setFilteredFinalResult(leadTimeDifferences);
    } else {
      const filtered = leadTimeDifferences.filter(
        (row) => row["Supplier"] === value
      );
      setFilteredFinalResult(filtered);
    }
  };

  // Handle Date Range Selection
  const handleDateRangeChange = (newValue) => {
    setDateRange(newValue);

    if (!newValue || newValue.length !== 2 || !newValue[0] || !newValue[1]) {
      return;
    }

    const [startDate, endDate] = newValue;

    // Filter Goods Receipt Data by Date Range
    const filteredGrData = goodsReceiptData.filter((row) => {
      const postingDate = new Date(row["Pstng Date"]);
      return postingDate >= startDate && postingDate <= endDate;
    });

    // Recalculate matched, calculatedData, and finalResult based on filteredGrData
    const { matched } = processDataframes(orderPlacementData, filteredGrData);
    const calculatedData = calculateActualLeadTime(matched);
    const updatedFinalResult = calculateLeadTimeDifferences(
      leadTimeSummary,
      calculatedData
    );

    setLeadTimeDifferences(updatedFinalResult);

    // Apply Supplier Filter if a supplier is already selected
    if (selectedSupplier === "All") {
      setFilteredFinalResult(updatedFinalResult);
    } else {
      const filtered = updatedFinalResult.filter(
        (row) => row["Supplier"] === selectedSupplier
      );
      setFilteredFinalResult(filtered);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{PAGE_LABEL} Analysis</h1>

      <FileUploader
        type={PAGE_KEYS.ORDER_PLACEMENT}
        title={PAGE_LABELS.ORDER_PLACEMENT}
        fileBucketURL={ORDER_PLACEMENT_BUCKET_URL}
        onDataRetrieved={handleOrderPlacementData}
      />
      <FileUploader
        type={PAGE_KEYS.GOODS_RECEIPT}
        title={PAGE_LABELS.GOODS_RECEIPT}
        fileBucketURL={GOODS_RECEIPT_BUCKET_URL}
        onDataRetrieved={handleGoodsReceiptData}
      />
      <FileUploader
        type={PAGE_KEYS.SHORTAGE_REPORT}
        title={PAGE_LABEL}
        fileBucketURL={SHORTAGE_REPORT_BUCKET_URL}
        onDataRetrieved={handleShortageReportData}
      />

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

      {/* Display Processed Data */}
      {filteredFinalResult.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-4">Filtered Results</h2>
          <p>Length: {filteredFinalResult.length}</p>
          <pre>{JSON.stringify(filteredFinalResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}