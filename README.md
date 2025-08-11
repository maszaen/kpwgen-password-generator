Password Gen

- **100% client-side**: master key dimasukkan user, tidak disimpan, tidak ada request ke server.
- **Deterministic, keyed**: HMAC-SHA256 (Web Crypto) → base32 → posisi noise & simbol deterministik.
- **UI**: flat black/white, grey borders, minimal.
- **Static export**: `next export` → bisa host di mana saja (GitHub Pages, Netlify, dll.).

## Jalankan
```bash
pnpm i # atau npm i / yarn
cp .env.example .env.local
pnpm dev
```

## Build static
```bash
pnpm build && pnpm export
# output di ./out
```

## Keamanan
- **Jangan** menaruh master key di `.env` karena variable NEXT_PUBLIC_* akan dibundle ke client.
- Semua logika berjalan di browser. Tutup tab setelah pakai.
- Untuk akun kritikal, tetap aktifkan 2FA/hardware key.