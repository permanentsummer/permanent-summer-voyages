# Weekly blog article — how to publish

Site: https://permanentsummervoyages.com (GitHub Pages from `docs/`, repo `permanentsummer/permanent-summer-voyages`, branch `main`).
Articles live in `source/blog/<slug>.md` (English only). The build turns them into `/blog/<slug>/` pages with BlogPosting + FAQPage data and adds them to the sitemap.

## 1. Pick the topic
- One new article per week on company retreats, offsites, team travel, destinations, activities, budgets, competitors or current news/trends for the B2B audience (HR, founders, ops, office managers).
- Research current news with web search first (new routes, events, trends, reports). Never invent statistics: only quote figures from a source you read, and name the source in the text.
- Check `source/blog/` so the topic or slug isn't already covered.
- Formats that work well (inspired by leading retreat blogs such as basejam.com/articles; take ideas only, never copy text): numbered roundups ("9 team building activities in Lisbon"), venue-type roundups without naming partner hotels ("exclusive-use venues for retreats", "retreat venues for large groups"), seasonal pieces (Christmas party ideas, best month for a retreat), one-day offsite guides, goal-setting and follow-up guides, accessibility, AI for retreat planning (and what to leave to humans), nature retreats, hybrid/remote culture.
- Topic backlog (skip any already covered): best month for a company retreat · one-day offsite guide · how to set retreat goals · how to follow up after a retreat · accessible and inclusive retreats · using AI to plan a retreat · nature retreats · exclusive-use venues · retreat venues for large groups (100+) · team building activities in Lisbon / Porto / Algarve / Barcelona · Christmas and end-of-year team events · team away day ideas · strategic planning retreat · budgeting a retreat step by step · employee wellbeing activities on a retreat.

## 2. Write the file
Front matter (all required except related/pin):
```
---
title: Human title
seo: Google title, max 60 characters
desc: Meta description, 120–160 characters
cat: guide | dest | ideas | compare | trends
date: YYYY-MM-DD (today)
cover: blNNa
coverAlt: what the cover photo shows
keyword: main search phrase
related: slug-1, slug-2, slug-3
---
```
Body rules:
- 900–1,400 words, H2/H3 structure, short paragraphs, the keyword in the first paragraph and one H2.
- At least 8 internal links using `#keys`: destinations `#retraite-algarve` (`lisbonne ericeira porto madere acores majorque barcelone seville rome toscane milan-come pouilles vienne prague budapest serbie croatie istanbul georgie marrakech taghazout athenes crete peloponnese cyclades cracovie zakopane gdansk`), events `#event-seminaire #event-team-building #event-direction #event-kickoff #event-incentive #event-client`, `#budget` (calculator), `#activites`, `#retraites`, `#comment/vols` (we book every participant's flight), `#brief`, `#appel` (call with our expert), and other articles `#post-<slug>`.
- End with a "talk to our expert" paragraph linking `#appel` (never mention "15 minutes"), then `## FAQ` with 3 `### question` + answer pairs.
- One inline photo: `![alt](blNNb)`.
- Brand rules: never relate the agency to Mauritius; no "48h" or time promises; don't emphasise Amadeus; competitors only described fairly and factually.

## 3. Photos
- Find photos with WebFetch on `https://unsplash.com/s/photos/<query>?license=free&orientation=landscape` (ask for image URLs + alt). Download from `images.unsplash.com/photo-<id>?w=2400&q=82&fm=jpg`, then `convert in.jpg -resize 2400x\> -strip -interlace Plane -quality 80 docs/img/blNNa.jpg` (next free NN).
- Look at a thumbnail before using it. Rules: **no swimsuits/swimwear** (surf wetsuits are fine), **no alcohol** unless it's wine tasting in a wine region, outdoor groups and real activities preferred, nothing that looks AI-generated.
- **Never reuse a photo**: check `source/blog/used-photos.txt` and append the new IDs.

## 4. Build, check, publish
```
npm i --prefix /tmp/psvbuild jsdom@24.1.3 marked@12.0.2
cd source && ln -sfn /tmp/psvbuild/node_modules node_modules && node build.cjs https://permanentsummervoyages.com && rm node_modules
```
- Check the build has no errors and `docs/blog/<slug>/index.html` exists; check internal links resolve (no `href="#` left in the article page).
- Commit to `main` and push. Confirm the GitHub Pages deployment succeeds (`gh api repos/permanentsummer/permanent-summer-voyages/deployments`).
