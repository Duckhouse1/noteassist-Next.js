"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {

  /* ── Scroll reveal ─────────────────────────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Active nav highlight ───────────────────────────── */
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav a");
    const onScroll = () => {
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= (s as HTMLElement).offsetTop - 100)
          current = s.id;
      });
      navLinks.forEach((a) => {
        (a as HTMLElement).style.color =
          a.getAttribute("href") === `#${current}` ? "var(--ink)" : "";
      });
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:           #f2f0eb;
          --bg-deep:      #DEDAD4;
          --surface:      #F0EDE8;
          --surface-hi:   #F8F6F3;
          --border:       #CBC6BD;
          --border-hi:    #B8B2A8;

          --ink:          #1A1512;
          --ink2:         #4A433C;
          --ink3:         #8C857C;

          --brown:        #3B1F0A;
          --brown-mid:    #6B3A1E;
          --brown-glow:   rgba(59,31,10,0.12);
          --brown-tint:   #F5EDE5;

          --radius: 16px;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        body::after {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none; z-index: 999;
          opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes scan {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        @keyframes wordFade {
          0%       { opacity: 0; transform: translateY(8px); }
          8%       { opacity: 1; transform: translateY(0); }
          25%      { opacity: 1; transform: translateY(0); }
          33%      { opacity: 0; transform: translateY(-10px); }
          100%     { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes orb {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(30px,-20px) scale(1.05); }
          66%     { transform: translate(-20px,15px) scale(.97); }
        }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
        }
        .reveal.in { opacity: 1; transform: translateY(0); }

        /* ── Layout ── */
        .wrap { max-width: 1380px; margin: 0 auto; padding: 0 32px; }

        /* ── Tags ── */
        .label-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-mono), 'Space Mono', monospace;
          font-size: 10px; letter-spacing: .08em; text-transform: uppercase;
          color: var(--brown-mid);
          background: var(--brown-tint); border: 1px solid rgba(59,31,10,.15);
          padding: 5px 13px; border-radius: 100px;
        }
        .label-tag::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--brown-mid); }

        .tag-outline {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-mono), 'Space Mono', monospace;
          font-size: 10px; letter-spacing: .05em;
          color: var(--ink3); border: 1px solid var(--border);
          padding: 4px 11px; border-radius: 100px;
          transition: border-color .2s, color .2s;
        }

        /* ── Header ── */
        header {
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: blur(24px) saturate(1.4);
          background: rgba(232,229,224,.82);
          border-bottom: 1px solid var(--border);
          animation: fadeIn .5s ease both;
        }
        .nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 60px;
        }
        .logo {
          font-family: var(--font-cormorant), 'Cormorant', Georgia, serif;
          font-size: 26px; font-weight: 400;
          color: var(--ink); text-decoration: none; letter-spacing: .02em;
        }
        .logo-accent { color: var(--brown); }

        nav { display: flex; align-items: center; gap: 32px; }
        nav a {
          font-size: 13px; font-weight: 500; color: var(--ink3);
          text-decoration: none; letter-spacing: .03em; transition: color .2s;
        }
        nav a:hover { color: var(--ink); }

        .nav-btns { display: flex; align-items: center; gap: 8px; }
        .btn-ghost {
          font-size: 13px; font-weight: 500; color: var(--ink2);
          padding: 8px 18px; border-radius: 100px;
          border: 1px solid var(--border); text-decoration: none;
          transition: border-color .2s, color .2s;
        }
        .btn-ghost:hover { border-color: var(--brown-mid); color: var(--brown); }
        .btn-fill {
          font-size: 13px; font-weight: 600;
          background: var(--brown); color: #F5EDE5;
          padding: 9px 20px; border-radius: 100px;
          text-decoration: none; letter-spacing: .02em;
          transition: opacity .2s, transform .2s;
          box-shadow: 0 2px 12px var(--brown-glow);
        }
        .btn-fill:hover { opacity: .88; transform: translateY(-1px); }

        /* ══ HERO ══════════════════════════════════════════ */
        .hero-wrap {
          position: relative; overflow: hidden;
          min-height: calc(100vh - 60px);
          display: flex; flex-direction: column;
        }

        /* ambient orbs */
        .hero-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
          animation: orb 18s ease-in-out infinite;
        }
        .hero-orb-1 {
          width: 560px; height: 560px;
          background: radial-gradient(circle, rgba(107,58,30,.13) 0%, transparent 70%);
          top: -100px; left: -80px;
          animation-delay: 0s;
        }
        .hero-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,31,10,.09) 0%, transparent 70%);
          bottom: 40px; right: 60px;
          animation-delay: -6s;
        }

        .hero-scanline {
          position: absolute; left: 0; right: 0; height: 1px; z-index: 2;
          background: linear-gradient(90deg, transparent, rgba(107,58,30,.18), transparent);
          animation: scan 10s linear infinite;
          pointer-events: none;
        }

        .hero {
          position: relative; z-index: 3;
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 96px 0 80px;
          text-align: center;
        }

        .hero-inner {
          max-width: 720px;
          display: flex; flex-direction: column; align-items: center;
        }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 40px;
          animation: fadeUp .5s .05s ease both;
        }
        .hero-eyebrow-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--brown-mid); }
        .hero-eyebrow-text {
          font-family: var(--font-mono), 'Space Mono', monospace;
          font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase;
          color: var(--brown-mid);
        }

        .hero h1 {
          font-family: var(--font-cormorant), 'Cormorant', Georgia, serif;
          font-size: clamp(52px, 7.5vw, 88px);
          font-weight: 400; line-height: 1.02; letter-spacing: -.015em;
          animation: fadeUp .6s .15s ease both;
        }

        /* cycling word */
        .hero-word-wrap {
          display: inline-block; position: relative;
          min-width: 320px;
        }
        .hero-word-ghost {
          font-style: italic; visibility: hidden;
          background: linear-gradient(90deg, var(--brown), var(--brown-mid));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-word {
          position: absolute; left: 0; right: 0;
          font-style: italic;
          background: linear-gradient(100deg, var(--brown) 0%, var(--brown-mid) 60%, #A0622A 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: wordFade 9s ease infinite, shimmer 4s 1s linear infinite;
          animation-fill-mode: backwards;
          opacity: 0;
          white-space: nowrap;
        }
        .hero-word:nth-child(2) { animation-delay: 3s, 1s; }
        .hero-word:nth-child(3) { animation-delay: 6s, 1s; }

        .hero-sub {
          margin-top: 28px; font-size: 16px; line-height: 1.75; color: var(--ink2);
          max-width: 460px; animation: fadeUp .6s .3s ease both;
        }

        .hero-actions {
          display: flex; gap: 10px; margin-top: 38px; flex-wrap: wrap; justify-content: center;
          animation: fadeUp .6s .4s ease both;
        }
        .btn-hero-primary {
          font-size: 14px; font-weight: 600;
          background: var(--brown); color: #F5EDE5;
          padding: 14px 34px; border-radius: 100px;
          text-decoration: none; letter-spacing: .02em;
          transition: opacity .2s, transform .2s;
          box-shadow: 0 4px 28px var(--brown-glow);
          display: inline-block;
        }
        .btn-hero-primary:hover { opacity: .88; transform: translateY(-2px); }
        .btn-hero-secondary {
          font-size: 14px; font-weight: 500; color: var(--ink2);
          padding: 14px 26px; border-radius: 100px;
          border: 1px solid var(--border); text-decoration: none;
          transition: border-color .2s, color .2s, transform .2s;
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(240,237,232,.6);
        }
        .btn-hero-secondary:hover { border-color: var(--brown-mid); color: var(--brown); transform: translateY(-2px); }

        /* thin rule */
        .hero-rule {
          width: 1px; height: 48px; background: var(--border-hi);
          margin: 44px auto 0; opacity: .5;
          animation: fadeIn 1s .7s ease both;
        }

        /* integration badges in hero */
        .hero-badges-strip {
          display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
          margin-top: 44px;
          animation: fadeUp .6s .5s ease both;
        }

        /* ── Integration strip ── */
        .strip {
          position: relative; z-index: 3;
          border-top: 1px solid rgba(203,198,189,.6);
          padding: 26px 0;
          background: rgba(232,229,224,.85); backdrop-filter: blur(12px);
        }
        .strip-inner { display: flex; align-items: center; gap: 28px; }
        .strip-label {
          font-family: var(--font-mono), monospace; font-size: 9.5px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase; color: var(--ink3);
          white-space: nowrap; flex-shrink: 0;
        }
        .strip-divider { width: 1px; height: 24px; background: var(--border); flex-shrink: 0; }
        .strip-logos { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .int-pill {
          display: flex; align-items: center; gap: 7px;
          border: 1px solid var(--border); border-radius: 100px;
          padding: 5px 13px 5px 7px; background: var(--surface);
          transition: border-color .2s, background .2s, box-shadow .2s; cursor: default;
        }
        .int-pill:hover { border-color: var(--brown-mid); background: var(--surface-hi); box-shadow: 0 2px 12px var(--brown-glow); }
        .int-pill-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .int-pill-label { font-size: 11.5px; font-weight: 500; color: var(--ink2); }

        /* ── Section headers ── */
        .section-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .eyebrow-line { width: 32px; height: 1px; background: var(--brown-mid); opacity: .5; }
        .section-header { margin-bottom: 52px; }
        .section-header h2 {
          font-family: var(--font-cormorant), 'Cormorant', Georgia, serif;
          font-size: clamp(32px, 3.8vw, 46px);
          font-weight: 400; letter-spacing: -.01em; line-height: 1.1; margin-top: 12px;
        }
        .section-header p { font-size: 15px; color: var(--ink2); margin-top: 14px; max-width: 480px; line-height: 1.75; }

        /* ── How it works ── */
        .how { padding: 96px 0; }
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 24px; }
        .step-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 30px 28px;
          position: relative; overflow: hidden;
          transition: border-color .3s, box-shadow .3s;
        }
        .step-card:hover { border-color: var(--brown-mid); box-shadow: 0 8px 32px var(--brown-glow); }
        .step-card::after {
          content: attr(data-n);
          font-family: var(--font-cormorant), 'Cormorant', Georgia, serif;
          font-size: 100px; font-weight: 300;
          color: rgba(203,198,189,.5);
          position: absolute; bottom: -20px; right: 14px;
          line-height: 1; pointer-events: none; transition: color .3s;
        }
        .step-card:hover::after { color: rgba(107,58,30,.12); }
        .step-num {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--brown); color: #F5EDE5;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono), monospace; font-size: 12px; font-weight: 700;
          margin-bottom: 18px; box-shadow: 0 4px 14px var(--brown-glow);
        }
        .step-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 9px; color: var(--ink); }
        .step-card p  { font-size: 13.5px; color: var(--ink2); line-height: 1.7; max-width: 270px; }

        .mapping-strip {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 28px;
          display: grid; grid-template-columns: 1fr 1px 1fr 1px 1fr;
        }
        .mapping-col { padding: 0 28px; }
        .mapping-col:first-child { padding-left: 0; }
        .mapping-col:last-child  { padding-right: 0; }
        .mapping-divider { background: var(--border); align-self: stretch; }
        .mapping-col-label {
          font-family: var(--font-mono), monospace; font-size: 9.5px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase; color: var(--brown-mid); margin-bottom: 11px;
        }
        .mapping-col-content { font-size: 13px; color: var(--ink2); line-height: 1.65; }

        /* ── Integrations ── */
        .integrations { padding: 96px 0; background: var(--bg-deep); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .integration-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .int-card {
          border: 1px solid var(--border); border-radius: var(--radius);
          padding: 24px; display: flex; align-items: flex-start; gap: 16px;
          background: var(--surface); transition: border-color .25s, box-shadow .25s, transform .25s;
        }
        .int-card:hover { border-color: var(--brown-mid); box-shadow: 0 6px 24px var(--brown-glow); transform: translateY(-2px); }
        .int-icon {
          width: 44px; height: 44px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--surface-hi);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono), monospace; font-size: 11px; font-weight: 700;
          flex-shrink: 0; color: var(--brown);
        }
        .int-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--ink); }
        .int-desc { font-size: 13px; color: var(--ink2); line-height: 1.55; }
        .int-oauth {
          margin-top: 10px; display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-mono), monospace; font-size: 9.5px; color: var(--brown-mid); letter-spacing: .04em;
        }
        .int-oauth::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: var(--brown-mid); }
        .int-note {
          border: 1px solid var(--border); border-radius: var(--radius);
          padding: 24px 28px; margin-top: 14px; background: var(--surface);
          font-size: 14px; color: var(--ink2); line-height: 1.75;
          border-left: 3px solid var(--brown-mid);
        }

        /* ── Pricing ── */
        .pricing { padding: 96px 0; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .plan {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 30px 28px;
          transition: border-color .25s, box-shadow .25s;
        }
        .plan:hover { border-color: var(--border-hi); box-shadow: 0 4px 20px rgba(26,21,18,.06); }
        .plan.featured {
          background: var(--brown); border-color: var(--brown);
          color: rgba(245,237,229,.9);
          box-shadow: 0 8px 40px var(--brown-glow), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .plan.featured:hover { box-shadow: 0 12px 48px rgba(59,31,10,.25); }
        .plan-name { font-family: var(--font-mono), monospace; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        .plan-tagline { font-size: 12.5px; opacity: .65; margin-top: 3px; }
        .plan-badge {
          float: right; font-family: var(--font-mono), monospace; font-size: 9.5px; font-weight: 700;
          background: rgba(245,237,229,.15); color: rgba(245,237,229,.9);
          padding: 3px 10px; border-radius: 100px; letter-spacing: .04em;
        }
        .plan-price {
          font-family: var(--font-cormorant), 'Cormorant', Georgia, serif;
          font-size: 52px; font-weight: 300;
          letter-spacing: -.02em; margin: 22px 0 4px; line-height: 1;
        }
        .plan-per { font-size: 12px; opacity: .6; margin-bottom: 22px; font-family: var(--font-mono), monospace; }
        .plan-divider { height: 1px; background: var(--border); margin: 20px 0; }
        .plan.featured .plan-divider { background: rgba(245,237,229,.15); }
        .plan-features { list-style: none; }
        .plan-features li { font-size: 13px; padding: 5.5px 0; display: flex; align-items: center; gap: 9px; opacity: .85; }
        .plan-features li::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: .4; flex-shrink: 0; }
        .plan-cta {
          display: block; width: 100%; margin-top: 26px; padding: 13px; border-radius: 100px;
          font-size: 13.5px; font-weight: 600; text-align: center; text-decoration: none; letter-spacing: .02em;
          transition: opacity .2s, transform .2s;
        }
        .plan-cta:hover { opacity: .86; transform: translateY(-1px); }
        .plan-cta.dark    { background: var(--brown); color: #F5EDE5; box-shadow: 0 3px 14px var(--brown-glow); }
        .plan-cta.light   { background: #F5EDE5; color: var(--brown); }
        .plan-cta.outline { border: 1px solid var(--border); color: var(--ink2); }
        .plan-cta.outline:hover { border-color: var(--brown-mid); color: var(--brown); }
        .pricing-note { font-family: var(--font-mono), monospace; font-size: 11px; color: var(--ink3); margin-top: 18px; letter-spacing: .02em; }

        /* ── FAQ ── */
        .faq { padding: 96px 0; background: var(--bg-deep); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .faq-item { border-bottom: 1px solid var(--border); padding: 26px 0; }
        .faq-item:nth-child(odd)  { padding-right: 48px; border-right: 1px solid var(--border); }
        .faq-item:nth-child(even) { padding-left: 48px; }
        .faq-q { font-size: 15px; font-weight: 600; margin-bottom: 9px; color: var(--ink); }
        .faq-a { font-size: 13.5px; color: var(--ink2); line-height: 1.75; }

        /* ── Final CTA ── */
        .final-cta { padding: 120px 0; text-align: center; position: relative; overflow: hidden; }
        .final-cta::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 80% at 50% 50%, var(--brown-glow), transparent);
          pointer-events: none;
        }
        .final-cta h2 {
          font-family: var(--font-cormorant), 'Cormorant', Georgia, serif;
          font-size: clamp(38px, 5.5vw, 62px); font-weight: 400;
          letter-spacing: -.01em; line-height: 1.08;
        }
        .final-cta h2 em {
          font-style: italic;
          background: linear-gradient(90deg, var(--brown), var(--brown-mid), var(--brown));
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .final-cta p { font-size: 15.5px; color: var(--ink2); margin: 18px auto 36px; max-width: 380px; line-height: 1.75; }
        .cta-group { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }

        /* ── Footer ── */
        footer { border-top: 1px solid var(--border); padding: 36px 0 44px; }
        .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: var(--font-cormorant), 'Cormorant', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); text-decoration: none; }
        .footer-logo-accent { color: var(--brown); }
        .footer-links { display: flex; gap: 28px; }
        .footer-links a { font-size: 12.5px; font-weight: 500; color: var(--ink3); text-decoration: none; transition: color .2s; }
        .footer-links a:hover { color: var(--brown); }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .steps { grid-template-columns: 1fr; }
          .integration-grid { grid-template-columns: 1fr 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }
          .faq-item:nth-child(odd)  { border-right: none; padding-right: 0; }
          .faq-item:nth-child(even) { padding-left: 0; }
          .mapping-strip { grid-template-columns: 1fr; }
          .mapping-divider { display: none; }
          .mapping-col { padding: 12px 0 !important; border-bottom: 1px solid var(--border); }
          .mapping-col:last-child { border-bottom: none; }
        }
        @media (max-width: 640px) {
          .integration-grid { grid-template-columns: 1fr; }
          nav { display: none; }
          .hero { padding: 64px 0 52px; }
          .how, .integrations, .pricing, .faq { padding: 64px 0; }
          .final-cta { padding: 80px 0; }
          .hero-actions { flex-direction: column; align-items: center; }
          .hero-word-wrap { min-width: 0; }
        }
      `}</style>

      {/* ══ HEADER ══════════════════════════════════════════ */}
      <header>
        <div className="wrap nav-inner">
          <div className="flex items-center ">
            <Link href="/" className="text-xl font-bold flex items-center">
              <Image
                alt="Norbit logo"
                src="/BrownIcon.png"
                width={100}
                height={40}
                className=""
              />

              Nor<span className=" text-amber-950">bit</span>
            </Link>
          </div>

          <nav>
            <a href="#how">How it works</a>
            <a href="#integrations">Integrations</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-btns">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn-fill">Get started free</Link>
          </div>
        </div>
      </header>

      {/* ══ HERO WRAP ═══════════════════════════════════════ */}
      <div className="hero-wrap">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-scanline" />

        <section className="hero">
          <div className="hero-inner">

            {/* Eyebrow */}
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              <span className="hero-eyebrow-text">Azure OpenAI · OAuth · Preview</span>
              <div className="hero-eyebrow-dot" />
            </div>

            {/* Headline */}
            <h1>
              Meeting notes,<br />
              turned into{" "}
              <span className="hero-word-wrap">
                <span className="hero-word-ghost">real work.</span>
                <span className="hero-word">real work.</span>
                <span className="hero-word">tasks.</span>
                <span className="hero-word">action.</span>
              </span>
            </h1>

            {/* Sub */}
            <p className="hero-sub">
              Write notes, pick your actions — Jira issues, DevOps items, Outlook drafts.
              Norbit generates everything; you review, edit, then execute.
            </p>

            {/* Actions */}
            <div className="hero-actions">
              <Link href="/signup" className="btn-hero-primary">Get started free</Link>
              <a href="#how" className="btn-hero-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 8.5l5 3.5-5 3.5V8.5z" fill="currentColor" />
                </svg>
                See how it works
              </a>
            </div>

            {/* Trust badges */}
            <div className="hero-badges-strip">
              <span className="tag-outline">Preview before creating</span>
              <span className="tag-outline">Encrypted storage</span>
              <span className="tag-outline">Team workspaces</span>
            </div>

            <div className="hero-rule" />
          </div>
        </section>

        {/* ── Integration strip ── */}
        <div className="strip">
          <div className="wrap">
            <div className="strip-inner">
              <span className="strip-label">Connects with</span>
              <div className="strip-divider" />
              <div className="strip-logos">
                {[
                  { label: "Azure DevOps", bg: "#0078D4", icon: <svg width="11" height="11" viewBox="0 0 32 32" fill="none"><path d="M0 17.677V7.37l6-5.603V1l11.266 8.083L6.411 11.3v12.28L0 17.677zm31.956-7.403L20.13 0v3.856L8.44 10.963l-.003 8.89 6.08 2.073V27.6l8.677-5.8-6.52-2.086v-6.32l15.28-3.82z" fill="#fff" /></svg> },
                  { label: "Outlook", bg: "#0078D4", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 6h10v12H3z" fill="#fff" opacity=".9" /><path d="M13 6l8 4v8l-8 4V6z" fill="#fff" opacity=".7" /></svg> },
                  { label: "SharePoint", bg: "#038387", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="6" fill="#fff" opacity=".85" /><circle cx="15" cy="15" r="6" fill="#fff" opacity=".55" /><circle cx="9" cy="9" r="3.5" fill="#038387" /></svg> },
                  { label: "Jira", bg: "#0052CC", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12l4 4 6-6 6 6 4-4L12 2z" fill="#fff" opacity=".9" /><path d="M12 10l-4 4 4 4 4-4-4-4z" fill="#fff" /></svg> },
                  { label: "ClickUp", bg: "#7B68EE", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 14l4-5 5 4 5-6 4 3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
                  { label: "Notion", bg: "#191919", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 7h6M7 12h10M7 17h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg> },
                ].map((i) => (
                  <div key={i.label} className="int-pill">
                    <div className="int-pill-icon" style={{ background: i.bg }}>{i.icon}</div>
                    <span className="int-pill-label">{i.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="how" id="how">
        <div className="wrap">
          <div className="section-header reveal">
            <div className="section-eyebrow">
              <div className="eyebrow-line" />
              <span className="label-tag">Workflow</span>
            </div>
            <h2>Write, choose, review, execute.</h2>
            <p>A four-step loop your team will actually stick to — because it meets you where you already work.</p>
          </div>
          <div className="steps">
            {[
              { n: "01", title: "Write your notes", desc: "Capture the meeting in a clean editor. Tag owners, deadlines, and decisions however feels natural." },
              { n: "02", title: "Select actions", desc: "Choose what needs to happen next — DevOps items, Outlook drafts, SharePoint uploads, Jira issues, and more." },
              { n: "03", title: "Review AI output", desc: "Azure OpenAI generates fully structured work items, emails, and tasks. Edit everything before anything is created." },
            ].map((s, i) => (
              <div key={s.n} className="step-card reveal" data-n={s.n} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mapping-strip reveal" style={{ transitionDelay: ".15s" }}>
            <div className="mapping-col" style={{ paddingLeft: 0 }}>
              <div className="mapping-col-label">Your notes</div>
              <div className="mapping-col-content" style={{ fontStyle: "italic", color: "var(--ink3)", fontSize: "13px" }}>
                Assign owner to SharePoint upload. Hotfix login timeout today. Send follow-up to the team.
              </div>
            </div>
            <div className="mapping-divider" />
            <div className="mapping-col">
              <div className="mapping-col-label">Actions selected</div>
              <div className="mapping-col-content" style={{ fontSize: "13px" }}>
                · Azure DevOps: create Bug work item<br />
                · SharePoint: upload cleaned notes<br />
                · Outlook: send follow-up email
              </div>
            </div>
            <div className="mapping-divider" />
            <div className="mapping-col" style={{ paddingRight: 0 }}>
              <div className="mapping-col-label">What you review &amp; edit</div>
              <div className="mapping-col-content" style={{ fontSize: "13px" }}>
                Work item title, type, assignee, sprint, area<br />
                SharePoint folder &amp; filename<br />
                Email subject, recipients &amp; body
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INTEGRATIONS ════════════════════════════════════ */}
      <section className="integrations" id="integrations">
        <div className="wrap">
          <div className="section-header reveal">
            <div className="section-eyebrow">
              <div className="eyebrow-line" />
              <span className="label-tag">Integrations</span>
            </div>
            <h2>Connect once. Execute everywhere.</h2>
            <p>Each integration uses OAuth — connect your account, and Norbit handles the rest. No re-authentication loops.</p>
          </div>
          <div className="integration-grid">
            {[
              { abbr: "Az", name: "Azure DevOps", desc: "Create bugs, tasks, and user stories directly from your notes." },
              { abbr: "Ou", name: "Outlook", desc: "Draft follow-up emails and schedule meetings from action output." },
              { abbr: "SP", name: "SharePoint", desc: "Upload cleaned notes and documents to the right folder automatically." },
              { abbr: "Ji", name: "Jira", desc: "Generate issues and epics with the right type, project, and assignee." },
              { abbr: "Cu", name: "ClickUp", desc: "Create tasks and docs in your ClickUp workspace from meeting output." },
              { abbr: "No", name: "Notion", desc: "Push notes and decisions to pages and databases in Notion." },
            ].map((item, idx) => (
              <div key={item.name} className="int-card reveal" style={{ transitionDelay: `${idx * 0.05}s` }}>
                <div className="int-icon">{item.abbr}</div>
                <div>
                  <div className="int-name">{item.name}</div>
                  <div className="int-desc">{item.desc}</div>
                  <div className="int-oauth">OAuth connected</div>
                </div>
              </div>
            ))}
          </div>
          <div className="int-note reveal">
            Built to expand: each action type has its own schema, preview UI, and validation — so adding new connectors doesn&apos;t break what already works.
          </div>
        </div>
      </section>

      {/* ══ PRICING ═════════════════════════════════════════ */}
      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="section-header reveal">
            <div className="section-eyebrow">
              <div className="eyebrow-line" />
              <span className="label-tag">Pricing</span>
            </div>
            <h2>Simple pricing that scales<br />with your org.</h2>
            <p>Start free. Upgrade when you roll it out across teams and integrations.</p>
          </div>
          <div className="pricing-grid">
            <div className="plan reveal">
              <div className="plan-name">Starter</div>
              <div className="plan-tagline">For trying the workflow</div>
              <div className="plan-price">Free</div>
              <div className="plan-per">forever</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {["Personal workspace", "Basic actions", "Preview & edit", "1 integration"].map((b) => <li key={b}>{b}</li>)}
              </ul>
              <Link href="/signup" className="plan-cta outline">Get started</Link>
            </div>
            <div className="plan featured reveal" style={{ transitionDelay: ".1s" }}>
              <span className="plan-badge">Popular</span>
              <div className="plan-name">Team</div>
              <div className="plan-tagline">Per user / month</div>
              <div className="plan-price">$12</div>
              <div className="plan-per">per user / month</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {["Organizations & shared notes", "Unlimited actions", "Multiple integrations", "Action templates", "Priority generation queue"].map((b) => <li key={b}>{b}</li>)}
              </ul>
              <Link href="/signup" className="plan-cta light">Start Team plan</Link>
            </div>
            <div className="plan reveal" style={{ transitionDelay: ".2s" }}>
              <div className="plan-name">Enterprise</div>
              <div className="plan-tagline">Security + governance</div>
              <div className="plan-price" style={{ fontSize: "40px", marginTop: "26px" }}>Custom</div>
              <div className="plan-per">tailored to your org</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {["SSO / SAML (optional)", "Custom retention policies", "Advanced audit exports", "Dedicated Azure resources", "Support SLA"].map((b) => <li key={b}>{b}</li>)}
              </ul>
              <Link href="/contact" className="plan-cta dark">Contact sales</Link>
            </div>
          </div>
          <p className="pricing-note reveal">All plans include encrypted storage and scoped OAuth permissions.</p>
        </div>
      </section>

      {/* ══ FAQ ═════════════════════════════════════════════ */}
      <section className="faq" id="faq">
        <div className="wrap">
          <div className="section-header reveal">
            <div className="section-eyebrow">
              <div className="eyebrow-line" />
              <span className="label-tag">FAQ</span>
            </div>
            <h2>Good questions.</h2>
          </div>
          <div className="faq-grid">
            {[
              { q: "How does the AI part actually work?", a: "You pick one or more actions. For each, Norbit calls Azure OpenAI and generates a fully structured preview — work item fields, email drafts, upload targets. You review and edit everything before it's executed." },
              { q: "Do you store tokens from my integrations?", a: "Integrations connect via OAuth. Tokens are stored encrypted so you don't get authentication loops in the middle of your workflow." },
              { q: "Can our team share notes across the org?", a: "Yes. Users belong to an organization, and orgs share notes, action templates, and automation patterns consistently across teams." },
              { q: "How do we avoid accidental creation?", a: "The preview step is the guardrail — nothing is created until you confirm. You can also add org-level policies requiring confirmation for specific action types." },
              { q: "Which integrations are live today?", a: "Azure DevOps, Outlook, SharePoint, ClickUp, Jira, and Notion are supported. The architecture is designed to expand as you add connectors." },
              { q: "Where is our data stored?", a: "Data is stored in Azure SQL with encryption and standard transport security. Enterprise plans can add stricter org-level controls." },
            ].map((faq, i) => (
              <div key={faq.q} className="faq-item reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <div className="faq-q">{faq.q}</div>
                <div className="faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════ */}
      <section className="final-cta">
        <div className="wrap">
          <div className="reveal">
            <h2>Your next meeting ends<br />with <em>work already done.</em></h2>
            <p>Start free. No card required. Connect your first integration in minutes.</p>
            <div className="cta-group">
              <Link href="/signup" className="btn-hero-primary" style={{ fontSize: "15px", padding: "15px 36px" }}>Get started free</Link>
              <a href="#how" className="btn-hero-secondary">See how it works</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer>
        <div className="wrap">
          <div className="footer-inner">
            <Link href="/" className="footer-logo">
              Nor<span className="footer-logo-accent">bit</span>
            </Link>
            <div className="footer-links">
              <a href="#how">Workflow</a>
              <a href="#integrations">Integrations</a>
              <a href="#pricing">Pricing</a>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
          </div>
          <p style={{ marginTop: "22px", fontFamily: "var(--font-mono), 'Space Mono', monospace", fontSize: "11px", color: "var(--ink3)", letterSpacing: ".02em" }}>
            © 2025 Norbit · All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}