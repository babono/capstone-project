import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';

const defaultColor = "#3719D3";

const gradientTwoColors = (id: string | undefined, col1: string | undefined, col2: string | undefined, percentChange: number) => (
  <linearGradient id={id} x1="0" y1="0" x2="100%">
    <stop offset="0%" stopColor={col1} />
    <stop offset={`${percentChange}%`} stopColor={col1} />
    <stop offset={`${percentChange}%`} stopColor={col2} />
    <stop offset="100%" stopColor={col2} />
  </linearGradient>
);

const formatIfNumeric = (x: number) => (typeof x === 'number' ? x.toFixed() : x);

const tooltipFormatter = (value: number | number[], name: string | string[]) => {
  if (name.includes("noTooltip")) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(formatIfNumeric).join(" - ");
  }
  return `${formatIfNumeric(value)}`;
};

const scoreOrPrediction = (data: { supplies: number | null; prediction: number | null }) => data.supplies !== null ? data.supplies : data.prediction;

interface ChartComponentProps {
  data: any[];
  lastIntervalPercent: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, lastIntervalPercent }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <defs>
          {gradientTwoColors(
            "hideAllButLastInterval",
            "rgba(0,0,0,0)",
            defaultColor,
            lastIntervalPercent
          )}
          {gradientTwoColors(
            "hideJustLastInterval",
            defaultColor,
            "rgba(0,0,0,0)",
            lastIntervalPercent
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="formattedDate" />
        <YAxis />
        <Tooltip formatter={tooltipFormatter} wrapperStyle={{ color: 'black' }} />
        <Line
          name="Supplies"
          type="monotone"
          strokeDasharray="0 100"
          dataKey="supplies"
        />
        <Line
          name="Prediction"
          type="monotone"
          strokeDasharray="0 100"
          dataKey="prediction"
        />
        <Line
          name="line1_noTooltip"
          type="monotone"
          stroke="url(#hideJustLastInterval)"
          dataKey={scoreOrPrediction}
        />
        <Line
          name="line2_noTooltip"
          type="monotone"
          stroke="url(#hideAllButLastInterval)"
          strokeDasharray="5 5"
          dataKey={scoreOrPrediction}
        />
        <Line
          name="Demand"
          type="monotone"
          strokeDasharray="3 3"
          dataKey="demand"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
