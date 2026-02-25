// src/services/destinationservices.ts
// This service fetches destination information from the REST Countries API
// It provides details like country name, capital, currency, flag, and region

import fetch from "node-fetch";
import https from "node:https";

// Skip SSL certificate verification (corporate network workaround)
const agent = new https.Agent({ rejectUnauthorized: false });

export type DestinationInfo = {
  countryName: string;
  capital: string;
  currencyName: string;
  currencySymbol: string;
  flag: string;
  region: string;
};

export const getDestinationInfo = async (country: string): Promise<DestinationInfo | null> => {
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`,
      { agent }
    );

    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as Record<string, unknown>[];
    const countryData = data[0] as Record<string, unknown>;

    const currencies = countryData.currencies as Record<
      string,
      { name: string; symbol: string }
    >;
    const firstCurrency = Object.values(currencies)[0];

    const nameObj = countryData.name as { common: string };
    const capitalArr = countryData.capital as string[] | undefined;

    return {
      countryName: nameObj.common,
      capital: capitalArr?.[0] ?? "N/A",
      currencyName: firstCurrency.name,
      currencySymbol: firstCurrency.symbol ?? "$",
      flag: countryData.flag as string,
      region: countryData.region as string,
    };

  } catch (error) {
    console.error("Error fetching destination info:", (error as Error).message);
    return null;
  }
};
