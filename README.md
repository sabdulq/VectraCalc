# VectraCalc Website

The website for **vectracalc.com** — company homepage plus a dedicated section for each app.
Hosted free on **GitHub Pages** with the domain from **Namecheap**.

## Site structure

```
/                                   → Company homepage (about, apps, contact form)
/contact/                           → Contact page (form + email + socials)
/faq/                               → Company FAQ
/all-in-one-calculator/             → VectraCalc: All-in-One Calculator (app page)
/all-in-one-calculator/privacy/     → App privacy policy
/all-in-one-calculator/delete-data/ → App data-deletion page
/privacy/ and /delete-data/         → Old URLs; auto-redirect to the new app URLs
/404.html                           → Custom "page not found"
```

When you add a second app, copy the `all-in-one-calculator` folder pattern:
create `/your-new-app/index.html`, add a card for it in the Apps section of the
homepage, and add its URLs to `sitemap.xml`.

---

## 1. Activate the contact form (2 minutes, do this first)

The form on the homepage and `/contact/` uses **Formspree** (free: 50 messages/month).

1. Go to <https://formspree.io> → sign up with **vectracalc@gmail.com**.
2. Click **New form**, name it "VectraCalc website", and copy the form's ID —
   it looks like `mqkvezyz` in a URL like `https://formspree.io/f/mqkvezyz`.
3. In this repo, open **`index.html`** and **`contact/index.html`** and replace
   `YOUR_FORM_ID` with your real ID (one place in each file — search for `YOUR_FORM_ID`).
4. Commit and push. Test the form on the live site; the first submission asks you
   to confirm your email once.

Until you do this, the form politely tells visitors to email you instead — nothing breaks.

## 2. Set your real Instagram / X handles

Placeholder links currently point to `instagram.com/vectracalc` and `x.com/vectracalc`.
When your handles are ready, search for `instagram.com/` and `x.com/` in:

- `index.html` (footer icons + contact section + the JSON-LD `sameAs` block near the top)
- `contact/index.html`
- `faq/index.html` (one link in an answer)

and update the URLs and the visible `@vectracalc` text if different.

## 3. Push the site to GitHub

From this folder (it already contains your git history):

```bash
git add -A
git commit -m "Restructure site: company homepage + app section"
git push origin main
```

In the GitHub repo → **Settings → Pages**, confirm:

- **Source:** Deploy from a branch → `main` → `/ (root)`
- **Custom domain:** `www.vectracalc.com` (the `CNAME` file in the repo keeps this set)
- **Enforce HTTPS:** checked (may take a few minutes to become available after DNS checks pass)

The site updates automatically ~1–2 minutes after every push.

## 4. Namecheap DNS for the main domain (recap)

Namecheap → Domain List → **vectracalc.com** → **Advanced DNS**. You need exactly these:

| Type  | Host | Value                 |
|-------|------|-----------------------|
| A     | @    | 185.199.108.153       |
| A     | @    | 185.199.109.153       |
| A     | @    | 185.199.110.153       |
| A     | @    | 185.199.111.153       |
| CNAME | www  | `sabdulq.github.io.`  |

(The four A records make `vectracalc.com` work; the CNAME makes `www.vectracalc.com`
work. GitHub then redirects the bare domain to `www` automatically. Delete any
Namecheap "URL Redirect" or "Parking" records for @ or www if present.)

## 5. How to add a subdomain (step-by-step)

You don't need subdomains for the current site — every page lives on
`www.vectracalc.com/...`, which is best for Google ranking. But if you ever want one
(examples below use `calc.vectracalc.com` for the app, and `contact.vectracalc.com`
as a company example), here is the complete recipe.

> **Important GitHub Pages rule:** one repository = one custom domain.
> Every subdomain needs its **own** GitHub repository.

### Example A — `calc.vectracalc.com` (a subdomain for the All-in-One Calculator)

**On GitHub:**

1. Create a new **public** repository, e.g. `vectracalc-calc`.
2. Put the app site files in it (you could move the contents of
   `all-in-one-calculator/` there — `index.html` at the repo root, plus its
   `privacy/` and `delete-data/` folders, and copies of the shared images:
   `favicon.svg`, `apple-touch-icon.png`, `og-image.png`, `google-play-badge.svg`).
3. Add a file named `CNAME` (no extension) at the repo root containing exactly:
   ```
   calc.vectracalc.com
   ```
4. Repo → **Settings → Pages** → Source: `main` branch, `/ (root)`.
5. In the **Custom domain** box type `calc.vectracalc.com` → Save.

**On Namecheap** (Domain List → vectracalc.com → Advanced DNS → Add New Record):

| Type  | Host   | Value                | TTL       |
|-------|--------|----------------------|-----------|
| CNAME | `calc` | `sabdulq.github.io.` | Automatic |

That single CNAME record is all the DNS you need. Wait 10–30 minutes (up to a few
hours worst case), then go back to GitHub Pages settings — the DNS check turns green.
Tick **Enforce HTTPS** once it's offered. Done: `https://calc.vectracalc.com` is live.

### Example B — `contact.vectracalc.com` (a subdomain for the company contact page)

Identical recipe, different names:

1. New public repo, e.g. `vectracalc-contact`, containing `contact/index.html`
   moved to the repo root as `index.html` (plus the shared icon files).
2. `CNAME` file in that repo containing `contact.vectracalc.com`.
3. GitHub → Settings → Pages → enable, custom domain `contact.vectracalc.com`.
4. Namecheap → Advanced DNS → add: **CNAME | Host `contact` | Value `sabdulq.github.io.`**
5. Wait for DNS, enable HTTPS.

The pattern for any future subdomain is always the same:
**new repo + CNAME file + Pages enabled + one CNAME record on Namecheap** (Host =
the subdomain part, Value = `sabdulq.github.io.`).

> **Why we didn't do this for every page:** Google treats each subdomain as a
> semi-separate site, so splitting pages across subdomains fragments your search
> ranking, and each one is a separate repo to maintain. Paths on one domain
> (what this site uses) is the professional standard.

## 6. Get the site on Google

1. Go to <https://search.google.com/search-console> → **Add property** →
   choose **Domain** → enter `vectracalc.com`.
2. Search Console shows a TXT record. In Namecheap → Advanced DNS → Add New Record →
   **TXT Record**, Host `@`, Value = the string Google gives you → Save, then click
   **Verify** back in Search Console (may take a few minutes).
3. In Search Console → **Sitemaps** → submit: `https://www.vectracalc.com/sitemap.xml`
4. Optional but useful: use **URL Inspection** on `https://www.vectracalc.com/` and
   `https://www.vectracalc.com/all-in-one-calculator/` → **Request indexing**.

Expect the homepage to be indexed within a few days to two weeks. Searches for
"VectraCalc" will find you first; generic terms like "offline calculator app" take
longer and improve as the site gains links (your Google Play listing linking to the
site helps a lot).

### "Google still shows the old page / wrong description"

Right after you deploy, Google will still show the **old** single-page result with
the old description, because it hasn't re-crawled yet. This is normal and temporary.
Each page now has its own distinct title and description:

- **Homepage** (`/`) — title "VectraCalc — Offline-First Apps…", company description.
- **App page** (`/all-in-one-calculator/`) — title "VectraCalc: All-in-One Calculator…",
  the 209-calculators description.

To make Google pick up the split faster, after deploying use **URL Inspection** in
Search Console on **both** URLs above and click **Request indexing** for each. Within
a few days to ~2 weeks:

- Searching **"vectracalc"** → homepage shows first (correct — it's your brand page).
- Searching **"vectracalc all in one calculator"** → the app page shows, because it's
  the only page whose title, URL, and content all match that phrase. Google decides
  final ranking, but the new structure gives the app page every signal to win that query.

You cannot force which page ranks #1 — that's Google's call — but separate pages with
separate descriptions (which you now have) is exactly what makes the app query land on
the app page instead of the homepage.

## 7. When you publish on Google Play

Use these URLs in Play Console:

- **Website:** `https://www.vectracalc.com/all-in-one-calculator/`
- **Privacy policy:** `https://www.vectracalc.com/all-in-one-calculator/privacy/`
- **Data deletion:** `https://www.vectracalc.com/all-in-one-calculator/delete-data/`

(The old `/privacy` and `/delete-data` URLs also still work — they redirect.)

## Editing cheat-sheet

| What                         | Where                                                  |
|------------------------------|--------------------------------------------------------|
| Company story / about text   | `index.html` → `<!-- ABOUT -->` section                |
| Add a new app card           | `index.html` → `<!-- APPS -->` section                 |
| Contact email address        | search `vectracalc@gmail.com` across all files         |
| Social links                 | see section 2 above                                    |
| Company FAQ questions        | `faq/index.html` (both the visible list and the JSON-LD block in `<head>`) |
| App page content             | `all-in-one-calculator/index.html`                     |
| Search engine URL list       | `sitemap.xml`                                          |
