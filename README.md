# kpwgen-web: Deterministic Password Generator

**Official web interface for [`@zaeniahmad/kpwgen`](https://www.npmjs.com/package/@zaeniahmad/kpwgen)** — generate **secure, reproducible passwords** with absolute consistency. As long as your inputs remain the same, the result is **bit-identical**.

> **Privacy first:** Works **100% offline** after the initial load. **No telemetry, no network calls, no secret storage.**

**🔗 Live Site:** [https://kpwgen.vercel.app](https://kpwgen.vercel.app)

---

## ✨ Features

* **Deterministic Generation** — same input → same output, always.
* **Intuitive & Responsive UI** — clean flow that guides you step by step, mobile-friendly.
* **Real-time Feedback** — password strength & validation as you type.
* **Temporary History** — review and re-copy generated passwords during the session
  *(history clears on page reload)*.
* **Secure & Private** — cryptographic ops run **entirely in your browser**.
* **Configurable** — adjust **version, length, prefix, suffix** to meet site policies.
* **Export Options** — save session history as **`.txt`** or **`.csv`** for temporary safekeeping.

---

## 🧠 How It Works

This web app wraps the core library **`@zaeniahmad/kpwgen`**. The cryptographic pipeline:

1. **Normalize** – clean the platform (e.g. `https://google.com` → `google`).
2. **Derive** – build a message from `{ platform, version, account }`.
3. **HMAC** – compute **SHA-256 HMAC** using your `masterSecret` as the key.
4. **Encode** – convert the digest into a password-friendly charset.
5. **Shape** – apply **length**, **prefix**, and **suffix** to finalize.

> All steps happen **locally** in the browser. Nothing leaves your device.

---

## 🛠 Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Core Logic:** [`@zaeniahmad/kpwgen`](https://www.npmjs.com/package/@zaeniahmad/kpwgen)
* **Icons:** lucide-react
* **Deployment:** Vercel

---

## 🔒 Security & Privacy First

* **Never hardcode secrets.** Enter your master key only when needed; it is **not stored**.
* **No server communication** after the first page load — you can go **offline** and everything still works.
* **No LocalStorage for secrets.** Your master key lives only in memory and disappears when you close the tab.

---

## 🚀 Running Locally

Clone and install:

```bash
git clone https://github.com/zaeniahmad/kpwgen-web.git
cd kpwgen-web

# choose one
npm install
# or
yarn install
# or
pnpm install
```

Start the dev server:

```bash
npm run dev
```

Open: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Quick Sanity Check (optional)

After the app loads, try:

* Enter a **master key** (≥ 8 chars)
* Set **platform** to `google`
* Keep **version** at `1`

Re-enter the same inputs — you should get the **exact same password** every time (deterministic guarantee).

---

## 📦 Exporting Session History

Use the UI buttons to export:

* **CSV** (`.csv`) — good for spreadsheets
* **Plain Text** (`.txt`) — quick copy/reference

> Exports are for **temporary use**. Don’t store secrets long-term.

---

## 📝 License

**MIT** — see [`LICENSE`](./LICENSE) for details.

---

### 🙌 Credits

Built with a security-first mindset. Big love to the open-source ecosystem and everyone pushing better password hygiene. Keep it safe, keep it deterministic.
