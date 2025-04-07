import dynamic from "next/dynamic";

// Handle dynamic import for Plotly JS for Next.js. For different components usage
// DO NOT use: import Plot from "react-plotly.js" at other components, because it will cause SSR error

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

export enum PAGE_LABELS {
  MATERIAL_CONSUMPTION = 'Material Consumption',
  ORDER_PLACEMENT = 'Order Placement',
  GOODS_RECEIPT = 'Goods Receipt'
}

export enum PAGE_KEYS {
  MATERIAL_CONSUMPTION = 'material-consumption',
  ORDER_PLACEMENT = 'order-placement',
  GOODS_RECEIPT = 'goods-receipt'
}
