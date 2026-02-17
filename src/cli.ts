import { getIndiaInfo, getAllDestinations } from './src/services/destinationservices';

const india = await getIndiaInfo();
console.log(india.flag, india.countryName, india.currency);

// Or get all 4 at once:
const all = await getAllDestinations();
all.forEach(country => console.log(country.countryName));