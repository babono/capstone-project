// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import Papa from 'papaparse';
import axios from 'axios'; // For making API requests (install: npm install axios)
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Box,
  } from '@mui/material';  // Install Material UI (npm install @mui/material)
import { DatePicker } from '@mui/x-date-pickers'; // Install Date Picker (npm install @mui/x-date-pickers @mui/lab date-fns)
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function MaterialConsumption() {
  const [data, setData] = useState([]);
  const [plants, setPlants] = useState([]);
  const [sites, setSites] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [topN, setTopN] = useState(10);
  const [transactionChartData, setTransactionChartData] = useState(null);
  const [consumptionChartData, setConsumptionChartData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data.length > 0) {
        // Extract available options
        const uniquePlants = [...new Set(data.map(item => item.Plant))].sort();
        const uniqueSites = [...new Set(data.map(item => item.Site))].sort();
        const vendorNumbers = data.map(item => item['Vendor Number'] || 'Unknown');

        const uniqueVendors = [...new Set(vendorNumbers)].map(vendor => {
            if (!vendor || !vendor.startsWith('Vendor_')) {
                return 'Unknown';
            }
            return vendor;
        }).sort();

        setPlants(uniquePlants);
        setSites(uniqueSites);
        setVendors(uniqueVendors);
        setSelectedPlants(uniquePlants); // Default selection
        setSelectedSites(uniqueSites); // Default selection
        setSelectedVendors(uniqueVendors); // Default selection

        // Initial Chart Generation (based on initial filters - which are "all")
        generateCharts(data);
    }
  }, [data]);

  const handleFileUpload = async (event) => {
    setLoading(true);
    setError('');
    const file = event.target.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file); // The 'file' here MUST match the `file: UploadFile = File(...)` argument name in the FastAPI endpoint.

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/py/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setData(response.data); // Set the data from the API response
            setLoading(false);
        } catch (error) {
            console.error("Error uploading file:", error);
            setError(error.message); // Or more specific error info if available
            setLoading(false);
        }
    } else {
        setLoading(false);
    }
};

    const handlePlantChange = (event) => {
        setSelectedPlants(event.target.value);
    };

    const handleSiteChange = (event) => {
        setSelectedSites(event.target.value);
    };

    const handleVendorChange = (event) => {
        setSelectedVendors(event.target.value);
    };
    const handleDateRangeChange = (newDateRange) => {
        setDateRange(newDateRange);
    };

    const handleTopNChange = (event) => {
        setTopN(event.target.value);
    };

    const filterData = () => {
        let filteredData = data.filter(item =>
            selectedPlants.includes(item.Plant) &&
            selectedSites.includes(item.Site) &&
            selectedVendors.includes(item['Vendor Number'] || 'Unknown') // Use 'Unknown' for missing vendors

        );

        if (dateRange[0] && dateRange[1]) {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item['Pstng Date']);
                const startDate = dateRange[0];
                const endDate = dateRange[1];
                return itemDate >= startDate && itemDate <= endDate;
            });
        }
        return filteredData;
    };

    const generateCharts = (inputData) => {
    // Filter data based on current filter settings
    const filteredData = filterData();

    // --- Transaction Chart ---
    const transactionCounts = {};
    filteredData.forEach(item => {
        const material = item['Material Number'];
        transactionCounts[material] = (transactionCounts[material] || 0) + 1;
    });

    const sortedTransactions = Object.entries(transactionCounts).sort(([, a], [, b]) => b - a);
    const topNTransactions = topN === 'All' ? sortedTransactions : sortedTransactions.slice(0, parseInt(topN));
    const transactionLabels = topNTransactions.map(([material]) => material);
    const transactionValues = topNTransactions.map(([, count]) => count);

        setTransactionChartData({
            labels: transactionLabels,
            datasets: [
                {
                    label: 'Number of Transactions',
                    data: transactionValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        });

    // --- Consumption Chart ---
    const materialConsumptions = {}; //object
    filteredData.forEach(item => {
        const material = item['Material Number'];
        const quantity = parseFloat(item.Quantity);
        materialConsumptions[material] = (materialConsumptions[material] || 0) + Math.abs(quantity); //Ensure quantity is a number
    });


    const sortedConsumptions = Object.entries(materialConsumptions).sort(([, a], [, b]) => b - a);
    const topNConsumptions = topN === 'All' ? sortedConsumptions : sortedConsumptions.slice(0, parseInt(topN));
    const consumptionLabels = topNConsumptions.map(([material]) => material);
    const consumptionValues = topNConsumptions.map(([, quantity]) => quantity);

    setConsumptionChartData({
        labels: consumptionLabels,
        datasets: [
            {
                label: 'Overall Consumption',
                data: consumptionValues,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    });
};
    const handleApplyFilters = () => {
        generateCharts(data);
    };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Material Consumption Analysis</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

        {data.length > 0 && (
            <div className="mt-2"> {/* Replaced Box with div and Tailwind class */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="plant-select-label">Plants</InputLabel>
                    <Select
                        labelId="plant-select-label"
                        multiple
                        value={selectedPlants}
                        onChange={handlePlantChange}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {plants.map((plant) => (
                            <MenuItem key={plant} value={plant}>
                                {plant}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="site-select-label">Sites</InputLabel>
                    <Select
                        labelId="site-select-label"
                        multiple
                        value={selectedSites}
                        onChange={handleSiteChange}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {sites.map((site) => (
                            <MenuItem key={site} value={site}>
                                {site}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="vendor-select-label">Vendors</InputLabel>
                    <Select
                        labelId="vendor-select-label"
                        multiple
                        value={selectedVendors}
                        onChange={handleVendorChange}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {vendors.map((vendor) => (
                            <MenuItem key={vendor} value={vendor}>
                                {vendor}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                 <FormControl fullWidth margin="normal">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Date Range"
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            renderInput={(params) => <TextField {...params} />}
                            inputFormat="dd/MM/yyyy"
                        />
                    </LocalizationProvider>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="top-n-select-label">Top N Materials</InputLabel>
                    <Select
                        labelId="top-n-select-label"
                        value={topN}
                        onChange={handleTopNChange}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value="All">All</MenuItem>
                    </Select>
                </FormControl>

                 <Button variant="contained" color="primary" onClick={handleApplyFilters}>
                    Apply Filters
                </Button>
            </div>
        )}

      {transactionChartData && (
        <div className="mt-4"> {/* Replaced Box with div and Tailwind class */}
          <h2>Number of Transactions</h2>
          <Chart type="bar" data={transactionChartData} />
        </div>
      )}

      {consumptionChartData && (
        <div className="mt-4"> {/* Replaced Box with div and Tailwind class */}
          <h2>Overall Consumption</h2>
          <Chart type="bar" data={consumptionChartData} />
        </div>
      )}
    </div>
  );
}