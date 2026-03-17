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
    services: ["Guide", "Stay", "Transport"],
    languages: ["English", "Hindi", "French"],
    pricePerDay: 45,
    verified: true,
    safetyScore: 98,
    responseTime: "< 1 hour",
    specialties: ["Cultural", "Wedding", "Village"],
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
    services: ["Guide", "Stay"],
    languages: ["English", "Hindi", "Malayalam"],
    pricePerDay: 35,
    verified: true,
    safetyScore: 97,
    responseTime: "< 2 hours",
    specialties: ["Food", "Cultural", "Wellness"],
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
];

export const destinations = [
  { name: "Jaipur", state: "Rajasthan", hostCount: 12, tagline: "The Pink City" },
  { name: "Varanasi", state: "Uttar Pradesh", hostCount: 8, tagline: "India's Spiritual Heart" },
  { name: "Alleppey", state: "Kerala", hostCount: 6, tagline: "Venice of the East" },
  { name: "Goa", state: "Goa", hostCount: 15, tagline: "Beach Paradise" },
  { name: "Delhi", state: "Delhi", hostCount: 20, tagline: "Capital of Contrasts" },
  { name: "Udaipur", state: "Rajasthan", hostCount: 9, tagline: "City of Lakes" },
  { name: "Mumbai", state: "Maharashtra", hostCount: 18, tagline: "City of Dreams" },
  { name: "Rishikesh", state: "Uttarakhand", hostCount: 7, tagline: "Yoga Capital" },
];
