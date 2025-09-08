import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import emailjs from "@emailjs/browser";

/* ========================= Site / Email constants ========================= */
const PHONE = "+1-555-000-0000"; // TODO: replace with the real number

// EmailJS – REPLACE with your actual IDs/keys
const EMAILJS_SERVICE_ID = "service_v6dbxx8";
const EMAILJS_TEMPLATE_ID_OWNER = "template_y52jg09";
const EMAILJS_TEMPLATE_ID_AUTOREPLY = "template_ptfrigq";
const EMAILJS_PUBLIC_KEY = "AnIsR1up7QFE2NzTB";

/* A few common calling codes (edit as you like) */
const COUNTRY_CODES = [
  { label: "Canada/USA (+1)", value: "+1" },
  { label: "UK (+44)", value: "+44" },
  { label: "Australia (+61)", value: "+61" },
  { label: "New Zealand (+64)", value: "+64" },
  { label: "Germany (+49)", value: "+49" },
];

/* ========================= Theme hook + switch ========================= */
function useTheme() {
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark); // <-- critical
    root.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

function addThemeTransitionOnce() {
  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const style = document.createElement("style");
  style.setAttribute("data-theme-transition", "true");
  style.textContent = `
    /* Transition everything briefly while switching themes */
    *:not(img):not(video):not([data-skip-theme-transition]) {
      transition:
        background-color .28s ease,
        color .28s ease,
        border-color .28s ease,
        fill .28s ease,
        stroke .28s ease !important;
    }
  `;
  document.head.appendChild(style);
  window.setTimeout(() => style.remove(), 350); // cleanup
}

function ThemeSwitch({ theme, setTheme }) {
  const onToggle = () => {
    addThemeTransitionOnce(); // <— add the temp transitions
    setTheme(theme === "dark" ? "light" : "dark"); // this still flips the .dark class
  };

  return (
    <button
      onClick={onToggle}
      className="text-sm rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}

/* ========================= Reveal on scroll (replays) ========================= */
function Reveal({ children, delay = 0, y = 12, className = "" }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2 });

  useEffect(() => {
    if (inView) controls.start("show");
    else controls.start("hidden");
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: "easeOut", delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ========================= Decorative Camera Lens ========================= */
function CameraLens({ size = 140, speed = 18 }) {
  const d = 200;
  return (
    <motion.div
      className="relative select-none"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <svg viewBox={`0 0 ${d} ${d}`} width="100%" height="100%" aria-hidden="true">
        <defs>
          <radialGradient id="glass" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#9be7ff" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#6fc1ff" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#5a86ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1f2a44" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
          </radialGradient>
          <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d0d0f" />
            <stop offset="50%" stopColor="#2a2a30" />
            <stop offset="100%" stopColor="#0d0d0f" />
          </linearGradient>
          <linearGradient id="glare" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="0.25" />
            <stop offset="60%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="glassMask">
            <rect width="200" height="200" fill="black" />
            <circle cx="100" cy="100" r="72" fill="white" />
          </mask>
        </defs>

        <circle cx="100" cy="100" r="98" fill="url(#metal)" />
        <motion.circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          strokeDasharray="2 6"
          animate={{ rotate: 360 }}
          style={{ transformOrigin: "center" }}
          transition={{ repeat: Infinity, duration: speed * 2, ease: "linear" }}
        />
        <circle cx="100" cy="100" r="82" fill="url(#metal)" />
        <circle cx="100" cy="100" r="78" fill="#121217" />

        <g mask="url(#glassMask)">
          <circle cx="100" cy="100" r="74" fill="url(#glass)" />
          <motion.g
            animate={{ rotate: -360 }}
            style={{ transformOrigin: "100px 100px" }}
            transition={{ repeat: Infinity, duration: speed * 1.2, ease: "linear" }}
            opacity="0.9"
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const rot = i * 60;
              return (
                <g key={i} transform={`rotate(${rot} 100 100)`}>
                  <path d="M100,100 L100,32 L162,92 Z" fill="rgba(0,0,0,0.45)" />
                </g>
              );
            })}
          </motion.g>
          <circle cx="100" cy="100" r="74" fill="url(#vignette)" />
          <motion.rect
            x="-120"
            y="20"
            width="240"
            height="160"
            fill="url(#glare)"
            animate={{ x: [-120, 220] }}
            transition={{ repeat: Infinity, duration: speed * 1.1, ease: "linear" }}
            opacity="0.4"
          />
        </g>

        <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}

/* ========== Photo with realistic camera-lens frame ========== */
function PhotoLens({ src, alt = "Portrait", size = 260, speed = 22 }) {
  const insetPct = 12;
  const inset = `${insetPct}%`;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 ring-1 ring-black/50 shadow-2xl" />

      <motion.div
        className="absolute rounded-full inset-[4%]"
        style={{
          background:
            "repeating-conic-gradient(rgba(255,255,255,0.05) 0deg, rgba(255,255,255,0.05) 6deg, rgba(0,0,0,0.12) 6deg, rgba(0,0,0,0.12) 12deg)",
          maskImage: "radial-gradient(circle at center, black 65%, transparent 66%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: speed * 3, ease: "linear" }}
      />

      <motion.div
        className="absolute rounded-full inset-[6%] border border-white/5"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35)" }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: speed * 1.5, ease: "linear" }}
      />
      <motion.div
        className="absolute rounded-full inset-[9%] border border-white/10"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)" }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: speed * 2.1, ease: "linear" }}
      />

      <div className="absolute rounded-full overflow-hidden ring-2 ring-white/40 shadow-xl" style={{ inset }}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.14), rgba(255,255,255,0) 55%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.15), rgba(0,0,0,0) 55%)",
          }}
          animate={{ opacity: [0.9, 0.7, 0.9] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: speed * 1.6, ease: "linear" }}
          style={{ mixBlendMode: "multiply" }}
        >
          <defs>
            <linearGradient id="bladeTint" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
            </linearGradient>
          </defs>
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <g key={r} transform={`rotate(${r} 50 50)`}>
              <path d="M50 7 L78 40 L50 50 Z" fill="url(#bladeTint)" />
            </g>
          ))}
        </motion.svg>
      </div>

      <div className="absolute inset-[calc(12%-1px)] rounded-full pointer-events-none ring-1 ring-black/40" />
    </div>
  );
}

/* ========================= Gallery Card (loader + retry) ========================= */
function GalleryImage({ src, alt, onClick, onLoaded, delay = 0 }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [verySlow, setVerySlow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => !loaded && setSlow(true), 2000);
    const t2 = setTimeout(() => !loaded && setVerySlow(true), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loaded]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 10000);
    return () => clearTimeout(t);
  }, [loaded]);

  const handleLoaded = () => {
    if (!loaded) {
      setLoaded(true);
      setFailed(false);
      onLoaded?.();
    }
  };
  const handleError = () => setFailed(true);

  const retry = () => {
    setFailed(false);
    setLoaded(false);
    setSlow(false);
    setVerySlow(false);
    const img = new Image();
    img.onload = handleLoaded;
    img.onerror = handleError;
    img.src = `${src}?r=${Date.now()}`;
  };

  const card = (
    <div
      className="group relative rounded-2xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900"
      style={{ aspectRatio: "4 / 3" }}
    >
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200/70 dark:bg-zinc-700/50" />
      )}
      {!loaded && !failed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 text-white text-xs">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {slow ? (verySlow ? "still loading…" : "loading…") : null}
          </div>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-900">
          <div className="text-zinc-600 dark:text-zinc-300 text-sm">Couldn’t load this image</div>
          <button
            onClick={retry}
            className="rounded-full bg-zinc-900 text-white px-3 py-1 text-xs hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoaded}
        onError={handleError}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${loaded ? "opacity-100 group-hover:scale-[1.03]" : "opacity-0"
          }`}
        loading="lazy"
        decoding="async"
      />
      {loaded && !failed && (
        <button
          type="button"
          onClick={onClick}
          aria-label={`Open ${alt}`}
          className="absolute inset-0 z-10"
          title="Open"
        />
      )}
    </div>
  );

  return <Reveal delay={delay}>{card}</Reveal>;
}

/* ========================= Back-to-top ========================= */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg px-3.5 py-3 hover:opacity-90 transition-colors"
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
}

/* =================================== PAGE =================================== */
export default function App() {
  const FEATURED_COUNT = 12;
  const [visibleCount, setVisibleCount] = useState(FEATURED_COUNT);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const { theme, setTheme } = useTheme();

  // ---- Smooth scroll with sticky header offset ----
  const HEADER_OFFSET = 96; // ~ h-16 + spacing
  const scrollToHash = (hash) => {
    const id = (hash || "").replace("#", "");
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.history.pushState(null, "", `#${id}`);
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const handleAnchor = (e, hash) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToHash(hash);
  };

  // Handle direct loads with a hash (e.g., /#contact)
  useEffect(() => {
    if (location.hash) {
      // Wait a tick to ensure layout is ready
      setTimeout(() => scrollToHash(location.hash), 0);
    }
  }, []);

  const [loadedCount, setLoadedCount] = useState(0);
  const needLoaded = Math.min(4, visibleCount);
  const initialLoading = loadedCount < needLoaded;

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("resize", close);
    };
  }, []);

  // images in /public/gallery/img-01.jpg ... img-51.jpg
  const photos = useMemo(() => {
    const TOTAL = 51;
    return Array.from({ length: TOTAL }, (_, i) => `/gallery/img-${String(i + 1).padStart(2, "0")}.jpg`);
  }, []);

  useEffect(() => setLoadedCount(0), [visibleCount]);
  const onCardLoaded = () => setLoadedCount((c) => c + 1);

  const openLightbox = (i) => setLightbox({ open: true, index: i });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const prev = () =>
    setLightbox((l) => ({ open: true, index: (l.index - 1 + photos.length) % photos.length }));
  const next = () => setLightbox((l) => ({ open: true, index: (l.index + 1) % photos.length }));

  const displayed = photos.slice(0, visibleCount);

  /* ---------- Open-Graph meta tags (client-side fallback) ---------- */
  useEffect(() => {
    const ensureMeta = (selector, attrName, attrValue, content) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    ensureMeta('meta[property="og:title"]', "property", "og:title", "Dakoda Photography");
    ensureMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      "Capturing the details most people walk past."
    );
    ensureMeta('meta[property="og:type"]', "property", "og:type", "website");
    ensureMeta('meta[property="og:url"]', "property", "og:url", window.location.href);
    ensureMeta('meta[property="og:image"]', "property", "og:image", `${window.location.origin}/gallery/img-01.jpg`);
    ensureMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  }, []);

  /* -------- Contact form + EmailJS (with anti-spam & validation) -------- */
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null); // null | 'ok' | 'err' | 'spam' | 'rate'
  const formStartRef = useRef(Date.now());
  const nonceRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );

  const formatLocalPhone = (digits10) => digits10.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");

  async function handleEmailSubmit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setSending(true);
    setSent(null);
    setFormError("");

    const fd = new FormData(formEl);
    // honeypots
    const honey1 = (fd.get("website") || "").toString().trim();
    const honey2 = (fd.get("subject2") || "").toString().trim();
    if (honey1 || honey2) {
      setSending(false);
      setSent("spam");
      return;
    }

    // time gate
    const started = Number(fd.get("form_started_at") || formStartRef.current);
    const elapsedSec = (Date.now() - started) / 1000;
    if (elapsedSec < 3) {
      setSending(false);
      setSent("spam");
      return;
    }

    // nonce
    const nonce = (fd.get("__nonce") || "").toString();
    if (nonce !== nonceRef.current) {
      setSending(false);
      setSent("spam");
      return;
    }

    // rate-limit
    const last = Number(localStorage.getItem("last_submit_ts") || 0);
    if (Date.now() - last < 30_000) {
      setSending(false);
      setSent("rate");
      return;
    }

    // validations
    const email = (fd.get("email") || "").toString().trim();
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)) {
      setSending(false);
      setFormError("Please enter a valid Gmail address (example@gmail.com).");
      return;
    }

    const phoneCC = (fd.get("phone_cc") || "+1").toString();
    const phoneLocalRaw = (fd.get("phone_local") || "").toString().replace(/\D/g, "");
    let phoneFull = "";
    if (phoneLocalRaw) {
      if (!/^\d{10}$/.test(phoneLocalRaw)) {
        setSending(false);
        setFormError("Phone number must be exactly 10 digits (local number).");
        return;
      }
      phoneFull = `${phoneCC} ${formatLocalPhone(phoneLocalRaw)}`;
    }

    const params = {
      from_name: (fd.get("name") || "").toString(),
      from_email: email,
      interest: (fd.get("interest") || "").toString(),
      quantity: (fd.get("quantity") || "").toString(),
      phone_country: phoneCC,
      phone_local: phoneLocalRaw,
      phone: phoneFull,
      subject: (fd.get("subject") || "Website inquiry").toString(),
      message: (fd.get("message") || "").toString(),
      page_url: window.location.href,
      date_time: new Date().toLocaleString(),
      user_agent: navigator.userAgent,
      submitted_in_seconds: Math.round(elapsedSec).toString(),
      nonce,
      reply_to: email,
      to_name: "Dakoda",
    };

    try {
      const owner = emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_OWNER, params, {
        publicKey: EMAILJS_PUBLIC_KEY,
      });
      const auto = EMAILJS_TEMPLATE_ID_AUTOREPLY
        ? emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_AUTOREPLY, params, { publicKey: EMAILJS_PUBLIC_KEY })
        : Promise.resolve();

      await Promise.all([owner, auto]);
      localStorage.setItem("last_submit_ts", String(Date.now()));
      setSending(false);
      setSent("ok");
      formEl.reset();
      formStartRef.current = Date.now();
      nonceRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
    } catch (err) {
      console.error("EmailJS send failed:", err);
      setSending(false);
      setSent("err");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 scroll-smooth transition-colors">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <nav className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <a href="#home" onClick={(e) => handleAnchor(e, "#home")} className="font-semibold text-lg">
            Dakoda Photography
          </a>

          {/* Desktop links */}
          <div className="hidden sm:flex gap-6 text-sm">
            <a href="#work" onClick={(e) => handleAnchor(e, "#work")} className="hover:opacity-80">
              Work
            </a>
            <a href="#about" onClick={(e) => handleAnchor(e, "#about")} className="hover:opacity-80">
              About
            </a>
            <a href="#pricing" onClick={(e) => handleAnchor(e, "#pricing")} className="hover:opacity-80">
              Pricing
            </a>
            <a href="#contact" onClick={(e) => handleAnchor(e, "#contact")} className="hover:opacity-80">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch theme={theme} setTheme={setTheme} />
            {/* Mobile hamburger */}
            <button
              className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-zinc-300 dark:border-zinc-700"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={`${menuOpen ? "block" : "hidden"
            } sm:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 text-sm">
            {[
              ["#work", "Work"],
              ["#about", "About"],
              ["#pricing", "Pricing"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="py-1" onClick={(e) => handleAnchor(e, href)}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <h1 className="text-4xl sm:text-5xl font-bold">Capturing the Details Most People Walk Past</h1>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300 text-lg max-w-2xl">
            Photography isn’t just about taking pictures — it’s about slowing down, noticing beauty in unexpected
            places, and sharing that perspective with others.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded-full bg-zinc-900 text-white px-5 py-2.5 dark:bg-zinc-100 dark:text-zinc-900 transition-colors"
            >
              Call Now
            </a>
            <a
              href="#work"
              onClick={(e) => handleAnchor(e, "#work")}
              className="rounded-full border border-zinc-300 px-5 py-2.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
            >
              View Gallery
            </a>
          </div>
        </Reveal>
      </section>

      {/* Work / Gallery */}
      <section id="work" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-end justify-between">
          <Reveal>
            <h2 className="text-3xl font-semibold">Work</h2>
          </Reveal>
        </div>

        {initialLoading && (
          <div className="relative my-6">
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm shadow">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Loading photos…
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((src, i) => (
            <GalleryImage
              key={src}
              src={src}
              alt={`Gallery image ${i + 1}`}
              onClick={() => openLightbox(i)}
              onLoaded={onCardLoaded}
              delay={(i % 8) * 0.03}
            />
          ))}
        </div>

        {visibleCount < photos.length && (
          <Reveal delay={0.05}>
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount(photos.length)}
                className="rounded-full bg-zinc-900 text-white px-5 py-2.5 text-sm hover:opacity-90"
              >
                Explore full gallery ({photos.length})
              </button>
            </div>
          </Reveal>
        )}
      </section>

      {/* Lightbox */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-sm"
          >
            Close
          </button>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-sm"
          >
            ← Prev
          </button>
          <img
            src={photos[lightbox.index]}
            alt="Large view"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-sm"
          >
            Next →
          </button>
        </div>
      )}

      {/* About */}
      <section id="about" className="scroll-mt-24 mx-auto max-w-5xl px-4 py-12">
        <Reveal>
          <h2 className="text-3xl font-semibold text-center md:text-left">About Me</h2>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="mt-6 grid gap-8 items-start justify-items-center md:grid-cols-[280px,1fr] md:justify-items-start">
            <PhotoLens src="/gallery/profile-picture.jpg" alt="Dakoda – Portrait" size={280} speed={20} />
            <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-center md:text-left">
              <p>
                I’m <span className="font-semibold">Dakoda</span> — a photographer obsessed with the little details most
                people walk past. From sweeping landscapes to macro textures, I’m drawn to the moments that make the
                world feel both bigger and more intimate.
              </p>
              <p>
                My approach is simple: slow down, pay attention, and let the story reveal itself. Whether I’m chasing
                golden hour or crouched beside a flower, I aim to capture images that feel honest, grounded, and full of
                life.
              </p>
              <p>
                When I’m not behind the lens, I’m usually exploring new trails, sipping good coffee, or planning the
                next outdoor adventure.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between gap-6">
          <Reveal>
            <h2 className="text-3xl font-semibold">Pricing</h2>
          </Reveal>
          <Reveal delay={0.05}>
            <CameraLens size={96} />
          </Reveal>
        </div>

        <Reveal delay={0.06}>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            Canvas prints are made in Canada and ship within 2–4 business days. Prices exclude taxes. For promotions or
            multi-piece discounts, reach out via the contact form below.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Reveal>
            <div className="rounded-2xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 shadow-sm transition-colors">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Canvas Print</p>
              <h3 className="mt-1 text-xl font-semibold">24×36</h3>
              <p className="mt-3 text-2xl font-bold">$249</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• Ready-to-hang gallery wrap</li>
                <li>• Archival inks, satin finish</li>
                <li>• Signed on request</li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="rounded-2xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 shadow-sm ring-2 ring-zinc-900/10 dark:ring-white/10 transition-colors">
              <div className="inline-block text-[11px] uppercase tracking-wide bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                Popular
              </div>
              <h3 className="mt-2 text-xl font-semibold">30×40</h3>
              <p className="mt-3 text-2xl font-bold">$349</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• Our best room-friendly size</li>
                <li>• Thick 1.5″ stretcher bars</li>
                <li>• Hardware pre-installed</li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 shadow-sm transition-colors">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Large Format</p>
              <h3 className="mt-1 text-xl font-semibold">36×48</h3>
              <p className="mt-3 text-2xl font-bold">$549</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• Statement piece for big walls</li>
                <li>• Color-calibrated & inspected</li>
                <li>• Safe packaging & insured ship</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 mx-auto max-w-5xl px-4 py-12">
        <Reveal>
          <h2 className="text-3xl font-semibold">Contact</h2>
        </Reveal>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr,1fr]">
          <Reveal>
            <div className="rounded-2xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 shadow-sm transition-colors">
              <h3 className="text-xl font-semibold">Let’s work together</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                Have a question, custom size, or a project in mind? Send a note — I reply quickly.
              </p>
            </div>
          </Reveal>

          <ContactForm
            sendingState={[sending, setSending]}
            sentState={[sent, setSent]}
            formErrorState={[formError, setFormError]}
            handleEmailSubmit={handleEmailSubmit}
            formStartRef={formStartRef}
            nonceRef={nonceRef}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 text-center py-6 text-sm text-zinc-500 dark:text-zinc-400 transition-colors">
        © {new Date().getFullYear()} Dakoda Photography. All rights reserved.
      </footer>

      <BackToTop />
    </div>
  );
}

/* Split out the form JSX to keep main render tidy */
function ContactForm({ sendingState, sentState, formErrorState, handleEmailSubmit, formStartRef, nonceRef }) {
  const [sending] = sendingState;
  const [sent] = sentState;
  const [formError] = formErrorState;

  return (
    <Reveal delay={0.05}>
      <form
        className="rounded-2xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 shadow-sm grid gap-4 transition-colors"
        onSubmit={handleEmailSubmit}
      >
        {/* Hidden anti-spam fields */}
        <div className="hidden" aria-hidden="true">
          <input name="website" type="text" tabIndex="-1" autoComplete="off" />
          <input name="subject2" type="text" tabIndex="-1" autoComplete="off" />
          <input name="form_started_at" type="hidden" value={formStartRef.current} />
          <input name="__nonce" type="hidden" value={nonceRef.current} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            name="name"
            type="text"
            placeholder="Full name"
            className="rounded-lg border px-3 py-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Gmail address (example@gmail.com)"
            className="rounded-lg border px-3 py-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors"
            pattern="^[A-Za-z0-9._%+-]+@gmail\.com$"
            title="Please enter a Gmail address (example@gmail.com)."
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <select
            name="interest"
            className="rounded-lg border px-3 py-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
          >
            <option value="">Interested in…</option>
            <option>24×36 — $249</option>
            <option>30×40 — $349</option>
            <option>36×48 — $549</option>
            <option>Other / Not sure</option>
          </select>
          <input
            name="quantity"
            type="number"
            min="1"
            placeholder="Quantity (optional)"
            className="rounded-lg border px-3 py-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
          />
        </div>

        {/* Country code + 10-digit local number, plus Subject */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-2">
            <select
              name="phone_cc"
              defaultValue="+1"
              className="rounded-lg border px-3 py-2 w-40 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              name="phone_local"
              type="tel"
              inputMode="numeric"
              placeholder="10-digit phone"
              className="rounded-lg border px-3 py-2 flex-1 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
              maxLength={10}
              pattern="\d{10}"
              title="Enter exactly 10 digits"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
              }}
            />
          </div>
          <input
            name="subject"
            type="text"
            placeholder="Subject (optional)"
            className="rounded-lg border px-3 py-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
          />
        </div>

        <textarea
          name="message"
          placeholder="Your message"
          className="rounded-lg border px-3 py-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
          rows={6}
          required
          minLength={10}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={sending}
            className={`rounded-full px-5 py-2.5 text-white dark:text-zinc-900 ${sending ? "bg-zinc-700 dark:bg-zinc-300" : "bg-zinc-900 hover:opacity-90 dark:bg-zinc-100"
              } transition-colors`}
          >
            {sending ? "Sending…" : "Send Message"}
          </button>
          <span className="text-sm" aria-live="polite">
            {formError && <span className="text-red-500">{formError}</span>}
            {!formError && sent === "ok" && <span className="text-green-500">Thanks! Your message was sent.</span>}
            {!formError && sent === "err" && (
              <span className="text-red-500">Sorry, something went wrong. Please try again.</span>
            )}
            {!formError && sent === "spam" && (
              <span className="text-amber-500">Please take a moment and try again.</span>
            )}
            {!formError && sent === "rate" && (
              <span className="text-amber-500">Please wait 30s before sending another message.</span>
            )}
          </span>
        </div>
      </form>
    </Reveal>
  );
}
