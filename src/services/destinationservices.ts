// src/services/destinationservices.ts
// Fetches country information from the REST Countries API
// Countries: India, France, Sweden, Germany

// ─── Types ────────────────────────────────────────────────────────────────────

export type DestinationInfo = {
  countryName: string;
  capital: string;
  currency: string;
  flag: string;
  region: string;
};

// ─── Individual Country Fetchers ──────────────────────────────────────────────

export const getIndiaInfo = async (): Promise<DestinationInfo> => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/name/india");
    const data = await response.json();
    return {
      countryName: data[0].name.common,
      currency: Object.keys(data[0].currencies)[0] ,
      capital: data[0].capital[0] ,
      flag: data[0].flag.alternativeText || data[0].flag,
      region: data[0].region,
    };
  } catch (error) {
    throw new Error("Could not fetch India data");
  }
};

// FOR FRANCE-
export const getFranceInfo = async (): Promise<DestinationInfo> => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/name/france");
    const data = await response.json();
    return {
      countryName: data[0].name.common,
      capital: data[0].capital[0],
      currency: Object.keys(data[0].currencies)[0],
      flag: data[0].flag,
      region: data[0].region,
    };
  } catch (error) {
    throw new Error("Could not fetch France data");
  }
};

//FOR SWEDEN-
export const getSwedenInfo = async (): Promise<DestinationInfo> => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/name/sweden");
    const data = await response.json();
    return {
      countryName: data[0].name.common,
      capital: data[0].capital[0],
      currency: Object.keys(data[0].currencies)[0],
      flag: data[0].flag,
      region: data[0].region,
    };
  } catch (error) {
    throw new Error("Could not fetch Sweden data");
  }
};

//FOR GERMANY-
export const getGermanyInfo = async (): Promise<DestinationInfo> => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/name/germany");
    const data = await response.json();
    return {
      countryName: data[0].name.common,
      capital: data[0].capital[0],
      currency: Object.keys(data[0].currencies)[0],
      flag: data[0].flag,
      region: data[0].region,
    };
  } catch (error) {
    throw new Error("Could not fetch Germany data");
  }
};

// ─── Fetch All Countries ──────────────────────────────────────────────────────

export const getAllDestinations = async (): Promise<DestinationInfo[]> => {
  const india = await getIndiaInfo();
  const france = await getFranceInfo();
  const sweden = await getSwedenInfo();
  const germany = await getGermanyInfo();

  return [india, france, sweden, germany];
};
