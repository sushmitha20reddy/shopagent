# ShopAgent — Agentic Commerce with Human-Controlled Payments

ShopAgent is a full-stack agentic commerce application that turns natural-language shopping requests into explainable product recommendations and a human-approved checkout flow.

The project demonstrates how an AI-style shopping agent can reason over customer intent, rank products using constraints such as budget and stock, maintain an audit trail, and require explicit human approval before initiating a payment.

## 🚀 Live Demo

🌐 **Live Application:**  
https://shopagent-seven.vercel.app

💻 **GitHub Repository:**  
https://github.com/sushmitha20reddy/shopagent

---

## ✨ Key Features

- 🤖 **Agent Mode** — interact with ShopAgent using natural-language shopping requests
- 🧠 **Intent Understanding** — extracts shopping intent, budget and preferences
- 🎯 **Explainable Recommendations** — products are ranked with transparent reasons
- 📦 **Stock-Aware Selection** — unavailable products are automatically excluded
- 💰 **Budget Constraints** — recommendations respect the requested budget
- 🛒 **Add-to-Plan Basket** — build a purchase plan before checkout
- 🔐 **Human Approval Gate** — no payment action occurs without explicit approval
- 🛡️ **₹10,000 Hard Spending Bound** — prevents checkout above the configured limit
- 📋 **Audit Trail** — records agent decisions and execution events
- 💳 **Razorpay Test Mode** — demonstrates gated payment initiation safely
- 🔎 **Payment Verification** — verifies Razorpay payment signatures server-side
- ⚠️ **Failure Simulations** — demonstrates recovery paths for stock-outs, gateway timeouts and rejected payments
- ☁️ **Vercel Ready** — deployed as a Next.js application

---

## 🧩 How It Works

```text
User Shopping Request
        ↓
   Agent Mode
        ↓
Intent Extraction
        ↓
Budget + Preference Analysis
        ↓
Product Ranking
        ↓
Explainable Recommendations
        ↓
     Add to Plan
        ↓
 Human Approval Gate
        ↓
 ₹10,000 Spending Bound
        ↓
 Razorpay Test Mode
        ↓
Payment Verification
        ↓
      Audit Trail

🖥️ Application Flow

1. Describe What You Need
Users can enter a natural-language shopping request such as: I need wireless earbuds under ₹9,000 with good battery life.
ShopAgent processes the request and converts it into structured shopping intent.

The system considers information such as:
- Product category
- Budget
- User preferences
- Stock requirements
- Shopping intent

2. Agent Generates Recommendations
The Agent evaluates available products and ranks them according to the user's requirements.

Each recommendation includes:
- Product information
- Price
- Stock availability
- Recommendation score
- Matching preferences
- Explanation of why the product was selected

This makes the recommendation process more transparent instead of simply returning a product without explanation.

3. Build the Purchase Plan
Users can select recommended products and add them to their purchase plan.

The application keeps track of:
- Selected products
- Quantity
- Individual prices
- Total basket value

The basket can then be reviewed before any payment action is attempted.

4. Human Approval Gate
ShopAgent does not allow the agent to independently complete a purchase.

Before checkout:
Agent Recommendation
        ↓
Purchase Plan
        ↓
Human Review
        ↓
Explicit Approval
        ↓
Checkout

This ensures that the final financial action remains under human control.

5. Spending Limit
ShopAgent enforces a hard spending boundary of:
₹10,000
If the basket exceeds the configured limit, the checkout request is rejected.
This provides an additional safety layer for agentic purchasing.

6. Razorpay Test Mode
After explicit human approval, ShopAgent creates a Razorpay Test Mode order and opens the Razorpay Checkout interface.
The project uses Razorpay Test Mode credentials for demonstration and development.
No real-money transaction is intended.

7. Payment Verification
After the Razorpay checkout flow completes, the server verifies the payment signature.
The application only reports a successful verified payment when the server-side verification succeeds.

8. Audit Trail
ShopAgent maintains an execution and decision trail showing important events throughout the workflow.

Examples include:
Intent received
        ↓
Intent mapped
        ↓
Products ranked
        ↓
Recommendation generated
        ↓
Product added to plan
        ↓
Human approval requested
        ↓
Human approval received
        ↓
Razorpay order created
        ↓
Payment verification

This provides visibility into how the agent reached and executed a decision.


🏗️ System Architecture
┌─────────────────────────────────────┐
│             Next.js UI              │
│                                     │
│ Agent Mode / Intent / Products      │
│ Basket / Approval / Audit Trail     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             Agent API               │
│            /api/agent               │
│                                     │
│ Intent Analysis + Ranking + Scoring │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│           Product API               │
│          /api/products              │
│                                     │
│ Product Catalog + Stock + Budget    │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│        Human Approval Gate          │
│                                     │
│ Explicit user confirmation required │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│           Checkout API              │
│           /api/checkout             │
│                                     │
│ Razorpay Order Creation             │
│ Payment Signature Verification      │
└─────────────────────────────────────┘


🔌 API Endpoints

Endpoint	     Method 	 Purpose
/api/agent	   POST	   Processes natural-language shopping requests and generates recommendations
/api/intent	   POST	   Extracts structured shopping intent from user input
/api/products	 GET	   Returns the product catalog
/api/checkout	 POST	   Creates a Razorpay Test Mode order after human approval
/api/checkout	 PUT	   Verifies the Razorpay payment signature


🛡️ Safety & Financial Controls

ShopAgent is designed around the principle of human-controlled financial actions.
Human Approval
The agent cannot directly complete a purchase.
Checkout requires explicit user approval before a payment order is created.
₹10,000 Spending Boundary
The application enforces a maximum checkout amount of:
₹10,000
Any checkout request above this limit is rejected.


Razorpay Test Mode
The application uses Razorpay Test Mode for development and demonstration.
This prevents the project from unintentionally processing real-money payments during testing.
Server-Side Payment Verification
Razorpay payment signatures are verified on the server using the configured Razorpay secret.
This prevents the frontend from being the sole source of truth for payment success.
Environment Variables
Sensitive credentials are stored as environment variables:
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
Secrets are not committed to the Git repository.


⚠️ Failure & Recovery Scenarios
ShopAgent includes simulated failure scenarios to demonstrate how an agentic commerce workflow should respond when execution does not go as expected.
Stock Out
If a recommended product becomes unavailable, the system can detect the stock issue instead of silently proceeding with the purchase.
Gateway Timeout
If the payment gateway does not respond successfully, the system records the failure rather than incorrectly reporting a successful transaction.
Payment Rejected
If the payment is rejected, the system surfaces the failure and does not report the transaction as successful.
These scenarios demonstrate that failure handling and recovery are part of the agent workflow.

🧪 Example Agent Requests
ShopAgent can process natural-language shopping requests such as:
I need wireless earbuds under ₹9,000.
Find me a compact charging setup under ₹5,000.
I need a travel-friendly tech accessory with good value.
Recommend products for a small work-from-home setup under ₹10,000.
The agent evaluates the request and returns products that best match the specified requirements.

🛠️ Tech Stack
Layer	Technology
Frontend	Next.js
UI	React
Language	TypeScript
Styling	CSS
Icons	Lucide React
Backend	Next.js API Routes
Runtime	Node.js
Payments	Razorpay Test Mode
Version Control	Git + GitHub
Deployment	Vercel


📁 Project Structure
shopagent/
│
├── app/
│   ├── api/
│   │   ├── agent/
│   │   │   └── route.ts
│   │   │
│   │   ├── checkout/
│   │   │   └── route.ts
│   │   │
│   │   ├── intent/
│   │   │   └── route.ts
│   │   │
│   │   └── products/
│   │       └── route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── .gitignore
├── next-env.d.ts
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json

🚀 Getting Started
Prerequisites
Make sure the following are installed:
- Node.js
- npm
- Git
1. Clone the Repository
git clone https://github.com/sushmitha20reddy/shopagent.git
cd shopagent

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a file named:
.env.local
Add your Razorpay Test Mode credentials:
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
Do not commit .env.local to GitHub.

4. Start the Development Server
npm run dev
The application will be available at:
http://localhost:3000

🔍 Testing Checklist

Agent Mode
- Enter a natural-language shopping request
- Submit the request
- Verify that intent is detected
- Review recommended products
- Review recommendation explanations
- Check product scores

Product Selection
- Add a product to the plan
- Review the selected products
- Verify individual prices
- Verify the total basket value

Human Approval
- Review the complete basket
- Confirm the purchase details
- Approve the checkout
- Verify that payment cannot be initiated without approval

Spending Limit
- Test a basket below ₹10,000
- Test a basket above ₹10,000
- Verify that the spending boundary is enforced

Razorpay Test Mode
- Verify Test Mode credentials
- Create a test order
- Open Razorpay Checkout
- Complete a test payment
- Verify the payment signature

Failure Scenarios
Test the following simulated conditions:
- Stock out
- Gateway timeout
- Payment rejection


🌐 Deployment
ShopAgent is deployed using Vercel.
Environment Variables
The following environment variables must be configured in the Vercel project:
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
For the current deployment, these variables should be configured for the required deployment environments.
After changing environment variables, redeploy the application so the new values are available to the server.


Production Application
🌐 https://shopagent-seven.vercel.app


🎯 Project Objective
The objective of ShopAgent is to demonstrate a practical agentic commerce architecture where an AI-style assistant can:
1. Understand natural-language shopping intent
2. Extract relevant constraints such as budget and preferences
3. Reason over available products
4. Rank suitable products
5. Explain recommendation decisions
6. Prepare a purchase plan
7. Enforce financial boundaries
8. Require explicit human approval
9. Initiate a controlled payment workflow
10. Verify the payment result
11. Maintain an audit trail
12. Handle execution failures safely
The project combines agent-assisted decision making with human oversight for financial actions.


💡 Why Human-Controlled Payments?
Agentic systems can automate complex decisions, but financial transactions require an additional layer of control.

ShopAgent therefore separates:
Recommendation
      ↓
Planning
      ↓
Human Approval
      ↓
Financial Action
The agent is responsible for assisting with the decision-making process, while the human remains responsible for approving the final financial action.

This architecture helps reduce the risk of unintended purchases and provides a clear boundary between AI assistance and financial execution.


🔮 Future Improvements

Potential future enhancements include:
- LLM-powered intent extraction
- Conversational memory
- Personalized recommendations
- Real-time inventory integration
- Product search APIs
- Persistent shopping history
- Multi-agent shopping workflows
- Advanced fraud detection
- Recommendation quality evaluation
- Observability dashboards
- User accounts and authentication
- Persistent order history
- Production payment workflows with additional security controls


📊 Skills Demonstrated

This project demonstrates practical experience with:
- Full-stack web development
- Next.js
- React
- TypeScript
- REST API design
- Agentic application architecture
- Natural-language intent processing
- Recommendation systems
- Explainable decision making
- State management
- Payment gateway integration
- Server-side payment verification
- Human-in-the-loop systems
- Financial safety controls
- Error handling
- Git and GitHub
- Vercel deployment


📌 Project Highlights

Agentic Workflow
The application demonstrates how an agent can move from:
User Intent
     ↓
Reasoning
     ↓
Recommendation
     ↓
Planning
     ↓
Human Approval
     ↓
Controlled Execution

Explainability
Recommendations include reasons and scores rather than presenting products as unexplained results.
Human-in-the-Loop
Financial execution requires explicit user approval.
Safety Boundaries
A hard ₹10,000 spending limit prevents the system from initiating checkout above the configured threshold.
Auditability
Important agent and execution events are recorded to make the workflow easier to understand and debug.


👩‍💻 Author
Sushmitha Reddy
B.Tech Computer Science & Engineering (AI/ML)

Links
- GitHub: https://github.com/sushmitha20reddy
- Project Repository: https://github.com/sushmitha20reddy/shopagent
- Live Demo: https://shopagent-seven.vercel.app
