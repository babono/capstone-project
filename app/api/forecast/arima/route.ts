// @ts-nocheck
import { NextResponse } from 'next/server';
import ARIMA from 'arima';

interface ForecastRequestBody {
  timeSeries: number[];
  forecastWeeks: number;
  seasonality: 'Yes' | 'No';
  lastHistoricalYear: number; // Added this
}

interface ForecastResultItem {
  year: number;
  week: number;
  predicted_consumption: number;
}

export async function POST(request: Request) {
  try {
    const body: ForecastRequestBody = await request.json();
    const { timeSeries, forecastWeeks, seasonality, lastHistoricalYear } = body; // Destructure new param

    if (!timeSeries || timeSeries.length === 0 || !forecastWeeks || !lastHistoricalYear) {
      return NextResponse.json({ error: 'Missing required parameters: timeSeries, forecastWeeks, lastHistoricalYear.' }, { status: 400 });
    }

    const arimaOpts: any = {
      auto: true,
      verbose: false,
    };

    if (seasonality === "Yes") {
      arimaOpts.s = 52;
      arimaOpts.P = 1;
      arimaOpts.D = 1;
      arimaOpts.Q = 0;
    }

    console.log("Time series received by API:", timeSeries);
    const arima = new ARIMA(arimaOpts);
    arima.train(timeSeries);
    const [predictions] = arima.predict(forecastWeeks);
    console.log("Raw ARIMA predictions:", predictions);

    let currentYear = lastHistoricalYear + 1; // Forecast starts the year AFTER the historical data
    let currentWeek = 1;

    const results: ForecastResultItem[] = predictions.map((pred: number) => {
      const consumption = Math.max(0, parseFloat(pred.toFixed(2)));
      const forecastItem = {
        year: currentYear,
        week: currentWeek,
        predicted_consumption: consumption,
      };
      currentWeek++;
      if (currentWeek > 52) {
        currentWeek = 1;
        currentYear++;
      }
      return forecastItem;
    });

    return NextResponse.json({ forecast: results }, { status: 200 });

  } catch (e: any) {
    console.error("ARIMA API Error:", e);
    return NextResponse.json({ error: e.message || 'Error performing ARIMA forecast.' }, { status: 500 });
  }
}