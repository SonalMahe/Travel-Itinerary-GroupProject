import { getIndiaInfo, getAllDestinations } from './services/destinationservices';

// const india = await getIndiaInfo();
// console.log(india.flag, india.countryName, india.currency);

// // Or get all 4 at once:
// const all = await getAllDestinations();
// all.forEach((country: any) => console.log(country.countryName));


const test = async (): Promise<void> => {
  const all = await getAllDestinations();
  all.forEach(country => {
    console.log(`${country.flag} ${country.countryName} | Capital: ${country.capital} | Currency: ${country.currency}`);
  });
};

test().catch((error: Error) => console.error(error.message));