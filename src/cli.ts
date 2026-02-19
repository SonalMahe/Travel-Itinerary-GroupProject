import { getIndiaInfo, getAllDestinations,} from "./services/destinationservices.js";

const india = await getIndiaInfo("India");
console.log(india.flag, india.countryName, india.currency);

// Or get all 4 at once:
const all = await getAllDestinations("India");
// all.forEach((country: any) => console.log(country.countryName));
all.forEach((country: any) =>
  console.log(
     
    "Flag:", country.flag,"\n",
    "Country:", country.countryName,"\n",
    "Capital:", country.capital,"\n",
    "Currency:", country.currency,
  ),
);
