import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page-container">
      {/* ── NAV ── */}
      <nav className="landing-nav">
        <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="nav-icon" style={{ padding: '0', overflow: 'hidden' }}>
            <img src="/logo.jpeg" alt="L" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span className="nav-brand">Inaam<span>ify</span></span>
        </a>
        <ul className="nav-links">
          <li><a href="#how" onClick={(e) => { e.preventDefault(); scrollToSection('how'); }}>How it Works</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
          <li><a href="#tiers" onClick={(e) => { e.preventDefault(); scrollToSection('tiers'); }}>Tiers</a></li>
          <li><a href="#" className="nav-cta" onClick={(e) => { e.preventDefault(); navigate("/selection"); }}>Sign In</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot"></span>
          India's Smartest Loyalty Rewards App
        </div>

        <h1>
          Shop. Upload. <span className="gold">Earn Inaam.</span>
        </h1>

        <p className="hero-sub">
          Upload your shopping bills, collect reward points automatically, unlock exclusive offers and cashback — every purchase pays back.
        </p>

        <div className="hero-btns">
          <a href="#" className="btn-primary" onClick={(e) => { e.preventDefault(); navigate("/selection"); }}>
            ▶ Get Started Free
          </a>
          <a href="#how" className="btn-outline" onClick={(e) => { e.preventDefault(); scrollToSection('how'); }}>
            How it Works
          </a>
          <a href="#" className="btn-outline" onClick={(e) => { e.preventDefault(); navigate("/selection"); }}>
            Role Selection
          </a>
        </div>

        <div className="hero-stats">
          <div className="hstat">
            <span className="hstat-num">750+</span>
            <span className="hstat-label">Active Members</span>
          </div>
          <div className="hstat">
            <span className="hstat-num">50+</span>
            <span className="hstat-label">Live Offers</span>
          </div>
          <div className="hstat">
            <span className="hstat-num">4</span>
            <span className="hstat-label">Reward Tiers</span>
          </div>
          <div className="hstat">
            <span className="hstat-num">₹0</span>
            <span className="hstat-label">To Join</span>
          </div>
        </div>

        <div className="hero-mockup">
          <div className="mockup-glow"></div>
          <div className="mockup-screen">
            <div className="mock-card">
              <div className="mock-label">Wallet Balance</div>
              <div className="mock-val">₹840</div>
              <div className="mock-sub">+₹120 this week</div>
              <div className="mock-bar"><div className="mock-bar-fill" style={{ width: '68%' }}></div></div>
            </div>
            <div className="mock-card">
              <div className="mock-label">Total Points</div>
              <div className="mock-val">18,450</div>
              <div className="mock-sub">Silver tier · 1,550 to go</div>
              <div className="mock-bar"><div className="mock-bar-fill" style={{ width: '92%' }}></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section how" id="how">
        <div className="how-inner">
          <div className="section-tag">● Simplicity First</div>
          <h2 className="section-title">Rewards in 3 Simple Steps</h2>
          <p className="section-sub" style={{ margin: '0.75rem auto 0' }}>We've automated the boring stuff so you can focus on earning.</p>

          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <h3 className="step-title">Shop Anywhere</h3>
              <p className="step-desc">Shop at your favorite partner stores as you normally do.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <h3 className="step-title">Snap & Upload</h3>
              <p className="step-desc">Take a quick photo of your physical bill through the app.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <h3 className="step-title">Earn Points</h3>
              <p className="step-desc">Points are added to your wallet once the bill is verified.</p>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <h3 className="step-title">Redeem Rewards</h3>
              <p className="step-desc">Exchange points for cashback, coupons, or exclusive gifts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-section features" id="features">
        <div className="features-inner">
          <div className="section-tag">● Features</div>
          <h2 className="section-title">Built for the <span className="gold">Smart Shopper</span></h2>

          <div className="features-grid">
            <div className="feat-card">
              <div className="feat-icon">⚡</div>
              <h3 className="feat-title">Fast Verification</h3>
              <p className="feat-desc">Our admins verify your bills within 24 hours so you get points fast.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🎯</div>
              <h3 className="feat-title">Tiered Rewards</h3>
              <p className="feat-desc">The more you shop, the higher your tier and the better your rewards.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">📈</div>
              <h3 className="feat-title">Detailed Insights</h3>
              <p className="feat-desc">Track your spending and rewards growth with beautiful analytics.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🎁</div>
              <h3 className="feat-title">Instant Redemptions</h3>
              <p className="feat-desc">Redeem your hard-earned points instantly at the store checkout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIERS ── */}
      <section className="landing-section tiers" id="tiers">
        <div className="tiers-inner">
          <div className="section-tag">● Loyalty Tiers</div>
          <h2 className="section-title">Unlock <span className="gold">Premium Benefits</span></h2>

          <div className="tiers-grid">
            <div className="tier-card">
              <div className="tier-badge bronze">Bronze</div>
              <div className="tier-pts">0 - 500</div>
              <p className="tier-pts-label">Points needed</p>
              <ul className="tier-perks">
                <li>Basic Reward Access</li>
                <li>Standard Support</li>
                <li>1x Point Multiplier</li>
              </ul>
            </div>
            <div className="tier-card featured">
              <div className="tier-badge silver">Silver</div>
              <div className="tier-pts">501 - 2000</div>
              <p className="tier-pts-label">Points needed</p>
              <ul className="tier-perks">
                <li>Priority Verification</li>
                <li>5% Extra Cashback</li>
                <li>1.2x Point Multiplier</li>
              </ul>
            </div>
            <div className="tier-card">
              <div className="tier-badge gold">Gold</div>
              <div className="tier-pts">2001+</div>
              <p className="tier-pts-label">Points needed</p>
              <ul className="tier-perks">
                <li>VIP Support</li>
                <li>10% Extra Cashback</li>
                <li>1.5x Point Multiplier</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP SCREENSHOTS ── */}
      <section className="screenshots" id="screenshots">
        <div className="screenshots-inner">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>● See It In Action</div>
            <div className="section-title">Your Rewards, <span style={{ color: 'var(--gold)' }}>Right in Your Hands</span></div>
            <p className="section-sub" style={{ margin: '0.75rem auto 0', maxWidth: '480px' }}>A clean, fast experience built for everyday shoppers — upload bills, track points, and redeem rewards effortlessly.</p>
          </div>
          <div className="screenshots-grid">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <img src="/download.jpg" alt="App Home" />
            </div>
            <div className="phone-frame phone-center">
              <div className="phone-notch"></div>
              <img src="/download (1).jpg" alt="Reward Store" />
            </div>
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <img src="/download (2).jpg" alt="Profile & Settings" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-section cta">
        <div className="cta-inner">
          <div className="cta-box">
            <h2>Ready to start <span>earning?</span></h2>
            <p>Join thousands of users who are turning their shopping bills into real rewards today.</p>
            <div className="store-btns">
              <a href="#" className="store-btn" onClick={(e) => { e.preventDefault(); navigate("/user/register"); }}>
                <div className="store-btn-icon">📱</div>
                <div className="store-btn-text">
                  <small>Download for</small>
                  <span>iOS & Android</span>
                </div>
              </a>
              <a href="#" className="store-btn" onClick={(e) => { e.preventDefault(); navigate("/user/login"); }}>
                <div className="store-btn-icon">✨</div>
                <div className="store-btn-text">
                  <small>Join now</small>
                  <span>User Portal</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-left">
          <div className="footer-logo">
            <div className="footer-icon" style={{ padding: '0', overflow: 'hidden' }}>
              <img src="/logo.jpeg" alt="L" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="footer-brand">Inaam<span>ify</span></span>
          </div>
          <p className="footer-copy">© 2026 Inaamify. All rights reserved.</p>
        </div>
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/privacy-policy"); }}>Privacy Policy</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
