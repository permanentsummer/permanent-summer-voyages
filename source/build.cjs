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
  return { html: w.document.getElementById("app").innerHTML, bodyClass: w.document.body.className, theme: w.document.documentElement.dataset.theme || "dark", w };
}

/* ---------- data + helpers from a reference window ---------- */
const ref = renderPage("home", "fr", "").w;
const { DESTS, THEMES, OFFERS, REGIONS, CONFIG, PSV, RETREATS, RREGIONS } = ref;
const T = (o, lg) => (o && typeof o === "object") ? (o[lg] ?? o.fr) : o;
const clip = (s, n = 158) => { s = String(s).replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n - 1); return c.slice(0, c.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "") + "…"; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const { EVENTS } = ref;
const keys = ["home", "voyages", "comment", "partenaires", "retraites", ...RETREATS.map(r => "retraite-" + r.s), "brief", "evenements", ...EVENTS.map(e => "event-" + e.k), "budget", "activites", "guide",
  "destinations", ...DESTS.map(d => "dest-" + d.s), "inspiration", ...THEMES.map(t => "theme-" + t.k),
  "offres", ...OFFERS.map(o => "offre-" + o.id), ...(ref.AMBASSADORS.length ? ["voyageurs"] : []), "groupes", "entreprises", "a-propos", "appel", "devis", "mentions"];

function meta(key, lg) {
  const fr = lg === "fr", L = (a, b) => fr ? a : b;
  let title, desc, image = "team_walk", crumbs = null, noindex = false;
  if (key === "home") { title = L(`${BRAND} · Retraites d'entreprise et voyages de groupe, vols compris`, `${BRAND} · Company retreats and group travel, flights included`);
    desc = L("Séminaires, team building et voyages incentive dans plus de 20 destinations, de l'Algarve à Tbilissi. 3 propositions sur mesure, vols de chaque participant compris.",
             "Offsites, team building and incentive trips in 20+ destinations, from the Algarve to Tbilisi. 3 tailored proposals, every participant's flights included."); }
  else if (key === "voyages") { title = L("Voyages sur mesure, vols compris", "Tailor-made travel, flights included");
    desc = L("En couple, en famille ou entre amis : voyages sur mesure avec vols, hôtels et assistance 7j/7. Un seul interlocuteur, du devis au retour.",
             "As a couple, a family or with friends: tailor-made trips with flights, hotels and 7-day support. One contact, from quote to coming home."); image = "travel_couple"; }
  else if (key === "comment") { title = L("Comment ça marche : retraites d'entreprise avec vols de groupe", "How it works: company retreats with group flights");
    desc = L("Brief en 5 minutes, 3 propositions sur mesure, vols de chaque participant réservés et coordonnés, assistance 7j/7 pendant la retraite.",
             "5-minute brief, 3 tailored proposals, every participant's flights booked and coordinated, 7-day support during the retreat."); image = "team_sail"; }
  else if (key === "partenaires") { title = L("Proposer votre lieu pour des retraites d'entreprise", "List your venue for company retreats");
    desc = L("Hôtels, villas, domaines : accueillez des retraites d'entreprise en semaine. Groupes de 10 à 150 personnes, réservés à l'avance. Inscription gratuite.",
             "Hotels, villas, estates: host company retreats on weekdays. Groups of 10 to 150, booked well ahead. Free listing."); image = "venue_manor"; }
  else if (key === "retraites") { title = L("Retraites d'entreprise en Europe et au-delà", "Company retreats in Europe and beyond");
    desc = L(`${RETREATS.length} destinations de séminaire et d'offsite : Algarve, Lisbonne, Ericeira, Majorque, Toscane, Marrakech, Croatie… Dès 10 personnes, vols compris.`,
             `${RETREATS.length} offsite and retreat destinations: Algarve, Lisbon, Ericeira, Mallorca, Tuscany, Marrakech, Croatia… From 10 people, flights included.`); image = "team_villa2"; }
  else if (key.startsWith("retraite-")) { const r = RETREATS.find(x => x.s === key.slice(9)); const n = T(r.n, lg);
    title = L(`Retraite d'entreprise ${n} : séminaire et team building`, `Company retreat in ${n}: offsite and team building`); desc = clip(`${T(r.t, lg)} ${T(r.d, lg)}`); image = r.img[0];
    crumbs = [[L("Retraites d'entreprise", "Company retreats"), "retraites"], [n, key]]; }
  else if (key === "brief") { title = L("Organiser une retraite d'entreprise", "Plan a company retreat");
    desc = L("Décrivez votre projet en 5 minutes et recevez 3 propositions complètes : lieu, programme, activités, vols et budget par personne.",
             "Describe your project in 5 minutes and get 3 complete proposals: venue, programme, activities, flights and budget per person."); image = "act_cooking"; }
  else if (key === "evenements") { title = L("Séminaires, team building, incentives et voyages de groupe", "Offsites, team building, incentives and group trips");
    desc = L("Séminaire d'entreprise, team building, séminaire de direction, kick-off commercial, voyage incentive : un format pour chaque objectif, vols compris.",
             "Company offsites, team building, leadership retreats, sales kickoffs, incentive trips: a format for every goal, flights included."); image = "act_workshop3"; }
  else if (key.startsWith("event-")) { const e = EVENTS.find(x => x.k === key.slice(6)); const n = T(e.n, lg);
    title = L(`${n} : organisation clé en main, vols compris`, `${n}: fully organised, flights included`); desc = clip(`${T(e.t, lg)} ${T(e.d, lg)}`); image = e.img;
    crumbs = [[L("Événements", "Events"), "evenements"], [n, key]]; }
  else if (key === "budget") { title = L("Calculateur de budget séminaire, vols compris", "Offsite budget calculator, flights included");
    desc = L("Combien coûte un séminaire d'entreprise ? Estimez votre budget par personne en 30 secondes : hébergement, salles, activités, transferts et vols.",
             "How much does a company offsite cost? Estimate your per-person budget in 30 seconds: accommodation, meeting rooms, activities, transfers and flights."); image = "team_garden"; }
  else if (key === "activites") { title = L("Activités de team building : 20 idées par énergie et taille de groupe", "Team-building activities: 20 ideas by energy and group size");
    desc = L("Surf, régate, canyoning, cours de cuisine, chasse au trésor, yoga, nettoyage de plage : des activités de team building testées pour les groupes de 8 à 300 personnes.",
             "Surfing, regattas, canyoning, cooking classes, treasure hunts, yoga, beach clean-ups: team-building activities for groups of 8 to 300."); image = "team_ridge2"; }
  else if (key === "guide") { title = L("Organiser un séminaire d'entreprise : la checklist complète", "How to plan a company offsite: the complete checklist");
    desc = L("Budget, destination, lieu, vols, programme, communication : la checklist étape par étape pour organiser un séminaire, de J-6 mois au retour.",
             "Budget, destination, venue, flights, programme, comms: the step-by-step checklist for planning an offsite, from six months out to back home."); image = "team_garden"; }
  else if (key === "destinations") { title = L("Où partir : destinations de voyage sur mesure", "Where to go: tailor-made travel destinations");
    desc = L(`${DESTS.length} destinations en couple, en famille ou entre amis : Lisbonne et l'Algarve, Marrakech, les Alpes, la côte amalfitaine, Le Cap… Vols compris.`,
             `${DESTS.length} destinations for couples, families and friends: Lisbon and the Algarve, Marrakech, the Alps, the Amalfi Coast, Cape Town… Flights included.`); image = "grp_beachsunset"; }
  else if (key.startsWith("dest-")) { const d = DESTS.find(x => x.s === key.slice(5)); const n = T(d.n, lg);
    title = L(`Voyage sur mesure : ${n}`, `Tailor-made trip to ${n}`); desc = clip(`${T(d.t, lg)} ${T(d.d, lg)}`); image = d.img[0];
    crumbs = [[L("Destinations", "Destinations"), "destinations"], [n, key]]; }
  else if (key === "inspiration") { title = L("Idées de voyages", "Travel ideas");
    desc = L("Entre amis, mariages et célébrations, en famille, pèlerinages, ski, soleil d'hiver, safari, city breaks : trouvez votre prochain voyage par envie.",
             "Friends' trips, weddings and celebrations, family trips, pilgrimages, ski, winter sun, safaris, city breaks: find your next trip by mood."); image = "travel_seniors"; }
  else if (key.startsWith("theme-")) { const th = THEMES.find(x => x.k === key.slice(6)); const n = T(th, lg);
    title = L(`${n} : idées de voyages`, `${n}: travel ideas`); desc = clip(T(th.d, lg)); image = th.img;
    crumbs = [["Inspiration", "inspiration"], [n, key]]; }
  else if (key === "offres") { title = L("Offres séminaires et formules de retraite clés en main", "Offsite offers and turnkey retreats");
    desc = L("Séminaires négociés à prix connu et retraites clés en main : Algarve, Cracovie, Crète, Ericeira, Porto, Marrakech. Vols de chaque participant sur devis.",
             "Negotiated offsites at a set price and turnkey retreats: Algarve, Kraków, Crete, Ericeira, Porto, Marrakech. Every participant's flights quoted."); image = "venue_hotel"; }
  else if (key.startsWith("offre-")) { const o = OFFERS.find(x => x.id === key.slice(6)); const n = T(o.title, lg);
    title = `${n}, ${L("dès", "from")} ${o.price}`; desc = clip(`${T(o.valid, lg)}. ${L("Inclus", "Included")} : ${T(o.inc, lg).join(", ")}.`); image = o.img;
    crumbs = [[L("Offres", "Offers"), "offres"], [n, key]]; }
  else if (key === "voyageurs") { title = L("Nos voyageurs en vidéo", "Our travellers on video");
    desc = L("Couples, familles et amis racontent leur voyage en quelques secondes. De vraies personnes, de vrais itinéraires.",
             "Couples, families and friends share their trip in a few seconds. Real people, real itineraries."); image = "plane2"; }
  else if (key === "groupes") { title = L("Voyages de groupe pour associations, clubs et équipes", "Group travel for associations, clubs and teams");
    desc = L("Associations, clubs, équipes sportives, CSE, écoles : vols de groupe, hébergement et coordination de 10 à 300 personnes, 3 propositions sur mesure.",
             "Associations, clubs, sports teams, works councils, schools: group flights, accommodation and coordination for 10 to 300 people, 3 tailored proposals."); image = "act_rowing"; }
  else if (key === "entreprises") { title = L("Voyages d'affaires pour PME et équipes internationales", "Business travel for SMEs and international teams");
    desc = L("Billets, hôtels, factures et assistance 7j/7 pour les PME, startups et équipes internationales, avec un interlocuteur unique qui connaît vos voyageurs.",
             "Tickets, hotels, invoices and 7-day support for SMEs, startups and international teams, with one contact who knows your travellers."); image = "plane"; }
  else if (key === "a-propos") { title = L("À propos : Jennifer & Christopher Kwo", "About us: Jennifer & Christopher Kwo");
    desc = L("Une agence familiale : 35 ans d'expérience en agence de voyage et l'hôtellerie internationale, au service des équipes et des groupes.",
             "A family agency: 35 years in travel agencies plus international hospitality, serving teams and groups."); image = "team"; }
  else if (key === "appel") { title = L("Réserver un appel", "Book a call");
    desc = L("Choisissez un créneau de 30 minutes pour parler de votre retraite ou de votre voyage de groupe : dates, budget, envies.",
             "Pick a 30-minute slot to talk about your retreat or group trip: dates, budget, wishes."); image = "plane2"; }
  else if (key === "devis") { title = L("Demander un devis de voyage de groupe", "Request a group trip quote");
    desc = L("Décrivez votre voyage de groupe et recevez un devis personnalisé : vols, hébergement, transferts, activités.",
             "Describe your group trip and get a tailored quote: flights, accommodation, transfers, activities."); image = "map"; }
  else if (key === "mentions") { title = L("Mentions légales", "Legal notice"); desc = L("Informations légales de Permanent Summer Lda.", "Legal information for Permanent Summer Lda."); noindex = true; }
  if (key !== "home") title += ` | ${BRAND}`;
  return { title, desc, image, crumbs, noindex };
}

const abs = (key, lg) => SITE_URL + PSV.pathFor(key, lg);
const agency = {
  "@context": "https://schema.org", "@type": "TravelAgency", "@id": SITE_URL + "#agency",
  name: BRAND, url: SITE_URL, logo: SITE_URL + "icon-512.png", image: SITE_URL + "img/team.jpg",
  telephone: CONFIG.phone.replace(/\s/g, ""), email: CONFIG.email, areaServed: ["Europe", "Africa", "Asia"],
  description: "Company retreats, offsites and group travel, flights included.",
  knowsLanguage: ["fr", "en"], parentOrganization: { "@type": "Organization", name: "Permanent Summer Lda" },
  founder: [{ "@type": "Person", name: "Jennifer Kwo" }, { "@type": "Person", name: "Christopher Kwo" }],
  contactPoint: { "@type": "ContactPoint", telephone: CONFIG.phone.replace(/\s/g, ""), contactType: "customer service", availableLanguage: ["French", "English"] },
  sameAs: Object.values(CONFIG.social || {}).filter(Boolean)
};

function head(key, lg, root, m, theme = "dark") {
  const canonical = abs(key, lg);
  const ld = [agency];
  if (m.crumbs) ld.push({ "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [[lg === "fr" ? "Accueil" : "Home", "home"], ...m.crumbs].map(([name, k], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(k, lg) })) });
  return `<!doctype html>
<html lang="${lg}" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
${m.noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="fr" href="${abs(key, "fr")}">
<link rel="alternate" hreflang="en" href="${abs(key, "en")}">
<link rel="alternate" hreflang="x-default" href="${abs(key, "en")}">
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
<link rel="icon" href="${root}favicon.ico" sizes="32x32">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}apple-touch-icon.png">
<link rel="manifest" href="${root}site.webmanifest">
${FONTS}
<link rel="stylesheet" href="${root}assets/style.css">
<link rel="preload" as="image" href="${root}img/${m.image}.jpg" imagesrcset="${root}img/m/${m.image}.jpg 1200w, ${root}img/${m.image}.jpg 1800w" imagesizes="100vw">
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
/* browser icons (source/brand) */
for (const f of ["favicon.svg","favicon.ico","apple-touch-icon.png","icon-192.png","icon-512.png"])
  fs.copyFileSync(path.join(__dirname, "brand", f), path.join(OUT, f === "favicon.svg" ? "assets/favicon.svg" : f));
fs.writeFileSync(path.join(OUT, "site.webmanifest"), JSON.stringify({ name: BRAND, short_name: "PS Voyages", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }], theme_color: "#FFFFFF", background_color: "#FFFFFF", display: "browser" }) + "\n");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
/* phone-sized copies of every photo (img/m/), used through srcset */
{ const IMG = path.join(OUT, "img"), M = path.join(IMG, "m"); fs.mkdirSync(M, { recursive: true });
  const { execFileSync } = require("child_process");
  for (const f of fs.readdirSync(IMG).filter(f => f.endsWith(".jpg"))) {
    const dst = path.join(M, f); if (fs.existsSync(dst)) continue;
    try { execFileSync("convert", [path.join(IMG, f), "-resize", "1100x1100>", "-strip", "-interlace", "Plane", "-quality", "70", dst]); }
    catch (e) { fs.copyFileSync(path.join(IMG, f), dst); }
  } }

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
  fs.writeFileSync(file, head(key, lg, root, m, r.theme) + body(key, lg, root, r));
  if (!m.noindex) sitemap.push(key + "|" + lg);
  r.w.close(); count++;
}
/* 404: GitHub Pages serves it at any depth, so it uses root-absolute links */
{ const r = renderPage("404", "en", "/"); const m = { title: `Page not found | ${BRAND}`, desc: "This page doesn't exist.", image: "team_walk", noindex: true };
  fs.writeFileSync(path.join(OUT, "404.html"), head("home", "en", "/", m).replace(/<link rel="canonical"[^>]*>\n/, "") + body("404", "en", "/", r)); }

/* old addresses (French at the root, English under /en/) redirect to the new ones */
let redirects = 0;
for (const lg of ["fr", "en"]) for (const key of keys) {
  const now = PSV.pathFor(key, lg);
  const old = lg === "fr" ? now.replace(/^fr\//, "") : "en/" + now;
  const file = path.join(OUT, old, "index.html");
  if (fs.existsSync(file)) continue;
  const to = SITE_URL + now;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `<!doctype html><html lang="${lg}"><head><meta charset="utf-8"><title>${BRAND}</title><link rel="canonical" href="${to}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${to}"><script>location.replace(${JSON.stringify(to)} + location.search + location.hash)</script></head><body><a href="${to}">${to}</a></body></html>\n`);
  redirects++;
}
console.log("redirects:", redirects);

const today = new Date().toISOString().slice(0, 10);
const urls = [...new Set(sitemap.map(x => x.split("|")[0]))].flatMap(key => ["fr", "en"].map(lg => `  <url>
    <loc>${abs(key, lg)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="fr" href="${abs(key, "fr")}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(key, "en")}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(key, "en")}"/>
  </url>`));
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);
console.log(`built ${count} pages + 404 → ${OUT} (${SITE_URL})`);
