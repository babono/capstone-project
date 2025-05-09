// @ts-nocheck
export const createFig1 = (data, portlandColors) => {
  const groupedByMaterialNumber = data.reduce((acc, row) => {
    const materialNumber = row["Material Number"];
    if (!acc[materialNumber]) {
      acc[materialNumber] = [];
    }
    acc[materialNumber].push(row);
    return acc;
  }, {});

  const dataTraces = Object.entries(groupedByMaterialNumber).map(([materialNumber, rows], index) => ({
    x: rows.map((row) => row["Material-Plant"]),
    y: rows.map((row) => row["Lead Time Difference (Days)"]),
    type: "bar",
    name: materialNumber,
    marker: {
      color: portlandColors[index % portlandColors.length],
    },
    hoverinfo: "text",
    text: rows.map(
      (item) =>
        `Material Number: ${item["Material Number"]}<br>Material-Plant: ${item["Material-Plant"]}<br>Lead Time Difference (Days): ${item["Lead Time Difference (Days)"]}`
    ),
    textposition: "none",
  }));

  return {
    data: dataTraces,
    layout: {
      showlegend: true,
      legend: {
        title: {
          text: "Material Number",
          font: { size: 14, color: "black" },
        },
        x: 1,
        y: 1,
      },
      autosize: true,
      xaxis: {
        title: "Material-Plant",
        tickangle: -45,
        automargin: true,
        titlefont: { color: "black" },
      },
      yaxis: {
        title: "Lead Time Difference (Days)",
        automargin: true,
        titlefont: { color: "black" },
      },
    },
  };
};

export const createFig2 = (data) => {
  const groupedByMaterialNumber = data.reduce((acc, row) => {
    const materialNumber = row["Material Number"];
    if (!acc[materialNumber]) {
      acc[materialNumber] = [];
    }
    acc[materialNumber].push(row);
    return acc;
  }, {});

  const dataTraces = Object.entries(groupedByMaterialNumber).map(([materialNumber, rows], index) => ({
    x: rows.map((row) => row["Material-Plant"]),
    y: rows.map((row) => row["Lead Time Difference (Days)"]),
    type: "bar",
    name: materialNumber,
    marker: {
      color: `rgba(255, ${100 + index * 15}, ${100 + index * 15}, 1)`, // Sequential Reds
    },
    hoverinfo: "text",
    text: rows.map(
      (row) =>
        `Material Number: ${row["Material Number"]}<br>Material-Plant: ${row["Material-Plant"]}<br>Lead Time Difference: ${row["Lead Time Difference (Days)"]}`
    ),
    textposition: "none",
  }));

  return {
    data: dataTraces,
    layout: {
      showlegend: true,
      legend: {
        title: {
          text: "Material Number",
          font: { size: 12, color: "black" },
        },
        x: 1,
        y: 1,
      },
      autosize: true,
      xaxis: {
        title: "Material-Plant",
        automargin: true,
        titlefont: { color: "black" },
      },
      yaxis: {
        title: "Lead Time Difference (Days)",
        automargin: true,
        titlefont: { color: "black" },
      },
      title: "Top 10 Material-Plant Combinations Delivered Late",
    },
  };
};

export const analyzeAndPlotLeadTimeDifferences = (data, portlandColors, setFig1Data, setFig2Data) => {
  if (!data || data.length === 0) {
    console.warn("No data available for analysis.");
    return;
  }

  // Add a combined Material-Plant identifier
  const enrichedData = data.map((row) => ({
    ...row,
    "Material-Plant": `${row["Material Number"]} - ${row["Plant"]}`,
  }));

  // Plot 1: Top 10 by absolute difference
  const top10Diff = [...enrichedData]
    .sort((a, b) => Math.abs(b["Lead Time Difference (Days)"]) - Math.abs(a["Lead Time Difference (Days)"]))
    .slice(0, 10);
  setFig1Data(createFig1(top10Diff, portlandColors));

  // Plot 2: Top 10 Over-Estimated (Late Deliveries)
  const lateDeliveries = enrichedData
    .filter((row) => row["Lead Time Difference (Days)"] > 0)
    .sort((a, b) => b["Lead Time Difference (Days)"] - a["Lead Time Difference (Days)"])
    .slice(0, 10);
  setFig2Data(createFig2(lateDeliveries));
};
