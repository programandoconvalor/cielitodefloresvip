# Firebase Storage Migration Guide

This guide explains how to migrate tenant images from local `public/` folders to
Firebase Storage, enabling true cloud-based multi-tenancy.

---

## Current Architecture (Local Images)

Each tenant stores its assets under `public/images/tenants/{slug}/`:

```
public/images/tenants/cielitodeflores/
├── catalog/          ← product images (rewritten via catalogService)
├── services/         ← hero backgrounds, service card images, store photo
├── logo/             ← logo variants
└── payments/         ← payment method icons
```

These paths are configured in `data/tenantConfig.ts` per tenant:
```ts
catalog:  { imageBasePath: "/images/tenants/{slug}/catalog" }
services: { imageBasePath: "/images/tenants/{slug}/services", storeImageSrc: "..." }
payments: { imageBasePath: "/images/tenants/{slug}/payments" }
logo:     { basePath: "/images/tenants/{slug}/logo", desktop: "...", ... }
```

---

## Target Architecture (Firebase Storage)

Firebase Storage paths follow the same logical structure:

```
gs://your-bucket/tenants/{slug}/catalog/       ← product images
gs://your-bucket/tenants/{slug}/services/      ← hero / service card images
gs://your-bucket/tenants/{slug}/logo/          ← logo files
gs://your-bucket/tenants/{slug}/payments/      ← payment icons
```

Public download URLs follow the pattern:
```
https://storage.googleapis.com/{bucket}/tenants/{slug}/catalog/{filename}
```
or with Firebase hosting rewrite:
```
https://firebasestorage.googleapis.com/v0/b/{bucket}/o/tenants%2F{slug}%2Fcatalog%2F{filename}?alt=media
```

---

## Migration Steps

### 1. Upload images to Firebase Storage

Use the Firebase CLI or the Storage console to upload each tenant folder:

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools
firebase login

# Upload using gsutil (part of Google Cloud SDK)
gsutil -m cp -r public/images/tenants/cielitodeflores/catalog/* \
  gs://YOUR_BUCKET/tenants/cielitodeflores/catalog/

gsutil -m cp -r public/images/tenants/cielitodeflores/services/* \
  gs://YOUR_BUCKET/tenants/cielitodeflores/services/

gsutil -m cp public/images/tenants/cielitodeflores/logo/* \
  gs://YOUR_BUCKET/tenants/cielitodeflores/logo/

gsutil -m cp public/images/tenants/cielitodeflores/payments/* \
  gs://YOUR_BUCKET/tenants/cielitodeflores/payments/
```

Make all files publicly readable:
```bash
gsutil iam ch allUsers:objectViewer gs://YOUR_BUCKET
```

### 2. Update TenantConfig with Firebase URLs

In `data/tenantConfig.ts`, replace the local paths with Firebase Storage URLs:

```ts
// Before (local)
catalog: {
  imageBasePath: "/images/tenants/cielitodeflores/catalog",
},
services: {
  imageBasePath: "/images/tenants/cielitodeflores/services",
  storeImageSrc: "/images/tenants/cielitodeflores/services/Tienda.jpg",
},
payments: {
  imageBasePath: "/images/tenants/cielitodeflores/payments",
},
logo: {
  basePath: "/images/tenants/cielitodeflores/logo",
  desktop: "/images/tenants/cielitodeflores/logo/logo_ORIGINAL.png",
  ...
},

// After (Firebase Storage)
catalog: {
  imageBasePath: "https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/catalog",
},
services: {
  imageBasePath: "https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/services",
  storeImageSrc: "https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/services/Tienda.jpg",
},
payments: {
  imageBasePath: "https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/payments",
},
logo: {
  basePath: "https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/logo",
  desktop: "https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/logo/logo_ORIGINAL.png",
  mobile:  "https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/logo/logo_ORIGINAL.png",
  fallback:"https://storage.googleapis.com/YOUR_BUCKET/tenants/cielitodeflores/logo/logo_ORIGINAL.png",
},
```

No other code changes are needed — all image paths flow through
`tenantConfig` → `siteData` / `catalogService` automatically.

### 3. Switch to FirebaseTenantProvider (optional)

If you want tenant configs to live in Firestore instead of the local
`tenantConfigs` map, activate the Firebase provider:

```env
# .env.local
NEXT_PUBLIC_TENANT_PROVIDER=firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

Then populate Firestore under `tenants/{slug}` with the same fields as
`TenantConfig` (see `providers/FirebaseTenantProvider.ts` for the
Firestore field mapping).

### 4. Configure Next.js to allow external image domains

In `next.config.js`, add the Firebase Storage hostname:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/YOUR_BUCKET/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};
module.exports = nextConfig;
```

### 5. Validate and remove local image files

After confirming all images load from Firebase:

```bash
# Remove the now-redundant local tenant images
rm -rf public/images/tenants/

# Keep shared icons (used regardless of tenant provider)
# public/images/shared/ stays
```

---

## Path Mapping Reference

| Asset type | Local path | Firebase path |
|---|---|---|
| Catalog product image | `/images/tenants/{slug}/catalog/{file}` | `gs://bucket/tenants/{slug}/catalog/{file}` |
| Hero background | `/images/tenants/{slug}/services/Portada_fondo_1.jpg` | `gs://bucket/tenants/{slug}/services/Portada_fondo_1.jpg` |
| Service card image | `/images/tenants/{slug}/services/Servicio_1_Ramos.jpg` | `gs://bucket/tenants/{slug}/services/Servicio_1_Ramos.jpg` |
| Store front photo | `/images/tenants/{slug}/services/Tienda.jpg` | `gs://bucket/tenants/{slug}/services/Tienda.jpg` |
| Logo | `/images/tenants/{slug}/logo/logo_ORIGINAL.png` | `gs://bucket/tenants/{slug}/logo/logo_ORIGINAL.png` |
| Payment icon | `/images/tenants/{slug}/payments/visa.svg` | `gs://bucket/tenants/{slug}/payments/visa.svg` |
| WhatsApp icon (shared) | `/images/shared/whatsapp.png` | stays in `public/` (global asset) |

---

## Zero-Downtime Rollout Strategy

1. Upload images to Firebase Storage (step 1) while the app still serves from local paths.
2. Update `TenantConfig` URLs to point to Firebase (step 2) and deploy.
3. Verify all pages render correctly with Firebase-hosted images.
4. Remove the local `public/images/tenants/` folder in a subsequent deploy.
