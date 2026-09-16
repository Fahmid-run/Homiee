# 🏠 Homiee

### A Complete Property & Room Rental Management Platform

**Homiee** is a full-stack property and roommate rental management platform designed to simplify the entire rental lifecycle — from discovering properties and requesting property visits to room applications, rental payments, shared bills, and rental document management.

The platform supports three main user roles:

- 👤 **Tenant** — discovers properties, requests visits, applies for rooms, and manages payments.
- 🏠 **Owner** — manages properties and rooms, reviews tenant requests, creates rentals, generates bills, and uploads rental documents.
- 🛡️ **Admin** — manages and oversees the platform.

---

# 🌐 Live API

**Live API:** `https://homiee-89.netlify.app/`

---

# 📚 API Documentation

The complete API documentation is available through Postman:

[📚 View Homiee API Documentation](https://documenter.getpostman.com/view/54889996/2sBYB1M8AE)

The documentation contains the available API endpoints, request formats, authentication requirements, and response structures.

---

# 🔑 Demo Credentials

### 🛡️ Admin Account

```text
Email: admin@example.com
Password: Admin@123456
```

---

## ✨ Core Features

### 🔐 Authentication & Authorization

- 👤 User registration and login
- 🔑 Secure authentication
- 🍪 Cookie-based authentication
- 🛡️ Role-based authorization
- 👥 Tenant, Owner & Admin access control
- 🔒 Protected API routes

### 🏘️ Property & Room Discovery

Properties and available rooms can be viewed publicly without authentication.

- 🔎 Browse properties
- 🏠 View property details
- 🚪 View available rooms
- 📋 View room details
- 🌐 Public property & room routes

### 👀 Property Visit Requests

Tenants can request to visit a property before applying for a room.

**Flow:**

```text
Tenant
  ↓
Select Property
  ↓
Create Visit Request
  ↓
Property Owner Reviews Request
  ↓
Accept / Reject
```

### 📝 Room Application

After getting access to the property, a tenant can apply for a room.

```text
Tenant
  ↓
Select Room
  ↓
Submit Application
  ↓
Owner Reviews Application
  ↓
Accept / Reject
```

### 🏠 Rental Management

Once a tenant's application is accepted, the owner can create a rental agreement.

```text
Room Application
       ↓
Owner Accepts
       ↓
Rental Created
       ↓
Tenant Pays Rent
```

### 💳 Rent Payment

Tenants can pay their rental payments through the platform.

- 💰 Rental payment management
- 📊 Payment status tracking
- 🔄 Rental/payment lifecycle management
- 💳 Stripe payment integration

### 🧾 Shared Bill Management

Owners can create bills for shared expenses.

Homiee automatically calculates each roommate's share.

For example:

```text
Electricity Bill = $120
Roommates = 4

Each Tenant:
$120 ÷ 4 = $30
```

The system creates the corresponding payment responsibility for each roommate.

```text
Owner
  ↓
Creates Bill
  ↓
System Splits Bill
  ↓
Individual Tenant Shares
  ↓
Tenants Pay Their Bills
```

### 📄 Rental Document Management

Owners can upload rental-related documents for tenants.

Examples include:

- 📑 Rental agreements
- 🧾 Payment-related documents
- 📄 Property/rental documents
- 📎 Other rental-related files

### 👥 Roommate Management

The platform is designed around shared accommodation, allowing multiple tenants to live under the same rental/property structure and manage shared financial responsibilities.

---

# 🛠️ Technology Stack

## Backend

| Technology        | Purpose                              |
| ----------------- | ------------------------------------ | -------------------------- | --- |
| 🟢 **Node.js**    | JavaScript runtime                   |
| 🚂 **Express.js** | REST API framework                   |
| 🔷 **TypeScript** | Type safety                          |
| 🐘 **PostgreSQL** | Primary database                     |
| 🔺 **Prisma ORM** | Database access & ORM                |
| 🔴 **Redis**      | Caching / session-related operations |
| 🔐 **JWT**        | Authentication                       |
| 🔑 **bcrypt**     | Password hashing                     |
| 🧩 **Zod**        | Request validation                   |
| 💳 **Stripe**     | Payment processing                   |
| <!--              | ☁️ **Cloudinary**                    | File/image storage         | --> |
| <!--              | 📧 **Nodemailer**                    | Email functionality        | --> |
| <!--              | 🔑 **Google Auth Library**           | Google authentication      | --> |
| <!--              | 📦 **Multer**                        | File upload handling       | --> |
| <!--              | ⏰ **node-cron**                     | Scheduled/background tasks | --> |

---

# 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │     Client      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Express API   │
                    └────────┬────────┘
                             │
             ┌───────────────┼
             │               │
             ▼               ▼
       ┌──────────┐    ┌──────────┐
       │PostgreSQL│    │  Redis   │
       └──────────┘    └──────────┘
             │
             ▼
       ┌──────────────┐
       │    Prisma    │
       │     ORM      │
       └──────────────┘

                    External Services
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
             ┌────────┐        ┌──────────┐
             │ Stripe │        │ Google   │
             │Payments│        │  Auth    │
             └────────┘        └──────────┘
```

---

# 🔄 Main Application Flow

## Tenant Flow

```text
Register / Login
      ↓
Browse Properties
      ↓
View Property
      ↓
Request Property Visit
      ↓
Owner Accepts Request
      ↓
View / Select Room
      ↓
Apply For Room
      ↓
Owner Accepts Application
      ↓
Rental Created
      ↓
Pay Rent
      ↓
Receive Shared Bills
      ↓
Pay Individual Bill
```

## Owner Flow

```text
Register / Login
      ↓
Create Property
      ↓
Create Rooms
      ↓
Receive Visit Requests
      ↓
Accept / Reject Requests
      ↓
Receive Room Applications
      ↓
Accept / Reject Applications
      ↓
Create Rental
      ↓
Manage Rent
      ↓
Create Shared Bills
      ↓
Bills Automatically Split
      ↓
Upload Rental Documents
```

---

# 📌 Example API Structure

```text
/api/v1/auth
/api/v1/property
/api/v1/room
/api/v1/tenant
/api/v1/owner
/api/v1/admin
/api/v1/payments
```

---

# 💳 Payment Architecture

Homiee integrates **Stripe** for rental-related payments.

```text
Tenant
  │
  │ Payment Request
  ▼
Homiee API
  │
  ▼
Stripe Checkout
  │
  ▼
Payment
  │
  ▼
Stripe Webhook
  │
  ▼
Homiee Backend
  │
  ▼
Update Payment / Rental Status
```

The backend also provides a dedicated payment webhook endpoint for processing Stripe payment events.

---

# 🔒 Security

Homiee implements several backend security mechanisms:

- 🔐 Password hashing with bcrypt
- 🎫 JWT-based authentication
- 🍪 Secure cookie-based authentication
- 🛡️ Role-based authorization
- ✅ Zod request validation
- 🚫 Protected private routes
- 🔑 Environment-based secret management
- 💳 Stripe webhook handling
- 👤 Ownership/role-based resource access

---

# 📂 Project Structure

```text
Homiee/
│
│
├── src/
│   ├── config/
│   ├── lib/
│   ├── middleware/
│   ├── module/
│   │   ├── auth/
│   │   ├── property/
│   │   ├── rooms/
│   │   ├── tenant/
│   │   ├── owner/
│   │   ├── admin/
│   │   └── payment/
│   │
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   └── schema/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

# ⚙️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Fahmid-run/Homiee.git
cd Homiee
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and provide the required configuration:

```env
NODE_ENV=
PORT=



DATABASE_URL=



JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

BCRYPT_SALT_ROUNDS=

BKASH_APP_SECRET=
BKASH_APP_KEY=


STRIPE_SECRET_KEY=

BKASH_TOKENIZE_USER_NAME=
BKASH_TOKENIZE_PASSWORD=

BKASH_TOKENIZE_BASE_URL=


BKASH_CALLBACK_URL=




REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_HOST=
REDIS_PORT=




ADMIN_EMAIL=
ADMIN_PASSWORD=


BACKEND_URL=

FRONTEND_URL=

```

Use the actual variables required by your project configuration.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

The API will be available at your configured local port.

---

# 🚀 Deployment

The backend can be deployed using platforms that support Node.js/Express applications.

For production deployment, configure all required environment variables in the deployment platform and ensure the PostgreSQL, Redis, Stripe, Cloudinary, and authentication services are correctly configured.

---

# 🎯 Project Goals

Homiee was built to solve common problems in shared-property and roommate management by bringing multiple processes into a single platform:

> **Property discovery → Visit → Room application → Rental → Rent → Shared bills → Documents**

Instead of managing these processes separately through messages, spreadsheets, and manual calculations, Homiee provides a structured backend system for managing the complete rental lifecycle.

---

# 👨‍💻 Developer

**Fahmid**

Full-Stack Developer
Bangladesh 🇧🇩

GitHub:
`https://github.com/Fahmid-run`

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.
