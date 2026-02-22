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

1. Open: `https://YOUR_VERCEL_URL.vercel.app/api/health`  
   You should see: `{"success":true,"message":"Kodbank API is running"}`

2. Open: `https://YOUR_VERCEL_URL.vercel.app/api/health/db`  
   - If DB is OK: `{"success":true,"message":"Database connected"}`  
   - If DB fails: you’ll see an error (e.g. connection refused). Fix the env vars and redeploy.

3. Try **Register** again. If `/api/health/db` is OK and registration still fails, the error message on the page should give a hint (e.g. duplicate username/email).
