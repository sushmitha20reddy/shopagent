import { NextResponse } from "next/server";
import { Product } from "../products/route";

const catalog: Product[] = [
  {
    id: "aerobuds-pro", name: "AeroBuds Pro", category: "Audio", price: 8999, stock: 14,
    description: "Adaptive-noise-cancelling earbuds with 32-hour battery life.", score: 94,
    reason: "Strong fit for deep-work focus and travel.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pulse-watch-x", name: "Pulse Watch X", category: "Wearables", price: 14999, stock: 9,
    description: "A focused fitness watch with recovery insights and a bright AMOLED face.", score: 91,
    reason: "Useful for travel, recovery and daily activity tracking.", image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "charge-dock-mini", name: "Charge Dock Mini", category: "Accessories", price: 2499, stock: 22,
    description: "A compact USB-C charging dock for a calmer desk setup.", score: 96,
    reason: "Best low-cost match for a clean desk setup.", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "carry-case-studio", name: "Carry Case Studio", category: "Accessories", price: 1299, stock: 31,
    description: "A water-resistant hard case with a soft, modular interior.", score: 88,
    reason: "Adds practical protection for travel days.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  }
];

export async function POST(req: Request) {
  const body = await req.json();
  const text = String(body?.text || "").toLowerCase();

  const budgetMatch = text.match(/(?:under|below|within)\s*[₹rs.]*\s*([\d,]+)\s*k?/i);
  let budget = 20000;
  if (budgetMatch) {
    const raw = Number(budgetMatch[1].replace(/,/g, ""));
    budget = /k/i.test(budgetMatch[0]) ? raw * 1000 : raw;
  }

  const wantsTravel = /travel|trip|flight|carry|portable/.test(text);
  const wantsWork = /work|desk|focus|office|study|deep work/.test(text);
  const wantsHealth = /health|fitness|recovery|wellness|watch/.test(text);

  const ranked = catalog
    .filter(p => p.stock > 0 && p.price <= budget)
    .map(p => {
      let score = p.score;
      if (wantsTravel && (p.id === "carry-case-studio" || p.id === "aerobuds-pro")) score += 5;
      if (wantsWork && (p.id === "charge-dock-mini" || p.id === "aerobuds-pro")) score += 5;
      if (wantsHealth && p.id === "pulse-watch-x") score += 7;
      return { ...p, score: Math.min(99, score) };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({
    intent: wantsHealth ? "health / wellness" : wantsTravel && wantsWork ? "travel + deep work" : wantsTravel ? "travel" : wantsWork ? "deep work" : "general commerce",
    budget,
    products: ranked,
    confidence: ranked.length ? Math.round(ranked.reduce((s, p) => s + p.score, 0) / ranked.length) : 72
  });
}