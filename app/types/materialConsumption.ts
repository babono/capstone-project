type MaterialConsumptionCSV = {
  "Material Group": number;
  "Material Number": string;
  "Pstng Date": string;
  "Quantity": number;
  "BUn": string;
  "Plant": string;
  "Site": string;
  "Batch": string;
  "SLED/BBD": string;
  "Vendor Number": string;
  "remainingShelfLife": number | null;
};

export type MaterialConsumptionCSVData = MaterialConsumptionCSV[];

export type ChartProps = {
  customKey?: string;
  chartId: string;
};
