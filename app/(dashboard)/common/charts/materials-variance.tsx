import React from "react";
import AskGeminiButton from "../ask-gemini";
import { Plot } from "@/app/constants/plot";
import { ChartProps } from "@/app/types/materialConsumption";

type MaterialsVarianceProps = ChartProps & {
  varianceData: Array<{
    materialNumber: string;
    values: number[];
  }>;
};

const MaterialsVariance: React.FC<MaterialsVarianceProps> = ({
  chartId,
  varianceData,
}) => {
  const data = varianceData.map((material) => ({
    y: material.values,
    name: material.materialNumber,
    type: "box",
    marker: { color: "blue" },
  }));

  const layout = {
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
  };

  return (
    <div>
      <p className="mt-6 text-l font-semibold">
        Materials by Variance
      </p>
      <Plot
        divId={chartId}
        data={data}
        layout={layout}
        style={{ width: "100%", height: "100%" }}
      />
      <AskGeminiButton chartId={chartId} />
    </div>
  );
};

export default MaterialsVariance;
