# Permanent Summer Voyages: website

Static website in English (root) and French (/fr/) plus photos, sitemap and SEO tags. No server and no database needed.

```
docs/     the website itself (GitHub Pages publishes this folder)
source/   the editable source and the build script that generates docs/
```

## Put it online with GitHub Pages

1. Create a new repository on GitHub, for example `permanent-summer-voyages`.
2. Upload the **whole content of this folder** (README.md, `docs/`, `source/`) to the repository. Drag and drop works.
3. In the repository, go to **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/docs**
   - Save.
4. Custom domain: in the same page, enter `permanentsummervoyages.com` and save. (`docs/CNAME` already contains it.)
5. In Cloudflare → DNS, add these records, all set to **DNS only** (grey cloud) so GitHub can issue the HTTPS certificate:
   - `A` · `@` → `185.199.108.153`
   - `A` · `@` → `185.199.109.153`
   - `A` · `@` → `185.199.110.153`
   - `A` · `@` → `185.199.111.153`
   - `CNAME` · `www` → `permanentsummer.github.io`
6. Back in Settings → Pages, tick **Enforce HTTPS** once it becomes available (can take up to an hour).
7. In Cloudflare, turn off **Scrape Shield → Email Address Obfuscation** for this domain, otherwise the email shown on the site gets rewritten.

The pages use relative links, so the site also works at `https://<username>.github.io/permanent-summer-voyages/` before the domain is connected. The custom 404 page only looks right on the custom domain.

## After going live

- Add the site to **Google Search Console** and submit `https://permanentsummervoyages.com/sitemap.xml`.
- If the final domain is different from `permanentsummervoyages.com`, the canonical URLs, sitemap and social previews must be regenerated: run the build with the new domain (see below), or ask Claude to rebuild.

## Adding content later

- Offers: add real offers to `OFFERS` in `source/data.js` (the section appears automatically).
- Traveller videos: add entries to `AMBASSADORS` with vertical MP4s in `docs/videos/`; the Travellers page and menu link come back automatically.
- Case studies: add real ones to `CASES`.
- Facebook and Instagram links: `social` in `source/data.js`.

## Updating content

All text that changes often (offers, hot destinations, ambassadors, phone, links) is in `source/data.js`. Pages are generated from it, so after editing, rebuild:

```
cd source
npm install          # first time only
node build.cjs https://permanentsummervoyages.com
```

Then upload the updated `docs/` folder. New photos go into `docs/img/` as `.jpg`, referenced by file name (without `.jpg`) in `data.js`.
