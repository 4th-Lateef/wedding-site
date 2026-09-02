# Medinat & Yusuf — Wedding Website

## What's inside
```
wedding-site/
├── index.html
├── css/style.css
├── js/main.js
├── img/                 ← put your real photos here (see checklist inside)
└── README.md            ← this file
```

The guestbook now displays wishes in a **sliding carousel** — 4 per page on
desktop, 2 on tablet, 1 on mobile — with arrow buttons and dot indicators,
instead of one long stacked list.

---

## STEP 1 — Add your photos
Open `img/PLACE_YOUR_PHOTOS_HERE.txt` inside the `img` folder. It lists
every exact filename your site is already looking for (my1.jpeg,
adukemi.jpeg, etc.). Drop your real photos into `img/` using those exact
names and they'll appear automatically.

---

## STEP 2 — Set up the guestbook backend (Supabase, free)

Right now the guestbook form works, but messages only show to the person
who submitted them — they don't save anywhere, so a different visitor
won't see them. Supabase gives you a free, real database in about 5
minutes.

1. **Create your project**
   - Go to https://supabase.com → **Start your project** → sign up (GitHub
     login is fastest).
   - Click **New project**. Give it any name (e.g. "medinat-yusuf-wedding"),
     set a database password (save it somewhere), pick the region closest
     to your guests, and click **Create new project**. Takes ~1–2 minutes.

2. **Create the messages table**
   - Left sidebar → **SQL Editor** → **New query**, paste this exactly,
     then click **Run**:
     ```sql
     create table wishes (
       id uuid default gen_random_uuid() primary key,
       name text not null,
       message text not null,
       created_at timestamp with time zone default now()
     );
     alter table wishes enable row level security;
     create policy "Public read" on wishes for select using (true);
     create policy "Public insert" on wishes for insert with check (true);
     ```
   - "Success. No rows returned" means the table now exists.

3. **Copy your API credentials**
   - Left sidebar → **Project Settings** (gear icon) → **API**.
   - Copy the **Project URL** (`https://xxxxxxxxxxxxx.supabase.co`).
   - Copy the **anon public** key (long string under "Project API keys").

4. **Paste them into your code**
   - Open `js/main.js`, find (search for `SUPABASE`):
     ```js
     const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
     const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
     ```
   - Replace with what you copied, e.g.:
     ```js
     const SUPABASE_URL = 'https://abcxyzcompany.supabase.co';
     const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
     ```
   - Save the file.

Once deployed, every guest's wish saves to your Supabase database and
appears to *all* visitors in the carousel.

**Moderation option:** to approve messages before they go public:
```sql
alter table wishes add column approved boolean default false;
```
Then in `js/main.js`, add `.eq('approved', true)` to the `.select(...)`
query, and flip rows to `true` in Supabase's **Table Editor** as they
come in.

---

## STEP 3 — Put the project on GitHub

GitHub hosts your code; Netlify watches it and deploys automatically.

1. Create a free account at https://github.com if needed.
2. Click **+** (top right) → **New repository**. Name it `wedding-site`,
   Public or Private (either works), skip adding a README, click
   **Create repository**.
3. In a terminal, inside your project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial wedding site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/wedding-site.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME` with your GitHub username. No `git` installed?
   Get it at https://git-scm.com — or simpler: on your new repo's GitHub
   page, click **uploading an existing file** and drag your project folder
   in through the browser instead.

---

## STEP 4 — Deploy to Netlify

1. Go to https://app.netlify.com, sign up/log in (GitHub login makes the
   next step one click).
2. **Add new site → Import an existing project** → **GitHub** → authorize
   → select your `wedding-site` repo.
3. Leave build settings blank/default (static site, no build step) →
   **Deploy site**.
4. In ~30 seconds you get a live link like
   `https://random-name-123.netlify.app`. Open it to confirm it works.
5. **Custom domain (optional):** Site settings → **Domain management** →
   **Add a domain** (you must already own the domain — e.g. via
   Namecheap/GoDaddy). Netlify adds free HTTPS automatically.
6. **Rename the free subdomain (optional, no cost):** Site settings →
   **Change site name** → e.g. `medinat-and-yusuf.netlify.app`.

From now on, any `git push` to GitHub triggers an automatic redeploy on
Netlify within a minute — you won't need to touch Netlify again.

---

## STEP 5 — Final checks before sending the link
- [ ] All photos added to `img/` and displaying correctly
- [ ] Supabase URL + anon key pasted into `js/main.js`
- [ ] Submitted a test wish, refreshed the page, and it's still there
      (confirms Supabase is actually connected)
- [ ] Countdown date/time correct (`data-wedding-date` in `index.html`)
- [ ] Google Maps embed and "Get Directions" link point to the real venue
- [ ] Checked on your phone, not just desktop
- [ ] Leftover placeholder text replaced — search the file for `#` in
      `href` attributes and for "example" to catch anything missed
