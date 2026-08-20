# Navy E-Commerce → Client E-Commerce Conversion Plan

## Project Overview

Converting a full-featured e-commerce platform into a simplified, client-specific e-commerce site based on [lampandglow.com](https://www.lampandglow.com/).

**Approach:** Copy the existing codebase → Remove unnecessary features → Simplify existing features → Add required new features.

**Focus:** Functionality first, design later.

---

## Tech Stack (Unchanged)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS 3 + Flowbite React |
| Database | MongoDB + Mongoose 8 |
| Deployment | Vercel |

---

## Conversion Steps

### Step 1: Project Backup & Initialization
**Status:** ✅ DONE
**Description:** Create a clean copy of the project, initialize git with the new GitHub account, and set up the initial README.
**Details:**
- ~~Copy entire project to a new working directory~~ — Already a copy, original safe in main account
- ~~Initialize git repo with new account credentials (fullstackdev.rehan01@gmail.com)~~ — Already configured
- ~~Create initial README with this plan~~ — Created with full 15-step plan
- ~~Verify the copy runs correctly~~ — node_modules present, git configured, remote connected
**Files Affected:** Project root, README.md
**Verification:** ✅ Git config correct, remote set, dependencies installed, on main branch

---

### Step 2: Remove Firebase Auth → Implement Simple JWT Auth
**Status:** ✅ DONE
**Description:** Remove Firebase authentication entirely and implement a simple, secure email/password authentication system.
**Details:**
- ~~Remove Firebase client SDK~~ — Deleted `firebaseClient.js`, `firebaseAdmin.js`, `clientAuth.js`
- ~~Remove Firebase Admin SDK~~ — Deleted
- ~~Remove Firebase auth utilities~~ — Replaced with JWT-based auth in `lib/firebase/auth.js`
- ~~Remove Google OAuth sign-in option~~ — Removed from sign-in/sign-up pages
- ~~Remove email verification flow~~ — Simplified verify-email page
- ~~Install `bcryptjs` for password hashing and `jsonwebtoken` for JWT tokens~~ — Installed
- ~~Update User model: remove `firebase_uid`, add `password` field (hashed)~~ — Updated
- ~~Create auth API routes~~ — Created `/api/auth/signup`, `/api/auth/signin`, `/api/auth/logout`, `/api/auth/me`
- ~~Create HTTP-only cookie-based session~~ — JWT stored in localStorage + `__session` cookie
- ~~Update UserContext.js to use new auth endpoints~~ — Rewritten with `login()` and `logout()` functions
- ~~Update sign-in page~~ — Email/password only, no Google
- ~~Update sign-up page~~ — Name, email, password only
- ~~Update admin layout auth check~~ — Uses `withRoleAccess` HOC from updated UserContext
- ~~Remove Firebase packages~~ — Uninstalled `firebase`, `firebase-admin`, `@firebase/auth`
- Rewrote `lib/firebase/auth.js` to use JWT — keeps all 70+ API routes working without import changes
- Updated Header, AdminSidebar, AccountPage, CustomersPage, ProfileTab, AccountPage
- Fixed 2 address routes that imported directly from `firebaseAdmin`
- Build compiles successfully
**Files Affected:**
- `lib/firebase/firebaseClient.js` (deleted)
- `lib/firebase/firebaseAdmin.js` (deleted)
- `lib/firebase/clientAuth.js` (deleted)
- `lib/firebase/auth.js` (rewritten — JWT-based)
- `app/models/User.js` (updated — added password field)
- `app/context/UserContext.js` (rewritten)
- `app/api/auth/signup/route.js` (new)
- `app/api/auth/signin/route.js` (new)
- `app/api/auth/logout/route.js` (new)
- `app/api/auth/me/route.js` (new)
- `app/sign-in/page.js` (rewritten)
- `app/sign-up/page.jsx` (rewritten)
- `app/logout/page.js` (rewritten)
- `app/verify-email/page.tsx` (simplified)
- `app/components/Header.tsx` (updated)
- `app/(admin)/components/AdminSidebar.tsx` (updated)
- `app/(public)/pages/AccountPage.tsx` (updated)
- `app/(admin)/pages/customers/CustomersPage.tsx` (updated)
- `app/components/account/ProfileTab.tsx` (updated)
- `app/components/email-verification-banner.tsx` (simplified)
- `app/api/users/addresses/route.js` (fixed import)
- `app/api/users/addresses/[id]/route.js` (fixed import)
- `package.json` (removed firebase packages, added bcryptjs + jsonwebtoken)
**Verification:** ✅ Build compiles successfully, no Firebase SDK imports remain in app code

---

### Step 3: Remove Multi-Currency → PKR Only
**Status:** ✅ DONE
**Description:** Remove the entire currency conversion system. Hardcode PKR as the only currency throughout the application.
**Details:**
- ~~Remove CurrencyContext (`app/context/CurrencyContext.tsx`)~~ — Removed
- ~~Remove CurrencySelector component (`app/components/shared/CurrencySelector.tsx`)~~ — Removed
- ~~Remove CurrencySettings model (`app/models/CurrencySettings.ts`)~~ — Removed
- ~~Remove currency API routes (`app/api/currency-settings/*`)~~ — Removed
- ~~Update all price displays to show PKR format (e.g., "Rs. 2,500")~~ — Updated via `lib/utils/formatPrice.ts`
- ~~Create a shared `formatPrice.ts` utility that formats PKR~~ — Created using `Intl.NumberFormat`
- ~~Remove CurrencyProvider from layouts~~ — Removed from `ClientProviders.tsx` and `ConditionalLayout.jsx`
- ~~Remove CurrencySelector from Header~~ — Removed
- ~~Update all components using `useCurrency()` to use `formatPrice` from `lib/utils`~~ — Updated 21+ files
- ~~Clean up PreferencesTab~~ — Removed currency selector, kept language/timezone
- ~~Clean up admin SiteSettings~~ — Removed CurrencySettings tab and import
- ~~Clean up invoice route~~ — Removed CurrencySettings import and conversion logic
- ~~Clean up user update/profile routes~~ — Removed CurrencySettings import and validation
- Removed `preferred_currency` updates from user routes (field still in DB for backward compat)
**Files Affected:**
- `app/context/CurrencyContext.tsx` (deleted)
- `app/components/shared/CurrencySelector.tsx` (deleted)
- `app/models/CurrencySettings.ts` (deleted)
- `app/(admin)/components/site-settings/CurrencySettings.tsx` (deleted)
- `app/api/currency-settings/*` (deleted — 2 routes)
- `lib/utils/formatPrice.ts` (new utility)
- `app/ClientProviders.tsx` (removed CurrencyProvider)
- `app/ConditionalLayout.jsx` (removed CurrencyProvider)
- `app/components/Header.tsx` (removed CurrencySelector import)
- `app/components/account/PreferencesTab.tsx` (rewritten — no currency selector)
- `app/components/account/ProfileTab.tsx` (updated total_spent format)
- `app/(admin)/pages/site-settings/SiteSettingsPage.tsx` (removed currency tab)
- `app/api/users/update/route.js` (removed CurrencySettings validation)
- `app/api/users/profile/route.ts` (removed CurrencySettings validation)
- `app/api/orders/[id]/invoice/route.ts` (removed currency conversion)
- `app/(public)/pages/ProductDetailPage.tsx` (updated prices)
- `app/components/product/ProductCard.tsx` (updated prices)
- `app/components/product-detail/ProductInfo.tsx` (updated prices)
- `app/components/product-detail/VariantSelectionModal.tsx` (updated prices)
- `app/components/product/ProductFilters.tsx` (removed currency conversion)
- All cart/checkout/order components (updated `formatPrice` calls)
**Verification:** ✅ Build compiles successfully, all prices display in PKR, no currency selector visible, no currency-related errors

---

### Step 4: Remove Homepage Management System + Dropshipping
**Status:** ✅ DONE
**Description:** Remove the dynamic homepage component system, hero slider management, promotional banner management, and all AliExpress/CJ Dropshipping functionality.
**Details:**
- ~~Remove HeroSlider model, API routes, admin pages, admin components~~ — Removed
- ~~Remove PromotionalBanner model, API routes, admin pages, admin components~~ — Removed
- ~~Remove BannerDisplay component~~ — Removed
- ~~Remove homepage-related types (`types/banner.types.ts`)~~ — Removed
- ~~Clean up admin sidebar: remove Hero Slider, Promotional Banners, Dropshipping sections~~ — Cleaned
- ~~Remove hero slider images from `public/hero-slider/`~~ — Removed
- ~~Remove promotional banner images from `public/promotional-banners/`~~ — Removed
- ~~Remove AliExpress model, API routes, admin pages, admin components, lib files~~ — Removed completely
- ~~Remove CJ Dropshipping model, API routes, admin pages, admin components, lib files~~ — Removed completely
- ~~Remove aliexpress/cj fields from Product schema and types~~ — Cleaned
- ~~Remove aliexpressSkuId/aliexpressSkuAttr from variant types and components~~ — Cleaned
- ~~Remove Bulk Upload functionality (CSV/Excel import tied to dropshipping)~~ — Removed
- ~~Clean up `lib/api/home.ts` (remove hero slider functions)~~ — Cleaned
- ~~Clean up `lib/api/products.ts` (remove bulk upload functions)~~ — Cleaned
- ~~Clean up SiteSettings model (remove banner references)~~ — Cleaned
**Files Affected:**
- `app/models/HeroSlider.ts` (deleted)
- `app/models/PromotionalBanner.ts` (deleted)
- `app/models/AliexpressCredentials.ts` (deleted)
- `app/models/CJCredentials.ts` (deleted)
- `app/api/hero-slider/*` (deleted — 3 routes)
- `app/api/promotional-banners/*` (deleted — 4 routes)
- `app/api/aliexpress/*` (deleted — 4 routes)
- `app/api/cj/*` (deleted — 4 routes)
- `app/api/products/bulk-upload-products/*` (deleted — 2 routes)
- `app/admin/hero-slider/*` (deleted)
- `app/admin/promotional-banners/*` (deleted)
- `app/admin/dropshipping/*` (deleted)
- `app/(admin)/pages/hero-slider/*` (deleted)
- `app/(admin)/pages/promotional-banners/*` (deleted)
- `app/(admin)/pages/aliexpress/*` (deleted)
- `app/(admin)/pages/dropshipping/*` (deleted)
- `app/(admin)/components/hero-slider/*` (deleted — 4 components)
- `app/(admin)/components/promotional-banners/*` (deleted — 4 components)
- `app/(admin)/components/aliexpress/*` (deleted — 4 components)
- `app/(admin)/components/dropshipping/*` (deleted — 4 components)
- `app/(admin)/components/products/BulkUploadModal.tsx` (deleted)
- `app/components/home/Slider.tsx` (deleted)
- `app/components/banners/*` (deleted)
- `lib/api/heroSlider.ts` (deleted)
- `lib/api/promotionalBanners.ts` (deleted)
- `lib/api/aliexpress.ts` (deleted)
- `lib/api/aliexpress-credentials.ts` (deleted)
- `lib/api/cj.ts` (deleted)
- `lib/aliexpress/*` (deleted — 3 files)
- `lib/cj/*` (deleted — 4 files)
- `lib/media-deletion/heroSliderFileUtils.ts` (deleted)
- `lib/media-deletion/bannerFileUtils.ts` (deleted)
- `types/types/banner.types.ts` (deleted)
- `.cj-token.json` (deleted)
- `app/page.tsx` (cleaned — removed hero slider and banner rendering)
- `app/(admin)/components/AdminSidebar.tsx` (cleaned — removed nav links)
- `app/(admin)/pages/site-settings/SiteSettingsPage.tsx` (cleaned)
- `app/models/SiteSettings.ts` (cleaned — removed banner_id)
- `app/api/site-settings/route.ts` (cleaned — removed banner queries)
- `app/(public)/pages/ProductsPage.tsx` (cleaned — removed banners)
- `app/(public)/pages/CategoriesPage.tsx` (cleaned — removed banners)
- `app/models/Product/schema.ts` (cleaned — removed AliExpress/CJ schemas)
- `app/models/Product/types.ts` (cleaned)
- `app/(admin)/pages/products/ProductListPage.tsx` (cleaned — removed bulk upload)
- `app/(admin)/components/products/ProductHeader.tsx` (cleaned — removed bulk upload button)
- `lib/api/products.ts` (cleaned — removed bulk upload functions)
- `lib/api/home.ts` (cleaned — removed hero slider SSR)
**Verification:** ✅ Build compiles successfully, no hero slider/promo banner/dropshipping references remain
- `app/(admin)/components/hero-slider/*` (remove)
- `app/(admin)/components/promotional-banners/*` (remove)
- `app/components/banners/*` (remove)
- `app/models/SiteSettings.ts` (remove home_components)
- `app/page.tsx` (rewrite)
- `app/(admin)/components/AdminSidebar.tsx` (remove sections)
**Verification:** Homepage loads with simple static layout, no slider/banner management in admin, no broken imports

---

### Step 5: Simplify Product Cards
**Status:** ✅ DONE
**Description:** Simplify product cards to show only one image, product name, and price. Add variant count indicator. Remove all hover actions.
**Details:**
- ~~Update ProductCard component~~ — Completely rewritten (472 → 80 lines)
  - ~~Show only the first product image (no carousel/swiper)~~ — Done
  - ~~Display product name below image~~ — Done
  - ~~Display product price below name~~ — Done
  - ~~Add variant count badge in top corner~~ — "X options" badge
  - ~~Remove hover effects: no add to cart, no wishlist, no image swap~~ — Done
  - ~~Remove quick view functionality~~ — Done
- ~~Remove ProductMediaCarousel from product cards~~ — Done (kept in detail page only)
- ~~Simplify ProductGrid~~ — Removed activeCoupons prop
- ~~Clean up ProductsPage~~ — Removed coupon fetching
**Files Affected:**
- `app/components/product/ProductCard.tsx` (rewritten — 472 → 80 lines)
- `app/components/product/ProductGrid.tsx` (simplified)
- `app/(public)/pages/ProductsPage.tsx` (removed coupon logic)
**Verification:** ✅ Build compiles successfully, product cards show single image + name + price + variant count

---

### Step 6: Implement Cart Sidebar
**Status:** ✅ DONE
**Description:** Replace the separate cart page with a slide-in sidebar that appears when a product is added to cart.
**Details:**
- ~~Create CartSidebar component~~ — Created `app/components/cart/CartSidebar.tsx`
  - ~~Slides in from right when item added to cart~~ — CSS slide-in animation
  - ~~Show added product(s) in sidebar with image, name, price, quantity~~ — Shows all cart items
  - ~~Show cart total at bottom~~ — Shows subtotal
  - ~~Two buttons: "View Cart" and "Keep Browsing"~~ — Both implemented
  - ~~Auto-open sidebar when "Add to Cart" is clicked~~ — AddToCartButton calls openCart()
  - ~~Keep existing CartPage for full cart view~~ — CartPage still exists at /cart
  - ~~Add overlay/backdrop when sidebar is open~~ — Full-screen dark overlay
  - ~~Sidebar has close (X) button~~ — Plus Escape key closes
- ~~Add isCartOpen/openCart/closeCart to UserContext~~ — Added to context
- ~~Update Cart.tsx (header icon) to open sidebar~~ — Changed from router.push to openCart()
- ~~Update AddToCartButton to trigger sidebar~~ — Calls openCart() after adding
- ~~Render CartSidebar in ClientProviders~~ — Available globally
**Files Affected:**
- `app/components/cart/CartSidebar.tsx` (new)
- `app/context/UserContext.js` (added isCartOpen, openCart, closeCart)
- `app/components/Cart.tsx` (changed to open sidebar)
- `app/components/product-detail/AddToCartButton.tsx` (opens sidebar after add)
- `app/ClientProviders.tsx` (renders CartSidebar)
**Verification:** ✅ Build compiles, clicking cart icon opens sidebar, add-to-cart opens sidebar, View Cart navigates to /cart page

---

### Step 7: Simplify Product Management (Admin)
**Status:** ✅ DONE
**Description:** Simplify the admin product management system. Remove bulk upload. Create unified product add/edit with variant support.
**Details:**
- ~~Remove bulk upload functionality~~ — Removed (CSV/Excel routes + BulkUploadModal + ProductHeader button)
- ~~Remove AliExpress import functionality~~ — Removed completely in Step 4
- ~~Remove CJ Dropshipping import functionality~~ — Removed completely in Step 4
- ~~Remove AliExpress/CJ credentials models and admin pages~~ — Removed in Step 4
- ~~Clean up Product model: remove dropshipping-specific fields~~ — Cleaned in Step 4
- ~~Simplify product add/edit form~~ — Unified into single form
  - ~~Removed ProductTypeSelector (two big buttons)~~ — Replaced with simple toggle switch
  - ~~Removed ProductFormBasicInfo component~~ — Inlined name + brand + category + description
  - ~~Removed ProductFormPricing component~~ — Inlined pricing (PKR only, no Stripe tax code)
  - ~~Removed ProductFormVideos component~~ — Video upload not needed for this store
  - ~~Removed SEO section (meta_title, meta_description)~~ — Removed from form, schema, and types
  - ~~Removed tags field~~ — Removed from form, schema, and types
  - ~~Removed short_description~~ — Single description field only
  - ~~Removed bestseller/trending badges~~ — Kept only featured + on_sale
  - ~~Removed unit_of_measure~~ — Not relevant for lamp store
  - ~~Removed stripe_tax_code~~ — No Stripe integration
  - ~~Removed related/upsell/cross-sell product IDs~~ — Not needed
  - ~~Removed specifications field~~ — Use attributes instead
  - ~~Variant toggle as simple on/off switch~~ — Admin enables variants if product has options
  - ~~Variant system preserved: options → auto-generate combos → each combo has price, SKU, stock~~ — Works as before
- ~~Cleaned Product schema~~ — Removed 12+ unused fields, simplified badges to 2 fields
- ~~Cleaned Product types~~ — Matched to simplified schema
- ~~Cleaned 11 API routes~~ — Removed all references to deleted fields
- ~~Cleaned 8 frontend components~~ — Removed all references to deleted fields
**Files Affected:**
- `app/(admin)/pages/products/ProductFormPage.tsx` (rewritten — unified form)
- `app/(admin)/components/products/form/ProductFormBasicInfo.tsx` (deleted)
- `app/(admin)/components/products/form/ProductFormPricing.tsx` (deleted)
- `app/(admin)/components/products/form/ProductFormVideos.tsx` (deleted)
- `app/(admin)/components/products/form/ProductTypeSelector.tsx` (deleted)
- `app/models/Product/schema.ts` (cleaned — removed 12+ fields)
- `app/models/Product/types.ts` (cleaned — matched to schema)
- 11 API routes (cleaned references)
- 8 frontend components (cleaned references)
**Verification:** ✅ Build compiles (MongoDB errors expected without .env), TypeScript clean, admin can add/edit products with unified form, variant toggle works

---

### Step 8: Remove Dynamic Pages & Simplify Site Settings
**Status:** PENDING
**Description:** Remove the dynamic page creation system. Convert all static pages to hardcoded Next.js pages. Simplify admin site settings.
**Details:**
- Remove Page model (`app/models/Page.ts`) — or repurpose for static content
- Remove dynamic page API routes (`app/api/site-settings/slug/*`)
- Remove PageContent component (`app/components/pages/PageContent.tsx`)
- Create static Next.js pages for:
  - `/contact` — contact form + company info
  - `/faqs` — FAQ accordion
  - `/track-order` — order tracking form
  - `/shipping-delivery` — static shipping info
  - `/returns-exchanges` — static returns info
  - `/care-guide` — static care guide
  - `/warranty` — static warranty info
  - `/privacy-policy` — static privacy policy
  - `/terms-conditions` — static terms
  - `/cookie-policy` — static cookie policy
  - `/accessibility` — static accessibility statement
- Simplify SiteSettings model: remove `static_pages` array, keep only company_info
- Simplify admin SiteSettings page: only company info editing (name, logo, email, phone, address, social links)
- Remove Jodit rich text editor dependency (no longer needed for pages)
- Update footer to link to static pages
**Files Affected:**
- `app/models/Page.ts` (remove)
- `app/models/SiteSettings.ts` (simplify)
- `app/api/site-settings/slug/*` (remove)
- `app/components/pages/*` (remove)
- `app/(pages)/*` or `app/*` (new static pages)
- `app/admin/site-settings/*` (simplify)
- `app/components/Footerr.tsx` (update links)
- `app/(admin)/components/AdminSidebar.tsx` (remove page management)
**Verification:** All static pages load correctly, admin can edit company info only, no dynamic page creation

---

### Step 9: Simplify Payment Methods
**Status:** PENDING
**Description:** Remove Stripe and PayPal. Keep Cash on Delivery. Add Bank Transfer with payment proof upload.
**Details:**
- Remove Stripe integration:
  - Remove Stripe API routes (`app/api/payment/stripe/*`)
  - Remove StripePaymentForm component
  - Remove `@stripe/react-stripe-js`, `stripe` packages
  - Remove Stripe Tax integration from products/orders
- Remove PayPal integration:
  - Remove PayPal API routes (`app/api/payment/paypal/*`)
  - Remove PayPalPaymentButton component
  - Remove `@paypal/react-paypal-js` package
- Keep Cash on Delivery (COD)
- Add Bank Transfer payment method:
  - Admin can configure bank details: Account Name, Account Number, IBAN, Bank Name
  - Admin can upload QR code image for easy payment
  - During checkout, user selects "Bank Transfer"
  - Show bank details + QR code to user
  - User can upload payment screenshot/proof after placing order
  - Payment proof stored with order
  - Admin can view payment proof in order management
- Update PaymentGateway model: remove stripe/paypal, add bank_transfer
- Update Payment model: add bank transfer fields (proof_url, bank_reference)
- Update checkout flow to support new payment methods
- Update admin order view to show payment proof
**Files Affected:**
- `app/api/payment/stripe/*` (remove)
- `app/api/payment/paypal/*` (remove)
- `app/components/checkout/StripePaymentForm.tsx` (remove)
- `app/components/checkout/PayPalPaymentButton.tsx` (remove)
- `app/components/checkout/PaymentMethodSelector.tsx` (rewrite)
- `app/models/PaymentGateway.js` (update)
- `app/models/Payment.js` (update)
- `app/models/Order.ts` (add bank transfer fields)
- `app/api/checkout/route.ts` (update)
- `app/admin/orders/[id]/*` (add payment proof display)
- `package.json` (remove stripe, paypal packages)
**Verification:** Can checkout with COD and Bank Transfer, payment proof uploads work, admin can view proofs

---

### Step 10: Keep & Adjust Coupon System
**Status:** PENDING
**Description:** Keep the existing coupon system as-is since the client requires it. Make minor adjustments if needed for PKR-only pricing.
**Details:**
- Review existing coupon system for compatibility with PKR-only pricing
- Ensure coupon discounts display in PKR
- Verify coupon creation/editing in admin works correctly
- Verify coupon application in cart works correctly
- No major changes expected — this system is already well-built
**Files Affected:** Minimal changes expected
**Verification:** Can create coupons, apply them at checkout, discounts calculate correctly in PKR

---

### Step 11: Simplify Product Attributes
**Status:** PENDING
**Description:** Reduce the product attribute system to only what the client needs. Simplify category attributes and product specifications.
**Details:**
- Simplify category attributes: reduce to essential attributes only
- For the client's lamp/lighting store, relevant attributes might include:
  - Material (e.g., Metal, Wood, Glass)
  - Style (e.g., Modern, Classic, Industrial)
  - Room (e.g., Living Room, Bedroom, Kitchen)
  - Color Temperature (e.g., Warm White, Cool White)
  - Wattage
  - Dimensions
- Simplify Product Specs: admin can add custom spec name + value pairs
- Remove complex filter system if not needed (keep basic category filter)
- Update ProductFilters component to match simplified attributes
- Remove advanced filter types (multiselect, checkbox filters) if not needed
**Files Affected:**
- `app/models/Category.ts` (simplify attributes)
- `app/models/Product/schema.ts` (simplify attributes/specifications)
- `app/components/product/ProductFilters.tsx` (simplify)
- `app/hooks/useProductFilters.ts` (simplify)
- `app/(admin)/components/categories/*` (simplify attribute management)
**Verification:** Admin can define simple attributes per category, products can have specs, filters work correctly

---

### Step 12: Implement Track Order & Auto Order Confirmation
**Status:** PENDING
**Description:** Implement order tracking by order number + email. Implement automatic order confirmation for night-time orders.
**Details:**
- Track Order page:
  - Simple form: Order Number + Email Address
  - API endpoint: `POST /api/orders/track` — validates order number + email match, returns order status
  - Display order status, items, and basic info
- Auto order confirmation:
  - Define "night hours" (e.g., 10 PM to 8 AM PKT)
  - Orders placed during night hours → auto-confirmed after a delay (e.g., 30 minutes)
  - Use Vercel cron job or setTimeout-based approach
  - Store `placed_at` timestamp on order
  - API logic: check if order was placed during night hours → auto-set status to "confirmed" after delay
  - Admin can still manually confirm/reject
  - Daytime orders remain manual confirmation
- Create cron job: `/api/cron/auto-confirm-orders`
  - Runs every 30 minutes
  - Checks for pending orders placed during night hours
  - Auto-confirms eligible orders
**Files Affected:**
- `app/track-order/page.tsx` (create/update)
- `app/api/orders/track/route.ts` (new)
- `app/models/Order.ts` (add auto_confirm field)
- `app/api/cron/auto-confirm-orders/route.ts` (new)
- `vercel.json` (add cron schedule)
- `app/admin/orders/[id]/*` (update status display)
**Verification:** Can track order with number + email, night orders auto-confirm, day orders stay manual

---

### Step 13: Simplify Product Detail Page
**Status:** PENDING
**Description:** Simplify the product detail page to show essential information only. Add sticky product bar at bottom.
**Details:**
- Simplify product detail layout:
  - Product images (gallery/carousel)
  - Product name + price
  - Variant selector (if product has variants)
  - Quantity selector
  - Add to Cart button
  - Short description
- Product information tabs/sections:
  - Description — product description text
  - Specifications — admin-defined spec name/value pairs
  - Care Guide — text field (admin provides per product)
  - Shipping Info — text field (admin provides per product)
  - Return Info — text field (admin provides per product)
- Sticky product bar at bottom:
  - Full-width horizontal bar that appears when user scrolls past product info
  - Left side: variant selector + quantity + Add to Cart
  - Right side: product price
  - Always visible while scrolling through product page
- Remove complex elements:
  - Remove Buy Now button (use Add to Cart only)
  - Remove social share button (can add later if needed)
  - Remove complex badge display
  - Simplify breadcrumbs
- Update Product model: add care_guide, shipping_info, return_info text fields
**Files Affected:**
- `app/(public)/pages/ProductDetailPage.tsx` (rewrite)
- `app/components/product-detail/*` (simplify/rewrite)
- `app/components/product-detail/StickyProductBar.tsx` (new)
- `app/models/Product/schema.ts` (add new fields)
**Verification:** Product detail page shows all required info, sticky bar appears on scroll, all sections work

---

### Step 14: Update Header/Navigation
**Status:** PENDING
**Description:** Update the header to match the client's layout: center logo, navbar before logo, no background on navbar.
**Details:**
- Update Header component (`app/components/Header.tsx`):
  - New layout order: [Navbar Links] [Logo (center)] [Cart/User icons]
  - Navbar: simple text links with dropdowns for categories
  - No background color on navbar — transparent/minimal
  - Logo centered and prominent
  - Remove top bar (phone number, promotional text)
  - Keep: search, cart icon, user menu
- Update footer:
  - Simple footer with static page links
  - Company info
  - Social links
  - Copyright
  - Remove newsletter section (not required)
- Remove Dark Mode toggle (not required)
- Remove CategoryNavigation component (integrate into header nav)
- Update mobile navigation to match
**Files Affected:**
- `app/components/Header.tsx` (rewrite)
- `app/components/Footerr.tsx` (simplify)
- `app/components/Darkmode.jsx` (remove)
- `app/components/shared/CategoryNavigation.tsx` (remove or integrate)
- `app/layout.tsx` (update providers — remove DarkMode)
**Verification:** Header shows centered logo with nav links, no background on nav, footer has static links, mobile responsive

---

### Step 15: Final Cleanup, Testing & Deployment
**Status:** PENDING
**Description:** Remove all unused models, APIs, components, and dependencies. Test the entire application. Prepare for deployment.
**Details:**
- Remove unused models:
  - `NewsletterSubscriber.ts`, `NewsletterCampaign.ts`
  - `ChatbotConfig.ts`, `ChatbotQA.ts`
  - `AISettings.ts`
  - `ProductReviewSummary.ts`
  - `Invoice.ts` (or keep if needed)
  - `Refund.ts` (simplify for COD/bank transfer only)
  - Any other unused models
- Remove unused API routes:
  - Newsletter API
  - Chatbot API
  - AI review summary API
  - Reports/Analytics API (if not needed)
  - Activity logging API (if not needed)
  - Build/Deploy API
- Remove unused admin pages/sections:
  - Newsletter management
  - Chatbot management
  - Reports & Analytics
  - Activity logs
- Remove unused packages from `package.json`:
  - `@paypal/react-paypal-js`
  - `stripe`, `@stripe/react-stripe-js`
  - `firebase`, `firebase-admin`
  - `jodit-react` (if no longer needed)
  - `recharts` (if reports removed)
  - `@hello-pangea/dnd`, `react-beautiful-dnd` (if drag-drop not needed)
  - `ffmpeg-static`, `fluent-ffmpeg` (if video upload removed)
  - Other unused packages
- Clean up environment variables (`.env.local`)
- Clean up `public/` directory (remove unused images)
- Full application testing:
  - Auth flow (signup, signin, signout)
  - Product browsing (list, detail, variants)
  - Cart & checkout (COD, bank transfer)
  - Admin panel (product management, order management, coupons)
  - Order tracking
  - All static pages
- Fix any remaining errors or warnings
- Update `next.config.mjs` if needed
- Prepare for Vercel deployment
**Files Affected:** Multiple files across the entire codebase
**Verification:** Application runs without errors, all features work, no unused code/files remaining

---

## Summary

| Step | Description | Status |
|------|------------|--------|
| 1 | Project Backup & Initialization | DONE |
| 2 | Remove Firebase Auth → Simple JWT Auth | DONE |
| 3 | Remove Multi-Currency → PKR Only | DONE |
| 4 | Remove Homepage Management + Dropshipping | DONE |
| 5 | Simplify Product Cards | DONE |
| 6 | Implement Cart Sidebar | DONE |
| 7 | Simplify Product Management (Admin) | DONE |
| 8 | Remove Dynamic Pages & Simplify Site Settings | PENDING |
| 9 | Simplify Payment Methods (COD + Bank Transfer) | PENDING |
| 10 | Keep & Adjust Coupon System | PENDING |
| 11 | Simplify Product Attributes | PENDING |
| 12 | Implement Track Order & Auto Confirmation | PENDING |
| 13 | Simplify Product Detail Page + Sticky Bar | PENDING |
| 14 | Update Header/Navigation | PENDING |
| 15 | Final Cleanup, Testing & Deployment | PENDING |

---

## Key Principles

1. **Functionality over Design** — Get all features working first, then style later
2. **Step by Step** — Complete each step fully before moving to the next
3. **README Updates** — Each completed step updates this README with status: DONE
4. **No Breaking Changes** — Each step should leave the application in a working state
5. **Simplicity** — Everything should be simple, clean, and user-friendly
6. **Professional** — Code should be well-structured, maintainable, and production-ready

---

## Client Requirements Reference

Based on [lampandglow.com](https://www.lampandglow.com/):
- Simple auth: name + email + password
- PKR only
- Simple product cards: image + name + price + variant count
- Cart sidebar (not separate page)
- Simple product management with variants
- Static pages (no dynamic page system)
- Payment: COD + Bank Transfer (with QR + proof upload)
- Coupon system
- Track order (order number + email)
- Auto order confirmation for night-time orders
- Simple product detail with sticky bar
- Center logo header with simple nav
