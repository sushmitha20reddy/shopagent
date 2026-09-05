import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const total = Number(body.total);
    const approved = body.approved === true;

    // Human approval gate
    if (!approved) {
      return NextResponse.json(
        {
          ok: false,
          status: "HUMAN_APPROVAL_REQUIRED",
          message:
            "Human confirmation is required before checkout.",
        },
        { status: 400 }
      );
    }

    // Validate total
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        {
          ok: false,
          status: "INVALID_TOTAL",
          message: "Basket total is invalid.",
        },
        { status: 400 }
      );
    }

    // ₹10,000 hard bound
    if (total > 10000) {
      return NextResponse.json(
        {
          ok: false,
          status: "BOUND_EXCEEDED",
          message:
            "Checkout blocked: basket exceeds the ₹10,000 hard bound.",
        },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          ok: false,
          status: "MISSING_RAZORPAY_KEYS",
          message:
            "Razorpay credentials are missing from .env.local.",
        },
        { status: 500 }
      );
    }

    const amount = Math.round(total * 100);

    const auth = Buffer.from(
      `${keyId}:${keySecret}`
    ).toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },

        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `shopagent_${Date.now()}`,

          notes: {
            project: "ShopAgent",
            mode: "test",
            human_approved: "true",
          },
        }),
      }
    );

    const data = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(
        "RAZORPAY ORDER ERROR:",
        data
      );

      return NextResponse.json(
        {
          ok: false,
          status: "RAZORPAY_ERROR",
          message:
            data?.error?.description ||
            "Razorpay order creation failed.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: "ORDER_CREATED",

      orderId: data.id,

      keyId,

      amount: data.amount,

      currency: data.currency,
    });
  } catch (error) {
    console.error(
      "CHECKOUT POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        status: "CHECKOUT_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}


/* -----------------------------------------
   VERIFY RAZORPAY PAYMENT
----------------------------------------- */

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          ok: false,
          status: "INVALID_PAYMENT_RESPONSE",
          message:
            "Incomplete Razorpay payment response.",
        },
        { status: 400 }
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        {
          ok: false,
          status: "MISSING_RAZORPAY_SECRET",
          message:
            "Razorpay secret is missing.",
        },
        { status: 500 }
      );
    }

    const generatedSignature =
      crypto
        .createHmac("sha256", keySecret)
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    const signatureValid =
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signatureValid) {
      return NextResponse.json(
        {
          ok: false,
          status: "SIGNATURE_INVALID",
          message:
            "Razorpay payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: "PAYMENT_VERIFIED",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error(
      "CHECKOUT PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        status: "VERIFICATION_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}