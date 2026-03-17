import hostRavi from "@/assets/host-ravi.jpg";
import hostPriya from "@/assets/host-priya.jpg";
import hostArjun from "@/assets/host-arjun.jpg";
import expWedding from "@/assets/exp-wedding.jpg";
import expSpiritual from "@/assets/exp-spiritual.jpg";
import expVillage from "@/assets/exp-village.jpg";
import expFood from "@/assets/exp-food.jpg";

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
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  category: string;
  hostName: string;
  hostCity: string;
  rating: number;
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
    category: "Cultural",
    hostName: "Ravi",
    hostCity: "Jaipur",
    rating: 4.9,
  },
  {
    id: "exp-spiritual",
    title: "Sunrise Yoga & Meditation",
    description: "Begin your day with yoga on the banks of the Ganges as the sun rises over the Himalayas.",
    image: expSpiritual,
    price: 30,
    duration: "3 Hours",
    category: "Spiritual",
    hostName: "Arjun",
    hostCity: "Rishikesh",
    rating: 4.8,
  },
  {
    id: "exp-village",
    title: "Village Life Immersion",
    description: "Spend a day in a Rajasthani village — cook, farm, and celebrate with locals.",
    image: expVillage,
    price: 55,
    duration: "Full Day",
    category: "Village",
    hostName: "Ravi",
    hostCity: "Jaipur",
    rating: 4.7,
  },
  {
    id: "exp-food",
    title: "Street Food Safari",
    description: "Taste the real India through its street food — guided by a local who knows every stall.",
    image: expFood,
    price: 25,
    duration: "4 Hours",
    category: "Food",
    hostName: "Priya",
    hostCity: "Delhi",
    rating: 4.9,
  },
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
