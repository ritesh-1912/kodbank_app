# Vercel – Add These Environment Variables

Your registration returns 500 because the **API runs on Vercel** and needs database credentials. Add the variables below in Vercel so the backend can connect to MySQL.

## Steps

1. Open **[Vercel Dashboard](https://vercel.com/dashboard)** and select your **kodbank_app** project.
2. Go to **Settings** → **Environment Variables**.
3. Add each variable below. Use **Production**, **Preview**, and **Development** (or at least Production).
4. **Redeploy**: Deployments → click **⋯** on the latest → **Redeploy** (or push a new commit).

---

## Variables to add

| Name | Value | Notes |
|------|--------|--------|
| `DB_HOST` | `mysql-198b3adc-kodnestmovieapp1.i.aivencloud.com` | Your Aiven MySQL host |
| `DB_PORT` | `11092` | Aiven port |
| `DB_USER` | `avnadmin` | Aiven user |
| `DB_PASSWORD` | `AVNS_M7yo71NtHrDchGDOicw` | Your Aiven password |
| `DB_NAME` | `defaultdb` | Database name |
| `JWT_SECRET` | *(pick a long random string)* | e.g. `kodbank_jwt_secret_2024_xyz_abc_123` |
| `JWT_EXPIRY` | `24h` | Optional; default is 24h |
| `FRONTEND_URL` | `https://YOUR_VERCEL_URL.vercel.app` | **Replace** with your real app URL |
| `VITE_API_URL` | `/api` | So frontend calls same domain |

---

## Important

- **FRONTEND_URL**: After the first deploy, copy your app URL (e.g. `https://kodbank-app-xxx.vercel.app`) and set `FRONTEND_URL` to that exact value. Then redeploy.
- **VITE_API_URL**: Use `/api` when frontend and API are on the same Vercel project (same domain). No need to change unless you split frontend and backend.
- After adding or changing any variable, **redeploy** the project (new deployment or “Redeploy” from the dashboard).

---

## Check that it works

1. **Landing page:** Open `https://YOUR_VERCEL_URL.vercel.app/` – you should see the Kodbank landing page with Sign in / Create account.
2. **API health:** Open: `https://YOUR_VERCEL_URL.vercel.app/api/health`  
   You should see: `{"success":true,"message":"Kodbank API is running"}`

3. **Check if env vars reach the API:**  
   Open: `https://YOUR_VERCEL_URL.vercel.app/api/health/env`  
   You should see something like: `{"ok":true,"env":{"DB_HOST":true,"DB_PORT":true,...}}`  
   If `DB_HOST` is `false`, the variable is **not** reaching the serverless function (see below).

4. Open: `https://YOUR_VERCEL_URL.vercel.app/api/health/db`  
   - If DB is OK: `{"success":true,"message":"Database connected"}`  
   - If DB fails: you’ll see an error (e.g. connection refused). Fix the env vars and redeploy.

5. Try **Register** again.

---

## Still getting "Database connection failed (host not found) [ENOTFOUND]"?

- **1. Confirm env vars are in the right place**  
  Vercel → your **project** (e.g. kodbank_app) → **Settings** → **Environment Variables**.  
  They must be on the **same project** that serves the app.

- **2. Set them for the right environment**  
  When adding each variable, tick **Production** (and **Preview** if you use branch deployments).  
  If you only set "Preview" but you open the production URL, the API won’t see the vars.

- **3. Redeploy after adding or changing**  
  Env vars apply only to **new** deployments.  
  Go to **Deployments** → **⋯** on the **latest** deployment → **Redeploy** (or push a new commit and wait for the new deployment to finish).

- **4. Check `/api/health/env` first**  
  Open `https://YOUR_APP_URL.vercel.app/api/health/env`.  
  If it shows `"DB_HOST": false`, the function still doesn’t see `DB_HOST`.  
  Fix the steps above, then redeploy. **Root Directory** (Settings → General): leave empty so `api/` is deployed and gets env vars; if set to `frontend`, the API may not see them.
