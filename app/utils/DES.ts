// @ts-nocheck
// This file is being used for the Inventory Simulation page.

import * as jstat from "jstat";

type DistributionParams = number[];

type SimulationResult = [
  any[], // inventoryHistory
  any[], // proactiveInventoryHistory
  number[], // stockoutWeeks
  number[], // proactiveStockoutWeeks
  number[], // wosHistory
  number[], // proactiveWosHistory
  number[], // consumptionHistory
  any[] // weeklyEvents
];

type WeeklyEventData = {
  "Week Number": number;
  "Initial Inventory (Reactive)": number;
  "Initial Inventory (Proactive)": number;
  "Reactive Order Arrived": number | null;
  "Proactive Order Arrived": number | null;
  "Interim Inventory (Reactive)": number | null;
  "Interim Inventory (Proactive)": number | null;
  "Predicted Consumption for Next Few Weeks (Sum)": number;
  "Consumption": number;
  "End of Week Inventory (Proactive)": number;
  "End of Week Inventory (Reactive)": number;
  "Proactive Order Placed": number;
  "Reactive Order Arrival Week": number | null;
  "Reactive Order Placed": number;
  "Proactive Order Arrival Week": number | null;
  "Stockout": boolean;
};

// Calculation Functions

const calculateMSE = (data: number[], pdf: (x: number) => number): number => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const nBins = 100;
  const binWidth = (max - min) / nBins;
  const binCenters = Array.from(
    { length: nBins },
    (_, i) => min + binWidth * (i + 0.5)
  );
  const empiricalHist = jstat.histogram(data, nBins);
  const pdfValues = binCenters.map(pdf);
  const mse = empiricalHist.reduce(
    (sum: number, count: number, i: number) =>
      sum + Math.pow(count - pdfValues[i], 2),
    0
  );
  return mse;
};

const meanArray = (arrays: number[][]): number[] => {
  const n = arrays.length;
  if (n === 0) return [];

  const length = arrays[0].length;
  const sum = new Array(length).fill(0);

  for (const arr of arrays) {
    for (let i = 0; i < length; i++) {
      sum[i] += arr[i];
    }
  }

  return sum.map((s) => s / n);
};

// Process Functions

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

export const process_lead_time = (
  dataFrame: Record<string, any>[]
): [number, number, string | null, number[] | null] => {
  if (
    !dataFrame ||
    dataFrame.length === 0 ||
    typeof dataFrame[0] !== "object"
  ) {
    throw new Error("Invalid or empty DataFrame");
  }

  const row = dataFrame[0];
  const leadTimeKeys = Object.keys(row).filter((k) =>
    k.toLowerCase().includes("lead time")
  );
  const leadTimeValues = leadTimeKeys
    .map((k) => parseFloat(row[k]))
    .filter((v) => !isNaN(v));

  const maxLeadTime = Math.max(...leadTimeValues);
  const stdLeadTime = jstat.stdev(leadTimeValues, false);

  if (isNaN(maxLeadTime) || isNaN(stdLeadTime)) {
    return [0, 0, null, null];
  }

  const [bestDistParams, bestDistName] =
    fit_distribution_lead_time(leadTimeValues);

  return [
    parseFloat(maxLeadTime.toFixed(2)),
    parseFloat(stdLeadTime.toFixed(2)),
    bestDistName,
    bestDistParams,
  ];
};

export const calculate_safety_stock = (
  distName: string,
  distParams: number[],
  serviceLevelPercentage: number,
  stdLeadTime: number
): number => {
  const zScore = jstat.normal.inv(serviceLevelPercentage / 100, 0, 1);

  switch (distName) {
    case "Normal":
      return zScore * stdLeadTime;

    case "Gamma": {
      const [shape, loc, scale] = distParams;
      return (
        jstat.gamma.inv(serviceLevelPercentage / 100, shape, scale) +
        loc -
        (shape * scale + loc)
      );
    }

    case "Weibull": {
      const [shape, loc, scale] = distParams;
      return (
        jstat.weibull.inv(serviceLevelPercentage / 100, shape, scale) +
        loc -
        scale * (1 + jstat.eulerGamma * shape)
      );
    }

    case "Log-Normal": {
      const [shape, loc, scale] = distParams;
      return (
        jstat.lognormal.inv(serviceLevelPercentage / 100, shape, scale) +
        loc -
        Math.exp(loc + scale ** 2 / 2)
      );
    }

    case "Exponential": {
      const [loc, scale] = distParams;
      return (
        jstat.exponential.inv(serviceLevelPercentage / 100, 1 / scale) +
        loc -
        scale
      );
    }

    case "Beta": {
      const [a, b, loc, scale] = distParams;
      return (
        jstat.beta.inv(serviceLevelPercentage / 100, a, b) * scale +
        loc -
        a / (a + b)
      );
    }

    case "Poisson": {
      const mu = distParams[0];
      return zScore * Math.sqrt(mu);
    }

    case "Negative Binomial": {
      const [mean, dispersion] = distParams;
      const variance = mean + dispersion * mean;
      return zScore * Math.sqrt(variance);
    }

    case "Zero-Inflated Poisson": {
      const mu = distParams[1];
      return zScore * Math.sqrt(mu);
    }

    case "Zero-Inflated Negative Binomial": {
      const [dispersion, mean] = distParams;
      const variance = mean + dispersion * mean;
      return zScore * Math.sqrt(variance);
    }

    default:
      return zScore * stdLeadTime;
  }
};

export const get_mean_from_distribution = (
  distributionName: string,
  distributionParams: number[]
): number | null => {
  if (!distributionParams) return null;

  try {
    switch (distributionName) {
      case "cauchy": {
        const [loc] = distributionParams;
        return loc;
      }

      case "chi2": {
        const [df, loc] = distributionParams;
        return df + loc;
      }

      case "expon": {
        const [loc, scale] = distributionParams;
        return loc + scale;
      }

      case "exponpow": {
        const [b, loc, scale] = distributionParams;
        return loc + scale * Math.pow(1 - Math.exp(-1), 1 / b);
      }

      case "gamma": {
        const [a, loc, scale] = distributionParams;
        return a * scale + loc;
      }

      case "lognorm": {
        const [s, loc, scale] = distributionParams;
        return Math.exp(Math.log(scale) + s ** 2 / 2) + loc;
      }

      case "norm": {
        const [loc] = distributionParams;
        return loc;
      }

      case "powerlaw": {
        const [a, loc, scale] = distributionParams;
        return loc + scale * (a / (a + 1));
      }

      case "rayleigh": {
        const [loc, scale] = distributionParams;
        return loc + scale * Math.sqrt(Math.PI / 2);
      }

      case "uniform": {
        const [loc, scale] = distributionParams;
        return loc + scale / 2;
      }

      default:
        return null;
    }
  } catch (e) {
    console.error(`Error calculating mean: ${e}`);
    return null;
  }
};

export const fit_distribution = (
  dataValues: number[],
  dataType = "Consumption"
): [number[] | null, string | null] => {
  try {
    const data = dataValues.filter((v) => v > 0);
    if (data.length === 0) throw new Error("No positive values in dataset");

    const mean = jstat.mean(data);
    const std = jstat.stdev(data, true);

    const candidates = [];

    // Normal
    candidates.push({
      name: "Normal",
      params: [mean, std],
      mse: calculateMSE(data, (x) => jstat.normal.pdf(x, mean, std)),
    });

    // Exponential
    const lambda = 1 / mean;
    candidates.push({
      name: "Exponential",
      params: [0, 1 / lambda], // loc, scale
      mse: calculateMSE(data, (x) => jstat.exponential.pdf(x, lambda)),
    });

    // Gamma
    const shape = (mean / std) ** 2;
    const scale = std ** 2 / mean;
    candidates.push({
      name: "Gamma",
      params: [shape, 0, scale], // shape, loc, scale
      mse: calculateMSE(data, (x) => jstat.gamma.pdf(x, shape, scale)),
    });

    // LogNormal
    const mu = Math.log(mean ** 2 / Math.sqrt(std ** 2 + mean ** 2));
    const sigma = Math.sqrt(Math.log(1 + std ** 2 / mean ** 2));
    candidates.push({
      name: "Log-Normal",
      params: [sigma, 0, Math.exp(mu)], // shape, loc, scale
      mse: calculateMSE(data, (x) => jstat.lognormal.pdf(x, mu, sigma)),
    });

    // Weibull (approximate estimation)
    const weibullShape = 2; // fixed shape for simplification
    const weibullScale = mean / jstat.gammafn(1 + 1 / weibullShape);
    candidates.push({
      name: "Weibull",
      params: [weibullShape, 0, weibullScale],
      mse: calculateMSE(data, (x) =>
        jstat.weibull.pdf(x, weibullShape, weibullScale)
      ),
    });

    const best = candidates.reduce(
      (min, dist) => (dist.mse < min.mse ? dist : min),
      candidates[0]
    );
    console.log(
      `✅ Best ${dataType} Distribution: ${best.name} with parameters:`,
      best.params
    );

    return [best.params, best.name];
  } catch (err) {
    console.error(`❌ Error fitting distribution for ${dataType}:`, err);
    return [null, null];
  }
};

export const fit_distribution_lead_time = (
  dataValues: number[],
  dataType = "Lead Time"
): [number[] | null, string | null] => {
  try {
    const [params, name] = fit_distribution(dataValues, dataType);
    if (!name) {
      console.warn(`⚠️ Could not find a suitable distribution for ${dataType}`);
      return [null, null];
    }
    return [params, name];
  } catch (err) {
    console.error(`❌ Error fitting distribution for ${dataType}:`, err);
    return [null, null];
  }
};

export const find_best_distribution = (
  data: number[],
  includeZeroInflated = false,
  includeHurdle = false
): [string | null, number[] | null] => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Input data must be a non-empty array");
    }

    // Remove non-positive values for continuous distributions
    const dataPositive = data.filter((d) => d > 0);
    if (dataPositive.length === 0) {
      throw new Error("No positive values in dataset");
    }

    // Check for zero-inflation
    const total = data.length;
    const zeroCount = data.filter((d) => d === 0).length;
    const zeroFraction = zeroCount / total;
    console.log(`Zero fraction: ${zeroFraction}`);
    // Optionally use `includeZeroInflated` or `includeHurdle` flags here for further processing

    // Reuse the already available fitDistribution logic
    const [params, name] = fit_distribution(dataPositive, "Custom");
    return [name, params];
  } catch (err) {
    console.error("❌ Error in findBestDistribution:", err);
    return [null, null];
  }
};

export const get_std_from_distribution = (
  distributionName: string,
  distributionParams: number[] | null
): number | null => {
  if (!distributionParams) return null;

  try {
    switch (distributionName) {
      case "cauchy": {
        const [, scale] = distributionParams;
        return scale;
      }
      case "chi2": {
        const [df] = distributionParams;
        return Math.sqrt(2 * df);
      }
      case "expon": {
        const [, scale] = distributionParams;
        return scale;
      }
      case "exponpow": {
        const [b, , scale] = distributionParams;
        return (
          scale *
          Math.pow(1 - Math.exp(-1), 1 / b) *
          Math.sqrt(1 - Math.pow(1 - Math.exp(-1), 2 / b))
        );
      }
      case "gamma": {
        const [a, , scale] = distributionParams;
        return Math.sqrt(a) * scale;
      }
      case "lognorm": {
        const [s, , scale] = distributionParams;
        return Math.sqrt(
          (Math.exp(s ** 2) - 1) * Math.exp(2 * Math.log(scale) + s ** 2)
        );
      }
      case "norm": {
        const [, sigma] = distributionParams;
        return sigma;
      }
      case "powerlaw": {
        const [a, , scale] = distributionParams;
        return (
          scale *
          Math.sqrt(a / (a + 2)) *
          Math.sqrt(1 - Math.pow(a / (a + 1), 2))
        );
      }
      case "rayleigh": {
        const [, scale] = distributionParams;
        return scale * Math.sqrt((4 - Math.PI) / 2);
      }
      case "uniform": {
        const [, scale] = distributionParams;
        return scale / Math.sqrt(12);
      }
      default:
        return null;
    }
  } catch (e) {
    console.error("Error calculating standard deviation:", e);
    return null;
  }
};

export const run_monte_carlo_simulation = async (
  N: number,
  simulateInventory: (...args: any[]) => SimulationResult,
  args: any[],
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<{
  allInventoryHistories: any[][];
  allProactiveInventoryHistories: any[][];
  allStockoutWeeks: number[][];
  allProactiveStockoutWeeks: number[][];
  allWosHistories: number[][];
  allProactiveWosHistories: number[][];
  allConsumptionHistories: number[][];
  allWeeklyEvents: any[][];
}> => {
  const allInventoryHistories: any[][] = [];
  const allProactiveInventoryHistories: any[][] = [];
  const allStockoutWeeks: number[][] = [];
  const allProactiveStockoutWeeks: number[][] = [];
  const allWosHistories: number[][] = [];
  const allProactiveWosHistories: number[][] = [];
  const allConsumptionHistories: number[][] = [];
  const allWeeklyEvents: any[][] = [];

  for (let i = 0; i < N; i++) {
    // Simulate sleep like time.sleep(0.01)
    await new Promise((res) => setTimeout(res, 10));

    const [
      inventoryHistory,
      proactiveInventoryHistory,
      stockoutWeeks,
      proactiveStockoutWeeks,
      wosHistory,
      proactiveWosHistory,
      consumptionHistory,
      weeklyEvents,
    ] = simulateInventory(...args);

    allInventoryHistories.push(inventoryHistory);
    allProactiveInventoryHistories.push(proactiveInventoryHistory);
    allStockoutWeeks.push(stockoutWeeks);
    allProactiveStockoutWeeks.push(proactiveStockoutWeeks);
    allWosHistories.push(wosHistory);
    allProactiveWosHistories.push(proactiveWosHistory);
    allConsumptionHistories.push(consumptionHistory);
    allWeeklyEvents.push(weeklyEvents);

    if (onProgress) {
      onProgress((i + 1) / N, i + 1, N);
    }
  }

  // Final sleep like time.sleep(1)
  await new Promise((res) => setTimeout(res, 1000));

  return {
    allInventoryHistories,
    allProactiveInventoryHistories,
    allStockoutWeeks,
    allProactiveStockoutWeeks,
    allWosHistories,
    allProactiveWosHistories,
    allConsumptionHistories,
    allWeeklyEvents,
  };
};

export const compute_averages = (
  allInventoryHistories: number[][],
  allProactiveInventoryHistories: number[][],
  allStockoutWeeks: number[][],
  allProactiveStockoutWeeks: number[][],
  allWosHistories: number[][],
  allProactiveWosHistories: number[][],
  allConsumptionHistories: number[][]
): {
  avgInventory: number[];
  avgWos: number[];
  avgConsumption: number[];
  stockoutFrequency: number;
  avgProactiveInventory: number[];
  avgProactiveWos: number[];
  stockoutFrequencyProactive: number;
} => {
  const avgInventory = meanArray(allInventoryHistories);
  const avgProactiveInventory = meanArray(allProactiveInventoryHistories);
  const avgWos = meanArray(allWosHistories);
  const avgProactiveWos = meanArray(allProactiveWosHistories);
  const avgConsumption = meanArray(allConsumptionHistories);

  const stockoutFrequency =
    allStockoutWeeks.filter((weeks) => weeks.length > 0).length /
    allStockoutWeeks.length;

  const stockoutFrequencyProactive =
    allProactiveStockoutWeeks.filter((weeks) => weeks.length > 0).length /
    allProactiveStockoutWeeks.length;

  return {
    avgInventory,
    avgWos,
    avgConsumption,
    stockoutFrequency,
    avgProactiveInventory,
    avgProactiveWos,
    stockoutFrequencyProactive,
  };
};

export const find_representative_run = (
  allInventoryHistories: number[][],
  avgInventory: number[]
): number => {
  const distances = allInventoryHistories.map((history) =>
    Math.sqrt(
      history.reduce((sum, val, i) => sum + (val - avgInventory[i]) ** 2, 0)
    )
  );

  let minIndex = 0;
  let minDistance = distances[0];

  for (let i = 1; i < distances.length; i++) {
    if (distances[i] < minDistance) {
      minDistance = distances[i];
      minIndex = i;
    }
  }

  return minIndex;
};

export const get_representative_run_details = (
  representativeIndex: number,
  allInventoryHistories: number[][],
  allProactiveInventoryHistories: number[][],
  allStockoutWeeks: number[][],
  allProactiveStockoutWeeks: number[][],
  allWosHistories: number[][],
  allProactiveWosHistories: number[][],
  allConsumptionHistories: number[][],
  allWeeklyEvents: any[][]
): [
  number[], // inventory
  number[], // proactive inventory
  number[], // stockout weeks
  number[], // proactive stockout weeks
  number[], // WOS
  number[], // proactive WOS
  number[], // consumption
  any[] // weekly events
] => {
  return [
    allInventoryHistories[representativeIndex],
    allProactiveInventoryHistories[representativeIndex],
    allStockoutWeeks[representativeIndex],
    allProactiveStockoutWeeks[representativeIndex],
    allWosHistories[representativeIndex],
    allProactiveWosHistories[representativeIndex],
    allConsumptionHistories[representativeIndex],
    allWeeklyEvents[representativeIndex],
  ];
};

export const extract_weekly_table = (
  weeklyEvents: string[]
): WeeklyEventData[] => {
  const data: WeeklyEventData[] = [];

  const floatOrNull = (match: RegExpMatchArray | null) => {
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      return isNaN(val) ? null : val;
    }
    return null;
  };

  weeklyEvents.forEach((event, index) => {
    const lines = event.split("\n");
    const weekNumber = index + 1;

    const weekData: WeeklyEventData = {
      "Week Number": weekNumber,
      "Initial Inventory (Reactive)": 0,
      "Initial Inventory (Proactive)": 0,
      "Reactive Order Arrived": null,
      "Proactive Order Arrived": null,
      "Interim Inventory (Reactive)": null,
      "Interim Inventory (Proactive)": null,
      "Predicted Consumption for Next Few Weeks (Sum)": 0,
      Consumption: 0,
      "End of Week Inventory (Proactive)": 0,
      "End of Week Inventory (Reactive)": 0,
      "Proactive Order Placed": 0,
      "Reactive Order Arrival Week": null,
      "Reactive Order Placed": 0,
      "Proactive Order Arrival Week": null,
      Stockout: false,
    };

    for (const line of lines) {
      try {
        if (line.includes("Starting Inventory (Reactive)")) {
          const match = line.match(/: (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Initial Inventory (Reactive)"] = Math.floor(val);
        } else if (line.includes("Starting Inventory (Proactive)")) {
          const match = line.match(/: (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Initial Inventory (Proactive)"] = Math.floor(val);
        } else if (
          line.includes("Reactive Order of") &&
          line.includes("arrived")
        ) {
          const match = line.match(/Reactive Order of (\d+\.?\d*) arrived/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Reactive Order Arrived"] = Math.floor(val);
        } else if (
          line.includes("Proactive Order of") &&
          line.includes("arrived")
        ) {
          const match = line.match(/Proactive Order of (\d+\.?\d*) arrived/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Proactive Order Arrived"] = Math.floor(val);
        } else if (line.includes("Interim Inventory (Reactive):")) {
          const match = line.match(
            /Interim Inventory \(Reactive\): (\d+\.?\d*)/
          );
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Interim Inventory (Reactive)"] = Math.floor(val);
        } else if (line.includes("Interim Inventory (Proactive):")) {
          const match = line.match(
            /Interim Inventory \(Proactive\): (\d+\.?\d*)/
          );
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Interim Inventory (Proactive)"] = Math.floor(val);
        } else if (line.includes("Forecasted consumption for next")) {
          const match = line.match(/is (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Predicted Consumption for Next Few Weeks (Sum)"] =
              Math.floor(val);
        } else if (line.includes("Consumption this week")) {
          const match = line.match(/: (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null) weekData["Consumption"] = Math.floor(val);
        } else if (line.includes("Proactive Ending Inventory")) {
          const match = line.match(/: (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["End of Week Inventory (Proactive)"] = Math.floor(val);
        } else if (line.includes("Reactive Ending Inventory")) {
          const match = line.match(/: (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["End of Week Inventory (Reactive)"] = Math.floor(val);
        } else if (
          line.includes("Proactive Order of") &&
          line.includes("placed")
        ) {
          const match = line.match(/Proactive Order of (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null)
            weekData["Proactive Order Placed"] = Math.floor(val);
        } else if (
          line.includes("Reactive Order of") &&
          line.includes("placed")
        ) {
          const match = line.match(/Reactive Order of (\d+\.?\d*)/);
          const val = floatOrNull(match);
          if (val !== null) weekData["Reactive Order Placed"] = Math.floor(val);
        } else if (line.includes("Reactive Order will arrive in week")) {
          const match = line.match(/week (\d+)/);
          if (match && match[1])
            weekData["Reactive Order Arrival Week"] = parseInt(match[1], 10);
        } else if (line.includes("Proactive Order will arrive in week")) {
          const match = line.match(/week (\d+)/);
          if (match && match[1])
            weekData["Proactive Order Arrival Week"] = parseInt(match[1], 10);
        } else if (line.includes("Stockout occurred")) {
          weekData["Stockout"] = true;
        }
      } catch (error) {
        console.error(`Error processing line "${line}":`, error);
      }
    }

    data.push(weekData);
  });

  return data;
};

// Simulation Functions

export const simulate_demand = (
  fittedDistributionName: string,
  fittedDistributionParams: DistributionParams,
  numSimulations = 10000
): number[] | null => {
  try {
    const samples: number[] = [];

    switch (fittedDistributionName.toLowerCase()) {
      case "cauchy": {
        const [loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.cauchy.sample(loc, scale));
        }
        break;
      }

      case "chi2": {
        const [df, loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.chisquare.sample(df) * scale + loc);
        }
        break;
      }

      case "expon": {
        const [loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          // jStat.exponential.sample expects rate = 1/scale
          samples.push(jstat.exponential.sample(1 / scale) + loc);
        }
        break;
      }

      case "exponpow": {
        // No direct support in jstat; approximate using inverse transform method
        // params: [b, loc, scale]
        const [b, loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * (1 - Math.pow(1 - u, 1 / b));
          samples.push(val);
        }
        break;
      }

      case "gamma": {
        const [a, loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.gamma.sample(a, scale) + loc);
        }
        break;
      }

      case "lognorm": {
        const [s, loc, scale] = fittedDistributionParams;
        // Python's s = shape (stddev), scale = exp(mean)
        const mean = Math.log(scale);
        const stdDev = s;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.lognormal.sample(mean, stdDev) + loc);
        }
        break;
      }

      case "norm": {
        const [loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.normal.sample(loc, scale));
        }
        break;
      }

      case "powerlaw": {
        // No direct support, approximate with inverse transform sampling
        // params: [a, loc, scale]
        const [a, loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * Math.pow(u, 1 / a);
          samples.push(val);
        }
        break;
      }

      case "rayleigh": {
        const [loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * Math.sqrt(-2 * Math.log(u));
          samples.push(val);
        }
        break;
      }

      case "uniform": {
        const [loc, scale] = fittedDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.uniform.sample(loc, loc + scale));
        }
        break;
      }

      default:
        console.warn(
          `Unsupported distribution for simulation: ${fittedDistributionName}`
        );
        return null;
    }

    return samples;
  } catch (error) {
    console.error(`Error simulating demand:`, error);
    return null;
  }
};

export const simulate_consumption = (
  consumptionDistributionName: string,
  consumptionDistributionParams: DistributionParams,
  numSimulations = 1
): number[] | null => {
  try {
    const samples: number[] = [];

    switch (consumptionDistributionName.toLowerCase()) {
      case "cauchy": {
        const [loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.cauchy.sample(loc, scale));
        }
        break;
      }

      case "chi2": {
        const [df, loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.chisquare.sample(df) * scale + loc);
        }
        break;
      }

      case "expon": {
        const [loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.exponential.sample(1 / scale) + loc);
        }
        break;
      }

      case "exponpow": {
        const [b, loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * (1 - Math.pow(1 - u, 1 / b));
          samples.push(val);
        }
        break;
      }

      case "gamma": {
        const [a, loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.gamma.sample(a, scale) + loc);
        }
        break;
      }

      case "lognorm": {
        const [s, loc, scale] = consumptionDistributionParams;
        const mean = Math.log(scale);
        const stdDev = s;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.lognormal.sample(mean, stdDev) + loc);
        }
        break;
      }

      case "norm": {
        const [loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.normal.sample(loc, scale));
        }
        break;
      }

      case "powerlaw": {
        const [a, loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * Math.pow(u, 1 / a);
          samples.push(val);
        }
        break;
      }

      case "rayleigh": {
        const [loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * Math.sqrt(-2 * Math.log(u));
          samples.push(val);
        }
        break;
      }

      case "uniform": {
        const [loc, scale] = consumptionDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.uniform.sample(loc, loc + scale));
        }
        break;
      }

      default:
        console.warn(
          `Unsupported distribution for simulation: ${consumptionDistributionName}`
        );
        return null;
    }

    return samples;
  } catch (error) {
    console.error(`Error simulating consumption:`, error);
    return null;
  }
};

export const simulate_ordering = (
  orderDistributionName: string,
  orderDistributionParams: DistributionParams,
  numSimulations = 1
): number[] | null => {
  try {
    const samples: number[] = [];

    switch (orderDistributionName.toLowerCase()) {
      case "cauchy": {
        const [loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.cauchy.sample(loc, scale));
        }
        break;
      }

      case "chi2": {
        const [df, loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.chisquare.sample(df) * scale + loc);
        }
        break;
      }

      case "expon": {
        const [loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.exponential.sample(1 / scale) + loc);
        }
        break;
      }

      case "exponpow": {
        const [b, loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * (1 - Math.pow(1 - u, 1 / b));
          samples.push(val);
        }
        break;
      }

      case "gamma": {
        const [a, loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.gamma.sample(a, scale) + loc);
        }
        break;
      }

      case "lognorm": {
        const [s, loc, scale] = orderDistributionParams;
        const mean = Math.log(scale);
        const stdDev = s;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.lognormal.sample(mean, stdDev) + loc);
        }
        break;
      }

      case "norm": {
        const [loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.normal.sample(loc, scale));
        }
        break;
      }

      case "powerlaw": {
        const [a, loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * Math.pow(u, 1 / a);
          samples.push(val);
        }
        break;
      }

      case "rayleigh": {
        const [loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          const u = Math.random();
          const val = loc + scale * Math.sqrt(-2 * Math.log(u));
          samples.push(val);
        }
        break;
      }

      case "uniform": {
        const [loc, scale] = orderDistributionParams;
        for (let i = 0; i < numSimulations; i++) {
          samples.push(jstat.uniform.sample(loc, loc + scale));
        }
        break;
      }

      default:
        console.warn(
          `Unsupported distribution for simulation: ${orderDistributionName}`
        );
        return null;
    }

    return samples;
  } catch (error) {
    console.error(`Error simulating ordering:`, error);
    return null;
  }
};

// Start Inventory Simulation

// TODO: Migrate those functions to the new structure
export const preprocess_data = () => {};

export const simulate_inventory = () => {};
