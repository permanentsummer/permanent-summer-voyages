# Retreat destination batches: playbook

Goal: one well-developed company-retreat page (EN + FR) for every destination in the Hotel Explorer,
added in batches of up to 25 so Google absorbs them gradually.

## Each batch

1. Run `python3 source/tools/venue_stats.py` once with a temporary print, or read `docs/venues/*/index.html`
   ("Venue proposal / City · Country"), to list cities. Fold "X Area" into "X".
2. Candidates: cities with **5+ venues** that are not yet mapped to a retreat in `MAP` in `tools/venue_stats.py`.
   Order: Europe first (by venue count), then the rest of the world (by venue count).
   When no 5+ cities are left, go down to 3+. Stop when none are left: then report "all destinations covered".
3. Pick up to 25. Write `source/retreats-batchN.js` (next N), same shape as `retreats-batch1.js`:
   `window.RETREATS.push({ s, r, vibe, n, c, t, d, acts, stay, fly, when, prog })` (no `img`: photos come from venue data)
   and `Object.assign(window.RCOORD, { slug:[airportLat, airportLon, roadMinutesIfOver20] })`.
   Region `r` must be an existing key in `RREGIONS` (data.js). If a new region is needed (e.g. North America,
   Asia, Middle East, Latin America), add it to `RREGIONS` in data.js.
   French slug `s` (EN URL is built from `n.en`). Write genuinely specific, accurate content per place
   (real airport, real activities, real seasons). No invented facts, no prices, no response-time promises.
4. Add each new slug to `MAP` in `tools/venue_stats.py` with its venue city names. Run it.
5. Build: `cd source && npm install && npm install --no-save marked@4 && node build.cjs https://permanentsummervoyages.com`
6. **The build deletes files it did not generate (docs/venues, docs/assets venue files, docs/proposal).**
   Restore them before committing:
   `git status --short | grep '^ D' | awk '{print $2}' | xargs -r -d '\n' git checkout --`
   Then check `git status --short | grep '^ D'` is empty.
7. Check a new EN and FR page: title, H1, venue stats block, two images, FAQ.
8. Commit "Retreat destinations batch N: …" and push to main.

## Rules (from the owner)

- Never name or reveal partner hotels/venues on public pages. Venue counts and capacities only.
- Photos: venue photos only (already people-free); never reuse the same photo; no people in swimsuits; no alcohol unless wine tasting in a wine region.
- Do not change the brand logo. Do not present the agency as a family business. Do not mention Amadeus.
- No response-time promises (e.g. "within 48 h"). CTA style: "talk to our expert".
- Site opens in English by default; every page exists in EN and FR.
