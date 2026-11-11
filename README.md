# Asset Inventory System (PLUD)

A simple, single-file asset inventory system with QR code tags. Register equipment, print QR property tags, and scan a tag with a phone camera to pull up the asset’s full record.

It runs as static pages on GitHub Pages, backed by a Supabase database, with staff-only sign-in.

## Features

- **Asset records** with name, category, condition, manufacturer, model, serial number, department, location, assignee, purchase date, supplier, invoice/PO number, purchase cost, useful life, warranty end, service dates, and notes.
- **Automatic asset IDs** (`Asset-001`, `Asset-002`, …), each with its own QR code.
- **Printable QR tags** for one asset or a whole selection, or download them as a PNG label sheet.
- **QR scanning** with the device camera, from an uploaded photo, or by typing the ID.
- **Status tracking:** Available, In use, In repair, Retired, with check-out/check-in, repair, move, service logging, and retirement actions.
- **History log** for every asset.
- **Calculated values:** current book value (straight-line depreciation), asset age, warranty status.
- **Alerts** for overdue returns, warranties ending within 30 days, and service due within 7 days.
- **Search and filters** by status, category, or any text.
- **CSV export** of the full register.
- Works on desktop and mobile, in light and dark mode.

## Modules

All modules share a left side panel (`shell.js`, `shell.css`) with links to each module, quick actions (Scan tag, Add asset) and the signed-in account. It can be collapsed to icons on desktop and opens from the menu button on phones.

- **Dashboard** (`dashboard.html`): the home page after sign-in. Greeting with quick actions (Scan tag, Import, Add asset); key figures (active assets, purchase cost, current value, utilization, needs attention); status breakdown; assets added per month and purchases per year; by category; top locations; who holds the most assets; by property with utilization; record quality (missing photos, serials, costs, locations, categories); needs attention; warranties ending; recent activity. Everything is clickable and opens the matching filtered list in the Database. Filter by property.
- **Register** (`index.html`): add and edit assets, print QR tags, scan tags, check items in and out, transfer assets between properties, log service, and view each asset’s full record and history.
- **Users** (`users.html`, admins only): **Add user** with full name, username, optional email, temporary password (auto-generated), **role** and **property access**. Edit, reset password, disable/enable and delete accounts. After adding or resetting, the sign-in details are shown once to copy and share.
  - Roles: **Admin** (everything, including users, settings, deleting assets), **Editor** (add/edit assets, photos, import, check in/out, move, transfer, service, retire, dispose; no deleting or settings), **Viewer** (view, scan, print labels, export only).
  - **Property access**: All properties, or only selected ones. Limited users only see and work with assets of their properties.
  - Limits are enforced by the database (row level security), not just hidden buttons. Admins can’t demote, limit, disable or delete themselves, and the last admin can’t be removed. Disabled accounts can’t sign in or read data.
- **Settings** (`settings.html`): the organization name, the list of **properties** (with optional address) and the **locations** inside each property. Renaming a property or location updates every asset that uses it; a property or location that still has assets can’t be deleted. The asset form’s Property and Location fields are dropdowns built from these lists, and choosing a property narrows the locations to that property.
- **Database** (`database.html`): every asset in one wide table with photo thumbnails. Search across all columns; filter by property, category, location, and status; click any column header to sort; choose which columns to show; see totals for cost and current value; export exactly what’s shown to CSV; **import** assets from a CSV or Excel file (columns are matched automatically, with a preview before saving; download a template from the import window). Click a row to open that asset in the Register.

Each asset can have a **property**, a **location** and an **actual location** (the exact spot, e.g. PAV 1), (e.g. Virgin Beach Resort, Z Hostel), **category** and **sub-category**, **brand**, and a **photo**. Photos are resized in the browser and stored privately in Supabase Storage; only signed-in staff can see them. An asset’s QR tag prints “Property of” its property.

## Scanning QR tags

Each QR tag links to a **public asset page** (`view.html`) using a random code, for example
`https://soleiyait8.github.io/Asset-Inventory-Sysm-PLUD/view.html?c=4f9a1c2e7b3d8a60`.

- **Anyone can scan, no login needed.** The page shows the photo (tap to enlarge) and four sections: Identification (ID, name, category, sub-category), Asset details (brand, model, serial number), Location & assignment (property, location, actual location, department, assigned to) and Status (status, condition).
- **Never shown publicly:** cost, current value, supplier, invoice/PO, notes, dates and history.
- **Why a random code:** asset IDs are sequential, so links using only the ID could be guessed to read every asset. The code means only someone holding the physical tag can open it. Codes are created automatically and are served by the `asset-public` Edge Function.
- **Staff who are signed in** are taken straight to the full record with all actions. Others see a “Staff: sign in for the full record” button.
- **Inside the app**, *Scan tag* reads new tags, older ID-only tags and typed IDs.
- Tags printed before the public page was added link to the staff record and need signing in; reprint them to get the public page.
- If the app moves to a different web address, update `PUBLIC_URL` in `index.html` and reprint the labels.

## How it works

- **Frontend:** static pages on GitHub Pages: `login.html` (sign-in and password reset), `index.html` (Register) and `database.html` (Database). Signed-out visitors are sent to the login page; after signing in they return to where they were, including a scanned asset.
- **Database and sign-in:** Supabase (project “Plud Asset inventory Project”).
- **Sign-in:** staff log in with a **username** and password. A small server function (`username-login`) looks up the matching email privately, so emails are never shown on the login page.
- **Access:** only staff can see or change anything. A person needs a Supabase account **and** a row on the `staff` list. Signed-out visitors and accounts not on the list get no data at all; this is enforced by the database (row level security), not just the page.
- Changes appear live on every signed-in device. Every history entry records who made it.

## Setup (one time)

### 1. Publish the site
1. In this repository, go to **Settings → Pages**.
2. Set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then **Save**.
3. The app goes live at `https://soleiyait8.github.io/Asset-Inventory-Sysm-PLUD/`

### 2. Lock down sign-ups (important)
In the Supabase dashboard, open **Authentication → Sign In / Providers** and turn **off** “Allow new users to sign up”. Staff accounts are then created only by an administrator.

### 3. Default administrator
A default account with username **`admin`** exists for the first sign-in. Its temporary password was given to the project owner (it is not stored in this repository). On first login the app requires a new password before anything else.

To make anyone change their password at next login, set `must_change_password` to `true` on their row in `staff`.

### 4. Add staff
For each person:
1. **Authentication → Users → Add user → Create new user.** Enter their real email and a password, and tick **Auto Confirm User**. (The email is used for password reset links.)
2. **Table Editor → `staff` → Insert row.** Enter the same email in **lowercase**, the **username** they will log in with, and their name (optional).

Usernames: 2–40 characters, lowercase letters, numbers, `.` `_` `-` (for example `jdelacruz`). They are not case-sensitive at login.

Or add several at once in the **SQL Editor**:
```sql
insert into public.staff (email, username, name) values
  ('juan.delacruz@example.com', 'jdelacruz', 'Juan Dela Cruz'),
  ('maria.santos@example.com',  'msantos',   'Maria Santos');
```

To remove someone’s access, delete their row from `staff` (and their user under Authentication if you like).

### 5. Set the site URL (needed for password reset emails)
In **Authentication → URL Configuration**:
- Set **Site URL** to `https://soleiyait8.github.io/Asset-Inventory-Sysm-PLUD/`
- Under **Redirect URLs**, add `https://soleiyait8.github.io/Asset-Inventory-Sysm-PLUD/**`

Without the redirect URL, “Forgot password?” links won’t return people to the login page.

## How to use

1. Open the site. You’re taken to the login page; sign in with your username and password. Forgot it? Use **Forgot password?**, enter your username, and a reset link goes to the email on your account.
2. Click **Rename** under the title to set your organization name. It prints on every tag as “Property of …”.
3. Click **Add asset** and fill in the details. A QR tag is created automatically.
4. Open an asset and choose **Print label** or **Download label**, or select several assets in the list and print them together.
5. Stick the tag on the item. Later, click **Scan tag** and point the camera at it to open its record.

Use **Export CSV** for reports or an offline backup.

## Database

The schema is in [`supabase/schema.sql`](supabase/schema.sql) and the login function in [`supabase/functions/username-login`](supabase/functions/username-login/index.ts) (both already deployed). Tables:

| Table | Purpose |
| --- | --- |
| `assets` | One row per asset; the full record is in the `data` column (JSON). `updated_by` records the last editor. |
| `staff` | Staff allowed to use the system: email, username, name. |
| `settings` | App settings such as the organization name. |
| Storage bucket `asset-photos` | Asset photos (private, staff only, max 5 MB each). |

The key in `index.html` is Supabase’s **publishable** key, which is designed to be public. Security comes from the database rules. Never put the **secret** (service role) key in this repository.

## Libraries

Loaded from the jsDelivr CDN:

- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 for making QR codes
- [jsQR](https://github.com/cozmo/jsQR) 1.4.0 for reading QR codes
- [Archivo](https://fonts.google.com/specimen/Archivo) font from Google Fonts
