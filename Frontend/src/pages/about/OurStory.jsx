import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  selectStats,
  selectValues,
  selectTestimonials,
  selectGallery,
} from "../../store/slices/ourStorySlice";
gsap.registerPlugin(ScrollTrigger);

// ── Local image imports ──────────────────────────────────────────────────────
import heroImg          from "../../assets/images/service/hero.png";
import educationImg     from "../../assets/images/orphanage/education.jpg";
import edu1Img          from "../../assets/images/orphanage/education/image1.png";
import edu2Img          from "../../assets/images/orphanage/education/image2.png";
import empowerImg1      from "../../assets/images/women/empowerment/image1.png";
import empowerImg2      from "../../assets/images/women/empowerment/image2.png";
import empowerImg3      from "../../assets/images/women/empowerment/image3.png";
import medicalImg       from "../../assets/images/orphanage/medical/image1.png";
import campImg          from "../../assets/images/Medical/camp.jpg";
import kanayadanHero    from "../../assets/images/socialWelfare/Kanyadan/hero.png";
import kanayadanFuture  from "../../assets/images/socialWelfare/Kanyadan/Future.png";
import kanayadanSupport from "../../assets/images/socialWelfare/Kanyadan/Support.png";
import roadImg          from "../../assets/images/infrastructure/road.jpg";
import elderFoodImg     from "../../assets/images/elderly/food.jpg";
import elderEmotional   from "../../assets/images/elderly/emotional.jpg";
import healthImg        from "../../assets/images/orphanage/health.jpg";
import widowImg         from "../../assets/images/women/widow.png";
import mealImg          from "../../assets/images/orphanage/meal/image1.png";
import donateImg        from "../../assets/images/orphanage/donate.png";
import cowImg           from "../../assets/images/socialWelfare/Cow/image1.png";
import ritesImg         from "../../assets/images/socialWelfare/rites.png";

/* ── Counter hook ───────────────────────────────────────────────────────────── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── IntersectionObserver hook ──────────────────────────────────────────────── */
function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Fade-in wrapper ────────────────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView(0.12);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated stat ──────────────────────────────────────────────────────────── */
function StatCard({ value, suffix = "", label, delay }) {
  const [ref, inView] = useInView(0.3);
  const count = useCounter(value, 2000, inView);
  return (
    <div
      ref={ref}
      className="text-center"
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)", transition: `all 0.65s ease ${delay}s` }}
    >
      <div className="text-5xl font-black text-white mb-2">
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="text-green-200 text-xs font-semibold tracking-widest uppercase">{label}</div>
    </div>
  );
}

/* ── Vine cluster — decorative organic vines that grow next to the trunk ─────── */
function VineCluster({ side, offsetX, topPct }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: () => {
          gsap.to(el.querySelectorAll(".v-line"), {
            strokeDashoffset: 0, duration: 0.7, stagger: 0.15, ease: "power2.out",
          });
          gsap.to(el.querySelectorAll(".v-leaf"), {
            scale: 1, opacity: 0.85, duration: 0.35, stagger: 0.1, delay: 0.55,
            ease: "back.out(2)",
          });
          gsap.to(el, {
            rotate: side === "right" ? 5 : -5,
            duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.9,
          });
        },
      });
    }, el);
    return () => ctx.revert();
  }, [side]);

  const isRight = side === "right";
  const lines = isRight
    ? ["M 4,0 C 10,7 15,18 11,30 C 7,42 3,46 6,56", "M 6,18 C 14,15 18,7 15,1"]
    : ["M 16,0 C 10,7 5,18 9,30 C 13,42 17,46 14,56", "M 14,18 C 6,15 2,7 5,1"];
  const leaves = isRight
    ? [{ cx: 6, cy: 56, rot: -35 }, { cx: 15, cy: 1, rot: 28 }]
    : [{ cx: 14, cy: 56, rot: 35 }, { cx: 5, cy: 1, rot: -28 }];

  return (
    <div ref={ref} className="absolute pointer-events-none hidden md:block"
      style={{
        top: topPct, width: 22, height: 60, zIndex: 2, transformOrigin: "top center",
        ...(isRight
          ? { left: `calc(50% + ${offsetX}px)` }
          : { right: `calc(50% + ${offsetX}px)` }),
      }}
    >
      <svg viewBox="0 0 22 60" width="22" height="60" overflow="visible">
        {lines.map((d, i) => (
          <path key={i} d={d} stroke={i === 0 ? "#2d6a0a" : "#3d8a14"}
            strokeWidth={i === 0 ? 1.5 : 1} fill="none" strokeLinecap="round"
            className="v-line" pathLength="1" strokeDasharray="1" strokeDashoffset="1"
            opacity={i === 0 ? 0.8 : 0.6} />
        ))}
        {leaves.map((l, i) => (
          <ellipse key={i} cx={l.cx} cy={l.cy} rx="6.5" ry="3.5"
            transform={`rotate(${l.rot}, ${l.cx}, ${l.cy})`}
            fill={i === 0 ? "#22c55e" : "#15803d"} className="v-leaf"
            style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }} />
        ))}
      </svg>
    </div>
  );
}

/* ── Rope + hook helpers — defined outside TreeNode so React doesn't recreate ── */
function RopeSVG({ h = 80 }) {
  return (
    <svg width="14" height={h} viewBox={`0 0 14 ${h}`} style={{ marginTop: -1 }}>
      <path d={`M 7,0 C 3,${h*0.11} 11,${h*0.22} 7,${h*0.34} C 3,${h*0.45} 11,${h*0.56} 7,${h*0.67} C 3,${h*0.78} 11,${h*0.89} 7,${h}`}
        stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d={`M 7,0 C 11,${h*0.11} 3,${h*0.22} 7,${h*0.34} C 11,${h*0.45} 3,${h*0.56} 7,${h*0.67} C 11,${h*0.78} 3,${h*0.89} 7,${h}`}
        stroke="#b45309" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="7" cy={h - 3} rx="3.5" ry="2.2" fill="#78350f" opacity="0.9" />
    </svg>
  );
}

function HookDot() {
  return (
    <div style={{
      width: 11, height: 11, borderRadius: "50%", flexShrink: 0,
      background: "radial-gradient(circle at 35% 35%, #d97706, #78350f)",
      border: "2.5px solid #451a03", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }} />
  );
}

/* ── Tree node — GSAP animated branch + hanging content ──────────────────────── */
function TreeNode({ year, title, body, img, reverse, index }) {
  const nodeRef     = useRef(null);
  const dotRef      = useRef(null);
  // Image-side branch refs
  const branchRef   = useRef(null);
  const twig1Ref    = useRef(null);
  const twig2Ref    = useRef(null);
  // Text-side branch refs
  const txtBrRef    = useRef(null);
  const txtTw1Ref   = useRef(null);
  const txtTw2Ref   = useRef(null);
  // Card refs
  const textRef     = useRef(null);
  const imgRef      = useRef(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: nodeRef.current,
          start: "top 76%",
          toggleActions: "play none none none",
        },
      });
      // Phase 1 — trunk dot pops in
      tl.fromTo(dotRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.5)" }, 0);
      // Phase 2 — both branches draw simultaneously from the dot
      tl.fromTo(branchRef.current,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, 0.15);
      tl.fromTo(txtBrRef.current,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.95, ease: "power2.inOut" }, 0.18);
      // Phase 3 — twigs burst out on both sides
      tl.fromTo(twig1Ref.current,
        { strokeDashoffset: 1, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 0.72);
      tl.fromTo(twig2Ref.current,
        { strokeDashoffset: 1, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 0.84);
      tl.fromTo(txtTw1Ref.current,
        { strokeDashoffset: 1, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, 0.76);
      tl.fromTo(txtTw2Ref.current,
        { strokeDashoffset: 1, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.38, ease: "power3.out" }, 0.88);
      // Phase 4 — cards drop in
      tl.fromTo(textRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.5);
      tl.fromTo(imgRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }, 0.58);
      // Phase 5 — leaves pop
      nodeRef.current.querySelectorAll(".n-leaf").forEach((el, i) => {
        tl.fromTo(el,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.32, ease: "back.out(2.2)" },
          0.9 + i * 0.08);
      });
      // Gentle perpetual sway — both hanging cards rock from their rope pivot
      gsap.to(imgRef.current, {
        rotate: 1.6, duration: 3.4 + index * 0.4,
        repeat: -1, yoyo: true, ease: "sine.inOut",
        delay: 1.6 + index * 0.35, transformOrigin: "top center",
      });
      gsap.to(textRef.current, {
        rotate: reverse ? 1.4 : -1.4, duration: 3.8 + index * 0.35,
        repeat: -1, yoyo: true, ease: "sine.inOut",
        delay: 1.9 + index * 0.3, transformOrigin: "top center",
      });
    }, nodeRef);
    return () => ctx.revert();
  }, [reverse, index]);

  // ── Branch path math ──────────────────────────────────────────────────────
  // ViewBox "0 0 100 60", SVG rendered height = 120px
  // Tip at viewBox y=40 → pixel = 40/60 × 120 = 80px below SVG top
  // Dot top = 56px → branch tip absolute from row top = 56 + 80 = 136px
  // Both cards: marginTop = 136 so the rope pivot sits exactly at tip ✓
  //
  // Image branch: trunk at the SVG edge nearest the trunk centre-line,
  //               tip at the far edge (toward image column).
  // Text branch:  mirror — trunk same, tip toward text column.

  // Image-side branch (grows away from trunk toward image column)
  const imgBv = {
    main: reverse
      ? "M 100,0 C 78,5 56,16 40,26 C 24,36 8,40 0,40"
      : "M 0,0 C 22,5 44,16 60,26 C 76,36 92,40 100,40",
    t1: reverse ? "M 55,22 C 50,13 52,4 57,-1"    : "M 45,22 C 50,13 48,4 43,-1",
    t2: reverse ? "M 25,11 C 19,3 21,-6 26,-11"   : "M 75,11 C 81,3 79,-6 74,-11",
  };
  // Text-side branch (grows opposite direction toward text column)
  const txtBv = {
    main: reverse
      ? "M 0,0 C 22,5 44,16 60,26 C 76,36 92,40 100,40"
      : "M 100,0 C 78,5 56,16 40,26 C 24,36 8,40 0,40",
    t1: reverse ? "M 45,22 C 50,13 48,4 43,-1"    : "M 55,22 C 50,13 52,4 57,-1",
    t2: reverse ? "M 75,11 C 81,3 79,-6 74,-11"   : "M 25,11 C 19,3 21,-6 26,-11",
  };

  const imgTipX = reverse ? 0 : 100;
  const txtTipX = reverse ? 100 : 0;
  const tipY    = 40;

  // Leaf clusters — all leaves within ±8 viewbox units of the tip so they
  // visually sit right at the branch end, not floating away.
  const leafColors = ["#15803d", "#22c55e", "#16a34a", "#4ade80"];
  const mkLeaves = (tx, sign) => [
    { dx: 0,       dy: 0,  rx: 7.5, ry: 4,   rot: sign * 42 },
    { dx: sign * 5, dy: -3, rx: 6,   ry: 3.2, rot: sign * -18 },
    { dx: sign * 3, dy: -7, rx: 5,   ry: 2.8, rot: sign * 55 },
    { dx: sign *-3, dy: -5, rx: 4.5, ry: 2.5, rot: sign * 12 },
  ].map((l) => ({ ...l, cx: tx + l.dx, cy: tipY + l.dy }));

  const imgSign  = reverse ? -1 : 1;
  const txtSign  = reverse ?  1 : -1;
  const imgLeaves = mkLeaves(imgTipX, imgSign);
  const txtLeaves = mkLeaves(txtTipX, txtSign);

  return (
    <div ref={nodeRef}
      className={`relative flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-start gap-6 md:gap-0 py-10 md:py-14`}
    >
      {/* ── Trunk dot — top:56 matches py-14 (56px) ── */}
      <div ref={dotRef}
        className="hidden md:flex absolute left-1/2 z-20 w-5 h-5 rounded-full items-center justify-center shadow-xl"
        style={{
          top: 56, transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle at 35% 35%, #c47a1a, #78350f)",
          border: "3px solid #451a03", opacity: 0,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-amber-200/80" />
      </div>

      {/* ── Image-side branch SVG ── */}
      {/* Positioned: left/right of trunk, extends toward image column */}
      {/* SVG top=56 aligns with dot; height=120 → tip at 80px below = 136px absolute */}
      <svg className="hidden md:block absolute pointer-events-none"
        style={{
          top: 56, zIndex: 5, height: 120, overflow: "visible",
          ...(reverse
            ? { right: "calc(50% + 10px)", width: "44%" }
            : { left:  "calc(50% + 10px)", width: "44%" }),
        }}
        viewBox="0 0 100 60" preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`ibG${index}`} x1={reverse?"1":"0"} y1="0" x2={reverse?"0":"1"} y2="0">
            <stop offset="0%"   stopColor="#3b1202" />
            <stop offset="35%"  stopColor="#78350f" />
            <stop offset="70%"  stopColor="#a16207" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>
        {/* shadow */}
        <path d={imgBv.main} stroke="rgba(0,0,0,0.09)" strokeWidth="5" fill="none" strokeLinecap="round" transform="translate(1.5,2)" />
        {/* main branch */}
        <path ref={branchRef} d={imgBv.main} stroke={`url(#ibG${index})`} strokeWidth="3.5" fill="none" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
        {/* twigs */}
        <path ref={twig1Ref} d={imgBv.t1} stroke="#92400e" strokeWidth="1.8" fill="none" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset="1" opacity="0" />
        <path ref={twig2Ref} d={imgBv.t2} stroke="#a16207" strokeWidth="1.4" fill="none" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset="1" opacity="0" />
        {/* rope stub from tip to SVG bottom edge */}
        <line x1={imgTipX} y1={tipY} x2={imgTipX} y2="60"
          stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" strokeDasharray="2.5 3" />
        {/* hook ring at tip */}
        <circle cx={imgTipX} cy={tipY} r="4" fill="#a16207" stroke="#451a03" strokeWidth="1.4" />
        {/* leaf cluster — tightly packed at tip */}
        {imgLeaves.map((l, i) => (
          <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry}
            transform={`rotate(${l.rot}, ${l.cx}, ${l.cy})`}
            fill={leafColors[i]} className="n-leaf"
            style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }} />
        ))}
      </svg>

      {/* ── Text-side branch SVG — mirror of image branch ── */}
      {/* Positioned on the OPPOSITE side: extends toward text column */}
      <svg className="hidden md:block absolute pointer-events-none"
        style={{
          top: 56, zIndex: 5, height: 120, overflow: "visible",
          ...(reverse
            ? { left: "calc(50% + 10px)", width: "44%" }
            : { right: "calc(50% + 10px)", width: "44%" }),
        }}
        viewBox="0 0 100 60" preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`tbG${index}`} x1={reverse?"0":"1"} y1="0" x2={reverse?"1":"0"} y2="0">
            <stop offset="0%"   stopColor="#3b1202" />
            <stop offset="35%"  stopColor="#78350f" />
            <stop offset="70%"  stopColor="#a16207" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>
        {/* shadow */}
        <path d={txtBv.main} stroke="rgba(0,0,0,0.09)" strokeWidth="5" fill="none" strokeLinecap="round" transform="translate(1.5,2)" />
        {/* main branch */}
        <path ref={txtBrRef} d={txtBv.main} stroke={`url(#tbG${index})`} strokeWidth="3.5" fill="none" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
        {/* twigs */}
        <path ref={txtTw1Ref} d={txtBv.t1} stroke="#92400e" strokeWidth="1.8" fill="none" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset="1" opacity="0" />
        <path ref={txtTw2Ref} d={txtBv.t2} stroke="#a16207" strokeWidth="1.4" fill="none" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset="1" opacity="0" />
        {/* rope stub from tip to SVG bottom edge */}
        <line x1={txtTipX} y1={tipY} x2={txtTipX} y2="60"
          stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" strokeDasharray="2.5 3" />
        {/* hook ring at tip */}
        <circle cx={txtTipX} cy={tipY} r="4" fill="#a16207" stroke="#451a03" strokeWidth="1.4" />
        {/* leaf cluster — tightly packed at tip */}
        {txtLeaves.map((l, i) => (
          <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry}
            transform={`rotate(${l.rot}, ${l.cx}, ${l.cy})`}
            fill={leafColors[i]} className="n-leaf"
            style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }} />
        ))}
      </svg>

      {/* ── Text card — hangs from text-branch tip via rope ── */}
      {/* marginTop:136 on desktop places the rope pivot exactly at the branch tip */}
      <div ref={textRef}
        className={`flex-1 ${reverse ? "md:pr-[4.5rem]" : "md:pl-[4.5rem]"} px-4 w-full z-10`}
        style={{ opacity: 0 }}
      >
        {/* Mobile: flat card */}
        <div className="block md:hidden bg-white rounded-3xl p-6"
          style={{ boxShadow: "0 8px 40px rgba(120,53,15,0.08)", border: "1.5px solid rgba(251,191,36,0.2)" }}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-green-50 border border-amber-200/60 px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
            <span className="text-amber-800 text-[10px] font-bold tracking-widest uppercase">{year}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-3 leading-snug">{title}</h3>
          <p className="text-slate-600 text-sm leading-[1.75] font-light">{body}</p>
        </div>
        {/* Desktop: hanging from rope */}
        {/* marginTop:80 = tipY/viewBoxH × svgHeight = 40/60 × 120 = 80px          */}
        {/* flex child starts at row padding-top (56px), so hook lands at            */}
        {/* 56+80=136px from row outer top = exactly the branch tip pixel position   */}
        <div className="hidden md:block" style={{ marginTop: 80, transformOrigin: "top center" }}>
          <div className="flex flex-col items-center">
            <HookDot />
            <RopeSVG h={60} />
          </div>
          <div className="bg-white rounded-3xl p-6 md:p-7"
            style={{
              boxShadow: "0 8px 40px rgba(120,53,15,0.08), 0 2px 8px rgba(0,0,0,0.04)",
              border: "1.5px solid rgba(251,191,36,0.2)",
            }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-green-50 border border-amber-200/60 px-3 py-1.5 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
              <span className="text-amber-800 text-[10px] font-bold tracking-widest uppercase">{year}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-snug">{title}</h3>
            <p className="text-slate-600 text-sm md:text-[15px] leading-[1.75] font-light">{body}</p>
          </div>
        </div>
      </div>

      {/* ── Image card — hangs from image-branch tip via rope ── */}
      <div ref={imgRef}
        className={`flex-1 ${reverse ? "md:pl-[4.5rem]" : "md:pr-[4.5rem]"} px-4 w-full z-10`}
        style={{ opacity: 0 }}
      >
        {/* Mobile: flat */}
        <div className="block md:hidden relative rounded-3xl overflow-hidden"
          style={{ aspectRatio: "4/3", boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
          <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
        </div>
        {/* Desktop: rope + hanging image */}
        <div className="hidden md:block" style={{ marginTop: 80, transformOrigin: "top center" }}>
          <div className="flex flex-col items-center">
            <HookDot />
            <RopeSVG h={80} />
          </div>
          <div className="relative rounded-3xl overflow-hidden group"
            style={{
              aspectRatio: "4/3",
              boxShadow: "0 20px 56px rgba(0,0,0,0.16), 0 0 0 2px rgba(134,239,172,0.22)",
            }}
          >
            <img src={img} alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
            <span className="n-leaf absolute top-4 right-4 text-xl select-none drop-shadow-lg"
              style={{ opacity: 0 }}>🍃</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────────── */
export default function OurStory() {
  // ── Redux store data ────────────────────────────────────────────────────
  const stats        = useSelector(selectStats);
  const values       = useSelector(selectValues);
  const testimonials = useSelector(selectTestimonials);
  const gallery      = useSelector(selectGallery);

  // ── Image key → imported module map ─────────────────────────────────────
  // Images cannot live in Redux (ES-module objects), so we resolve imgKey
  // strings here and keep the imports at the top of the file.
  const imageMap = {
    heroImg, educationImg, edu1Img, edu2Img,
    empowerImg1, empowerImg2, empowerImg3,
    medicalImg, campImg, kanayadanHero, kanayadanFuture, kanayadanSupport,
    roadImg, elderFoodImg, elderEmotional,
    healthImg, widowImg, mealImg, donateImg, cowImg, ritesImg,
  };

  const trunkRef     = useRef(null);
  const timelineRef  = useRef(null);

  useEffect(() => {
    if (!trunkRef.current || !timelineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(trunkRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 65%",
          end: "bottom 25%",
          scrub: 2,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white font-sans overflow-x-hidden">

      {/* ╔══════════════════════════════════════════════════╗
          ║  HERO - Premium Design                           ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative min-h-[92vh] flex items-end pb-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImg} alt="SevaIndia — Our Story" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-slate-900/40" />
          {/* Animated gradient orbs */}
          <div className="absolute top-20 -right-32 w-72 h-72 bg-green-500/20 rounded-full blur-3xl opacity-40 animate-pulse" />
          <div className="absolute -bottom-20 -left-32 w-96 h-96 bg-green-400/15 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="max-w-2xl" style={{ animation: "fadeUp 0.9s ease both" }}>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/30 to-green-400/20 border border-green-400/60 text-green-200 text-[11px] font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase shadow-lg shadow-green-500/10 backdrop-blur-sm">
              ✨ Founded 2016 · Serving India · 22 States
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              One spark.<br />
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">A million lives.</span>
            </h1>
            <p className="text-slate-200 text-lg md:text-xl leading-relaxed max-w-xl font-light">
              SevaIndia began as a handwritten list of 12 NGOs and a WhatsApp group. Today we're India's fastest-growing platform connecting compassion to impact across 22 states.
            </p>
          </div>
          <div className="mt-16 flex items-center gap-3 text-slate-300 text-sm font-medium" style={{ animation: "fadeUp 0.9s ease 0.3s both" }}>
            <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-slate-300 rounded-full" style={{ animation: "bob 1.6s ease-in-out infinite" }} />
            </div>
            Scroll to explore our journey
          </div>
        </div>

        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
          @keyframes bob { 0%,100% { transform:translateY(0) } 50% { transform:translateY(8px) } }
        `}</style>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  ORIGIN STORY - Enhanced Layout                 ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/30 rounded-full blur-3xl" />
        
        <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
          <FadeIn delay={0.05}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <span className="text-green-600 text-2xl">🌱</span>
                <span className="text-green-700 text-[11px] font-bold tracking-widest uppercase">How it all started</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-snug">
                A problem we couldn't ignore
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6 text-[15px] md:text-lg font-light">
                In 2016, our founder Arjun Mehta was volunteering at a small orphanage in Lucknow when he realised the NGO was turning away food donations simply because they had no way to announce a surplus. Meanwhile, donors across the city had resources they were willing to give — but no trusted way to find the right NGO.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6 text-[15px] md:text-lg font-light">
                He started a spreadsheet. Then a WhatsApp group. Then a simple website. Word spread fast. Within three months, 47 NGOs had signed up. Within a year, the platform had facilitated over ₹18 lakh in donations and connected 3,400 volunteers to causes that needed them.
              </p>
              <p className="text-slate-700 leading-relaxed text-[15px] md:text-lg font-light">
                That website became <strong className="text-slate-900 font-bold">SevaIndia</strong> — a name that holds the two things we believe in most: <em className="text-green-700">Seva</em> (selfless service) and the belief that this is everyone's India to care for.
              </p>
              <div className="pt-4 flex items-center gap-4">
                <div className="h-1 w-12 bg-gradient-to-r from-green-400 to-green-300" />
                <span className="text-green-600 font-semibold text-sm">Built on trust · Powered by compassion</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-green-200 to-green-100 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: "3/4" }}>
                <img src={educationImg} alt="Children at the orphanage — where it all began" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating badge with animation */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-5 flex items-center gap-4 border-2 border-green-100 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300" style={{ animation: "float 3s ease-in-out infinite" }}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-3xl shadow-md">🌱</div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Founded</div>
                  <div className="text-slate-900 font-black text-lg">2016, Lucknow</div>
                </div>
              </div>
              {/* Second small image with border */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hover:shadow-3xl transition-shadow duration-300">
                <img src={edu1Img} alt="Education programme" className="w-full h-full object-cover" />
              </div>
            </div>
          </FadeIn>
        </div>

        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        `}</style>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  FULL-WIDTH QUOTE - Enhanced Design              ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative h-80 md:h-[500px] overflow-hidden group">
        <img src={mealImg} alt="Meal distribution — community care" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/60 to-slate-900/45 group-hover:from-slate-900/80 group-hover:via-slate-900/65 group-hover:to-slate-900/50 transition-all duration-500 flex items-center justify-center px-6" />
        <FadeIn>
          <blockquote className="absolute inset-0 flex items-center justify-center text-center z-10 px-6">
            <div className="max-w-3xl">
              <p className="text-white text-3xl md:text-4xl lg:text-5xl font-black leading-snug italic mb-8">
                "We didn't build a charity. We built <span className="text-green-300">infrastructure</span> for generosity."
              </p>
              <cite className="text-green-200 text-base font-bold not-italic tracking-widest uppercase block">
                — Arjun Mehta, Founder & CEO
              </cite>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <div className="w-2 h-2 rounded-full bg-green-400/60" />
                <div className="w-2 h-2 rounded-full bg-green-400/30" />
              </div>
            </div>
          </blockquote>
        </FadeIn>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  LIVING TREE TIMELINE  (commented out)           ║
          ╚══════════════════════════════════════════════════╝ */}
      {/* <section ref={timelineRef} className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-6">
                <span className="text-2xl">🌳</span>
                <span className="text-green-700 text-[11px] font-bold tracking-widest uppercase">Our journey</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Milestones that shaped us</h2>
              <p className="text-slate-500 max-w-lg mx-auto text-base font-light leading-relaxed">Eight years of steady work, hard lessons, and moments that reminded us why we started.</p>
            </div>
          </FadeIn>

          <div className="relative flex flex-col">
            <div className="absolute left-1/2 -translate-x-1/2 top-[56px] bottom-0 hidden md:block pointer-events-none"
              style={{ width: 64, zIndex: 1 }}>
              <svg width="100%" height="100%" viewBox="0 0 64 100"
                preserveAspectRatio="none" className="absolute inset-0 overflow-visible">
                <defs>
                  <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#120500" />
                    <stop offset="20%"  stopColor="#3b1202" />
                    <stop offset="45%"  stopColor="#78350f" />
                    <stop offset="65%"  stopColor="#c47a1a" />
                    <stop offset="82%"  stopColor="#92400e" />
                    <stop offset="100%" stopColor="#2c0f02" />
                  </linearGradient>
                  <linearGradient id="trunkHL" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="transparent" />
                    <stop offset="42%"  stopColor="rgba(196,118,42,0.28)" />
                    <stop offset="60%"  stopColor="rgba(230,160,60,0.46)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path d="M 30,0 C 33,10 27,20 31,30 C 35,40 25,50 30,60 C 35,70 26,80 31,90 C 34,96 30,100 30,100"
                  stroke="rgba(180,90,0,0.15)" strokeWidth="24" fill="none"
                  strokeLinecap="round" transform="translate(2,0)" />
                <path d="M 30,0 C 33,10 27,20 31,30 C 35,40 25,50 30,60 C 35,70 26,80 31,90 C 34,96 30,100 30,100"
                  stroke="rgba(0,0,0,0.18)" strokeWidth="18" fill="none"
                  strokeLinecap="round" transform="translate(2.5,1.5)" />
                <path ref={trunkRef}
                  d="M 30,0 C 33,10 27,20 31,30 C 35,40 25,50 30,60 C 35,70 26,80 31,90 C 34,96 30,100 30,100"
                  stroke="url(#trunkGrad)" strokeWidth="16" fill="none"
                  strokeLinecap="round"
                  pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
                <path d="M 30,0 C 33,10 27,20 31,30 C 35,40 25,50 30,60 C 35,70 26,80 31,90 C 34,96 30,100 30,100"
                  stroke="url(#trunkHL)" strokeWidth="5" fill="none" strokeLinecap="round" />
                {[14, 28, 42, 56, 70, 84].map((y) => (
                  <line key={y} x1={22} y1={y} x2={39} y2={y - 2}
                    stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
                ))}
              </svg>
            </div>

            <VineCluster side="right" offsetX={26} topPct="16%" />
            <VineCluster side="left"  offsetX={26} topPct="32%" />
            <VineCluster side="right" offsetX={22} topPct="49%" />
            <VineCluster side="left"  offsetX={24} topPct="65%" />
            <VineCluster side="right" offsetX={26} topPct="81%" />

            {[
              { year: "2016 — The Beginning",            title: "12 NGOs. One spreadsheet.",       img: edu2Img,      reverse: false,
                body: "Arjun's spreadsheet goes online. Twelve NGOs from Uttar Pradesh join. The first coordination — ₹5,000 worth of stationery for a school in Barabanki — takes three days and three phone calls, but it works. Every child in that classroom got a notebook and a pencil. The platform was born." },
              { year: "2018 — Expanding the mission",    title: "When giving goes beyond money",   img: empowerImg1,  reverse: true,
                body: "We launch volunteer matching — connecting skilled professionals (doctors, lawyers, teachers, engineers) with NGOs that need their expertise on weekends. Over 800 professionals sign up in the first two months. Women's empowerment groups across UP and Bihar are among the first beneficiaries." },
              { year: "2020 — The COVID response",       title: "₹2.4 Cr in 90 days",             img: campImg,      reverse: false,
                body: "When the pandemic hit, SevaIndia became the nerve centre for rural relief. We onboarded 340 new NGOs in 30 days, coordinated 1,200 volunteer deployments, set up mobile medical camps in 6 states, and facilitated ₹2.4 crore in emergency relief — food, medicine, and protective gear for the most vulnerable." },
              { year: "2022 — Kanyadan Yojana",          title: "Celebrating 4,000 families",      img: kanayadanHero, reverse: true,
                body: "We partner with state governments to roll out our flagship welfare programme — subsidising weddings for economically marginalised families and ensuring every bride has the dignity her day deserves. In year one, 1,400 families benefit. By 2024, the number crosses 4,000 across 9 states." },
              { year: "2023 — Elder care & animal welfare", title: "No one left behind",           img: elderFoodImg, reverse: false,
                body: "We launch dedicated elder care programmes — nutrition support, emotional companionship, and medical access for India's forgotten elderly population. Simultaneously, our Gau Seva programme extends our reach to animal welfare, because compassion has no boundaries." },
              { year: "2024 — Rojgar Yojana & village tech", title: "Building rural livelihoods", img: roadImg,      reverse: true,
                body: "We launch our employment platform connecting rural youth to skill training, apprenticeships, and job placements — giving young people a path forward. Our village portal gives every partner village a digital home: health data, problem reports, event calendars, and real-time impact tracking." },
            ].map((item, i) => (
              <TreeNode key={i} {...item} index={i} />
            ))}
          </div>
        </div>
      </section> */}

      {/* ╔══════════════════════════════════════════════════╗
          ║  IMPACT STATS - Premium Style                    ║
          ╚══════════════════════════════════════════════════╝ */}
      <section
        className="relative py-32 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)" }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-20">
              <p className="text-green-100 text-center text-[11px] font-bold tracking-widest uppercase mb-6">
                🎯 Eight Years · Twenty-Two States · Countless Lives
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Our impact, by the numbers</h2>
              <p className="text-green-100 max-w-xl mx-auto text-base font-light">Every number represents a life touched, a family supported, a dream made possible.</p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {stats.map(({ value, suffix, label, delay }) => (
              <StatCard key={label} value={value} suffix={suffix} label={label} delay={delay} />
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  VALUES - Redesigned                             ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        {/* Background decoration */}
        <div className="absolute -top-40 right-0 w-80 h-80 bg-green-100/25 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-6">
                <span className="text-2xl">💎</span>
                <span className="text-green-700 text-[11px] font-bold tracking-widest uppercase">What we believe in</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">The values we live by</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">These six pillars guide every decision we make, every programme we build, and every life we touch.</p>
            </div>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ emoji, title, body, color, borderColor, textColor, delay }) => (
              <FadeIn key={title} delay={delay}>
                <div className={`bg-gradient-to-br ${color} rounded-2xl p-7 border ${borderColor} hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full group`}>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                  <h3 className="text-base font-black text-slate-800 mb-3">{title}</h3>
                  <p className={`${textColor} text-sm leading-relaxed font-light`}>{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  PHOTO MOSAIC - Premium Gallery                  ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative max-w-7xl mx-auto px-6 pb-32">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-6">
              <span className="text-2xl">🖼️</span>
              <span className="text-green-700 text-[11px] font-bold tracking-widest uppercase">Our Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">A glimpse of the work</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base font-light">Real moments from the communities and volunteers who make our mission possible.</p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.row1.map(({ imgKey, alt, delay, span2 }) => (
            <FadeIn key={imgKey} delay={delay} className={span2 ? "col-span-2 row-span-2" : ""}>
              <div className="rounded-2xl overflow-hidden group"
                style={span2 ? { height: "100%", minHeight: "320px" } : { aspectRatio: "4/3" }}>
                <img
                  src={imageMap[imgKey]}
                  alt={alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  style={span2 ? { minHeight: "320px" } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Second row mosaic */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
          {gallery.row2.map(({ imgKey, alt, delay }) => (
            <FadeIn key={imgKey} delay={delay}>
              <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "1/1" }}>
                <img
                  src={imageMap[imgKey]}
                  alt={alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  TESTIMONIALS - Enhanced Design                  ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" }}>
        {/* Animated background elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-400/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/40 px-4 py-2 rounded-full mb-6">
                <span className="text-2xl">💬</span>
                <span className="text-green-300 text-[11px] font-bold tracking-widest uppercase">Voices from the field</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Stories that keep us going</h2>
              <p className="text-slate-300 max-w-2xl mx-auto text-base font-light">These are the words of the people whose lives have been touched by our work.</p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, name, role, imgKey, icon, delay }) => (
              <FadeIn key={name} delay={delay}>
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 flex flex-col h-full hover:shadow-2xl hover:border-green-400/30 transition-all duration-300 group">
                  <div className="h-40 overflow-hidden relative">
                    <img src={imageMap[imgKey]} alt={name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <div className="text-3xl mb-4">{icon}</div>
                    <p className="text-slate-100 text-[15px] leading-relaxed italic flex-1 mb-6 font-light">"{quote}"</p>
                    <div className="border-t border-slate-700/50 pt-4">
                      <div className="text-white font-black text-base">{name}</div>
                      <div className="text-slate-400 text-xs mt-1.5 font-medium">{role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  WHAT'S NEXT - Enhanced                         ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        {/* Background decoration */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-100/20 rounded-full blur-3xl" />
        
        <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
          <FadeIn delay={0.05}>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-green-200/30 to-green-100/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/3" }}>
                <img src={kanayadanFuture} alt="Looking ahead — the future of SevaIndia" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Overlay card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-white/40 group-hover:shadow-3xl transition-all duration-300">
                <p className="text-slate-800 text-sm font-bold leading-relaxed">
                  🎯 <span className="text-green-700">Goal:</span> Present in every district of India by 2030
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <span className="text-2xl">🚀</span>
                <span className="text-green-700 text-[11px] font-bold tracking-widest uppercase">Looking ahead</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-snug">
                The next chapter is just beginning
              </h2>
              <p className="text-slate-600 leading-relaxed text-[15px] md:text-lg font-light">
                By 2030, we aim to be present in every district of India — not through offices, but through a network of trusted NGOs, trained volunteers, and communities that carry the work forward themselves.
              </p>
              <p className="text-slate-600 leading-relaxed text-[15px] md:text-lg font-light">
                We're building AI tools to match donors and volunteers with the exact needs they're best placed to address. We're expanding village portals to include health records, agricultural data, and livelihood tracking. And we're opening our impact data to researchers who can help us understand what actually works.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-4">
                {["700 districts by 2027", "AI-powered matching", "Open impact data", "1 Cr beneficiaries by 2030"].map(tag => (
                  <span key={tag} className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 text-[11px] font-bold px-4 py-2 rounded-full hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  CTA - Premium Design                           ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative overflow-hidden min-h-96">
        <div className="absolute inset-0">
          <img src={donateImg} alt="Be part of the story" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/40" />
          {/* Animated background orbs */}
          <div className="absolute top-10 -right-32 w-64 h-64 bg-green-500/20 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-32 md:py-40 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Be part of the next chapter
            </h2>
            <p className="text-slate-100 text-lg md:text-xl mb-12 leading-relaxed font-light max-w-2xl mx-auto">
              Whether you donate ₹100 or a hundred hours of your time — your contribution writes the next line of this story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/donate"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 inline-block">
                💝 Donate Now
              </a>
              <a href="/volunteer"
                className="border-2 border-white/60 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-300 backdrop-blur-sm hover:border-white hover:shadow-lg inline-block">
                🤝 Become a Volunteer
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
