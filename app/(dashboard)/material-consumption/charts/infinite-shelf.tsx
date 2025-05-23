import React from "react";
import { ChartProps, MaterialConsumptionCSVData } from "@/app/types/materialConsumption";

type InfiniteShelfProps = ChartProps & {
  shelfData: MaterialConsumptionCSVData;
};

const InfiniteShelf: React.FC<InfiniteShelfProps> = ({ shelfData }) => {
  const shelfLength = shelfData.length;

  if (shelfLength === 0) {
    return <p>No items with infinite shelf life in the selected data.</p>;
  }

  const headers = Object.keys(shelfData[0]).filter(
    (header) => header !== "remainingShelfLife"
  ) as (keyof typeof shelfData[0])[];

  return (
    <div>
      <br></br>
      <p>Number of Items with Infinite Shelf Life: {shelfLength}</p>
      <p>Items with Infinite Shelf Life:</p>
      <br />
      <div className="overflow-y-auto border border-gray-300 rounded-lg">
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-2">No</th>
              {headers.map((header) => (
                <th key={header} className="border border-gray-300 px-2 py-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shelfData.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                {headers.map((header) => (
                  <td key={header} className="border border-gray-300 px-2 py-2">
                    {item[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfiniteShelf;
