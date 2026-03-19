import hostRavi from "@/assets/host-ravi.jpg";
import hostPriya from "@/assets/host-priya.jpg";
import hostArjun from "@/assets/host-arjun.jpg";
import hostMeera from "@/assets/host-meera.jpg";
import hostDeepak from "@/assets/host-deepak.jpg";
import hostSunita from "@/assets/host-sunita.jpg";
import hostKiran from "@/assets/host-kiran.jpg";
import expWedding from "@/assets/exp-wedding.jpg";
import expSpiritual from "@/assets/exp-spiritual.jpg";
import expVillage from "@/assets/exp-village.jpg";
import expFood from "@/assets/exp-food.jpg";
import expFestival from "@/assets/exp-festival.jpg";
import expWellness from "@/assets/exp-wellness.jpg";
import expAdventure from "@/assets/exp-adventure.jpg";
import expBeach from "@/assets/exp-beach.jpg";

export interface StayRoom {
  name: string;
  type: "Private Room" | "Shared Room" | "Entire Home" | "Heritage Suite";
  beds: number;
  maxGuests: number;
  pricePerNight: number;
  amenities: string[];
  description: string;
}

export interface StayInfo {
  propertyName: string;
  propertyType: "Homestay" | "Heritage Haveli" | "Houseboat" | "Villa" | "Apartment" | "Farm Stay" | "Studio Apartment" | "Resort" | "Hotel Room";
  description: string;
  images: string[];
  rooms: StayRoom[];
  amenities: string[];
  checkIn: string;
  checkOut: string;
  houseRules: string[];
}

export interface Vehicle {
  type: "SUV" | "Sedan" | "Hatchback" | "Cruiser" | "Scooter" | "Motorcycle" | "Auto Rickshaw" | "Boat" | "Taxi" | "Premium MPV" | "Vintage Jeep" | string;
  model: string;
  capacity: number;
  ac: boolean;
  pricePerDay: number;
  pricePerKm: number;
  pricingModel?: "per_day" | "per_km" | "both";
  features: string[];
  image?: string;
}

export interface TransportInfo {
  description: string;
  vehicles: Vehicle[];
  airports: string[];
  coverage: string[];
  driverLanguages: string[];
}

export interface FoodDish {
  name: string;
  description: string;
  cuisine: string;
  dietaryTags: string[];
  price: number;
}

export interface FoodInfo {
  description: string;
  cuisines: string[];
  mealTypes: string[];
  specialties: string[];
  dietaryOptions: string[];
  dishes: FoodDish[];
  minimumOrder?: number;
  advanceNotice?: string;
}

export interface Host {
  id: string;
  name: string;
  city: string;
  tagline: string;
  bio: string;
  image: string;
  rating: number;
  reviewCount: number;
  services: string[];
  languages: string[];
  pricePerDay: number;
  verified: boolean;
  safetyScore: number;
  responseTime: string;
  specialties?: string[];
  stayInfo?: StayInfo;
  transportInfo?: TransportInfo;
  foodInfo?: FoodInfo;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  category: string;
  hostId: string;
  hostName: string;
  hostCity: string;
  rating: number;
  reviewCount?: number;
  highlights?: string[];
}

export interface Review {
  id: string;
  hostId: string;
  travelerName: string;
  country: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string;
  experienceType?: string;
}

export interface Booking {
  id: string;
  hostId: string;
  travelerId: string;
  services: string[];
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  message?: string;
  createdAt: string;
}

export interface DestinationSite {
  name: string;
  type: "monument" | "temple" | "palace" | "nature" | "market" | "museum" | "beach" | "fort";
  description: string;
  lat: number;
  lng: number;
  entryFee?: string;
  bestTime?: string;
  duration?: string;
}

export interface Destination {
  name: string;
  state: string;
  hostCount: number;
  tagline: string;
  description: string;
  highlights?: string[];
  bestSeason?: string;
  avgTemp?: string;
  sites?: DestinationSite[];
}

export interface TravelTip {
  id: string;
  title: string;
  category: "safety" | "culture" | "food" | "transport" | "packing" | "money" | "health";
  content: string;
  icon: string;
}

export const hosts: Host[] = [
  {
    id: "ravi-jaipur",
    name: "Ravi",
    city: "Jaipur",
    tagline: "Your gateway to the Pink City's hidden gems",
    bio: "Born and raised in Jaipur, I've spent 8 years showing travelers the Rajasthan that guidebooks miss. From secret rooftop chai spots to artisan workshops in the old city, I create journeys that feel like coming home to a friend.",
    image: hostRavi,
    rating: 4.9,
    reviewCount: 127,
    services: ["Guide", "Stay", "Transport", "Food"],
    languages: ["English", "Hindi", "French"],
    pricePerDay: 45,
    verified: true,
    safetyScore: 98,
    responseTime: "< 1 hour",
    specialties: ["Cultural", "Wedding", "Village"],
    stayInfo: {
      propertyName: "Ravi's Heritage Haveli",
      propertyType: "Heritage Haveli",
      description: "A beautifully restored 150-year-old haveli in the heart of the old city. Original Rajasthani frescoes adorn the walls, while modern comforts ensure a luxurious stay. Wake up to palace views from the rooftop terrace.",
      images: [hostRavi, hostRavi, hostRavi, hostRavi],
      rooms: [
        { name: "Maharaja Suite", type: "Heritage Suite", beds: 1, maxGuests: 2, pricePerNight: 65, amenities: ["AC", "Ensuite Bathroom", "Palace View", "King Bed", "Mini Fridge"], description: "Our signature room with hand-painted walls and a private balcony overlooking Nahargarh Fort." },
        { name: "Rani Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 45, amenities: ["AC", "Ensuite Bathroom", "Queen Bed", "Desk"], description: "A charming private room with traditional jaali windows and handcrafted furniture." },
        { name: "Courtyard Room", type: "Private Room", beds: 2, maxGuests: 3, pricePerNight: 35, amenities: ["Fan", "Shared Bathroom", "Twin Beds"], description: "Opens directly into the central courtyard with its beautiful marble fountain." },
      ],
      amenities: ["Free WiFi", "Rooftop Terrace", "Home-Cooked Meals", "Laundry", "24hr Hot Water", "Courtyard Garden", "Library", "Bicycle Rental"],
      checkIn: "2:00 PM",
      checkOut: "11:00 AM",
      houseRules: ["No smoking indoors", "Shoes off at entrance", "Quiet hours 10PM–7AM", "Pets not allowed"],
    },
    transportInfo: {
      description: "Comfortable and reliable transport across Rajasthan with experienced local drivers who double as guides.",
      vehicles: [
        { type: "Sedan", model: "Maruti Suzuki Dzire", capacity: 4, ac: true, pricePerDay: 35, pricePerKm: 0.15, pricingModel: "both", features: ["AC", "Music System", "Phone Charger", "First Aid Kit"] },
        { type: "SUV", model: "Toyota Innova Crysta", capacity: 7, ac: true, pricePerDay: 55, pricePerKm: 0.20, pricingModel: "both", features: ["AC", "Music System", "Extra Luggage Space", "Phone Charger", "Water Bottles"] },
        { type: "Vintage Jeep", model: "Mahindra Thar (Open Top)", capacity: 4, ac: false, pricePerDay: 65, pricePerKm: 0.25, pricingModel: "per_day", features: ["Open Top", "Desert Ready", "Great for Photos", "Rugged Terrain"] },
      ],
      airports: ["Jaipur International Airport (JAI)"],
      coverage: ["Jaipur City", "Amber Fort", "Pushkar", "Ajmer", "Ranthambore", "Jodhpur", "Udaipur"],
      driverLanguages: ["English", "Hindi"],
    },
    foodInfo: {
      description: "Savor authentic Rajasthani home-cooked meals prepared by Ravi's mother using family recipes passed down through generations.",
      cuisines: ["Rajasthani", "North Indian", "Street Food"],
      mealTypes: ["Breakfast", "Lunch", "Dinner"],
      specialties: ["Dal Baati Churma", "Laal Maas", "Ghevar", "Pyaaz Kachori"],
      dietaryOptions: ["Vegetarian", "Vegan", "Jain"],
      dishes: [
        { name: "Dal Baati Churma", description: "Rajasthani signature — baked wheat balls with spiced lentils and sweet churma", cuisine: "Rajasthani", dietaryTags: ["Vegetarian"], price: 8 },
        { name: "Laal Maas", description: "Fiery red mutton curry slow-cooked with mathania chillies", cuisine: "Rajasthani", dietaryTags: ["Non-Veg", "Spicy"], price: 12 },
        { name: "Ker Sangri", description: "Desert beans and berries in a tangy spice mix — unique to Rajasthan", cuisine: "Rajasthani", dietaryTags: ["Vegan"], price: 7 },
        { name: "Rajasthani Thali", description: "Full traditional thali with 12 items including sweets", cuisine: "Rajasthani", dietaryTags: ["Vegetarian"], price: 15 },
      ],
      minimumOrder: 2,
      advanceNotice: "4 hours",
    },
  },
  {
    id: "priya-kerala",
    name: "Priya",
    city: "Alleppey",
    tagline: "Backwaters, spices, and stories of Kerala",
    bio: "As a fourth-generation spice farmer's daughter, I share the authentic Kerala — houseboat mornings, temple festivals, and cooking lessons with my grandmother. My family homestay sits right on the backwaters.",
    image: hostPriya,
    rating: 4.8,
    reviewCount: 89,
    services: ["Guide", "Stay", "Food"],
    languages: ["English", "Hindi", "Malayalam"],
    pricePerDay: 35,
    verified: true,
    safetyScore: 97,
    responseTime: "< 2 hours",
    specialties: ["Food", "Cultural", "Wellness"],
    stayInfo: {
      propertyName: "Priya's Backwater Homestay",
      propertyType: "Homestay",
      description: "A traditional Kerala home right on the backwaters, surrounded by coconut palms.",
      images: [hostPriya, hostPriya, hostPriya],
      rooms: [
        { name: "Backwater View Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 40, amenities: ["Fan", "Ensuite Bathroom", "Backwater View", "Mosquito Net"], description: "Peaceful room overlooking the serene backwaters." },
        { name: "Garden Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 30, amenities: ["Fan", "Shared Bathroom", "Garden View"], description: "Cozy room opening to the spice garden." },
      ],
      amenities: ["Home-Cooked Kerala Meals", "Canoe Rides", "Spice Garden Tour", "Free WiFi", "Yoga Deck", "Cooking Classes"],
      checkIn: "1:00 PM",
      checkOut: "11:00 AM",
      houseRules: ["Vegetarian property", "No alcohol on premises", "Shoes off indoors", "Eco-friendly toiletries provided"],
    },
    foodInfo: {
      description: "Experience authentic Kerala cuisine with Priya's grandmother.",
      cuisines: ["Kerala", "South Indian", "Ayurvedic"],
      mealTypes: ["Breakfast", "Lunch", "Dinner", "Cooking Class"],
      specialties: ["Kerala Fish Curry", "Appam & Stew", "Banana Leaf Sadhya", "Payasam"],
      dietaryOptions: ["Vegetarian", "Vegan", "Pescatarian", "Ayurvedic"],
      dishes: [
        { name: "Kerala Sadhya", description: "Grand vegetarian feast served on banana leaf with 20+ items", cuisine: "Kerala", dietaryTags: ["Vegetarian"], price: 12 },
        { name: "Meen Pollichathu", description: "Pearl spot fish marinated in spices, wrapped in banana leaf and grilled", cuisine: "Kerala", dietaryTags: ["Pescatarian"], price: 14 },
        { name: "Appam & Vegetable Stew", description: "Lacy rice pancakes with coconut milk stew", cuisine: "Kerala", dietaryTags: ["Vegetarian"], price: 8 },
        { name: "Cooking Class (3 dishes)", description: "Learn to make Kerala curry, appam, and payasam with grandmother", cuisine: "Kerala", dietaryTags: ["Vegetarian"], price: 25 },
      ],
      advanceNotice: "Same day morning",
    },
  },
  {
    id: "arjun-varanasi",
    name: "Arjun",
    city: "Varanasi",
    tagline: "Spiritual journeys through India's oldest city",
    bio: "I'm a fifth-generation priest's son who chose to bridge ancient Varanasi with the modern traveler.",
    image: hostArjun,
    rating: 4.9,
    reviewCount: 203,
    services: ["Guide", "Transport"],
    languages: ["English", "Hindi", "Sanskrit"],
    pricePerDay: 40,
    verified: true,
    safetyScore: 99,
    responseTime: "< 30 min",
    specialties: ["Spiritual", "Cultural"],
    transportInfo: {
      description: "Navigate Varanasi's ancient lanes and beyond with our local transport options.",
      vehicles: [
        { type: "Boat", model: "Traditional Wooden Boat", capacity: 6, ac: false, pricePerDay: 25, pricePerKm: 0, pricingModel: "per_day", features: ["Sunrise Rides", "Aarti Viewing", "Photography Friendly", "Cushioned Seats"] },
        { type: "Auto Rickshaw", model: "Bajaj RE", capacity: 3, ac: false, pricePerDay: 15, pricePerKm: 0.08, pricingModel: "both", features: ["City Navigation", "Narrow Lane Access", "Local Experience"] },
        { type: "Sedan", model: "Maruti Suzuki Ertiga", capacity: 6, ac: true, pricePerDay: 40, pricePerKm: 0.15, pricingModel: "both", features: ["AC", "Airport Transfers", "Outstation Trips"] },
      ],
      airports: ["Lal Bahadur Shastri Airport (VNS)"],
      coverage: ["Varanasi Ghats", "Sarnath", "Ramnagar Fort", "Chunar Fort", "Allahabad (Prayagraj)"],
      driverLanguages: ["English", "Hindi"],
    },
  },
  {
    id: "meera-goa",
    name: "Meera",
    city: "Goa",
    tagline: "Beach vibes, local secrets & Goan soul food",
    bio: "Goa is more than parties — it's fishing villages at dawn, Portuguese churches at sunset, and my grandmother's prawn curry.",
    image: hostMeera,
    rating: 4.7,
    reviewCount: 64,
    services: ["Guide", "Stay", "Transport", "Food"],
    languages: ["English", "Hindi", "Konkani", "Portuguese"],
    pricePerDay: 40,
    verified: true,
    safetyScore: 96,
    responseTime: "< 1 hour",
    specialties: ["Food", "Adventure", "Festival"],
    stayInfo: {
      propertyName: "Meera's Beach Villa",
      propertyType: "Villa",
      description: "A charming Portuguese-style villa just 200 meters from Benaulim Beach.",
      images: [hostMeera, hostMeera, hostMeera, hostMeera],
      rooms: [
        { name: "Ocean Breeze Suite", type: "Entire Home", beds: 2, maxGuests: 4, pricePerNight: 75, amenities: ["AC", "Kitchen", "Living Room", "Garden", "Beach Access"], description: "Entire ground floor with a private garden and direct beach path." },
        { name: "Balcão Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 45, amenities: ["AC", "Ensuite Bathroom", "Balcony", "Sea Breeze"], description: "First-floor room with a traditional Goan balcão." },
        { name: "Backpacker Bunk", type: "Shared Room", beds: 4, maxGuests: 4, pricePerNight: 15, amenities: ["Fan", "Shared Bathroom", "Locker", "Common Area"], description: "Social dorm-style room for budget travelers." },
      ],
      amenities: ["Beach Towels", "Bicycle Rental", "BBQ Area", "Free WiFi", "Hammocks", "Outdoor Shower", "Scooter Rental Available"],
      checkIn: "3:00 PM",
      checkOut: "12:00 PM",
      houseRules: ["No parties after 11PM", "Respect neighbors", "Sort recyclables", "Pets allowed with notice"],
    },
    transportInfo: {
      description: "Explore all of Goa at your own pace with our curated vehicle options.",
      vehicles: [
        { type: "Scooter", model: "Honda Activa 6G", capacity: 2, ac: false, pricePerDay: 8, pricePerKm: 0, pricingModel: "per_day", features: ["Helmet Included", "Fuel Efficient", "Easy Parking", "Freedom to Explore"] },
        { type: "Motorcycle", model: "Royal Enfield Classic 350", capacity: 2, ac: false, pricePerDay: 18, pricePerKm: 0, pricingModel: "per_day", features: ["Iconic Ride", "Touring Ready", "Saddlebags Available"] },
        { type: "Hatchback", model: "Maruti Suzuki Swift", capacity: 4, ac: true, pricePerDay: 30, pricePerKm: 0.12, pricingModel: "both", features: ["AC", "Music System", "GPS", "Self-Drive Option"] },
      ],
      airports: ["Goa International Airport (GOI)", "Manohar International Airport (GOX)"],
      coverage: ["North Goa Beaches", "South Goa Beaches", "Old Goa", "Dudhsagar Falls", "Palolem", "Anjuna", "Panjim"],
      driverLanguages: ["English", "Hindi", "Konkani"],
    },
    foodInfo: {
      description: "Goan soul food at its finest — from Portuguese-influenced seafood to fiery Goan vindaloo.",
      cuisines: ["Goan", "Portuguese-Indian", "Seafood", "Thai", "Mexican"],
      mealTypes: ["Breakfast", "Lunch", "Dinner", "Brunch", "BBQ Night"],
      specialties: ["Goan Fish Curry Rice", "Pork Vindaloo", "Bebinca", "Prawn Balchão"],
      dietaryOptions: ["Vegetarian", "Vegan", "Pescatarian", "Gluten-Free"],
      dishes: [
        { name: "Goan Fish Curry Rice", description: "Coconut-based fish curry with local red rice — the soul of Goa", cuisine: "Goan", dietaryTags: ["Pescatarian"], price: 10 },
        { name: "Pork Vindaloo", description: "Portuguese-influenced pork in tangy vinegar-chili sauce", cuisine: "Goan", dietaryTags: ["Non-Veg", "Spicy"], price: 12 },
        { name: "Pad Thai Night", description: "Authentic Pad Thai with fresh prawns — Meera's Thai fusion special", cuisine: "Thai", dietaryTags: ["Pescatarian"], price: 14 },
        { name: "Taco Tuesday", description: "Goan-Mexican fusion tacos with recheado masala fish", cuisine: "Mexican", dietaryTags: ["Pescatarian"], price: 12 },
        { name: "Beach BBQ Platter", description: "Grilled seafood platter with Goan sausages on the beach", cuisine: "Goan", dietaryTags: ["Non-Veg"], price: 25 },
      ],
      minimumOrder: 2,
      advanceNotice: "6 hours",
    },
  },
  {
    id: "deepak-delhi",
    name: "Deepak",
    city: "Delhi",
    tagline: "Old Delhi's chaos, New Delhi's charm — all in one day",
    bio: "A journalist turned travel host, I bring Delhi's stories alive.",
    image: hostDeepak,
    rating: 4.8,
    reviewCount: 156,
    services: ["Guide", "Transport", "Food"],
    languages: ["English", "Hindi", "Urdu", "Punjabi"],
    pricePerDay: 50,
    verified: true,
    safetyScore: 97,
    responseTime: "< 1 hour",
    specialties: ["Food", "Cultural", "Village"],
    transportInfo: {
      description: "Navigate Delhi's sprawling cityscape in comfort.",
      vehicles: [
        { type: "Sedan", model: "Honda City", capacity: 4, ac: true, pricePerDay: 40, pricePerKm: 0.15, pricingModel: "both", features: ["AC", "Music System", "Phone Charger", "Daily Newspaper"] },
        { type: "SUV", model: "Toyota Fortuner", capacity: 7, ac: true, pricePerDay: 70, pricePerKm: 0.25, pricingModel: "both", features: ["Premium AC", "Leather Seats", "WiFi Hotspot", "Water & Snacks"] },
        { type: "Auto Rickshaw", model: "Bajaj RE (Guided)", capacity: 3, ac: false, pricePerDay: 20, pricePerKm: 0.05, pricingModel: "per_day", features: ["Authentic Experience", "Old Delhi Navigation", "Photo-Worthy"] },
      ],
      airports: ["Indira Gandhi International Airport (DEL)"],
      coverage: ["Old Delhi", "New Delhi", "Gurugram", "Noida", "Agra Day Trip", "Mathura-Vrindavan"],
      driverLanguages: ["English", "Hindi", "Punjabi"],
    },
    foodInfo: {
      description: "Deepak's food walks through Old Delhi are legendary.",
      cuisines: ["Mughlai", "North Indian", "Chinese-Indian", "Street Food"],
      mealTypes: ["Breakfast", "Lunch", "Dinner", "Food Walk"],
      specialties: ["Kebabs", "Parathas", "Chole Bhature", "Jalebi"],
      dietaryOptions: ["Vegetarian", "Non-Veg", "Halal"],
      dishes: [
        { name: "Old Delhi Food Walk", description: "4-hour guided walk through Chandni Chowk covering 12+ stops", cuisine: "Street Food", dietaryTags: ["Vegetarian", "Non-Veg"], price: 20 },
        { name: "Mughlai Dinner", description: "Royal Mughlai feast — biryani, kebabs, korma, and sheermal bread", cuisine: "Mughlai", dietaryTags: ["Non-Veg", "Halal"], price: 18 },
        { name: "Paratha Breakfast", description: "Paranthe Wali Gali's legendary stuffed parathas with pickles and lassi", cuisine: "North Indian", dietaryTags: ["Vegetarian"], price: 6 },
        { name: "Indo-Chinese Feast", description: "Chili chicken, hakka noodles, manchurian — Delhi's beloved Chinese-Indian fusion", cuisine: "Chinese-Indian", dietaryTags: ["Non-Veg"], price: 12 },
      ],
      advanceNotice: "2 hours",
    },
  },
  {
    id: "sunita-udaipur",
    name: "Sunita",
    city: "Udaipur",
    tagline: "Romance, royalty & the City of Lakes",
    bio: "I grew up in a haveli overlooking Lake Pichola. As a former art history professor, I weave stories of Mewar's royal past into every tour.",
    image: hostSunita,
    rating: 4.9,
    reviewCount: 112,
    services: ["Guide", "Stay"],
    languages: ["English", "Hindi", "Mewari"],
    pricePerDay: 55,
    verified: true,
    safetyScore: 99,
    responseTime: "< 30 min",
    specialties: ["Cultural", "Wedding", "Wellness"],
    stayInfo: {
      propertyName: "Sunita's Lakeside Haveli",
      propertyType: "Heritage Haveli",
      description: "A lovingly restored 200-year-old haveli on the shores of Lake Pichola.",
      images: [hostSunita, hostSunita, hostSunita],
      rooms: [
        { name: "Lake Palace View Suite", type: "Heritage Suite", beds: 1, maxGuests: 2, pricePerNight: 85, amenities: ["AC", "Ensuite Bathroom", "Lake View", "King Bed", "Minibar", "Room Service"], description: "Panoramic views of Lake Palace from your private balcony." },
        { name: "Courtyard Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 55, amenities: ["AC", "Ensuite Bathroom", "Courtyard Access", "Antique Furniture"], description: "Opens to the inner courtyard." },
      ],
      amenities: ["Rooftop Restaurant", "Lake Views", "Art Gallery", "Heritage Walk", "Free WiFi", "Airport Transfer", "Cultural Evenings"],
      checkIn: "2:00 PM",
      checkOut: "11:00 AM",
      houseRules: ["Heritage property — please be gentle", "No smoking", "Photography welcome", "Children supervised near lake-facing areas"],
    },
  },
  {
    id: "kiran-mumbai",
    name: "Kiran",
    city: "Mumbai",
    tagline: "Bollywood, street food & the city that never sleeps",
    bio: "Mumbai is my playground. From the dabbawalas of CST to the film studios of Goregaon, I show travelers the raw energy of India's capital.",
    image: hostKiran,
    rating: 4.7,
    reviewCount: 78,
    services: ["Guide", "Transport"],
    languages: ["English", "Hindi", "Marathi"],
    pricePerDay: 45,
    verified: true,
    safetyScore: 95,
    responseTime: "< 2 hours",
    specialties: ["Food", "Cultural", "Adventure"],
    transportInfo: {
      description: "Get around Mumbai like a local.",
      vehicles: [
        { type: "Sedan", model: "Maruti Suzuki Ciaz", capacity: 4, ac: true, pricePerDay: 40, pricePerKm: 0.15, pricingModel: "both", features: ["AC", "Music System", "Phone Charger", "Toll Inclusive"] },
        { type: "Taxi", model: "Classic Mumbai Kaali-Peeli", capacity: 4, ac: false, pricePerDay: 25, pricePerKm: 0.10, pricingModel: "per_km", features: ["Iconic Experience", "Meter-Based", "City Navigation"] },
        { type: "Premium MPV", model: "Kia Carens", capacity: 7, ac: true, pricePerDay: 55, pricePerKm: 0.20, pricingModel: "both", features: ["Premium AC", "Entertainment System", "Extra Luggage Space"] },
      ],
      airports: ["Chhatrapati Shivaji Maharaj International Airport (BOM)"],
      coverage: ["South Mumbai", "Bandra-Juhu", "Film City", "Elephanta Caves", "Lonavala Day Trip", "Alibaug"],
      driverLanguages: ["English", "Hindi", "Marathi"],
    },
  },
];

export const experiences: Experience[] = [
  { id: "exp-wedding", title: "Attend an Indian Wedding", description: "Be a guest at a real Indian wedding celebration — the colors, the music, the joy.", image: expWedding, price: 120, duration: "Full Day", category: "Wedding", hostId: "ravi-jaipur", hostName: "Ravi", hostCity: "Jaipur", rating: 4.9, reviewCount: 34, highlights: ["Traditional ceremonies", "Authentic Rajasthani feast", "Dance & music", "Dress in Indian attire"] },
  { id: "exp-spiritual", title: "Sunrise Yoga & Meditation", description: "Begin your day with yoga on the banks of the Ganges as the sun rises over the Himalayas.", image: expSpiritual, price: 30, duration: "3 Hours", category: "Spiritual", hostId: "arjun-varanasi", hostName: "Arjun", hostCity: "Varanasi", rating: 4.8, reviewCount: 67, highlights: ["Ganga aarti viewing", "Guided meditation", "Pranayama session", "Herbal tea ceremony"] },
  { id: "exp-village", title: "Village Life Immersion", description: "Spend a day in a Rajasthani village — cook, farm, and celebrate with locals.", image: expVillage, price: 55, duration: "Full Day", category: "Village", hostId: "ravi-jaipur", hostName: "Ravi", hostCity: "Jaipur", rating: 4.7, reviewCount: 45, highlights: ["Farming experience", "Cook with locals", "Folk music evening", "Camel ride"] },
  { id: "exp-food", title: "Street Food Safari", description: "Taste the real India through its street food — guided by a local who knows every stall.", image: expFood, price: 25, duration: "4 Hours", category: "Food", hostId: "deepak-delhi", hostName: "Deepak", hostCity: "Delhi", rating: 4.9, reviewCount: 89, highlights: ["12+ food stops", "Hidden local stalls", "History of each dish", "Vegetarian & non-veg options"] },
  { id: "exp-festival", title: "Holi Festival Celebration", description: "Experience the world's most colorful festival with a local family.", image: expFestival, price: 75, duration: "Full Day", category: "Festival", hostId: "deepak-delhi", hostName: "Deepak", hostCity: "Delhi", rating: 4.9, reviewCount: 52, highlights: ["Family celebration", "Traditional sweets", "Color play", "Bonfire night"] },
  { id: "exp-wellness", title: "Ayurvedic Wellness Retreat", description: "A day of Ayurvedic healing — massages, herbal treatments, and yoga by the backwaters.", image: expWellness, price: 85, duration: "Full Day", category: "Wellness", hostId: "priya-kerala", hostName: "Priya", hostCity: "Alleppey", rating: 4.8, reviewCount: 38, highlights: ["Abhyanga massage", "Herbal steam bath", "Yoga session", "Ayurvedic lunch"] },
  { id: "exp-adventure", title: "Himalayan Trek & Camping", description: "Trek through stunning mountain trails with camping under the stars.", image: expAdventure, price: 95, duration: "2 Days", category: "Adventure", hostId: "kiran-mumbai", hostName: "Kiran", hostCity: "Mumbai", rating: 4.7, reviewCount: 28, highlights: ["Mountain trails", "Star gazing", "Campfire dinner", "Local guide"] },
  { id: "exp-beach", title: "Goan Beach & Spice Tour", description: "Explore hidden beaches, spice plantations, and Portuguese heritage in beautiful Goa.", image: expBeach, price: 45, duration: "Full Day", category: "Adventure", hostId: "meera-goa", hostName: "Meera", hostCity: "Goa", rating: 4.8, reviewCount: 41, highlights: ["Hidden beaches", "Spice plantation", "Portuguese chapel", "Goan lunch"] },
  { id: "exp-medical-ayurveda", title: "Ayurveda Medical Consultation", description: "Consult with certified Ayurvedic doctors for personalized treatment plans.", image: expWellness, price: 60, duration: "Half Day", category: "Medical Care", hostId: "priya-kerala", hostName: "Priya", hostCity: "Alleppey", rating: 4.9, reviewCount: 22, highlights: ["Certified Ayurvedic doctor", "Personalized treatment plan", "Herbal medicine kit", "Diet & lifestyle guidance"] },
  { id: "exp-medical-dental", title: "Dental Tourism Package", description: "World-class dental care at a fraction of the cost in JCI-accredited clinics.", image: expFood, price: 150, duration: "1-3 Days", category: "Medical Care", hostId: "kiran-mumbai", hostName: "Kiran", hostCity: "Mumbai", rating: 4.6, reviewCount: 15, highlights: ["JCI-accredited clinic", "Airport pickup", "Post-care follow-up", "Recovery lounge"] },
  { id: "exp-medical-yoga-therapy", title: "Therapeutic Yoga for Chronic Pain", description: "Evidence-based yoga therapy sessions designed for chronic conditions.", image: expSpiritual, price: 40, duration: "5 Days", category: "Medical Care", hostId: "arjun-varanasi", hostName: "Arjun", hostCity: "Varanasi", rating: 4.8, reviewCount: 31, highlights: ["Certified yoga therapist", "Personalized program", "Daily progress tracking", "Take-home practice guide"] },
  { id: "exp-wellness-panchakarma", title: "Panchakarma Detox Program", description: "A traditional 7-day Panchakarma detox and rejuvenation program.", image: expWellness, price: 450, duration: "7 Days", category: "Wellness", hostId: "priya-kerala", hostName: "Priya", hostCity: "Alleppey", rating: 4.9, reviewCount: 19, highlights: ["Doctor consultation", "Daily treatments", "Sattvic diet", "Herbal medicines included"] },
  { id: "exp-wellness-sound", title: "Sound Healing & Crystal Therapy", description: "Immerse yourself in Tibetan singing bowls, crystal healing, and guided meditation.", image: expSpiritual, price: 55, duration: "3 Hours", category: "Wellness", hostId: "sunita-udaipur", hostName: "Sunita", hostCity: "Udaipur", rating: 4.7, reviewCount: 24, highlights: ["Singing bowl session", "Crystal healing", "Guided meditation", "Herbal refreshments"] },
];

export const reviews: Review[] = [
  { id: "r1", hostId: "ravi-jaipur", travelerName: "Sarah M.", country: "USA", rating: 5, text: "Ravi made Jaipur feel like home. His knowledge of hidden spots is incredible!", date: "2026-01-15", experienceType: "Guide" },
  { id: "r2", hostId: "ravi-jaipur", travelerName: "Thomas K.", country: "Germany", rating: 5, text: "An unforgettable experience. The homestay was warm and the food was amazing.", date: "2025-12-20", experienceType: "Stay" },
  { id: "r3", hostId: "ravi-jaipur", travelerName: "Yuki T.", country: "Japan", rating: 5, text: "The wedding experience was once in a lifetime. Ravi arranged everything perfectly.", date: "2026-02-10", experienceType: "Wedding" },
  { id: "r4", hostId: "priya-kerala", travelerName: "Emma L.", country: "UK", rating: 5, text: "Priya's family homestay is paradise. Waking up to backwater views and her grandmother's cooking was magical.", date: "2026-01-28", experienceType: "Stay" },
  { id: "r5", hostId: "priya-kerala", travelerName: "Marco B.", country: "Italy", rating: 4, text: "Great cooking class and the houseboat ride was serene. Kerala truly is God's own country.", date: "2025-11-05", experienceType: "Food" },
  { id: "r6", hostId: "arjun-varanasi", travelerName: "Lisa P.", country: "Australia", rating: 5, text: "Arjun's spiritual tour of Varanasi changed my perspective on life. The dawn aarti was transformative.", date: "2026-02-18", experienceType: "Spiritual" },
  { id: "r7", hostId: "arjun-varanasi", travelerName: "David R.", country: "Canada", rating: 5, text: "Walking through lanes older than most civilizations with Arjun narrating stories — incredible.", date: "2026-01-03", experienceType: "Guide" },
  { id: "r8", hostId: "meera-goa", travelerName: "Sophie H.", country: "France", rating: 5, text: "Meera showed us a Goa tourists never see. The hidden beaches and her grandmother's curry were highlights.", date: "2026-02-25", experienceType: "Guide" },
  { id: "r9", hostId: "deepak-delhi", travelerName: "James W.", country: "USA", rating: 5, text: "The food walk through Old Delhi was mind-blowing. Deepak knows every lane and every story.", date: "2026-01-22", experienceType: "Food" },
  { id: "r10", hostId: "sunita-udaipur", travelerName: "Anna S.", country: "Sweden", rating: 5, text: "Sunita's art history knowledge made Udaipur come alive. The rooftop dinner with palace views was dreamy.", date: "2026-03-01", experienceType: "Cultural" },
  { id: "r11", hostId: "kiran-mumbai", travelerName: "Chen W.", country: "China", rating: 4, text: "Kiran's energy matches Mumbai perfectly. The Bollywood studio visit and street food tour were fantastic.", date: "2026-02-14", experienceType: "Guide" },
  { id: "r12", hostId: "deepak-delhi", travelerName: "Maria G.", country: "Spain", rating: 5, text: "Deepak made Delhi feel like a living museum. His journalism background means every corner has a story.", date: "2025-12-28", experienceType: "Cultural" },
];

export const mockBookings: Booking[] = [
  { id: "b1", hostId: "ravi-jaipur", travelerId: "t1", services: ["Guide", "Stay"], startDate: "2026-04-15", endDate: "2026-04-18", guests: 2, totalPrice: 270, status: "confirmed", message: "Excited to explore Jaipur!", createdAt: "2026-03-10" },
  { id: "b2", hostId: "arjun-varanasi", travelerId: "t1", services: ["Guide"], startDate: "2026-05-01", endDate: "2026-05-03", guests: 1, totalPrice: 80, status: "pending", createdAt: "2026-03-15" },
  { id: "b3", hostId: "priya-kerala", travelerId: "t2", services: ["Guide", "Stay"], startDate: "2026-03-20", endDate: "2026-03-25", guests: 2, totalPrice: 350, status: "completed", createdAt: "2026-02-28" },
  { id: "b4", hostId: "meera-goa", travelerId: "t1", services: ["Stay", "Transport"], startDate: "2026-06-10", endDate: "2026-06-15", guests: 3, totalPrice: 420, status: "pending", message: "Looking forward to the beach villa!", createdAt: "2026-03-12" },
  { id: "b5", hostId: "deepak-delhi", travelerId: "t3", services: ["Guide", "Transport"], startDate: "2026-04-01", endDate: "2026-04-03", guests: 4, totalPrice: 200, status: "confirmed", createdAt: "2026-03-08" },
];

export const vibeCategories = [
  { label: "Spiritual", emoji: "🕉️" },
  { label: "Adventure", emoji: "🏔️" },
  { label: "Cultural", emoji: "🎭" },
  { label: "Wedding", emoji: "💒" },
  { label: "Village", emoji: "🏡" },
  { label: "Food", emoji: "🍛" },
  { label: "Festival", emoji: "🎉" },
  { label: "Wellness", emoji: "🧘" },
  { label: "Medical Care", emoji: "🏥" },
];

export const destinations: Destination[] = [
  {
    name: "Jaipur", state: "Rajasthan", hostCount: 12, tagline: "The Pink City",
    description: "Explore majestic forts, vibrant bazaars, and Rajasthani cuisine in India's most colorful city.",
    highlights: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort"],
    bestSeason: "Oct – Mar", avgTemp: "25°C",
    sites: [
      { name: "Amber Fort", type: "fort", description: "Majestic hilltop fort with Sheesh Mahal (Mirror Palace) and panoramic views.", lat: 26.9855, lng: 75.8513, entryFee: "₹200", bestTime: "Morning", duration: "2-3 hrs" },
      { name: "Hawa Mahal", type: "palace", description: "The iconic 'Palace of Winds' with 953 honeycomb windows.", lat: 26.9239, lng: 75.8267, entryFee: "₹50", bestTime: "Sunrise", duration: "1 hr" },
      { name: "City Palace", type: "palace", description: "A blend of Mughal and Rajasthani architecture, still home to the royal family.", lat: 26.9258, lng: 75.8237, entryFee: "₹500", bestTime: "Morning", duration: "2 hrs" },
      { name: "Jantar Mantar", type: "monument", description: "UNESCO World Heritage astronomical observation site with giant instruments.", lat: 26.9248, lng: 75.8244, entryFee: "₹50", bestTime: "Afternoon", duration: "1 hr" },
      { name: "Nahargarh Fort", type: "fort", description: "Stunning sunset views over the Pink City from the Aravalli hills.", lat: 26.9377, lng: 75.8152, entryFee: "₹50", bestTime: "Sunset", duration: "2 hrs" },
      { name: "Johari Bazaar", type: "market", description: "Famous gem and jewelry market in the heart of the old city.", lat: 26.9186, lng: 75.8215, duration: "2 hrs" },
    ],
  },
  {
    name: "Varanasi", state: "Uttar Pradesh", hostCount: 8, tagline: "India's Spiritual Heart",
    description: "Witness ancient rituals on the Ganges, explore 5000-year-old lanes, and find inner peace.",
    highlights: ["Dashashwamedh Ghat", "Kashi Vishwanath", "Sarnath", "Silk Weaving"],
    bestSeason: "Oct – Mar", avgTemp: "22°C",
    sites: [
      { name: "Dashashwamedh Ghat", type: "temple", description: "Main ghat for the spectacular evening Ganga Aarti ceremony.", lat: 25.3109, lng: 83.0107, bestTime: "Evening", duration: "1.5 hrs" },
      { name: "Kashi Vishwanath Temple", type: "temple", description: "One of the 12 Jyotirlingas, the holiest Shiva temple.", lat: 25.3109, lng: 83.0107, bestTime: "Morning", duration: "1 hr" },
      { name: "Sarnath", type: "monument", description: "Where Buddha gave his first sermon. Ancient stupas and museum.", lat: 25.3814, lng: 83.0249, entryFee: "₹25", bestTime: "Morning", duration: "2 hrs" },
      { name: "Manikarnika Ghat", type: "temple", description: "Sacred cremation ghat — witness the cycle of life and death.", lat: 25.3148, lng: 83.0101, bestTime: "Evening", duration: "1 hr" },
    ],
  },
  {
    name: "Alleppey", state: "Kerala", hostCount: 6, tagline: "Venice of the East",
    description: "Cruise through serene backwaters, visit spice gardens, and savor authentic Kerala cuisine.",
    highlights: ["Backwater Cruises", "Spice Gardens", "Vembanad Lake", "Snake Boat Races"],
    bestSeason: "Sep – Mar", avgTemp: "28°C",
    sites: [
      { name: "Vembanad Lake", type: "nature", description: "Kerala's largest lake — take a houseboat cruise through palm-lined waterways.", lat: 9.4981, lng: 76.3388, duration: "4-8 hrs" },
      { name: "Alappuzha Beach", type: "beach", description: "A serene beach with a historic pier and lighthouse.", lat: 9.4917, lng: 76.3297, bestTime: "Sunset", duration: "2 hrs" },
      { name: "Krishnapuram Palace", type: "palace", description: "18th-century palace with Kerala murals and a heritage museum.", lat: 9.3812, lng: 76.3817, entryFee: "₹25", duration: "1 hr" },
    ],
  },
  {
    name: "Goa", state: "Goa", hostCount: 15, tagline: "Beach Paradise",
    description: "Discover hidden beaches, Portuguese heritage, spice plantations, and legendary seafood.",
    highlights: ["Beaches", "Old Goa Churches", "Spice Plantations", "Nightlife"],
    bestSeason: "Nov – Feb", avgTemp: "30°C",
    sites: [
      { name: "Basilica of Bom Jesus", type: "monument", description: "UNESCO World Heritage — houses the remains of St. Francis Xavier.", lat: 15.5009, lng: 73.9116, bestTime: "Morning", duration: "1 hr" },
      { name: "Dudhsagar Falls", type: "nature", description: "Spectacular 4-tiered waterfall on the Goa-Karnataka border.", lat: 15.3144, lng: 74.3143, bestTime: "Monsoon", duration: "Full day" },
      { name: "Anjuna Flea Market", type: "market", description: "Iconic Wednesday flea market — bohemian vibes and everything handmade.", lat: 15.5735, lng: 73.7413, bestTime: "Wednesday", duration: "3 hrs" },
      { name: "Fort Aguada", type: "fort", description: "17th-century Portuguese fort with a lighthouse and sea views.", lat: 15.4925, lng: 73.7736, entryFee: "Free", duration: "1.5 hrs" },
    ],
  },
  {
    name: "Delhi", state: "Delhi", hostCount: 20, tagline: "Capital of Contrasts",
    description: "From Mughal monuments to modern art districts, experience 1000 years of history in one city.",
    highlights: ["Red Fort", "Qutub Minar", "Humayun's Tomb", "Chandni Chowk"],
    bestSeason: "Oct – Mar", avgTemp: "25°C",
    sites: [
      { name: "Red Fort", type: "fort", description: "UNESCO World Heritage — Mughal emperor's residence with stunning architecture.", lat: 28.6562, lng: 77.241, entryFee: "₹35", bestTime: "Morning", duration: "2 hrs" },
      { name: "Qutub Minar", type: "monument", description: "73m tall victory tower from 1193 — India's tallest brick minaret.", lat: 28.5245, lng: 77.1855, entryFee: "₹35", bestTime: "Morning", duration: "1.5 hrs" },
      { name: "Humayun's Tomb", type: "monument", description: "The inspiration for the Taj Mahal — Mughal garden tomb.", lat: 28.5933, lng: 77.2507, entryFee: "₹35", bestTime: "Sunset", duration: "1.5 hrs" },
      { name: "Chandni Chowk", type: "market", description: "Asia's oldest and most chaotic market — paradise for food and shopping.", lat: 28.6505, lng: 77.2303, duration: "3 hrs" },
    ],
  },
  {
    name: "Udaipur", state: "Rajasthan", hostCount: 9, tagline: "City of Lakes",
    description: "Romance, royalty, and lake palaces — Udaipur is India's most picturesque city.",
    highlights: ["Lake Pichola", "City Palace", "Jagdish Temple", "Monsoon Palace"],
    bestSeason: "Sep – Mar", avgTemp: "24°C",
    sites: [
      { name: "City Palace", type: "palace", description: "Rajasthan's largest palace complex overlooking Lake Pichola.", lat: 24.5764, lng: 73.6913, entryFee: "₹300", bestTime: "Morning", duration: "3 hrs" },
      { name: "Lake Pichola", type: "nature", description: "Artificial freshwater lake with islands hosting the Lake Palace and Jag Mandir.", lat: 24.5706, lng: 73.6801, duration: "2 hrs" },
      { name: "Monsoon Palace", type: "palace", description: "Hilltop palace with panoramic views of the Aravalli Range.", lat: 24.5617, lng: 73.6543, entryFee: "₹80", bestTime: "Sunset", duration: "1.5 hrs" },
    ],
  },
  {
    name: "Mumbai", state: "Maharashtra", hostCount: 18, tagline: "City of Dreams",
    description: "Bollywood, street food, colonial architecture, and the unstoppable energy of India's largest city.",
    highlights: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Dharavi"],
    bestSeason: "Oct – Feb", avgTemp: "27°C",
    sites: [
      { name: "Gateway of India", type: "monument", description: "Iconic waterfront arch built to commemorate King George V's visit.", lat: 18.9220, lng: 72.8347, bestTime: "Evening", duration: "1 hr" },
      { name: "Elephanta Caves", type: "monument", description: "UNESCO rock-cut cave temples dedicated to Shiva on an island.", lat: 18.9633, lng: 72.9315, entryFee: "₹40", bestTime: "Morning", duration: "Half day" },
      { name: "Marine Drive", type: "nature", description: "The 'Queen's Necklace' — 3.6km seafront promenade.", lat: 18.9432, lng: 72.8235, bestTime: "Sunset", duration: "1 hr" },
    ],
  },
  { name: "Rishikesh", state: "Uttarakhand", hostCount: 7, tagline: "Yoga Capital", description: "The birthplace of yoga, set against Himalayan foothills with rafting, trekking, and ashrams.", highlights: ["Lakshman Jhula", "Beatles Ashram", "River Rafting"], bestSeason: "Sep – Nov", avgTemp: "20°C" },
  { name: "Hampi", state: "Karnataka", hostCount: 5, tagline: "Ruins & Boulders", description: "UNESCO World Heritage ruins of the Vijayanagara Empire scattered among surreal boulder landscapes.", highlights: ["Virupaksha Temple", "Stone Chariot", "Hampi Bazaar"], bestSeason: "Oct – Feb", avgTemp: "28°C" },
  { name: "Darjeeling", state: "West Bengal", hostCount: 4, tagline: "Queen of the Hills", description: "Tea gardens, toy trains, and stunning Kanchenjunga views in the Eastern Himalayas.", highlights: ["Tiger Hill Sunrise", "Toy Train", "Tea Estates"], bestSeason: "Mar – May", avgTemp: "15°C" },
  { name: "Amritsar", state: "Punjab", hostCount: 6, tagline: "Golden Temple City", description: "Home to the Golden Temple, Wagah Border ceremony, and the heartiest Punjabi food.", highlights: ["Golden Temple", "Wagah Border", "Jallianwala Bagh"], bestSeason: "Oct – Mar", avgTemp: "22°C" },
  { name: "Jodhpur", state: "Rajasthan", hostCount: 8, tagline: "The Blue City", description: "Towering Mehrangarh Fort overlooks a sea of blue houses in this desert jewel.", highlights: ["Mehrangarh Fort", "Blue Houses", "Umaid Bhawan"], bestSeason: "Oct – Mar", avgTemp: "26°C" },
];

export const communityStories = [
  { id: "cs1", travelerName: "Emily R.", country: "USA", hostName: "Ravi", city: "Jaipur", title: "How Ravi Changed My Perspective on Travel", excerpt: "I came to India as a tourist and left as a friend. Ravi didn't just show me Jaipur — he invited me into his world.", fullStory: "When I first arrived in Jaipur, I was overwhelmed by the noise, the crowds, the heat. But Ravi met me with a warm smile and a cup of chai. Over the next four days, he didn't just show me the tourist spots — he took me to his mother's kitchen where she taught me to make dal baati churma. We visited his friend's block-printing workshop in a lane so narrow I had to turn sideways. We sat on the rooftop at sunset watching kites fill the sky. Ravi taught me that travel isn't about seeing places — it's about connecting with people. I've been back twice since, and each time Ravi has new hidden gems to share.", date: "2026-02-15", duration: "4 days", image: hostRavi },
  { id: "cs2", travelerName: "Hans K.", country: "Germany", hostName: "Arjun", city: "Varanasi", title: "Finding Peace on the Ganges", excerpt: "The sunrise meditation with Arjun was the most profound experience of my life. Varanasi changed everything.", fullStory: "I'm an engineer from Munich. I don't meditate. I don't do yoga. But something about Varanasi pulled me in. Arjun woke me at 4:30 AM for the sunrise boat ride. As we floated down the Ganges, watching the funeral pyres and the morning prayers, he explained the philosophy of life and death that Varanasi embodies. Then we meditated on the ghats as the sun rose. For the first time in my life, my mind was completely quiet. That silence stayed with me long after I left India.", date: "2026-01-20", duration: "3 days", image: hostArjun },
  { id: "cs3", travelerName: "Akiko T.", country: "Japan", hostName: "Priya", city: "Alleppey", title: "Cooking with Grandmother — A Love Story", excerpt: "Learning to cook Kerala fish curry with Priya's grandmother is a memory I'll treasure forever.", fullStory: "In Japan, I run a small restaurant. I came to Kerala to learn about spices. Priya's grandmother, who must be at least 80, took my hands and showed me how to grind coconut, roast spices, and make the perfect fish curry. We didn't share a language, but cooking is its own language. Every morning she'd pluck fresh curry leaves from the garden. Every evening we'd sit by the backwaters and eat what we'd cooked. Those three days taught me more about food and love than any culinary school ever could.", date: "2026-03-05", duration: "3 days", image: hostPriya },
  { id: "cs4", travelerName: "Carlos M.", country: "Brazil", hostName: "Meera", city: "Goa", title: "Goa Beyond the Parties", excerpt: "Meera showed me the Goa that tourists miss — fishing villages, spice farms, and the best food of my life.", fullStory: "Everyone told me Goa was about parties. Meera proved them wrong. She took me to her grandmother's fishing village at 5 AM to watch the catch come in. We visited a 400-year-old spice plantation where I tasted fresh cardamom off the vine. She made me pork vindaloo that was so good I almost cried. The beach BBQ under the stars with her friends and family was the highlight of my entire Asia trip.", date: "2026-02-28", duration: "5 days", image: hostMeera },
  { id: "cs5", travelerName: "Rachel K.", country: "Canada", hostName: "Deepak", city: "Delhi", title: "12 Hours, 12 Stops, 12 Lifetimes of Flavor", excerpt: "Deepak's Old Delhi food walk rewired my understanding of Indian cuisine.", fullStory: "I thought I knew Indian food. Then Deepak took me to Chandni Chowk. Our first stop was a 200-year-old sweet shop. Then parathas from a stall that's been open since 1872. Then kebabs so tender they dissolved on my tongue. Deepak didn't just feed me — he told me the story behind each dish, each family, each recipe. By the end of 12 hours, I realized Indian food is not a cuisine — it's a civilization.", date: "2026-01-10", duration: "2 days", image: hostDeepak },
  { id: "cs6", travelerName: "Anna S.", country: "Sweden", hostName: "Sunita", city: "Udaipur", title: "Art, Lakes, and a Rooftop Dinner I'll Never Forget", excerpt: "Sunita's art history tours made Udaipur feel like walking through a living painting.", fullStory: "As an art teacher, I was drawn to Udaipur's miniature painting tradition. Sunita, a former art history professor, became both my guide and my teacher. She took me to a workshop where artisans use single-hair brushes and natural pigments made from crushed gemstones. On my last evening, she arranged a candlelit dinner on her haveli's rooftop with the Lake Palace glowing in the distance. It was the most beautiful moment of my life.", date: "2026-03-01", duration: "4 days", image: hostSunita },
];

export const travelTips: TravelTip[] = [
  { id: "tt1", title: "Best Time to Visit India", category: "culture", content: "October to March offers the most comfortable weather across most of India. Monsoon season (July-Sept) is magical in Kerala and Goa. Avoid the extreme heat of April-June unless you're heading to the Himalayas.", icon: "🌤️" },
  { id: "tt2", title: "Respecting Local Customs", category: "culture", content: "Remove shoes before entering homes and temples. Dress modestly at religious sites — cover shoulders and knees. Always ask before photographing people. Use your right hand for greetings and eating.", icon: "🙏" },
  { id: "tt3", title: "Staying Safe", category: "safety", content: "Book through Travelista for verified hosts. Share your itinerary with family. Keep digital copies of all documents. Stay hydrated. Use reputable transport. Trust your instincts.", icon: "🛡️" },
  { id: "tt4", title: "Food & Water Safety", category: "food", content: "Drink only bottled or filtered water. Street food from busy stalls is generally safe — look for high turnover. Start mild and build up spice tolerance. Carry antacids and ORS packets.", icon: "🍽️" },
  { id: "tt5", title: "Getting Around India", category: "transport", content: "Trains are the backbone — book sleeper class for authentic experience. Domestic flights connect major cities cheaply. Always negotiate auto-rickshaw fares before starting. Uber/Ola work in cities.", icon: "🚂" },
  { id: "tt6", title: "Packing Essentials", category: "packing", content: "Light, breathable cotton clothes. Comfortable walking shoes. Sunscreen and insect repellent. A scarf/shawl (multipurpose: temple cover, sun protection, blanket). Power adapter (Type C/D).", icon: "🎒" },
  { id: "tt7", title: "Money Tips", category: "money", content: "UPI payments are ubiquitous — set up Google Pay or PhonePe. ATMs are everywhere but carry some cash for rural areas. Haggling is expected in markets — start at 40% of asking price. Tip 10% at restaurants.", icon: "💰" },
  { id: "tt8", title: "Health Precautions", category: "health", content: "Consult a travel doctor 6 weeks before departure. Carry a basic first-aid kit. Sunstroke is real — wear a hat and drink 3+ liters daily. Altitude sickness is possible above 3000m — acclimatize slowly.", icon: "🏥" },
  { id: "tt9", title: "Photography Etiquette", category: "culture", content: "Many temples prohibit photography inside. Always ask permission before photographing people. Sunrise and sunset offer magical light. Drones require government permits and are banned near military areas.", icon: "📸" },
  { id: "tt10", title: "Learning Basic Hindi", category: "culture", content: "Namaste (hello), Dhanyavaad (thank you), Haan/Nahi (yes/no), Kitna? (how much?), Bahut acha (very good). Even a few words earn huge smiles and better prices.", icon: "🗣️" },
  { id: "tt11", title: "SIM Card & Connectivity", category: "transport", content: "Get a local SIM at the airport (Airtel/Jio). 4G covers most of India. Wi-Fi is spotty outside cities. Download offline maps. eSIM is available for newer phones.", icon: "📱" },
  { id: "tt12", title: "Festival Calendar", category: "culture", content: "Holi (March): Colors festival. Diwali (Oct/Nov): Lights festival. Navratri (Sep/Oct): Dance festival. Onam (Aug/Sep): Kerala harvest. Durga Puja (Oct): Kolkata's biggest celebration. Plan around these for incredible experiences!", icon: "🎉" },
];

export const propertyTypes = [
  "Homestay", "Studio Apartment", "Resort", "Villa", "Hotel Room", "Heritage Haveli", "Houseboat", "Farm Stay", "Apartment"
] as const;

export const vehicleTypes = [
  "SUV", "Sedan", "Hatchback", "Cruiser", "Scooter", "Motorcycle", "Auto Rickshaw", "Boat", "Taxi", "Premium MPV", "Vintage Jeep"
] as const;
