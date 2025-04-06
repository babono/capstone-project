import React from "react";
import { ChartProps, MaterialConsumptionCSVData } from "@/app/types/materialConsumption";
import { Plot } from "@/app/constants/plot";
import AskGeminiButton from "../common/ask-gemini";

type FiniteShelfProps = ChartProps & {
  shelfData: MaterialConsumptionCSVData;
};

const FiniteShelf: React.FC<FiniteShelfProps> = ({
  chartId,
  shelfData,
  loading,
  insight,
  onAskGemini, }) => {
  const shelfLength = shelfData.length;

  if (shelfLength === 0) {
    return <p>No items with finite shelf life in the selected data.</p>;
  }

  return (
    <div>
      <p className="mt-6 text-l font-semibold">
        Distribution of Remaining Shelf Life (Days) - Finite Shelf Life
      </p>
      <Plot
        divId={chartId}
        data={[
          {
            x: shelfData.map((item) => item.remainingShelfLife),
            type: "histogram",
            marker: { color: "blue" },
            hovertemplate: `Remaining Shelf Life (Days)=%{x}<br>Count=%{y}<extra></extra>`,
          },
        ]}
        layout={{
          xaxis: {
            title: { text: "Days", font: { color: "black" } },
            automargin: true,
          },
          yaxis: {
            title: { text: "Count", font: { color: "black" } },
            automargin: true,
          },
          showlegend: false,
          autosize: true,
          hoverlabel: {
            align: "left",
          },
        }}
        style={{ width: "100%", height: "100%" }}
        config={{ displayModeBar: false }}
      />
      <AskGeminiButton
        loading={loading}
        insight={insight}
        onAskGemini={onAskGemini}
      />
    </div>
  );
};

export default FiniteShelf;
