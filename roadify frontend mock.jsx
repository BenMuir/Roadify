import { useState, useEffect, useRef } from "react";

// ─── Animated counter ───
function Counter({ end, duration = 1600, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(eased * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Fade-in on scroll ───
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ ...style, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ${delay}s cubic-bezier(.16,1,.3,1), transform 0.7s ${delay}s cubic-bezier(.16,1,.3,1)` }}>
      {children}
    </div>
  );
}

// ─── Phone mockup showing driver flow ───
function PhoneMockup() {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 3000); return () => clearInterval(t); }, []);
  const screens = [
    { title: "GPS Locked", sub: "Milton Rd, Milton QLD", icon: "◉", color: "#34d399", bg: "#0a3622" },
    { title: "Photo Captured", sub: "CV detected: Dent, Scratch", icon: "📷", color: "#60a5fa", bg: "#172554" },
    { title: "Severity: Medium", sub: "ML classification complete", icon: "⚠", color: "#fbbf24", bg: "#3b2506" },
    { title: "Report Submitted", sub: "INC-2026-0042 created", icon: "✓", color: "#34d399", bg: "#0a3622" },
  ];
  const s = screens[step];
  return (
    <div style={{ width: 280, height: 520, background: "#080e1c", borderRadius: 36, border: "3px solid #1e293b", padding: 12, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05) inset" }}>
      {/* Notch */}
      <div style={{ width: 100, height: 24, background: "#080e1c", borderRadius: "0 0 16px 16px", margin: "0 auto 16px", border: "1px solid #1e293b", borderTop: "none" }} />
      {/* Header */}
      <div style={{ padding: "0 12px 12px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: "#e2e8f0" }}>Report Incident</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569", marginTop: 2 }}>11 Apr 2026, 9:14 AM</div>
      </div>
      {/* Animated screen */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 16 }}>
        <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, animation: "fadeUp .5s ease" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `2px solid ${s.color}30` }}>{s.icon}</div>
          <div style={{ color: s.color, fontFamily: "'Instrument Serif', serif", fontSize: 20, textAlign: "center" }}>{s.title}</div>
          <div style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>{s.sub}</div>
        </div>
      </div>
      {/* Step dots */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", paddingBottom: 8 }}>
        {screens.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? "#3b82f6" : "#1e293b", transition: "all .4s" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard preview ───
function DashboardPreview() {
  const rows = [
    { id: "INC-0041", driver: "M. Webb", sev: "Major", status: "New", time: "08:23" },
    { id: "INC-0040", driver: "S. Chen", sev: "Minor", status: "Reviewed", time: "06:50" },
    { id: "INC-0039", driver: "J. Torres", sev: "Medium", status: "Forwarded", time: "17:12" },
  ];
  const sevC = { Minor: "#34d399", Medium: "#fbbf24", Major: "#f87171" };
  const stC = { New: "#60a5fa", Reviewed: "#fbbf24", Forwarded: "#818cf8" };
  return (
    <div style={{ background: "#080e1c", borderRadius: 16, border: "1px solid #1e293b", padding: 20, width: "100%", maxWidth: 500, boxShadow: "0 40px 80px rgba(0,0,0,.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#e2e8f0" }}>Incident Feed</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569" }}>LIVE</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["Major", 1, "#f87171"], ["Medium", 1, "#fbbf24"], ["Minor", 1, "#34d399"]].map(([l, n, c]) => (
          <div key={l} style={{ flex: 1, background: "#0c1222", borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${c}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#475569", letterSpacing: 1 }}>{l.toUpperCase()}</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: c }}>{n}</div>
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
          <div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}>{r.id}</span>
            <span style={{ color: "#e2e8f0", fontSize: 13, marginLeft: 10 }}>{r.driver}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${sevC[r.sev]}15`, color: sevC[r.sev], fontFamily: "'JetBrains Mono', monospace" }}>{r.sev}</span>
            <span style={{ fontSize: 10, color: stC[r.status], fontFamily: "'JetBrains Mono', monospace" }}>{r.status}</span>
            <span style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{r.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Website() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#050911", color: "#e2e8f0", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%,100% { opacity: .15; } 50% { opacity: .3; } }
        ::selection { background: #2563eb; color: #fff; }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(5,9,17,.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid #ffffff08" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #1e40af, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>⚡</div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#e2e8f0" }}>SmartFleet</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Features", "How It Works", "Architecture", "Contact"].map(s => (
              <a key={s} href={`#${s.toLowerCase().replace(/ /g, "-")}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = "#e2e8f0"}
                onMouseLeave={e => e.target.style.color = "#94a3b8"}
              >{s}</a>
            ))}
            <a href="#contact" style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)", color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: "radial-gradient(circle, #1e40af15 0%, transparent 70%)", borderRadius: "50%", animation: "pulse 6s ease infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(#ffffff06 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 1 }}>
          <div style={{ flex: "1 1 440px", maxWidth: 560 }}>
            <Reveal>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3b82f6", letterSpacing: 2, marginBottom: 16 }}>SMART FLEET INCIDENT REPORTER</div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.1, color: "#f1f5f9", marginBottom: 20, letterSpacing: -1 }}>
                Accidents happen.<br />
                <span style={{ color: "#3b82f6" }}>Chaos shouldn't.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "#94a3b8", fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                A mobile-first platform that turns messy incident reports into structured, GPS-tagged, ML-classified claims packets — in minutes, not days.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="#features" style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)", color: "#fff", padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 32px #1e40af40" }}>See How It Works</a>
                <a href="#contact" style={{ border: "1px solid #1e293b", color: "#94a3b8", padding: "14px 28px", borderRadius: 10, fontSize: 15, textDecoration: "none" }}>Request Demo</a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.3} style={{ flex: "0 0 auto", animation: "float 5s ease-in-out infinite" }}>
            <PhoneMockup />
          </Reveal>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section style={{ borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b", background: "#080e1c" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
          {[
            ["73%", "Faster FNOL", "Compared to paper-based reporting"],
            ["< 4 min", "Average Report Time", "GPS + photos + ML classification"],
            ["99.2%", "Data Completeness", "No missing fields or unclear photos"],
            ["40%", "Lower Claim Costs", "Better evidence, faster resolution"],
          ].map(([val, label, sub], i) => (
            <Reveal key={label} delay={i * 0.1}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: "#3b82f6" }}>{val}</div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, marginTop: 4 }}>{label}</div>
                <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>{sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3b82f6", letterSpacing: 2, marginBottom: 12 }}>CAPABILITIES</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 44px)", color: "#f1f5f9", letterSpacing: -0.5 }}>Everything a fleet needs after impact</h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {[
            { icon: "◉", title: "Auto GPS Capture", desc: "Location is pinned the moment a report starts. No manual entry, no forgotten addresses.", color: "#34d399" },
            { icon: "📷", title: "Timestamped Photos", desc: "Every photo is geo-tagged and timestamped automatically. Uploaded to cloud storage instantly.", color: "#60a5fa" },
            { icon: "🔍", title: "CV Damage Tagging", desc: "Computer vision analyses each photo — dents, scratches, broken lights, glass damage — all tagged automatically.", color: "#a78bfa" },
            { icon: "⚡", title: "ML Severity Classification", desc: "Minor, Medium, or Major — classified in real-time using damage tags, affected areas, and driver notes.", color: "#fbbf24" },
            { icon: "📄", title: "Claims Packet Generation", desc: "A complete FNOL packet (PDF + JSON) is generated automatically with all evidence, ready for the insurer.", color: "#f472b6" },
            { icon: "📊", title: "Fleet Dashboard", desc: "Real-time feed of incidents, map view, severity badges, photo thumbnails, and one-click export to insurers.", color: "#2dd4bf" },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div style={{ background: "#0c1222", border: "1px solid #1e293b", borderRadius: 14, padding: 28, height: "100%", transition: "border-color .2s, transform .2s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16, border: `1px solid ${f.color}20` }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#e2e8f0", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ background: "#080e1c", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3b82f6", letterSpacing: 2, marginBottom: 12 }}>WORKFLOW</div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 44px)", color: "#f1f5f9" }}>From crash to claims packet in four steps</h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, position: "relative" }}>
            {[
              { step: "01", title: "Open the app", desc: "Driver opens the PWA on their phone. GPS and timestamp are captured instantly." },
              { step: "02", title: "Capture evidence", desc: "Take photos of the damage. Computer vision auto-tags each image with damage types." },
              { step: "03", title: "Review & submit", desc: "ML classifies severity. Driver adds notes, reviews everything, and submits." },
              { step: "04", title: "Claims packet sent", desc: "Fleet manager gets a real-time alert. A structured PDF + JSON packet is generated and forwarded." },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.12}>
                <div style={{ position: "relative", padding: 24 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 48, color: "#1e293b", fontWeight: 700, lineHeight: 1, marginBottom: 12 }}>{s.step}</div>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#e2e8f0", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DASHBOARD PREVIEW ═══ */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap", justifyContent: "center" }}>
          <Reveal style={{ flex: "1 1 340px", maxWidth: 440 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3b82f6", letterSpacing: 2, marginBottom: 12 }}>FLEET DASHBOARD</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(26px, 3.5vw, 40px)", color: "#f1f5f9", marginBottom: 16, letterSpacing: -0.5 }}>Every incident,<br />one screen</h2>
            <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
              Fleet managers and claims teams get a real-time view of all incidents — filterable by severity, with photo evidence, damage tags, and one-click export to insurers.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Real-time incident feed with live updates", "Severity badges: green / amber / red", "Photo thumbnails with auto-generated damage tags", "One-click PDF export and insurer forwarding"].map(t => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0a3622", border: "1px solid #166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#34d399", flexShrink: 0, marginTop: 1 }}>✓</div>
                  <span style={{ color: "#cbd5e1", fontSize: 14 }}>{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>

      {/* ═══ ARCHITECTURE ═══ */}
      <section id="architecture" style={{ background: "#080e1c", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3b82f6", letterSpacing: 2, marginBottom: 12 }}>TECHNICAL ARCHITECTURE</div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 44px)", color: "#f1f5f9" }}>Built for scale and reliability</h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { label: "Frontend", items: ["React PWA", "Offline support", "Camera + GPS APIs", "Signed URL uploads"], color: "#60a5fa" },
              { label: "Backend", items: ["Node.js + Express", "Serverless functions", "REST API endpoints", "Packet generation"], color: "#a78bfa" },
              { label: "Storage", items: ["Azure Blob / Firebase", "Firestore / Cosmos DB", "Cloud-native NoSQL", "Auto-scaling"], color: "#34d399" },
              { label: "Intelligence", items: ["TensorFlow.js (local)", "Azure Custom Vision", "Rule-based + ML hybrid", "Edge inference"], color: "#fbbf24" },
            ].map((col, i) => (
              <Reveal key={col.label} delay={i * 0.1}>
                <div style={{ background: "#0c1222", border: "1px solid #1e293b", borderRadius: 14, padding: 24, borderTop: `3px solid ${col.color}` }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: col.color, letterSpacing: 1.5, marginBottom: 16 }}>{col.label.toUpperCase()}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {col.items.map(item => (
                      <div key={item} style={{ color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHO BENEFITS ═══ */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3b82f6", letterSpacing: 2, marginBottom: 12 }}>STAKEHOLDERS</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 44px)", color: "#f1f5f9" }}>Built for everyone in the chain</h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { role: "Drivers", benefit: "Guided, stress-free reporting. No paperwork, no forgotten details.", icon: "🚛" },
            { role: "Fleet Operators", benefit: "Less downtime, faster repairs, clearer liability decisions.", icon: "📋" },
            { role: "Claims Teams", benefit: "Consistent evidence, faster triage, structured data every time.", icon: "⚖️" },
            { role: "Insurers (NTI)", benefit: "Faster FNOL, better evidence quality, lower claim costs.", icon: "🏢" },
            { role: "Repairers", benefit: "Clear damage information to prepare accurate quotes quickly.", icon: "🔧" },
            { role: "Safety & Compliance", benefit: "Rich incident data for audits, training, and risk analysis.", icon: "🛡" },
          ].map((s, i) => (
            <Reveal key={s.role} delay={i * 0.07}>
              <div style={{ background: "#0c1222", border: "1px solid #1e293b", borderRadius: 14, padding: 24, textAlign: "center" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#e2e8f0", marginBottom: 6 }}>{s.role}</div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{s.benefit}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="contact" style={{ background: "#080e1c", borderTop: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 44px)", color: "#f1f5f9", marginBottom: 16 }}>Ready to modernise your fleet's incident reporting?</h2>
            <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
              Get in touch for a demo, pilot program, or technical deep-dive. We'll show you how SmartFleet can cut your FNOL time by 73%.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)", color: "#fff", padding: "16px 36px", borderRadius: 10, fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 8px 32px #1e40af40" }}>Request a Demo</button>
              <button style={{ border: "1px solid #1e293b", background: "none", color: "#94a3b8", padding: "16px 36px", borderRadius: 10, fontSize: 16, cursor: "pointer" }}>View Documentation</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #1e40af, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>⚡</div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#64748b" }}>SmartFleet</span>
          </div>
          <div style={{ color: "#334155", fontSize: 13 }}>© 2026 Smart Fleet Incident Reporter. Built for NTI.</div>
        </div>
      </footer>
    </div>
  );
}
