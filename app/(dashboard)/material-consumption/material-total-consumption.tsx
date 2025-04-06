import React from "react";
import AskGeminiButton from "../common/ask-gemini";
import { Plot } from "@/app/constants/plot";
import { ChartProps } from "@/app/types/materialConsumption";

type MaterialTotalTransactionProps = ChartProps & {
  filteredTransactionData: Array<{
    "Material Number": string;
    "Transaction Count": number;
  }>;
};

const MaterialTotalTransaction: React.FC<MaterialTotalTransactionProps> = ({
  chartId,
  filteredTransactionData,
  loading,
  insight,
  onAskGemini,
}) => {
  return (
    <div>
      <h2 className="mt-6 text-xl font-semibold">Number of Transactions per Material Number</h2>
      <Plot
        divId={chartId}
        data={[
          {
            x: filteredTransactionData.map((item) => item["Material Number"]),
            y: filteredTransactionData.map((item) => item["Transaction Count"]),
            type: "bar",
            marker: { color: "blue" },
            text: filteredTransactionData.map(
              (item) =>
                `Material Number: ${item["Material Number"]}<br>Transaction Count: ${item["Transaction Count"]}`
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
            title: { text: "Transaction Count", font: { color: "black" } },
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

export default MaterialTotalTransaction;
