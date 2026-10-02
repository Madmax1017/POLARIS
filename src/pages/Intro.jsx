import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/logo.png";

/**
 * POLARIS — Polar Operations Command intro
 * -----------------------------------------------------------------------
 * Standalone cinematic entry screen using GLTF 3D model earth.glb.
 * -----------------------------------------------------------------------
 */

const MARKERS = [
  { id: "arctic-01", label: "ARCTIC NODE 01", lat: 84.0, lon: 11.0 },
  { id: "maitri", label: "MAITRI", lat: -70.76, lon: 11.73 },
  { id: "bharati", label: "BHARATI", lat: -69.4, lon: 76.19 },
  { id: "expedition-07", label: "EXPEDITION 07", lat: -75.0, lon: -60.0 },
  { id: "ncpor", label: "NCPOR · HQ", lat: 15.45, lon: 73.8 },
];

export default function PolarisIntro({ onEnter }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const detailRef = useRef(null);

  useEffect(() => {
    const steps = [
      () => setPhase(1), // background + logo
      () => setPhase(2), // globe fades in
      () => setPhase(3), // headline reveals
      () => setPhase(4), // CTA active
    ];
    const timers = steps.map((fn, i) => setTimeout(fn, 220 + i * 380));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      if (onEnter) {
        onEnter();
      } else {
        navigate("/dashboard");
      }
    }, 620);
  }, [onEnter, navigate]);

  const handleExplore = useCallback(() => {
    detailRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={`polaris-root ${exiting ? "is-exiting" : ""}`}>
      <style>{POLARIS_CSS}</style>

      <section className="polaris-hero">
        <div className="polaris-bg" data-phase={phase >= 1 ? "on" : "off"}>
          <div className="polaris-bg-grid" />
          <div className="polaris-bg-vignette" />
          <div className="polaris-bg-stars" />
        </div>

        <nav className="polaris-nav" data-phase={phase >= 1 ? "on" : "off"}>
          <div className="polaris-nav-brand">
            <img src={logoUrl} alt="Polaris Logo" className="polaris-mark" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div>
              <div className="polaris-nav-title">POLARIS</div>
              <div className="polaris-nav-subtitle">NCPOR · POLAR OPERATIONS</div>
            </div>
          </div>
          <div className="polaris-nav-status">
            <div className="polaris-status-row">
              <span className="polaris-status-dot" />
              SAT-LINK ONLINE
            </div>
            <div className="polaris-status-caption">SYSTEM STATUS</div>
          </div>
        </nav>

        <div className="polaris-hero-grid">
          <div className="polaris-hero-copy" data-phase={phase >= 2 ? "on" : "off"}>
            <h1 className="polaris-hero-title polaris-reveal polaris-delay-1">
              POLARIS
            </h1>

            <p className="polaris-hero-desc polaris-reveal polaris-delay-2">
              Unified mission operations for scientific expeditions in the polar environment.
            </p>

            <div className="polaris-cta-row polaris-reveal polaris-delay-3">
              <button className="polaris-cta" onClick={handleEnter}>
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight size={16} className="polaris-cta-arrow" />
              </button>
              <button className="polaris-cta-secondary" onClick={handleExplore}>
                <span>EXPLORE SYSTEM</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="polaris-hero-globe" data-phase={phase >= 2 ? "on" : "off"}>
            <div className="sketchfab-embed-wrapper polaris-sketchfab">
              <iframe
                title="The sky from the center of the earth"
                frameBorder="0"
                allowFullScreen
                mozallowfullscreen="true"
                webkitallowfullscreen="true"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                xr-spatial-tracking="true"
                execution-while-out-of-viewport="true"
                execution-while-not-rendered="true"
                web-share="true"
                src="https://sketchfab.com/models/17cf917d160645b6a57a09c420ed647d/embed?autostart=1&ui_theme=dark&transparent=1&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_controls=0"
              ></iframe>
            </div>

            <div className="polaris-hud polaris-hud-tr">
              <div className="polaris-hud-title">N 82° 14' 52"</div>
              <div className="polaris-hud-sub">ARCTIC OPERATIONS ZONE</div>
            </div>
            <div className="polaris-hud polaris-hud-br">
              <div className="polaris-hud-row">
                <span>SAT-LINK</span>
                <span className="polaris-hud-value polaris-hud-online">
                  <span className="polaris-status-dot small" /> CONNECTED
                </span>
              </div>
              <div className="polaris-hud-row">
                <span>EXPEDITIONS</span>
                <span className="polaris-hud-value">07 ACTIVE</span>
              </div>
              <div className="polaris-hud-row">
                <span>POLAR NODE</span>
                <span className="polaris-hud-value">MAITRI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="polaris-transition-line" />
      </section>

      <section className="polaris-detail" ref={detailRef}>
        <div className="polaris-detail-grid">
          <div className="polaris-detail-card">
            <div className="polaris-detail-index">01</div>
            <h3>Expedition Network</h3>
            <p>
              Live positions, headcounts and mission status across every active
              deployment, from Arctic transects to Antarctic stations.
            </p>
          </div>
          <div className="polaris-detail-card">
            <div className="polaris-detail-index">02</div>
            <h3>Weather Intelligence</h3>
            <p>
              Continuous polar forecasting fused with satellite and ground
              telemetry to flag windows and risk before they close.
            </p>
          </div>
          <div className="polaris-detail-card">
            <div className="polaris-detail-index">03</div>
            <h3>Emergency Response</h3>
            <p>
              A single armed protocol layer connecting personnel, assets and
              command — ready the moment conditions turn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const POLARIS_CSS = `
:root {
  --p-bg-0: #03070B;
  --p-bg-1: #05090D;
  --p-bg-2: #071018;
  --p-primary: #38BDF8;
  --p-arctic: #67E8F9;
  --p-ice: #CFFAFE;
  --p-text: #E6F4FA;
  --p-muted: #718B9A;
  --p-success: #22C55E;
  --p-warning: #F59E0B;
  --p-critical: #F43F5E;
  --p-mono: "SF Mono", "JetBrains Mono", "Consolas", ui-monospace, monospace;
  --p-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.polaris-root {
  background: var(--p-bg-0);
  color: var(--p-text);
  font-family: var(--p-sans);
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  transition: opacity 0.6s ease;
}
.polaris-root.is-exiting { opacity: 0.15; }
.polaris-root * { box-sizing: border-box; }

.polaris-hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding-top: 80px;
  padding-bottom: 20px;
}

.polaris-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 1.2s ease; pointer-events: none; }
.polaris-bg[data-phase="on"] { opacity: 1; }
.polaris-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(103,232,249,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(103,232,249,0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 65% 45%, black 10%, transparent 70%);
}
.polaris-bg-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 68% 45%, rgba(56,189,248,0.08), transparent 55%),
    radial-gradient(ellipse at 50% 100%, var(--p-bg-2), var(--p-bg-0) 60%);
}
.polaris-bg-stars {
  position: absolute; inset: 0;
  background-image: radial-gradient(1px 1px at 20% 30%, rgba(230,244,250,0.5), transparent),
    radial-gradient(1px 1px at 70% 15%, rgba(230,244,250,0.35), transparent),
    radial-gradient(1px 1px at 40% 70%, rgba(230,244,250,0.4), transparent),
    radial-gradient(1px 1px at 85% 60%, rgba(230,244,250,0.3), transparent),
    radial-gradient(1px 1px at 10% 85%, rgba(230,244,250,0.3), transparent);
  background-repeat: no-repeat;
}

.polaris-nav {
  position: absolute; top: 0; left: 0; right: 0; z-index: 20;
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 40px;
  opacity: 0; transform: translateY(-8px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}
.polaris-nav[data-phase="on"] { opacity: 1; transform: translateY(0); }
.polaris-nav-brand { display: flex; align-items: center; gap: 14px; }
.polaris-mark { color: var(--p-arctic); flex-shrink: 0; }
.polaris-nav-title { font-size: 14px; letter-spacing: 0.16em; font-weight: 600; }
.polaris-nav-subtitle { font-size: 10px; letter-spacing: 0.12em; color: var(--p-muted); margin-top: 4px; font-family: var(--p-mono); }
.polaris-nav-status { text-align: right; }
.polaris-status-row {
  display: flex; align-items: center; gap: 8px; justify-content: flex-end;
  font-family: var(--p-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--p-ice);
}
.polaris-status-caption { font-size: 9px; letter-spacing: 0.14em; color: var(--p-muted); margin-top: 4px; }
.polaris-status-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--p-success);
  box-shadow: 0 0 8px var(--p-success);
  animation: polaris-pulse 2.4s ease-in-out infinite;
}
.polaris-status-dot.small { width: 5px; height: 5px; }

.polaris-hero-grid {
  position: relative; z-index: 10;
  display: grid; grid-template-columns: minmax(360px, 48%) 1fr;
  align-items: center;
  padding: 0 40px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

.polaris-hero-copy {
  max-width: 580px;
  padding-right: 20px;
  z-index: 12;
}

.polaris-reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.polaris-hero-copy[data-phase="on"] .polaris-reveal { opacity: 1; transform: translateY(0); }
.polaris-delay-1 { transition-delay: 0.05s; }
.polaris-delay-2 { transition-delay: 0.16s; }
.polaris-delay-3 { transition-delay: 0.30s; }
.polaris-delay-4 { transition-delay: 0.42s; }
.polaris-delay-5 { transition-delay: 0.56s; }
.polaris-delay-6 { transition-delay: 0.74s; }

.polaris-hero-title {
  font-size: clamp(40px, 4.5vw, 60px);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: #FFFFFF;
  margin: 0 0 16px 0;
}

.polaris-hero-desc {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.55;
  color: var(--p-muted);
  max-width: 500px;
  margin: 0 0 32px 0;
  letter-spacing: 0.01em;
}

.polaris-cta-row { display: flex; align-items: center; gap: 14px; margin-bottom: 0; }

.polaris-cta {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--p-ice);
  border: 1px solid var(--p-ice);
  color: #04121A;
  font-family: var(--p-mono); font-size: 11.5px; letter-spacing: 0.1em; font-weight: 600;
  height: 48px; padding: 0 20px; cursor: pointer;
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}
.polaris-cta:hover {
  background: #FFFFFF;
  box-shadow: 0 0 28px rgba(207,250,254,0.35);
  transform: translateY(-1px);
}
.polaris-cta-arrow { transition: transform 0.25s ease; }
.polaris-cta:hover .polaris-cta-arrow { transform: translateX(4px); }

.polaris-cta-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(113,139,154,0.35);
  color: var(--p-muted);
  font-family: var(--p-mono); font-size: 11.5px; letter-spacing: 0.1em;
  height: 48px; padding: 0 18px; cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.polaris-cta-secondary:hover {
  color: var(--p-ice);
  border-color: rgba(103,232,249,0.4);
  background: rgba(255,255,255,0.04);
}

.polaris-boot { font-family: var(--p-mono); max-width: 440px; padding-top: 14px; border-top: 1px solid rgba(113,139,154,0.14); }
.polaris-boot-title { font-size: 9.5px; letter-spacing: 0.12em; color: var(--p-muted); display: flex; gap: 10px; align-items: baseline; margin-bottom: 8px; }
.polaris-boot-sub { color: rgba(113,139,154,0.6); font-size: 9.5px; }
.polaris-boot-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.polaris-boot-list li {
  display: flex; justify-content: space-between; font-size: 10px; letter-spacing: 0.06em;
  color: rgba(113,139,154,0.5); border-bottom: 1px solid rgba(113,139,154,0.08); padding-bottom: 3px;
  transition: color 0.3s ease;
}
.polaris-boot-list li.is-active { color: var(--p-muted); }
.polaris-boot-status.is-online { color: var(--p-success); }
.polaris-boot-status.is-armed { color: var(--p-warning); }

.polaris-hero-globe {
  position: relative;
  height: 580px;
  width: 100%;
  opacity: 0;
  transform: scale(0.94);
  transition: opacity 1.3s ease, transform 1.3s ease;
}
.polaris-hero-globe[data-phase="on"] { opacity: 1; transform: scale(1); }

.polaris-globe-mount { position: absolute; inset: 0; }
.polaris-globe-mount canvas { display: block; width: 100%; height: 100%; cursor: grab; }
.polaris-globe-mount canvas:active { cursor: grabbing; }

.polaris-globe-fallback { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.polaris-fallback-orb {
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(56,189,248,0.35), rgba(5,9,13,0.9) 70%);
  box-shadow: 0 0 60px rgba(56,189,248,0.2);
  animation: polaris-pulse 3s ease-in-out infinite;
}
.polaris-fallback-text { font-family: var(--p-mono); font-size: 10px; letter-spacing: 0.1em; color: var(--p-muted); }

.polaris-marker-label {
  position: absolute; top: 0; left: 0;
  display: flex; align-items: center; gap: 6px;
  font-family: var(--p-mono); font-size: 9.5px; letter-spacing: 0.08em; color: var(--p-ice);
  white-space: nowrap; pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: 0;
  text-shadow: 0 0 8px rgba(3,7,11,0.9);
}
.polaris-marker-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--p-arctic); box-shadow: 0 0 6px var(--p-arctic); }

.polaris-hud {
  position: absolute; padding: 10px 14px;
  background: rgba(5,9,13,0.65); border: 1px solid rgba(103,232,249,0.18);
  backdrop-filter: blur(8px); font-family: var(--p-mono);
  opacity: 0; animation: polaris-fade-in 1s ease forwards;
  pointer-events: none;
  z-index: 15;
}
.polaris-hud-tr { top: 12px; right: 12px; animation-delay: 1.2s; }
.polaris-hud-br { bottom: 12px; right: 12px; display: flex; flex-direction: column; gap: 6px; animation-delay: 1.5s; min-width: 170px; }
.polaris-hud-title { font-size: 9.5px; letter-spacing: 0.1em; color: var(--p-ice); }
.polaris-hud-sub { font-size: 8.5px; letter-spacing: 0.1em; color: var(--p-muted); margin-top: 2px; }
.polaris-hud-row { display: flex; justify-content: space-between; gap: 14px; font-size: 9px; letter-spacing: 0.06em; color: var(--p-muted); }
.polaris-hud-value { color: var(--p-ice); display: flex; align-items: center; gap: 5px; }
.polaris-hud-online { color: var(--p-success); }
.polaris-hud-big { font-size: 24px; color: var(--p-primary); margin-top: 2px; }

.polaris-transition-line {
  position: absolute; top: 50%; left: 0; height: 1px; width: 0;
  background: var(--p-arctic); box-shadow: 0 0 12px var(--p-arctic);
  z-index: 30; transition: width 0.55s cubic-bezier(0.4,0,0.2,1);
}
.is-exiting .polaris-transition-line { width: 100%; }

.polaris-detail {
  background: var(--p-bg-2);
  padding: 80px 40px;
  border-top: 1px solid rgba(103,232,249,0.08);
}
.polaris-detail-grid {
  max-width: 1080px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;
}
.polaris-detail-card { border-top: 1px solid rgba(103,232,249,0.2); padding-top: 20px; }
.polaris-detail-index { font-family: var(--p-mono); font-size: 11px; color: var(--p-primary); margin-bottom: 14px; }
.polaris-detail-card h3 { font-size: 18px; margin: 0 0 10px 0; font-weight: 600; }
.polaris-detail-card p { font-size: 13.5px; line-height: 1.7; color: var(--p-muted); margin: 0; }

@keyframes polaris-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes polaris-fade-in { to { opacity: 1; } }

@media (max-width: 1024px) {
  .polaris-hero { min-height: auto; padding-top: 100px; }
  .polaris-hero-grid { grid-template-columns: 1fr; gap: 32px; }
  .polaris-hero-copy { max-width: 100%; padding-right: 0; }
  .polaris-hero-globe { height: 420px; }
  .polaris-headline { font-size: clamp(32px, 7vw, 52px); }
  .polaris-detail-grid { grid-template-columns: 1fr; gap: 36px; }
}

.sketchfab-embed-wrapper.polaris-sketchfab {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  pointer-events: auto;
}
.polaris-sketchfab iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
}
`;