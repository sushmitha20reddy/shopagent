# ShopAgent — One Page Agentic Commerce Demo

A one-page Next.js implementation inspired by the supplied ShopAgent screenshots.

## Features

- Dark, responsive one-page UI
- Natural-language intent box
- Intent classification API
- Product ranking API with stock + budget constraints
- Explainable product scores/reasons
- Add-to-plan basket
- ₹10,000 hard spending bound
- Human approval gate
- Audit/execution log
- Safe simulated Razorpay test-mode checkout endpoint
- Ready for Vercel

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Framework preset: Next.js.
4. Build command: `next build`
5. Output: `.next` (Vercel detects this automatically).
6. Deploy.

## Real Razorpay integration

This starter deliberately does not charge real money. For a buildathon demo, keep the gate visible and use Razorpay test credentials.

To add real Razorpay Checkout later:
- Create the order server-side with Razorpay Orders API.
- Keep `key_secret` only on the server.
- Pass the generated order ID to the browser.
- Open Razorpay Checkout in test mode.
- Verify the payment signature server-side.
- Never let the browser claim success without server verification.

The current `/api/checkout` endpoint intentionally returns a simulated TEST_MODE result after the human gate.
