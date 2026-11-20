(function(){
const C = window.CONFIG, IMG = window.IMG, DESTS = window.DESTS, REGIONS = window.REGIONS, THEMES = window.THEMES;
const RETREATS = window.RETREATS || [], RREGIONS = window.RREGIONS || [], ACTIVITIES = window.ACTIVITIES || [];
const EVENTS = window.EVENTS || [], PACKAGES = window.PACKAGES || [], ACTLIB = window.ACTLIB || [], ACTCATS = window.ACTCATS || [], CASES = window.CASES || [];
/* STATIC mode: set by the generated pages (window.SITE = {page, lang, root}); preview uses hash routing */
const STATIC = !!window.SITE;
const ROOT = STATIC ? (window.SITE.root || "") : "";
let lang = STATIC ? window.SITE.lang : "fr";
if (!STATIC) { try { const l = localStorage.getItem("ps-lang"); if (l === "en" || l === "fr") lang = l; } catch(e){} }
const state = { prefill:{}, megaOpen:null, megaRegion:"eu", rRegion:"pt", rfilter:"all", drawer:false, acat:"all", calc:{ pax:25, nights:3, level:1, region:"pt", fly:"eu", act:1 } };
const t = o => (o && typeof o === "object") ? (o[lang] ?? o.fr) : o;
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* phones get the 900px version, larger screens the full one */
const img = (k, alt="", eager) => `<img src="${ROOT}img/${k}.jpg" srcset="${ROOT}img/m/${k}.jpg 1200w, ${ROOT}img/${k}.jpg 1800w" sizes="${eager ? "100vw" : "(max-width:820px) 100vw, 50vw"}" alt="${esc(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
const byS = s => DESTS.find(d => d.s === s);
const byR = s => RETREATS.find(r => r.s === s);
const slugify = x => String(x).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," ").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const THEME_SLUG = { amis:["entre-amis","friends-trips"], cel:["mariages-et-celebrations","weddings-and-celebrations"], fam:["grandes-familles","extended-families"], club:["associations-et-clubs","associations-and-clubs"], sport:["equipes-sportives","sports-teams"], pil:["pelerinages","pilgrimages"], ski:["neige-et-montagne","snow-and-mountains"], sun:["soleil-d-hiver","winter-sun"], saf:["safaris-en-groupe","group-safaris"], city:["escapades-urbaines","city-breaks"] };
const byE = k => EVENTS.find(e => e.k === k);
/* two sides: business (dark) and personal travel (light) */
const B2C_KEYS = ["voyages","destinations","inspiration","voyageurs","devis"];
const sideOf = k => (B2C_KEYS.includes(k) || k.startsWith("dest-") || k.startsWith("theme-")) ? "b2c" : "b2b";
const curKey = () => STATIC ? window.SITE.page : ((location.hash || "#home").slice(1).split("/")[0] || "home");
const PAGES = {
  fr:{ home:"", voyages:"voyages/", comment:"comment-ca-marche/", partenaires:"proposer-votre-lieu/", retraites:"retraites/", brief:"organiser-une-retraite/", evenements:"evenements/", budget:"calculateur-budget/", activites:"activites-team-building/", guide:"guide-organiser-un-seminaire/", destinations:"destinations/", inspiration:"inspiration/", offres:"offres/", voyageurs:"voyageurs/", groupes:"groupes/", entreprises:"entreprises/", "a-propos":"a-propos/", appel:"reserver-un-appel/", devis:"devis/", mentions:"mentions-legales/" },
  en:{ home:"", voyages:"travel/", comment:"how-it-works/", partenaires:"list-your-venue/", retraites:"company-retreats/", brief:"plan-a-retreat/", evenements:"events/", budget:"budget-calculator/", activites:"team-building-activities/", guide:"offsite-planning-guide/", destinations:"destinations/", inspiration:"inspiration/", offres:"offers/", voyageurs:"travellers/", groupes:"groups/", entreprises:"business/", "a-propos":"about/", appel:"book-a-call/", devis:"quote/", mentions:"legal-notice/" }
};
const destSlug = (d, lg) => lg === "en" ? slugify(d.n.en) : d.s;
/* site-relative path for a route key, e.g. "dest-maurice" -> "destinations/maurice/" (FR) or "en/destinations/mauritius/" (EN) */
function pathFor(key, lg){
  lg = lg || lang; const pre = lg === "en" ? "en/" : "", P = PAGES[lg];
  if (key.startsWith("dest-")) { const d = byS(key.slice(5)); return d ? pre + "destinations/" + destSlug(d, lg) + "/" : pre; }
  if (key.startsWith("theme-")) { const k = key.slice(6); return pre + P.inspiration + (THEME_SLUG[k] ? THEME_SLUG[k][lg==="en"?1:0] : k) + "/"; }
  if (key.startsWith("offre-")) return pre + P.offres + key.slice(6) + "/";
  if (key.startsWith("event-")) { const e = byE(key.slice(6)); return e ? pre + P.evenements + e.slug[lg==="en"?1:0] + "/" : pre; }
  if (key.startsWith("retraite-")) { const r = byR(key.slice(9)); return r ? pre + P.retraites + (lg === "en" ? slugify(r.n.en) : r.s) + "/" : pre; }
  return pre + (P[key] ?? "");
}
const urlFor = (key, lg) => (ROOT + pathFor(key, lg)) || "./";
/* in STATIC mode, turn every internal "#key" link into a real page URL */
const linkify = html => !STATIC ? html : html.replace(/href="#([a-z0-9-]+)(?:\/([a-z0-9-]+))?"/g, (m, k, anc) => `href="${urlFor(k)}${anc ? "#" + anc : ""}" data-k="${k}"`);
const wa = (msg) => `https://wa.me/${C.whatsapp}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;

const U = {
  dest:{fr:"Destinations",en:"Destinations"}, insp:{fr:"Inspiration",en:"Inspiration"}, groups:{fr:"Groupes",en:"Groups"},
  corp:{fr:"Entreprises",en:"Business"}, about:{fr:"À propos",en:"About"}, book:{fr:"Réserver un appel",en:"Book a call"},
  quote:{fr:"Demander un devis",en:"Request a quote"}, contact:{fr:"Contact",en:"Contact"},
  retreats:{fr:"Retraites",en:"Retreats"}, retreatsLong:{fr:"Retraites d'entreprise",en:"Company retreats"}, plan:{fr:"Organiser une retraite",en:"Plan a retreat"},
  getProposal:{fr:"Recevoir une proposition",en:"Get a proposal"}, allRetreats:{fr:"Toutes les destinations de retraite",en:"All retreat destinations"},
  leisure:{fr:"Voyages sur mesure",en:"Tailor-made travel"}, events:{fr:"Événements",en:"Events"}, res:{fr:"Ressources",en:"Resources"},
  calc:{fr:"Calculateur de budget",en:"Budget calculator"}, lib:{fr:"Activités de team building",en:"Team-building activities"}, guide:{fr:"Guide : organiser un séminaire",en:"Guide: planning an offsite"},
  promise:{fr:"3 propositions sous 48 h, vols compris",en:"3 proposals within 48 h, flights included"},
  biz:{fr:"Entreprises",en:"Business"}, perso:{fr:"Particuliers",en:"Personal"}, sol:{fr:"Solutions",en:"Solutions"},
  get3:{fr:"Obtenir 3 propositions",en:"Get 3 proposals"}, host:{fr:"Proposer votre lieu",en:"List your venue"}, how:{fr:"Comment ça marche",en:"How it works"},
  travel:{fr:"Voyages",en:"Travel"}, grpB2B:{fr:"Associations, clubs & équipes",en:"Associations, clubs & teams"},
  offers:{fr:"Offres",en:"Offers"}, travellers:{fr:"Voyageurs",en:"Travellers"}, from:{fr:"À partir de",en:"From"},
  example:{fr:"Exemple à remplacer",en:"Sample, to replace"}, seeOffer:{fr:"Voir l'offre",en:"See the offer"},
  reach:{fr:"Joignable au",en:"Call us on"}, seeAll:{fr:"Voir toutes les destinations",en:"See all destinations"},
  whatsapp:{fr:"Écrire sur WhatsApp",en:"Message on WhatsApp"}, discover:{fr:"Découvrir",en:"Discover"},
  when:{fr:"Quand partir",en:"When to go"}, flight:{fr:"Y aller",en:"Getting there"}, ideal:{fr:"Idéal pour",en:"Ideal for"},
  itin:{fr:"Idée d'itinéraire",en:"Sample itinerary"}, nearby:{fr:"Dans la même région",en:"In the same region"},
  noIdea:{fr:"Vous ne savez pas où partir ?",en:"Not sure where to go?"}, inspire:{fr:"S'inspirer",en:"Get inspired"},
  indic:{fr:"Temps de vol et compagnies à titre indicatif ; nous confirmons les options exactes dans votre devis.",en:"Flight times and routings are indicative; we confirm exact options in your quote."}
};
const themeName = k => { const th = THEMES.find(x => x.k === k); return th ? t(th) : (k==="grp" ? t(U.groups) : k); };

/* ---------- shell ---------- */
function sideSwitch(){
  const sd = sideOf(curKey());
  return `<nav class="side" aria-label="${t({fr:'Espace',en:'Space'})}"><a href="#home" aria-current="${sd==='b2b'}">${t(U.biz)}</a><a href="#voyages" aria-current="${sd==='b2c'}">${t(U.perso)}</a></nav>`;
}
function header(){
  const b2c = sideOf(curKey()) === "b2c";
  const nav = b2c ? `
        <button data-mega="dest" aria-expanded="${state.megaOpen==='dest'}">${t(U.dest)}</button>
        <button data-mega="insp" aria-expanded="${state.megaOpen==='insp'}">${t(U.insp)}</button>
        <a href="#devis">${t(U.quote)}</a>
        <a href="#a-propos">${t(U.about)}</a>` : `
        <button data-mega="sol" aria-expanded="${state.megaOpen==='sol'}">${t(U.sol)}</button>
        <button data-mega="ret" aria-expanded="${state.megaOpen==='ret'}">${t(U.dest)}</button>
        <button data-mega="res" aria-expanded="${state.megaOpen==='res'}">${t(U.res)}</button>
        <a href="#offres">${t(U.offers)}</a>
        <a href="#a-propos">${t(U.about)}</a>`;
  return `
  <div class="util"><div class="wrap">
    <span>${t(U.reach)} <b style="font-weight:400;color:var(--ink)">${esc(C.phone)}</b><span class="hide-s"> · ${t(C.hours)}</span></span>
    <span style="display:flex;gap:14px;align-items:center"><span class="hide-s">Français · English</span>${social()}</span>
  </div></div>
  <header class="site" id="hdr">
    <div class="wrap bar">
      <div class="brand"><a href="${b2c ? "#voyages" : "#home"}" class="logo" aria-label="Permanent Summer Voyages"><b>Permanent Summer</b><span>Voyages</span></a>${sideSwitch()}</div>
      <nav class="main" aria-label="Menu">${nav}
      </nav>
      <div class="right">
        ${b2c ? "" : `<a href="#partenaires" class="hostlink hide-m">${t(U.host)}</a>`}
        <div class="lang" role="group" aria-label="Langue / Language">
          ${["fr","en"].map(l => STATIC
            ? `<a href="${urlFor(window.SITE.page, l)}" hreflang="${l}" lang="${l}" aria-pressed="${lang===l}">${l.toUpperCase()}</a>`
            : `<button data-lang="${l}" aria-pressed="${lang===l}">${l.toUpperCase()}</button>`).join("")}
        </div>
        ${b2c ? `<a href="#devis" class="btn ghost hide-m" style="height:40px;padding:0 18px">${t(U.quote)}</a>` : `<a href="#brief" class="btn ghost hide-m" style="height:40px;padding:0 18px">${t(U.get3)}</a>`}
        <button class="burger" aria-label="Menu" data-act="drawer"><i></i><i></i><i></i></button>
      </div>
    </div>
    ${state.megaOpen==='sol' ? megaSol() : ""}${state.megaOpen==='ret' ? megaRet() : ""}${state.megaOpen==='res' ? megaRes() : ""}${state.megaOpen==='dest' ? megaDest() : ""}${state.megaOpen==='insp' ? megaInsp() : ""}
  </header>`;
}
function megaSol(){
  return `<div class="mega insp sol"><div class="wrap">
    <div class="col"><span class="eyebrow" style="margin-bottom:6px">${t(U.events)}</span>${EVENTS.map(e=>`<a href="#event-${e.k}">${t(e.n)}</a>`).join("")}<a href="#evenements" class="link" style="align-self:flex-start;margin-top:10px">${t({fr:"Tous les événements",en:"All events"})}</a></div>
    <div class="col"><span class="eyebrow" style="margin-bottom:6px">${t({fr:"Groupes & services",en:"Groups & services"})}</span><a href="#groupes">${t(U.grpB2B)}</a><a href="#comment">${t(U.how)}</a><a href="#comment/vols">${t({fr:"Vols de groupe",en:"Group flights"})}</a><a href="#entreprises">${t({fr:"Voyages d'affaires",en:"Business travel"})}</a><a href="#offres">${t({fr:"Formules clés en main",en:"Turnkey retreats"})}</a></div>
    <a class="promo" href="#event-seminaire">${img("team_cafe", t(EVENTS[0].n))}<div><div class="eyebrow" style="color:#fff;opacity:.85">${t({fr:"Le plus demandé",en:"Most requested"})}</div><div style="font-size:20px">${t(EVENTS[0].n)}</div></div></a>
  </div></div>`;
}
function megaRet(){
  const r = state.rRegion, list = RETREATS.filter(x => x.r === r), first = list[0];
  return `<div class="mega"><div class="wrap">
    <div class="regions" role="tablist">${RREGIONS.map(x => `<button role="tab" data-rregion="${x.k}" aria-selected="${x.k===r}">${t(x)} <small>${RETREATS.filter(d=>d.r===x.k).length}</small></button>`).join("")}</div>
    <div class="links"><a class="all" href="#retraites">${t(U.allRetreats)} →</a>${list.map(d => `<a href="#retraite-${d.s}">${t(d.n)}</a>`).join("")}<a class="all" href="#offres" style="margin-top:14px">${t({fr:"Formules clés en main & offres",en:"Turnkey retreats & offers"})} →</a></div>
    <a class="promo" href="#retraite-${first.s}">${img(first.img[0], t(first.n))}<div><div class="eyebrow" style="color:#fff;opacity:.85">${t(first.c)}</div><div style="font-size:20px">${t(first.n)}</div></div></a>
  </div></div>`;
}
function megaDest(){
  const r = state.megaRegion, list = DESTS.filter(d => d.r === r), first = list[0];
  return `<div class="mega"><div class="wrap">
    <div class="regions" role="tablist">${REGIONS.map(x => `<button role="tab" data-region="${x.k}" aria-selected="${x.k===r}">${t(x)} <small>${DESTS.filter(d=>d.r===x.k).length}</small></button>`).join("")}</div>
    <div class="links"><a class="all" href="#destinations">${t(U.seeAll)} →</a>${list.map(d => `<a href="#dest-${d.s}">${t(d.n)}</a>`).join("")}<a class="all" href="#inspiration" style="margin-top:14px">${t(U.insp)} →</a></div>
    <a class="promo" href="#dest-${first.s}">${img(first.img[0], t(first.n))}<div><div class="eyebrow" style="color:#fff;opacity:.85">${t(first.c)}</div><div style="font-size:20px">${t(first.n)}</div></div></a>
  </div></div>`;
}
function megaInsp(){
  const half = Math.ceil(THEMES.length/2);
  return `<div class="mega insp"><div class="wrap">
    <div class="col"><span class="eyebrow" style="margin-bottom:6px">${t({fr:"Par envie",en:"By mood"})}</span>${THEMES.slice(0,half).map(x=>`<a href="#theme-${x.k}">${t(x)}</a>`).join("")}</div>
    <div class="col"><span class="eyebrow" style="margin-bottom:6px">&nbsp;</span>${THEMES.slice(half).map(x=>`<a href="#theme-${x.k}">${t(x)}</a>`).join("")}<a href="#inspiration" class="link" style="align-self:flex-start;margin-top:10px">${t({fr:"Toutes les inspirations",en:"All inspiration"})}</a></div>
    <a class="promo" href="#theme-amis">${img("travel_balloons")}<div><div class="eyebrow" style="color:#fff;opacity:.85">${t({fr:"Ce mois-ci",en:"This month"})}</div><div style="font-size:20px">${t(THEMES[0])}</div></div></a>
  </div></div>`;
}
function megaRes(){
  return `<div class="mega insp"><div class="wrap">
    <div class="col"><span class="eyebrow" style="margin-bottom:6px">${t({fr:"Outils",en:"Tools"})}</span><a href="#budget">${t(U.calc)}</a><a href="#activites">${t(U.lib)}</a><a href="#guide">${t(U.guide)}</a></div>
    <div class="col"><span class="eyebrow" style="margin-bottom:6px">${t({fr:"Démarrer",en:"Get started"})}</span><a href="#brief">${t(U.get3)}</a><a href="#appel">${t(U.book)}</a><a href="#partenaires">${t(U.host)}</a></div>
    <a class="promo" href="#budget">${img("nomad_balcony")}<div><div class="eyebrow" style="color:#fff;opacity:.85">${t({fr:"Gratuit",en:"Free"})}</div><div style="font-size:20px">${t({fr:"Estimez votre budget, vols compris",en:"Estimate your budget, flights included"})}</div></div></a>
  </div></div>`;
}
const ICON = {
  facebook:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none"/></svg>'
};
function social(){
  const S = C.social || {};
  return `<span class="social">${["facebook","instagram"].map(k => S[k]
    ? `<a href="${esc(S[k])}" target="_blank" rel="noopener" aria-label="${k}">${ICON[k]}</a>`
    : `<span data-empty title="${t({fr:'Lien à ajouter',en:'Link to add'})}" aria-label="${k}">${ICON[k]}</span>`).join("")}</span>`;
}

function drawer(){
  if (!state.drawer) return "";
  const b2c = sideOf(curKey()) === "b2c";
  const body = b2c ? `
    <details open><summary>${t(U.dest)}</summary><div><a href="#destinations">${t(U.seeAll)}</a>${DESTS.map(d=>`<a href="#dest-${d.s}">${t(d.n)}</a>`).join("")}</div></details>
    <details><summary>${t(U.insp)}</summary><div><a href="#inspiration">${t({fr:"Toutes les inspirations",en:"All inspiration"})}</a>${THEMES.map(x=>`<a href="#theme-${x.k}">${t(x)}</a>`).join("")}</div></details>
    <a href="#a-propos">${t(U.about)}</a>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:28px"><a href="#devis" class="btn accent">${t(U.quote)}</a><a href="#appel" class="btn ghost">${t(U.book)}</a>` : `
    <details open><summary>${t(U.sol)}</summary><div><a href="#evenements">${t({fr:"Tous les événements",en:"All events"})}</a>${EVENTS.map(e=>`<a href="#event-${e.k}">${t(e.n)}</a>`).join("")}<a href="#groupes">${t(U.grpB2B)}</a><a href="#comment">${t(U.how)}</a><a href="#entreprises">${t({fr:"Voyages d'affaires",en:"Business travel"})}</a></div></details>
    <details><summary>${t(U.dest)}</summary><div><a href="#retraites">${t(U.allRetreats)}</a>${RETREATS.map(r=>`<a href="#retraite-${r.s}">${t(r.n)}</a>`).join("")}</div></details>
    <details><summary>${t(U.res)}</summary><div><a href="#budget">${t(U.calc)}</a><a href="#activites">${t(U.lib)}</a><a href="#guide">${t(U.guide)}</a></div></details>
    <a href="#offres">${t(U.offers)}</a><a href="#partenaires">${t(U.host)}</a><a href="#a-propos">${t(U.about)}</a>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:28px"><a href="#brief" class="btn accent">${t(U.get3)}</a><a href="#appel" class="btn ghost">${t(U.book)}</a>`;
  return `<div class="drawer" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="top"><a href="${b2c ? "#voyages" : "#home"}" class="logo" style="align-items:flex-start"><b>Permanent Summer</b><span>Voyages</span></a><button class="x" data-act="drawer" aria-label="${t({fr:'Fermer',en:'Close'})}">×</button></div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">${sideSwitch()}<div class="lang" role="group" aria-label="Langue / Language">${["fr","en"].map(l => STATIC ? `<a href="${urlFor(window.SITE.page, l)}" hreflang="${l}" lang="${l}" aria-pressed="${lang===l}">${l.toUpperCase()}</a>` : `<button data-lang="${l}" aria-pressed="${lang===l}">${l.toUpperCase()}</button>`).join("")}</div></div>
    ${body}
      <a href="${wa()}" target="_blank" rel="noopener" class="btn ghost">${t(U.whatsapp)}</a>
      <p class="note" style="margin-top:8px">${esc(C.phone)} · ${t(C.hours)}</p>
      <div style="margin-top:8px">${social()}</div>
    </div></div>`;
}
function footer(){
  return `<footer class="site"><div class="wrap">
    <div class="cols">
      <div>
        <a href="#home" class="logo" style="align-items:flex-start"><b>Permanent Summer</b><span>Voyages</span></a>
        <p class="note" style="margin-top:18px;max-width:34ch">${t({fr:"Une fois par mois : idées de lieux, activités et conseils pour organiser vos séminaires et voyages de groupe.",en:"Once a month: venue ideas, activities and tips for planning offsites and group trips."})}</p>
        <div style="margin-top:20px">${social()}</div>
        <form class="news" data-form="news"><label for="nl" class="sr" style="position:absolute;left:-9999px">Email</label><input id="nl" type="email" required placeholder="email@exemple.com"><button class="btn">${t({fr:"S'inscrire",en:"Sign up"})}</button></form>
      </div>
      <div><h4>${t(U.biz)}</h4><a href="#retraites">${t(U.retreatsLong)}</a>${EVENTS.map(e=>`<a href="#event-${e.k}">${t(e.n)}</a>`).join("")}<a href="#groupes">${t(U.grpB2B)}</a><a href="#offres">${t(U.offers)}</a><a href="#entreprises">${t({fr:"Voyages d'affaires",en:"Business travel"})}</a></div>
      <div><h4>${t(U.res)}</h4><a href="#comment">${t(U.how)}</a><a href="#budget">${t(U.calc)}</a><a href="#activites">${t(U.lib)}</a><a href="#guide">${t(U.guide)}</a><a href="#partenaires">${t(U.host)}</a><a href="#a-propos">${t({fr:"Notre histoire",en:"Our story"})}</a><a href="#mentions">${t({fr:"Mentions légales",en:"Legal notice"})}</a></div>
      <div><h4>${t(U.perso)}</h4><a href="#voyages">${t(U.leisure)}</a><a href="#destinations">${t(U.dest)}</a><a href="#inspiration">${t(U.insp)}</a><a href="#devis">${t(U.quote)}</a></div>
      <div><h4>${t(U.contact)}</h4><a href="#appel">${t(U.book)}</a><a href="${wa()}" target="_blank" rel="noopener">WhatsApp</a><span style="display:block;padding:4px 0;font-size:15px;user-select:all">${esc(C.phone)}</span><span style="display:block;padding:4px 0;font-size:15px;user-select:all">${esc(C.email)}</span></div>
    </div>
    <div class="legal"><span>© 2026 Permanent Summer Lda · Portugal</span><span>${t({fr:"Billets d'avion émis par notre partenaire agréé",en:"Flight tickets issued by our licensed partner"})}</span><span><a href="#mentions">${t({fr:"Confidentialité",en:"Privacy"})}</a> · <a href="#mentions">${t({fr:"Conditions",en:"Terms"})}</a></span></div>
  </div></footer>
  <a class="wa" href="${wa(lang==='fr'?'Bonjour, je souhaite organiser une retraite ou un voyage de groupe.':'Hello, I would like to plan a retreat or group trip.')}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.4-.3z"/></svg><span>WhatsApp</span></a>`;
}

/* ---------- pieces ---------- */
const card = (d, cls="") => `<a class="card ${cls}" href="#dest-${d.s}"><div class="ph">${img(d.img[0], t(d.n))}</div><div><h3>${t(d.n)}</h3><div class="meta">${t(d.c)}</div></div></a>`;
const destOptions = (sel) => `<option value="">${t({fr:"Je ne sais pas encore",en:"Not sure yet"})}</option>` + REGIONS.map(r => `<optgroup label="${esc(t(r))}">${DESTS.filter(d=>d.r===r.k).map(d=>`<option value="${d.s}" ${d.s===sel?"selected":""}>${esc(t(d.n))}</option>`).join("")}</optgroup>`).join("");

/* ---------- pages ---------- */
function statsBar(){
  return `<div class="stats">
    <div><b>10 → 500+</b><span>${t({fr:"participants par groupe",en:"people per group"})}</span></div>
    <div><b>${RETREATS.length}</b><span>${t({fr:"destinations de retraite en Europe et au-delà",en:"retreat destinations in Europe and beyond"})}</span></div>
    <div><b>48 h</b><span>${t({fr:"pour recevoir 3 propositions complètes",en:"to get 3 complete proposals"})}</span></div>
    <div><b>35 ${t({fr:"ans",en:"years"})}</b><span>${t({fr:"d'expérience en agence de voyage",en:"of travel agency experience"})}</span></div>
  </div>`;
}
function sizeCards(){
  const S = [["team_small","10–30",20,{fr:"Petite équipe",en:"Small team"},{fr:"Villa ou quinta privatisée, programme sur mesure, ambiance de maison partagée. Idéal pour une startup ou un comité de direction.",en:"An exclusive-use villa or quinta, a tailored programme, a shared-house feel. Ideal for a startup or leadership team."}],
             ["team_villa2","30–100",50,{fr:"Toute l'entreprise",en:"The whole company"},{fr:"Hôtel boutique ou domaine avec plénière et salles de sous-commission, activités en parallèle, vols depuis plusieurs pays.",en:"A boutique hotel or estate with a plenary and breakout rooms, parallel activities, flights from several countries."}],
             ["act_dinner2","100+",150,{fr:"Grand groupe",en:"Large group"},{fr:"Kick-off, convention ou incentive : plusieurs hôtels, arrivées par vagues, transferts et soirée privatisée.",en:"Kickoff, convention or incentive: several hotels, arrivals in waves, transfers and a private party."}]];
  return `<div class="sizes">${S.map(([im,r,pax,h,p])=>`<a class="size" href="#brief" data-pax="${pax}"><div class="ph">${img(im, t(h))}</div><div class="b"><span class="eyebrow">${t(h)}</span><span class="n">${r} <small style="font-family:var(--body);font-size:15px;color:var(--muted)">${t({fr:"personnes",en:"people"})}</small></span><p>${t(p)}</p><span class="link" style="align-self:flex-start">${t(U.getProposal)} →</span></div></a>`).join("")}</div>`;
}
function promiseBox(){
  return `<div class="promise"><div><span class="eyebrow">${t({fr:"Notre engagement",en:"Our promise"})}</span><div style="margin-top:6px"><b>${t(U.promise)}</b></div><p class="note" style="margin-top:6px">${t({fr:"Lieu, programme, activités, vols de chaque participant et budget par personne. Sans engagement.",en:"Venue, programme, activities, every participant's flights and budget per person. No commitment."})}</p></div><a class="btn accent" href="#brief">${t(U.plan)}</a></div>`;
}
function compareTable(){
  const Y = `<span class="yes">${t({fr:"Oui",en:"Yes"})}</span>`, N = `<span class="no">${t({fr:"Non",en:"No"})}</span>`, P = x => `<span class="part">${t(x)}</span>`;
  const rows = [
    [{fr:"Recherche et négociation des lieux",en:"Venue search and negotiation"}, Y, P({fr:"Des semaines de recherche",en:"Weeks of searching"}), Y],
    [{fr:"Programme et activités sur mesure",en:"Tailored programme and activities"}, Y, P({fr:"À construire soi-même",en:"Build it yourself"}), Y],
    [{fr:"Vols de chaque participant, depuis sa ville",en:"Every participant's flights, from their own city"}, Y, P({fr:"Chacun réserve le sien",en:"Everyone books their own"}), N, true],
    [{fr:"Arrivées coordonnées le même jour",en:"Coordinated same-day arrivals"}, Y, N, N, true],
    [{fr:"Changements de vol gérés pendant le voyage",en:"Flight changes handled during the trip"}, Y, N, N, true],
    [{fr:"Un budget global par personne, vols inclus",en:"One budget per person, flights included"}, Y, P({fr:"Tableur",en:"Spreadsheet"}), P({fr:"Hors vols",en:"Excl. flights"}), true],
    [{fr:"Un interlocuteur joignable 7j/7",en:"One contact reachable 7 days a week"}, Y, N, P({fr:"Selon l'agence",en:"Depends on the agency"})]
  ];
  return `<div class="cmpwrap"><table class="cmp">
    <thead><tr><th></th><th class="us">Permanent Summer Voyages</th><th>${t({fr:"En interne",en:"In-house"})}</th><th>${t({fr:"Agence de séminaires classique",en:"Typical retreat agency"})}</th></tr></thead>
    <tbody>${rows.map(([l,a,b,c,k])=>`<tr class="${k?'key':''}"><td>${t(l)}</td><td class="us" data-label="Permanent Summer">${a}</td><td data-label="${t({fr:"En interne",en:"In-house"})}">${b}</td><td data-label="${t({fr:"Agence classique",en:"Typical agency"})}">${c}</td></tr>`).join("")}</tbody>
  </table></div>`;
}
const packageCard = k => `<a class="pk" href="#brief" data-rpre="${k.rdest}" data-nights="${k.nights}"><div class="ph">${img(k.img, t(k.n))}<span class="tag">${k.nights} ${t({fr:"nuits",en:"nights"})} · ${t(k.size)} ${t({fr:"pers.",en:"people"})}</span></div>
  <div><span class="eyebrow">${t(k.place)}</span><h3 style="margin-top:4px">${t(k.n)}</h3></div><ul>${t(k.inc).map(x=>`<li>${esc(x)}</li>`).join("")}</ul><span class="link" style="align-self:flex-start">${t({fr:"Recevoir le devis",en:"Get a quote"})} →</span></a>`;
const eventTiles = () => `<div class="evtiles">${EVENTS.map(e=>`<a href="#event-${e.k}"><div class="ph">${img(e.img, t(e.n))}</div><b>${t(e.n)}</b><small>${t(e.size)}</small></a>`).join("")}</div>`;
function casesSection(){
  if (!CASES.length) return "";
  return `<section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Études de cas",en:"Case studies"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Retraites récentes",en:"Recent retreats"})}</h2></div></div>
    <div class="grid three">${CASES.map(c=>`<article class="card wide"><div class="ph">${img(c.img, c.co)}</div><div><span class="eyebrow">${esc(c.co)}</span><h3 style="margin-top:6px">${c.pax} ${t({fr:"personnes",en:"people"})} · ${c.nights} ${t({fr:"nuits",en:"nights"})} · ${c.cities} ${t({fr:"villes de départ",en:"departure cities"})}</h3><p class="meta" style="margin-top:6px">${t(c.t)}</p>${c.quote?`<p class="it" style="margin-top:10px">« ${t(c.quote)} »</p><p class="note">${esc(c.who||"")}</p>`:""}</div></article>`).join("")}</div>
  </div></section>`;
}
function guideStrip(){
  return `<section class="section surface"><div class="wrap split">
    <div class="text"><span class="eyebrow">${t({fr:"Guide gratuit",en:"Free guide"})}</span><h2 class="h2">${t({fr:"Organiser un séminaire : la checklist complète, de J-6 mois au retour",en:"Planning an offsite: the complete checklist, from 6 months out to back home"})}</h2>
      <p class="lede">${t({fr:"Budget, choix du lieu, vols, programme, communication aux participants : tout ce qu'on vérifie pour chaque retraite, étape par étape.",en:"Budget, venue, flights, programme, participant comms: everything we check for every retreat, step by step."})}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="#guide">${t({fr:"Lire le guide",en:"Read the guide"})}</a><a class="btn ghost" href="#budget">${t(U.calc)}</a></div></div>
    <div class="media ph">${img("act_workshop2")}</div>
  </div></section>`;
}

function home(){
  const featured = ["algarve","lisbonne","ericeira","majorque","athenes","toscane","marrakech","cracovie"].map(byR).filter(Boolean);
  return `
  <section class="hero lean">
    <div class="ph">${img("team_walk", t({fr:"Une équipe se promène en bord de mer au soleil",en:"A team walking along the seafront in the sun"}), true)}</div>
    <div class="wrap">
      <h1 class="display">${t({fr:"Vos retraites d'entreprise, vols compris.",en:"Company retreats, flights included."})}</h1>
      <p class="sub">${t({fr:"Le lieu, le programme et le billet d'avion de chaque participant. 3 propositions sous 48 h.",en:"The venue, the programme and every participant's plane ticket. 3 proposals within 48 h."})}</p>
      <div class="ctas"><a class="btn accent" href="#brief">${t(U.get3)}</a><a class="btn light ghost" href="#budget">${t({fr:"Estimer mon budget",en:"Estimate my budget"})}</a></div>
    </div>
  </section>

  <section class="section tight"><div class="wrap">
    <div class="minibox"><span class="eyebrow">${t({fr:"Commencez ici",en:"Start here"})}</span>
      <form class="mini" data-form="minibrief">
        <label for="m-pax">${t({fr:"Participants",en:"People"})}<input id="m-pax" type="number" min="10" max="2000" value="20"></label>
        <label for="m-dest">${t({fr:"Destination",en:"Destination"})}<select id="m-dest">${retreatOptions()}</select></label>
        <label for="m-month">${t({fr:"Période",en:"When"})}<select id="m-month">${monthOptions()}</select></label>
        <button class="btn accent" type="submit">${t(U.getProposal)}</button>
      </form>
    </div>
    <div style="margin-top:40px">${statsBar()}</div>
  </div></section>

  <section class="section" style="padding-top:24px"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Pour toutes les tailles d'équipe",en:"For every team size"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Quelle est la taille de votre équipe ?",en:"How big is your team?"})}</h2></div></div>
    ${sizeCards()}
  </div></section>

  <section class="section surface"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t(U.retreatsLong)}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Des lieux qui font naître les idées",en:"Places that spark ideas"})}</h2></div><a class="link" href="#retraites">${t(U.allRetreats)} (${RETREATS.length})</a></div>
    <div class="grid">${featured.map(retreatCard).join("")}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t(U.events)}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Un format pour chaque objectif",en:"A format for every goal"})}</h2></div><a class="link" href="#evenements">${t({fr:"Tous les événements",en:"All events"})}</a></div>
    ${eventTiles()}
  </div></section>

  <section class="section surface"><div class="wrap split">
    <div class="text">
      <span class="eyebrow">${t({fr:"Ce qui nous différencie",en:"What makes us different"})}</span>
      <h2 class="h2">${t({fr:"Les autres agences s'arrêtent au lieu. Nous réservons aussi les vols.",en:"Other agencies stop at the venue. We book the flights too."})}</h2>
      <ul class="inc">
        <li>${t({fr:"Le billet de chaque participant, depuis sa ville",en:"Every participant's ticket, from their own city"})}</li>
        <li>${t({fr:"Des arrivées coordonnées le même jour",en:"Coordinated same-day arrivals"})}</li>
        <li>${t({fr:"Un budget par personne, vols inclus",en:"One budget per person, flights included"})}</li>
        <li>${t({fr:"Un humain joignable 7j/7 si un vol change",en:"A human reachable 7 days a week if a flight changes"})}</li>
      </ul>
      <a class="link" href="#comment">${t(U.how)}</a>
    </div>
    <div class="media ph">${img("team_sail")}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Exemples de programmes",en:"Sample programmes"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Ce que vivent les équipes",en:"What teams get up to"})}</h2></div><a class="link" href="#activites">${t(U.lib)}</a></div>
    <div class="acts">${(window.PROGRAMS||[]).map(g=>{ const r = byR(g.r); return r ? `<a class="act" href="#retraite-${r.s}"><div class="ph">${img(g.img, t(r.n))}</div><span class="eyebrow">${t(r.n)} · ${g.pax} ${t({fr:"personnes",en:"people"})} · ${g.nights} ${t({fr:"nuits",en:"nights"})}</span><p style="color:var(--ink)">${t(g.t)}</p><span class="link" style="align-self:flex-start">${t({fr:"Voir la destination",en:"See the destination"})}</span></a>` : ""; }).join("")}</div>
    <div style="margin-top:56px">${promiseBox()}</div>
  </div></section>`;
}

function voyagesHome(){
  const hot = (window.HOT || []).map(byS).filter(Boolean).slice(0,6);
  return `
  <section class="hero lean">
    <div class="ph">${img("travel_couple", t({fr:"Deux voyageurs face à un paysage",en:"Two travellers looking at a view"}), true)}</div>
    <div class="wrap">
      <h1 class="display">${t({fr:"Vos voyages sur mesure, vols compris.",en:"Tailor-made trips, flights included."})}</h1>
      <p class="sub">${t({fr:"En couple, en famille ou entre amis : quelqu'un qui organise tout, et qui répond pendant le voyage.",en:"As a couple, a family or with friends: someone who plans it all, and who answers during the trip."})}</p>
      <div class="ctas"><a class="btn accent" href="#devis">${t(U.quote)}</a><a class="btn light ghost" href="#destinations">${t(U.dest)}</a></div>
    </div>
  </section>

  <section class="section tight"><div class="wrap">
    <div class="minibox"><span class="eyebrow">${t({fr:"Votre prochain voyage",en:"Your next trip"})}</span>
      <form class="mini" data-form="search">
        <label for="s-dest">${t({fr:"Destination",en:"Destination"})}<select id="s-dest">${destOptions()}</select></label>
        <label for="s-out">${t({fr:"Départ",en:"Departure"})}<input id="s-out" type="date"></label>
        <label for="s-pax">${t({fr:"Voyageurs",en:"Travellers"})}<input id="s-pax" type="number" min="1" value="2"></label>
        <button class="btn accent" type="submit">${t(U.quote)}</button>
      </form>
    </div>
  </div></section>

  <section class="section" style="padding-top:24px"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t(U.dest)}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Où partir cette année",en:"Where to go this year"})}</h2></div><a class="link" href="#destinations">${t(U.seeAll)} (${DESTS.length})</a></div>
    <div class="tiles">${hot.map(d=>`<a class="tile" href="#dest-${d.s}">${img(d.img[0],t(d.n))}<div><b>${t(d.n)}</b><small>${t(d.c)}</small></div></a>`).join("")}</div>
  </div></section>

  <section class="section surface"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t(U.insp)}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Partir d'une envie",en:"Start from a feeling"})}</h2></div><a class="link" href="#inspiration">${t({fr:"Toutes les inspirations",en:"All inspiration"})}</a></div>
    <div class="themes">${THEMES.slice(0,6).map(x=>`<a class="theme" href="#theme-${x.k}">${img(x.img,t(x))}<div><h3>${t(x)}</h3><p>${t(x.d)}</p></div></a>`).join("")}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="head"><h2 class="h2">${t({fr:"Pourquoi passer par nous",en:"Why book with us"})}</h2></div>
    <div class="why">
      <div><b>${t({fr:"Les bons vols, au bon prix",en:"The right flights, at the right price"})}</b><span>${t({fr:"Accès direct aux tarifs des compagnies : les correspondances qui tiennent, les bagages compris, les meilleurs horaires.",en:"Direct access to airline fares: connections that work, bags included, the best times."})}</span></div>
      <div><b>${t({fr:"Une seule personne",en:"One person"})}</b><span>${t({fr:"Vols, hôtels, transferts, excursions : un seul interlocuteur, du premier message au retour.",en:"Flights, hotels, transfers, excursions: one contact, from the first message to coming home."})}</span></div>
      <div><b>${t({fr:"Quelqu'un répond, même à 2 h du matin",en:"Someone answers, even at 2 am"})}</b><span>${t({fr:"Correspondance annulée ? Nous vous replaçons sur le premier vol avant même que vous arriviez au comptoir.",en:"Connection cancelled? We rebook you on the first flight before you even reach the desk."})}</span></div>
    </div>
  </div></section>

  ${(window.AMBASSADORS||[]).length ? `<section class="section surface"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t(U.travellers)}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Ils sont partis avec nous",en:"They travelled with us"})}</h2></div><a class="link" href="#voyageurs">${t({fr:"Toutes les vidéos",en:"All videos"})}</a></div>
    <div class="reels">${window.AMBASSADORS.slice(0,3).map((a,i)=>reel(a,i)).join("")}</div>
  </div></section>` : ""}

  <section class="section"><div class="wrap split">
    <div class="text"><span class="eyebrow">${t(U.book)}</span><h2 class="h2">${t({fr:"Parlons de votre prochain voyage",en:"Let's talk about your next trip"})}</h2><p class="lede">${t({fr:"Trente minutes pour poser les bases : dates, budget, envies. Vous recevez ensuite un devis détaillé.",en:"Thirty minutes to set the basics: dates, budget, wishes. Then you get a detailed quote."})}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn accent" href="#appel">${t(U.book)}</a><a class="btn ghost" href="${wa()}" target="_blank" rel="noopener">WhatsApp</a></div></div>
    <div class="media ph">${img("travel_balloons")}</div>
  </div></section>`;
}

function howPage(){
  return `
  <section class="section"><div class="wrap">
    <span class="eyebrow">${t(U.how)}</span>
    <h1 class="display" style="font-size:clamp(38px,5vw,64px);margin:12px 0 14px;max-width:18ch">${t({fr:"Du brief au retour de toute l'équipe",en:"From brief to everyone back home"})}</h1>
    <p class="lede" style="margin-bottom:44px">${t({fr:"Un seul interlocuteur pour le lieu, le programme, les activités et les vols de chaque participant.",en:"One contact for the venue, programme, activities and every participant's flights."})}</p>
    ${howSteps()}
  </div></section>
  <section class="section surface" id="vols" style="scroll-margin-top:90px"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Vols de groupe",en:"Group flights"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Les autres agences s'arrêtent au lieu. Nous réservons aussi les vols.",en:"Other agencies stop at the venue. We book the flights too."})}</h2></div></div>
    ${compareTable()}
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"L'assistance autrement",en:"Assistance, done differently"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Quand ça se complique, quelqu'un répond.",en:"When things go wrong, someone answers."})}</h2></div></div>
    <div class="scen">
      ${[["plane2",{fr:"02:10 · Francfort",en:"02:10 · Frankfurt"},{fr:"Correspondance annulée",en:"Connection cancelled"},{fr:"Rebooking sur le premier vol du matin et nuit d'hôtel avant même d'arriver au comptoir.",en:"Rebooked on the first morning flight with a hotel night before you reach the desk."}],
         ["plane",{fr:"07:45 · Lisbonne",en:"07:45 · Lisbon"},{fr:"Un participant bloqué",en:"One participant stranded"},{fr:"Son vol depuis Berlin est annulé : il arrive l'après-midi même, l'équipe ne l'attend pas.",en:"Their Berlin flight is cancelled: they arrive the same afternoon, the team doesn't wait."}],
         ["mallorca2",{fr:"11:00 · Majorque",en:"11:00 · Mallorca"},{fr:"Météo capricieuse",en:"Bad weather"},{fr:"Le catamaran est déplacé au lendemain, un cours de cuisine le remplace.",en:"The catamaran moves to the next day; a cooking class takes its place."}],
         ["act_longtable",{fr:"18:30 · Toscane",en:"18:30 · Tuscany"},{fr:"Huit personnes de plus",en:"Eight extra people"},{fr:"La direction s'invite au dernier dîner : table, chambres et transferts ajoutés dans l'heure.",en:"Leadership joins the last dinner: table, rooms and transfers added within the hour."}]
        ].map(([k,c,h,p])=>`<div><div class="ph">${img(k)}</div><div class="t"><span class="clock">${t(c)}</span><b>${t(h)}</b><span>${t(p)}</span></div></div>`).join("")}
    </div>
  </div></section>
  <section class="section surface"><div class="wrap">
    <div class="faq" style="max-width:820px"><h2 class="h2" style="margin-bottom:14px">${t({fr:"Prix et facturation",en:"Pricing and invoicing"})}</h2>
      ${[[{fr:"Comment est fixé le prix ?",en:"How is the price set?"},{fr:"Chaque proposition détaille le budget par personne : lieu, vols, activités et nos honoraires d'organisation, fixés à l'avance. Pas de frais cachés.",en:"Each proposal details the budget per person: venue, flights, activities and our planning fee, agreed upfront. No hidden costs."}],
         [{fr:"Qui facture quoi ?",en:"Who invoices what?"},{fr:"Nous facturons nos honoraires d'organisation. Les lieux et prestataires vous facturent directement, au tarif que nous avons négocié, et les billets d'avion sont émis par notre partenaire agence agréé.",en:"We invoice our planning fee. Venues and suppliers invoice you directly at the rate we negotiated, and flight tickets are issued by our licensed travel agency partner."}],
         [{fr:"Quel budget prévoir ?",en:"What budget should we plan?"},{fr:"Le plus souvent entre 700 et 2 000 € par personne pour 3 nuits, vols compris. Notre calculateur vous donne une première fourchette en 30 secondes.",en:"Usually €700 to €2,000 per person for 3 nights, flights included. Our calculator gives you a first range in 30 seconds."}]
        ].map(([q,a])=>`<details><summary>${t(q)}</summary><p>${t(a)}</p></details>`).join("")}
    </div>
  </div></section>
  <section class="section"><div class="wrap">${promiseBox()}</div></section>`;
}

/* ---------- venue partners ---------- */
function partnersPage(){
  return `
  <section class="hero short"><div class="ph">${img("venue_manor", t({fr:"Un manoir avec jardins",en:"A manor house with gardens"}), true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t({fr:"Hôtels, villas, domaines",en:"Hotels, villas, estates"})}</div>
    <h1 class="display" style="margin-top:12px">${t({fr:"Accueillez des retraites d'entreprise en semaine",en:"Host company retreats on weekdays"})}</h1>
    <p class="sub">${t({fr:"Présentez votre lieu en 10 minutes. L'inscription est gratuite.",en:"Present your venue in 10 minutes. Listing is free."})}</p>
    <div class="ctas"><a class="btn accent" href="#partenaires/vform">${t(U.host)}</a></div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><h2 class="h2">${t({fr:"Pourquoi travailler avec nous",en:"Why work with us"})}</h2></div>
    <div class="why">
      <div><b>${t({fr:"Des réservations en semaine",en:"Weekday bookings"})}</b><span>${t({fr:"Les retraites d'entreprise ont lieu du lundi au vendredi, quand vos chambres sont le moins demandées.",en:"Company retreats run Monday to Friday, when your rooms are least in demand."})}</span></div>
      <div><b>${t({fr:"Des groupes entiers",en:"Whole groups"})}</b><span>${t({fr:"De 10 à 150 personnes, souvent en privatisation, pour plusieurs nuits.",en:"From 10 to 150 people, often on an exclusive-use basis, for several nights."})}</span></div>
      <div><b>${t({fr:"Chambres, repas et salles",en:"Rooms, meals and meeting space"})}</b><span>${t({fr:"Nos clients réservent l'hébergement, la restauration, les salles et souvent les activités sur place.",en:"Our clients book accommodation, food and drink, meeting rooms and often on-site activities."})}</span></div>
      <div><b>${t({fr:"Réservé à l'avance",en:"Booked well ahead"})}</b><span>${t({fr:"Les retraites se planifient plusieurs mois à l'avance : moins d'annulations de dernière minute.",en:"Retreats are planned months ahead: fewer last-minute cancellations."})}</span></div>
      <div><b>${t({fr:"Des voyageurs professionnels",en:"Professional guests"})}</b><span>${t({fr:"Des équipes en déplacement de travail, encadrées par nous du début à la fin.",en:"Teams on a work trip, looked after by us from start to finish."})}</span></div>
      <div><b>${t({fr:"Les vols, c'est nous",en:"We handle the flights"})}</b><span>${t({fr:"Nous réservons les vols de chaque participant et coordonnons les arrivées : vos équipes accueillent un groupe, pas quarante arrivées dispersées.",en:"We book every participant's flights and coordinate arrivals: your team welcomes one group, not forty scattered arrivals."})}</span></div>
    </div>
  </div></section>
  <section class="section surface"><div class="wrap split">
    <div class="text"><span class="eyebrow">${t({fr:"Ce que nous recherchons",en:"What we look for"})}</span><h2 class="h2">${t({fr:"Des lieux où une équipe peut travailler et se retrouver",en:"Places where a team can work and reconnect"})}</h2>
      <ul class="inc">
        <li>${t({fr:"10 chambres ou plus, ou la possibilité de privatiser",en:"10 or more rooms, or the option of exclusive use"})}</li>
        <li>${t({fr:"Une salle de réunion ou un espace adaptable",en:"A meeting room or a flexible space"})}</li>
        <li>${t({fr:"Un wifi fiable",en:"Reliable wifi"})}</li>
        <li>${t({fr:"À moins de 1 h 30 d'un aéroport",en:"Within 1.5 hours of an airport"})}</li>
        <li>${t({fr:"Des activités sur place ou à proximité",en:"Activities on site or nearby"})}</li>
      </ul></div>
    <div class="media ph">${img("venue_hotel")}</div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><h2 class="h2">${t(U.how)}</h2></div>
    <ol class="steps">
      <li><b>${t({fr:"Présentez votre lieu",en:"Present your venue"})}</b><span>${t({fr:"Le formulaire ci-dessous prend 10 minutes.",en:"The form below takes 10 minutes."})}</span></li>
      <li><b>${t({fr:"Premier échange",en:"First call"})}</b><span>${t({fr:"Nous parlons capacités, tarifs groupe et conditions.",en:"We discuss capacity, group rates and terms."})}</span></li>
      <li><b>${t({fr:"Proposé à nos clients",en:"Proposed to our clients"})}</b><span>${t({fr:"Votre lieu entre dans nos propositions quand il correspond au brief.",en:"Your venue goes into our proposals when it fits the brief."})}</span></li>
      <li><b>${t({fr:"Réservation",en:"Booking"})}</b><span>${t({fr:"Vous facturez le client directement ; nous coordonnons tout le reste.",en:"You invoice the client directly; we coordinate everything else."})}</span></li>
    </ol>
  </div></section>
  <section class="section surface" id="vform" style="scroll-margin-top:90px"><div class="wrap dgrid" style="align-items:start">
    <form class="form" data-form="venue">
      <label class="field"><span>${t({fr:"Nom du lieu",en:"Venue name"})}</span><input id="v-name" required></label>
      <label class="field"><span>${t({fr:"Site web",en:"Website"})}</span><input id="v-web" type="url" placeholder="https://"></label>
      <label class="field"><span>${t({fr:"Ville et pays",en:"City and country"})}</span><input id="v-loc" required></label>
      <label class="field"><span>${t({fr:"Type de lieu",en:"Venue type"})}</span><select id="v-type">${[{fr:"Hôtel",en:"Hotel"},{fr:"Villa",en:"Villa"},{fr:"Domaine / quinta / finca",en:"Estate / quinta / finca"},{fr:"Manoir / château",en:"Manor / château"},{fr:"Résidence / appartements",en:"Serviced apartments"},{fr:"Autre",en:"Other"}].map(x=>`<option>${t(x)}</option>`).join("")}</select></label>
      <label class="field"><span>${t({fr:"Nombre de chambres",en:"Number of rooms"})}</span><input id="v-rooms" type="number" min="1"></label>
      <label class="field"><span>${t({fr:"Capacité max. (personnes)",en:"Max capacity (people)"})}</span><input id="v-cap" type="number" min="1"></label>
      <label class="field"><span>${t({fr:"Salle de réunion (personnes)",en:"Meeting room (people)"})}</span><input id="v-meet" type="number" min="0"></label>
      <label class="field"><span>${t({fr:"Aéroport le plus proche",en:"Nearest airport"})}</span><input id="v-air"></label>
      <label class="field"><span>${t({fr:"Votre nom",en:"Your name"})}</span><input id="v-contact" required autocomplete="name"></label>
      <label class="field"><span>Email</span><input id="v-mail" type="email" required autocomplete="email"></label>
      <label class="field full"><span>${t({fr:"Téléphone",en:"Phone"})}</span><input id="v-tel" autocomplete="tel"></label>
      <label class="field full"><span>${t({fr:"Présentez votre lieu",en:"Tell us about your venue"})}</span><textarea id="v-msg" placeholder="${t({fr:'Activités, saisons, privatisation possible, tarifs groupe…',en:'Activities, seasons, exclusive use, group rates…'})}"></textarea></label>
      <div class="full"><button class="btn accent" type="submit">${t(U.host)}</button></div>
    </form>
    <aside class="aside">
      <h3>${t({fr:"Questions fréquentes",en:"FAQ"})}</h3>
      <div class="row"><span>${t({fr:"Combien ça coûte ?",en:"What does it cost?"})}</span><span>${t({fr:"L'inscription est gratuite. Nous travaillons à la commission sur les réservations confirmées, convenue avec vous.",en:"Listing is free. We work on commission on confirmed bookings, agreed with you."})}</span></div>
      <div class="row"><span>${t({fr:"Qui facture ?",en:"Who invoices?"})}</span><span>${t({fr:"Vous facturez le client directement.",en:"You invoice the client directly."})}</span></div>
      <div class="row"><span>${t({fr:"Quelles régions ?",en:"Which regions?"})}</span><span>${t({fr:"Europe, Méditerranée et quelques destinations long-courrier.",en:"Europe, the Mediterranean and a few long-haul destinations."})}</span></div>
      <a class="btn ghost" href="#appel">${t(U.book)}</a>
    </aside>
  </div></section>`;
}

/* ---------- retreats ---------- */
const retreatCard = r => `<a class="card rcard" href="#retraite-${r.s}"><div class="ph">${img(r.img[0], t(r.n))}</div><div><h3>${t(r.n)}</h3><div class="meta">${t(r.c)}</div><div class="vibes">${t(r.vibe).map(v=>`<span>${esc(v)}</span>`).join("")}</div></div></a>`;
const retreatOptions = sel => `<option value="">${t({fr:"Ouvert aux idées",en:"Open to ideas"})}</option>` + RREGIONS.map(g => `<optgroup label="${esc(t(g))}">${RETREATS.filter(r=>r.r===g.k).map(r=>`<option value="${r.s}" ${r.s===sel?"selected":""}>${esc(t(r.n))}</option>`).join("")}</optgroup>`).join("");
function monthOptions(sel){
  const now = new Date(); let o = `<option value="">${t({fr:"Flexible",en:"Flexible"})}</option>`;
  for (let i = 1; i <= 15; i++){ const d = new Date(now.getFullYear(), now.getMonth()+i, 1); const v = d.toISOString().slice(0,7);
    const l = d.toLocaleDateString(lang==='fr'?'fr-FR':'en-GB',{month:'long',year:'numeric'}); o += `<option value="${v}" ${v===sel?"selected":""}>${l.charAt(0).toUpperCase()+l.slice(1)}</option>`; }
  return o;
}
function howSteps(){
  return `<ol class="steps">
      <li><b>${t({fr:"Votre brief",en:"Your brief"})}</b><span>${t({fr:"5 minutes : taille de l'équipe, villes de départ, dates, budget, envies.",en:"5 minutes: team size, departure cities, dates, budget, wishes."})}</span></li>
      <li><b>${t({fr:"3 propositions sous 48 h",en:"3 proposals within 48 h"})}</b><span>${t({fr:"Trois options complètes : lieu, programme, activités, vols et budget par personne.",en:"Three complete options: venue, programme, activities, flights and budget per person."})}</span></li>
      <li><b>${t({fr:"On réserve tout",en:"We book everything"})}</b><span>${t({fr:"Les vols de chacun, le lieu, les transferts et les activités.",en:"Everyone's flights, the venue, transfers and activities."})}</span></li>
      <li><b>${t({fr:"On reste joignables",en:"We stay on call"})}</b><span>${t({fr:"Un interlocuteur sur WhatsApp 7j/7, jusqu'au retour de tous.",en:"One contact on WhatsApp 7 days a week, until everyone is home."})}</span></li>
    </ol>`;
}
function retreatsPage(){
  const f = state.rfilter || "all";
  const groups = f === "all" ? RREGIONS : RREGIONS.filter(g => g.k === f);
  return `
  <section class="hero short"><div class="ph">${img("team_villa2","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${RETREATS.length} destinations</div>
    <h1 class="display" style="margin-top:12px">${t(U.retreatsLong)}</h1>
    <p class="sub">${t({fr:"Séminaires, offsites et voyages de récompense, dès 10 personnes et sans limite. Nous organisons tout, y compris les vols de chaque participant.",en:"Offsites, retreats and reward trips, from 10 people with no upper limit. We organise everything, including every participant's flights."})}</p>
    <div class="ctas"><a class="btn light" href="#brief">${t(U.plan)}</a><a class="btn light ghost" href="#appel">${t(U.book)}</a></div>
  </div></section>
  <section class="section tight"><div class="wrap">
    <div class="chips" role="group" aria-label="${t({fr:'Filtrer par région',en:'Filter by region'})}">
      <button class="chip" data-rfilter="all" aria-pressed="${f==='all'}">${t({fr:"Toutes",en:"All"})}</button>
      ${RREGIONS.map(g=>`<button class="chip" data-rfilter="${g.k}" aria-pressed="${f===g.k}">${t(g)}</button>`).join("")}
    </div>
  </div></section>
  ${groups.map(g=>`<section class="section tight" id="rregion-${g.k}" style="padding-top:0;scroll-margin-top:90px"><div class="wrap">
    <div class="head" style="margin-bottom:22px"><h2 class="h2">${t(g)}</h2><span class="note">${RETREATS.filter(r=>r.r===g.k).length} destinations</span></div>
    <div class="grid">${RETREATS.filter(r=>r.r===g.k).map(retreatCard).join("")}</div>
  </div></section>`).join("")}
  <section class="section surface"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Inclus",en:"Included"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Ce dont on s'occupe",en:"What we take care of"})}</h2></div></div>
    <div class="incl">
      <ul class="inc">
        <li>${t({fr:"Recherche et négociation du lieu",en:"Venue search and negotiation"})}</li>
        <li>${t({fr:"Vols de chaque participant, depuis sa ville",en:"Every participant's flights, from their own city"})}</li>
        <li>${t({fr:"Transferts aéroport et déplacements sur place",en:"Airport transfers and local transport"})}</li>
        <li>${t({fr:"Salles et matériel pour les ateliers",en:"Meeting rooms and workshop equipment"})}</li>
      </ul>
      <ul class="inc">
        <li>${t({fr:"Programme, activités et dîners",en:"Programme, activities and dinners"})}</li>
        <li>${t({fr:"Régimes alimentaires et besoins particuliers",en:"Dietary and accessibility needs"})}</li>
        <li>${t({fr:"Liste des participants tenue à jour",en:"An up-to-date participant list"})}</li>
        <li>${t({fr:"Un interlocuteur joignable 7j/7",en:"One contact reachable 7 days a week"})}</li>
      </ul>
    </div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Comment ça marche",en:"How it works"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Quatre étapes, un seul interlocuteur",en:"Four steps, one contact"})}</h2></div></div>
    ${howSteps()}
  </div></section>
  <section class="section surface"><div class="wrap dgrid">
    <div class="faq">
      <h2 class="h2" style="margin-bottom:14px">${t({fr:"Questions fréquentes",en:"Frequently asked questions"})}</h2>
      ${[[{fr:"Pour combien de personnes ?",en:"For how many people?"},{fr:"Dès 10 personnes, sans limite. Au-delà de 60, nous combinons plusieurs lieux ou privatisons un hôtel.",en:"From 10 people, no upper limit. Above 60, we combine several venues or take over a whole hotel."}],
         [{fr:"Combien de temps à l'avance ?",en:"How far in advance?"},{fr:"Idéalement 3 à 6 mois, pour avoir le choix des lieux et de bons tarifs aériens. Nous savons aussi faire en quelques semaines.",en:"Ideally 3 to 6 months ahead, for the best venues and fares. We can also do it in a few weeks."}],
         [{fr:"Comment est fixé le prix ?",en:"How is the price set?"},{fr:"Chaque proposition détaille le budget par personne : lieu, vols, activités et nos honoraires d'organisation, fixés à l'avance. Pas de frais cachés.",en:"Each proposal details the budget per person: venue, flights, activities and our planning fee, agreed upfront. No hidden costs."}],
         [{fr:"Qui facture quoi ?",en:"Who invoices what?"},{fr:"Nous facturons nos honoraires d'organisation. Les lieux et prestataires vous facturent directement, au tarif que nous avons négocié, et les billets d'avion sont émis par notre partenaire agence agréé. Vous gardez une vision claire de chaque dépense.",en:"We invoice our planning fee. Venues and suppliers invoice you directly at the rate we negotiated, and flight tickets are issued by our licensed travel agency partner. You keep a clear view of every cost."}],
         [{fr:"Quel budget prévoir ?",en:"What budget should we plan?"},{fr:"Le plus souvent entre 700 et 2 000 € par personne pour 3 nuits, vols compris. Notre calculateur vous donne une première fourchette en 30 secondes.",en:"Usually €700 to €2,000 per person for 3 nights, flights included. Our calculator gives you a first range in 30 seconds."}],
         [{fr:"Nos équipes partent de villes différentes, c'est possible ?",en:"Our team flies from different cities, is that OK?"},{fr:"C'est notre spécialité. Chaque participant a son vol depuis sa ville, coordonné pour que tout le monde arrive le même jour.",en:"That's our speciality. Each participant flies from their own city, coordinated so everyone lands the same day."}],
         [{fr:"Et si quelque chose se passe mal sur place ?",en:"What if something goes wrong on site?"},{fr:"Vous avez un interlocuteur sur WhatsApp 7j/7. Vol annulé, météo, imprévu : on gère.",en:"You have one contact on WhatsApp 7 days a week. Cancelled flight, weather, surprises: we handle it."}]
        ].map(([q,a])=>`<details><summary>${t(q)}</summary><p>${t(a)}</p></details>`).join("")}
    </div>
    <aside class="aside">
      <div class="ph" style="aspect-ratio:4/3;border-radius:2px;overflow:hidden">${img("act_workshop")}</div>
      <h3>${t({fr:"Un projet de retraite ?",en:"Planning a retreat?"})}</h3>
      <p class="note">${t({fr:"Décrivez votre projet en 5 minutes. 3 propositions complètes sous 48 h, vols compris.",en:"Describe your project in 5 minutes. 3 complete proposals within 48 hours, flights included."})}</p>
      <a class="btn accent" href="#brief">${t(U.plan)}</a>
      <a class="btn ghost" href="#budget">${t(U.calc)}</a>
      <a class="btn ghost" href="#appel">${t(U.book)}</a>
    </aside>
  </div></section>`;
}
/* indicative flight time between two airports: great-circle distance at ~780 km/h + 45 min */
function flyTime(a, b){
  const R = 6371, rad = x => x*Math.PI/180, dLat = rad(b[0]-a[0]), dLon = rad(b[1]-a[1]);
  const h = Math.sin(dLat/2)**2 + Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLon/2)**2;
  const km = 2*R*Math.asin(Math.sqrt(h));
  if (km < 120) return null;
  const mins = Math.round((km/780*60 + 45)/15)*15, hh = Math.floor(mins/60), mm = mins%60;
  return { km, txt: (lang==='fr' ? `≈ ${hh} h${mm?(" "+String(mm).padStart(2,"0")):""}` : `≈ ${hh}h${mm?(" "+mm+"m"):""}`), long: km > 5000 };
}
function hubsList(slug){
  const c = (window.RCOORD||{})[slug]; if (!c) return "";
  const road = c[2];
  return `<ul class="hubs">${(window.HUBS||[]).map(hb => { const f = flyTime(hb.c, c);
    return `<li><span>${t(hb.n)}</span><span>${f ? f.txt + (f.long ? t({fr:" · 1 escale possible",en:" · may be 1 stop"}) : "") : t({fr:"sur place",en:"local"})}</span></li>`; }).join("")}</ul>
    ${road ? `<p class="note" style="margin-top:8px">${t({fr:`Puis environ ${road} min de route depuis l'aéroport.`,en:`Then about ${road} min by road from the airport.`})}</p>` : ""}`;
}
function advisor(){
  return `<div class="advisor"><div class="ph">${img("team","Jennifer & Christopher Kwo")}</div><div><b style="font-weight:400">Jennifer & Christopher Kwo</b><p class="note">${t({fr:"Votre contact unique pour le lieu, les vols et le programme, avant, pendant et après le voyage.",en:"Your single point of contact for venue, flights and programme, before, during and after the trip."})}</p></div></div>`;
}
function retreatPage(sl){
  const r = byR(sl); if (!r) return notFound();
  const g = RREGIONS.find(x => x.k === r.r);
  const near = RETREATS.filter(x => x.r === r.r && x.s !== r.s).slice(0,4);
  const more = near.length < 4 ? RETREATS.filter(x => x.s !== r.s && !near.includes(x)).slice(0, 4 - near.length) : [];
  const usedImg = new Set([...r.img, ...near.concat(more).map(x => x.img[0])]);
  const acts = ACTLIB.filter(a => a.where.includes(r.s) && !usedImg.has(a.img)).slice(0,3);
  const name = t(r.n);
  const faq = [
    [{fr:`Pourquoi choisir ${name} pour une retraite ?`,en:`Why choose ${name} for a retreat?`}, r.t],
    [{fr:`Comment s'y rendre ?`,en:`How do we get there?`}, {fr:r.fly.fr+" Nous réservons les vols de chaque participant depuis sa ville et coordonnons les arrivées.",en:r.fly.en+" We book every participant's flights from their own city and coordinate arrivals."}],
    [{fr:"Quelle est la meilleure période ?",en:"When is the best time to go?"}, r.when],
    [{fr:"Où loger un groupe ?",en:"Where can a group stay?"}, {fr:r.stay.fr+". Au-delà de 60 personnes, nous combinons plusieurs lieux ou privatisons un hôtel.",en:r.stay.en+". Above 60 people, we combine venues or book out a whole hotel."}],
    [{fr:"Quelles activités pour l'équipe ?",en:"What team activities are there?"}, {fr:r.acts.fr.join(", ")+".",en:r.acts.en.join(", ")+"."}],
    [{fr:"Quel budget prévoir ?",en:"What budget should we plan?"}, {fr:"Cela dépend du nombre de nuits, du niveau du lieu et des villes de départ. Notre calculateur donne une première fourchette, et nos 3 propositions détaillent le budget exact par personne, vols compris.",en:"It depends on the number of nights, venue level and departure cities. Our calculator gives a first range, and our 3 proposals detail the exact budget per person, flights included."}]
  ];
  return `
  <section class="hero short"><div class="ph">${img(r.img[0], name, true)}</div><div class="wrap">
    <div class="crumbs"><a href="#retraites">${t(U.retreatsLong)}</a> / ${t(g)}</div>
    <h1 class="display">${t({fr:"Retraite d'entreprise : ",en:"Company retreat: "})}${name}</h1>
    <p class="sub">${t(r.t)}</p>
  </div></section>
  <section class="section"><div class="wrap dgrid">
    <div style="display:flex;flex-direction:column;gap:44px;min-width:0">
      <div class="prose"><span class="eyebrow">${t({fr:`${name} pour votre équipe`,en:`Why ${name} for your team`})}</span><p>${t(r.d)}</p><div class="vibes">${t(r.vibe).map(v=>`<span>${esc(v)}</span>`).join("")}</div></div>
      <div class="ph" style="aspect-ratio:16/9;border-radius:2px;overflow:hidden">${img(r.img[1], name)}</div>
      <div><h2 class="h2" style="margin-bottom:14px">${t({fr:"Activités pour l'équipe",en:"Team activities"})}</h2><ul class="inc">${t(r.acts).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
        ${acts.length ? `<div class="acts" style="margin-top:28px">${acts.map(actCard).join("")}</div>` : ""}
        <p style="margin-top:18px"><a class="link" href="#activites">${t({fr:"Toutes les activités de team building",en:"All team-building activities"})}</a></p></div>
      <div><h2 class="h2" style="margin-bottom:12px">${t({fr:"Exemple de programme",en:"Sample programme"})}</h2><p class="note" style="margin-bottom:18px">${t({fr:"Une base de 3 jours, adaptée à vos objectifs, à votre budget et à la taille du groupe.",en:"A 3-day starting point, adapted to your goals, budget and group size."})}</p>
        <ol class="itin">${t(r.prog).map(x=>`<li><span>${esc(x)}</span></li>`).join("")}</ol></div>
      <div><h2 class="h2" style="margin-bottom:6px">${t({fr:"Temps de vol depuis vos bureaux",en:"Flight times from your offices"})}</h2><p class="note" style="margin-bottom:12px">${t({fr:"Indicatif, vol direct quand il existe. Nous réservons les vols de chaque participant, quelle que soit sa ville.",en:"Indicative, direct flight where one exists. We book every participant's flights, whatever their city."})}</p>${hubsList(r.s)}</div>
      <div class="faq"><h2 class="h2" style="margin-bottom:14px">${t({fr:`Questions fréquentes : ${name}`,en:`FAQ: a retreat in ${name}`})}</h2>
        ${faq.map(([q,a])=>`<details><summary>${t(q)}</summary><p>${esc(t(a))}</p></details>`).join("")}</div>
    </div>
    <aside class="aside">
      <h3>${t({fr:"En bref",en:"At a glance"})}</h3>
      <div class="row"><span>${t({fr:"Taille du groupe",en:"Group size"})}</span><span>${t({fr:"Dès 10 personnes, sans limite",en:"From 10 people, no upper limit"})}</span></div>
      <div class="row"><span>${t({fr:"Où dormir",en:"Where to stay"})}</span><span>${t(r.stay)}</span></div>
      <div class="row"><span>${t({fr:"Y aller",en:"Getting there"})}</span><span>${t(r.fly)}</span></div>
      <div class="row"><span>${t(U.when)}</span><span>${t(r.when)}</span></div>
      <a href="#brief" class="btn accent" data-rpre="${r.s}">${t({fr:"3 propositions pour ",en:"3 proposals for "})}${name}</a>
      <a href="#appel" class="btn ghost">${t(U.book)}</a>
      ${advisor()}
      <p class="note">${t({fr:"Réponse sous 48 h : lieux, programme, vols et budget par personne.",en:"Reply within 48 h: venues, programme, flights and budget per person."})}</p>
    </aside>
  </div></section>
  <section class="section surface"><div class="wrap">
    <div class="head"><h2 class="h2">${t({fr:"Autres idées de retraite",en:"More retreat ideas"})}</h2><a class="link" href="#retraites">${t(U.allRetreats)}</a></div>
    <div class="grid">${near.concat(more).map(retreatCard).join("")}</div>
  </div></section>`;
}
function briefPage(){
  const p = state.prefill || {};
  const goals = [{fr:"Stratégie & ateliers",en:"Strategy & workshops"},{fr:"Cohésion d'équipe",en:"Team building"},{fr:"Récompense / célébration",en:"Reward / celebration"},{fr:"Intégration des nouveaux",en:"Onboarding new hires"},{fr:"Repos & bien-être",en:"Rest & wellness"}];
  const acts = [{fr:"Surf",en:"Surf"},{fr:"Cuisine",en:"Cooking"},{fr:"Bateau",en:"Boat"},{fr:"Randonnée",en:"Hiking"},{fr:"Vin",en:"Wine"},{fr:"Yoga",en:"Yoga"},{fr:"Culture",en:"Culture"},{fr:"Soirées",en:"Nightlife"}];
  const chips = (name, list) => `<div class="chipset">${list.map((x,i)=>`<label><input type="checkbox" name="${name}" value="${esc(t(x))}"> ${t(x)}</label>`).join("")}</div>`;
  return `
  <section class="section"><div class="wrap dgrid" style="align-items:start">
    <div style="display:flex;flex-direction:column;gap:24px;min-width:0">
      <span class="eyebrow">${t(U.plan)}</span>
      <h1 class="display" style="font-size:clamp(38px,5vw,64px)">${t({fr:"Parlez-nous de votre équipe",en:"Tell us about your team"})}</h1>
      <p class="lede">${t({fr:"5 minutes pour nous donner l'essentiel. Vous recevez 3 propositions complètes sous 48 heures, vols compris, sans engagement.",en:"5 minutes to give us the essentials. You'll get 3 complete proposals within 48 hours, flights included, with no commitment."})}</p>
      <div id="bwrap"><form class="form" data-form="brief" id="bf">
        <label class="field"><span>${t({fr:"Entreprise ou organisation",en:"Company or organisation"})}</span><input id="b-co" required autocomplete="organization"></label>
        <label class="field"><span>${t({fr:"Votre nom",en:"Your name"})}</span><input id="b-name" required autocomplete="name"></label>
        <label class="field"><span>Email</span><input id="b-mail" type="email" required autocomplete="email"></label>
        <label class="field"><span>${t({fr:"Téléphone / WhatsApp",en:"Phone / WhatsApp"})}</span><input id="b-tel" autocomplete="tel"></label>
        <label class="field full"><span>${t({fr:"Type d'événement",en:"Event type"})}</span><select id="b-type">${EVENTS.map(e=>`<option value="${e.k}" ${e.k===(p.ev||"seminaire")?"selected":""}>${esc(t(e.n))}</option>`).join("")}<option value="group" ${p.ev==="group"?"selected":""}>${t({fr:"Association, club ou équipe sportive",en:"Association, club or sports team"})}</option></select></label>
        <label class="field"><span>${t({fr:"Nombre de participants",en:"Number of people"})}</span><input id="b-pax" type="number" min="10" value="${esc(p.pax || 20)}" required></label>
        <label class="field"><span>${t({fr:"Nombre de nuits",en:"Number of nights"})}</span><select id="b-nights">${["2","3","4","5","6+"].map(n=>`<option ${n===String(p.nights||"3")?"selected":""}>${n}</option>`).join("")}</select></label>
        <label class="field"><span>${t({fr:"Période souhaitée",en:"Preferred period"})}</span><select id="b-month">${monthOptions(p.month)}</select></label>
        <label class="field"><span>${t({fr:"Destination",en:"Destination"})}</span><select id="b-dest">${retreatOptions(p.rdest)}</select></label>
        <label class="field full"><span>${t({fr:"Villes de départ des participants",en:"Participants' departure cities"})}</span><input id="b-cities" placeholder="${t({fr:'Ex. : Lisbonne 12, Berlin 8, Londres 5',en:'E.g. Lisbon 12, Berlin 8, London 5'})}"></label>
        <label class="field"><span>${t({fr:"Budget par personne (hors vols)",en:"Budget per person (excl. flights)"})}</span><select id="b-budget"><option>${t({fr:"À définir",en:"To be defined"})}</option><option>&lt; €800</option><option>€800 – €1,500</option><option>€1,500 – €2,500</option><option>&gt; €2,500</option></select></label>
        <label class="field"><span>${t({fr:"On s'occupe des vols ?",en:"Shall we book the flights?"})}</span><select id="b-flights"><option>${t({fr:"Oui, pour tout le monde",en:"Yes, for everyone"})}</option><option>${t({fr:"Pour une partie du groupe",en:"For part of the group"})}</option><option>${t({fr:"Non, pas besoin",en:"No, not needed"})}</option></select></label>
        <div class="field full"><span>${t({fr:"Objectifs",en:"Goals"})}</span>${chips("goal", goals)}</div>
        <div class="field full"><span>${t({fr:"Activités qui vous tentent",en:"Activities you like"})}</span>${chips("act", acts)}</div>
        <label class="field full"><span>${t({fr:"Autre chose à savoir ?",en:"Anything else?"})}</span><textarea id="b-msg" placeholder="${t({fr:'Style de lieu, besoins en salles, régimes alimentaires, dates fixes…',en:'Venue style, meeting room needs, dietary needs, fixed dates…'})}">${p.offer ? esc(t({fr:"Offre : ",en:"Offer: "}) + p.offer) : ""}</textarea></label>
        <div class="full" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><button class="btn accent" type="submit">${t({fr:"Envoyer mon brief",en:"Send my brief"})}</button><span class="note">${t({fr:"3 propositions sous 48 h.",en:"3 proposals within 48 h."})}</span></div>
      </form></div>
    </div>
    <aside class="aside">
      <div class="ph" style="aspect-ratio:4/3;border-radius:2px;overflow:hidden">${img("act_cooking")}</div>
      <h3>${t({fr:"Et ensuite ?",en:"What happens next?"})}</h3>
      <div class="row"><span>${t({fr:"Sous 48 h",en:"Within 48 h"})}</span><span>${t({fr:"3 propositions : lieux, programme, vols, budget par personne.",en:"3 proposals: venues, programme, flights, budget per person."})}</span></div>
      <div class="row"><span>${t({fr:"Un appel",en:"A call"})}</span><span>${t({fr:"30 minutes pour affiner ensemble, si vous le souhaitez.",en:"30 minutes to refine it together, if you like."})}</span></div>
      <div class="row"><span>${t({fr:"On réserve",en:"We book"})}</span><span>${t({fr:"Vous validez, nous réservons tout.",en:"You approve, we book everything."})}</span></div>
      <a class="btn ghost" href="#appel">${t(U.book)}</a>
      ${advisor()}
    </aside>
  </div></section>`;
}

function destinations(){
  const f = state.filter || "all";
  const list = f==="all" ? REGIONS : REGIONS.filter(r=>r.k===f);
  return `
  <section class="hero short"><div class="ph">${img("grp_beachsunset","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${DESTS.length} destinations</div>
    <h1 class="display" style="margin-top:12px">${t({fr:"Où partir",en:"Where to go"})}</h1>
    <p class="sub">${t({fr:"En couple, en famille ou entre amis : les destinations que nous organisons le plus souvent, vols compris. Et si la vôtre n'y est pas, nous réservons partout dans le monde.",en:"As a couple, a family or with friends: the destinations we organise most often, flights included. If yours isn't here, we book anywhere in the world."})}</p>
  </div></section>
  <section class="section tight"><div class="wrap">
    <div class="chips" role="group" aria-label="${t({fr:'Filtrer par région',en:'Filter by region'})}">
      <button class="chip" data-filter="all" aria-pressed="${f==='all'}">${t({fr:"Toutes",en:"All"})}</button>
      ${REGIONS.map(r=>`<button class="chip" data-filter="${r.k}" aria-pressed="${f===r.k}">${t(r)}</button>`).join("")}
    </div>
  </div></section>
  ${list.map(r=>`<section class="section tight" id="region-${r.k}" style="padding-top:0;scroll-margin-top:90px"><div class="wrap">
    <div class="head" style="margin-bottom:22px"><h2 class="h2">${t(r)}</h2><span class="note">${DESTS.filter(d=>d.r===r.k).length} destinations</span></div>
    <div class="grid">${DESTS.filter(d=>d.r===r.k).map(d=>card(d)).join("")}</div>
  </div></section>`).join("")}
  <div style="height:48px"></div>`;
}

function destPage(s){
  const d = byS(s); if (!d) return notFound();
  const region = REGIONS.find(r=>r.k===d.r);
  const near = DESTS.filter(x=>x.r===d.r && x.s!==d.s).slice(0,4);
  const more = near.length < 4 ? DESTS.filter(x=>x.s!==d.s && !near.includes(x) && x.th.some(k=>d.th.includes(k))).slice(0,4-near.length) : [];
  const second = d.img[1] || d.img[0], third = d.img[2] || "act_longtable";
  return `
  <section class="hero short"><div class="ph">${img(d.img[0], t(d.n), true)}</div><div class="wrap">
    <div class="crumbs"><a href="#destinations">${t(U.dest)}</a> / ${t(region)}</div>
    <h1 class="display">${t(d.n)}</h1>
    <p class="sub">${t(d.t)}</p>
  </div></section>
  <section class="section"><div class="wrap dgrid">
    <div style="display:flex;flex-direction:column;gap:48px;min-width:0">
      <div class="prose"><span class="eyebrow">${t(d.c)}</span><p>${t(d.d)}</p></div>
      ${d.img[2] ? `<div class="pair"><div class="ph">${img(second, t(d.n))}</div><div class="ph">${img(third, "")}</div></div>` : `<div class="ph" style="aspect-ratio:16/9;border-radius:2px;overflow:hidden">${img(second, t(d.n))}</div>`}
      <div><h2 class="h2" style="margin-bottom:12px">${t(U.itin)}</h2><p class="note" style="margin-bottom:18px">${t({fr:"Une base de travail, que nous adaptons à vos dates et à votre rythme.",en:"A starting point, adapted to your dates and pace."})}</p>
        <ol class="itin">${t(d.it).map(x=>`<li><span>${esc(x)}</span></li>`).join("")}</ol></div>
    </div>
    <aside class="aside">
      <h3>${t({fr:"Préparer ce voyage",en:"Plan this trip"})}</h3>
      <div class="row"><span>${t(U.when)}</span><span>${t(d.when)}</span></div>
      <div class="row"><span>${t(U.flight)}</span><span>${t(d.fl)}</span></div>
      <div class="row"><span>${t(U.ideal)}</span><span>${d.th.map(themeName).join(" · ")}</span></div>
      <a href="#devis" class="btn accent" data-pre="${d.s}">${t(U.quote)}</a>
      <a href="#appel" class="btn ghost">${t(U.book)}</a>
      <p class="note">${t(U.indic)}</p>
      ${advisor()}
    </aside>
  </div></section>
  <section class="section surface"><div class="wrap">
    <div class="head"><h2 class="h2">${near.length ? t(U.nearby) : t({fr:"Vous aimerez aussi",en:"You may also like"})}</h2><a class="link" href="#destinations">${t(U.seeAll)}</a></div>
    <div class="grid">${near.concat(more).map(x=>card(x)).join("")}</div>
  </div></section>`;
}

function inspiration(){
  return `
  <section class="hero short"><div class="ph">${img("travel_seniors","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t(U.insp)}</div>
    <h1 class="display" style="margin-top:12px">${t(U.noIdea)}</h1>
    <p class="sub">${t({fr:"Partez d'une envie plutôt que d'un lieu. Nous faisons le reste.",en:"Start from a feeling rather than a place. We'll do the rest."})}</p>
  </div></section>
  <section class="section"><div class="wrap"><div class="themes">
    ${THEMES.map(x=>`<a class="theme" href="#theme-${x.k}">${img(x.img,t(x))}<div><h3>${t(x)}</h3><p>${t(x.d)}</p></div></a>`).join("")}
  </div></div></section>`;
}
function themePage(k){
  const th = THEMES.find(x=>x.k===k); if (!th) return notFound();
  const list = DESTS.filter(d=>d.th.includes(k));
  const others = THEMES.filter(x=>x.k!==k).slice(0,3);
  return `
  <section class="hero short"><div class="ph">${img(th.img,t(th),true)}</div><div class="wrap">
    <div class="crumbs"><a href="#inspiration">${t(U.insp)}</a></div>
    <h1 class="display">${t(th)}</h1><p class="sub">${t(th.d)}</p>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><h2 class="h2">${list.length} ${t({fr:"idées de destinations",en:"destination ideas"})}</h2><a class="btn ghost" href="#appel">${t(U.book)}</a></div>
    <div class="grid">${list.map(d=>card(d)).join("")}</div>
  </div></section>
  <section class="section surface"><div class="wrap">
    <div class="head"><h2 class="h2">${t({fr:"Autres inspirations",en:"More inspiration"})}</h2><a class="link" href="#inspiration">${t({fr:"Toutes",en:"All"})}</a></div>
    <div class="themes">${others.map(x=>`<a class="theme" href="#theme-${x.k}">${img(x.img,t(x))}<div><h3>${t(x)}</h3></div></a>`).join("")}</div>
  </div></section>`;
}

function groups(){
  const types = [
    ["act_longtable",{fr:"Associations & clubs",en:"Associations & clubs"},{fr:"Voyages culturels, rencontres annuelles, clubs de service : tarifs de groupe et liste de participants tenue à jour.",en:"Cultural trips, annual gatherings, service clubs: group rates and an up-to-date participant list."}],
    ["sport_team",{fr:"Équipes sportives",en:"Sports teams"},{fr:"Tournois, stages et tournées : vols de groupe, hébergement, terrains et transport du matériel.",en:"Tournaments, training camps and tours: group flights, accommodation, pitches and kit transport."}],
    ["corporate",{fr:"CSE & comités d'entreprise",en:"Works councils & staff committees"},{fr:"Voyages de salariés clés en main, avec un budget maîtrisé et un seul interlocuteur.",en:"Turnkey staff trips, on a controlled budget with one contact."}],
    ["act_workshop2",{fr:"Écoles, universités & alumni",en:"Schools, universities & alumni"},{fr:"Voyages d'études, séminaires de promotion et retrouvailles d'anciens élèves.",en:"Study trips, class seminars and alumni reunions."}]
  ];
  return `
  <section class="hero short"><div class="ph">${img("act_rowing","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t(U.biz)}</div>
    <h1 class="display" style="margin-top:12px">${t(U.grpB2B)}</h1>
    <p class="sub">${t({fr:"Des groupes de 10 à 300 personnes, partis de villes différentes, coordonnés par une seule équipe.",en:"Groups of 10 to 300 people, flying from different cities, coordinated by one team."})}</p>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="types">${types.map(([k,h,p])=>`<a class="card wide" href="#brief" data-ev="group"><div class="ph">${img(k, t(h))}</div><div><h3>${t(h)}</h3><p class="meta" style="margin-top:6px">${t(p)}</p></div></a>`).join("")}</div>
  </div></section>
  <section class="section surface"><div class="wrap">
    <div class="head"><h2 class="h2">${t(U.how)}</h2></div>
    <ol class="steps">
      <li><b>${t({fr:"Premier échange",en:"First conversation"})}</b><span>${t({fr:"Taille du groupe, dates, budget et contraintes.",en:"Group size, dates, budget and constraints."})}</span></li>
      <li><b>${t({fr:"Tarifs de groupe",en:"Group fares"})}</b><span>${t({fr:"Demande aux compagnies et hôtels, propositions sous 48 h.",en:"Requests to airlines and hotels, proposals within 48 h."})}</span></li>
      <li><b>${t({fr:"Acomptes & noms",en:"Deposits & names"})}</b><span>${t({fr:"Acomptes échelonnés, liste de passagers mise à jour avec vous.",en:"Staged deposits, passenger list updated with you."})}</span></li>
      <li><b>${t({fr:"Départ accompagné",en:"Supported departure"})}</b><span>${t({fr:"Documents envoyés, assistance joignable pendant tout le voyage.",en:"Documents sent, support reachable for the whole trip."})}</span></li>
    </ol>
    <div style="margin-top:40px"><a class="btn accent" href="#brief" data-ev="group">${t(U.get3)}</a></div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t(U.dest)}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Destinations faciles pour les groupes",en:"Easy destinations for groups"})}</h2></div><a class="link" href="#retraites">${t(U.allRetreats)}</a></div>
    <div class="grid">${["lisbonne","barcelone","cracovie","athenes"].map(byR).filter(Boolean).map(retreatCard).join("")}</div>
  </div></section>`;
}

function corporate(){
  return `
  <section class="hero short"><div class="ph">${img("plane","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t(U.corp)}</div>
    <h1 class="display" style="margin-top:12px">${t({fr:"Vos déplacements, gérés en une journée",en:"Your company travel, sorted in a day"})}</h1>
    <p class="sub">${t({fr:"Pour les PME, startups et équipes internationales : billets, hôtels, factures et assistance, avec un interlocuteur qui connaît vos voyageurs.",en:"For SMEs, startups and international teams: tickets, hotels, invoices and assistance, with one contact who knows your travellers."})}</p>
  </div></section>
  <section class="section"><div class="wrap">
    <dl class="facts">
      <div><dt>${t({fr:"Réponse",en:"Response"})}</dt><dd>${t({fr:"Sous 2 heures ouvrées",en:"Within 2 working hours"})}</dd></div>
      <div><dt>${t({fr:"Facturation",en:"Invoicing"})}</dt><dd>${t({fr:"Une facture par voyage ou mensuelle",en:"Per trip or monthly"})}</dd></div>
      <div><dt>${t({fr:"Urgences",en:"Emergencies"})}</dt><dd>${t({fr:"Ligne WhatsApp 7j/7",en:"WhatsApp line 7 days a week"})}</dd></div>
    </dl>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap pillars">
    <div class="pillar"><div class="big">${t({fr:"Tarifs",en:"Fares"})} <em>${t({fr:"négociés",en:"that work"})}</em></div><p>${t({fr:"Tarifs flexibles ou économiques selon le voyageur, classes affaires au bon moment, et suivi des avoirs non utilisés.",en:"Flexible or saver fares depending on the traveller, business class when it counts, and unused credits tracked."})}</p></div>
    <div class="pillar"><div class="big">${t({fr:"Profils",en:"Traveller"})} <em>${t({fr:"voyageurs",en:"profiles"})}</em></div><p>${t({fr:"Passeports, cartes de fidélité et préférences de sièges enregistrés une fois, pour ne plus jamais les redemander.",en:"Passports, loyalty cards and seat preferences stored once, so we never need to ask again."})}</p></div>
    <div class="pillar"><div class="big">${t({fr:"Devoir",en:"Duty"})} <em>${t({fr:"de protection",en:"of care"})}</em></div><p>${t({fr:"Nous savons où sont vos voyageurs et pouvons les réacheminer rapidement en cas de grève, météo ou crise.",en:"We know where your travellers are and can reroute them quickly in case of strikes, weather or crises."})}</p></div>
  </div></section>
  <section class="band"><div class="ph">${img("corporate")}</div><div class="wrap">
    <h2 class="display">${t({fr:"Un appel de 30 minutes pour faire le point",en:"A 30-minute call to review your travel"})}</h2>
    <p>${t({fr:"Nombre de voyages par an, destinations habituelles, process de validation : nous vous proposons une organisation simple.",en:"Trips per year, usual destinations, approval process: we'll propose a simple setup."})}</p>
    <div class="ctas"><a href="#appel" class="btn light">${t(U.book)}</a><a href="#devis" class="btn light ghost">${t(U.quote)}</a></div>
  </div></section>`;
}

function about(){
  const J = {fr:[
      "Je m'appelle Jennifer Kwo. Depuis trente-cinq ans, j'organise des voyages : billets d'avion, hôtels, groupes, voyages d'affaires, et surtout les imprévus.",
      "Après des décennies au sein de grandes agences, j'ai choisi l'indépendance pour revenir à l'essentiel : connaître chaque client, répondre moi-même au téléphone et suivre chaque dossier jusqu'au retour.",
      "Je garde les mêmes outils professionnels et l'accès direct aux tarifs des compagnies aériennes, avec une relation directe et sans intermédiaire."],
    en:[
      "My name is Jennifer Kwo. For thirty-five years I've organised travel: flights, hotels, groups, business trips and, above all, the unexpected.",
      "After decades inside large agencies, I chose independence to get back to what matters: knowing every client, answering the phone myself and following every booking until you're home.",
      "I keep the same professional tools and direct access to airline fares, with a direct relationship and no middleman."]};
  const K = {fr:[
      "Je suis Christopher, le fils de Jennifer. J'ai fait mes armes dans l'hôtellerie internationale, dans certains des établissements les plus prestigieux de Hong Kong et de Suisse. Aujourd'hui, je suis spécialiste des retraites d'entreprise, voyageur et digital nomad : je sais ce qu'une équipe attend d'un lieu pour travailler, décrocher et se retrouver.",
      "Voyageur dans l'âme, je cherche toujours les adresses confidentielles : la table que personne ne connaît, la plage au bout du chemin, l'hôtel qui fait la différence. Ces pépites, je les partage avec nos clients.",
      "De l'hôtellerie, je garde un regard de l'intérieur sur ce qui fait un séjour réussi, et je l'apporte à chaque voyage que nous organisons."],
    en:[
      "I'm Christopher, Jennifer's son. I trained in international hospitality, in some of the most prestigious establishments in Hong Kong and Switzerland. Today I'm a company retreat specialist, a traveller and a digital nomad: I know what a team needs from a place to work, switch off and reconnect.",
      "A traveller at heart, I'm always looking for the places that don't make the guidebooks: the table nobody knows, the beach at the end of the path, the hotel that makes the difference. I share those hidden gems with our clients.",
      "Hospitality taught me what makes a stay work from the inside, and I bring that eye to every trip we plan."]};
  const profile = (k, name, role, paras, extra="") => `<article class="profile">
      <div class="ph">${img(k, name)}</div>
      <div class="pbody"><h2 class="display" style="font-size:clamp(30px,3.2vw,40px)">${name}</h2><span class="eyebrow">${t(role)}</span>
        <div class="prose" style="font-size:17px;gap:14px">${paras[lang].map(x=>`<p>${esc(x)}</p>`).join("")}${extra}</div></div>
    </article>`;
  return `
  <section class="section"><div class="wrap split" style="align-items:center">
    <div class="text">
      <span class="eyebrow">${t({fr:"Notre histoire",en:"Our story"})}</span>
      <h1 class="display" style="font-size:clamp(42px,5.6vw,76px)">${t({fr:"Une affaire de famille",en:"A family business"})}</h1>
      <p class="lede">${t({fr:"Une mère et son fils. Trente-cinq ans d'agence de voyage d'un côté, l'hôtellerie internationale de l'autre, et la même envie : que chaque voyage se passe comme prévu, ou mieux.",en:"A mother and her son. Thirty-five years in travel agencies on one side, international hospitality on the other, and the same goal: that every trip goes to plan, or better."})}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><a href="#appel" class="btn accent">${t(U.book)}</a><a href="${wa()}" target="_blank" rel="noopener" class="btn ghost">${t(U.whatsapp)}</a></div>
    </div>
    <figure class="media ph" style="aspect-ratio:4/5;margin:0">${img("team","Jennifer & Christopher Kwo",true)}</figure>
  </div></section>
  <section class="section surface"><div class="wrap team">
    ${profile("jennifer","Jennifer Kwo",{fr:"Fondatrice & conseillère voyage",en:"Founder & travel advisor"},J,
      `<p class="it" style="font-size:21px;color:var(--ink)">${t({fr:"« Un voyage réussi, c'est souvent celui où l'on n'a pas eu à penser aux détails. »",en:"“A good trip is often one where you never had to think about the details.”"})}</p>`)}
    ${profile("christopher","Christopher Kwo",{fr:"Co-fondateur · Retraites d'entreprise",en:"Co-founder · Company retreats"},K)}
  </div></section>
  <section class="section tight"><div class="wrap">
    <dl class="facts">
      <div><dt>${t({fr:"Expérience",en:"Experience"})}</dt><dd>${t({fr:"35 ans en agence, et l'hôtellerie internationale",en:"35 years in agencies, plus international hospitality"})}</dd></div>
      <div><dt>${t({fr:"Services",en:"Services"})}</dt><dd>${t({fr:"Retraites, séminaires, groupes, vols",en:"Retreats, offsites, groups, flights"})}</dd></div>
      <div><dt>${t({fr:"Langues",en:"Languages"})}</dt><dd>Français · English</dd></div>
    </dl>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><h2 class="h2">${t({fr:"Notre approche",en:"Our approach"})}</h2></div>
    <div class="pillars">
      <div class="pillar"><div class="big"><em>${t({fr:"Écouter",en:"Listen"})}</em></div><p>${t({fr:"Comprendre le voyage que vous voulez vraiment, pas seulement la destination.",en:"Understand the trip you really want, not just the destination."})}</p></div>
      <div class="pillar"><div class="big"><em>${t({fr:"Conseiller",en:"Advise"})}</em></div><p>${t({fr:"Vous dire honnêtement quand une option est mauvaise, même si elle est moins chère.",en:"Tell you honestly when an option is a bad one, even if it's cheaper."})}</p></div>
      <div class="pillar"><div class="big"><em>${t({fr:"Rester là",en:"Stay with you"})}</em></div><p>${t({fr:"Être joignable du premier devis jusqu'au retour à la maison.",en:"Be reachable from the first quote until you're back home."})}</p></div>
    </div>
  </div></section>`;
}

function book(){
  return `
  <section class="section"><div class="wrap dgrid" style="align-items:start">
    <div style="display:flex;flex-direction:column;gap:24px;min-width:0">
      <span class="eyebrow">${t(U.book)}</span>
      <h1 class="display" style="font-size:clamp(38px,5vw,64px)">${t({fr:"Choisissez un créneau, nous vous appelons.",en:"Pick a time, we'll call you."})}</h1>
      <div class="cal" id="cal">
        <div class="calendly-inline-widget" data-url="${esc(C.calendly)}?hide_gdpr_banner=1" id="calw" style="min-width:280px;height:700px"></div>
        <p class="note" style="margin-top:10px">${t({fr:"Le calendrier ne s'affiche pas ?",en:"Calendar not showing?"})} <a class="link" href="${esc(C.calendly)}" target="_blank" rel="noopener">${t({fr:"Ouvrir le calendrier",en:"Open the calendar"})}</a></p>
        <div class="calfb" id="calfb" hidden>
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap"><b style="font-weight:400;font-size:20px">${t({fr:"Appel découverte · 30 min",en:"Discovery call · 30 min"})}</b><span class="note">${t({fr:"Affiché dans votre fuseau horaire",en:"Shown in your time zone"})}</span></div>
          ${miniCal()}
          <p class="note">${(STATIC ? t({fr:"Le calendrier ne s'est pas chargé. Ouvrez-le directement :",en:"The calendar didn't load. Open it directly:"}) : t({fr:"Aperçu : le calendrier Calendly s'affiche ici une fois le site en ligne.",en:"Preview: the Calendly calendar appears here once the site is live."}))}</p>
          <a class="btn accent" href="${esc(C.calendly)}" target="_blank" rel="noopener">${t({fr:"Ouvrir le calendrier",en:"Open the calendar"})}</a>
        </div>
      </div>
    </div>
    <aside class="aside">
      <h3>${t({fr:"Ce que nous verrons",en:"What we'll cover"})}</h3>
      <div class="row"><span>${t({fr:"Votre projet",en:"Your plans"})}</span><span>${t({fr:"Destination, dates, nombre de voyageurs, budget.",en:"Destination, dates, number of travellers, budget."})}</span></div>
      <div class="row"><span>${t({fr:"Nos conseils",en:"Our advice"})}</span><span>${t({fr:"Meilleures routes, saisons, hôtels adaptés.",en:"Best routings, seasons, suitable hotels."})}</span></div>
      <div class="row"><span>${t({fr:"La suite",en:"Next step"})}</span><span>${t({fr:"Un devis détaillé sous 24 à 48h.",en:"A detailed quote within 24–48h."})}</span></div>
      <p class="note">${t({fr:"Vous préférez écrire ?",en:"Prefer to write?"})}</p>
      <a class="btn ghost" href="${wa()}" target="_blank" rel="noopener">${t(U.whatsapp)}</a>
      <p class="note" style="user-select:all">${esc(C.phone)}<br>${esc(C.email)}</p>
    </aside>
  </div></section>`;
}
function miniCal(){
  const wk = lang==='fr' ? ["L","M","M","J","V","S","D"] : ["M","T","W","T","F","S","S"];
  const today = new Date(); const y = today.getFullYear(), m = today.getMonth();
  const first = (new Date(y,m,1).getDay()+6)%7, days = new Date(y,m+1,0).getDate();
  let cells = wk.map(w=>`<div class="wk">${w}</div>`).join("");
  for (let i=0;i<first;i++) cells += "<div></div>";
  for (let d=1; d<=days; d++){ const dow=(first+d-1)%7; const on = d>today.getDate() && dow<6; cells += `<div class="${on?'on':''}">${d}</div>`; }
  const mn = today.toLocaleDateString(lang==='fr'?'fr-FR':'en-GB',{month:'long',year:'numeric'});
  return `<div><div style="text-transform:capitalize;margin-bottom:10px">${mn}</div><div class="slots">${cells}</div></div>`;
}

function quoteForm(o={}){
  const pre = state.prefill || {};
  const g = !!o.group;
  return `<form class="form" data-form="quote" id="qf">
    <label class="field"><span>${t({fr:"Type de voyage",en:"Trip type"})}</span><select id="q-type">${[["couple",{fr:"En couple",en:"Couple"}],["family",{fr:"En famille",en:"Family"}],["friends",{fr:"Entre amis",en:"Friends"}],["cel",{fr:"Mariage / célébration",en:"Wedding / celebration"}],["solo",{fr:"En solo",en:"Solo"}],["pil",{fr:"Pèlerinage",en:"Pilgrimage"}]].map(([v,l])=>`<option value="${v}" ${(g&&v==='group')?'selected':''}>${t(l)}</option>`).join("")}</select></label>
    <label class="field"><span>${t({fr:"Villes de départ",en:"Departure cities"})}</span><input id="q-from" placeholder="${t({fr:'Ex. : Paris',en:'E.g. London'})}"></label>
    <label class="field full"><span>${t({fr:"Destination",en:"Destination"})}</span><select id="q-dest">${destOptions(pre.dest)}<option value="other">${t({fr:"Autre destination",en:"Other destination"})}</option></select></label>
    <label class="field"><span>${t({fr:"Départ",en:"Departure"})}</span><input id="q-out" type="date" value="${esc(pre.out||'')}"></label>
    <label class="field"><span>${t({fr:"Retour",en:"Return"})}</span><input id="q-back" type="date" value="${esc(pre.back||'')}"></label>
    <label class="field"><span>${g?t({fr:"Nombre de participants",en:"Number of participants"}):t({fr:"Adultes",en:"Adults"})}</span><input id="q-ad" type="number" min="1" value="${esc(pre.pax|| (g?20:2))}"></label>
    <label class="field"><span>${g?t({fr:"Dont enfants / seniors",en:"Of which children / seniors"}):t({fr:"Enfants",en:"Children"})}</span><input id="q-ch" type="number" min="0" value="0"></label>
    <label class="field"><span>${t({fr:"Budget par personne",en:"Budget per person"})}</span><select id="q-bud"><option>${t({fr:"À définir",en:"To be defined"})}</option><option>&lt; €600</option><option>€600 – €1,200</option><option>€1,200 – €2,500</option><option>&gt; €2,500</option></select></label>
    <label class="field"><span>${t({fr:"Classe",en:"Cabin"})}</span><select id="q-cab"><option>Economy</option><option>Premium Economy</option><option>Business</option><option>First</option></select></label>
    <div class="field full"><span>${t({fr:"Services souhaités",en:"Services needed"})}</span><div class="checks">${[{fr:"Vols",en:"Flights"},{fr:"Hôtel",en:"Hotel"},{fr:"Transferts",en:"Transfers"},{fr:"Excursions",en:"Excursions"},{fr:"Assurance voyage",en:"Travel insurance"},{fr:"Visa",en:"Visa"}].map((s,i)=>`<label><input type="checkbox" name="svc" value="${esc(t(s))}" ${i<2?'checked':''}> ${t(s)}</label>`).join("")}</div></div>
    <label class="field"><span>${t({fr:"Nom",en:"Name"})}</span><input id="q-name" required autocomplete="name"></label>
    <label class="field"><span>WhatsApp / ${t({fr:"téléphone",en:"phone"})}</span><input id="q-tel" required autocomplete="tel" placeholder="+33 …"></label>
    <label class="field full"><span>Email</span><input id="q-mail" type="email" autocomplete="email"></label>
    <label class="field full"><span>${t({fr:"Votre projet",en:"Your plans"})}</span><textarea id="q-msg" placeholder="${t({fr:'Occasion, hôtels préférés, contraintes, flexibilité des dates…',en:'Occasion, preferred hotels, constraints, date flexibility…'})}">${pre.offer ? esc(t({fr:"Offre : ",en:"Offer: "}) + pre.offer) : ""}</textarea></label>
    <div class="full" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><button class="btn accent" type="submit">${t({fr:"Envoyer ma demande",en:"Send my request"})}</button><span class="note">${t({fr:"Réponse sous 24h ouvrées.",en:"Reply within 24 working hours."})}</span></div>
  </form>`;
}
function quotePage(){
  return `
  <section class="section"><div class="wrap dgrid" style="align-items:start">
    <div style="display:flex;flex-direction:column;gap:24px;min-width:0">
      <span class="eyebrow">${t(U.quote)}</span>
      <h1 class="display" style="font-size:clamp(38px,5vw,64px)">${t({fr:"Racontez-nous votre voyage",en:"Tell us about your trip"})}</h1>
      <p class="lede">${t({fr:"Plus vous nous donnez de détails, plus le premier devis sera juste. Rien n'est engageant.",en:"The more detail you give, the more accurate the first quote. Nothing is binding."})}</p>
      <div id="qwrap">${quoteForm({group: state.prefill && state.prefill.type==='group'})}</div>
    </div>
    <aside class="aside">
      <div class="ph" style="aspect-ratio:4/3;border-radius:2px;overflow:hidden">${img("map")}</div>
      <h3>${t({fr:"Pourquoi passer par nous",en:"Why book with us"})}</h3>
      <div class="row"><span>${t({fr:"Tarifs",en:"Fares"})}</span><span>${t({fr:"Accès direct aux tarifs des compagnies et aux tarifs de groupe.",en:"Direct access to airline and group fares."})}</span></div>
      <div class="row"><span>${t({fr:"Suivi",en:"Follow-up"})}</span><span>${t({fr:"Une seule personne pour tout votre voyage.",en:"One person for your whole trip."})}</span></div>
      <div class="row"><span>${t({fr:"Assistance",en:"Support"})}</span><span>${t({fr:"Joignable sur WhatsApp pendant le voyage.",en:"Reachable on WhatsApp during the trip."})}</span></div>
    </aside>
  </div></section>`;
}
const offerCard = o => `<a class="ocard" href="#offre-${o.id}"><div class="ph">${img(o.img, t(o.title))}<span class="otag">${t(o.tag)}</span></div>
  <div class="body"><span class="note">${t(o.valid)}</span><h3>${t(o.title)}</h3>
  <div class="price"><small>${t(U.from)}</small><b>${esc(o.price)}</b><span>${t(o.per)}</span></div>
  ${o.sample ? `<span class="sample" style="align-self:flex-start">${t(U.example)}</span>` : ""}</div></a>`;
function offersPage(){
  const list = window.OFFERS || [];
  return `
  <section class="hero short"><div class="ph">${img("venue_hotel","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t(U.offers)}</div>
    <h1 class="display" style="margin-top:12px">${t({fr:"Offres & formules clés en main",en:"Offers & turnkey retreats"})}</h1>
    <p class="sub">${t({fr:"Nos retraites les plus demandées, prêtes à adapter à votre équipe. Devis avec les vols de chaque participant sous 48 h.",en:"Our most requested retreats, ready to adapt to your team. Quote with every participant's flights within 48 h."})}</p>
  </div></section>
  ${list.length ? `<section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t(U.offers)}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Offres du moment",en:"Current offers"})}</h2></div></div>
    <div class="offers-grid">${list.map(offerCard).join("")}</div>
  </div></section>` : ""}
  <section class="section ${list.length ? "surface" : ""}"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Formules clés en main",en:"Turnkey retreats"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Nos retraites les plus demandées",en:"Our most requested retreats"})}</h2></div></div>
    <div class="grid">${PACKAGES.map(packageCard).join("")}</div>
  </div></section>
  <section class="section"><div class="wrap">${promiseBox()}</div></section>`;
}
function offerPage(id){
  const o = (window.OFFERS||[]).find(x=>x.id===id); if (!o) return notFound();
  const r = o.rdest ? byR(o.rdest) : null;
  const msg = (lang==='fr' ? "Bonjour, nous sommes intéressés par l'offre : " : "Hello, we're interested in the offer: ") + t(o.title) + " (" + o.price + ")";
  const others = (window.OFFERS||[]).filter(x=>x.id!==o.id).slice(0,3);
  return `
  <section class="hero short"><div class="ph">${img(o.img, t(o.title), true)}</div><div class="wrap">
    <div class="crumbs"><a href="#offres">${t(U.offers)}</a> / ${t(o.tag)}</div>
    <h1 class="display">${t(o.title)}</h1><p class="sub">${t(o.valid)}</p>
  </div></section>
  <section class="section"><div class="wrap dgrid">
    <div style="display:flex;flex-direction:column;gap:32px;min-width:0">
      ${o.sample ? `<span class="sample" style="align-self:flex-start;margin:0">${t(U.example)}</span>` : ""}
      <div><h2 class="h2" style="margin-bottom:14px">${t({fr:"Ce qui est inclus",en:"What's included"})}</h2><ul class="inc">${t(o.inc).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <p class="note">${t(o.cond)}</p>
      ${r ? `<div class="split" style="grid-template-columns:1fr 1fr;gap:24px;align-items:center"><a class="ph" href="#retraite-${r.s}" style="aspect-ratio:4/3;border-radius:2px;overflow:hidden">${img(r.img[0], t(r.n))}</a><div class="text" style="gap:12px"><span class="eyebrow">${t(U.dest)}</span><h3 style="font-size:24px">${t(r.n)}</h3><p class="note">${t(r.t)}</p><a class="link" href="#retraite-${r.s}">${t(U.discover)}</a></div></div>` : ""}
    </div>
    <aside class="aside">
      <div class="price" style="border:0;padding:0;margin:0"><small>${t(U.from)}</small><b>${esc(o.price)}</b></div>
      <span class="note" style="margin-top:-10px">${t(o.per)}</span>
      <div class="row"><span>${t({fr:"Validité",en:"Validity"})}</span><span>${t(o.valid)}</span></div>
      <a class="btn accent" href="#brief" data-offer="${o.id}" data-rpre="${o.rdest||""}">${t({fr:"Recevoir le devis avec vols",en:"Get the quote with flights"})}</a>
      <a class="btn ghost" href="${wa(msg)}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn ghost" href="#appel">${t(U.book)}</a>
    </aside>
  </div></section>
  ${others.length ? `<section class="section surface"><div class="wrap"><div class="head"><h2 class="h2">${t({fr:"Autres offres",en:"Other offers"})}</h2><a class="link" href="#offres">${t({fr:"Toutes les offres",en:"All offers"})}</a></div><div class="offers-grid">${others.map(offerCard).join("")}</div></div></section>` : ""}`;
}
function reel(a, i, small){
  const d = byS(a.dest);
  return `<button class="reel" data-video="${i}" type="button" aria-label="${esc(t(a.trip))}">
    <div class="ph">${img(a.poster, t(a.trip))}<span class="play"></span><span class="cap"><small>${esc(a.handle)}</small><b>${t(a.trip)}</b></span></div>
    ${small ? "" : `<blockquote>« ${t(a.q)} »</blockquote><span class="note">${t(a.name)}${d ? ` · ${t(d.n)}` : ""}</span>`}
    ${a.sample && !small ? `<span class="sample" style="margin:0;align-self:flex-start">${t(U.example)}</span>` : ""}
  </button>`;
}
function travellers(){
  const list = window.AMBASSADORS || [];
  return `
  <section class="hero short"><div class="ph">${img("plane2","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t(U.travellers)}</div>
    <h1 class="display" style="margin-top:12px">${t({fr:"Ils sont partis avec nous",en:"They travelled with us"})}</h1>
    <p class="sub">${t({fr:"Nos ambassadeurs racontent leur voyage en quelques secondes. Des vraies personnes, de vrais itinéraires.",en:"Our ambassadors share their trip in a few seconds. Real people, real itineraries."})}</p>
  </div></section>
  <section class="section"><div class="wrap"><div class="reels">${list.map((a,i)=>reel(a,i)).join("")}</div></div></section>
  <section class="section surface"><div class="wrap split">
    <div class="text"><span class="eyebrow">${t({fr:"Ambassadeurs",en:"Ambassadors"})}</span><h2 class="h2">${t({fr:"Vous créez du contenu voyage ?",en:"Do you create travel content?"})}</h2><p class="lede">${t({fr:"Nous travaillons avec des voyageurs, couples et familles qui aiment partager. Parlons d'une collaboration.",en:"We work with travellers, couples and families who love to share. Let's talk about working together."})}</p>
      <a class="btn" href="${wa(lang==='fr'?"Bonjour, je souhaite devenir ambassadeur Permanent Summer Voyages.":"Hello, I'd like to become a Permanent Summer Voyages ambassador.")}" target="_blank" rel="noopener">${t({fr:"Devenir ambassadeur",en:"Become an ambassador"})}</a></div>
    <div class="media ph">${img("santorini2")}</div>
  </div></section>`;
}
function videoModal(){
  if (state.video == null) return "";
  const a = (window.AMBASSADORS||[])[state.video]; if (!a) return "";
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(t(a.trip))}" data-act="closevideo">
    <button class="close" data-act="closevideo" aria-label="${t({fr:'Fermer',en:'Close'})}">×</button>
    ${a.video ? `<video src="${esc(a.video)}" poster="${ROOT}img/${a.poster}.jpg" controls autoplay playsinline></video>`
      : `<div class="soon">${img(a.poster)}<span class="eyebrow" style="color:#fff">${esc(a.handle)}</span><b style="font-weight:400;font-size:22px">${t(a.trip)}</b><span>${t({fr:"Vidéo bientôt disponible",en:"Video coming soon"})}</span></div>`}
  </div>`;
}

/* ---------- events ---------- */
function eventsHub(){
  return `
  <section class="hero short"><div class="ph">${img("team_park","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t(U.events)}</div>
    <h1 class="display" style="margin-top:12px">${t({fr:"Séminaires, team building, incentives et voyages de groupe",en:"Offsites, team building, incentives and group trips"})}</h1>
    <p class="sub">${t({fr:"Un format pour chaque objectif, de 6 à 500 personnes. Toujours avec les vols de chaque participant.",en:"A format for every goal, from 6 to 500 people. Always with every participant's flights."})}</p>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="types">${EVENTS.map(e=>`<a class="card wide" href="#event-${e.k}"><div class="ph">${img(e.img, t(e.n))}</div><div><span class="eyebrow">${t(e.size)} · ${t(e.len)}</span><h3 style="margin-top:6px">${t(e.n)}</h3><p class="meta" style="margin-top:6px">${t(e.t)}</p></div></a>`).join("")}
      <a class="card wide" href="#groupes"><div class="ph">${img("sport_team", t(U.grpB2B))}</div><div><span class="eyebrow">${t({fr:"Dès 10 personnes",en:"From 10 people"})}</span><h3 style="margin-top:6px">${t(U.grpB2B)}</h3><p class="meta" style="margin-top:6px">${t({fr:"Associations, clubs, équipes sportives, CSE, écoles.",en:"Associations, clubs, sports teams, works councils, schools."})}</p></div></a>
    </div>
    <div style="margin-top:48px">${promiseBox()}</div>
  </div></section>`;
}
function eventPage(k){
  const e = byE(k); if (!e) return notFound();
  const dests = e.dests.map(byR).filter(Boolean);
  return `
  <section class="hero short"><div class="ph">${img(e.img, t(e.n), true)}</div><div class="wrap">
    <div class="crumbs"><a href="#evenements">${t(U.events)}</a></div>
    <h1 class="display">${t(e.n)}</h1>
    <p class="sub">${t(e.t)}</p>
  </div></section>
  <section class="section"><div class="wrap dgrid">
    <div style="display:flex;flex-direction:column;gap:44px;min-width:0">
      <div class="prose"><span class="eyebrow">${t({fr:"Le format",en:"The format"})}</span><p>${t(e.d)}</p></div>
      <dl class="facts"><div><dt>${t({fr:"Taille du groupe",en:"Group size"})}</dt><dd>${t(e.size)}</dd></div><div><dt>${t({fr:"Durée",en:"Length"})}</dt><dd>${t(e.len)}</dd></div><div><dt>${t({fr:"S'y prendre",en:"Book ahead"})}</dt><dd>${t(e.lead)}</dd></div></dl>
      <div><h2 class="h2" style="margin-bottom:14px">${t({fr:"Pour qui ?",en:"Who is it for?"})}</h2><ul class="inc">${t(e.who).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <div><h2 class="h2" style="margin-bottom:12px">${t({fr:"Exemple de programme",en:"Sample agenda"})}</h2><ol class="itin">${t(e.agenda).map(x=>`<li><span>${esc(x)}</span></li>`).join("")}</ol></div>
      <div class="faq"><h2 class="h2" style="margin-bottom:14px">${t({fr:"Questions fréquentes",en:"Frequently asked questions"})}</h2>${e.faq.map(([q,a])=>`<details><summary>${t(q)}</summary><p>${t(a)}</p></details>`).join("")}</div>
    </div>
    <aside class="aside">
      <h3>${t({fr:"Votre projet",en:"Your project"})}</h3>
      <p class="note">${t({fr:"Décrivez votre équipe en 5 minutes : 3 propositions complètes sous 48 h, vols compris.",en:"Describe your team in 5 minutes: 3 complete proposals within 48 h, flights included."})}</p>
      <a href="#brief" class="btn accent" data-ev="${e.k}">${t(U.getProposal)}</a>
      <a href="#budget" class="btn ghost">${t(U.calc)}</a>
      <a href="#appel" class="btn ghost">${t(U.book)}</a>
      ${advisor()}
    </aside>
  </div></section>
  <section class="section surface"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Destinations recommandées",en:"Recommended destinations"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Où l'organiser",en:"Where to hold it"})}</h2></div><a class="link" href="#retraites">${t(U.allRetreats)}</a></div>
    <div class="grid">${dests.map(retreatCard).join("")}</div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="head"><div><span class="eyebrow">${t({fr:"Ce qui nous différencie",en:"What makes us different"})}</span><h2 class="h2" style="margin-top:10px">${t({fr:"Nous réservons aussi les vols",en:"We book the flights too"})}</h2></div></div>
    ${compareTable()}
  </div></section>`;
}

/* ---------- budget calculator (indicative ranges, per person) ---------- */
const CALC = {
  stay:[[90,140],[150,230],[260,420]],      // room + meals, per night
  room:[10,25],                               // meeting space & equipment, per night
  act:[[40,90],[110,200],[220,380]],          // activities, per trip
  transfer:[25,55],
  fly:{ none:[0,0], eu:[130,280], mix:[250,490] }
};
function calcNumbers(){
  const c = state.calc, f = (window.RFACTOR||{})[c.region] || 1, disc = c.pax > 60 ? .95 : 1;
  const lines = [
    [{fr:"Hébergement & repas",en:"Accommodation & meals"}, CALC.stay[c.level].map(x => x*c.nights*f*disc)],
    [{fr:"Salles & matériel",en:"Meeting space & equipment"}, CALC.room.map(x => x*c.nights*f)],
    [{fr:"Activités",en:"Activities"}, CALC.act[c.act].map(x => x*f)],
    [{fr:"Transferts sur place",en:"Local transfers"}, CALC.transfer],
    [{fr:"Vols aller-retour",en:"Return flights"}, CALC.fly[c.fly]]
  ];
  const lo = lines.reduce((s,l)=>s+l[1][0],0), hi = lines.reduce((s,l)=>s+l[1][1],0);
  return { lines, lo, hi };
}
const eur = n => (lang==='fr' ? (Math.round(n/10)*10).toLocaleString('fr-FR') + " €" : "€" + (Math.round(n/10)*10).toLocaleString('en-GB'));
function calcOut(){
  const c = state.calc, r = calcNumbers();
  return `<span class="eyebrow">${t({fr:"Budget estimé par personne",en:"Estimated budget per person"})}</span>
    <div class="big">${eur(r.lo)} – ${eur(r.hi)}</div>
    <div class="note">${t({fr:"Pour le groupe",en:"For the group"})} : <b style="font-weight:400;color:var(--ink)">${eur(r.lo*c.pax)} – ${eur(r.hi*c.pax)}</b> · ${c.pax} ${t({fr:"personnes",en:"people"})}, ${c.nights} ${t({fr:"nuits",en:"nights"})}</div>
    <div class="lines">${r.lines.filter(l=>l[1][1]>0).map(([l,v])=>`<div><span>${t(l)}</span><span>${eur(v[0])} – ${eur(v[1])}</span></div>`).join("")}</div>
    <p class="note">${t({fr:"Fourchette indicative, hors honoraires d'organisation (précisés dans votre proposition). Les prix réels dépendent des dates et des disponibilités.",en:"Indicative range, excluding our planning fee (stated in your proposal). Actual prices depend on dates and availability."})}</p>
    <a class="btn accent" href="#brief" data-pax="${c.pax}" data-nights="${Math.min(c.nights,6) >= 6 ? "6+" : c.nights}">${t({fr:"Recevoir 3 propositions précises",en:"Get 3 precise proposals"})}</a>`;
}
function budgetPage(){
  const c = state.calc;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v,l])=>`<button type="button" data-calc="${key}" data-v="${v}" aria-pressed="${String(c[key])===String(v)}">${t(l)}</button>`).join("")}</div>`;
  return `
  <section class="section"><div class="wrap">
    <span class="eyebrow">${t(U.calc)}</span>
    <h1 class="display" style="font-size:clamp(38px,5vw,64px);margin:12px 0 14px">${t({fr:"Combien coûte un séminaire, vols compris ?",en:"How much does an offsite cost, flights included?"})}</h1>
    <p class="lede" style="margin-bottom:40px">${t({fr:"Une première fourchette en 30 secondes, basée sur nos prix habituels en Europe. Le seul calculateur qui inclut les vols de chaque participant.",en:"A first range in 30 seconds, based on our usual prices in Europe. The only calculator that includes every participant's flights."})}</p>
    <div class="calc">
      <div class="form" style="grid-template-columns:1fr">
        <div class="field"><span>${t({fr:"Participants",en:"People"})} · <b class="rv" id="cv-pax">${c.pax}</b></span><input type="range" min="10" max="300" step="5" value="${c.pax}" data-calc="pax" aria-label="${t({fr:'Participants',en:'People'})}"></div>
        <div class="field"><span>${t({fr:"Nuits",en:"Nights"})}</span>${seg("nights",[[2,{fr:"2",en:"2"}],[3,{fr:"3",en:"3"}],[4,{fr:"4",en:"4"}],[5,{fr:"5",en:"5"}],[6,{fr:"6",en:"6"}]])}</div>
        <div class="field"><span>${t({fr:"Niveau du lieu",en:"Venue level"})}</span>${seg("level",[[0,{fr:"Simple & convivial",en:"Simple & friendly"}],[1,{fr:"Confort (4★, boutique)",en:"Comfort (4★, boutique)"}],[2,{fr:"Premium (5★, privatisé)",en:"Premium (5★, exclusive)"}]])}</div>
        <div class="field"><span>${t({fr:"Région",en:"Region"})}</span>${seg("region",RREGIONS.map(g=>[g.k,g]))}</div>
        <div class="field"><span>${t({fr:"D'où partent les participants ?",en:"Where are people flying from?"})}</span>${seg("fly",[["eu",{fr:"D'Europe",en:"Within Europe"}],["mix",{fr:"Europe + quelques long-courriers",en:"Europe + some long-haul"}],["none",{fr:"Pas de vols",en:"No flights"}]])}</div>
        <div class="field"><span>${t({fr:"Activités",en:"Activities"})}</span>${seg("act",[[0,{fr:"Légères",en:"Light"}],[1,{fr:"Une par jour",en:"One a day"}],[2,{fr:"Programme complet",en:"Full programme"}]])}</div>
      </div>
      <div class="out" id="calcout" aria-live="polite">${calcOut()}</div>
    </div>
  </div></section>
  <section class="section surface"><div class="wrap">${promiseBox()}</div></section>`;
}

/* ---------- team-building library ---------- */
const energy = e => `<span class="energy" aria-label="${t({fr:"Énergie",en:"Energy"})} ${e}/3">${"●".repeat(e)}${"○".repeat(3-e)}</span>`;
const actCard = a => `<article class="act"><div class="ph">${img(a.img, t(a.n))}</div>
  <span class="eyebrow">${t(ACTCATS.find(c=>c.k===a.cat)||{})}</span><h3>${t(a.n)}</h3><p>${t(a.d)}</p>
  <div class="m"><span>${a.size} ${t({fr:"pers.",en:"people"})}</span><span>${t(a.dur)}</span>${energy(a.e)}</div>
  <div class="w note">${a.where.map(byR).filter(Boolean).map(r=>`<a href="#retraite-${r.s}">${t(r.n)}</a>`).join(" · ")}</div></article>`;
function activitiesPage(){
  const f = state.acat || "all", list = f === "all" ? ACTLIB : ACTLIB.filter(a => a.cat === f);
  return `
  <section class="hero short"><div class="ph">${img("team_ridge2","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${ACTLIB.length} ${t({fr:"activités",en:"activities"})}</div>
    <h1 class="display" style="margin-top:12px">${t(U.lib)}</h1>
    <p class="sub">${t({fr:"Classées par énergie, durée et taille de groupe, avec les destinations où nous les organisons.",en:"Sorted by energy, duration and group size, with the destinations where we run them."})}</p>
  </div></section>
  <section class="section tight"><div class="wrap">
    <div class="chips" role="group" aria-label="${t({fr:'Filtrer',en:'Filter'})}">
      <button class="chip" data-acat="all" aria-pressed="${f==='all'}">${t({fr:"Toutes",en:"All"})}</button>
      ${ACTCATS.map(c=>`<button class="chip" data-acat="${c.k}" aria-pressed="${f===c.k}">${t(c)}</button>`).join("")}
    </div>
    <p class="note" style="margin-top:14px">${energy(1)} ${t({fr:"calme",en:"calm"})} · ${energy(3)} ${t({fr:"intense",en:"intense"})}</p>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap"><div class="acts">${list.map(actCard).join("")}</div></div></section>
  <section class="section surface"><div class="wrap">${promiseBox()}</div></section>`;
}

/* ---------- offsite planning guide (SEO content + newsletter) ---------- */
function guidePage(){
  const steps = [
    [{fr:"J-6 mois",en:"6 months out"},{fr:"Objectifs & budget",en:"Goals & budget"},{fr:["Définir l'objectif principal : stratégie, cohésion, récompense ou intégration","Estimer le nombre de participants et leurs villes de départ","Fixer un budget par personne, vols compris","Choisir deux ou trois périodes possibles en évitant les vacances scolaires et les pics d'activité"],en:["Set the main goal: strategy, bonding, reward or onboarding","Estimate headcount and departure cities","Set a budget per person, flights included","Pick two or three possible windows, avoiding school holidays and busy seasons"]}],
    [{fr:"J-5 à J-4 mois",en:"5–4 months out"},{fr:"Destination & lieu",en:"Destination & venue"},{fr:["Présélectionner trois destinations selon le temps de vol depuis là où vit l'équipe","Vérifier le lieu : chambres, salle plénière, salles de sous-commission, wifi, accessibilité","Lire les conditions d'annulation et le calendrier des acomptes","Poser une option avant de signer"],en:["Shortlist three destinations by flight time from where the team lives","Check the venue: rooms, plenary, breakout rooms, wifi, accessibility","Read the cancellation terms and deposit schedule","Place an option before signing"]}],
    [{fr:"J-4 à J-3 mois",en:"4–3 months out"},{fr:"Vols",en:"Flights"},{fr:["Collecter ville de départ, nom exact du passeport et préférences de chaque participant","Réserver tôt des tarifs de groupe ou flexibles","Caler une fenêtre d'arrivée commune pour démarrer ensemble","Prévoir les cas particuliers : arrivée tardive, extension personnelle, accompagnants"],en:["Collect each person's departure city, exact passport name and preferences","Book group or flexible fares early","Agree a common arrival window so everyone starts together","Plan for special cases: late arrivals, personal extensions, plus-ones"]}],
    [{fr:"J-3 à J-2 mois",en:"3–2 months out"},{fr:"Programme",en:"Programme"},{fr:["Équilibrer travail, activités et temps libre","Choisir des activités accessibles à tous, avec un plan B en cas de météo","Recueillir les régimes alimentaires et besoins particuliers","Réserver un facilitateur si besoin"],en:["Balance work, activities and free time","Choose activities everyone can do, with a weather plan B","Collect dietary and accessibility needs","Book a facilitator if needed"]}],
    [{fr:"J-6 semaines",en:"6 weeks out"},{fr:"Communication",en:"Communication"},{fr:["Envoyer un livret participant : programme, vols, tenue, contacts","Valider la rooming list","Vérifier assurances et documents de voyage","Créer un groupe WhatsApp pour le voyage"],en:["Send a participant pack: agenda, flights, what to wear, contacts","Confirm the rooming list","Check insurance and travel documents","Set up a WhatsApp group for the trip"]}],
    [{fr:"J-2 semaines",en:"2 weeks out"},{fr:"Derniers réglages",en:"Final checks"},{fr:["Confirmer le nombre final au lieu et aux prestataires","Organiser les transferts par vague d'arrivée","Tester la technique de la salle","Imprimer le programme"],en:["Confirm final numbers with the venue and suppliers","Arrange transfers by arrival wave","Test the meeting-room AV","Print the agenda"]}],
    [{fr:"Pendant",en:"During"},{fr:"Sur place",en:"On site"},{fr:["Un seul interlocuteur joignable à toute heure","Un point rapide chaque matin avec le lieu","Gérer en direct les vols annulés ou modifiés"],en:["One contact reachable at any hour","A quick check-in with the venue every morning","Handle cancelled or changed flights in real time"]}],
    [{fr:"Après",en:"After"},{fr:"Bilan",en:"Wrap-up"},{fr:["Envoyer un questionnaire de satisfaction","Partager photos et décisions","Rapprocher les factures","Noter ce qu'il faut garder pour l'an prochain"],en:["Send a feedback survey","Share photos and decisions","Reconcile invoices","Note what to keep for next year"]}]
  ];
  return `
  <section class="hero short"><div class="ph">${img("team_garden","",true)}</div><div class="wrap">
    <div class="eyebrow" style="color:#fff">${t({fr:"Guide gratuit",en:"Free guide"})}</div>
    <h1 class="display" style="margin-top:12px">${t({fr:"Organiser un séminaire d'entreprise : la checklist complète",en:"How to plan a company offsite: the complete checklist"})}</h1>
    <p class="sub">${t({fr:"Tout ce que nous vérifions pour chaque retraite, de J-6 mois au retour, vols compris.",en:"Everything we check for every retreat, from six months out to back home, flights included."})}</p>
  </div></section>
  <section class="section"><div class="wrap dgrid">
    <div style="min-width:0"><ol class="check">${steps.map(([w,h,l])=>`<li><b>${t(w)}</b><div><h2 class="h2" style="font-size:24px">${t(h)}</h2><ul>${t(l).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></li>`).join("")}</ol></div>
    <aside class="aside">
      <h3>${t({fr:"On s'en occupe",en:"We'll handle it"})}</h3>
      <p class="note">${t({fr:"Chaque étape de cette liste fait partie de notre travail, y compris les vols de chaque participant.",en:"Every step on this list is part of our job, including every participant's flights."})}</p>
      <a class="btn accent" href="#brief">${t(U.plan)}</a>
      <a class="btn ghost" href="#budget">${t(U.calc)}</a>
      <div class="row" style="border:0;padding:0"><span>${t({fr:"La lettre mensuelle",en:"Monthly newsletter"})}</span></div>
      <form class="news" data-form="news" style="margin:0"><label for="nl2" style="position:absolute;left:-9999px">Email</label><input id="nl2" type="email" required placeholder="email@exemple.com"><button class="btn">${t({fr:"S'inscrire",en:"Sign up"})}</button></form>
    </aside>
  </div></section>`;
}

function legal(){
  const H = x => `<h2 class="h2" style="font-size:24px;margin:36px 0 10px">${t(x)}</h2>`;
  return `<section class="section"><div class="wrap" style="max-width:820px">
    <span class="eyebrow">${t({fr:"Mentions légales",en:"Legal notice"})}</span>
    <h1 class="display" style="font-size:clamp(36px,4.6vw,56px);margin:12px 0 28px">${t({fr:"Mentions légales, confidentialité et conditions",en:"Legal notice, privacy and terms"})}</h1>
    <div class="prose" style="font-size:16px">
      ${H({fr:"Éditeur du site",en:"Site publisher"})}
      <p><b style="font-weight:400">Permanent Summer Lda</b><br>${t({fr:"Société de droit portugais",en:"Portuguese company"})} · NIF / NIPC 516416804<br>Casas da Alcaria, Lote 81, 8950-413 Altura, Portugal<br>${esc(C.email)} · ${esc(C.phone)}</p>
      <p>${t({fr:"Hébergement : GitHub Pages (GitHub, Inc.), avec Cloudflare pour le domaine.",en:"Hosting: GitHub Pages (GitHub, Inc.), with Cloudflare for the domain."})}</p>
      ${H({fr:"Notre rôle",en:"Our role"})}
      <p>${t({fr:"Permanent Summer Lda conçoit et coordonne les retraites, séminaires et voyages, et facture ses honoraires d'organisation. Les billets d'avion sont émis par notre partenaire agence agréé. Les hébergements, lieux et activités sont réservés au nom du client auprès des prestataires, qui le facturent directement selon leurs propres conditions.",en:"Permanent Summer Lda designs and coordinates retreats, offsites and trips, and invoices its planning fees. Flight tickets are issued by our licensed travel agency partner. Accommodation, venues and activities are booked in the client's name with the suppliers, who invoice the client directly under their own terms."})}</p>
      ${H({fr:"Conditions",en:"Terms"})}
      <p>${t({fr:"Nos propositions et devis sont gratuits et sans engagement. Une réservation n'est confirmée qu'après accord écrit du client et, le cas échéant, versement de l'acompte demandé par le prestataire. Les conditions de modification et d'annulation sont celles de chaque prestataire et des tarifs aériens choisis ; elles figurent dans la proposition. Nos honoraires d'organisation sont fixés à l'avance et facturés par Permanent Summer Lda.",en:"Our proposals and quotes are free and non-binding. A booking is confirmed only after the client's written agreement and, where applicable, payment of the deposit requested by the supplier. Change and cancellation terms are those of each supplier and of the chosen air fares; they are set out in the proposal. Our planning fees are agreed upfront and invoiced by Permanent Summer Lda."})}</p>
      ${H({fr:"Données personnelles",en:"Personal data"})}
      <p>${t({fr:"Les informations envoyées via ce site (formulaires, WhatsApp, email) servent uniquement à répondre à votre demande et à organiser votre voyage. Elles sont transmises aux prestataires concernés (compagnies aériennes, hôtels, lieux) seulement lorsque c'est nécessaire à la réservation, et ne sont jamais vendues. Ce site n'utilise pas de cookies publicitaires ; la prise de rendez-vous est assurée par Calendly. Vous pouvez demander l'accès, la rectification ou la suppression de vos données à",en:"Information sent through this site (forms, WhatsApp, email) is used only to answer your request and organise your trip. It is shared with the relevant suppliers (airlines, hotels, venues) only when needed for a booking, and is never sold. This site uses no advertising cookies; appointment booking is provided by Calendly. You can request access to, correction or deletion of your data at"})} ${esc(C.email)}.</p>
      ${H({fr:"Réclamations",en:"Complaints"})}
      <p>${t({fr:"Pour toute réclamation, écrivez-nous à",en:"For any complaint, write to us at"})} ${esc(C.email)}. ${t({fr:"Vous pouvez aussi utiliser le",en:"You can also use the"})} <a class="link" href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener">Livro de Reclamações</a> ${t({fr:"(livre de réclamations électronique portugais).",en:"(Portuguese electronic complaints book)."})}</p>
    </div></div></section>`;
}
function notFound(){ return `<section class="section"><div class="wrap"><h1 class="display h2">${t({fr:"Page introuvable",en:"Page not found"})}</h1><p style="margin-top:16px"><a class="link" href="#home">${t({fr:"Retour à l'accueil",en:"Back to home"})}</a></p></div></section>`; }

/* ---------- router ---------- */
function route(){
  const h = STATIC ? window.SITE.page : ((location.hash || "#home").slice(1).split("/")[0] || "home");
  let html, overlay = true;
  if (h === "home" || h === "") html = home();
  else if (h === "voyages") html = voyagesHome();
  else if (h === "comment") { html = howPage(); overlay = false; }
  else if (h === "partenaires") html = partnersPage();
  else if (h === "retraites") html = retreatsPage();
  else if (h.startsWith("retraite-")) html = retreatPage(h.slice(9));
  else if (h === "brief") { html = briefPage(); overlay = false; }
  else if (h === "evenements") html = eventsHub();
  else if (h.startsWith("event-")) html = eventPage(h.slice(6));
  else if (h === "budget") { html = budgetPage(); overlay = false; }
  else if (h === "activites") html = activitiesPage();
  else if (h === "guide") html = guidePage();
  else if (h === "destinations") html = destinations();
  else if (h.startsWith("dest-")) html = destPage(h.slice(5));
  else if (h === "inspiration") html = inspiration();
  else if (h.startsWith("theme-")) html = themePage(h.slice(6));
  else if (h === "offres") html = offersPage();
  else if (h.startsWith("offre-")) html = offerPage(h.slice(6));
  else if (h === "voyageurs") html = travellers();
  else if (h === "groupes") html = groups();
  else if (h === "entreprises") html = corporate();
  else if (h === "a-propos") { html = about(); overlay = false; }
  else if (h === "appel") { html = book(); overlay = false; }
  else if (h === "devis") { html = quotePage(); overlay = false; }
  else if (h === "mentions") { html = legal(); overlay = false; }
  else { html = notFound(); overlay = false; }
  return { html, overlay, key:h };
}
let lastKey = null;
function render(keepScroll){
  const r = route();
  document.documentElement.lang = lang;
  document.documentElement.dataset.theme = sideOf(r.key) === "b2c" ? "light" : "dark";
  document.body.classList.toggle("overlay", r.overlay);
  document.getElementById("app").innerHTML = linkify(header() + `<main>${r.html}</main>` + footer() + drawer() + videoModal());
  if (!STATIC) document.title = "Permanent Summer Voyages";
  if (!keepScroll && r.key !== lastKey) window.scrollTo(0,0);
  lastKey = r.key;
  onScroll();
  if (r.key === "appel") mountCalendly();
}
let scrollTick = false, wasSolid = null;
function onScroll(){
  if (scrollTick) return; scrollTick = true;
  (window.requestAnimationFrame || (f => setTimeout(f, 16)))(() => {
    scrollTick = false;
    const hdr = document.getElementById("hdr"); if (!hdr) return;
    const solid = window.scrollY > 40 || !!state.megaOpen;
    if (solid !== wasSolid || hdr.classList.contains("solid") !== solid) { hdr.classList.toggle("solid", solid); wasSolid = solid; }
  });
}
/* Calendly: one loader for the inline widget (#appel page) and the popup (every "Book a call" button) */
let calState = "idle"; const calWait = [];
function loadCalendly(cb){
  if (window.Calendly) { cb && cb(true); return; }
  if (cb) calWait.push(cb);
  if (calState !== "idle") return;
  calState = "loading";
  try { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://assets.calendly.com/assets/external/widget.css"; document.head.appendChild(l); } catch(e){}
  const s = document.createElement("script");
  s.src = "https://assets.calendly.com/assets/external/widget.js"; s.async = true;
  const done = ok => { calState = ok ? "ready" : "failed"; calWait.splice(0).forEach(f => f(ok)); };
  s.onload = () => done(!!window.Calendly); s.onerror = () => done(false);
  document.head.appendChild(s);
  setTimeout(() => { if (calState === "loading") done(false); }, 20000);
}
function mountCalendly(){
  const fb = document.getElementById("calfb"), w = document.getElementById("calw");
  const showFb = () => { if (w && !w.querySelector("iframe")) { w.hidden = true; fb.hidden = false; } };
  loadCalendly(ok => {
    if (!ok) return showFb();
    if (w.querySelector("iframe")) return;
    try { window.Calendly.initInlineWidget({ url: w.dataset.url, parentElement: w }); } catch(e){ showFb(); }
  });
}
/* forms: post to CONFIG.formEndpoint when set (e.g. Formspree), otherwise offer WhatsApp + copy */
function sendForm(f, data, msg, okText){
  const L = lang==='fr';
  const fallback = (note) => { f.outerHTML = `<div class="done">
      <b style="font-weight:400;font-size:22px">${L?"Votre demande est prête":"Your request is ready"}</b>
      <p class="note">${note || (L?"Envoyez-la sur WhatsApp en un clic, ou copiez le texte et envoyez-le à ":"Send it on WhatsApp in one click, or copy the text and email it to ")+esc(C.email)+"."}</p>
      <pre id="qmsg">${esc(msg)}</pre>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn accent" href="${wa(msg)}" target="_blank" rel="noopener">${t(U.whatsapp)}</a><button class="btn ghost" data-copy="qmsg" type="button">${L?"Copier le texte":"Copy text"}</button></div>
    </div>`; };
  if (!C.formEndpoint) { fallback(); return; }
  const btn = f.querySelector("button[type=submit]"); if (btn) { btn.disabled = true; btn.textContent = L ? "Envoi…" : "Sending…"; }
  fetch(C.formEndpoint, { method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" }, body: JSON.stringify(Object.assign({ _subject: (data.form||"form") + " · " + (data.company || data.name || "") }, data)) })
    .then(r => { if (!r.ok) throw new Error(r.status); f.outerHTML = `<div class="sent"><b style="font-weight:400;font-size:22px">${L?"Merci !":"Thank you!"}</b><p>${esc(okText)}</p><a class="btn ghost" href="${urlFor('appel')}" style="align-self:flex-start">${t(U.book)}</a></div>`; })
    .catch(() => fallback(L ? "L'envoi n'a pas abouti. Envoyez votre demande sur WhatsApp ou par email à "+esc(C.email)+"." : "Sending failed. Send your request on WhatsApp or by email to "+esc(C.email)+"."));
}
function toast(msg){ const d=document.createElement("div"); d.className="toast"; d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(),2600); }

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-lang],[data-mega],[data-region],[data-rregion],[data-rfilter],[data-tab],[data-filter],[data-act],[data-pre],[data-rpre],[data-offer],[data-copy],[data-video],[data-calc],[data-acat],[data-pax],[data-ev],[data-k],a[href^='#']");
  if (!el) { if (state.megaOpen && !e.target.closest(".mega")) { state.megaOpen=null; render(true); } return; }
  if (el.dataset.lang){ lang = el.dataset.lang; try{localStorage.setItem("ps-lang",lang)}catch(_){}; render(true); return; }
  if (el.dataset.mega){ state.megaOpen = state.megaOpen===el.dataset.mega ? null : el.dataset.mega; render(true); return; }
  if (el.dataset.region){ state.megaRegion = el.dataset.region; render(true); return; }
  if (el.dataset.rregion){ state.rRegion = el.dataset.rregion; render(true); return; }
  if (el.dataset.rfilter){ state.rfilter = el.dataset.rfilter; render(true); return; }
  if (el.dataset.tab){ state.homeTab = el.dataset.tab; render(true); return; }
  if (el.dataset.acat){ state.acat = el.dataset.acat; render(true); return; }
  if (el.dataset.calc && el.tagName === "BUTTON"){ setCalc(el.dataset.calc, el.dataset.v); el.parentNode.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === el)); return; }
  if (el.dataset.act==="drawer"){ state.drawer = !state.drawer; render(true); return; }
  if (el.dataset.act==="closevideo"){ if (e.target.closest("video,.soon")) return; state.video = null; render(true); return; }
  if (el.dataset.video != null){ state.video = +el.dataset.video; render(true); return; }
  const isCall = STATIC ? (el.dataset.k === "appel" && window.SITE.page !== "appel") : (el.getAttribute("href") === "#appel" && location.hash !== "#appel");
  if (isCall && window.Calendly){
    e.preventDefault(); state.megaOpen = null; state.drawer = false; if (STATIC) render(true);
    try { window.Calendly.initPopupWidget({ url: C.calendly + "?hide_gdpr_banner=1" }); } catch(_) { if (STATIC) location.href = el.href; else location.hash = "appel"; }
    return;
  }
  if (el.dataset.copy){ const txt = document.getElementById(el.dataset.copy).textContent; navigator.clipboard.writeText(txt).then(()=>toast(lang==='fr'?"Copié":"Copied")).catch(()=>{ const r=document.createRange(); r.selectNodeContents(document.getElementById(el.dataset.copy)); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }); return; }
  if (el.dataset.filter){ state.filter = el.dataset.filter; if (el.tagName === "BUTTON") { render(true); return; } }
  const pq = { dest: el.dataset.pre, rdest: el.dataset.rpre, offer: el.dataset.offer, pax: el.dataset.pax, nights: el.dataset.nights, ev: el.dataset.ev };
  const hasPre = Object.values(pq).some(Boolean);
  if (STATIC && hasPre){
    e.preventDefault();
    location.href = el.href.split("?")[0] + "?" + new URLSearchParams(Object.entries(pq).filter(([,v]) => v)).toString();
    return;
  }
  if (el.dataset.rpre || el.dataset.pax || el.dataset.ev){ state.prefill = { rdest: el.dataset.rpre || "", pax: el.dataset.pax || "", nights: el.dataset.nights || "", ev: el.dataset.ev || "" }; }
  if (el.dataset.pre){ state.prefill = { dest: el.dataset.pre }; }
  if (el.dataset.offer){ const o = (window.OFFERS||[]).find(x=>x.id===el.dataset.offer); if (o) state.prefill = { rdest: o.rdest || "", offer: t(o.title) + " (" + o.price + ")" }; }
  if (STATIC) { if (el.dataset.k === window.SITE.page && (state.drawer || state.megaOpen)) { state.drawer = false; state.megaOpen = null; render(true); } return; }
  if (el.matches("a[href^='#']")){
    state.megaOpen = null; state.drawer = false;
    if (el.getAttribute("href") === location.hash) { e.preventDefault(); render(); window.scrollTo(0,0); }
  }
});
document.addEventListener("submit", e => {
  const f = e.target; e.preventDefault();
  if (f.dataset.form === "search"){
    const g = id => (f.querySelector(id) || {}).value || "";
    state.prefill = { dest: g("#s-dest"), out: g("#s-out"), back: g("#s-back"), pax: g("#s-pax") };
    if (STATIC) { const q = new URLSearchParams(Object.entries(state.prefill).filter(([,v])=>v)); location.href = urlFor("devis") + "?" + q.toString(); return; }
    location.hash = "devis"; return;
  }
  if (f.dataset.form === "minibrief"){
    state.prefill = { pax: f.querySelector("#m-pax").value, rdest: f.querySelector("#m-dest").value, month: f.querySelector("#m-month").value };
    if (STATIC) { const q = new URLSearchParams(Object.entries(state.prefill).filter(([,v])=>v)); location.href = urlFor("brief") + "?" + q.toString(); return; }
    location.hash = "brief"; return;
  }
  if (f.dataset.form === "brief"){
    const v = id => (f.querySelector("#"+id)||{}).value || "";
    const txt = id => { const el = f.querySelector("#"+id); return el && el.tagName === "SELECT" ? el.options[el.selectedIndex].text : v(id); };
    const multi = n => [...f.querySelectorAll(`input[name=${n}]:checked`)].map(x=>x.value).join(", ");
    const L = lang==='fr';
    const data = { form:"retreat-brief", lang, type:txt("b-type"), company:v("b-co"), name:v("b-name"), email:v("b-mail"), phone:v("b-tel"), people:v("b-pax"), nights:v("b-nights"),
      period:txt("b-month"), destination:txt("b-dest"), departure_cities:v("b-cities"), budget:txt("b-budget"), flights:txt("b-flights"), goals:multi("goal"), activities:multi("act"), notes:v("b-msg") };
    const msg = [ L?"Bonjour, voici notre brief de retraite :":"Hello, here is our retreat brief:",
      `Type : ${data.type}`, `${L?"Entreprise":"Company"} : ${data.company}`, `${L?"Participants":"People"} : ${data.people} · ${L?"Nuits":"Nights"} : ${data.nights}`,
      `${L?"Période":"Period"} : ${data.period} · Destination : ${data.destination}`, `${L?"Villes de départ":"Departure cities"} : ${data.departure_cities||"-"}`,
      `Budget : ${data.budget} · ${L?"Vols":"Flights"} : ${data.flights}`, `${L?"Objectifs":"Goals"} : ${data.goals||"-"}`, `${L?"Activités":"Activities"} : ${data.activities||"-"}`,
      data.notes ? `${L?"Détails":"Details"} : ${data.notes}` : "", `— ${data.name} · ${data.email}${data.phone?" · "+data.phone:""}`].filter(Boolean).join("\n");
    sendForm(f, data, msg, L ? "Brief envoyé. Nous revenons vers vous sous 48 h avec nos propositions." : "Brief sent. We'll come back to you within 48 hours with our proposals.");
    return;
  }
  if (f.dataset.form === "venue"){
    const v = id => (f.querySelector("#"+id)||{}).value || ""; const L = lang==='fr';
    const data = { form:"venue", lang, venue:v("v-name"), website:v("v-web"), location:v("v-loc"), type:v("v-type"), rooms:v("v-rooms"), capacity:v("v-cap"), meeting:v("v-meet"), airport:v("v-air"), name:v("v-contact"), email:v("v-mail"), phone:v("v-tel"), notes:v("v-msg") };
    const msg = [L?"Bonjour, je souhaite proposer mon lieu :":"Hello, I'd like to list my venue:", `${data.venue} (${data.type}) · ${data.location}`, data.website,
      `${L?"Chambres":"Rooms"} : ${data.rooms||"-"} · ${L?"Capacité":"Capacity"} : ${data.capacity||"-"} · ${L?"Salle":"Meeting room"} : ${data.meeting||"-"}`, `${L?"Aéroport":"Airport"} : ${data.airport||"-"}`,
      data.notes, `— ${data.name} · ${data.email}${data.phone?" · "+data.phone:""}`].filter(Boolean).join("\n");
    sendForm(f, data, msg, L ? "Merci ! Nous revenons vers vous sous quelques jours." : "Thank you! We'll be in touch within a few days.");
    return;
  }
  if (f.dataset.form === "news"){
    const em = (f.querySelector("input")||{}).value || "";
    const link = wa((lang==='fr'?"Bonjour, je souhaite recevoir vos offres de voyage. Mon email : ":"Hello, I'd like to receive your travel offers. My email: ") + em);
    f.innerHTML = `<p class="note">${lang==='fr'?"Dernière étape : confirmez sur WhatsApp.":"Last step: confirm on WhatsApp."} <a class="link" href="${link}" target="_blank" rel="noopener">WhatsApp →</a></p>`;
    return;
  }
  if (f.dataset.form === "quote"){
    const v = id => (f.querySelector("#"+id)||{}).value || "";
    const sel = f.querySelector("#q-dest"); const destTxt = sel.value ? sel.options[sel.selectedIndex].text : (lang==='fr'?"À définir":"To be defined");
    const svc = [...f.querySelectorAll("input[name=svc]:checked")].map(x=>x.value).join(", ");
    const typeSel = f.querySelector("#q-type");
    const L = lang==='fr';
    const msg = [
      L?"Bonjour, voici ma demande de devis :":"Hello, here is my quote request:",
      `${L?"Type":"Type"} : ${typeSel.options[typeSel.selectedIndex].text}`,
      `${L?"Départ de":"From"} : ${v("q-from")}`,
      `Destination : ${destTxt}`,
      `${L?"Dates":"Dates"} : ${v("q-out")||"?"} → ${v("q-back")||"?"}`,
      `${L?"Voyageurs":"Travellers"} : ${v("q-ad")} + ${v("q-ch")}`,
      `Budget : ${v("q-bud")} · ${L?"Classe":"Cabin"} : ${v("q-cab")}`,
      `Services : ${svc||"-"}`,
      v("q-msg") ? `${L?"Détails":"Details"} : ${v("q-msg")}` : "",
      `— ${v("q-name")} · ${v("q-tel")}${v("q-mail")?" · "+v("q-mail"):""}`
    ].filter(Boolean).join("\n");
    const data = { form:"quote", lang, type:typeSel.options[typeSel.selectedIndex].text, from:v("q-from"), destination:destTxt, depart:v("q-out"), return:v("q-back"),
      adults:v("q-ad"), children:v("q-ch"), budget:v("q-bud"), cabin:v("q-cab"), services:svc, notes:v("q-msg"), name:v("q-name"), phone:v("q-tel"), email:v("q-mail") };
    sendForm(f, data, msg, L ? "Demande envoyée. Réponse sous 24 h ouvrées." : "Request sent. Reply within 24 working hours.");
  }
});
function setCalc(k, v){
  state.calc[k] = (k === "region" || k === "fly") ? v : Number(v);
  const o = document.getElementById("calcout"); if (o) o.innerHTML = linkify(calcOut());
  const pv = document.getElementById("cv-pax"); if (pv) pv.textContent = state.calc.pax;
}
document.addEventListener("input", e => { const el = e.target; if (el.dataset && el.dataset.calc) setCalc(el.dataset.calc, el.value); });
if (!STATIC) window.addEventListener("hashchange", () => { state.megaOpen = null; state.drawer = false; render(); });
window.addEventListener("scroll", onScroll, { passive:true });
document.addEventListener("keydown", e => { if (e.key === "Escape" && (state.megaOpen || state.drawer || state.video != null)) { state.megaOpen=null; state.drawer=false; state.video=null; render(true); } });
if (STATIC && document.getElementById("app").children.length){
  /* page is pre-rendered: keep the HTML, only wire up what needs JS */
  lastKey = window.SITE.page;
  if (lastKey === "brief") {
    const q = new URLSearchParams(location.search);
    const o = (window.OFFERS||[]).find(x => x.id === q.get("offer"));
    if ([...q.keys()].length) { state.prefill = { rdest: q.get("rdest") || "", pax: q.get("pax") || "", month: q.get("month") || "", nights: q.get("nights") || "", ev: q.get("ev") || "", offer: o ? t(o.title) + " (" + o.price + ")" : "" }; render(true); }
  }
  if (lastKey === "devis") {
    const q = new URLSearchParams(location.search);
    if ([...q.keys()].length) state.prefill = { dest: q.get("dest") || "", out: q.get("out") || "", back: q.get("back") || "", pax: q.get("pax") || "" };
    if ([...q.keys()].length) render(true);
  }
  onScroll();
  if (lastKey === "appel") mountCalendly();
} else render();
loadCalendly();
window.PSV = { render, pathFor, urlFor, slugify, destSlug, THEME_SLUG, PAGES };
})();
