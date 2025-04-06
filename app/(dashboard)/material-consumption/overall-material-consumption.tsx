import { Plot } from "@/app/constants/plot";
import React from "react";
import AskGeminiButton from "../common/ask-gemini";
import { ChartProps } from "@/app/types/materialConsumption";

type OverallMaterialConsumptionProps = ChartProps & {
  filteredData: Array<{
    "Material Number": string;
    Quantity: number;
  }>;
};

const OverallMaterialConsumption: React.FC<OverallMaterialConsumptionProps> = ({
  chartId,
  filteredData,
  loading,
  insight,
  onAskGemini,
}) => {
  return (
    <div>
      <h2 className="mt-6 text-xl font-semibold">Overall Material Consumption by Material Number</h2>
      <Plot
        divId={chartId}
        data={[
          {
            x: filteredData.map((item) => item["Material Number"]),
            y: filteredData.map((item) => item["Quantity"]),
            type: "bar",
            marker: { color: "blue" },
            text: filteredData.map(
              (item) =>
                `Material Number: ${item["Material Number"]}<br>Material Consumption Quantity: ${item["Quantity"]}`
            ),
            hoverinfo: "text",
            textposition: "none",
          },
        ]}
        layout={{
          xaxis: {
            title: { text: "Material Number", font: { color: "black" } },
            automargin: true,
          },
          yaxis: {
            title: { text: "Quantity", font: { color: "black" } },
            automargin: true,
          },
          showlegend: false,
          autosize: true,
        }}
        style={{ width: "100%", height: "100%" }}
        config={{
          displayModeBar: false,
        }}
      />
      <AskGeminiButton
        loading={loading}
        insight={insight}
        onAskGemini={onAskGemini}
      />
    </div>
  );
};

export default OverallMaterialConsumption;
