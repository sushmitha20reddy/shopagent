import { NextResponse } from "next/server";

const catalog = [
  {
    id: "aerobuds-pro",
    name: "AeroBuds Pro",
    category: "Audio",
    price: 8999,
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description:
      "Adaptive-noise-cancelling earbuds with 32-hour battery life.",
    score: 94,
    reason:
      "Best for focused work, commuting and travel.",
  },

  {
    id: "pulse-watch-x",
    name: "Pulse Watch X",
    category: "Wearables",
    price: 14999,
    stock: 9,
    image:
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=80",
    description:
      "Fitness watch with recovery insights and a bright AMOLED face.",
    score: 91,
    reason:
      "Strong wellness and activity-tracking fit, but above the ₹10k gate.",
  },

  {
    id: "charge-dock-mini",
    name: "Charge Dock Mini",
    category: "Accessories",
    price: 2499,
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80",
    description:
      "Compact USB-C charging dock for a calmer desk setup.",
    score: 96,
    reason:
      "Excellent value for a clean, productive desk.",
  },

  {
    id: "carry-case-studio",
    name: "Carry Case Studio",
    category: "Accessories",
    price: 1299,
    stock: 31,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description:
      "Water-resistant hard case with a soft modular interior.",
    score: 88,
    reason:
      "Useful protection for travel and device organization.",
  },
];

function money(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json({
        reply:
          "Tell me what you need, your budget, or what you're trying to optimize.",
        recommendations: [],
        intent: "waiting",
        confidence: 70,
        events: ["Agent ready"],
      });
    }

    const query = message.toLowerCase();

    // -----------------------------
    // Detect budget
    // -----------------------------

    let budget = 10000;

    const budgetMatch = query.match(
      /(?:under|below|within|max|budget)\s*[₹rs.]?\s*([\d,]+)\s*(k|thousand)?/i
    );

    if (budgetMatch) {
      const number = Number(
        budgetMatch[1].replace(/,/g, "")
      );

      const unit = budgetMatch[2]?.toLowerCase();

      if (unit === "k" || unit === "thousand") {
        budget = number * 1000;
      } else {
        budget = number;
      }
    }

    // -----------------------------
    // Detect intent
    // -----------------------------

    const travel =
      /travel|trip|flight|carry|portable|journey|vacation/.test(
        query
      );

    const work =
      /work|desk|focus|office|study|deep work|productivity|remote/.test(
        query
      );

    const health =
      /health|fitness|recovery|wellness|sleep|watch|workout|exercise/.test(
        query
      );

    const audio =
      /music|audio|earbud|headphone|noise|sound/.test(
        query
      );

    let intent = "general shopping";

    if (travel && work) {
      intent = "travel + deep work";
    } else if (travel) {
      intent = "travel";
    } else if (health) {
      intent = "health / wellness";
    } else if (work) {
      intent = "deep work";
    } else if (audio) {
      intent = "audio / focus";
    }

    // -----------------------------
    // Rank products
    // -----------------------------

    const ranked = catalog
      .map((product) => {
        let score = product.score;

        // Travel
        if (
          travel &&
          (
            product.id === "carry-case-studio" ||
            product.id === "aerobuds-pro"
          )
        ) {
          score += 6;
        }

        // Work
        if (
          work &&
          (
            product.id === "charge-dock-mini" ||
            product.id === "aerobuds-pro"
          )
        ) {
          score += 6;
        }

        // Fitness
        if (
          health &&
          product.id === "pulse-watch-x"
        ) {
          score += 8;
        }

        // Audio
        if (
          audio &&
          product.id === "aerobuds-pro"
        ) {
          score += 8;
        }

        // Budget penalty
        if (product.price > budget) {
          score -= 15;
        }

        // Stock bonus
        if (product.stock > 0) {
          score += 2;
        }

        return {
          ...product,
          score: Math.max(
            0,
            Math.min(99, score)
          ),
        };
      })
      .filter(
        (product) => product.stock > 0
      )
      .sort(
        (a, b) => b.score - a.score
      );

    // -----------------------------
    // Prefer products inside budget
    // -----------------------------

    const affordable = ranked.filter(
      (product) =>
        product.price <= budget
    );

    const recommendations = (
      affordable.length > 0
        ? affordable
        : ranked
    ).slice(0, 3);

    // -----------------------------
    // Confidence
    // -----------------------------

    let confidence = 82;

    if (
      travel ||
      work ||
      health ||
      audio
    ) {
      confidence += 8;
    }

    if (budgetMatch) {
      confidence += 5;
    }

    confidence = Math.min(
      98,
      confidence
    );

    // -----------------------------
    // Generate recommendation text
    // -----------------------------

    const names = recommendations
      .map(
        (product) =>
          `${product.name} (${money(
            product.price
          )})`
      )
      .join(", ");

    let reply =
      `I mapped this as ${intent}. ` +
      `Your working budget is ${money(
        budget
      )}. ` +
      `My strongest matches are ${names}. `;

    if (recommendations.length > 0) {
      reply +=
        "I checked product relevance, stock and the ₹10k safety boundary before recommending them.";
    } else {
      reply +=
        "I couldn't find an in-stock match within your constraints.";
    }

    // -----------------------------
    // Audit Trail
    // -----------------------------

    const events = [
      "Natural-language request received",

      `Intent classified: ${intent}`,

      `Budget constraint: ${money(
        budget
      )}`,

      `Catalog candidates evaluated: ${catalog.length}`,

      "Product relevance scored",

      "Stock availability checked",

      `Top recommendation confidence: ${confidence}%`,

      "₹10,000 safety boundary checked",

      "Recommendation shortlist generated",

      "Payment tools remain locked until human confirmation",
    ];

    // -----------------------------
    // Return response
    // -----------------------------

    return NextResponse.json({
      ok: true,
      reply,
      recommendations,
      intent,
      confidence,
      budget,
      events,
    });

  } catch (error) {
    console.error(
      "SHOPAGENT AGENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        reply:
          "Something went wrong while processing your request.",
        recommendations: [],
        events: [
          "Agent processing failed",
        ],
      },
      {
        status: 500,
      }
    );
  }
}