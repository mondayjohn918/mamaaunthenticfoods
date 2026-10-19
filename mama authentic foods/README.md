# Mama Authentic Foods website

Five static pages, with no build step and no frameworks. Open `index.html`, or upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel).

- `index.html`: home
- `menu.html`: rice, soups and proteins, with "Add to order"
- `about.html`: story and how we cook
- `catering.html`: indoor and outdoor catering, with the quote form
- `contact.html`: order form, address, hours, phone
- `assets/styles.css`: all styling; colours and fonts are set at the top
- `assets/main.js`: navigation, animations, order tray, WhatsApp forms

Hosting files: `404.html` (page-not-found), `.htaccess` (Hostinger settings: 404 page, compression, caching), `robots.txt`.

## Put it on GitHub

1. On github.com, click **New repository**, name it `mama-authentic-foods`, and create it (leave "Add a README" unticked).
2. On the empty repository page, click **uploading an existing file**.
3. Open this folder, select **everything inside it** (including the `assets` folder and `.htaccess`), and drag it into the browser. Click **Commit changes**.

`.htaccess` is a hidden file on some computers. If it doesn't show up, turn on hidden files in File Explorer (View > Show > Hidden items).

## Put it on Hostinger

**Option A: upload the zip (simplest)**
1. hPanel > **Websites** > your site > **File Manager**, then open `public_html`.
2. Delete Hostinger's default `default.php` if it's there.
3. Upload `mama-authentic-foods.zip`, right-click it, choose **Extract**, and extract into `public_html`.
4. Make sure `index.html` sits directly inside `public_html`, not in a subfolder. If the files ended up in `public_html/mama-authentic-foods/`, move them up one level.

**Option B: deploy from GitHub (updates go live when you commit)**
1. hPanel > **Websites** > your site > **Advanced** > **GIT**.
2. Paste the repository URL (`https://github.com/<you>/mama-authentic-foods.git`), branch `main`, leave the directory empty, and click **Create**.
3. Click **Deploy**. Turn on auto-deployment if you want every GitHub change to go live automatically.

**After it's live:** turn on the free SSL in hPanel (Security > SSL), then uncomment the three https lines in `.htaccess`.

## Before launch: replace these placeholders

1. **Address**: search all pages for `Shop address goes here, Town, State`.
2. **Opening hours**: search for `Monday to Saturday` and `8:00am to 8:00pm`.
3. **Photos**: food photos are free Unsplash stock images (the URLs start with `images.unsplash.com`). Swap in real photos of Mama's food and shop when you have them.
4. **Copy to confirm**: the About page story and the "How we cook" points (palm oil, locust beans, covered glass display), and the dish descriptions. Edit anything that isn't true for the shop.
5. **WhatsApp**: forms and buttons send to 0806 590 6888 (`2348065906888` in `assets/main.js` and the links). Make sure that number has WhatsApp.

## How ordering works

Picking "Add to order" on the menu saves dishes in the visitor's browser. The order form on the contact page lists them, and pressing send opens WhatsApp with the whole order typed out. No server or form service is needed.
