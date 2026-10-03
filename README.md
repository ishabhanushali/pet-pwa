# 🐾 Pet PWA — First 50 Customers MVP

A mobile-first Progressive Web Application (PWA) for pet owners to shop for pet products, manage pets, receive permanent Pet IDs, activate QR-based Digital Pet IDs, earn Paw Points, manage reminders, view orders, and quickly reorder products.

This repository contains the source code for the **First 50 Customers MVP**.

---

## 1. Project Overview

Pet PWA combines pet commerce with digital pet identity.

The main customer journey is:

```text
Customer registers/logs in
        ↓
Shops for pet products
        ↓
Places an order
        ↓
Receives a permanent Pet ID
        ↓
Scans Pet ID QR
        ↓
Verifies mobile using OTP
        ↓
Activates Pet ID
        ↓
Manages pet profile
        ↓
Earns Paw Points
        ↓
Views orders/rewards
        ↓
Reorders products
```

The application also includes a secure admin system for managing products, customers, pets, orders, rewards, analytics, and CSV exports.

---

## 2. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Progressive Web App architecture

### Backend

- Next.js API Routes
- Node.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Authentication

Customer authentication:

- Mobile number
- OTP verification
- Secure database-backed sessions
- HTTP-only session cookies

Admin authentication:

- Email/password
- bcrypt password hashing
- Secure database-backed admin sessions

### Planned / Production Integrations

- Indian payment gateway
- SMS OTP provider
- Cloud image storage
- Production hosting
- Custom domain

---

## 3. Main Features

### Customer Features

- Mobile OTP login
- Customer profile
- Multiple delivery addresses
- Product categories
- Product listing
- Shopping cart
- Checkout
- Cash on Delivery
- Order history
- Order status
- Reorder
- Multiple pet profiles
- Permanent Pet ID
- QR-based Pet ID
- Pet ID activation using OTP
- Digital Pet ID
- Privacy-safe public pet page
- Paw Points
- Reward history
- Pet reminders
- WhatsApp/call support
- Analytics tracking

### Admin Features

- Secure admin login
- Product management
- Customer search
- Pet search
- Pet ID search
- Order management
- Order status updates
- Paw Points management
- Operational analytics
- CSV exports

---

## 4. Project Structure

Important folders:

```text
pet-pwa/
│
├── app/
│   ├── api/
│   ├── admin/
│   ├── cart/
│   ├── checkout/
│   ├── login/
│   ├── orders/
│   ├── pets/
│   ├── profile/
│   ├── reminders/
│   ├── rewards/
│   ├── shop/
│   ├── support/
│   └── page.tsx
│
├── components/
│   ├── CartProvider.tsx
│   └── LogoutButton.tsx
│
├── lib/
│   ├── prisma.ts
│   └── customerAuth.ts
│
├── prisma/
│   └── schema.prisma
│
├── scripts/
│   └── create-admin.ts
│
├── backups/
│
├── public/
│
├── .env
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
└── README.md
```

---

## 5. Local Development Requirements

Install:

- Node.js
- npm
- PostgreSQL
- Git
- VS Code or another code editor

This project was developed using PostgreSQL 14 locally.

---

## 6. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd pet-pwa
npm install
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the actual business-owned repository URL.

---

## 7. Environment Variables

Create:

```text
.env
```

in the project root.

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/pet_pwa"
```

Additional production variables may be required for:

```text
SMS / OTP provider
Payment gateway
Cloud image storage
Production application URL
Other third-party integrations
```

### Important Security Rule

Never commit `.env` to GitHub.

Never store:

- Database passwords
- API secrets
- Payment gateway secrets
- OTP provider secrets
- Admin passwords
- Session tokens

inside source code or this README.

---

## 8. Database Setup

Create a PostgreSQL database named:

```text
pet_pwa
```

Then run:

```bash
npx prisma format
npx prisma validate
npx prisma db push
npx prisma generate
```

This creates/synchronizes the required database structure.

---

## 9. Run the Application

From the project root:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 10. Prisma Studio

To inspect local database records:

```bash
npx prisma studio
```

Prisma Studio can be used during development to inspect:

- Customers
- Products
- Orders
- Pets
- Pet IDs
- Rewards
- Reminders
- Sessions
- Analytics events

Do not expose Prisma Studio publicly in production.

---

## 11. Customer Authentication

Customer authentication uses mobile OTP.

Development flow:

```text
Enter mobile
    ↓
Request OTP
    ↓
Development OTP displayed locally
    ↓
Verify OTP
    ↓
Secure customer session created
```

Production must use a real SMS/OTP provider.

The development OTP mechanism must not be exposed in production.

---

## 12. Customer Session Security

Customer sessions use:

- Cryptographically random session tokens
- SHA-256 token hashes stored in PostgreSQL
- HTTP-only cookies
- SameSite cookie protection
- Session expiration
- Secure cookies in production

Raw customer session tokens must not be stored in the database.

---

## 13. Admin Authentication

Admin authentication uses:

```text
Email
Password
```

Passwords are stored using secure bcrypt hashes.

Admin sessions are stored in the database.

Do not store plaintext admin passwords in:

```text
GitHub
README.md
Source code
Screenshots
Documentation
```

---

## 14. Creating an Admin

The project contains:

```text
scripts/create-admin.ts
```

Use the admin creation script during setup.

Any temporary plaintext password/environment variable used during admin creation should be removed after the admin account is created.

---

## 15. Product Management

Admins can manage:

- Product name
- Brand
- Category
- Pack size
- MRP
- Selling price
- Description
- Image
- Stock
- Availability

Products with zero stock should not be treated as available for purchase.

---

## 16. Shopping Cart

The shopping cart is maintained on the customer device.

Local storage key:

```text
pet-pwa-cart
```

Current MVP delivery rule:

```text
Order below ₹499 → ₹49 delivery

Order ₹499 or above → FREE delivery
```

---

## 17. Checkout and Orders

Checkout validates:

- Customer session
- Delivery address
- Product existence
- Current product prices
- Product availability
- Stock
- Quantity

Prices submitted by the browser are not trusted as the authoritative order price.

The backend reads current product information from PostgreSQL before creating an order.

---

## 18. Payment

Cash on Delivery is supported in the MVP.

Production online payments require a verified Indian payment gateway integration.

Before enabling online payment in production, implement:

- Server-side payment verification
- Payment signature verification
- Failure handling
- Refund handling
- Idempotency
- Order/payment reconciliation

Development/mock payment APIs must not be enabled as production payment mechanisms.

---

## 19. Pet Profiles

Customers can maintain multiple pets.

Pet information includes:

- Name
- Type
- Photo
- Breed
- Gender
- Date of birth
- Weight
- Allergies

Optional information may be left empty.

---

## 20. Permanent Pet ID

A permanent Pet ID follows a format similar to:

```text
P000127
```

Pet IDs are generated from the database Pet ID record.

The permanent Pet ID should never be reused for another pet.

---

## 21. QR Pet ID

Each permanent Pet ID has a unique QR token.

The QR should identify the pet using a safe URL/identifier.

The QR must not directly contain private customer information.

Do not expose:

- Customer mobile
- Customer email
- Customer address
- Session information
- Authentication secrets

inside the QR code.

---

## 22. Pet ID Activation

Pet ID activation flow:

```text
UNCLAIMED
    ↓
Request activation OTP
    ↓
Verify OTP
    ↓
ACTIVE
```

Activation OTPs are:

- Random
- Hashed before database storage
- Time limited
- Attempt limited
- Single use

A disabled Pet ID cannot be activated through the normal activation flow.

---

## 23. Digital Pet ID Privacy

The unauthenticated/public Pet ID page must only display approved public information.

Private owner information must not be exposed.

Examples of information that should remain private:

```text
Mobile number
Email
Home address
Session data
OTP information
QR token
Internal database information
```

---

## 24. Paw Points

The application maintains Paw Points using reward transactions.

Reward history contains information such as:

```text
Points
Reason
Date
Transaction type
```

Admins can add or deduct Paw Points with an associated reason.

---

## 25. Reorder

Customers can reorder products from previous orders.

The reorder feature checks:

- Current product existence
- Current availability
- Current stock
- Existing cart quantity

The current product price is used.

The old order price is not reused.

---

## 26. Reminders

The MVP includes basic pet reminders.

Current implementation stores and displays reminders.

Production scheduled delivery through:

```text
Push notification
SMS
WhatsApp
Email
```

requires an external notification service/scheduler.

---

## 27. Admin Analytics

The admin analytics dashboard includes operational information such as:

- Customer count
- Product count
- Pet count
- Pet ID count
- Order count
- Delivered revenue
- Paw Points
- Product stock
- Recent orders
- Top products

---

## 28. Event Analytics

The application contains an `AnalyticsEvent` model.

Tracked MVP events include:

```text
PRODUCT_VIEW
ADD_TO_CART
CHECKOUT_STARTED
ORDER_CREATED
PET_ID_ISSUED
PET_ID_ACTIVATED
REORDER
```

Analytics must not contain sensitive information such as:

```text
OTP
OTP hashes
Passwords
Session tokens
QR tokens
Customer addresses
Payment secrets
```

Note:

`PRODUCT_VIEW` currently has development/manual test coverage. Product-card rendering is intentionally not automatically counted as a product view because simply displaying every card would inflate view counts.

---

## 29. CSV Exports

Admins can export:

```text
Customers
Pets
Orders
Products
```

CSV export APIs require an authenticated admin session.

Exported files may contain business/customer information and must be handled securely.

---

## 30. Support

The application contains a support page for:

```text
WhatsApp
Phone call
```

Development placeholder phone numbers must be replaced with the real business support number before launch.

---

## 31. Database Backup

A local PostgreSQL backup can be created with `pg_dump`.

Example for PostgreSQL 14 on Windows:

```powershell
& "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres -h localhost -p 5432 -F c -d pet_pwa -f "backups\pet_pwa_backup.dump"
```

Backup files must not be committed to GitHub.

The `backups/` directory should be excluded through `.gitignore`.

---

## 32. Database Restore

A backup should always be tested before relying on it for production recovery.

Example:

```powershell
& "C:\Program Files\PostgreSQL\14\bin\pg_restore.exe" -U postgres -h localhost -p 5432 -d YOUR_RESTORE_DATABASE "backups\pet_pwa_backup.dump"
```

Do not restore a backup over the production database without confirming the target database and recovery procedure.

---

## 33. Production Backups

For production, configure managed automated backups.

Recommended requirements:

```text
Automatic scheduled backups
Backup retention
Encrypted storage
Restricted access
Restore testing
Recovery documentation
```

A backup is not considered reliable until restoration has been tested.

---

## 34. Security Headers

The application configures browser security headers through:

```text
next.config.ts
```

Current security controls include headers for:

- MIME sniffing protection
- Frame protection
- Referrer policy
- Permissions policy
- Cross-origin opener policy
- DNS prefetch control

Production security should additionally review:

- Content Security Policy
- HSTS after HTTPS is fully enabled
- CSRF/origin protection
- Rate limiting
- OTP abuse protection

---

## 35. HTTPS

Local development uses:

```text
http://localhost:3000
```

Production must use:

```text
https://
```

Production hosting should automatically redirect HTTP traffic to HTTPS.

Enable HSTS only after the production HTTPS configuration has been verified.

---

## 36. CSV/Data Ownership

The business should retain access to:

- PostgreSQL database
- Database backups
- CSV exports
- Customer records
- Pet records
- Pet ID records
- Order records
- Reward records

Production data should be stored under business-controlled accounts.

---

## 37. Source Code Ownership

The production repository should be owned or controlled by the business.

The business must retain access to:

```text
GitHub repository
Production branch
Deployment configuration
Environment variable list
Technical documentation
```

Avoid making a developer's personal account the only owner of critical production assets.

---

## 38. Domain Ownership

The production domain should be registered under an account controlled by the business.

The business should retain:

```text
Domain registrar access
DNS access
Renewal access
Billing access
Recovery information
```

Enable automatic renewal where appropriate.

---

## 39. Hosting Ownership

Production hosting should use a business-controlled account.

The business should retain access to:

```text
Hosting dashboard
Deployment settings
Environment variables
Logs
Billing
Domain configuration
```

---

## 40. Database Ownership

Production PostgreSQL should be created under a business-controlled cloud/database account.

The business should retain:

```text
Database administrator access
Backup access
Recovery access
Billing access
Connection configuration
```

Database credentials must not be committed to Git.

---

## 41. Third-Party Service Ownership

Any production integrations should use business-controlled accounts.

Examples:

```text
SMS / OTP provider
Payment gateway
Cloud image storage
Email provider
Analytics provider
Hosting provider
Domain registrar
```

The business should retain administrator and billing access.

---

## 42. Credentials Handover

Credentials must be transferred using a secure password manager or another secure credential-sharing mechanism.

Do not send production passwords through:

```text
GitHub
README files
Source code
Public chat
Screenshots
Unencrypted documents
```

After handover, rotate critical credentials where appropriate.

---

## 43. Git Security

Before pushing to GitHub, confirm `.gitignore` excludes sensitive/generated files.

At minimum review:

```gitignore
.env
.env.local
.env.production
/backups/
node_modules/
.next/
```

If a secret has already been committed, removing it from the latest file is not sufficient. Rotate the exposed credential and clean repository history as appropriate.

---

## 44. Production Environment Checklist

Before launch, configure:

```text
Production DATABASE_URL
Production HTTPS
Custom domain
Real OTP/SMS provider
Real business support number
Managed database backups
Production admin account
Secure environment variables
Production image storage
Logging/monitoring
```

If online payment is enabled, also configure the verified production payment gateway and server-side payment verification.

---

## 45. Known MVP Limitations / Production Work

Before a full production launch, review the following:

- Real SMS provider is not yet connected.
- Online payment gateway is not yet production-enabled.
- Development/mock payment functionality must remain development-only.
- Production HTTPS/HSTS must be configured.
- Managed automated backups must be configured.
- OTP rate limiting/abuse controls should be strengthened.
- Order stock concurrency should be hardened for higher traffic.
- Order cancellation/restock handling should be reviewed.
- Reward debit concurrency should be reviewed.
- CSRF/origin protection should be strengthened.
- Any previously exposed development credentials should be rotated.
- Placeholder support numbers must be replaced.
- Production cloud image storage should be configured if required.

---

## 46. First 50 Customers Launch Flow

The intended launch flow is:

```text
Qualifying purchase
        ↓
Free Pet ID issued
        ↓
Customer scans QR
        ↓
Mobile OTP verification
        ↓
Create / claim pet
        ↓
Activate Pet ID
        ↓
Paw Points credited
        ↓
Customer sees orders/rewards
        ↓
Customer reorders
```

---

## 47. MVP Acceptance Areas

Launch testing should cover:

```text
PWA usability
OTP login
Customer profile
Addresses
Product shopping
Cart
Checkout
Order creation
Payment flow
Order history
Pet profiles
Pet ID issuance
QR
Pet ID activation
Digital Pet ID privacy
Paw Points
Reorder
Admin operations
CSV exports
Lost/disabled Pet ID behavior
Backups and restore
Ownership and handover
Mobile usability
Analytics
```

---

## 48. Handover Checklist

Before final project handover, confirm that the business has access to:

- [ ] Source code
- [ ] GitHub repository
- [ ] Production branch
- [ ] Domain registrar
- [ ] DNS
- [ ] Hosting
- [ ] Production database
- [ ] Database backups
- [ ] SMS/OTP provider
- [ ] Payment gateway account, if enabled
- [ ] Cloud image storage, if enabled
- [ ] Admin account
- [ ] Environment variable inventory
- [ ] Deployment documentation
- [ ] Backup documentation
- [ ] Restore procedure
- [ ] Support account/number
- [ ] Billing accounts
- [ ] Analytics/monitoring accounts, if applicable

---

## 49. Final Security Checklist

Before production:

- [ ] No secrets committed to Git
- [ ] `.env` ignored
- [ ] Backup files ignored
- [ ] Database password rotated if previously exposed
- [ ] Strong admin password configured
- [ ] Development OTP display disabled in production
- [ ] Mock payment restricted to development
- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] Production OTP provider configured
- [ ] OTP abuse/rate limiting reviewed
- [ ] Payment verification completed if online payment is enabled
- [ ] Public Pet ID page checked for private information
- [ ] Database backups automated
- [ ] Restore procedure tested
- [ ] Production support details configured
- [ ] Business owns critical production accounts

---

## 50. Handover Status

The First 50 Customers MVP includes the main customer, pet identity, commerce, rewards, administration, export, security, backup, and analytics foundations.

Production launch still requires completion and verification of the production-specific items documented above.

---

## License / Ownership

Add the project's final legal ownership and licensing terms here before external distribution.

Example:

```text
Copyright © [Business Name].
All rights reserved.
```