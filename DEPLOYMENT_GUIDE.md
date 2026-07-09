# 🚀 Task 799 - Final Production Deployment & Domain Linking Guide

This guide provides step-by-step instructions to deploy the MERN Stack Auction Platform to production and link a custom domain.

---

## Phase 1: Backend Deployment (Render / Heroku / DigitalOcean)

### 1. Environment Variables Setup
Ensure your production environment variables are configured securely on your hosting provider:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/auction_prod?retryWrites=true&w=majority
JWT_SECRET=generate_a_very_long_secure_random_string
JWT_EXPIRE=7d
CLIENT_URL=https://your-custom-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 2. MongoDB Atlas Configuration
1. Go to your MongoDB Atlas Dashboard.
2. Under **Network Access**, ensure you allow connections from your hosting provider's IP addresses (or allow access from anywhere `0.0.0.0/0` if using a dynamic IP host like Render/Heroku).
3. Ensure your database user has strong credentials.

### 3. Build & Deploy
1. The backend `package.json` already has `start: "node server.js"`.
2. Connect your GitHub repository to your host (e.g., Render Web Service).
3. Set the Root Directory to `backend`.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `npm start`.

### 4. Security Verification
- **Helmet** is enabled in `server.js` to set HTTP security headers.
- **CORS** is configured to strictly allow traffic only from `CLIENT_URL`.
- **Rate Limiting** is active to prevent DDoS and brute-force attacks on API endpoints.

---

## Phase 2: Frontend Deployment (Vercel / Netlify)

### 1. API URL Configuration
Create a `.env.production` file in your frontend repository or set the variable directly in Vercel/Netlify dashboard:
```env
VITE_API_URL=https://api.your-custom-domain.com/api
```

### 2. Production Build
1. Connect your GitHub repository to Vercel/Netlify.
2. Set the Root Directory to `frontend`.
3. The Build Command should be `npm run build`.
4. The Output Directory should be `dist`.
5. Deploy the application.

### 3. Responsive UI Check
Once deployed on the Vercel/Netlify generated URL, test the platform on:
- Desktop (1080p / 4K)
- Tablet (iPad Pro, iPad Mini)
- Mobile (iPhone, Android devices)
Ensure the responsive grid system (`index.css`) collapses correctly.

---

## Phase 3: Custom Domain Linking

### 1. Domain Registration & Setup
1. Purchase a domain from providers like Namecheap, GoDaddy, or Cloudflare.
2. (Recommended) Route your domain through Cloudflare for free SSL and DDoS protection.

### 2. DNS Configuration
You will need to set up two DNS records.

**For the Frontend (Main Domain):**
- **Type:** CNAME
- **Name:** `@` (or `www`)
- **Target:** `cname.vercel-dns.com` (if using Vercel)

**For the Backend (Subdomain):**
- **Type:** CNAME
- **Name:** `api`
- **Target:** `your-app.onrender.com` (if using Render)

### 3. SSL Certificate Setup
- If using Vercel/Netlify and Render, SSL certificates are generated automatically via Let's Encrypt.
- If using Cloudflare, ensure your SSL/TLS encryption mode is set to **Full (strict)**.

### 4. Deployment Verification Checklist
- [ ] Navigate to `https://your-custom-domain.com` - Does the UI load?
- [ ] Attempt to Login/Register - Does it successfully communicate with `https://api.your-custom-domain.com`?
- [ ] Open Browser DevTools -> Network Tab. Ensure there are no CORS errors.
- [ ] Open Browser DevTools -> Application Tab. Ensure the JWT token is being stored correctly.
- [ ] Check HTTP Headers. Ensure `Strict-Transport-Security` and other Helmet headers are present on API responses.
