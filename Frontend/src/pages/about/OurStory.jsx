import { useEffect, useRef, useState } from "react";

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

/* ── Timeline item ──────────────────────────────────────────────────────────── */
function TimelineItem({ year, title, body, img, reverse, delay }) {
  const [ref, inView] = useInView(0.12);
  return (
    <div
      ref={ref}
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center relative`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)", transition: `all 0.75s ease ${delay}s` }}
    >
      {/* Timeline dot */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-6 h-6 z-20">
        <div className="w-full h-full rounded-full bg-white border-4 border-green-400 shadow-lg" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 px-3 py-1 rounded-full border border-green-200 mb-4">
          <span className="text-green-700 text-[10px] font-bold tracking-widest uppercase">{year}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-snug">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-[15px] md:text-base font-light">{body}</p>
      </div>
      <div className="flex-1 w-full">
        <div className="rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300 group" style={{ aspectRatio: "4/3" }}>
          <img 
            src={img} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            loading="lazy" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────────── */
export default function OurStory() {
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
          ║  FULL-WIDTH QUOTE - Enhanced Design             ║
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
          ║  TIMELINE - Modern Design                        ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        {/* Background decoration */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-100/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-6">
                <span className="text-2xl">📈</span>
                <span className="text-green-700 text-[11px] font-bold tracking-widest uppercase">Our journey</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Milestones that shaped us</h2>
              <p className="text-slate-500 max-w-lg mx-auto text-base font-light leading-relaxed">Eight years of steady work, hard lessons, and moments that reminded us why we started.</p>
            </div>
          </FadeIn>

          {/* Vertical timeline connector line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-32 bottom-0 w-1 bg-gradient-to-b from-green-200 via-green-300 to-green-200 hidden md:block" />

          <div className="flex flex-col gap-24">
            <TimelineItem
              year="2016 — The Beginning"
              title="12 NGOs. One spreadsheet."
              body="Arjun's spreadsheet goes online. Twelve NGOs from Uttar Pradesh join. The first coordination — ₹5,000 worth of stationery for a school in Barabanki — takes three days and three phone calls, but it works. Every child in that classroom got a notebook and a pencil. The platform was born."
              img={edu2Img}
              reverse={false}
              delay={0.1}
            />

            <TimelineItem
              year="2018 — Expanding the mission"
              title="When giving goes beyond money"
              body="We launch volunteer matching — connecting skilled professionals (doctors, lawyers, teachers, engineers) with NGOs that need their expertise on weekends. Over 800 professionals sign up in the first two months. Women's empowerment groups across UP and Bihar are among the first beneficiaries."
              img={empowerImg1}
              reverse={true}
              delay={0.1}
            />

            <TimelineItem
              year="2020 — The COVID response"
              title="₹2.4 Cr in 90 days"
              body="When the pandemic hit, SevaIndia became the nerve centre for rural relief. We onboarded 340 new NGOs in 30 days, coordinated 1,200 volunteer deployments, set up mobile medical camps in 6 states, and facilitated ₹2.4 crore in emergency relief — food, medicine, and protective gear for the most vulnerable."
              img={campImg}
              reverse={false}
              delay={0.1}
            />

            <TimelineItem
              year="2022 — Kanyadan Yojana"
              title="Celebrating 4,000 families"
              body="We partner with state governments to roll out our flagship welfare programme — subsidising weddings for economically marginalised families and ensuring every bride has the dignity her day deserves. In year one, 1,400 families benefit. By 2024, the number crosses 4,000 across 9 states."
              img={kanayadanHero}
              reverse={true}
              delay={0.1}
            />

            <TimelineItem
              year="2023 — Elder care & animal welfare"
              title="No one left behind"
              body="We launch dedicated elder care programmes — nutrition support, emotional companionship, and medical access for India's forgotten elderly population. Simultaneously, our Gau Seva programme extends our reach to animal welfare, because compassion has no boundaries."
              img={elderFoodImg}
              reverse={false}
              delay={0.1}
            />

            <TimelineItem
              year="2024 — Rojgar Yojana & village tech"
              title="Building rural livelihoods"
              body="We launch our employment platform connecting rural youth to skill training, apprenticeships, and job placements — giving young people a path forward. Our village portal gives every partner village a digital home: health data, problem reports, event calendars, and real-time impact tracking."
              img={roadImg}
              reverse={true}
              delay={0.1}
            />
          </div>
        </div>
      </section>

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
            <StatCard value={1200}  suffix="+"  label="Partner NGOs"         delay={0}    />
            <StatCard value={84000} suffix="+"  label="Beneficiaries"        delay={0.12} />
            <StatCard value={9400}  suffix="+"  label="Volunteers"           delay={0.24} />
            <StatCard value={22}    suffix=""   label="States"               delay={0.36} />
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
            {[
              { emoji: "🔍", title: "Radical Transparency", body: "Every rupee tracked. Every programme audited. We publish quarterly impact reports — warts and all — because the people we serve and the donors who fund us deserve the truth.", color: "from-blue-50 to-blue-100", borderColor: "border-blue-200", textColor: "text-blue-700", delay: 0 },
              { emoji: "🌱", title: "Grassroots First", body: "We don't parachute solutions into communities. We listen, learn, and build alongside the people we serve. Local knowledge is always the most important knowledge.", color: "from-green-50 to-green-100", borderColor: "border-green-200", textColor: "text-green-700", delay: 0.1 },
              { emoji: "⚡", title: "Technology as a Tool", body: "Tech should amplify human compassion, not replace it. Every feature we build must make it easier to give, to volunteer, or to get help — never harder.", color: "from-yellow-50 to-yellow-100", borderColor: "border-yellow-200", textColor: "text-yellow-700", delay: 0.2 },
              { emoji: "🔁", title: "Long-Term Commitment", body: "We don't show up for photo-ops. Our village partners have had the same field officer for years. Continuity builds trust, and trust is what makes real change possible.", color: "from-red-50 to-red-100", borderColor: "border-red-200", textColor: "text-red-700", delay: 0 },
              { emoji: "🧭", title: "Dignity Above All", body: "Aid that humiliates is no aid at all. Every programme is designed to preserve and strengthen the dignity and agency of the people we work with.", color: "from-purple-50 to-purple-100", borderColor: "border-purple-200", textColor: "text-purple-700", delay: 0.1 },
              { emoji: "📢", title: "Amplifying Voices", body: "The communities we serve know what they need. Our job is to give them the platform, the resources, and the tools — then step back and let them lead.", color: "from-indigo-50 to-indigo-100", borderColor: "border-indigo-200", textColor: "text-indigo-700", delay: 0.2 },
            ].map(({ emoji, title, body, color, borderColor, textColor, delay }) => (
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
          ║  PHOTO MOSAIC - Premium Gallery                 ║
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
          {/* Large cell top-left spanning 2 cols + 2 rows */}
          <FadeIn delay={0} className="col-span-2 row-span-2">
            <div className="rounded-2xl overflow-hidden group" style={{ height: "100%", minHeight: "320px" }}>
              <img 
                src={healthImg} 
                alt="Orphan health programme" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                style={{ minHeight: "320px" }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "4/3" }}>
              <img 
                src={empowerImg2} 
                alt="Women empowerment" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "4/3" }}>
              <img 
                src={kanayadanSupport} 
                alt="Kanyadan support" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "4/3" }}>
              <img 
                src={elderEmotional} 
                alt="Elder care — emotional support" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "4/3" }}>
              <img 
                src={empowerImg3} 
                alt="Rural women's group" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>
        </div>

        {/* Second row mosaic */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
          <FadeIn delay={0.1}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "1/1" }}>
              <img 
                src={medicalImg} 
                alt="Medical camp" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "1/1" }}>
              <img 
                src={cowImg} 
                alt="Gau Seva programme" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "1/1" }}>
              <img 
                src={widowImg} 
                alt="Widow support programme" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "1/1" }}>
              <img 
                src={ritesImg} 
                alt="Last rites support" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="rounded-2xl overflow-hidden group" style={{ aspectRatio: "1/1" }}>
              <img 
                src={mealImg} 
                alt="Meal programme" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  TESTIMONIALS - Enhanced Design                 ║
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
            {[
              {
                quote: "Before SevaIndia, I spent 40% of my time fundraising. Now I spend 90% doing actual work. The platform genuinely changed how we operate as an NGO.",
                name: "Priya Sharma",
                role: "Director, Asha Kiran NGO — Patna",
                img: empowerImg2,
                icon: "🎯",
                delay: 0,
              },
              {
                quote: "My daughter's wedding happened with full dignity because of the Kanyadan Yojana. I cannot put into words what that meant for our family.",
                name: "Ramesh Kumar",
                role: "Beneficiary, Allahabad",
                img: kanayadanSupport,
                icon: "💍",
                delay: 0.1,
              },
              {
                quote: "I'm a software engineer in Pune. Every weekend I mentor rural students through SevaIndia. It is the most meaningful thing I do with my time.",
                name: "Ananya Joshi",
                role: "Volunteer, Pune",
                img: edu1Img,
                icon: "🤝",
                delay: 0.2,
              },
            ].map(({ quote, name, role, img, icon, delay }) => (
              <FadeIn key={name} delay={delay}>
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 flex flex-col h-full hover:shadow-2xl hover:border-green-400/30 transition-all duration-300 group">
                  {/* Image strip with overlay */}
                  <div className="h-40 overflow-hidden relative">
                    <img src={img} alt={name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
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
