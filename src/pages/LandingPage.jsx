import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    reveals.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lp">
      {/* NAV */}
      <nav className="lp-nav">
        <a className="lp-nav-logo" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="lp-nav-icon">🎁</span>
          <span>Inaam<span>ify</span></span>
        </a>
        <ul>
          <li><a href="#how" onClick={(e) => { e.preventDefault(); scrollTo("how"); }}>How It Works</a></li>
          <li><a href="#benefits" onClick={(e) => { e.preventDefault(); scrollTo("benefits"); }}>Benefits</a></li>
          <li><a href="#who" onClick={(e) => { e.preventDefault(); scrollTo("who"); }}>For Who</a></li>
          <li><a href="#" className="lp-nav-cta" onClick={(e) => { e.preventDefault(); navigate("/selection"); }}>Get Started</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-blob" />
        <div className="lp-hero-blob" />
        <div className="lp-hero-badge">🇮🇳 Made for India's Local Shops</div>
        <h1>Har Kharidari<br />Par <span>Inaam</span></h1>
        <p className="lp-hero-tagline">
          Turn every customer into a <strong>loyal customer</strong> —<br />
          with rewards on every purchase at your shop.
        </p>
        <div className="lp-hero-btns">
          <a href="#" className="lp-btn-primary" onClick={(e) => { e.preventDefault(); navigate("/selection"); }}>🚀 Start Free Today</a>
          <a href="#how" className="lp-btn-outline" onClick={(e) => { e.preventDefault(); scrollTo("how"); }}>See How It Works ↓</a>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="lp-stats-bar">
        <div className="lp-stat"><div className="lp-stat-num">60M+</div><div className="lp-stat-label">Local Shops in India</div></div>
        <div className="lp-stat"><div className="lp-stat-num">0%</div><div className="lp-stat-label">Use Loyalty Systems</div></div>
        <div className="lp-stat"><div className="lp-stat-num">3x</div><div className="lp-stat-label">Cost to Acquire vs Retain</div></div>
        <div className="lp-stat"><div className="lp-stat-num">₹50L Cr</div><div className="lp-stat-label">Unorganized Retail Market</div></div>
      </div>

      {/* PROBLEM / SOLUTION */}
      <section className="lp-section lp-ps-section">
        <div className="lp-container">
          <div className="lp-section-label">The Challenge</div>
          <h2 className="lp-section-title">Why Local Shops Struggle</h2>
          <p className="lp-section-sub">Indian shop owners face a tough reality — and Inaamify is the answer.</p>
          <div className="lp-ps-grid reveal">
            <div className="lp-ps-card lp-problem">
              <div className="lp-card-header">❌ The Problem</div>
              <div className="lp-ps-item"><span>😞</span><p>Customers always choose the cheapest option available</p></div>
              <div className="lp-ps-item"><span>🏃</span><p>They buy from the nearest shop, not the most loyal one</p></div>
              <div className="lp-ps-item"><span>💔</span><p>No reason to come back to the same shop repeatedly</p></div>
              <div className="lp-ps-item"><span>📉</span><p>Heavy price competition squeezes profits to zero</p></div>
              <div className="lp-ps-item"><span>🛒</span><p>Big e-commerce platforms stealing local customers</p></div>
            </div>
            <div className="lp-ps-card lp-solution">
              <div className="lp-card-header">✅ The Solution</div>
              <div className="lp-ps-item"><span>🎁</span><p>Reward customers on every purchase — so they return to YOU</p></div>
              <div className="lp-ps-item"><span>⭐</span><p>Create emotional loyalty beyond just price comparisons</p></div>
              <div className="lp-ps-item"><span>📱</span><p>Simple mobile-first system — no technical knowledge needed</p></div>
              <div className="lp-ps-item"><span>🏆</span><p>Stand out as the ONLY shop in your area with rewards</p></div>
              <div className="lp-ps-item"><span>📊</span><p>Track customer behavior with a powerful seller dashboard</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section" id="how">
        <div className="lp-container">
          <div className="lp-section-label">Simple Process</div>
          <h2 className="lp-section-title">How Inaamify Works</h2>
          <p className="lp-section-sub">6 easy steps — from customer joining your shop to redeeming exciting gifts.</p>
          <div className="lp-steps-grid">
            {[
              { n: 1, color: "#2980B9", title: "Customer Joins Your Shop", desc: "Customer scans your QR code or clicks your shop link to connect and register with your loyalty program.", delay: "0s" },
              { n: 2, color: "#8E44AD", title: "Upload Purchase Bill", desc: "After shopping, the customer uploads their bill or receipt and enters the amount they spent.", delay: ".1s" },
              { n: 3, color: "#E8620A", title: "Seller Approves", desc: "You verify the bill in your dashboard and approve it with just one click. Full control stays with you.", delay: ".2s" },
              { n: 4, color: "#F5A623", title: "Points Credited Instantly", desc: "The customer instantly receives reward points. You decide the ₹ to Points conversion ratio.", delay: ".1s" },
              { n: 5, color: "#27AE60", title: "Customer Redeems Rewards", desc: "When ready, the customer selects a gift from your rewards list and clicks Redeem. You get notified.", delay: ".2s" },
              { n: 6, color: "#1A2B4C", title: "You Approve & Deliver", desc: "You approve the redemption request, the customer collects their gift, and you mark it as delivered.", delay: ".3s" },
            ].map(({ n, color, title, desc, delay }) => (
              <div key={n} className="lp-step-card reveal" style={{ borderTopColor: color, transitionDelay: delay }}>
                <div className="lp-step-num" style={{ background: color }}>{n}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REAL EXAMPLE */}
      <section className="lp-section lp-example-section">
        <div className="lp-container">
          <div className="lp-section-label">See the Difference</div>
          <h2 className="lp-section-title">A Real Customer. Real Numbers.</h2>
          <p className="lp-section-sub">What happens when a customer spends ₹1000 at your shop?</p>
          <div className="lp-example-box reveal">
            <div className="lp-ex-col">
              <h4 className="neutral">The Situation</h4>
              <span className="lp-ex-rupee">₹1,000</span>
              <p>A customer walks in and buys groceries or any product worth ₹1000 from your shop today.</p>
            </div>
            <div className="lp-ex-col lp-ex-center">
              <h4 className="bad">❌ Without Inaamify</h4>
              <p>Customer gets nothing. No reward. No reason to come back. They might go to the cheaper shop next time.</p>
              <div className="lp-ex-result bad">😞 Customer lost</div>
            </div>
            <div className="lp-ex-col">
              <h4 className="good">✅ With Inaamify</h4>
              <p>Customer earns reward points, redeems an exciting gift from your list, and tells friends about your shop!</p>
              <div className="lp-ex-result good">🎉 Customer stays loyal</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="lp-section lp-benefits-section" id="benefits">
        <div className="lp-container">
          <div className="lp-section-label lp-gold-label">Why Sellers Win</div>
          <h2 className="lp-section-title lp-white-title">Everything You Need to Grow</h2>
          <p className="lp-section-sub lp-muted-sub">Inaamify gives you powerful tools to build lasting customer relationships.</p>
          <div className="lp-benefits-grid">
            {[
              { icon: "👥", bg: "rgba(79,195,247,.15)", title: "Increase Repeat Customers", desc: "Reward system incentivizes customers to return to YOUR shop every single time they need to buy.", delay: "0s" },
              { icon: "💰", bg: "rgba(245,166,35,.15)", title: "No Need to Cut Prices", desc: "Compete without a price war. Give value through rewards and gifts, not through margin-killing discounts.", delay: ".1s" },
              { icon: "🤝", bg: "rgba(39,174,96,.15)", title: "Build Real Loyalty", desc: "Create emotional bonds with your customers. People who earn points feel connected — they keep coming back.", delay: ".2s" },
              { icon: "⭐", bg: "rgba(232,98,10,.15)", title: "Stand Out From Competitors", desc: "Be the only shop in your area with a proper rewards program. Customers will choose you over similar shops.", delay: ".3s" },
              { icon: "🎯", bg: "rgba(233,30,99,.15)", title: "Full Control in Your Hands", desc: "You set the points ratio, you choose the rewards, you approve everything. Your shop, your rules.", delay: ".1s" },
              { icon: "📊", bg: "rgba(0,188,212,.15)", title: "Insights & Analytics", desc: "See who your best customers are, track spending patterns, and make smarter business decisions.", delay: ".2s" },
            ].map(({ icon, bg, title, desc, delay }) => (
              <div key={title} className="lp-benefit-card reveal" style={{ transitionDelay: delay }}>
                <div className="lp-benefit-icon" style={{ background: bg }}>{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="lp-section" id="who">
        <div className="lp-container">
          <div className="lp-section-label">For Everyone</div>
          <h2 className="lp-section-title">Who Is Inaamify For?</h2>
          <p className="lp-section-sub">Two sides of the same coin — customers love it, sellers benefit from it.</p>
          <div className="lp-who-grid reveal">
            <div className="lp-who-card lp-who-customers">
              <h3>🛍️ For Customers</h3>
              {["Join any shop via QR code or link", "Upload bills and earn reward points", "Track your points in real-time", "Browse and redeem exciting gifts", "Use with multiple shops at once", "Shop at same price — get MORE!"].map(f => (
                <div key={f} className="lp-who-feature"><span className="lp-tick">✓</span> {f}</div>
              ))}
              <div className="lp-free-badge">🎉 100% Free for Customers</div>
            </div>
            <div className="lp-who-card lp-who-sellers">
              <h3>🏪 For Shop Owners</h3>
              {["Set up your custom loyalty program", "Define your own ₹ to points ratio", "Approve bills with 1 click dashboard", "Create and manage your rewards list", "View customer analytics & reports", "Multi-shop management support"].map(f => (
                <div key={f} className="lp-who-feature"><span className="lp-tick">✓</span> {f}</div>
              ))}
              <div className="lp-free-badge">💼 Subscription Plan for Owners</div>
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-SHOP */}
      <section className="lp-section lp-multishop-section">
        <div className="lp-container">
          <div className="lp-multishop-inner reveal">
            <div className="lp-multishop-icon">🏬</div>
            <div>
              <h3>Multi-Shop Support</h3>
              <p>Customers can use Inaamify across multiple shops — each shop has its own separate points system, rewards list, and seller dashboard. Perfect for shop owners running more than one business. Whether you have one kirana store or a chain of outlets, Inaamify scales with you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta-section">
        <div className="lp-container" style={{ textAlign: "center" }}>
          <h2>Ready to Reward Your Customers? 🚀</h2>
          <p>Join Inaamify today — free for customers, powerful for sellers.</p>
          <a href="#" className="lp-btn-dark" onClick={(e) => { e.preventDefault(); navigate("/selection"); }}>Visit www.inaamify.com</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <p>© 2026 Inaamify &nbsp;|&nbsp; <a href="https://www.inaamify.com" target="_blank" rel="noreferrer">www.inaamify.com</a> &nbsp;|&nbsp; Free for Customers &nbsp;|&nbsp; Paid System for Shop Owners</p>
        <p style={{ marginTop: ".4rem", fontSize: ".8rem" }}>Har Kharidari Par Inaam 🎁</p>
      </footer>
    </div>
  );
}
