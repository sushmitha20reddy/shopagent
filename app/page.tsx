 "use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, Bot, Check, ChevronRight, CircleAlert, Fingerprint,
  LockKeyhole, Map, Package, Plus, Search, ShieldCheck, Sparkles, Timer, X, Zap
} from "lucide-react";

type Product = {
  id: string; name: string; category: string; price: number; stock: number;
  description: string; score: number; reason: string; image: string;
};

const starterPrompts = [
  "travel + deep work",
  "health setup under ₹20k",
  "calm desk essentials"
];

declare global {
  interface Window {
    Razorpay?: new (
      options: Record<string, unknown>
    ) => {
      open: () => void;
    };
  }
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(),
        { once: true }
      );

      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Razorpay Checkout failed to load."
            )
          ),
        { once: true }
      );

      return;
    }

    // Create Razorpay Checkout script
    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error(
          "Razorpay Checkout failed to load."
        )
      );

    document.body.appendChild(script);
  });
}

export default function Home() {
  const [text, setText] = useState("I need a focused setup for travel and deep work");
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [confidence, setConfidence] = useState(91);
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [agentOpen, setAgentOpen] =
  useState(false);

const [agentMessage, setAgentMessage] =
  useState("");

const [agentThinking, setAgentThinking] =
  useState(false);

const [agentMessages, setAgentMessages] =
  useState<
    {
      role: "user" | "agent";
      text: string;
    }[]
  >([
    {
      role: "agent",
      text:
        "Hi! I'm ShopAgent. Tell me what you're looking for, your budget, or what you want to optimize."
    }
  ]);

  const total = useMemo(() => selected.reduce((sum, p) => sum + p.price, 0), [selected]);
  const bounded = total <= 10000;

  async function mapIntent() {
    setLoading(true);
    setCheckoutMessage("");
    setLog(["Parsing natural-language brief…"]);
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setProducts(data.products || []);
      setConfidence(data.confidence || 91);
      setIntent(data.intent || "general commerce");
      setLog([
        "Intent classified",
        `Ranked ${data.products?.length || 0} in-stock products`,
        `Average confidence ${data.confidence || 91}%`,
        "Payment tools remain locked until human approval"
      ]);
    } finally {
      setLoading(false);
    }
  }

  function toggle(p: Product) {
    setSelected(prev => prev.some(x => x.id === p.id)
      ? prev.filter(x => x.id !== p.id)
      : [...prev, p]);
    setApproved(false);
    setCheckoutMessage("");
  }

async function sendAgent(
  message = agentMessage
) {
  const clean = message.trim();

  if (
    !clean ||
    agentThinking
  ) {
    return;
  }

  // Add user message
  setAgentMessages((previous) => [
    ...previous,

    {
      role: "user",
      text: clean,
    },
  ]);

  setAgentMessage("");

  setAgentThinking(true);

  // Audit trail
  setLog((previous) => [
    ...previous,
    "Agent request received",
    `User intent: "${clean}"`,
  ]);

  try {
    const response = await fetch(
      "/api/agent",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          message: clean,
        }),
      }
    );

    const data =
      await response.json();

    // Agent response
    setAgentMessages(
      (previous) => [
        ...previous,

        {
          role: "agent",
          text:
            data.reply ||
            "I couldn't generate a recommendation.",
        },
      ]
    );

    // Update main page
    if (
      data.recommendations?.length
    ) {
      setProducts(
        data.recommendations
      );
    }

    setConfidence(
      data.confidence || 82
    );

    setIntent(
      data.intent ||
        "general shopping"
    );

    setText(clean);

    // Update audit trail
    setLog((previous) => [
      ...previous,

      ...(data.events || []),

      `Agent shortlist updated: ${
        data.recommendations
          ?.length || 0
      } products`,
    ]);
  } catch (error) {
    console.error(error);

    setAgentMessages(
      (previous) => [
        ...previous,

        {
          role: "agent",
          text:
            "I couldn't reach the recommendation service. Please try again.",
        },
      ]
    );

    setLog((previous) => [
      ...previous,
      "✕ Agent service unavailable",
    ]);
  } finally {
    setAgentThinking(false);
  }
}

  async function requestCheckout() {
  try {
    setCheckoutMessage("Creating Razorpay Test Mode order...");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        total,
        approved: true,
      }),
    });

    const order = await response.json();

    if (!response.ok || !order.ok) {
      setCheckoutMessage(
        order.message || "Unable to create Razorpay order."
      );

      setLog((prev) => [
        ...prev,
        `Checkout blocked: ${order.status || "ERROR"}`,
      ]);

      return;
    }

    setCheckoutMessage("Razorpay Test Mode checkout is opening...");

    setLog((prev) => [
      ...prev,
      `Razorpay order created: ${order.orderId}`,
      "Opening Razorpay Test Checkout...",
    ]);

    // Load Razorpay Checkout script
    await loadRazorpay();

    if (!window.Razorpay) {
      throw new Error("Razorpay Checkout failed to load.");
    }

    // Open Razorpay Checkout
    const razorpay = new window.Razorpay({
      key: order.keyId,

      amount: order.amount,

      currency: order.currency,

      name: "ShopAgent",

      description: "ShopAgent bounded commerce test order",

      order_id: order.orderId,

      prefill: {
        name: "ShopAgent Tester",
        email: "tester@example.com",
      },

      notes: {
        source: "ShopAgent",
        mode: "test",
      },

      theme: {
        color: "#10a9ed",
      },

      handler: async (
        paymentResponse: Record<string, string>
      ) => {
        try {
          setLog((prev) => [
            ...prev,
            "Razorpay payment response received",
            "Verifying payment signature...",
          ]);

          // Send payment response to backend
          const verifyResponse = await fetch(
            "/api/checkout",
            {
              method: "PUT",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify(paymentResponse),
            }
          );

          const verification = await verifyResponse.json();

          if (
            verifyResponse.ok &&
            verification.ok
          ) {
            setCheckoutMessage(
              `✓ Payment verified in Test Mode · ${verification.paymentId}`
            );

            setLog((prev) => [
              ...prev,
              "✓ Payment signature verified",
              "✓ TEST MODE checkout complete",
            ]);
          } else {
            setCheckoutMessage(
              verification.message ||
                "Payment verification failed."
            );

            setLog((prev) => [
              ...prev,
              "✕ Payment verification failed",
            ]);
          }
        } catch (error) {
          console.error(
            "Payment verification error:",
            error
          );

          setCheckoutMessage(
            "Payment verification failed."
          );

          setLog((prev) => [
            ...prev,
            "✕ Payment verification request failed",
          ]);
        }
      },

      modal: {
        ondismiss: () => {
          setLog((prev) => [
            ...prev,
            "Checkout closed",
            "No payment success was claimed",
          ]);

          setCheckoutMessage(
            "Checkout closed. No payment success was claimed."
          );
        },
      },
    });

    razorpay.open();
  } catch (error) {
    console.error(
      "Razorpay checkout error:",
      error
    );

    setCheckoutMessage(
      error instanceof Error
        ? error.message
        : "Checkout failed."
    );

    setLog((prev) => [
      ...prev,
      "✕ Unable to start Razorpay Checkout",
    ]);
  }
}


  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="logo"><Zap size={21} /></div>
          <div><b>ShopAgent</b><span>AGENTIC COMMERCE</span></div>
        </div>
        <div className="top-pills">
          <span className="pill cyan">TRACK 01 / GROWTH</span>
          <span className="pill green"><i /> RAZORPAY TEST MODE · GATED</span>
        </div>
        <button
  className="agent-btn"
  onClick={() =>
    setAgentOpen(true)
  }
>
  <Bot size={16}/>
  AGENT MODE
  <i />
</button>
      </header>

      <div className="shell">
        <section className="hero">
          <div>
            <div className="eyebrow">BOUNDED COMMERCE CONTROL PLANE</div>
            <h1>Buy with confidence.<br/><em>See every decision.</em></h1>
            <p>ShopAgent turns natural intent into an explainable shortlist, then pauses at a hard human approval gate before any Razorpay payment tool runs.</p>
          </div>
          <div className="metrics">
            <Metric label="AVG CONFIDENCE" value={`${confidence}%`} />
            <Metric label="HARD BOUND" value="₹10k" />
            <Metric label="PAYMENT GATE" value={approved ? "armed / ready" : "armed / locked"} />
          </div>
        </section>

        <section className="grid-top">
          <div className="panel brief">
            <div className="panel-head">
              <div>
                <div className="eyebrow"><Sparkles size={16}/> NATURAL LANGUAGE BRIEF</div>
                <h2>Tell the agent what you need</h2>
                <p>It will classify intent, rank in-stock products, and explain the confidence behind each suggestion.</p>
              </div>
              <span className="mode"><Sparkles size={13}/> HYBRID REASONING</span>
            </div>
            <div className="brief-body">
              <div className="input-row">
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && mapIntent()} />
                <button className="map" onClick={mapIntent} disabled={loading}><Search size={18}/>{loading ? "Mapping…" : "Map intent"}</button>
              </div>
              <div className="chips">
                {starterPrompts.map(p => <button key={p} onClick={() => setText(p)}>“{p}”</button>)}
              </div>
              <div className="standing">
                <div className="eyebrow">AGENT STANDING BY</div>
                {intent ? <><b>Intent: {intent}</b><span>Shortlist updated from the catalog.</span></> :
                  <span>Start with a goal, constraint, or context. The recommendation trace will appear here before checkout.</span>}
              </div>
            </div>
          </div>

          <div className="panel audit">
            <div className="eyebrow">LIVE EXECUTION LOG</div>
            <h2>Audit trail <span className="live-dot"/></h2>
            <div className="hash"><Fingerprint size={18}/> SHA-256 PAYLOADS <b>standby</b></div>
            <div className="log-box">
              {log.length ? log.map((x, i) => <div key={i}><Check size={14}/>{x}</div>) :
                <><div className="terminal">›_</div><span>Ask ShopAgent for a shortlist to start a trace.</span><small>NO PAYMENT TOOLS ARMED</small></>}
            </div>
          </div>
        </section>

        <section className="catalog">
          <div className="section-title">
            <div><div className="eyebrow">CATALOG INTELLIGENCE</div><h2>A shortlist you can inspect</h2></div>
            <span className="json"><i/> MACHINE-READABLE CATALOG ONLINE <b>JSON-LD ↗</b></span>
          </div>
          <div className="cards">
            {(products.length ? products : [
              {id:"aerobuds-pro",name:"AeroBuds Pro",category:"Audio",price:8999,stock:14,description:"Adaptive-noise-cancelling earbuds with 32-hour battery life.",score:94,reason:"Strong fit for deep-work focus and travel.",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"},
              {id:"pulse-watch-x",name:"Pulse Watch X",category:"Wearables",price:14999,stock:9,description:"A focused fitness watch with recovery insights and a bright AMOLED face.",score:91,reason:"Useful for travel, recovery and daily activity tracking.",image:"https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=80"},
              {id:"charge-dock-mini",name:"Charge Dock Mini",category:"Accessories",price:2499,stock:22,description:"A compact USB-C charging dock for a calmer desk setup.",score:96,reason:"Best low-cost match for a clean desk setup.",image:"https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80"},
              {id:"carry-case-studio",name:"Carry Case Studio",category:"Accessories",price:1299,stock:31,description:"A water-resistant hard case with a soft, modular interior.",score:88,reason:"Adds practical protection for travel days.",image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"}
            ] as Product[]).map(p => {
              const isSelected = selected.some(x => x.id === p.id);
              return <article className={`product ${isSelected ? "selected" : ""}`} key={p.id}>
                <div className="photo" style={{backgroundImage:`url("${p.image}")`}}>
                  <span>{p.category}</span><strong>{p.score}% match</strong>
                </div>
                <div className="product-body">
                  <div className="product-title"><h3>{p.name}</h3><b>₹{p.price.toLocaleString("en-IN")}</b></div>
                  <div className="stock">{p.stock} IN STOCK</div>
                  <p>{p.description}</p>
                  <small>Why: {p.reason}</small>
                  <button className={isSelected ? "remove" : ""} onClick={() => toggle(p)}>
                    {isSelected ? <><Check size={17}/> Added to plan</> : <><Package size={17}/> Add to plan</>}
                  </button>
                </div>
              </article>
            })}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel containment">
            <div className="eyebrow">WHAT BROKE / CONTAINMENT LAB</div>
            <h2>Prove the recovery path <CircleAlert size={21}/></h2>
            <p>These safe simulations show the exact moment ShopAgent refuses to claim a payment success.</p>
            <div className="failure-grid">
              <Failure icon={<Package/>} title="Stock out" text="Stop before gateway call"/>
              <Failure icon={<Timer/>} title="Gateway timeout" text="Never claim success"/>
              <Failure icon={<X/>} title="Payment rejected" text="Keep failure visible"/>
            </div>
          </div>

          <div className="panel basket">
            <div className="eyebrow">APPROVAL QUEUE</div>
            <h2>Your exact basket <LockKeyhole size={19}/></h2>
            <div className="basket-items">
              {selected.length ? selected.map(p => <div className="basket-item" key={p.id}><span>{p.name}</span><b>₹{p.price.toLocaleString("en-IN")}</b></div>) :
                <span className="empty">No items selected yet.<small>THE PAYMENT TOOLS ARE LOCKED</small></span>}
            </div>
            <div className="total"><span>BOUNDED TOTAL</span><b>₹{total.toLocaleString("en-IN")}</b></div>
            <button className={`checkout ${approved ? "approved" : ""}`} disabled={!selected.length || !bounded} onClick={requestCheckout}>
              {approved ? <ShieldCheck size={18}/> : <LockKeyhole size={18}/>}
              {approved ? "Confirm agent checkout" : "Request agent checkout"} <ArrowRight size={18}/>
            </button>
            <div className="human">{approved ? "HUMAN CONFIRMATION ARMED — CLICK AGAIN" : "HUMAN CONFIRMATION REQUIRED"}</div>
            {checkoutMessage && <div className="success"><Check size={17}/>{checkoutMessage}</div>}
            {!bounded && <div className="error">Hard bound exceeded. Remove items before checkout.</div>}
          </div>
        </section>
      </div>

{agentOpen && (
  <div
    className="agent-overlay"
    onClick={() =>
      setAgentOpen(false)
    }
  >
    <aside
      className="agent-drawer"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      {/* HEADER */}

      <div className="agent-drawer-head">

        <div>

          <div className="eyebrow">
            <Bot size={15}/>
            AGENT MODE
          </div>

          <h2>
            ShopAgent Assistant
          </h2>

          <span>
            Your AI shopping
            recommendation assistant
          </span>

        </div>

        <button
          className="icon-btn"
          onClick={() =>
            setAgentOpen(false)
          }
        >
          <X size={18}/>
        </button>

      </div>


      {/* QUICK QUESTIONS */}

      <div className="agent-suggestions">

        <button
          onClick={() =>
            sendAgent(
              "Best setup for travel and deep work under ₹10k"
            )
          }
        >
          Travel + deep work
        </button>

        <button
          onClick={() =>
            sendAgent(
              "Give me a calm desk setup under ₹5k"
            )
          }
        >
          Desk setup under ₹5k
        </button>

        <button
          onClick={() =>
            sendAgent(
              "What should I buy for fitness?"
            )
          }
        >
          Fitness recommendations
        </button>

      </div>


      {/* CHAT */}

      <div className="chat-stream">

        {agentMessages.map(
          (message, index) => (

            <div
              key={index}
              className={`chat-message ${message.role}`}
            >

              <span className="chat-label">
                {message.role ===
                "agent"
                  ? "SHOPAGENT"
                  : "YOU"}
              </span>

              <div>
                {message.text}
              </div>

            </div>

          )
        )}

        {agentThinking && (

          <div className="chat-message agent">

            <span className="chat-label">
              SHOPAGENT
            </span>

            <div className="typing">
              Thinking ···
            </div>

          </div>

        )}

      </div>


      {/* INPUT */}

      <div className="chat-input">

        <input
          value={agentMessage}
          onChange={(event) =>
            setAgentMessage(
              event.target.value
            )
          }
          onKeyDown={(event) => {

            if (
              event.key === "Enter"
            ) {
              sendAgent();
            }

          }}
          placeholder="Ask me what to buy..."
        />

        <button
          onClick={() =>
            sendAgent()
          }
          disabled={
            agentThinking ||
            !agentMessage.trim()
          }
        >
          <ArrowRight size={18}/>
        </button>

      </div>


      <div className="agent-safe">

        <ShieldCheck size={14}/>

        Agent can recommend,
        but cannot pay without
        human approval.

      </div>

    </aside>
  </div>
)}

      <footer><span>SHOPAGENT / BOUNDED BY DESIGN</span><span><ShieldCheck size={15}/> NO FINANCIAL ACTION WITHOUT A HUMAN GATE</span></footer>
    </main>
  );
}

function Metric({label,value}:{label:string,value:string}) {
  return <div className="metric"><span>{label}</span><b>{value}</b></div>;
}
function Failure({icon,title,text}:{icon:React.ReactNode,title:string,text:string}) {
  return <div className="failure"><div>{icon}</div><b>{title}</b><span>{text}</span></div>;
}