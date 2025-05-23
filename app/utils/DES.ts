// @ts-nocheck
// This file is being used for the Inventory Simulation page.

import * as ss from "simple-statistics"; // Import simple-statistics for statistical calculations

export const preprocess_data_consumption = (data) => {
  const trimmedData = data.map((row) => {
    const trimmedRow = {};
    Object.keys(row).forEach((key) => {
      trimmedRow[key.trim()] = row[key];
    });
    return trimmedRow;
  });

  const validData = trimmedData.filter((row) => {
    row["Pstng Date"] = new Date(row["Pstng Date"]);
    return !isNaN(row["Pstng Date"]);
  });

  validData.forEach((row) => {
    const date = row["Pstng Date"];
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    row["Week"] = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  });

  const groupedData = {};
  validData.forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}_${row["Week"]}`;
    if (!groupedData[key]) {
      groupedData[key] = { ...row, Quantity: 0 };
    }
    groupedData[key].Quantity += Math.abs(row["Quantity"]);
  });

  const pivotData = {};
  Object.values(groupedData).forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}`;
    if (!pivotData[key]) {
      pivotData[key] = {
        "Material Number": row["Material Number"],
        Plant: row["Plant"],
        Site: row["Site"],
        BUn: row["BUn"],
      };
    }
    pivotData[key][`WW${row["Week"]}_Consumption`] = row["Quantity"];
  });

  return Object.values(pivotData).map((row) => {
    Object.keys(row).forEach((key) => {
      if (key.startsWith("WW") && row[key] === undefined) {
        row[key] = 0;
      }
    });
    return row;
  });
};

export const preprocess_data_GR = (data) => {
  const trimmedData = data.map((row) => {
    const trimmedRow = {};
    Object.keys(row).forEach((key) => {
      trimmedRow[key.trim()] = row[key];
    });
    return trimmedRow;
  });

  const validData = trimmedData.filter((row) => {
    row["Pstng Date"] = new Date(row["Pstng Date"]);
    return !isNaN(row["Pstng Date"]);
  });

  validData.forEach((row) => {
    const date = row["Pstng Date"];
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    row["Week"] = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  });

  const groupedData = {};
  validData.forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}_${row["Week"]}`;
    if (!groupedData[key]) {
      groupedData[key] = { ...row, Quantity: 0 };
    }
    groupedData[key].Quantity += Math.abs(row["Quantity"]);
  });

  const pivotData = {};
  Object.values(groupedData).forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}`;
    if (!pivotData[key]) {
      pivotData[key] = {
        "Material Number": row["Material Number"],
        Plant: row["Plant"],
        Site: row["Site"],
      };
    }
    pivotData[key][`WW${row["Week"]}_GR`] = row["Quantity"];
  });

  return Object.values(pivotData).map((row) => {
    Object.keys(row).forEach((key) => {
      if (key.startsWith("WW") && row[key] === undefined) {
        row[key] = 0;
      }
    });
    return row;
  });
};

export const preprocess_data_OP = (data) => {
  const trimmedData = data.map((row) => {
    const trimmedRow = {};
    Object.keys(row).forEach((key) => {
      trimmedRow[key.trim()] = row[key];
    });
    return trimmedRow;
  });

  const validData = trimmedData.filter((row) => {
    row["Document Date"] = new Date(row["Document Date"]);
    return !isNaN(row["Document Date"]);
  });

  validData.forEach((row) => {
    const date = row["Document Date"];
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    row["Week"] = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  });

  const groupedData = {};
  validData.forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}_${row["Week"]}`;
    if (!groupedData[key]) {
      groupedData[key] = { ...row, "Order Quantity": 0 };
    }
    groupedData[key]["Order Quantity"] += Math.abs(row["Order Quantity"]);
  });

  const pivotData = {};
  Object.values(groupedData).forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}`;
    if (!pivotData[key]) {
      pivotData[key] = {
        "Material Number": row["Material Number"],
        Plant: row["Plant"],
      };
    }
    pivotData[key][`WW${row["Week"]}_OP`] = row["Order Quantity"];
  });

  return Object.values(pivotData).map((row) => {
    Object.keys(row).forEach((key) => {
      if (key.startsWith("WW") && row[key] === undefined) {
        row[key] = 0;
      }
    });
    return row;
  });
};

export const process_lead_time = (data: any[]) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { meanLeadTime: 0, stdDevLeadTime: 0 };
  }

  // Filter columns that include "Lead Time" in their name
  const leadTimeColumns = Object.keys(data[0]).filter((key) =>
    key.toLowerCase().includes("lead time")
  );

  if (leadTimeColumns.length === 0) {
    return { meanLeadTime: 0, stdDevLeadTime: 0 };
  }

  // Extract and process lead time values
  const leadTimeValues = data
    .map((row) => {
      const leadTimeRow = leadTimeColumns.map((col) => {
        const value = parseFloat(row[col]);
        return isNaN(value) ? 0 : value; // Replace NaN with 0
      });
      return leadTimeRow.reduce((sum, val) => sum + val, 0); // Sum all lead time values in the row
    })
    .filter((value) => value > 0); // Remove rows with zero lead time

  if (leadTimeValues.length === 0) {
    return { meanLeadTime: 0, stdDevLeadTime: 0 };
  }

  // Calculate maximum lead time
  const maxLeadTime = Math.max(...leadTimeValues);

  // Calculate mean lead time
  const meanLeadTime =
    leadTimeValues.reduce((sum, value) => sum + value, 0) /
    leadTimeValues.length;

  // Calculate standard deviation
  const variance =
    leadTimeValues.reduce(
      (sum, value) => sum + Math.pow(value - meanLeadTime, 2),
      0
    ) / leadTimeValues.length;
  const stdDevLeadTime = Math.sqrt(variance);

  // Return results
  return {
    maxLeadTime: parseFloat(maxLeadTime.toFixed(2)),
    meanLeadTime: parseFloat(meanLeadTime.toFixed(2)),
    stdDevLeadTime: parseFloat(stdDevLeadTime.toFixed(2)),
  };
};

export const fit_distribution = (data: number[], label: string) => {
  if (!data || data.length === 0) {
    return {
      bestDistributionName: "No data",
      bestDistributionParams: [],
    };
  }

  // Define distributions to test
  const distributions = [
    {
      name: "Normal",
      fit: (data: number[]) => {
        const mean = ss.mean(data);
        const stdDev = ss.standardDeviation(data);
        return {
          params: [mean, stdDev],
          cdf: (x: number) =>
            ss.cumulativeStdNormalProbability((x - mean) / stdDev),
        };
      },
    },
    {
      name: "Exponential Power",
      fit: (data: number[]) => {
        const mean = ss.mean(data);
        const stdDev = ss.standardDeviation(data);
        const beta = 1.5; // Example beta value (adjust as needed)
        return {
          params: [beta, mean, stdDev],
          cdf: (x: number) => {
            // Custom CDF logic for Exponential Power
            const z = (x - mean) / stdDev;
            return Math.exp(-Math.pow(Math.abs(z), beta));
          },
        };
      },
    },
    {
      name: "Uniform",
      fit: (data: number[]) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        return {
          params: [min, max],
          cdf: (x: number) =>
            x < min ? 0 : x > max ? 1 : (x - min) / (max - min),
        };
      },
    },
  ];

  // Perform goodness-of-fit testing (e.g., Kolmogorov-Smirnov test)
  let bestDistributionName = "";
  let bestDistributionParams: number[] = [];
  let bestKSStatistic = Infinity;

  distributions.forEach((dist) => {
    const { params, cdf } = dist.fit(data);

    // Calculate the Kolmogorov-Smirnov statistic
    const ksStatistic = data.reduce((maxDiff, value) => {
      const empiricalCDF = data.filter((d) => d <= value).length / data.length;
      const theoreticalCDF = cdf(value);
      return Math.max(maxDiff, Math.abs(empiricalCDF - theoreticalCDF));
    }, 0);

    // Update the best distribution if the KS statistic is smaller
    if (ksStatistic < bestKSStatistic) {
      bestKSStatistic = ksStatistic;
      bestDistributionName = dist.name;
      bestDistributionParams = params;
    }
  });

  return {
    bestDistributionName,
    bestDistributionParams,
  };
};
