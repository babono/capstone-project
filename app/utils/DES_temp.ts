import * as XLSX from "xlsx";
import * as math from "mathjs";

// Load and process a ZIP folder (placeholder for implementation)
export function load_zip_folder(zipFilePath: File, key: string): void {
  console.warn("load_zip_folder is not implemented in TypeScript.");
}

// Load and store files in session state (placeholder for implementation)
export function load_and_store_file(file: File, key: string): void {
  console.warn("load_and_store_file is not implemented in TypeScript.");
}

// Calculate safety stock
export function calculate_safety_stock(
  dist_name: string,
  dist_params: any,
  service_level_percentage: number,
  std_lead_time: number
): number {
  const z = math.norm.inv(service_level_percentage / 100); // Z-score for service level
  const std_demand = get_std_from_distribution(dist_name, dist_params);
  return z * std_demand * std_lead_time;
}

// Get mean from a distribution
export function get_mean_from_distribution(
  distribution_name: string,
  distribution_params: any
): number {
  switch (distribution_name) {
    case "Normal":
      return distribution_params.mean;
    case "Poisson":
      return distribution_params.lambda;
    case "Exponential":
      return 1 / distribution_params.rate;
    default:
      throw new Error(`Unsupported distribution: ${distribution_name}`);
  }
}

// Get standard deviation from a distribution
export function get_std_from_distribution(
  distribution_name: string,
  distribution_params: any
): number {
  switch (distribution_name) {
    case "Normal":
      return distribution_params.std;
    case "Poisson":
      return Math.sqrt(distribution_params.lambda);
    case "Exponential":
      return 1 / distribution_params.rate;
    default:
      throw new Error(`Unsupported distribution: ${distribution_name}`);
  }
}

// Process lead time data
export function process_lead_time(data: any[]): any[] {
  return data.map((row) => {
    const documentDate = new Date(row["Document Date"]);
    const postingDate = new Date(row["Pstng Date"]);
    const leadTime = Math.ceil(
      (postingDate.getTime() - documentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { ...row, leadTime };
  });
}

// Preprocess consumption data
export function preprocess_data_consumption(data: any[]): any[] {
  return data.map((row) => ({
    ...row,
    "Pstng Date": new Date(row["Pstng Date"]),
    Week: get_week_number(new Date(row["Pstng Date"])),
  }));
}

// Preprocess goods receipt data
export function preprocess_data_GR(data: any[]): any[] {
  return data.map((row) => ({
    ...row,
    "Pstng Date": new Date(row["Pstng Date"]),
    Week: get_week_number(new Date(row["Pstng Date"])),
  }));
}

// Preprocess order placement data
export function preprocess_data_OP(data: any[]): any[] {
  return data.map((row) => ({
    ...row,
    "Document Date": new Date(row["Document Date"]),
    Week: get_week_number(new Date(row["Document Date"])),
  }));
}

// General preprocessing function
export function preprocess_data(data: any[], prefix: string): any[] {
  return data.map((row) => ({
    ...row,
    [`${prefix}_Date`]: new Date(row["Date"]),
    [`${prefix}_Week`]: get_week_number(new Date(row["Date"])),
  }));
}

// Find the best distribution for a dataset
export function find_best_distribution(
  data: number[],
  include_zero_inflated = false,
  include_hurdle = false
): string {
  // Placeholder for actual implementation
  console.warn("find_best_distribution is not fully implemented.");
  return "Normal"; // Default to Normal distribution for now
}

// Simulate demand based on a fitted distribution
export function simulate_demand(
  fitted_distribution_name: string,
  fitted_distribution_params: any,
  num_simulations = 10000
): number[] {
  switch (fitted_distribution_name) {
    case "Normal":
      return Array.from({ length: num_simulations }, () =>
        math.randomNormal(
          fitted_distribution_params.mean,
          fitted_distribution_params.std
        )
      );
    case "Poisson":
      return Array.from({ length: num_simulations }, () =>
        math.randomPoisson(fitted_distribution_params.lambda)
      );
    default:
      throw new Error(`Unsupported distribution: ${fitted_distribution_name}`);
  }
}

// Fit a distribution to data
export function fit_distribution(
  data_values: number[],
  data_type = "Consumption"
): any {
  const best_distribution = find_best_distribution(data_values, true, true);
  if (!best_distribution) {
    console.warn(`Could not find a suitable distribution for ${data_type}.`);
    return null;
  }

  switch (best_distribution) {
    case "Normal":
      const mean = math.mean(data_values);
      const std = math.std(data_values);
      return { distribution: "Normal", mean, std };
    case "Poisson":
      const lambda = math.mean(data_values);
      return { distribution: "Poisson", lambda };
    default:
      throw new Error(`Unsupported distribution: ${best_distribution}`);
  }
}

// Helper: Get week number from a date
function get_week_number(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
