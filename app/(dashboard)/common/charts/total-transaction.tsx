import React from "react";
import AskGeminiButton from "../ask-gemini";
import { Plot } from "@/app/constants/plot";
import { ChartProps } from "@/app/types/materialConsumption";

type TotalTransactionProps = ChartProps & {
  filteredTransactionData: Array<{
    "Material Number": string;
    "Transaction Count": number;
  }>;
};

const TotalTransaction: React.FC<TotalTransactionProps> = ({
  chartId,
  filteredTransactionData,
}) => {
  return (
    <div>
      <p className="mt-6 text-l font-semibold">
        Number of Transactions per Material Number
      </p>
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
      />
      <AskGeminiButton chartId={chartId} />
    </div>
  );
};

export default TotalTransaction;
