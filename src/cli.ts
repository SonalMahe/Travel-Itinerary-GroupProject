import { getIndiaInfo, getAllDestinations,} from "./services/destinationservices";

const india = await getIndiaInfo();
console.log(india.flag, india.countryName, india.currency);

// Or get all 4 at once:
const all = await getAllDestinations();
// all.forEach((country: any) => console.log(country.countryName));
all.forEach((country: any) =>
  console.log(
    "\n",
    country.flag,
    country.countryName,
    country.capital,
    country.currency,
  ),
);
