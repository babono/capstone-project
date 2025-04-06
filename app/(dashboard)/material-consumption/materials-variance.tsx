import React from "react";
import AskGeminiButton from "../common/ask-gemini";
import { Plot } from "@/app/constants/plot";

type MaterialsVarianceProps = {
  chartId: string;
  varianceData: Array<{
    materialNumber: string;
    values: number[];
  }>;
  loading: boolean;
  insight: string;
  onAskGemini: () => void;
};

const MaterialsVariance: React.FC<MaterialsVarianceProps> = ({
  chartId,
  varianceData,
  loading,
  insight,
  onAskGemini,
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
      <h2 className="mt-6 text-xl font-semibold">Materials by Variance</h2>
      <Plot
        divId={chartId}
        data={data}
        layout={layout}
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

export default MaterialsVariance;
