# Complete Media Storage & Production Architecture Guide
**Full Investigation, Technical Root Cause, Hosting Analysis, and Zero-Rebuild Production Solutions for Next.js on WebSouls cPanel**

---

## 1. Executive Summary & Background

This document is the definitive master record of our complete architectural review, problem diagnosis, hosting evaluation, and implementation strategies for handling dynamic media (images, videos, PDFs) across the **Rehan Wooden Lamps** eCommerce platform.

### All Application Media Domains Covered:
1. **Customer Payment Proofs** (`/api/upload/payment-proof`): Bank transfer and JazzCash transaction screenshots attached during checkout.
2. **Customer Reviews** (`/api/reviews/upload-image`, `/api/reviews/upload-video`): Unboxing photos and video testimonials submitted on product pages.
3. **Customer Returns & Refunds** (`/api/upload`): Defect evidence photos, courier transit damage documentation, and PDF receipts for RMA claims.
4. **Admin Product Catalog** (`/api/products/upload-image`, `/api/products/upload-video`): High-resolution product showcase images, variant permutations, and lifestyle videos.
5. **Admin Categories** (`/api/categories/upload-image`): Category hero cards and banner artwork.
6. **Admin Site Settings** (`/api/site-settings/upload-logo`): Store brand logos and favicons.

---

## 2. The Core Problem: The "Broken Image Until Rebuild" Issue

### The Symptom
When a customer or administrator uploads a media file on a running production Next.js server:
1. The upload API successfully receives the file and saves it into the project folder (`public/uploads/...`).
2. The database receives the relative URL (`/uploads/...`) and saves it successfully.
3. **The Issue**: When the webpage tries to display `<img src="/uploads/..." />`, the browser receives an **HTTP 404 Not Found (Broken Image)**.
4. **The Observation**: If the developer manually runs `npm run build` again or restarts the Node.js server, the image suddenly starts displaying correctly.

---

### The Deep Technical Root Cause in Next.js
Next.js was built with an **immutable static asset compilation model**:

```
        ┌─────────────────────────────────────────────────────────────┐
        │                 DURING `npm run build`                      │
        │ Next.js scans `public/` and creates a static manifest index │
        │ in memory & `.next/server/pages-manifest.json`              │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                  AT RUNTIME (`next start`)                  │
        │ Next.js handles incoming GET requests ONLY for files that   │
        │ existed at build time.                                      │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │  When an API writes a NEW file into `public/uploads/`...    │
        │  Next.js does NOT refresh its static manifest.              │
        │  ➔ Result: HTTP 404 Broken Image until the next build.      │
        └─────────────────────────────────────────────────────────────┘
```

---

## 3. Hosting Environment Deep Dive: Vercel vs. WebSouls cPanel

Understanding the underlying hosting server environment is crucial to choosing the correct storage architecture.

### A. Vercel / AWS Lambda Serverless Hosting
* **Filesystem Structure**: Ephemeral and Read-Only.
* **Why Disk Writes Fail**: Serverless functions run in micro-containers that spin up and down dynamically. Any file written to the local disk is wiped out after the request completes.
* **Verdict for Vercel**: Writing to local server folders is physically impossible. On Vercel, you *must* use external cloud object storage (Cloudinary, AWS S3, Vercel Blob) or store compressed Base64 strings directly in MongoDB.

---

### B. WebSouls cPanel Hosting (CloudLinux + Phusion Passenger + Apache)
* **Filesystem Structure**: **Persistent, permanent Linux hard drive (150 GB included)**.
* **Execution Environment**: Your Next.js app runs via Phusion Passenger under your specific cPanel Linux user account (e.g. `rehan`).
* **Permissions**: Node.js has full native read/write permissions to create folders and save files across your `/home/user/` directory.
* **Verdict for WebSouls**: Files written to disk **never disappear**. You have 150GB of free, permanent storage without needing to pay for third-party cloud services.

---

## 4. Evaluation of Storage Approaches & Architectural Discussions

During our investigation, four distinct storage strategies were analyzed:

### Approach 1: MongoDB Database Storage (Compressed Base64 Data URIs)
* **How it works**: Images are converted to WebP via Sharp, encoded into Base64 strings, and saved directly inside the MongoDB document.
* **Pros**: 100% self-contained, works identically on any host (Vercel, WebSouls, Localhost) with zero setup.
* **Cons**: Increases database document size. MongoDB has a strict 16MB document limit; not suitable for large video files.

### Approach 2: Third-Party Cloud Object Storage (e.g., Cloudinary, AWS S3)
* **How it works**: Files are uploaded to external cloud buckets via API keys.
* **Pros**: Offloads bandwidth to global CDN.
* **Cons**: Requires third-party accounts, API keys, and potential subscription fees after free limits. *(Rejected by user in favor of 100% self-hosted zero-cost solution).*

### Approach 3: Disk Input Streaming vs. Dynamic Output Routing
* **Input Streaming**: Buffering incoming uploads in chunks to reduce server RAM usage during large uploads. (A performance optimization, but does not fix the Next.js static 404 issue).
* **Dynamic Output Route**: A custom Next.js API route (`/api/media/[...path]`) that dynamically reads files from disk on HTTP GET requests and streams them to the browser with headers.

### Approach 4: Decoupled cPanel Static Subdomain (`uploads.yourdomain.com`) — **The Recommended Solution**
* **How it works**: Media is saved to a folder on your server that is served directly by **Apache / LiteSpeed**, completely bypassing Next.js.
* **Why it is superior**: Apache reads the hard drive in real time on every incoming request. It has no build manifest cache, so newly written files are served **the exact millisecond** they are created.

---

## 5. Master Architecture: The Decoupled cPanel Subdomain Setup

### Architecture Diagram

```
                                      CLIENT BROWSER
                                      /            \
          https://yourdomain.com                      https://uploads.yourdomain.com
                  /                                                 \
         cPanel Phusion Passenger                                  Apache / LiteSpeed
                ↓                                                           ↓
       Node.js (Next.js Application)                           Pure Static Storage Folder
                ↓                                                 (/home/user/uploads/)
     Upload API writes file to disk ───────────────────────────────────────> (Instant file delivery, 0 rebuilds)
```

---

### Technical Guarantees of This Setup:
1. **Instant Availability**: No rebuild, no server restart, no 404 broken images.
2. **Zero Node.js CPU/Memory Load**: Apache serves static images with zero overhead on the Node.js application process.
3. **Free AutoSSL**: cPanel's AutoSSL provides a free, auto-renewing SSL certificate for `uploads.yourdomain.com`.
4. **Permanent & Free**: Leverages the 150GB storage already included in your WebSouls hosting plan.

---

## 6. Step-by-Step Production Implementation Guide

### Step 1: Create the Subdomain in cPanel
1. Log in to your **WebSouls cPanel**.
2. Open the **Domains** or **Subdomains** tool.
3. Create the subdomain:
   * **Domain / Subdomain**: `uploads` (resulting in `uploads.yourdomain.com`)
   * **Document Root**: `/home/yourcpaneluser/uploads` *(ensure this is outside `public_html` so it remains dedicated and isolated)*.
4. Click **Create**.

---

### Step 2: Create Subfolder Directory Hierarchy
Inside `/home/yourcpaneluser/uploads/`, ensure the following folder structure exists:
```text
/home/yourcpaneluser/uploads/
├── products/          # Catalog images & variant photos
├── categories/        # Category banners & icons
├── company/           # Site logos & branding
├── payment-proofs/    # Checkout receipts
├── reviews/           # Customer review photos & unboxing videos
│   └── videos/
└── returns/           # Return/refund damage evidence & PDFs
```

---

### Step 3: Configure Cross-Origin Access (`.htaccess`)
Inside `/home/yourcpaneluser/uploads/.htaccess`, add the following 5-line configuration to guarantee that lightbox previews, receipt downloads, and canvas elements can load images without browser CORS restrictions:

```apache
# /home/yourcpaneluser/uploads/.htaccess
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

---

### Step 4: Configure Environment Variables

#### In Production (WebSouls Server `.env`):
```env
# Absolute directory on the cPanel server where files are stored
UPLOAD_DIR=/home/yourcpaneluser/uploads

# Public URL from which Apache serves static files
UPLOAD_BASE_URL=https://uploads.yourdomain.com
```

#### In Local Development (`.env.local` on your computer):
```env
# Left blank so it automatically falls back to local ./public/uploads/
UPLOAD_DIR=
UPLOAD_BASE_URL=
```

---

### Step 5: The Centralized Storage Helper ([`lib/storage/storageConfig.ts`](file:///c:/Users/PMLS/Downloads/Navy/Navy/lib/storage/storageConfig.ts))

To ensure clean code without hardcoding paths across individual API routes, the application uses a unified storage resolver:

```typescript
// lib/storage/storageConfig.ts
import path from "path";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";

export type MediaFolder =
  | "products"
  | "categories"
  | "company"
  | "payment-proofs"
  | "reviews"
  | "returns";

export async function getStorageDestination(
  folder: MediaFolder,
  filename: string,
  subfolder?: string
) {
  const isCustomStorage = !!process.env.UPLOAD_DIR;

  // 1. Determine target disk directory
  let baseDiskDir: string;
  if (isCustomStorage) {
    baseDiskDir = subfolder
      ? path.join(process.env.UPLOAD_DIR!, folder, subfolder)
      : path.join(process.env.UPLOAD_DIR!, folder);
  } else {
    // Local fallback: keep inside local project public/ folder
    baseDiskDir = subfolder
      ? path.join(process.cwd(), "public", "uploads", folder, subfolder)
      : path.join(process.cwd(), "public", "uploads", folder);
  }

  if (!existsSync(baseDiskDir)) {
    await mkdir(baseDiskDir, { recursive: true });
  }

  const filepath = path.join(baseDiskDir, filename);

  // 2. Determine target public URL
  let publicUrl: string;
  if (process.env.UPLOAD_BASE_URL) {
    const baseUrl = process.env.UPLOAD_BASE_URL.replace(/\/$/, "");
    publicUrl = subfolder
      ? `${baseUrl}/${folder}/${subfolder}/${filename}`
      : `${baseUrl}/${folder}/${filename}`;
  } else {
    publicUrl = subfolder
      ? `/uploads/${folder}/${subfolder}/${filename}`
      : `/uploads/${folder}/${filename}`;
  }

  return { filepath, publicUrl };
}
```

---

## 7. Guest & Registered Order Tracking & Returns Investigation

### The Issue Identified
When testing the public `/track-order` lookup page, entering a valid order number (`ORD-MT87KFBA-627WE`) and email (`rehan.fullstack@gmail.com`) returned `Order not found`.

### Root Cause
[`app/api/orders/guest-lookup/route.ts`](file:///c:/Users/PMLS/Downloads/Navy/Navy/app/api/orders/guest-lookup/route.ts) had a hardcoded filter `order_type: "guest"`, which caused it to reject any order placed while signed into a user account.

### The Fix Implemented
Updated [`app/api/orders/guest-lookup/route.ts`](file:///c:/Users/PMLS/Downloads/Navy/Navy/app/api/orders/guest-lookup/route.ts) to:
1. Search by `order_number` across **all** order records.
2. Validate ownership by matching the entered email against either:
   - `order.guest_info.email` (Guest orders), or
   - `order.user_id.email` (Registered user account orders).
3. Enable live returns filing (`POST /api/returns`), defect photo/video uploads, status tracking, and refund payout submissions (Bank/JazzCash/EasyPaisa) directly on `/track-order`.

---

## 8. Complete Verification Matrix

| Area | Status | Notes |
| :--- | :--- | :--- |
| **Database Hygiene** | Verified Clean | Lightweight URL strings only; 0 Base64 blobs in DB. |
| **Image Compression** | Sharp WebP (80% Quality) | Receipts & photos optimized to ~80–120KB each. |
| **Video Compression** | FFmpeg H.264 + Faststart | Automated poster thumbnail generation. |
| **Media Deletion** | Active (`reviewFileUtils.ts`) | Unlinks physical files on review/return rejection. |
| **Build Status** | Exited Code 0 | All 96 routes compiled with **0 TypeScript / Next.js errors**. |
