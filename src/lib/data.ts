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
  propertyType: "Homestay" | "Heritage Haveli" | "Houseboat" | "Villa" | "Apartment" | "Farm Stay";
  description: string;
  images: string[];
  rooms: StayRoom[];
  amenities: string[];
  checkIn: string;
  checkOut: string;
  houseRules: string[];
}

export interface Vehicle {
  type: string;
  model: string;
  capacity: number;
  ac: boolean;
  pricePerDay: number;
  pricePerKm: number;
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
        { type: "Sedan", model: "Maruti Suzuki Dzire", capacity: 4, ac: true, pricePerDay: 35, pricePerKm: 0.15, features: ["AC", "Music System", "Phone Charger", "First Aid Kit"] },
        { type: "SUV", model: "Toyota Innova Crysta", capacity: 7, ac: true, pricePerDay: 55, pricePerKm: 0.20, features: ["AC", "Music System", "Extra Luggage Space", "Phone Charger", "Water Bottles"] },
        { type: "Vintage Jeep", model: "Mahindra Thar (Open Top)", capacity: 4, ac: false, pricePerDay: 65, pricePerKm: 0.25, features: ["Open Top", "Desert Ready", "Great for Photos", "Rugged Terrain"] },
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
      description: "A traditional Kerala home right on the backwaters, surrounded by coconut palms. Enjoy authentic home-cooked Kerala cuisine and wake up to the gentle sounds of the waterways.",
      images: [hostPriya, hostPriya, hostPriya],
      rooms: [
        { name: "Backwater View Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 40, amenities: ["Fan", "Ensuite Bathroom", "Backwater View", "Mosquito Net"], description: "Peaceful room overlooking the serene backwaters with a private sit-out." },
        { name: "Garden Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 30, amenities: ["Fan", "Shared Bathroom", "Garden View"], description: "Cozy room opening to the spice garden." },
      ],
      amenities: ["Home-Cooked Kerala Meals", "Canoe Rides", "Spice Garden Tour", "Free WiFi", "Yoga Deck", "Cooking Classes"],
      checkIn: "1:00 PM",
      checkOut: "11:00 AM",
      houseRules: ["Vegetarian property", "No alcohol on premises", "Shoes off indoors", "Eco-friendly toiletries provided"],
    },
  },
  {
    id: "arjun-varanasi",
    name: "Arjun",
    city: "Varanasi",
    tagline: "Spiritual journeys through India's oldest city",
    bio: "I'm a fifth-generation priest's son who chose to bridge ancient Varanasi with the modern traveler. I guide dawn Ganga aartis, meditation sessions, and walks through lanes that are older than most civilizations.",
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
      description: "Navigate Varanasi's ancient lanes and beyond with our local transport options — from boats to cars.",
      vehicles: [
        { type: "Boat", model: "Traditional Wooden Boat", capacity: 6, ac: false, pricePerDay: 25, pricePerKm: 0, features: ["Sunrise Rides", "Aarti Viewing", "Photography Friendly", "Cushioned Seats"] },
        { type: "Auto Rickshaw", model: "Bajaj RE", capacity: 3, ac: false, pricePerDay: 15, pricePerKm: 0.08, features: ["City Navigation", "Narrow Lane Access", "Local Experience"] },
        { type: "Sedan", model: "Maruti Suzuki Ertiga", capacity: 6, ac: true, pricePerDay: 40, pricePerKm: 0.15, features: ["AC", "Airport Transfers", "Outstation Trips"] },
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
    bio: "Goa is more than parties — it's fishing villages at dawn, Portuguese churches at sunset, and my grandmother's prawn curry. I show travelers the Goa that locals love: hidden beaches, spice plantations, and Saturday night feni sessions.",
    image: hostMeera,
    rating: 4.7,
    reviewCount: 64,
    services: ["Guide", "Stay", "Transport"],
    languages: ["English", "Hindi", "Konkani", "Portuguese"],
    pricePerDay: 40,
    verified: true,
    safetyScore: 96,
    responseTime: "< 1 hour",
    specialties: ["Food", "Adventure", "Festival"],
    stayInfo: {
      propertyName: "Meera's Beach Villa",
      propertyType: "Villa",
      description: "A charming Portuguese-style villa just 200 meters from Benaulim Beach. Surrounded by cashew trees and featuring a private garden, this is the perfect blend of Goan heritage and coastal comfort.",
      images: [hostMeera, hostMeera, hostMeera, hostMeera],
      rooms: [
        { name: "Ocean Breeze Suite", type: "Entire Home", beds: 2, maxGuests: 4, pricePerNight: 75, amenities: ["AC", "Kitchen", "Living Room", "Garden", "Beach Access"], description: "Entire ground floor with a private garden and direct beach path." },
        { name: "Balcão Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 45, amenities: ["AC", "Ensuite Bathroom", "Balcony", "Sea Breeze"], description: "First-floor room with a traditional Goan balcão overlooking the garden." },
        { name: "Backpacker Bunk", type: "Shared Room", beds: 4, maxGuests: 4, pricePerNight: 15, amenities: ["Fan", "Shared Bathroom", "Locker", "Common Area"], description: "Social dorm-style room for budget travelers." },
      ],
      amenities: ["Beach Towels", "Bicycle Rental", "BBQ Area", "Free WiFi", "Hammocks", "Outdoor Shower", "Scooter Rental Available"],
      checkIn: "3:00 PM",
      checkOut: "12:00 PM",
      houseRules: ["No parties after 11PM", "Respect neighbors", "Sort recyclables", "Pets allowed with notice"],
    },
    transportInfo: {
      description: "Explore all of Goa at your own pace with our curated vehicle options — from scooters to SUVs.",
      vehicles: [
        { type: "Scooter", model: "Honda Activa 6G", capacity: 2, ac: false, pricePerDay: 8, pricePerKm: 0, features: ["Helmet Included", "Fuel Efficient", "Easy Parking", "Freedom to Explore"] },
        { type: "Motorcycle", model: "Royal Enfield Classic 350", capacity: 2, ac: false, pricePerDay: 18, pricePerKm: 0, features: ["Iconic Ride", "Touring Ready", "Saddlebags Available"] },
        { type: "Hatchback", model: "Maruti Suzuki Swift", capacity: 4, ac: true, pricePerDay: 30, pricePerKm: 0.12, features: ["AC", "Music System", "GPS", "Self-Drive Option"] },
      ],
      airports: ["Goa International Airport (GOI)", "Manohar International Airport (GOX)"],
      coverage: ["North Goa Beaches", "South Goa Beaches", "Old Goa", "Dudhsagar Falls", "Palolem", "Anjuna", "Panjim"],
      driverLanguages: ["English", "Hindi", "Konkani"],
    },
  },
  {
    id: "deepak-delhi",
    name: "Deepak",
    city: "Delhi",
    tagline: "Old Delhi's chaos, New Delhi's charm — all in one day",
    bio: "A journalist turned travel host, I bring Delhi's stories alive. From Mughal-era food walks in Chandni Chowk to street art tours in Hauz Khas, I blend history with the buzzing modern culture of India's capital.",
    image: hostDeepak,
    rating: 4.8,
    reviewCount: 156,
    services: ["Guide", "Transport"],
    languages: ["English", "Hindi", "Urdu", "Punjabi"],
    pricePerDay: 50,
    verified: true,
    safetyScore: 97,
    responseTime: "< 1 hour",
    specialties: ["Food", "Cultural", "Village"],
    transportInfo: {
      description: "Navigate Delhi's sprawling cityscape in comfort. From metro-connected drops to full-day chauffeur service.",
      vehicles: [
        { type: "Sedan", model: "Honda City", capacity: 4, ac: true, pricePerDay: 40, pricePerKm: 0.15, features: ["AC", "Music System", "Phone Charger", "Daily Newspaper"] },
        { type: "SUV", model: "Toyota Fortuner", capacity: 7, ac: true, pricePerDay: 70, pricePerKm: 0.25, features: ["Premium AC", "Leather Seats", "WiFi Hotspot", "Water & Snacks"] },
        { type: "Auto Rickshaw", model: "Bajaj RE (Guided)", capacity: 3, ac: false, pricePerDay: 20, pricePerKm: 0.05, features: ["Authentic Experience", "Old Delhi Navigation", "Photo-Worthy"] },
      ],
      airports: ["Indira Gandhi International Airport (DEL)"],
      coverage: ["Old Delhi", "New Delhi", "Gurugram", "Noida", "Agra Day Trip", "Mathura-Vrindavan"],
      driverLanguages: ["English", "Hindi", "Punjabi"],
    },
  },
  {
    id: "sunita-udaipur",
    name: "Sunita",
    city: "Udaipur",
    tagline: "Romance, royalty & the City of Lakes",
    bio: "I grew up in a haveli overlooking Lake Pichola. As a former art history professor, I weave stories of Mewar's royal past into every tour — from miniature painting workshops to candlelit dinners on rooftops with palace views.",
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
      description: "A lovingly restored 200-year-old haveli on the shores of Lake Pichola. Every room features hand-painted murals, antique furniture, and views that will take your breath away.",
      images: [hostSunita, hostSunita, hostSunita],
      rooms: [
        { name: "Lake Palace View Suite", type: "Heritage Suite", beds: 1, maxGuests: 2, pricePerNight: 85, amenities: ["AC", "Ensuite Bathroom", "Lake View", "King Bed", "Minibar", "Room Service"], description: "Panoramic views of Lake Palace from your private balcony. Hand-painted Mewar murals." },
        { name: "Courtyard Room", type: "Private Room", beds: 1, maxGuests: 2, pricePerNight: 55, amenities: ["AC", "Ensuite Bathroom", "Courtyard Access", "Antique Furniture"], description: "Opens to the inner courtyard with its century-old tulsi plant." },
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
    bio: "Mumbai is my playground. From the dabbawalas of CST to the film studios of Goregaon, I show travelers the raw energy that makes this city the beating heart of India. Plus, I know the best vada pav stall in every neighborhood.",
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
      description: "Get around Mumbai like a local — from iconic black-and-yellow cabs to premium cars for the long haul.",
      vehicles: [
        { type: "Sedan", model: "Maruti Suzuki Ciaz", capacity: 4, ac: true, pricePerDay: 40, pricePerKm: 0.15, features: ["AC", "Music System", "Phone Charger", "Toll Inclusive"] },
        { type: "Taxi", model: "Classic Mumbai Kaali-Peeli", capacity: 4, ac: false, pricePerDay: 25, pricePerKm: 0.10, features: ["Iconic Experience", "Meter-Based", "City Navigation"] },
        { type: "Premium MPV", model: "Kia Carens", capacity: 7, ac: true, pricePerDay: 55, pricePerKm: 0.20, features: ["Premium AC", "Entertainment System", "Extra Luggage Space"] },
      ],
      airports: ["Chhatrapati Shivaji Maharaj International Airport (BOM)"],
      coverage: ["South Mumbai", "Bandra-Juhu", "Film City", "Elephanta Caves", "Lonavala Day Trip", "Alibaug"],
      driverLanguages: ["English", "Hindi", "Marathi"],
    },
  },
];

export const experiences: Experience[] = [
  {
    id: "exp-wedding",
    title: "Attend an Indian Wedding",
    description: "Be a guest at a real Indian wedding celebration — the colors, the music, the joy.",
    image: expWedding,
    price: 120,
    duration: "Full Day",
    category: "Wedding",
    hostId: "ravi-jaipur",
    hostName: "Ravi",
    hostCity: "Jaipur",
    rating: 4.9,
    reviewCount: 34,
    highlights: ["Traditional ceremonies", "Authentic Rajasthani feast", "Dance & music", "Dress in Indian attire"],
  },
  {
    id: "exp-spiritual",
    title: "Sunrise Yoga & Meditation",
    description: "Begin your day with yoga on the banks of the Ganges as the sun rises over the Himalayas.",
    image: expSpiritual,
    price: 30,
    duration: "3 Hours",
    category: "Spiritual",
    hostId: "arjun-varanasi",
    hostName: "Arjun",
    hostCity: "Varanasi",
    rating: 4.8,
    reviewCount: 67,
    highlights: ["Ganga aarti viewing", "Guided meditation", "Pranayama session", "Herbal tea ceremony"],
  },
  {
    id: "exp-village",
    title: "Village Life Immersion",
    description: "Spend a day in a Rajasthani village — cook, farm, and celebrate with locals.",
    image: expVillage,
    price: 55,
    duration: "Full Day",
    category: "Village",
    hostId: "ravi-jaipur",
    hostName: "Ravi",
    hostCity: "Jaipur",
    rating: 4.7,
    reviewCount: 45,
    highlights: ["Farming experience", "Cook with locals", "Folk music evening", "Camel ride"],
  },
  {
    id: "exp-food",
    title: "Street Food Safari",
    description: "Taste the real India through its street food — guided by a local who knows every stall.",
    image: expFood,
    price: 25,
    duration: "4 Hours",
    category: "Food",
    hostId: "deepak-delhi",
    hostName: "Deepak",
    hostCity: "Delhi",
    rating: 4.9,
    reviewCount: 89,
    highlights: ["12+ food stops", "Hidden local stalls", "History of each dish", "Vegetarian & non-veg options"],
  },
  {
    id: "exp-festival",
    title: "Holi Festival Celebration",
    description: "Experience the world's most colorful festival with a local family — music, dance, and colors!",
    image: expFestival,
    price: 75,
    duration: "Full Day",
    category: "Festival",
    hostId: "deepak-delhi",
    hostName: "Deepak",
    hostCity: "Delhi",
    rating: 4.9,
    reviewCount: 52,
    highlights: ["Family celebration", "Traditional sweets", "Color play", "Bonfire night"],
  },
  {
    id: "exp-wellness",
    title: "Ayurvedic Wellness Retreat",
    description: "A day of Ayurvedic healing — massages, herbal treatments, and yoga by the backwaters.",
    image: expWellness,
    price: 85,
    duration: "Full Day",
    category: "Wellness",
    hostId: "priya-kerala",
    hostName: "Priya",
    hostCity: "Alleppey",
    rating: 4.8,
    reviewCount: 38,
    highlights: ["Abhyanga massage", "Herbal steam bath", "Yoga session", "Ayurvedic lunch"],
  },
  {
    id: "exp-adventure",
    title: "Himalayan Trek & Camping",
    description: "Trek through stunning mountain trails with camping under the stars in the Himalayas.",
    image: expAdventure,
    price: 95,
    duration: "2 Days",
    category: "Adventure",
    hostId: "kiran-mumbai",
    hostName: "Kiran",
    hostCity: "Mumbai",
    rating: 4.7,
    reviewCount: 28,
    highlights: ["Mountain trails", "Star gazing", "Campfire dinner", "Local guide"],
  },
  {
    id: "exp-beach",
    title: "Goan Beach & Spice Tour",
    description: "Explore hidden beaches, spice plantations, and Portuguese heritage in beautiful Goa.",
    image: expBeach,
    price: 45,
    duration: "Full Day",
    category: "Adventure",
    hostId: "meera-goa",
    hostName: "Meera",
    hostCity: "Goa",
    rating: 4.8,
    reviewCount: 41,
    highlights: ["Hidden beaches", "Spice plantation", "Portuguese chapel", "Goan lunch"],
  },
  // Medical Care experiences
  {
    id: "exp-medical-ayurveda",
    title: "Ayurveda Medical Consultation",
    description: "Consult with certified Ayurvedic doctors for personalized treatment plans, herbal remedies, and holistic health assessments rooted in 5000 years of tradition.",
    image: expWellness,
    price: 60,
    duration: "Half Day",
    category: "Medical Care",
    hostId: "priya-kerala",
    hostName: "Priya",
    hostCity: "Alleppey",
    rating: 4.9,
    reviewCount: 22,
    highlights: ["Certified Ayurvedic doctor", "Personalized treatment plan", "Herbal medicine kit", "Diet & lifestyle guidance"],
  },
  {
    id: "exp-medical-dental",
    title: "Dental Tourism Package",
    description: "World-class dental care at a fraction of the cost — from checkups to cosmetic dentistry in JCI-accredited clinics.",
    image: expFood,
    price: 150,
    duration: "1-3 Days",
    category: "Medical Care",
    hostId: "kiran-mumbai",
    hostName: "Kiran",
    hostCity: "Mumbai",
    rating: 4.6,
    reviewCount: 15,
    highlights: ["JCI-accredited clinic", "Airport pickup", "Post-care follow-up", "Recovery lounge"],
  },
  {
    id: "exp-medical-yoga-therapy",
    title: "Therapeutic Yoga for Chronic Pain",
    description: "Evidence-based yoga therapy sessions designed for chronic back pain, arthritis, and stress-related conditions.",
    image: expSpiritual,
    price: 40,
    duration: "5 Days",
    category: "Medical Care",
    hostId: "arjun-varanasi",
    hostName: "Arjun",
    hostCity: "Varanasi",
    rating: 4.8,
    reviewCount: 31,
    highlights: ["Certified yoga therapist", "Personalized program", "Daily progress tracking", "Take-home practice guide"],
  },
  // More Wellness
  {
    id: "exp-wellness-panchakarma",
    title: "Panchakarma Detox Program",
    description: "A traditional 7-day Panchakarma detox and rejuvenation program supervised by Ayurvedic physicians.",
    image: expWellness,
    price: 450,
    duration: "7 Days",
    category: "Wellness",
    hostId: "priya-kerala",
    hostName: "Priya",
    hostCity: "Alleppey",
    rating: 4.9,
    reviewCount: 19,
    highlights: ["Doctor consultation", "Daily treatments", "Sattvic diet", "Herbal medicines included"],
  },
  {
    id: "exp-wellness-sound",
    title: "Sound Healing & Crystal Therapy",
    description: "Immerse yourself in Tibetan singing bowls, crystal healing, and guided meditation in a serene lakeside setting.",
    image: expSpiritual,
    price: 55,
    duration: "3 Hours",
    category: "Wellness",
    hostId: "sunita-udaipur",
    hostName: "Sunita",
    hostCity: "Udaipur",
    rating: 4.7,
    reviewCount: 24,
    highlights: ["Singing bowl session", "Crystal healing", "Guided meditation", "Herbal refreshments"],
  },
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

export const destinations = [
  { name: "Jaipur", state: "Rajasthan", hostCount: 12, tagline: "The Pink City", description: "Explore majestic forts, vibrant bazaars, and Rajasthani cuisine in India's most colorful city." },
  { name: "Varanasi", state: "Uttar Pradesh", hostCount: 8, tagline: "India's Spiritual Heart", description: "Witness ancient rituals on the Ganges, explore 5000-year-old lanes, and find inner peace." },
  { name: "Alleppey", state: "Kerala", hostCount: 6, tagline: "Venice of the East", description: "Cruise through serene backwaters, visit spice gardens, and savor authentic Kerala cuisine." },
  { name: "Goa", state: "Goa", hostCount: 15, tagline: "Beach Paradise", description: "Discover hidden beaches, Portuguese heritage, spice plantations, and legendary seafood." },
  { name: "Delhi", state: "Delhi", hostCount: 20, tagline: "Capital of Contrasts", description: "From Mughal monuments to modern art districts, experience 1000 years of history in one city." },
  { name: "Udaipur", state: "Rajasthan", hostCount: 9, tagline: "City of Lakes", description: "Romance, royalty, and lake palaces — Udaipur is India's most picturesque city." },
  { name: "Mumbai", state: "Maharashtra", hostCount: 18, tagline: "City of Dreams", description: "Bollywood, street food, colonial architecture, and the unstoppable energy of India's largest city." },
  { name: "Rishikesh", state: "Uttarakhand", hostCount: 7, tagline: "Yoga Capital", description: "The birthplace of yoga, set against Himalayan foothills with rafting, trekking, and ashrams." },
  { name: "Hampi", state: "Karnataka", hostCount: 5, tagline: "Ruins & Boulders", description: "UNESCO World Heritage ruins of the Vijayanagara Empire scattered among surreal boulder landscapes." },
  { name: "Darjeeling", state: "West Bengal", hostCount: 4, tagline: "Queen of the Hills", description: "Tea gardens, toy trains, and stunning Kanchenjunga views in the Eastern Himalayas." },
  { name: "Amritsar", state: "Punjab", hostCount: 6, tagline: "Golden Temple City", description: "Home to the Golden Temple, Wagah Border ceremony, and the heartiest Punjabi food." },
  { name: "Jodhpur", state: "Rajasthan", hostCount: 8, tagline: "The Blue City", description: "Towering Mehrangarh Fort overlooks a sea of blue houses in this desert jewel." },
];

export const communityStories = [
  { id: "cs1", travelerName: "Emily R.", country: "USA", hostName: "Ravi", city: "Jaipur", title: "How Ravi Changed My Perspective on Travel", excerpt: "I came to India as a tourist and left as a friend. Ravi didn't just show me Jaipur — he invited me into his world.", date: "2026-02-15" },
  { id: "cs2", travelerName: "Hans K.", country: "Germany", hostName: "Arjun", city: "Varanasi", title: "Finding Peace on the Ganges", excerpt: "The sunrise meditation with Arjun was the most profound experience of my life. Varanasi changed everything.", date: "2026-01-20" },
  { id: "cs3", travelerName: "Akiko T.", country: "Japan", hostName: "Priya", city: "Alleppey", title: "Cooking with Grandmother — A Love Story", excerpt: "Learning to cook Kerala fish curry with Priya's grandmother is a memory I'll treasure forever.", date: "2026-03-05" },
];
