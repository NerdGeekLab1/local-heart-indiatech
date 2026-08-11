/**
 * Global country / region / city reference data used by public forms.
 * Cities are the major metros per country, plus full state + city coverage
 * for India (the platform's primary market).
 */

export interface CountryGeo {
  code: string;
  name: string;
  dial: string;
  /** State / province / region names (may be empty for small countries). */
  regions: string[];
  cities: string[];
}

const INDIA_REGIONS = [
  "Andaman & Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

const INDIA_CITIES = [
  "Agra", "Ahmedabad", "Ajmer", "Alleppey", "Amritsar", "Aurangabad", "Bengaluru", "Bhopal", "Bhubaneswar",
  "Chandigarh", "Chennai", "Coimbatore", "Darjeeling", "Dehradun", "Delhi", "Dharamshala", "Gangtok",
  "Goa (Panaji)", "Gurugram", "Guwahati", "Gwalior", "Hampi", "Haridwar", "Hyderabad", "Indore", "Jaipur",
  "Jaisalmer", "Jammu", "Jodhpur", "Kanyakumari", "Khajuraho", "Kochi", "Kolkata", "Kodaikanal", "Leh",
  "Lucknow", "Madurai", "Manali", "Mangaluru", "Mumbai", "Munnar", "Mussoorie", "Mysuru", "Nagpur",
  "Nashik", "Noida", "Ooty", "Patna", "Pondicherry", "Pune", "Pushkar", "Raipur", "Rishikesh", "Shillong",
  "Shimla", "Srinagar", "Surat", "Thiruvananthapuram", "Udaipur", "Vadodara", "Varanasi", "Vijayawada",
  "Visakhapatnam",
];

export const COUNTRIES: CountryGeo[] = [
  { code: "IN", name: "India", dial: "+91", regions: INDIA_REGIONS, cities: INDIA_CITIES },
  { code: "US", name: "United States", dial: "+1", regions: ["California", "New York", "Texas", "Florida", "Illinois", "Washington", "Massachusetts", "Colorado", "Georgia", "Nevada", "Hawaii", "Arizona"], cities: ["Atlanta", "Austin", "Boston", "Chicago", "Denver", "Honolulu", "Houston", "Las Vegas", "Los Angeles", "Miami", "New York", "Phoenix", "San Francisco", "Seattle", "Washington DC"] },
  { code: "GB", name: "United Kingdom", dial: "+44", regions: ["England", "Scotland", "Wales", "Northern Ireland"], cities: ["Belfast", "Birmingham", "Bristol", "Cardiff", "Edinburgh", "Glasgow", "Leeds", "Liverpool", "London", "Manchester", "Oxford"] },
  { code: "AE", name: "United Arab Emirates", dial: "+971", regions: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Fujairah", "Ras Al Khaimah", "Umm Al Quwain"], cities: ["Abu Dhabi", "Ajman", "Al Ain", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah"] },
  { code: "AU", name: "Australia", dial: "+61", regions: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "ACT", "Northern Territory"], cities: ["Adelaide", "Brisbane", "Cairns", "Canberra", "Darwin", "Gold Coast", "Hobart", "Melbourne", "Perth", "Sydney"] },
  { code: "CA", name: "Canada", dial: "+1", regions: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Nova Scotia", "Saskatchewan"], cities: ["Calgary", "Edmonton", "Halifax", "Montreal", "Ottawa", "Quebec City", "Toronto", "Vancouver", "Victoria", "Winnipeg"] },
  { code: "SG", name: "Singapore", dial: "+65", regions: [], cities: ["Singapore"] },
  { code: "DE", name: "Germany", dial: "+49", regions: ["Bavaria", "Berlin", "Hamburg", "Hesse", "North Rhine-Westphalia", "Saxony", "Baden-Württemberg"], cities: ["Berlin", "Cologne", "Dresden", "Düsseldorf", "Frankfurt", "Hamburg", "Munich", "Stuttgart"] },
  { code: "FR", name: "France", dial: "+33", regions: ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Occitanie", "Nouvelle-Aquitaine", "Auvergne-Rhône-Alpes", "Brittany"], cities: ["Bordeaux", "Lille", "Lyon", "Marseille", "Nantes", "Nice", "Paris", "Strasbourg", "Toulouse"] },
  { code: "IT", name: "Italy", dial: "+39", regions: ["Lazio", "Lombardy", "Tuscany", "Veneto", "Campania", "Sicily", "Piedmont"], cities: ["Bologna", "Florence", "Milan", "Naples", "Palermo", "Rome", "Turin", "Venice", "Verona"] },
  { code: "ES", name: "Spain", dial: "+34", regions: ["Madrid", "Catalonia", "Andalusia", "Valencia", "Basque Country", "Balearic Islands", "Canary Islands"], cities: ["Barcelona", "Bilbao", "Granada", "Madrid", "Malaga", "Palma", "Seville", "Valencia"] },
  { code: "NL", name: "Netherlands", dial: "+31", regions: ["North Holland", "South Holland", "Utrecht", "North Brabant", "Gelderland"], cities: ["Amsterdam", "Eindhoven", "Groningen", "Rotterdam", "The Hague", "Utrecht"] },
  { code: "CH", name: "Switzerland", dial: "+41", regions: ["Zurich", "Bern", "Geneva", "Vaud", "Valais", "Ticino"], cities: ["Basel", "Bern", "Geneva", "Interlaken", "Lausanne", "Lucerne", "Zermatt", "Zurich"] },
  { code: "JP", name: "Japan", dial: "+81", regions: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Aichi", "Okinawa"], cities: ["Fukuoka", "Hiroshima", "Kobe", "Kyoto", "Nagoya", "Naha", "Osaka", "Sapporo", "Tokyo", "Yokohama"] },
  { code: "KR", name: "South Korea", dial: "+82", regions: ["Seoul", "Busan", "Jeju", "Incheon", "Gyeonggi"], cities: ["Busan", "Daegu", "Gyeongju", "Incheon", "Jeju City", "Seoul"] },
  { code: "CN", name: "China", dial: "+86", regions: ["Beijing", "Shanghai", "Guangdong", "Sichuan", "Yunnan", "Zhejiang"], cities: ["Beijing", "Chengdu", "Guangzhou", "Hangzhou", "Kunming", "Shanghai", "Shenzhen", "Xi'an"] },
  { code: "HK", name: "Hong Kong SAR", dial: "+852", regions: [], cities: ["Hong Kong", "Kowloon"] },
  { code: "TH", name: "Thailand", dial: "+66", regions: ["Bangkok", "Chiang Mai", "Phuket", "Krabi", "Surat Thani"], cities: ["Bangkok", "Chiang Mai", "Chiang Rai", "Hua Hin", "Koh Samui", "Krabi", "Pattaya", "Phuket"] },
  { code: "VN", name: "Vietnam", dial: "+84", regions: ["Hanoi", "Ho Chi Minh City", "Da Nang", "Quang Nam", "Lao Cai"], cities: ["Da Nang", "Hanoi", "Ho Chi Minh City", "Hoi An", "Hue", "Nha Trang", "Sapa"] },
  { code: "ID", name: "Indonesia", dial: "+62", regions: ["Bali", "Jakarta", "West Java", "Yogyakarta", "East Java"], cities: ["Bandung", "Denpasar", "Jakarta", "Lombok", "Surabaya", "Ubud", "Yogyakarta"] },
  { code: "MY", name: "Malaysia", dial: "+60", regions: ["Kuala Lumpur", "Penang", "Sabah", "Sarawak", "Johor", "Malacca"], cities: ["George Town", "Ipoh", "Johor Bahru", "Kota Kinabalu", "Kuala Lumpur", "Kuching", "Malacca"] },
  { code: "NP", name: "Nepal", dial: "+977", regions: ["Bagmati", "Gandaki", "Lumbini", "Koshi"], cities: ["Bhaktapur", "Chitwan", "Kathmandu", "Lumbini", "Nagarkot", "Pokhara"] },
  { code: "LK", name: "Sri Lanka", dial: "+94", regions: ["Western", "Central", "Southern", "Uva"], cities: ["Colombo", "Ella", "Galle", "Kandy", "Negombo", "Nuwara Eliya", "Sigiriya"] },
  { code: "BT", name: "Bhutan", dial: "+975", regions: ["Thimphu", "Paro", "Punakha", "Bumthang"], cities: ["Bumthang", "Paro", "Punakha", "Thimphu"] },
  { code: "BD", name: "Bangladesh", dial: "+880", regions: ["Dhaka", "Chittagong", "Sylhet", "Khulna"], cities: ["Chittagong", "Cox's Bazar", "Dhaka", "Khulna", "Sylhet"] },
  { code: "NZ", name: "New Zealand", dial: "+64", regions: ["Auckland", "Wellington", "Canterbury", "Otago", "Waikato"], cities: ["Auckland", "Christchurch", "Dunedin", "Queenstown", "Rotorua", "Wellington"] },
  { code: "ZA", name: "South Africa", dial: "+27", regions: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"], cities: ["Cape Town", "Durban", "Johannesburg", "Port Elizabeth", "Pretoria", "Stellenbosch"] },
  { code: "KE", name: "Kenya", dial: "+254", regions: ["Nairobi", "Coast", "Rift Valley"], cities: ["Diani", "Kisumu", "Maasai Mara", "Mombasa", "Nairobi", "Naivasha"] },
  { code: "EG", name: "Egypt", dial: "+20", regions: ["Cairo", "Luxor", "Aswan", "Red Sea", "Alexandria"], cities: ["Alexandria", "Aswan", "Cairo", "Hurghada", "Luxor", "Sharm El Sheikh"] },
  { code: "TR", name: "Türkiye", dial: "+90", regions: ["Istanbul", "Antalya", "Cappadocia (Nevşehir)", "Izmir", "Muğla"], cities: ["Antalya", "Bodrum", "Bursa", "Fethiye", "Göreme", "Istanbul", "Izmir"] },
  { code: "BR", name: "Brazil", dial: "+55", regions: ["São Paulo", "Rio de Janeiro", "Bahia", "Amazonas", "Minas Gerais"], cities: ["Belo Horizonte", "Brasília", "Florianópolis", "Manaus", "Rio de Janeiro", "Salvador", "São Paulo"] },
  { code: "MX", name: "Mexico", dial: "+52", regions: ["Mexico City", "Quintana Roo", "Jalisco", "Oaxaca", "Yucatán"], cities: ["Cancún", "Guadalajara", "Mérida", "Mexico City", "Oaxaca", "Playa del Carmen", "Tulum"] },
  { code: "AR", name: "Argentina", dial: "+54", regions: ["Buenos Aires", "Mendoza", "Patagonia", "Salta"], cities: ["Bariloche", "Buenos Aires", "Córdoba", "El Calafate", "Mendoza", "Salta"] },
  { code: "PT", name: "Portugal", dial: "+351", regions: ["Lisbon", "Porto", "Algarve", "Madeira", "Azores"], cities: ["Braga", "Faro", "Funchal", "Lagos", "Lisbon", "Porto", "Sintra"] },
  { code: "GR", name: "Greece", dial: "+30", regions: ["Attica", "Crete", "South Aegean", "Central Macedonia"], cities: ["Athens", "Chania", "Heraklion", "Mykonos", "Rhodes", "Santorini", "Thessaloniki"] },
  { code: "SE", name: "Sweden", dial: "+46", regions: ["Stockholm", "Västra Götaland", "Skåne", "Norrbotten"], cities: ["Gothenburg", "Kiruna", "Malmö", "Stockholm", "Uppsala"] },
  { code: "NO", name: "Norway", dial: "+47", regions: ["Oslo", "Vestland", "Troms", "Trøndelag"], cities: ["Bergen", "Oslo", "Stavanger", "Tromsø", "Trondheim"] },
  { code: "DK", name: "Denmark", dial: "+45", regions: ["Capital Region", "Central Denmark", "Southern Denmark"], cities: ["Aalborg", "Aarhus", "Copenhagen", "Odense"] },
  { code: "IE", name: "Ireland", dial: "+353", regions: ["Leinster", "Munster", "Connacht", "Ulster"], cities: ["Cork", "Dublin", "Galway", "Killarney", "Limerick"] },
  { code: "AT", name: "Austria", dial: "+43", regions: ["Vienna", "Tyrol", "Salzburg", "Styria"], cities: ["Graz", "Innsbruck", "Salzburg", "Vienna"] },
  { code: "PL", name: "Poland", dial: "+48", regions: ["Masovia", "Lesser Poland", "Pomerania", "Silesia"], cities: ["Gdańsk", "Kraków", "Poznań", "Warsaw", "Wrocław"] },
  { code: "CZ", name: "Czechia", dial: "+420", regions: ["Prague", "South Moravia", "Karlovy Vary"], cities: ["Brno", "Karlovy Vary", "Olomouc", "Prague"] },
  { code: "IL", name: "Israel", dial: "+972", regions: ["Tel Aviv", "Jerusalem", "Haifa", "Southern"], cities: ["Eilat", "Haifa", "Jerusalem", "Tel Aviv"] },
  { code: "SA", name: "Saudi Arabia", dial: "+966", regions: ["Riyadh", "Makkah", "Eastern Province", "Madinah"], cities: ["AlUla", "Dammam", "Jeddah", "Madinah", "Makkah", "Riyadh"] },
  { code: "QA", name: "Qatar", dial: "+974", regions: [], cities: ["Al Wakrah", "Doha", "Lusail"] },
  { code: "OM", name: "Oman", dial: "+968", regions: ["Muscat", "Dhofar", "Musandam"], cities: ["Muscat", "Nizwa", "Salalah", "Sur"] },
  { code: "PH", name: "Philippines", dial: "+63", regions: ["Metro Manila", "Palawan", "Cebu", "Bohol"], cities: ["Boracay", "Cebu City", "Davao", "El Nido", "Manila", "Tagbilaran"] },
  { code: "RU", name: "Russia", dial: "+7", regions: ["Moscow", "Saint Petersburg", "Kazan", "Sochi"], cities: ["Kazan", "Moscow", "Saint Petersburg", "Sochi"] },
];

export const COUNTRY_NAMES = COUNTRIES.map(c => c.name);

export const findCountry = (name?: string | null) =>
  COUNTRIES.find(c => c.name.toLowerCase() === (name || "").trim().toLowerCase());

export const regionsFor = (country?: string | null) => findCountry(country)?.regions ?? [];
export const citiesFor = (country?: string | null) => findCountry(country)?.cities ?? [];
