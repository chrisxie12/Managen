import { useState, useEffect } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  /* ── NAVBAR ── */
  .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 24px; border-bottom: 1px solid transparent; transition: background 0.3s, backdrop-filter 0.3s, border-bottom-color 0.3s; }
  .lp-nav.scrolled { background: rgba(11,15,28,0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom-color: rgba(255,255,255,0.08); }
  .lp-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 68px; }
  .lp-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .lp-nav-mark { width: 34px; height: 34px; background: #D4FF00; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 17px; color: #0B0F1C; flex-shrink: 0; }
  .lp-nav-brand { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 18px; color: #fff; }
  .lp-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
  .lp-nav-links a { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.18s; }
  .lp-nav-links a:hover { color: #fff; }
  .lp-nav-actions { display: flex; align-items: center; gap: 8px; }
  .lp-nav-signin { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 16px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.16); transition: all 0.18s; }
  .lp-nav-signin:hover { color: #fff; border-color: rgba(255,255,255,0.4); }
  .lp-nav-cta { font-size: 14px; font-weight: 700; color: #0B0F1C; text-decoration: none; background: #D4FF00; padding: 9px 20px; border-radius: 100px; transition: all 0.18s; white-space: nowrap; }
  .lp-nav-cta:hover { background: #c4ef00; transform: translateY(-1px); }
  .lp-nav-hamburger { display: none; flex-direction: column; justify-content: center; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
  .lp-nav-hamburger span { display: block; width: 22px; height: 2px; background: rgba(255,255,255,0.8); border-radius: 2px; transition: all 0.2s; }
  .lp-nav-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .lp-nav-hamburger.open span:nth-child(2) { opacity: 0; }
  .lp-nav-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  .lp-mobile-menu { display: none; position: fixed; top: 68px; left: 0; right: 0; background: #0D1220; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 24px 24px; z-index: 99; }
  .lp-mobile-menu.open { display: block; }
  .lp-mobile-links { list-style: none; margin-bottom: 16px; }
  .lp-mobile-links li { border-bottom: 1px solid rgba(255,255,255,0.06); }
  .lp-mobile-links a { display: block; font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.75); text-decoration: none; padding: 13px 0; }
  .lp-mobile-btns { display: flex; flex-direction: column; gap: 10px; }
  .lp-mobile-btns a { text-align: center; padding: 13px; border-radius: 100px; font-weight: 700; font-size: 15px; text-decoration: none; }
  .mb-signin { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.14); }
  .mb-start { background: #D4FF00; color: #0B0F1C; }

  /* ── HERO ── */
  .lp-hero { min-height: 100dvh; background: #0B0F1C; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 24px 80px; text-align: center; position: relative; overflow: hidden; }
  .lp-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 50px 50px; pointer-events: none; }
  .lp-glow { position: absolute; border-radius: 50%; pointer-events: none; }
  .lp-inner { position: relative; z-index: 1; max-width: 820px; display: flex; flex-direction: column; align-items: center; width: 100%; }
  .lp-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 6px 16px; margin-bottom: 28px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.8); }
  .lp-badge-dot { width: 6px; height: 6px; background: #D4FF00; border-radius: 50%; animation: lpPulse 2s infinite; }
  .lp-h1 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(38px, 7vw, 68px); font-weight: 800; color: #fff; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 22px; }
  .lp-lime { color: #D4FF00; }
  .lp-sub { font-size: clamp(16px, 2.2vw, 18px); color: rgba(255,255,255,0.55); max-width: 520px; line-height: 1.7; margin-bottom: 32px; }
  .lp-bullets { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 40px; }
  .lp-bullet { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
  .lp-bullet-dot { width: 7px; height: 7px; background: #D4FF00; border-radius: 50%; flex-shrink: 0; }
  .lp-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 64px; }
  .lp-btn-lime { background: #D4FF00; color: #0B0F1C; border: none; border-radius: 100px; padding: 15px 32px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
  .lp-btn-lime:hover { background: #c4ef00; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(212,255,0,0.35); }
  .lp-btn-ghost { background: transparent; color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.22); border-radius: 100px; padding: 15px 32px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
  .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.5); color: #fff; }

  /* ── APP PREVIEW FRAME ── */
  .lp-preview { position: relative; z-index: 1; width: 100%; max-width: 900px; animation: lpFloat 7s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .lp-preview { animation: none; } }
  .lp-browser { background: #1A1F35; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset; overflow: hidden; }
  .lp-browser-bar { background: #252B44; padding: 11px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .lp-browser-dots { display: flex; gap: 6px; }
  .lp-browser-dot { width: 11px; height: 11px; border-radius: 50%; }
  .lp-browser-url { flex: 1; background: rgba(255,255,255,0.07); border-radius: 6px; padding: 4px 12px; font-size: 12px; color: rgba(255,255,255,0.32); font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em; }
  .lp-browser-body { display: flex; height: 330px; }
  .lp-app-sidebar { width: 54px; background: #0B0F1C; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; align-items: center; padding: 14px 0; gap: 4px; flex-shrink: 0; }
  .lp-app-logo { width: 30px; height: 30px; background: #D4FF00; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 13px; color: #0B0F1C; margin-bottom: 12px; }
  .lp-app-nav { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
  .lp-app-nav.active { background: rgba(212,255,0,0.15); }
  .lp-app-main { flex: 1; background: #F8F9FB; padding: 16px 18px; overflow: hidden; }
  .lp-app-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .lp-app-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #111827; }
  .lp-app-avatar { width: 28px; height: 28px; background: #D4FF00; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #0B0F1C; flex-shrink: 0; }
  .lp-app-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
  .lp-app-card { background: #fff; border-radius: 10px; padding: 11px 10px; border: 1px solid #E5E7EB; }
  .lp-app-lbl { font-size: 8px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .lp-app-val { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; color: #111827; line-height: 1; margin-bottom: 3px; }
  .lp-app-trend { font-size: 9px; color: #15803D; }
  .lp-app-table { background: #fff; border-radius: 10px; border: 1px solid #E5E7EB; overflow: hidden; }
  .lp-app-table-hd { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
  .lp-app-table-title { font-size: 10px; font-weight: 700; color: #374151; }
  .lp-app-table-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid #F9FAFB; }
  .lp-app-table-row:last-child { border-bottom: none; }
  .lp-app-row-name { font-size: 10px; font-weight: 500; color: #374151; }
  .lp-app-chip { font-size: 8px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }
  .lp-app-chip.p { background: rgba(21,128,61,0.1); color: #15803D; }
  .lp-app-chip.a { background: rgba(220,38,38,0.1); color: #DC2626; }
  .lp-app-chip.w { background: rgba(212,255,0,0.2); color: #5a6800; }

  /* ── STATS ── */
  .lp-stats { background: #fff; padding: 52px 24px; border-bottom: 1px solid #E5E7EB; }
  .lp-stats-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; }
  .lp-stat { padding: 0 24px; }
  .lp-stat + .lp-stat { border-left: 1px solid #E5E7EB; }
  .lp-stat-num { font-family: 'Space Grotesk', sans-serif; font-size: clamp(30px, 4vw, 44px); font-weight: 800; color: #0B0F1C; line-height: 1; margin-bottom: 6px; }
  .lp-stat-num em { color: #D4FF00; font-style: normal; }
  .lp-stat-label { font-size: 14px; color: #6B7280; font-weight: 500; line-height: 1.4; }

  /* ── SECTION SHARED ── */
  .lp-section { padding: 96px 24px; }
  .lp-section-label { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #5a6800; background: rgba(212,255,0,0.15); padding: 4px 12px; border-radius: 100px; margin-bottom: 16px; }
  .lp-section-h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px, 5vw, 44px); font-weight: 700; color: #0B0F1C; line-height: 1.12; letter-spacing: -0.02em; margin-bottom: 16px; }
  .lp-section-p { font-size: 17px; color: #6B7280; line-height: 1.7; max-width: 600px; }
  .lp-section-header { text-align: center; margin-bottom: 56px; }

  /* ── PRICING ── */
  .lp-pricing-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; max-width: 1240px; margin: 0 auto; align-items: start; }
  .lp-plan { background: #fff; border: 1px solid #E5E7EB; border-radius: 20px; padding: 28px 22px 24px; position: relative; transition: transform 0.25s, box-shadow 0.25s; }
  .lp-plan:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
  .lp-plan.featured { background: #0B0F1C; border: 2px solid #D4FF00; }
  .lp-popular { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: #D4FF00; color: #0B0F1C; font-size: 10px; font-weight: 800; padding: 4px 14px; border-radius: 100px; white-space: nowrap; letter-spacing: 0.06em; }
  .lp-plan-tier { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; color: #9CA3AF; margin-bottom: 10px; }
  .lp-plan.featured .lp-plan-tier { color: rgba(255,255,255,0.5); }
  .lp-plan-price { display: flex; align-items: baseline; gap: 3px; margin-bottom: 4px; }
  .lp-plan-currency { font-size: 14px; font-weight: 600; color: #9CA3AF; }
  .lp-plan-amount { font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 700; color: #0B0F1C; line-height: 1; }
  .lp-plan.featured .lp-plan-currency { color: rgba(255,255,255,0.45); }
  .lp-plan.featured .lp-plan-amount { color: #fff; }
  .lp-plan-period { font-size: 12px; color: #9CA3AF; margin-bottom: 20px; }
  .lp-plan.featured .lp-plan-period { color: rgba(255,255,255,0.4); }
  .lp-plan-divider { height: 1px; background: #E5E7EB; margin: 20px 0; }
  .lp-plan.featured .lp-plan-divider { background: rgba(255,255,255,0.1); }
  .lp-plan-features { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
  .lp-plan-feature { display: flex; gap: 8px; font-size: 13px; color: #374151; line-height: 1.4; align-items: flex-start; }
  .lp-plan-check { color: #0B4F30; font-weight: 700; flex-shrink: 0; line-height: 1.4; }
  .lp-plan.featured .lp-plan-feature { color: rgba(255,255,255,0.75); }
  .lp-plan.featured .lp-plan-check { color: #D4FF00; }
  .lp-plan-btn { width: 100%; padding: 12px; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.18s; text-decoration: none; display: block; text-align: center; border: none; }
  .lp-plan-btn.ghost { background: #F3F4F6; color: #0B0F1C; }
  .lp-plan-btn.ghost:hover { background: #E5E7EB; }
  .lp-plan-btn.lime { background: #D4FF00; color: #0B0F1C; }
  .lp-plan-btn.lime:hover { background: #c4ef00; }
  .lp-plan-btn.dark { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
  .lp-plan-btn.dark:hover { background: rgba(255,255,255,0.16); }

  /* ── CALCULATOR ── */
  .lp-calc-wrap { max-width: 700px; margin: 0 auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 24px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .lp-calc-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px; }
  .lp-calc-field label { display: block; font-size: 12px; font-weight: 700; color: #6B7280; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
  .lp-calc-field select { width: 100%; padding: 12px 16px; border: 1px solid #E5E7EB; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #0B0F1C; background: #F9FAFB; appearance: none; cursor: pointer; outline: none; transition: border-color 0.2s; }
  .lp-calc-field select:focus { border-color: #D4FF00; box-shadow: 0 0 0 3px rgba(212,255,0,0.15); }
  .lp-calc-result { background: #0B0F1C; border-radius: 16px; padding: 28px 32px; text-align: center; }
  .lp-calc-result-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .lp-calc-result-val { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px, 4vw, 40px); font-weight: 800; color: #D4FF00; line-height: 1; margin-bottom: 8px; }
  .lp-calc-result-sub { font-size: 15px; color: rgba(255,255,255,0.6); }

  /* ── HOW IT WORKS ── */
  .lp-hiw-cards { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
  .lp-hiw-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 24px; overflow: hidden; transition: box-shadow 0.3s, border-color 0.3s; }
  .lp-hiw-card:hover { box-shadow: 0 20px 60px rgba(0,0,0,0.09); border-color: #c4c8d0; }
  .lp-hiw-inner { display: flex; align-items: stretch; }
  .lp-hiw-inner.rev { flex-direction: row-reverse; }
  .lp-hiw-text { flex: 1; padding: 48px 56px; }
  .lp-hiw-num { width: 36px; height: 36px; background: #D4FF00; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; color: #0B0F1C; margin-bottom: 16px; }
  .lp-hiw-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 8px; }
  .lp-hiw-h3 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(22px, 3vw, 30px); font-weight: 700; color: #0B0F1C; line-height: 1.2; margin-bottom: 16px; }
  .lp-hiw-p { font-size: 15px; color: #6B7280; line-height: 1.75; max-width: 420px; }
  .lp-hiw-phone-wrap { min-width: 260px; display: flex; align-items: center; justify-content: center; padding: 40px; background: #F8F9FA; flex-shrink: 0; }
  .lp-mini-phone { width: 158px; background: #0B0F1C; border-radius: 32px; padding: 8px; box-shadow: 0 12px 36px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.07); }
  .lp-mini-island { width: 60px; height: 13px; background: #0B0F1C; border-radius: 13px; margin: 3px auto 0; }
  .lp-mini-screen { background: #fff; border-radius: 25px; overflow: hidden; min-height: 240px; }

  /* ── TESTIMONIALS ── */
  .lp-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
  .lp-testimonial { background: #fff; border: 1px solid #E5E7EB; border-radius: 20px; padding: 32px; transition: box-shadow 0.22s, border-color 0.22s; display: flex; flex-direction: column; }
  .lp-testimonial:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); border-color: #d1d5db; }
  .lp-stars { display: flex; gap: 4px; margin-bottom: 20px; }
  .lp-star { width: 20px; height: 20px; background: #D4FF00; border-radius: 5px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .lp-testimonial-text { font-size: 15px; color: #374151; line-height: 1.75; flex: 1; margin-bottom: 24px; }
  .lp-testimonial-author { display: flex; align-items: center; gap: 12px; }
  .lp-testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; color: #fff; flex-shrink: 0; }
  .lp-testimonial-name { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 2px; }
  .lp-testimonial-role { font-size: 12px; color: #9CA3AF; }

  /* ── TRUST ── */
  .lp-trust-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; max-width: 1000px; margin: 0 auto 48px; }
  .lp-trust-logo { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: box-shadow 0.2s; }
  .lp-trust-logo:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .lp-trust-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .lp-trust-name { font-size: 11px; font-weight: 700; color: #6B7280; text-align: center; }

  /* ── FINAL CTA ── */
  .lp-cta { background: #0B0F1C; padding: 100px 24px; text-align: center; position: relative; overflow: hidden; }
  .lp-cta-glow { position: absolute; border-radius: 50%; pointer-events: none; }
  .lp-cta-inner { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; }
  .lp-cta-pill { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #D4FF00; background: rgba(212,255,0,0.1); padding: 5px 14px; border-radius: 100px; margin-bottom: 24px; }
  .lp-cta-h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(34px, 5.5vw, 58px); font-weight: 800; color: #fff; line-height: 1.06; letter-spacing: -0.03em; margin-bottom: 20px; }
  .lp-cta-h2 span { color: #D4FF00; }
  .lp-cta-sub { font-size: 18px; color: rgba(255,255,255,0.5); line-height: 1.65; margin-bottom: 40px; }
  .lp-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
  .lp-cta-note { font-size: 13px; color: rgba(255,255,255,0.28); }

  /* ── FOOTER ── */
  .lp-footer { background: #060810; border-top: 1px solid rgba(255,255,255,0.06); padding: 64px 32px 40px; }
  .lp-footer-inner { max-width: 1100px; margin: 0 auto; }
  .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .lp-footer-brand-row { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 14px; }
  .lp-footer-mark { width: 34px; height: 34px; background: #D4FF00; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; color: #0B0F1C; flex-shrink: 0; }
  .lp-footer-brandname { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 18px; color: #fff; }
  .lp-footer-tagline { font-size: 14px; color: rgba(255,255,255,0.35); line-height: 1.65; max-width: 240px; margin-bottom: 22px; }
  .lp-footer-social { display: flex; gap: 8px; }
  .lp-footer-slink { width: 36px; height: 36px; border-radius: 9px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09); display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.5); transition: all 0.18s; font-family: 'Space Grotesk', sans-serif; }
  .lp-footer-slink:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .lp-footer-col-title { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 16px; }
  .lp-footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .lp-footer-links a { text-decoration: none; font-size: 14px; color: rgba(255,255,255,0.48); transition: color 0.18s; }
  .lp-footer-links a:hover { color: #fff; }
  .lp-footer-bottom { border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
  .lp-footer-copy { font-size: 13px; color: rgba(255,255,255,0.28); }

  /* ── SCROLL REVEAL ── */
  .reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .reveal.revealed { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1 !important; transform: none !important; transition: none !important; } }

  /* ── KEYFRAMES ── */
  @keyframes lpPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.75); } }
  @keyframes lpFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .lp-pricing-grid { grid-template-columns: repeat(3, 1fr); }
    .lp-trust-grid { grid-template-columns: repeat(3, 1fr); }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .lp-testimonials-grid { grid-template-columns: 1fr 1fr; }
    .lp-app-cards { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .lp-nav-links, .lp-nav-actions { display: none; }
    .lp-nav-hamburger { display: flex; }
    .lp-section { padding: 64px 24px; }
    .lp-hiw-inner, .lp-hiw-inner.rev { flex-direction: column !important; }
    .lp-hiw-text { padding: 28px 24px; }
    .lp-hiw-phone-wrap { padding: 24px; min-width: unset; }
    .lp-pricing-grid { grid-template-columns: 1fr; }
    .lp-calc-row { grid-template-columns: 1fr; }
    .lp-trust-grid { grid-template-columns: repeat(2, 1fr); }
    .lp-testimonials-grid { grid-template-columns: 1fr; }
    .lp-footer-grid { grid-template-columns: 1fr; }
    .lp-footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .lp-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 32px; }
    .lp-stat + .lp-stat { border-left: none; }
    .lp-stat:nth-child(odd) { border-right: 1px solid #E5E7EB; }
    .lp-browser-body { height: 220px; }
    .lp-app-cards { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .lp-actions { flex-direction: column; align-items: center; }
    .lp-calc-wrap { padding: 28px 20px; }
    .lp-cta-btns { flex-direction: column; align-items: center; }
    .lp-preview { display: none; }
  }
`;

// ── Mini phone screens (unchanged) ──────────────────────────────────────────

function MiniPhone({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-mini-phone">
      <div className="lp-mini-island" />
      <div className="lp-mini-screen">{children}</div>
    </div>
  );
}

function AttendanceScreen() {
  const rows = [
    { name: "Kwame A.", present: true },
    { name: "Abena M.", present: true },
    { name: "Kofi B.", present: false },
    { name: "Ama O.", present: true },
  ];
  return (
    <div style={{ padding: 10 }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9CA3AF", marginBottom: 8 }}>
        Attendance — Mon
      </div>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 6px", borderRadius: 6, background: "#F9FAFB", marginBottom: 3 }}>
          <span style={{ fontSize: 8, fontWeight: 600, color: "#0B0F1C" }}>{r.name}</span>
          <span style={{ fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 100, background: r.present ? "rgba(21,128,61,0.1)" : "rgba(220,38,38,0.1)", color: r.present ? "#15803D" : "#DC2626" }}>
            {r.present ? "Present" : "Absent"}
          </span>
        </div>
      ))}
      <div style={{ background: "#D4FF00", borderRadius: 7, textAlign: "center" as const, padding: 5, fontSize: 7.5, fontWeight: 700, color: "#0B0F1C", marginTop: 7 }}>
        3/4 Marked — 75%
      </div>
    </div>
  );
}

function WhatsAppScreen() {
  const msgs = [
    { text: "Kwame was present today at Lincoln Academy", out: false, time: "2:15 PM" },
    { text: "Fee reminder: GHS 250 due Friday", out: true, time: "2:15 PM" },
    { text: "Term 2 report card ready to view", out: false, time: "2:16 PM" },
  ];
  return (
    <div style={{ background: "#ECE5DD", padding: 10, minHeight: 240 }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: "#6B7280", textAlign: "center" as const, marginBottom: 10 }}>WhatsApp Reports</div>
      {msgs.map((m, i) => (
        <div key={i} style={{ background: m.out ? "#DCF8C6" : "#fff", borderRadius: m.out ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "7px 9px", maxWidth: "82%", marginBottom: 6, marginLeft: m.out ? "auto" : 0, fontSize: 7.5, color: "#333", lineHeight: 1.4 }}>
          {m.text}
          <div style={{ fontSize: 6, color: "#9CA3AF", marginTop: 2, textAlign: "right" as const }}>{m.time}</div>
        </div>
      ))}
    </div>
  );
}

function PlanScreen() {
  return (
    <div style={{ padding: 10, minHeight: 240 }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9CA3AF", marginBottom: 8 }}>Your Plan</div>
      <div style={{ background: "#D4FF00", borderRadius: 10, padding: 9, marginBottom: 9 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#0B0F1C" }}>Growth</div>
        <div style={{ fontSize: 7.5, color: "#0B0F1C", opacity: 0.65, marginTop: 2 }}>GHS 499 / month</div>
        <div style={{ fontSize: 8.5, fontWeight: 700, color: "#0B0F1C", marginTop: 3 }}>300 students</div>
      </div>
      {["WhatsApp Reports", "Fee Invoicing", "Exam Scheduling"].map((f) => (
        <div key={f} style={{ fontSize: 7.5, color: "#6B7280", marginBottom: 4 }}>
          <span style={{ color: "#0B4F30", fontWeight: 700 }}>✓ </span>{f}
        </div>
      ))}
      <button style={{ width: "100%", marginTop: 8, padding: 6, borderRadius: 8, fontSize: 8, fontWeight: 700, background: "#0B0F1C", color: "#fff", border: "none", cursor: "pointer" }}>
        Upgrade to Pro
      </button>
    </div>
  );
}

function AnalyticsScreen() {
  const metrics = [
    { label: "Avg Attendance", value: "92%", trend: "↑ +3%", up: true },
    { label: "Fee Collection", value: "88%", trend: "↑ +5%", up: true },
    { label: "Exam Pass Rate", value: "78%", trend: "↓ -2%", up: false },
    { label: "Active Students", value: "297", trend: "↑ +12", up: true },
  ];
  return (
    <div style={{ padding: 10, minHeight: 240 }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9CA3AF", marginBottom: 8 }}>Analytics</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ background: "#F9FAFB", borderRadius: 8, padding: 7 }}>
            <div style={{ fontSize: 7, color: "#6B7280" }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B0F1C", margin: "2px 0 1px" }}>{m.value}</div>
            <div style={{ fontSize: 7, color: m.up ? "#15803D" : "#DC2626" }}>{m.trend}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App dashboard preview (browser frame) ───────────────────────────────────

function AppPreview() {
  const CARDS = [
    { label: "Attendance", val: "94%", trend: "↑ +2%" },
    { label: "Fees Collected", val: "₵48k", trend: "↑ +12%" },
    { label: "Students", val: "312", trend: "↑ +8" },
    { label: "Reports Sent", val: "287", trend: "Today" },
  ];
  const ROWS = [
    { name: "Kwame Asante", chip: "p" as const, label: "Present" },
    { name: "Abena Mensah", chip: "p" as const, label: "Present" },
    { name: "Kofi Boateng", chip: "a" as const, label: "Absent" },
    { name: "Ama Owusu", chip: "w" as const, label: "WhatsApp Sent" },
  ];
  const NAV_ICONS = [
    { active: true, d: "M4 6h16M4 12h16M4 18h10" },
    { active: false, d: "M17 20H7M12 4a4 4 0 100 8 4 4 0 000-8z" },
    { active: false, d: "M8 7V3M16 7V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { active: false, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { active: false, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];
  return (
    <div className="lp-preview">
      <div className="lp-browser">
        <div className="lp-browser-bar">
          <div className="lp-browser-dots">
            <div className="lp-browser-dot" style={{ background: "#FF5F57" }} />
            <div className="lp-browser-dot" style={{ background: "#FFBD2E" }} />
            <div className="lp-browser-dot" style={{ background: "#28CA40" }} />
          </div>
          <div className="lp-browser-url">app.getschoolos.me/dashboard</div>
        </div>
        <div className="lp-browser-body">
          <div className="lp-app-sidebar">
            <div className="lp-app-logo">M</div>
            {NAV_ICONS.map((icon, i) => (
              <div key={i} className={`lp-app-nav${icon.active ? " active" : ""}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={icon.active ? "#D4FF00" : "rgba(255,255,255,0.35)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon.d} />
                </svg>
              </div>
            ))}
          </div>
          <div className="lp-app-main">
            <div className="lp-app-topbar">
              <div className="lp-app-title">Dashboard — Accra Academy</div>
              <div className="lp-app-avatar">AO</div>
            </div>
            <div className="lp-app-cards">
              {CARDS.map((c) => (
                <div key={c.label} className="lp-app-card">
                  <div className="lp-app-lbl">{c.label}</div>
                  <div className="lp-app-val">{c.val}</div>
                  <div className="lp-app-trend">{c.trend}</div>
                </div>
              ))}
            </div>
            <div className="lp-app-table">
              <div className="lp-app-table-hd">
                <span className="lp-app-table-title">Recent Attendance</span>
                <span style={{ fontSize: 9, color: "#9CA3AF" }}>Today, 8:30 AM</span>
              </div>
              {ROWS.map((r) => (
                <div key={r.name} className="lp-app-table-row">
                  <span className="lp-app-row-name">{r.name}</span>
                  <span className={`lp-app-chip ${r.chip}`}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    tier: "Free",
    amount: "₵0",
    period: "Forever free",
    features: ["Up to 50 students", "Basic attendance tracking", "1 teacher account", "Basic reports", "Email support"],
    btnClass: "ghost",
    btnLabel: "Get Started Free",
    href: "/app/auth/signup",
    featured: false,
  },
  {
    tier: "Starter",
    currency: "GHS",
    amount: "199",
    period: "/month · up to 100 students",
    features: ["Up to 100 students", "Full attendance system", "5 teacher accounts", "Fee management", "Basic WhatsApp reports"],
    btnClass: "ghost",
    btnLabel: "Start Starter",
    href: "/app/auth/signup",
    featured: false,
  },
  {
    tier: "Growth",
    currency: "GHS",
    amount: "499",
    period: "/month · up to 300 students",
    features: ["Up to 300 students", "Unlimited teacher accounts", "Full WhatsApp reports", "Fee invoicing & MoMo", "Exam scheduling & analytics"],
    btnClass: "lime",
    btnLabel: "Start Growth Plan",
    href: "/app/auth/signup",
    featured: true,
  },
  {
    tier: "Pro",
    currency: "GHS",
    amount: "999",
    period: "/month · up to 1,000 students",
    features: ["Up to 1,000 students", "Multi-campus support", "Custom report templates", "Priority support & API", "WAEC results import"],
    btnClass: "ghost",
    btnLabel: "Start Pro",
    href: "/app/auth/signup",
    featured: false,
  },
  {
    tier: "Enterprise",
    amount: "Custom",
    period: "Tailored for your district",
    features: ["Unlimited students", "District-wide rollout", "Dedicated account manager", "Custom integrations", "SLA guarantee & on-site training"],
    btnClass: "dark",
    btnLabel: "Contact Sales",
    href: "mailto:hello@getschoolos.me",
    featured: false,
  },
];

const FEATURES = [
  {
    eyebrow: "Dashboard",
    title: "One Dashboard, Every Department",
    text: "Attendance, fees, exams, reports — all in one place. Your whole school runs from a single screen. No switching apps, no chasing data.",
    screen: <AttendanceScreen />,
    rev: false,
  },
  {
    eyebrow: "WhatsApp Reports",
    title: "Seamless Parent Communication",
    text: "Now live across Ghana. Send attendance, fee reminders, and report cards to every parent automatically. No manual work, no missed updates — ever.",
    screen: <WhatsAppScreen />,
    rev: true,
  },
  {
    eyebrow: "Flexible Plans",
    title: "Upgrade or Pause — Whenever You Want",
    text: "Need more features? Upgrade in a tap. Growing? Add students instantly. Not using it? Pause your plan and resume later — your data never expires.",
    screen: <PlanScreen />,
    rev: false,
  },
  {
    eyebrow: "Analytics",
    title: "Real-Time School Insights",
    text: "Track attendance trends, fee collection rates, and academic performance from one dashboard. Export reports, identify issues, celebrate wins.",
    screen: <AnalyticsScreen />,
    rev: true,
  },
];

const TRUST_LOGOS = [
  { abbr: "GE", name: "Ghana Education Service", bg: "#006B3F" },
  { abbr: "W", name: "WAEC", bg: "#1A3055" },
  { abbr: "P", name: "Paystack", bg: "#011B33" },
  { abbr: "M", name: "MTN MoMo", bg: "#FFCC00", color: "#333" },
  { abbr: "W", name: "WhatsApp", bg: "#25D366" },
  { abbr: "N", name: "NaCCA", bg: "#003893" },
];

const TESTIMONIALS = [
  {
    text: "Finally, a school management system that understands how Ghanaian schools actually work. The WhatsApp integration alone saves me two hours every Monday.",
    name: "Adjoa Owusu",
    role: "Head Teacher · Accra Academy Primary",
    initials: "AO",
    bg: "#0B4F30",
  },
  {
    text: "Fee collection used to be a nightmare — chasing parents, keeping paper ledgers. Now MoMo payments come in automatically and the bursar report is one click.",
    name: "Kwabena Mensah",
    role: "Bursar · St. Joseph's JHS, Kumasi",
    initials: "KM",
    bg: "#003893",
  },
  {
    text: "We set it up in an afternoon. Three weeks later, every teacher is using it and parents are getting attendance updates in real time. I wish we'd had this years ago.",
    name: "Abena Asante",
    role: "Principal · Cape Coast Academy",
    initials: "AA",
    bg: "#1A3055",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcSavings(students: number, campuses: number): number {
  const base = students <= 100 ? 3 : students <= 300 ? 6 : students <= 600 ? 10 : 16;
  return base * campuses;
}

function recommendedPlan(students: number): string {
  if (students <= 50) return "Free";
  if (students <= 100) return "Starter";
  if (students <= 300) return "Growth";
  if (students <= 1000) return "Pro";
  return "Enterprise";
}

// ── Main component ────────────────────────────────────────────────────────────

export function LandingPage() {
  const [calcStudents, setCalcStudents] = useState(100);
  const [calcCampuses, setCalcCampuses] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const savings = calcSavings(calcStudents, calcCampuses);
  const recommended = recommendedPlan(calcStudents);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff" }}>
      <style>{S}</style>

      {/* ── NAVBAR ── */}
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`} aria-label="Main navigation">
        <div className="lp-nav-inner">
          <a className="lp-nav-logo" href="/">
            <div className="lp-nav-mark" aria-hidden="true">M</div>
            <span className="lp-nav-brand">Managen</span>
          </a>
          <ul className="lp-nav-links" role="list">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#trust">About</a></li>
          </ul>
          <div className="lp-nav-actions">
            <a className="lp-nav-signin" href="/app/auth/signin">Sign in</a>
            <a className="lp-nav-cta" href="/app/auth/signup">Start Free</a>
          </div>
          <button
            className={`lp-nav-hamburger${menuOpen ? " open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`lp-mobile-menu${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
        <ul className="lp-mobile-links" role="list">
          <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
          <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
          <li><a href="#trust" onClick={() => setMenuOpen(false)}>About</a></li>
        </ul>
        <div className="lp-mobile-btns">
          <a className="mb-signin" href="/app/auth/signin">Sign in</a>
          <a className="mb-start" href="/app/auth/signup">Start Free — No credit card</a>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="lp-hero" id="home">
        <div className="lp-grid" aria-hidden="true" />
        <div className="lp-glow" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(212,255,0,0.09) 0%, transparent 70%)", top: -200, left: -150 }} aria-hidden="true" />
        <div className="lp-glow" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(11,79,48,0.14) 0%, transparent 70%)", bottom: -150, right: -100 }} aria-hidden="true" />
        <div className="lp-inner">
          <div className="lp-badge">
            <div className="lp-badge-dot" aria-hidden="true" />
            Now live across Ghana &amp; West Africa
          </div>
          <h1 className="lp-h1">
            Run Your School<br />
            <span className="lp-lime">Without</span> the Paperwork
          </h1>
          <p className="lp-sub">
            The all-in-one platform for Ghanaian schools. Attendance, fees, WhatsApp reports — all automated.
          </p>
          <div className="lp-bullets" role="list">
            <div className="lp-bullet" role="listitem"><div className="lp-bullet-dot" aria-hidden="true" />Attendance in 30 Seconds</div>
            <div className="lp-bullet" role="listitem"><div className="lp-bullet-dot" aria-hidden="true" />Fees via MoMo, Automatically</div>
            <div className="lp-bullet" role="listitem"><div className="lp-bullet-dot" aria-hidden="true" />WhatsApp Reports to Every Parent</div>
          </div>
          <div className="lp-actions">
            <a className="lp-btn-lime" href="/app/auth/signup">Start Free Trial</a>
            <a className="lp-btn-ghost" href="#features">See How It Works</a>
          </div>
          <AppPreview />
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="lp-stats">
        <div className="lp-stats-inner">
          <div className="lp-stat reveal">
            <div className="lp-stat-num">230<em>+</em></div>
            <div className="lp-stat-label">Schools onboarded</div>
          </div>
          <div className="lp-stat reveal">
            <div className="lp-stat-num">45<em>k+</em></div>
            <div className="lp-stat-label">Students managed</div>
          </div>
          <div className="lp-stat reveal">
            <div className="lp-stat-num">2<em>M+</em></div>
            <div className="lp-stat-label">WhatsApp reports sent</div>
          </div>
          <div className="lp-stat reveal">
            <div className="lp-stat-num">₵12<em>M+</em></div>
            <div className="lp-stat-label">In fees processed</div>
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <section className="lp-section" id="pricing" style={{ background: "#fff" }}>
        <div className="lp-section-header reveal">
          <span className="lp-section-label">Pricing</span>
          <h2 className="lp-section-h2">Choose Your Plan</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>
            Start free. Add features. Scale up. No commitments, no overpaying.
          </p>
        </div>
        <div className="lp-pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.tier} className={`lp-plan reveal${plan.featured ? " featured" : ""}`}>
              {plan.featured && <div className="lp-popular">★ MOST POPULAR</div>}
              <div className="lp-plan-tier">{plan.tier}</div>
              <div className="lp-plan-price">
                {plan.currency && <span className="lp-plan-currency">{plan.currency}</span>}
                <span
                  className="lp-plan-amount"
                  style={!plan.currency ? { fontSize: plan.amount === "Custom" ? 26 : 30, color: plan.featured ? "#fff" : "#9CA3AF" } : {}}
                >
                  {plan.amount}
                </span>
              </div>
              <div className="lp-plan-period">{plan.period}</div>
              <div className="lp-plan-divider" />
              <ul className="lp-plan-features">
                {plan.features.map((f) => (
                  <li key={f} className="lp-plan-feature">
                    <span className="lp-plan-check" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a className={`lp-plan-btn ${plan.btnClass}`} href={plan.href}>
                {plan.btnLabel}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section className="lp-section" style={{ background: "#F5F5F4" }}>
        <div className="lp-section-header reveal">
          <span className="lp-section-label">Time Savings</span>
          <h2 className="lp-section-h2">See how much time you could save</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>
            Schools using Managen report saving hours every week on admin work.
          </p>
        </div>
        <div className="lp-calc-wrap reveal">
          <div className="lp-calc-row">
            <div className="lp-calc-field">
              <label htmlFor="calc-students">How many students?</label>
              <select id="calc-students" value={calcStudents} onChange={(e) => setCalcStudents(Number(e.target.value))}>
                <option value={50}>Up to 50</option>
                <option value={100}>Up to 100</option>
                <option value={300}>Up to 300</option>
                <option value={600}>Up to 600</option>
                <option value={1000}>Up to 1,000</option>
                <option value={2000}>1,000+</option>
              </select>
            </div>
            <div className="lp-calc-field">
              <label htmlFor="calc-campuses">How many campuses?</label>
              <select id="calc-campuses" value={calcCampuses} onChange={(e) => setCalcCampuses(Number(e.target.value))}>
                <option value={1}>1 campus</option>
                <option value={2}>2 campuses</option>
                <option value={3}>3 campuses</option>
                <option value={5}>5+ campuses</option>
              </select>
            </div>
            <div className="lp-calc-field">
              <label htmlFor="calc-plan">Recommended plan</label>
              <select
                id="calc-plan"
                disabled
                value={recommended}
                style={{ background: "rgba(212,255,0,0.08)", borderColor: "#D4FF00", color: "#0B4F30", fontWeight: 700 }}
              >
                <option>{recommended}</option>
              </select>
            </div>
          </div>
          <div className="lp-calc-result" aria-live="polite">
            <div className="lp-calc-result-label">You could save</div>
            <div className="lp-calc-result-val">{savings} hours</div>
            <div className="lp-calc-result-sub">per week on admin work</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" id="features" style={{ background: "#fff" }}>
        <div className="lp-section-header reveal">
          <span className="lp-section-label">How It Works</span>
          <h2 className="lp-section-h2">Set up in 10 minutes. Run for years.</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>
            No spreadsheets. No paper registers. Add your school once — everything else runs automatically.
          </p>
        </div>
        <div className="lp-hiw-cards">
          {FEATURES.map((feat, i) => (
            <div key={feat.eyebrow} className="lp-hiw-card reveal">
              <div className={`lp-hiw-inner${feat.rev ? " rev" : ""}`}>
                <div className="lp-hiw-text">
                  <div className="lp-hiw-num" aria-hidden="true">{i + 1}</div>
                  <div className="lp-hiw-eyebrow">{feat.eyebrow}</div>
                  <h3 className="lp-hiw-h3">{feat.title}</h3>
                  <p className="lp-hiw-p">{feat.text}</p>
                </div>
                <div className="lp-hiw-phone-wrap" aria-hidden="true">
                  <MiniPhone>{feat.screen}</MiniPhone>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section" style={{ background: "#F5F5F4" }}>
        <div className="lp-section-header reveal">
          <span className="lp-section-label">Testimonials</span>
          <h2 className="lp-section-h2">Trusted by educators across Ghana</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>
            Headmasters, bursars, and teachers from Accra to Kumasi to Cape Coast use Managen every day.
          </p>
        </div>
        <div className="lp-testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="lp-testimonial reveal">
              <div className="lp-stars" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="lp-star" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="#5a6800">
                      <path d="M6 1l1.4 2.8 3.1.45-2.25 2.2.53 3.1L6 8.1 3.22 9.55l.53-3.1L1.5 4.25l3.1-.45z" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="lp-testimonial-text">"{t.text}"</p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar" style={{ background: t.bg }} aria-hidden="true">{t.initials}</div>
                <div>
                  <div className="lp-testimonial-name">{t.name}</div>
                  <div className="lp-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="lp-section" id="trust" style={{ background: "#fff" }}>
        <div className="lp-section-header reveal">
          <span className="lp-section-label">Built For Ghana</span>
          <h2 className="lp-section-h2">Built with input from Ghanaian educators</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>
            We spent months interviewing headmasters, bursars, and teachers across Accra, Kumasi, and Cape Coast.
          </p>
        </div>
        <div className="lp-trust-grid">
          {TRUST_LOGOS.map((logo, i) => (
            <div key={i} className="lp-trust-logo reveal">
              <div className="lp-trust-icon" style={{ background: logo.bg, color: logo.color ?? "#fff" }}>{logo.abbr}</div>
              <div className="lp-trust-name">{logo.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-glow" style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(212,255,0,0.08) 0%, transparent 65%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} aria-hidden="true" />
        <div className="lp-cta-inner reveal">
          <div className="lp-cta-pill">Get Started Today</div>
          <h2 className="lp-cta-h2">Ready to ditch<br />the <span>paperwork?</span></h2>
          <p className="lp-cta-sub">
            Join 230+ schools already running smarter with Managen. Set up takes 10 minutes.
          </p>
          <div className="lp-cta-btns">
            <a className="lp-btn-lime" href="/app/auth/signup">Start Free — No credit card</a>
            <a className="lp-btn-ghost" href="mailto:hello@getschoolos.me">Talk to Sales</a>
          </div>
          <p className="lp-cta-note">Free plan available. Upgrade anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            <div>
              <a className="lp-footer-brand-row" href="/">
                <div className="lp-footer-mark" aria-hidden="true">M</div>
                <span className="lp-footer-brandname">Managen</span>
              </a>
              <p className="lp-footer-tagline">
                The school management platform built for Africa. Attendance, fees, and parent communication — all in one place.
              </p>
              <div className="lp-footer-social" aria-label="Social links">
                <a className="lp-footer-slink" href="#" aria-label="Twitter">X</a>
                <a className="lp-footer-slink" href="#" aria-label="LinkedIn">in</a>
                <a className="lp-footer-slink" href="#" aria-label="WhatsApp">W</a>
              </div>
            </div>
            <div>
              <div className="lp-footer-col-title">Product</div>
              <ul className="lp-footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Resources</div>
              <ul className="lp-footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Company</div>
              <ul className="lp-footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span className="lp-footer-copy">© 2026 Managen. All rights reserved.</span>
            <span className="lp-footer-copy">Built in Ghana</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
