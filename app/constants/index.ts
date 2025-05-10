import dynamic from "next/dynamic";

// Handle dynamic import for Plotly JS for Next.js. For different components usage
// If you want to import Plot, DO NOT use: import Plot from "react-plotly.js" at other components, because it will cause SSR error

export const Plot = dynamic(
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

// Material Consumption Chart IDs
export const TRANSACTIONS_CHART_ID = "transactions-chart";
export const GOODS_RECEIPT_CHART_ID = "goods-receipt-chart";
export const VARIANCE_CHART_ID = "variance-chart";
export const FINITE_SHELF_CHART_ID = "finite-shelf-chart";
export const MATERIAL_LEVEL_CHART_ID = "material-level-chart";
export const QUANTITY_BY_PLANT_CHART_ID = "quantity-by-plant-chart";

export enum PAGE_LABELS {
  MATERIAL_CONSUMPTION = 'Material Consumption',
  ORDER_PLACEMENT = 'Order Placement',
  GOODS_RECEIPT = 'Goods Receipt',
  SHORTAGE_REPORT = 'Shortage Report',
  LEAD_TIME = 'Lead Time',
  HOME = 'Home'
}

export enum PAGE_KEYS {
  MATERIAL_CONSUMPTION = 'material-consumption',
  ORDER_PLACEMENT = 'order-placement',
  GOODS_RECEIPT = 'goods-receipt',
  SHORTAGE_REPORT = 'shortage-report',
  HOME = 'home',
}

export enum GENERATE_RESULT_CAPTIONS {
  NO_FILES_UPLOADED = 'Start the analysis by uploading your files now',
  ERROR = 'An error occured during analysis. Please try again or upload a different file'
}

export const ERR_BUCKET_LOAD_PREFIX = "Error loading uplaoded data: ";

// Bucket JSON URL
export const WATERFALL_BUCKET_URL = "https://storage.googleapis.com/babono_bucket/uploadedData.json";
export const MATERIAL_CONSUMPTION_BUCKET_URL = "https://storage.googleapis.com/babono_bucket/materialConsumption260.json";
export const ORDER_PLACEMENT_BUCKET_URL = "https://storage.googleapis.com/babono_bucket/orderPlacement260.json";
export const GOODS_RECEIPT_BUCKET_URL = "https://storage.googleapis.com/babono_bucket/goodsReceipt260.json";
export const SHORTAGE_REPORT_BUCKET_URL = "https://storage.googleapis.com/babono_bucket/uploadedData.json";
