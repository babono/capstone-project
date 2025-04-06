import dynamic from "next/dynamic";

// For usage in different components
export const Plot = dynamic(
  () =>
    import("react-plotly.js").then(
      (mod) =>
        mod.default as React.ComponentType<{
          divId: string;
          data: any;
          layout: any;
          style: any;
          config: any;
        }>
    ),
  { ssr: false }
);
