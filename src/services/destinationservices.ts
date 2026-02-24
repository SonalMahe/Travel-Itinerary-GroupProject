// src/services/destinationservices.ts
// This service fetches destination information from the REST Countries API
// It provides details like country name, capital, currency, flag, and region
// The getDestinationInfo function takes a country name as input and returns a Promise that resolves to a DestinationInfo object or null if the country is not found
//example- India, France, Japan, italy, spain, sweden, germany

export type DestinationInfo = {
  countryName: string;
  capital: string;
  currency: string;
  flag: string;
  region: string;
};

export const getDestinationInfo = async (country: string): Promise <DestinationInfo | null> => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true`);

    if (!response.ok) {
      throw new Error("Country not found");
    }
    const data = await response.json();
    const countryData = data[0];

    const currencies = countryData.currencies;
    const firstCurrency : any = Object.values(currencies)[0];   //It converts an object into an array of its values.

    return {
      countryName: countryData.name.common,
      capital: countryData.capital?.[0],
      currency: firstCurrency.name,
      flag: countryData.flag,
      region: countryData.region,
    };

  } catch (error) {
    console.log("Error fetching destination info:", error);
    return null;
  }
};
