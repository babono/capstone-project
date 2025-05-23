// @ts-nocheck

export const preprocess_data_consumption = (data) => {
  const trimmedData = data.map((row) => {
    const trimmedRow = {};
    Object.keys(row).forEach((key) => {
      trimmedRow[key.trim()] = row[key];
    });
    return trimmedRow;
  });

  const validData = trimmedData.filter((row) => {
    row["Pstng Date"] = new Date(row["Pstng Date"]);
    return !isNaN(row["Pstng Date"]);
  });

  validData.forEach((row) => {
    const date = row["Pstng Date"];
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    row["Week"] = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  });

  const groupedData = {};
  validData.forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}_${row["Week"]}`;
    if (!groupedData[key]) {
      groupedData[key] = { ...row, Quantity: 0 };
    }
    groupedData[key].Quantity += Math.abs(row["Quantity"]);
  });

  const pivotData = {};
  Object.values(groupedData).forEach((row) => {
    const key = `${row["Material Number"]}_${row["Plant"]}_${row["Site"]}`;
    if (!pivotData[key]) {
      pivotData[key] = {
        "Material Number": row["Material Number"],
        Plant: row["Plant"],
        Site: row["Site"],
        BUn: row["BUn"],
      };
    }
    pivotData[key][`WW${row["Week"]}_Consumption`] = row["Quantity"];
  });

  return Object.values(pivotData).map((row) => {
    Object.keys(row).forEach((key) => {
      if (key.startsWith("WW") && row[key] === undefined) {
        row[key] = 0;
      }
    });
    return row;
  });
};

export const preprocess_data_GR = (data) => {
  // TODO: Complete this
  return data;
};

export const preprocess_data_OP = (data) => {
  // TODO: Complete this
  return data;
};

export const process_lead_time = (data) => {
  const leadTimes = data.map((row) => row["Lead Time (days)"] / 7); // Convert days to weeks

  console.log("LEAD TIME DATA XLS:");
  console.log(leadTimes);

  const meanLeadTime = leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length;
  const variance =
    leadTimes.reduce(
      (sum, value) => sum + Math.pow(value - meanLeadTime, 2),
      0
    ) / leadTimes.length;
  const stdDevLeadTime = Math.sqrt(variance);

  return {
    mean: meanLeadTime,
    stdDev: stdDevLeadTime,
  };
};
