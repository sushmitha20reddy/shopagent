import { NextResponse } from "next/server";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  score: number;
  reason: string;
  image: string;
};

const products: Product[] = [
  {
    id: "aerobuds-pro",
    name: "AeroBuds Pro",
    category: "Audio",
    price: 1,
    stock: 14,
    description: "Adaptive-noise-cancelling earbuds with 32-hour battery life.",
    score: 94,
    reason: "Strong fit for deep-work focus and travel.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pulse-watch-x",
    name: "Pulse Watch X",
    category: "Wearables",
    price: 14999,
    stock: 9,
    description: "A focused fitness watch with recovery insights and a bright AMOLED face.",
    score: 91,
    reason: "Useful for travel, recovery and daily activity tracking.",
    image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "charge-dock-mini",
    name: "Charge Dock Mini",
    category: "Accessories",
    price: 2499,
    stock: 22,
    description: "A compact USB-C charging dock for a calmer desk setup.",
    score: 96,
    reason: "Best low-cost match for a clean desk setup.",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "carry-case-studio",
    name: "Carry Case Studio",
    category: "Accessories",
    price: 1299,
    stock: 31,
    description: "A water-resistant hard case with a soft, modular interior.",
    score: 88,
    reason: "Adds practical protection for travel days.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  }
];

export async function GET() {
  return NextResponse.json(products);
}