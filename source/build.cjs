/* Permanent Summer Voyages — static site builder
   Usage (from this folder): npm install && node build.cjs [SITE_URL]
   Reads index.src.html + data.js here, writes every page into ../docs (GitHub Pages folder).
   Photos live in ../docs/img and are never deleted by the build. */
const fs = require("fs"), path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const SRC = __dirname;
const OUT = path.resolve(__dirname, "../docs");
const SITE_URL = (process.argv[2] || process.env.SITE_URL || "https://permanentsummervoyages.com").replace(/\/?$/, "/");
const BRAND = "Permanent Summer Voyages";

const src = fs.readFileSync(path.join(SRC, "index.src.html"), "utf8");
const dataJs = fs.readFileSync(path.join(SRC, "data.js"), "utf8");
const css = src.slice(src.indexOf("<style>") + 7, src.indexOf("</style>"));
const appStart = src.indexOf("<script>\n(function(){");
const appJs = src.slice(appStart + 8, src.lastIndexOf("</script>"));
if (appStart < 0 || !appJs.includes("window.PSV")) throw new Error("could not extract app script");

const BASE_CSS = `/* base */
:root{color-scheme:light}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0}
[hidden]{display:none!important}
`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400&display=swap">`;

/* ---------- fresh window per page (the app reads window.SITE once at start-up) ---------- */
function renderPage(page, lang, root) {
  const vc = new VirtualConsole();
  vc.on("jsdomError", e => { if (!/scrollTo|Could not load|Not implemented/.test(e.message)) console.error(`[${lang} ${page}]`, e.message); });
  const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="app"></div></body></html>`,
    { runScripts: "outside-only", url: "https://build.local/", virtualConsole: vc });
  const w = dom.window; w.scrollTo = () => {};
  w.SITE = { page, lang, root };
  w.eval(dataJs); w.eval(appJs);
  return { html: w.document.getElementById("app").innerHTML, bodyClass: w.document.body.className, w };
}

/* ---------- data + helpers from a reference window ---------- */
const ref = renderPage("home", "fr", "").w;
const { DESTS, THEMES, OFFERS, REGIONS, CONFIG, PSV } = ref;
const T = (o, lg) => (o && typeof o === "object") ? (o[lg] ?? o.fr) : o;
const clip = (s, n = 158) => { s = String(s).replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n - 1); return c.slice(0, c.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "") + "…"; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const keys = ["home", "destinations", ...DESTS.map(d => "dest-" + d.s), "inspiration", ...THEMES.map(t => "theme-" + t.k),
  "offres", ...OFFERS.map(o => "offre-" + o.id), "voyageurs", "groupes", "entreprises", "a-propos", "appel", "devis", "mentions"];

function meta(key, lg) {
  const fr = lg === "fr", L = (a, b) => fr ? a : b;
  let title, desc, image = "mauritius", crumbs = null, noindex = false;
  if (key === "home") { title = L(`${BRAND} · Agence de voyage à Maurice`, `${BRAND} · Travel agency in Mauritius`);
    desc = L("Agence de voyage indépendante à Maurice : billets d'avion, hôtels, groupes et voyages d'affaires. 35 ans d'expérience et un humain qui répond, même pendant votre voyage.",
             "Independent travel agency in Mauritius: flights, hotels, groups and business travel. 35 years of experience and a human who answers, even during your trip."); }
  else if (key === "destinations") { title = L("Destinations au départ de Maurice", "Destinations from Mauritius");
    desc = L(`${DESTS.length} destinations que nous connaissons par cœur, de Rodrigues au Japon : vols, hôtels, transferts et circuits organisés depuis l'île Maurice.`,
             `${DESTS.length} destinations we know by heart, from Rodrigues to Japan: flights, hotels, transfers and tours arranged from Mauritius.`); }
  else if (key.startsWith("dest-")) { const d = DESTS.find(x => x.s === key.slice(5)); const n = T(d.n, lg);
    title = d.s === "maurice" ? L("Vacances à l'île Maurice : séjours et retours au pays", "Holidays in Mauritius: stays and trips home")
      : L(`Voyage ${n} depuis Maurice`, `${n} trips from Mauritius`); desc = clip(`${T(d.t, lg)} ${T(d.d, lg)}`); image = d.img[0];
    crumbs = [[L("Destinations", "Destinations"), "destinations"], [n, key]]; }
  else if (key === "inspiration") { title = L("Idées de voyage", "Travel ideas");
    desc = L("Lune de miel, famille, safari, pèlerinage, shopping à Dubaï : trouvez votre prochain voyage par envie, au départ de l'île Maurice.",
             "Honeymoon, family, safari, pilgrimage, Dubai shopping: find your next trip by mood, departing from Mauritius."); image = "pool"; }
  else if (key.startsWith("theme-")) { const th = THEMES.find(x => x.k === key.slice(6)); const n = T(th, lg);
    title = L(`${n} : idées de voyage depuis Maurice`, `${n}: trip ideas from Mauritius`); desc = clip(T(th.d, lg)); image = th.img;
    crumbs = [["Inspiration", "inspiration"], [n, key]]; }
  else if (key === "offres") { title = L("Offres de voyage", "Travel offers");
    desc = L("Séjours négociés et départs de groupe au départ de Maurice, à prix connu. Places limitées, réservation sur WhatsApp.",
             "Negotiated stays and group departures from Mauritius at a set price. Limited seats, book on WhatsApp."); image = "mauritius4"; }
  else if (key.startsWith("offre-")) { const o = OFFERS.find(x => x.id === key.slice(6)); const n = T(o.title, lg);
    title = `${n}, ${L("dès", "from")} ${o.price}`; desc = clip(`${T(o.valid, lg)}. ${L("Inclus", "Included")} : ${T(o.inc, lg).join(", ")}.`); image = o.img;
    crumbs = [[L("Offres", "Offers"), "offres"], [n, key]]; }
  else if (key === "voyageurs") { title = L("Nos voyageurs en vidéo", "Our travellers on video");
    desc = L("Nos ambassadeurs racontent leur voyage en quelques secondes : lune de miel, famille, groupes. De vraies personnes, de vrais itinéraires.",
             "Our ambassadors share their trip in a few seconds: honeymoons, families, groups. Real people, real itineraries."); image = "plane2"; }
  else if (key === "groupes") { title = L("Voyages de groupe : mariages, pèlerinages, sport", "Group travel: weddings, pilgrimages, sport");
    desc = L("Mariages, pèlerinages, équipes sportives, séminaires : tarifs de groupe, liste de passagers et coordination de 10 à 200 voyageurs au départ de Maurice.",
             "Weddings, pilgrimages, sports teams, seminars: group fares, passenger lists and coordination for 10 to 200 travellers from Mauritius."); image = "wedding"; }
  else if (key === "entreprises") { title = L("Voyages d'affaires pour entreprises à Maurice", "Business travel for companies in Mauritius");
    desc = L("Billets, hôtels, factures et assistance 7j/7 pour les PME et entreprises de Maurice, avec un interlocuteur unique qui connaît vos voyageurs.",
             "Tickets, hotels, invoices and 7-day support for Mauritian SMEs and companies, with one contact who knows your travellers."); image = "plane"; }
  else if (key === "a-propos") { title = L("À propos : Jennifer & Christopher Kwo", "About us: Jennifer & Christopher Kwo");
    desc = L("Une agence familiale : 35 ans d'expérience en agence de voyage et l'hôtellerie internationale, au service des voyageurs de Maurice.",
             "A family agency: 35 years in travel agencies plus international hospitality, serving travellers from Mauritius."); image = "team"; }
  else if (key === "appel") { title = L("Réserver un appel", "Book a call");
    desc = L("Choisissez un créneau de 30 minutes pour parler de votre voyage : dates, budget, envies. Devis détaillé sous 24 à 48h.",
             "Pick a 30-minute slot to talk about your trip: dates, budget, wishes. Detailed quote within 24 to 48 hours."); image = "plane2"; }
  else if (key === "devis") { title = L("Demander un devis", "Request a quote");
    desc = L("Décrivez votre voyage et recevez un devis personnalisé sous 24h ouvrées : vols, hôtels, transferts, excursions.",
             "Describe your trip and get a tailored quote within 24 working hours: flights, hotels, transfers, excursions."); image = "map"; }
  else if (key === "mentions") { title = L("Mentions légales", "Legal notice"); desc = L("Informations légales de Permanent Summer Lda.", "Legal information for Permanent Summer Lda."); noindex = true; }
  if (key !== "home") title += ` | ${BRAND}`;
  return { title, desc, image, crumbs, noindex };
}

const abs = (key, lg) => SITE_URL + PSV.pathFor(key, lg);
const agency = {
  "@context": "https://schema.org", "@type": "TravelAgency", "@id": SITE_URL + "#agency",
  name: BRAND, url: SITE_URL, logo: SITE_URL + "assets/favicon.svg", image: SITE_URL + "img/team.jpg",
  telephone: CONFIG.phone.replace(/\s/g, ""), email: CONFIG.email, areaServed: ["Mauritius", "Rodrigues"],
  knowsLanguage: ["fr", "en"], parentOrganization: { "@type": "Organization", name: "Permanent Summer Lda" },
  founder: [{ "@type": "Person", name: "Jennifer Kwo" }, { "@type": "Person", name: "Christopher Kwo" }],
  contactPoint: { "@type": "ContactPoint", telephone: CONFIG.phone.replace(/\s/g, ""), contactType: "customer service", availableLanguage: ["French", "English"] },
  sameAs: Object.values(CONFIG.social || {}).filter(Boolean)
};

function head(key, lg, root, m) {
  const canonical = abs(key, lg);
  const ld = [agency];
  if (m.crumbs) ld.push({ "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [[lg === "fr" ? "Accueil" : "Home", "home"], ...m.crumbs].map(([name, k], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(k, lg) })) });
  return `<!doctype html>
<html lang="${lg}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
${m.noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="fr" href="${abs(key, "fr")}">
<link rel="alternate" hreflang="en" href="${abs(key, "en")}">
<link rel="alternate" hreflang="x-default" href="${abs(key, "fr")}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE_URL}img/${m.image}.jpg">
<meta property="og:locale" content="${lg === "fr" ? "fr_FR" : "en_GB"}">
<meta property="og:locale:alternate" content="${lg === "fr" ? "en_GB" : "fr_FR"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0d4d49">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
${FONTS}
<link rel="stylesheet" href="${root}assets/style.css">
<link rel="preload" as="image" href="${root}img/${m.image}.jpg">
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld)}</script>
</head>`;
}
const body = (key, lg, root, r) => `
<body class="${r.bodyClass}">
<div id="app">${r.html}</div>
<script>window.SITE=${JSON.stringify({ page: key, lang: lg, root })};</script>
<script src="${root}assets/data.js"></script>
<script src="${root}assets/app.js"></script>
</body>
</html>
`;

/* ---------- write ---------- */
/* clean previous build but keep photos and the custom-domain file */
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (!["img", "CNAME"].includes(f)) fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
fs.writeFileSync(path.join(OUT, "assets/style.css"), BASE_CSS + css.trim() + "\n");
fs.writeFileSync(path.join(OUT, "assets/data.js"), dataJs);
fs.writeFileSync(path.join(OUT, "assets/app.js"), appJs.trim() + "\n");
fs.writeFileSync(path.join(OUT, "assets/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0d4d49"/><text x="32" y="43" text-anchor="middle" font-family="Didot,Bodoni 72,Georgia,serif" font-size="30" fill="#fff">PS</text></svg>\n`);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

let count = 0; const sitemap = [];
for (const lg of ["fr", "en"]) for (const key of keys) {
  const rel = PSV.pathFor(key, lg);
  const depth = rel.split("/").filter(Boolean).length;
  const root = "../".repeat(depth);
  const r = renderPage(key, lg, root);
  if (/undefined|\[object Object\]/.test(r.html)) console.warn("check:", lg, key);
  const m = meta(key, lg);
  const file = path.join(OUT, rel, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, head(key, lg, root, m) + body(key, lg, root, r));
  if (!m.noindex) sitemap.push(key + "|" + lg);
  r.w.close(); count++;
}
/* 404: GitHub Pages serves it at any depth, so it uses root-absolute links */
{ const r = renderPage("404", "fr", "/"); const m = { title: `Page introuvable | ${BRAND}`, desc: "Cette page n'existe pas.", image: "mauritius", noindex: true };
  fs.writeFileSync(path.join(OUT, "404.html"), head("home", "fr", "/", m).replace(/<link rel="canonical"[^>]*>\n/, "") + body("404", "fr", "/", r)); }

const today = new Date().toISOString().slice(0, 10);
const urls = [...new Set(sitemap.map(x => x.split("|")[0]))].flatMap(key => ["fr", "en"].map(lg => `  <url>
    <loc>${abs(key, lg)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="fr" href="${abs(key, "fr")}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(key, "en")}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(key, "fr")}"/>
  </url>`));
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);
console.log(`built ${count} pages + 404 → ${OUT} (${SITE_URL})`);
