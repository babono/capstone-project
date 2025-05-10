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
        },
        x: 1,
        y: 1,
      },
      autosize: true,
      xaxis: {
        title: {
          text: 'Material-Plant',
        },
        tickangle: -45,
        automargin: true,
      },
      yaxis: {
        title: {
          text: 'Lead Time Difference (Days)',
        },
        automargin: true,
      }
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
        title: {
          text: 'Material-Plant',
        },
        tickangle: -45,
        automargin: true,
      },
      yaxis: {
        title: {
          text: 'Lead Time Difference (Days)',
        },
        automargin: true,
      },
      title: "Top 10 Material-Plant Combinations Delivered Late",
    },
  };
};

export const createFig3 = (data) => {
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
    y: rows.map((row) => Math.abs(row["Lead Time Difference (Days)"])),
    type: "bar",
    name: materialNumber,
    marker: {
      color: `rgba(0, ${100 + index * 15}, ${200 + index * 15}, 1)`, // Sequential Teal
    },
    hoverinfo: "text",
    text: rows.map(
      (row) =>
        `Material Number: ${row["Material Number"]}<br>Material-Plant: ${row["Material-Plant"]}<br>Lead Time Difference: ${Math.abs(
          row["Lead Time Difference (Days)"]
        )}`
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
        },
        x: 1,
        y: 1,
      },
      autosize: true,
      xaxis: {
        title: {
          text: 'Material-Plant',
        },
        tickangle: -45,
        automargin: true,
      },
      yaxis: {
        title: {
          text: 'Lead Time Difference (Days)',
        },
        automargin: true,
      },
      title: "Top 10 Material-Plant Combinations Delivered Early",
    },
  };
};

export const createFig4 = (data) => {
  const leadTimeDifferences = data.map((row) => row["Lead Time Difference (Days)"]);

  return {
    data: [
      // Histogram trace
      {
        x: leadTimeDifferences,
        type: "histogram",
        marker: { color: "#1f77b4" }, // Blue color for histogram
        opacity: 0.7, // Slight transparency for better visualization
        name: "Histogram",
        hoverinfo: "text",
        hovertemplate: `
          Lead Time Difference (Days): %{x}<br>
          Count: %{y}
        `,
        xbins: {
          start: Math.min(...leadTimeDifferences), // Start of the bins
          end: Math.max(...leadTimeDifferences), // End of the bins
          size: 10, // Bin size (adjust this value as needed)
        },
        yaxis: "y", // Assign to primary Y-axis
        textposition: "none",
      },
      // Boxplot trace
      {
        x: leadTimeDifferences,
        type: "box",
        boxpoints: "outliers", // Show outliers
        marker: { color: "#17becf" }, // Teal color for boxplot
        line: { color: "#17becf" }, // Teal color for box edges
        name: "Boxplot",
        hoverinfo: "x",
        yaxis: "y2", // Assign to secondary Y-axis
      },

    ],
    layout: {
      title: "Distribution of Lead Time Differences",
      showlegend: false,
      xaxis: {
        title: {
          text: "Lead Time Difference (Days)",
        },
        automargin: true,
        titlefont: { color: "black" },
      },
      yaxis: {
        title: {
          text: "Count",
        },
        automargin: true,
        titlefont: { color: "black" },
        domain: [0, 0.7], // Allocate 70% of vertical space to the histogram
      },
      yaxis2: {
        title: "Boxplot",
        automargin: true,
        titlefont: { color: "black" },
        domain: [0.75, 1], // Allocate 25% of vertical space to the boxplot
        zeroline: false, // Hide the zero line
        showgrid: false, // Hide gridlines for the secondary Y-axis
      },
      bargap: 0.2,
      autosize: true,
    },
  };
};

export const createFig5 = (data) => {
  // Group data by Supplier and calculate the average lead time difference
  const supplierPerformance = data.reduce((acc, row) => {
    const supplier = row["Supplier"] || "Unknown";
    if (!acc[supplier]) {
      acc[supplier] = { total: 0, count: 0 };
    }
    acc[supplier].total += row["Lead Time Difference (Days)"];
    acc[supplier].count += 1;
    return acc;
  }, {});

  // Convert the grouped data into an array and calculate the average
  const supplierData = Object.entries(supplierPerformance).map(([supplier, { total, count }]) => ({
    Supplier: supplier,
    "Average Lead Time Difference (Days)": total / count,
  }));

  // Sort suppliers by average lead time difference (ascending for early deliveries)
  const sortedSupplierData = supplierData.sort(
    (a, b) => a["Average Lead Time Difference (Days)"] - b["Average Lead Time Difference (Days)"]
  );

  // Take the top 5 suppliers
  const top5Suppliers = sortedSupplierData.slice(0, 5);

  // Extract data for the chart
  const x = top5Suppliers.map((row) => row["Average Lead Time Difference (Days)"]);
  const y = top5Suppliers.map((row) => row["Supplier"]);

  return {
    data: [
      {
        x,
        y,
        type: "bar",
        orientation: "h", // Horizontal bar chart
        marker: {
          color: x, // Use the x values for the color scale
          colorscale: "Viridis", // Use the Viridis color scale (matches Python version)
          colorbar: {
            title: {
              text: "Avg Lead Time Diff (Days) [Negative = Early]", // Add line break for better readability
              side: "top", // Position the text above the heat level
              font: {
                size: 11, // Make the text smaller
              },
            },
          },
          thickness: 5, // Make the colorbar thinner
        },
        text: x.map((value) => value.toFixed(2)), // Display values with 2 decimal places
        textposition: "outside",
        hovertemplate: `Supplier: %{y}<br> Avg Lead Time Difference (Days): %{x}<extra></extra>
        `,
      },
    ],
    layout: {
      title: "Top 5 Suppliers (Delivering Earliest on Average)",
      xaxis: {
        title: {
          text: "Avg Lead Time Diff (Days) [Negative = Early]",
        },
        automargin: true,
      },
      yaxis: {
        title: {
          text: "Supplier",
        },
        automargin: true,
        categoryorder: "total ascending", // Order suppliers by performance
      },
      showlegend: false,
      autosize: true,
    },
  };
};

export const analyzeAndPlotLeadTimeDifferences = (
  data,
  portlandColors,
  setFig1Data,
  setFig2Data,
  setFig3Data,
  setFig4Data,
  setFig5Data,
  setFig6Data,
  setFig7Data,
) => {
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

  // Plot 3: Top 10 Under-Estimated (Early Deliveries)
  const earlyDeliveries = enrichedData
    .filter((row) => row["Lead Time Difference (Days)"] < 0)
    .sort((a, b) => a["Lead Time Difference (Days)"] - b["Lead Time Difference (Days)"])
    .slice(0, 10);
  setFig3Data(createFig3(earlyDeliveries));

  // Plot 4: Distribution of Lead Time Differences
  setFig4Data(createFig4(data));

  // Plot 5: Supplier-Level Lead Time Analysis
  setFig5Data(createFig5(data));
};
