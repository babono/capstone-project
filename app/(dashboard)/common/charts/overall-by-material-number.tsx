import { Plot } from "@/app/constants/plot";
import React from "react";
import AskGeminiButton from "../ask-gemini";
import { ChartProps } from "@/app/types/materialConsumption";

type OverallByMaterialNumberProps = ChartProps & {
  filteredData: Array<{
    "Material Number": string;
    Quantity: number;
  }>;
  yAxisFieldName: string;
};

const OverallByMaterialNumber: React.FC<OverallByMaterialNumberProps> = ({
  customKey,
  chartId,
  filteredData,
  yAxisFieldName,
}) => {
  return (
    <div>
      <p className="mt-6 text-l font-semibold">
        {`Overall ${customKey} by Material Number`}
      </p>
      <Plot
        divId={chartId}
        data={[
          {
            x: filteredData.map((item) => item["Material Number"]),
            y: filteredData.map((item) => item[yAxisFieldName as keyof typeof item]),
            type: "bar",
            marker: { color: "blue" },
            text: filteredData.map(
              (item) =>
                `Material Number: ${item["Material Number"]}<br>${customKey} ${yAxisFieldName}: ${item[yAxisFieldName as keyof typeof item]}`
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
            title: { text: `${yAxisFieldName}`, font: { color: "black" } },
            automargin: true,
          },
          showlegend: false,
          autosize: true,
        }}
        style={{ width: "100%", height: "100%" }}
      />
      <AskGeminiButton chartId={chartId} />
    </div>
  );
};

export default OverallByMaterialNumber;
