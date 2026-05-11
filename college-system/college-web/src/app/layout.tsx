import type { Metadata } from "next";
import { Sora, Manrope, JetBrains_Mono, Inter, Poppins, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400","500","600"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });

export const metadata: Metadata = {
  title: "Falcon College",
  description: "Falcon College — Empowering Education, Inspiring Excellence. The premier college management & information portal.",
  icons: { icon: "/falcon-icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var saved = localStorage.getItem('theme-preference');
    var parsed = saved ? JSON.parse(saved) : null;
    var s = parsed && parsed.state;
    var el = document.documentElement;

    // Colour scheme — apply vars directly via style.setProperty (same as card/font)
    var scheme = (s && s.schemeId) || 'default';
    var schemeVars = {
      'default':          {'--primary':'#3D86C9','--primary-dark':'#2A6FB6','--primary-light':'#6BA3D8','--primary-hover':'#2A6FB6','--info':'#3D86C9','--border-focus':'#3D86C9','--shadow-focus':'0 0 0 4px rgba(61,134,201,0.22)','--shadow-glow':'0 0 0 4px rgba(61,134,201,0.22)','--surface-alt':'rgba(61,134,201,0.06)','--surface-hover':'rgba(61,134,201,0.05)','--bg-tint':'rgba(61,134,201,0.06)','--gold':'#E0A11B'},
      'teal':             {'--primary':'#0D9488','--primary-dark':'#0F766E','--primary-light':'#2DD4BF','--primary-hover':'#0F766E','--info':'#0D9488','--border-focus':'#0D9488','--shadow-focus':'0 0 0 4px rgba(13,148,136,0.22)','--shadow-glow':'0 0 0 4px rgba(13,148,136,0.22)','--surface-alt':'rgba(13,148,136,0.06)','--surface-hover':'rgba(13,148,136,0.05)','--bg-tint':'rgba(13,148,136,0.06)','--gold':'#E0A11B'},
      'sapphire':         {'--primary':'#1E5BA8','--primary-dark':'#0D3A66','--primary-light':'#6BA3D8','--primary-hover':'#0D3A66','--info':'#1E5BA8','--border-focus':'#1E5BA8','--shadow-focus':'0 0 0 4px rgba(30,91,168,0.22)','--shadow-glow':'0 0 0 4px rgba(30,91,168,0.22)','--surface-alt':'rgba(30,91,168,0.06)','--surface-hover':'rgba(30,91,168,0.05)','--bg-tint':'rgba(30,91,168,0.06)','--gold':'#E0A11B'},
      'emerald':          {'--primary':'#059669','--primary-dark':'#015841','--primary-light':'#6EE7B7','--primary-hover':'#015841','--info':'#059669','--border-focus':'#059669','--shadow-focus':'0 0 0 4px rgba(5,150,105,0.22)','--shadow-glow':'0 0 0 4px rgba(5,150,105,0.22)','--surface-alt':'rgba(5,150,105,0.06)','--surface-hover':'rgba(5,150,105,0.05)','--bg-tint':'rgba(5,150,105,0.06)','--gold':'#D4A574'},
      'slate-plum':       {'--primary':'#6B21A8','--primary-dark':'#3F0F5C','--primary-light':'#C084FC','--primary-hover':'#3F0F5C','--info':'#6B21A8','--border-focus':'#6B21A8','--shadow-focus':'0 0 0 4px rgba(107,33,168,0.22)','--shadow-glow':'0 0 0 4px rgba(107,33,168,0.22)','--surface-alt':'rgba(107,33,168,0.06)','--surface-hover':'rgba(107,33,168,0.05)','--bg-tint':'rgba(107,33,168,0.06)','--gold':'#C2B280'},
      'crimson':          {'--primary':'#C2185B','--primary-dark':'#800E47','--primary-light':'#F48FB1','--primary-hover':'#800E47','--info':'#C2185B','--border-focus':'#C2185B','--shadow-focus':'0 0 0 4px rgba(194,24,91,0.22)','--shadow-glow':'0 0 0 4px rgba(194,24,91,0.22)','--surface-alt':'rgba(194,24,91,0.06)','--surface-hover':'rgba(194,24,91,0.05)','--bg-tint':'rgba(194,24,91,0.06)','--gold':'#E0A11B'},
      'teal-horizon':     {'--primary':'#0891B2','--primary-dark':'#0E7490','--primary-light':'#67E8F9','--primary-hover':'#0E7490','--info':'#0891B2','--border-focus':'#0891B2','--shadow-focus':'0 0 0 4px rgba(8,145,178,0.22)','--shadow-glow':'0 0 0 4px rgba(8,145,178,0.22)','--surface-alt':'rgba(8,145,178,0.06)','--surface-hover':'rgba(8,145,178,0.05)','--bg-tint':'rgba(8,145,178,0.06)','--gold':'#E0A11B'},
      'amber-heritage':   {'--primary':'#B45309','--primary-dark':'#78350F','--primary-light':'#FCD34D','--primary-hover':'#78350F','--info':'#B45309','--border-focus':'#B45309','--shadow-focus':'0 0 0 4px rgba(180,83,9,0.22)','--shadow-glow':'0 0 0 4px rgba(180,83,9,0.22)','--surface-alt':'rgba(180,83,9,0.06)','--surface-hover':'rgba(180,83,9,0.05)','--bg-tint':'rgba(180,83,9,0.06)','--gold':'#D4A574'},
      'indigo':           {'--primary':'#4F46E5','--primary-dark':'#3730A3','--primary-light':'#A5B4FC','--primary-hover':'#3730A3','--info':'#4F46E5','--border-focus':'#4F46E5','--shadow-focus':'0 0 0 4px rgba(79,70,229,0.22)','--shadow-glow':'0 0 0 4px rgba(79,70,229,0.22)','--surface-alt':'rgba(79,70,229,0.06)','--surface-hover':'rgba(79,70,229,0.05)','--bg-tint':'rgba(79,70,229,0.06)','--gold':'#F59E0B'},
      'jade':             {'--primary':'#0F766E','--primary-dark':'#134E4A','--primary-light':'#5EEAD4','--primary-hover':'#134E4A','--info':'#0F766E','--border-focus':'#0F766E','--shadow-focus':'0 0 0 4px rgba(15,118,110,0.22)','--shadow-glow':'0 0 0 4px rgba(15,118,110,0.22)','--surface-alt':'rgba(15,118,110,0.06)','--surface-hover':'rgba(15,118,110,0.05)','--bg-tint':'rgba(15,118,110,0.06)','--gold':'#C2B280'},
      'coral':            {'--primary':'#EA580C','--primary-dark':'#B74909','--primary-light':'#FDBA74','--primary-hover':'#B74909','--info':'#EA580C','--border-focus':'#EA580C','--shadow-focus':'0 0 0 4px rgba(234,88,12,0.22)','--shadow-glow':'0 0 0 4px rgba(234,88,12,0.22)','--surface-alt':'rgba(234,88,12,0.06)','--surface-hover':'rgba(234,88,12,0.05)','--bg-tint':'rgba(234,88,12,0.06)','--gold':'#E0A11B'},
      'cobalt':           {'--primary':'#1E40AF','--primary-dark':'#0F2555','--primary-light':'#93C5FD','--primary-hover':'#0F2555','--info':'#1E40AF','--border-focus':'#1E40AF','--shadow-focus':'0 0 0 4px rgba(30,64,175,0.22)','--shadow-glow':'0 0 0 4px rgba(30,64,175,0.22)','--surface-alt':'rgba(30,64,175,0.06)','--surface-hover':'rgba(30,64,175,0.05)','--bg-tint':'rgba(30,64,175,0.06)','--gold':'#D4A574'},
      'violet-prestige':  {'--primary':'#7C3AED','--primary-dark':'#5B21B6','--primary-light':'#C4B5FD','--primary-hover':'#5B21B6','--info':'#7C3AED','--border-focus':'#7C3AED','--shadow-focus':'0 0 0 4px rgba(124,58,237,0.22)','--shadow-glow':'0 0 0 4px rgba(124,58,237,0.22)','--surface-alt':'rgba(124,58,237,0.06)','--surface-hover':'rgba(124,58,237,0.05)','--bg-tint':'rgba(124,58,237,0.06)','--gold':'#F59E0B'},
      'rose-garden':      {'--primary':'#BE185D','--primary-dark':'#831843','--primary-light':'#F9A8D4','--primary-hover':'#831843','--info':'#BE185D','--border-focus':'#BE185D','--shadow-focus':'0 0 0 4px rgba(190,24,93,0.22)','--shadow-glow':'0 0 0 4px rgba(190,24,93,0.22)','--surface-alt':'rgba(190,24,93,0.06)','--surface-hover':'rgba(190,24,93,0.05)','--bg-tint':'rgba(190,24,93,0.06)','--gold':'#E0A11B'},
      'forest-authority': {'--primary':'#15803D','--primary-dark':'#065F46','--primary-light':'#86EFAC','--primary-hover':'#065F46','--info':'#15803D','--border-focus':'#15803D','--shadow-focus':'0 0 0 4px rgba(21,128,61,0.22)','--shadow-glow':'0 0 0 4px rgba(21,128,61,0.22)','--surface-alt':'rgba(21,128,61,0.06)','--surface-hover':'rgba(21,128,61,0.05)','--bg-tint':'rgba(21,128,61,0.06)','--gold':'#D4A574'},
      'cobalt-sky':       {'--primary':'#0284C7','--primary-dark':'#0369A1','--primary-light':'#7DD3FC','--primary-hover':'#0369A1','--info':'#0284C7','--border-focus':'#0284C7','--shadow-focus':'0 0 0 4px rgba(2,132,199,0.22)','--shadow-glow':'0 0 0 4px rgba(2,132,199,0.22)','--surface-alt':'rgba(2,132,199,0.06)','--surface-hover':'rgba(2,132,199,0.05)','--bg-tint':'rgba(2,132,199,0.06)','--gold':'#E0A11B'},
      'deep-slate':       {'--primary':'#334155','--primary-dark':'#1E293B','--primary-light':'#94A3B8','--primary-hover':'#1E293B','--info':'#334155','--border-focus':'#334155','--shadow-focus':'0 0 0 4px rgba(51,65,85,0.22)','--shadow-glow':'0 0 0 4px rgba(51,65,85,0.22)','--surface-alt':'rgba(51,65,85,0.06)','--surface-hover':'rgba(51,65,85,0.05)','--bg-tint':'rgba(51,65,85,0.06)','--gold':'#C2B280'},
      /* ── Rich 8-family vibrant schemes ── */
      'midnight-indigo':  {'--primary':'#6366f1','--primary-dark':'#4f46e5','--primary-light':'#818cf8','--primary-hover':'#4f46e5','--info':'#6366f1','--border-focus':'#6366f1','--shadow-focus':'0 0 0 4px rgba(99,102,241,0.28)','--shadow-glow':'0 0 0 4px rgba(99,102,241,0.28)','--surface-alt':'rgba(99,102,241,0.08)','--surface-hover':'rgba(99,102,241,0.05)','--bg-tint':'rgba(99,102,241,0.06)','--gold':'#fbbf24'},
      'royal-violet':     {'--primary':'#8b5cf6','--primary-dark':'#7c3aed','--primary-light':'#a78bfa','--primary-hover':'#7c3aed','--info':'#8b5cf6','--border-focus':'#8b5cf6','--shadow-focus':'0 0 0 4px rgba(139,92,246,0.28)','--shadow-glow':'0 0 0 4px rgba(139,92,246,0.28)','--surface-alt':'rgba(139,92,246,0.08)','--surface-hover':'rgba(139,92,246,0.05)','--bg-tint':'rgba(139,92,246,0.06)','--gold':'#fbbf24'},
      'hot-rose':         {'--primary':'#f43f5e','--primary-dark':'#e11d48','--primary-light':'#fb7185','--primary-hover':'#e11d48','--info':'#f43f5e','--border-focus':'#f43f5e','--shadow-focus':'0 0 0 4px rgba(244,63,94,0.25)','--shadow-glow':'0 0 0 4px rgba(244,63,94,0.25)','--surface-alt':'rgba(244,63,94,0.07)','--surface-hover':'rgba(244,63,94,0.05)','--bg-tint':'rgba(244,63,94,0.05)','--gold':'#fbbf24'},
      'electric-orange':  {'--primary':'#f97316','--primary-dark':'#ea580c','--primary-light':'#fb923c','--primary-hover':'#ea580c','--info':'#f97316','--border-focus':'#f97316','--shadow-focus':'0 0 0 4px rgba(249,115,22,0.25)','--shadow-glow':'0 0 0 4px rgba(249,115,22,0.25)','--surface-alt':'rgba(249,115,22,0.07)','--surface-hover':'rgba(249,115,22,0.05)','--bg-tint':'rgba(249,115,22,0.05)','--gold':'#fbbf24'},
      'cyber-cyan':       {'--primary':'#06b6d4','--primary-dark':'#0891b2','--primary-light':'#22d3ee','--primary-hover':'#0891b2','--info':'#06b6d4','--border-focus':'#06b6d4','--shadow-focus':'0 0 0 4px rgba(6,182,212,0.28)','--shadow-glow':'0 0 0 4px rgba(6,182,212,0.28)','--surface-alt':'rgba(6,182,212,0.08)','--surface-hover':'rgba(6,182,212,0.05)','--bg-tint':'rgba(6,182,212,0.06)','--gold':'#fbbf24'},
      'golden-sun':       {'--primary':'#f59e0b','--primary-dark':'#d97706','--primary-light':'#fbbf24','--primary-hover':'#d97706','--info':'#f59e0b','--border-focus':'#f59e0b','--shadow-focus':'0 0 0 4px rgba(245,158,11,0.28)','--shadow-glow':'0 0 0 4px rgba(245,158,11,0.28)','--surface-alt':'rgba(245,158,11,0.08)','--surface-hover':'rgba(245,158,11,0.05)','--bg-tint':'rgba(245,158,11,0.06)','--gold':'#fbbf24'},
      'mint-fresh':       {'--primary':'#10b981','--primary-dark':'#059669','--primary-light':'#34d399','--primary-hover':'#059669','--info':'#10b981','--border-focus':'#10b981','--shadow-focus':'0 0 0 4px rgba(16,185,129,0.28)','--shadow-glow':'0 0 0 4px rgba(16,185,129,0.28)','--surface-alt':'rgba(16,185,129,0.08)','--surface-hover':'rgba(16,185,129,0.05)','--bg-tint':'rgba(16,185,129,0.06)','--gold':'#fbbf24'},
      'deep-teal':        {'--primary':'#14b8a6','--primary-dark':'#0d9488','--primary-light':'#2dd4bf','--primary-hover':'#0d9488','--info':'#14b8a6','--border-focus':'#14b8a6','--shadow-focus':'0 0 0 4px rgba(20,184,166,0.28)','--shadow-glow':'0 0 0 4px rgba(20,184,166,0.28)','--surface-alt':'rgba(20,184,166,0.08)','--surface-hover':'rgba(20,184,166,0.05)','--bg-tint':'rgba(20,184,166,0.06)','--gold':'#fbbf24'},
      'night-blue':       {'--primary':'#2563eb','--primary-dark':'#1d4ed8','--primary-light':'#60a5fa','--primary-hover':'#1d4ed8','--info':'#2563eb','--border-focus':'#2563eb','--shadow-focus':'0 0 0 4px rgba(37,99,235,0.28)','--shadow-glow':'0 0 0 4px rgba(37,99,235,0.28)','--surface-alt':'rgba(37,99,235,0.08)','--surface-hover':'rgba(37,99,235,0.05)','--bg-tint':'rgba(37,99,235,0.06)','--gold':'#fbbf24'},
      'cherry-red':       {'--primary':'#dc2626','--primary-dark':'#b91c1c','--primary-light':'#f87171','--primary-hover':'#b91c1c','--info':'#dc2626','--border-focus':'#dc2626','--shadow-focus':'0 0 0 4px rgba(220,38,38,0.25)','--shadow-glow':'0 0 0 4px rgba(220,38,38,0.25)','--surface-alt':'rgba(220,38,38,0.07)','--surface-hover':'rgba(220,38,38,0.05)','--bg-tint':'rgba(220,38,38,0.05)','--gold':'#fbbf24'},
      'hot-pink':         {'--primary':'#ec4899','--primary-dark':'#db2777','--primary-light':'#f472b6','--primary-hover':'#db2777','--info':'#ec4899','--border-focus':'#ec4899','--shadow-focus':'0 0 0 4px rgba(236,72,153,0.25)','--shadow-glow':'0 0 0 4px rgba(236,72,153,0.25)','--surface-alt':'rgba(236,72,153,0.07)','--surface-hover':'rgba(236,72,153,0.05)','--bg-tint':'rgba(236,72,153,0.05)','--gold':'#fbbf24'},
    };
    var vars = schemeVars[scheme] || schemeVars['default'];
    Object.keys(vars).forEach(function(k){ el.style.setProperty(k, vars[k]); });
    el.setAttribute('data-scheme', scheme);
    if (s && s.isDark) el.classList.add('dark');

    // Card style
    el.setAttribute('data-card-style', (s && s.cardStyle) || 'elevated');

    // Font scale — sets root font-size (scales rem) + CSS vars (scales text-[var(...)])
    var fsMap = { compact:['14px','11px','12px','13px','14px','16px'], default:['15px','12px','13px','14px','15px','17px'], comfortable:['16px','13px','14px','15px','16px','18px'], large:['17px','14px','15px','16px','17px','19px'], xl:['18px','15px','16px','17px','18px','21px'] };
    var fsId = (s && s.fontScale) || 'comfortable';
    var fsVals = fsMap[fsId] || fsMap['comfortable'];
    el.style.fontSize = fsVals[0];
    el.setAttribute('data-font-scale', fsId);
    ['--font-size-xs','--font-size-sm','--font-size-base','--font-size-md','--font-size-lg'].forEach(function(p,i){ el.style.setProperty(p, fsVals[i+1]); });

    // Shape (radius)
    var shapeMap = { sharp:['3px','6px','8px','12px','16px','8px','6px','12px'], default:['6px','10px','14px','20px','28px','14px','10px','20px'], soft:['10px','14px','20px','28px','36px','20px','14px','28px'], round:['14px','20px','28px','36px','48px','28px','20px','36px'], pill:['999px','999px','999px','999px','999px','24px','16px','32px'] };
    var shId = (s && s.shape) || 'default';
    var shVals = shapeMap[shId] || shapeMap['default'];
    ['--radius-sm','--radius-md','--radius-lg','--radius-xl','--radius-2xl','--radius-card','--radius-card-sm','--radius-card-lg'].forEach(function(p,i){ el.style.setProperty(p, shVals[i]); });
    el.setAttribute('data-shape', shId);

    // Shadow depth
    var shadowMap = { none:['none','none','none'], subtle:['0 1px 2px rgba(19,38,67,0.04)','0 2px 6px rgba(19,38,67,0.06)','0 4px 12px rgba(19,38,67,0.08)'], default:['0 1px 2px rgba(19,38,67,0.05),0 1px 3px rgba(19,38,67,0.06)','0 4px 8px -2px rgba(19,38,67,0.06),0 2px 4px -2px rgba(19,38,67,0.05)','0 12px 24px -8px rgba(19,38,67,0.10),0 4px 8px -4px rgba(19,38,67,0.06)'], elevated:['0 2px 8px rgba(19,38,67,0.10)','0 6px 20px rgba(19,38,67,0.14)','0 16px 40px rgba(19,38,67,0.18)'] };
    var sdId = (s && s.shadowDepth) || 'default';
    var sdVals = shadowMap[sdId] || shadowMap['default'];
    ['--shadow-sm','--shadow-md','--shadow-lg'].forEach(function(p,i){ el.style.setProperty(p, sdVals[i]); });
    el.setAttribute('data-shadow', sdId);

    // Density (spacing)
    var densityMap = { compact:0.75, default:1.0, comfortable:1.15, spacious:1.35 };
    var dId = (s && s.density) || 'default';
    var dm = densityMap[dId] || 1.0;
    [[1,4],[2,8],[3,12],[4,16],[5,20],[6,24],[7,32],[8,40],[9,48],[10,64]].forEach(function(p){ el.style.setProperty('--space-'+p[0], Math.round(p[1]*dm)+'px'); });
    el.setAttribute('data-density', dId);

    // Motion speed
    var motionMap = { instant:['0ms','0ms','0ms'], fast:['80ms','140ms','240ms'], default:['140ms','220ms','420ms'], relaxed:['220ms','380ms','600ms'] };
    var mId = (s && s.motionSpeed) || 'default';
    var mVals = motionMap[mId] || motionMap['default'];
    ['--dur-fast','--dur-base','--dur-slow'].forEach(function(p,i){ el.style.setProperty(p, mVals[i]); });
    el.setAttribute('data-motion', mId);

    // Font family
    var ffMap = { scholaris:['"Sora",ui-sans-serif,sans-serif','"Manrope",ui-sans-serif,sans-serif'], modern:['"Inter",ui-sans-serif,sans-serif','"Inter",ui-sans-serif,sans-serif'], classic:['"Playfair Display",ui-serif,Georgia,serif','"Manrope",ui-sans-serif,sans-serif'], friendly:['"Poppins",ui-sans-serif,sans-serif','"Poppins",ui-sans-serif,sans-serif'], mono:['"JetBrains Mono",ui-monospace,monospace','"Manrope",ui-sans-serif,sans-serif'], jakarta:['"Plus Jakarta Sans",ui-sans-serif,sans-serif','"Plus Jakarta Sans",ui-sans-serif,sans-serif'] };
    var ffId = (s && s.fontFamily) || 'scholaris';
    var ffVals = ffMap[ffId] || ffMap['scholaris'];
    el.style.setProperty('--font-display', ffVals[0]);
    el.style.setProperty('--font-body', ffVals[1]);

  } catch(e) {}
})()
            `,
          }}
        />
      </head>
      <body className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} ${inter.variable} ${poppins.variable} ${playfair.variable} ${plusJakarta.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
