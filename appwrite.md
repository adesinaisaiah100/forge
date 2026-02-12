# Appwrite Reference Guide for Hatch (Next.js)

> **This file is the single source of truth for all Appwrite knowledge in this project.**  
> Always refer to this document before building any Appwrite-related feature.

---

## Table of Contents

1. [Project Configuration](#1-project-configuration)
2. [SDKs — Web vs Node (Server)](#2-sdks--web-vs-node-server)
3. [Client Setup & Initialization](#3-client-setup--initialization)
4. [Authentication](#4-authentication)
5. [Databases](#5-databases)
6. [Storage](#6-storage)
7. [Functions](#7-functions)
8. [Realtime](#8-realtime)
9. [Teams](#9-teams)
10. [Messaging](#10-messaging)
11. [Avatars](#11-avatars)
12. [Locale](#12-locale)
13. [Permissions System](#13-permissions-system)
14. [Next.js SSR Integration](#14-nextjs-ssr-integration)
15. [Feature Relevance for Hatch](#15-feature-relevance-for-hatch)

---

## 1. Project Configuration

Our Appwrite instance is already configured:

```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID = "698db8ae001706d7f959"
NEXT_PUBLIC_APPWRITE_PROJECT_NAME = "Forge"
NEXT_PUBLIC_APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1"
```

**Region:** Frankfurt (fra)  
**Console:** https://cloud.appwrite.io/console

### Required Packages

```bash
# Client-side SDK (for browser/React components)
npm install appwrite

# Server-side SDK (for API routes, server actions, middleware)
npm install node-appwrite
```

---

## 2. SDKs — Web vs Node (Server)

Appwrite provides **two separate SDKs** for JavaScript/TypeScript projects:

| SDK | Package | Use Where | Auth Method | Can Bypass Permissions |
|-----|---------|-----------|-------------|----------------------|
| **Web SDK** | `appwrite` | Client components (`"use client"`) | User session (cookie) | No |
| **Node SDK** | `node-appwrite` | Server components, API routes, server actions, middleware | API Key or JWT | Yes (with API key) |

### When to use which

- **Web SDK (`appwrite`):** For any code that runs in the browser — login forms, file uploads from the client, realtime subscriptions, client-side data fetching.
- **Node SDK (`node-appwrite`):** For server-side operations — API routes, server actions, middleware, SSR data fetching, admin operations that need to bypass permissions.

---

## 3. Client Setup & Initialization

### 3a. Client-Side Setup (Web SDK)

Create `lib/appwrite/client.ts`:

```typescript
import { Client, Account, Databases, Storage, Avatars, Teams } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const teams = new Teams(client);
export { client };
export { ID, Query, Permission, Role } from "appwrite";
```

### 3b. Server-Side Setup (Node SDK) — Admin Client

Create `lib/appwrite/server.ts`:

```typescript
import { Client, Account, Databases, Storage, Users, Teams } from "node-appwrite";

// Admin client — bypasses permissions, use for server-side admin operations
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!); // Secret API key — NEVER expose to client

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
    teams: new Teams(client),
  };
}

// Session client — acts on behalf of a logged-in user
export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setSession(session);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    teams: new Teams(client),
  };
}
```

**Environment variable needed (add to `.env.local`, NOT `.env`):**

```env
APPWRITE_API_KEY=your_secret_api_key_here
```

> **CRITICAL:** The API key must NEVER be exposed to the client. Only use it in server-side code.

---

## 4. Authentication

Appwrite supports **10 authentication methods**:

### 4a. Email & Password (Most Common)

```typescript
import { account, ID } from "@/lib/appwrite/client";

// Register
const user = await account.create(
  ID.unique(),        // userId
  "user@example.com", // email
  "password123",      // password (min 8 chars)
  "John Doe"          // name (optional)
);

// Login — creates a session
const session = await account.createEmailPasswordSession(
  "user@example.com",
  "password123"
);

// Get current user
const currentUser = await account.get();

// Logout
await account.deleteSession("current");

// Logout from all devices
await account.deleteSessions();
```

### 4b. OAuth2 (Google, GitHub, etc.)

Supported providers (30+): Google, GitHub, Facebook, Apple, Microsoft, Discord, Spotify, Twitch, Twitter, LinkedIn, Slack, Notion, Stripe, Zoom, and more.

```typescript
// Redirect user to OAuth provider
account.createOAuth2Session(
  OAuthProvider.Google,           // provider
  "http://localhost:3000/dashboard", // success redirect
  "http://localhost:3000/login"      // failure redirect
);
```

### 4c. Magic URL (Passwordless)

```typescript
import { account, ID } from "@/lib/appwrite/client";

// Step 1: Send magic link
const token = await account.createMagicURLToken(
  ID.unique(),
  "user@example.com",
  "http://localhost:3000/verify" // redirect URL
);

// Step 2: Create session from URL params (on verify page)
const session = await account.createSession(
  userId, // from URL params
  secret  // from URL params
);
```

### 4d. Email OTP (One-Time Password)

```typescript
// Step 1: Send OTP to email
const token = await account.createEmailToken(
  ID.unique(),
  "user@example.com"
);

// Step 2: Verify OTP and create session
const session = await account.createSession(
  token.userId,
  "123456" // 6-digit code from email
);
```

### 4e. Phone / SMS

```typescript
// Step 1: Send SMS
const token = await account.createPhoneToken(
  ID.unique(),
  "+14255551234"
);

// Step 2: Verify code
const session = await account.createSession(
  token.userId,
  "123456" // code from SMS
);
```

### 4f. Anonymous Session (Guest)

```typescript
const session = await account.createAnonymousSession();
// Can later convert to full account:
await account.updateEmail("user@example.com", "password123");
```

### 4g. JWT (JSON Web Tokens)

```typescript
// Client-side: Generate JWT from active session
const jwt = await account.createJWT();

// Server-side: Use JWT to authenticate
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setJWT(jwt.jwt);
```

### 4h. Custom Token

For integrating external auth systems (e.g., biometric, passkey):

```typescript
// Server-side: Create a custom token
const { userId, secret } = await users.createToken(userId);

// Client-side: Create session from custom token
const session = await account.createSession(userId, secret);
```

### 4i. MFA (Multi-Factor Authentication)

```typescript
// Enable MFA on account
await account.updateMFA(true);

// Create MFA challenge
const challenge = await account.createMfaChallenge("totp"); // or "email", "phone"

// Verify MFA challenge
await account.updateMfaChallenge(challenge.$id, "123456");

// List MFA factors
const factors = await account.listMfaFactors();
```

### 4j. Account Management

```typescript
// Update name
await account.updateName("New Name");

// Update email
await account.updateEmail("new@email.com", "currentPassword");

// Update password
await account.updatePassword("newPassword", "currentPassword");

// Update preferences (custom key-value data)
await account.updatePrefs({ theme: "dark", notifications: true });

// Get preferences
const prefs = await account.getPrefs();

// Email verification
await account.createVerification("http://localhost:3000/verify-email");
// Then on verify page:
await account.updateVerification(userId, secret);

// Password recovery
await account.createRecovery(
  "user@example.com",
  "http://localhost:3000/reset-password"
);
// Then on reset page:
await account.updateRecovery(userId, secret, "newPassword");

// List sessions
const sessions = await account.listSessions();

// Get session by ID
const session = await account.getSession("current");
```

### 4k. Server-Side User Management (Admin)

Using the Node SDK with API key:

```typescript
import { createAdminClient } from "@/lib/appwrite/server";

const { users } = createAdminClient();

// List all users
const usersList = await users.list();

// Get a specific user
const user = await users.get("userId");

// Create user from server
const newUser = await users.create(
  ID.unique(),
  "user@example.com",
  "+14255551234", // phone (optional)
  "password123",
  "John Doe"      // name (optional)
);

// Delete user
await users.delete("userId");

// Update user labels (for custom roles)
await users.updateLabels("userId", ["admin", "premium"]);

// Get user preferences
const prefs = await users.getPrefs("userId");

// Update user preferences
await users.updatePrefs("userId", { plan: "pro" });

// List user sessions
const sessions = await users.listSessions("userId");

// Delete all user sessions (force logout)
await users.deleteSessions("userId");
```

---

## 5. Databases

Appwrite Databases follow this hierarchy:
**Database → Collection (Table) → Document (Row) → Attributes (Columns)**

### 5a. Core Concepts

- **Database:** Top-level container. A project can have multiple databases.
- **Collection / Table:** Like a database table. Contains documents/rows with defined attributes/columns.
- **Attributes / Columns:** Define the schema — types like string, integer, boolean, etc.
- **Document / Row:** A single record in a collection/table.
- **Indexes:** Improve query performance. Required for ordering and full-text search.

### 5b. Attribute Types

| Type | Description | Options |
|------|-------------|---------|
| `string` | Text data | `size` (max chars), `default`, `required`, `array` |
| `integer` | Whole numbers | `min`, `max`, `default`, `required`, `array` |
| `float` | Decimal numbers | `min`, `max`, `default`, `required`, `array` |
| `boolean` | true/false | `default`, `required`, `array` |
| `datetime` | ISO 8601 datetime | `default`, `required`, `array` |
| `email` | Email address | `default`, `required`, `array` |
| `url` | URL string | `default`, `required`, `array` |
| `ip` | IP address | `default`, `required`, `array` |
| `enum` | Predefined values | `elements[]`, `default`, `required`, `array` |
| `relationship` | Links between collections | See relationships section |

### 5c. Creating a Database & Collection (Server / Console)

```typescript
import { createAdminClient } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";

const { databases } = createAdminClient();

// Create database
const db = await databases.create(ID.unique(), "MainDB");

// Create collection (table)
const collection = await databases.createCollection(
  db.$id,             // databaseId
  ID.unique(),        // collectionId
  "users_profiles",   // name
  [                   // permissions (optional)
    Permission.read(Role.users()),
    Permission.create(Role.users()),
  ],
  false,  // documentSecurity (per-document permissions)
  true    // enabled
);

// Add attributes (columns)
await databases.createStringAttribute(db.$id, collection.$id, "bio", 500, false);
await databases.createIntegerAttribute(db.$id, collection.$id, "age", false, 0, 150);
await databases.createBooleanAttribute(db.$id, collection.$id, "isPublic", false, true);
await databases.createEmailAttribute(db.$id, collection.$id, "contactEmail", false);
await databases.createEnumAttribute(db.$id, collection.$id, "plan", ["free", "pro", "enterprise"], false, "free");
await databases.createDatetimeAttribute(db.$id, collection.$id, "joinedAt", false);
await databases.createUrlAttribute(db.$id, collection.$id, "website", false);

// Create indexes (required for ordering & full-text search)
await databases.createIndex(db.$id, collection.$id, "idx_age", "key", ["age"]);
await databases.createIndex(db.$id, collection.$id, "idx_bio_search", "fulltext", ["bio"]);
await databases.createIndex(db.$id, collection.$id, "idx_email_unique", "unique", ["contactEmail"]);
```

### 5d. CRUD Operations (Client-Side)

```typescript
import { databases, ID, Query } from "@/lib/appwrite/client";

const DATABASE_ID = "your_database_id";
const COLLECTION_ID = "your_collection_id";

// CREATE a document/row
const doc = await databases.createDocument(
  DATABASE_ID,
  COLLECTION_ID,
  ID.unique(),
  {
    bio: "Hello world",
    age: 25,
    isPublic: true,
    contactEmail: "john@example.com",
    plan: "pro",
  },
  [
    // Optional: per-document permissions
    Permission.read(Role.any()),
    Permission.update(Role.user("userId")),
    Permission.delete(Role.user("userId")),
  ]
);

// READ a single document
const document = await databases.getDocument(
  DATABASE_ID,
  COLLECTION_ID,
  "document_id"
);

// LIST documents with queries
const results = await databases.listDocuments(
  DATABASE_ID,
  COLLECTION_ID,
  [
    Query.equal("plan", ["pro"]),
    Query.greaterThan("age", 18),
    Query.orderDesc("$createdAt"),
    Query.limit(25),
    Query.offset(0),
  ]
);
// results.documents — array of documents
// results.total — total count

// UPDATE a document
const updated = await databases.updateDocument(
  DATABASE_ID,
  COLLECTION_ID,
  "document_id",
  { bio: "Updated bio" }
);

// DELETE a document
await databases.deleteDocument(
  DATABASE_ID,
  COLLECTION_ID,
  "document_id"
);
```

### 5e. Query Reference (Complete)

```typescript
import { Query } from "appwrite";

// --- COMPARISON ---
Query.equal("field", ["value1", "value2"])       // field == value1 OR value2
Query.notEqual("field", "value")                 // field != value
Query.lessThan("field", 10)                      // field < 10
Query.lessThanEqual("field", 10)                 // field <= 10
Query.greaterThan("field", 10)                   // field > 10
Query.greaterThanEqual("field", 10)              // field >= 10
Query.between("field", 5, 10)                    // 5 <= field <= 10
Query.notBetween("field", 5, 10)                 // field < 5 OR field > 10

// --- NULL CHECKS ---
Query.isNull("field")                            // field is null
Query.isNotNull("field")                         // field is not null

// --- STRING OPERATIONS ---
Query.startsWith("field", "prefix")              // field starts with "prefix"
Query.endsWith("field", "suffix")                // field ends with "suffix"
Query.contains("field", "substring")             // field contains "substring"
Query.contains("arrayField", ["a", "b"])         // array contains elements
Query.search("field", "search terms")            // full-text search (needs fulltext index)

// --- LOGICAL OPERATORS ---
Query.and([Query.greaterThan("age", 18), Query.lessThan("age", 65)])
Query.or([Query.equal("status", ["active"]), Query.equal("role", ["admin"])])

// --- ORDERING ---
Query.orderAsc("field")                          // ascending (field must be indexed)
Query.orderDesc("field")                         // descending (field must be indexed)

// --- PAGINATION ---
Query.limit(25)                                  // max results (default 25)
Query.offset(0)                                  // skip N results
Query.cursorAfter("documentId")                  // cursor-based pagination
Query.cursorBefore("documentId")                 // cursor-based pagination (backwards)

// --- SELECTION ---
Query.select(["field1", "field2"])               // only return these fields

// --- TIME HELPERS ---
Query.createdBefore("2025-01-01T00:00:00Z")
Query.createdAfter("2025-01-01T00:00:00Z")
Query.updatedBefore("2025-01-01T00:00:00Z")
Query.updatedAfter("2025-01-01T00:00:00Z")
```

### 5f. Complex Query Example

```typescript
// Find books under $20 OR magazines under $10
const results = await databases.listDocuments(DB_ID, COL_ID, [
  Query.or([
    Query.and([
      Query.equal("category", ["books"]),
      Query.lessThan("price", 20),
    ]),
    Query.and([
      Query.equal("category", ["magazines"]),
      Query.lessThan("price", 10),
    ]),
  ]),
]);
```

### 5g. Relationships

**Types:**
| Type | Example |
|------|---------|
| One-to-One | User ↔ Profile |
| One-to-Many | User → Posts |
| Many-to-One | Posts → Category |
| Many-to-Many | Posts ↔ Tags |

**Directionality:**
- **One-way:** Only parent sees the relationship
- **Two-way:** Both sides can traverse the relationship

**On-Delete Behavior:**
- `restrict` — Cannot delete parent if children exist
- `cascade` — Deleting parent also deletes children
- `set null` — Deleting parent sets child's relationship column to null

**Creating relationships (Server SDK):**

```typescript
await databases.createRelationshipAttribute(
  DATABASE_ID,
  PARENT_COLLECTION_ID,
  CHILD_COLLECTION_ID,
  "one-to-many",     // type: one-to-one, one-to-many, many-to-one, many-to-many
  true,              // twoWay
  "posts",           // key (attribute name on parent)
  "author",          // twoWayKey (attribute name on child)
  "cascade"          // onDelete: restrict, cascade, set null
);
```

**Querying relationships:**

```typescript
// Relationships are opt-in loaded — by default only IDs are returned
// Use Query.select() to load related data
const results = await databases.listDocuments(DB_ID, COL_ID, [
  Query.select(["*", "posts.*"]),              // Load all fields + all post fields
  Query.select(["name", "posts.title"]),       // Only specific fields
  Query.select(["*", "posts.*", "posts.comments.*"]), // Nested (max 3 levels deep)
]);

// Filter by relationship fields
const results = await databases.listDocuments(DB_ID, POSTS_COL_ID, [
  Query.equal("author.name", ["John"]),
]);
```

**Limitations:**
- Max 3 levels of nesting
- Relationship key, type, and directionality cannot be updated after creation
- Only on-delete behavior can be updated

### 5h. Index Types

| Type | Purpose |
|------|---------|
| `key` | General queries, ordering |
| `unique` | Enforce uniqueness |
| `fulltext` | Full-text search with `Query.search()` |

---

## 6. Storage

### 6a. Core Concepts

- **Bucket:** Container for files (like a folder with rules)
- **File:** Any uploaded file — images, PDFs, videos, etc.
- Buckets have configurable: max file size (up to 30MB), allowed extensions, compression, encryption, antivirus, image transformations

### 6b. Create Bucket (Server/Console)

```typescript
import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Permission, Role } from "node-appwrite";

const { storage } = createAdminClient();

const bucket = await storage.createBucket(
  ID.unique(),
  "profile_images",
  [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ],
  false,          // fileSecurity (per-file permissions)
  true,           // enabled
  10 * 1024 * 1024, // maximumFileSize (10MB in bytes)
  ["jpg", "png", "webp", "gif"], // allowedFileExtensions
  "gzip",         // compression: none, gzip, zstd
  true,           // encryption
  true,           // antivirus
  true            // transformations (image resize/crop)
);
```

### 6c. File Operations (Client-Side)

```typescript
import { storage, ID } from "@/lib/appwrite/client";

const BUCKET_ID = "your_bucket_id";

// UPLOAD a file
const file = await storage.createFile(
  BUCKET_ID,
  ID.unique(),
  document.getElementById("fileInput").files[0], // File object from input
  [
    // Optional: per-file permissions
    Permission.read(Role.any()),
    Permission.update(Role.user("userId")),
    Permission.delete(Role.user("userId")),
  ]
);

// GET file metadata
const fileInfo = await storage.getFile(BUCKET_ID, "fileId");

// DOWNLOAD file (returns URL)
const downloadUrl = storage.getFileDownload(BUCKET_ID, "fileId");

// VIEW file (returns URL — opens in browser)
const viewUrl = storage.getFileView(BUCKET_ID, "fileId");

// PREVIEW file (image) with transformations
const previewUrl = storage.getFilePreview(
  BUCKET_ID,
  "fileId",
  400,     // width (optional)
  400,     // height (optional)
  "center", // gravity: center, top-left, top, top-right, left, right, bottom-left, bottom, bottom-right
  90,      // quality 0-100 (optional)
  0,       // borderWidth (optional)
  "",      // borderColor (optional)
  0,       // borderRadius (optional)
  1,       // opacity 0-1 (optional)
  0,       // rotation 0-360 (optional)
  "",      // background color (optional)
  "webp"   // output format: jpg, png, gif, webp (optional)
);

// LIST files in bucket
const files = await storage.listFiles(BUCKET_ID, [
  Query.limit(25),
  Query.orderDesc("$createdAt"),
]);

// DELETE a file
await storage.deleteFile(BUCKET_ID, "fileId");
```

### 6d. Server-Side File Upload (Node SDK)

```typescript
import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "@/lib/appwrite/server";

const { storage } = createAdminClient();

// Upload from file path
await storage.createFile(
  BUCKET_ID,
  ID.unique(),
  InputFile.fromPath("/path/to/file.jpg", "file.jpg")
);

// Upload from buffer
await storage.createFile(
  BUCKET_ID,
  ID.unique(),
  InputFile.fromBuffer(buffer, "file.jpg")
);

// Upload from plain text
await storage.createFile(
  BUCKET_ID,
  ID.unique(),
  InputFile.fromPlainText("Hello World", "hello.txt")
);
```

### 6e. Important Notes

- Files above **5MB** are automatically uploaded in chunks by the SDK
- Compression, encryption, and antivirus are skipped for files above **20MB**
- Max file size per bucket: **30MB**
- Image transformations must be enabled on the bucket to use `getFilePreview` with transform options

---

## 7. Functions

Appwrite Functions are serverless functions that run in isolated containers.

### 7a. Core Concepts

- **Runtimes:** Node.js, Python, PHP, Ruby, Dart, Deno, Swift, Kotlin, Java, C++, .NET, Bun
- **Triggers:** HTTP requests, scheduled (cron), Appwrite events, SDK methods
- Each function gets its own URL endpoint
- Functions have their own environment variables
- Functions can use the Node SDK internally

### 7b. Function Structure (Node.js)

```javascript
// src/main.js
import { Client, Databases } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  // Initialize Appwrite client inside the function
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"]); // Auto-injected API key

  const databases = new Databases(client);

  // Logging
  log("Function executed!");
  error("Something went wrong!"); // Error logging

  // Request data
  const { method, headers, body, query, path } = req;

  // Parse body (if JSON)
  const data = JSON.parse(body);

  // Response methods
  if (method === "GET") {
    return res.text("Hello World");           // Plain text
  }

  return res.json({ message: "Success" });     // JSON response
  // Also available: res.redirect(url), res.empty()
};
```

### 7c. Creating Functions

Functions are typically managed via:
1. **Appwrite Console** — UI-based creation and deployment
2. **Appwrite CLI** — `appwrite functions create` and `appwrite deploy function`
3. **Git integration** — Auto-deploy from GitHub/GitLab

### 7d. Triggers

| Trigger | Description |
|---------|-------------|
| **HTTP** | Function has its own URL, accessible via GET/POST/etc. |
| **Schedule** | Cron expression (e.g., `0 */6 * * *` for every 6 hours) |
| **Events** | React to Appwrite events (e.g., `databases.*.collections.*.documents.*.create`) |

### 7e. Environment Variables

Set via Console or CLI. Automatically available:
- `APPWRITE_FUNCTION_PROJECT_ID` — Current project ID
- `APPWRITE_FUNCTION_API_ENDPOINT` — Appwrite API endpoint

### 7f. When to use Functions

- Custom backend logic (e.g., send welcome email after signup)
- Webhooks from third-party services
- Scheduled jobs (cron) — cleanup, reports, notifications
- Complex data processing that shouldn't run on the client
- Integrating with external APIs (Stripe, OpenAI, etc.)

---

## 8. Realtime

Appwrite Realtime uses **WebSocket** to push live updates to connected clients.

### 8a. Important: Client SDK Only

Realtime is **only available with the Web (Client) SDK**. Server SDKs do not support realtime subscriptions.

### 8b. Subscribing to Channels

```typescript
import { client } from "@/lib/appwrite/client";

// Subscribe to account events
const unsubscribe = client.subscribe("account", (response) => {
  console.log(response.events);  // e.g., ["users.*.update"]
  console.log(response.payload); // Updated data
});

// Subscribe to document changes in a collection
const unsubscribe = client.subscribe(
  `databases.${DB_ID}.collections.${COL_ID}.documents`,
  (response) => {
    if (response.events.includes("databases.*.collections.*.documents.*.create")) {
      console.log("New document:", response.payload);
    }
    if (response.events.includes("databases.*.collections.*.documents.*.update")) {
      console.log("Updated document:", response.payload);
    }
    if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
      console.log("Deleted document:", response.payload);
    }
  }
);

// Subscribe to file uploads in a bucket
const unsubscribe = client.subscribe(
  `buckets.${BUCKET_ID}.files`,
  (response) => {
    console.log("File event:", response.payload);
  }
);

// Subscribe to multiple channels
const unsubscribe = client.subscribe(
  ["account", `databases.${DB_ID}.collections.${COL_ID}.documents`],
  (response) => {
    console.log(response);
  }
);

// ALWAYS unsubscribe when component unmounts
unsubscribe();
```

### 8c. Available Channels

| Channel | Description |
|---------|-------------|
| `account` | All account events (name update, session create, etc.) |
| `documents` | Any document CRUD in any collection |
| `databases.<ID>.collections.<ID>.documents` | Documents in a specific collection |
| `databases.<ID>.collections.<ID>.documents.<ID>` | A specific document |
| `files` | Any file CRUD in any bucket |
| `buckets.<ID>.files` | Files in a specific bucket |
| `buckets.<ID>.files.<ID>` | A specific file |
| `executions` | Any function execution |
| `functions.<ID>` | Executions of a specific function |
| `teams` | Any team CRUD |
| `teams.<ID>` | A specific team |
| `memberships` | Any membership CRUD |
| `memberships.<ID>` | A specific membership |

### 8d. Response Payload Structure

```typescript
{
  events: string[],    // e.g., ["databases.*.collections.*.documents.*.create"]
  channels: string[],  // Channels that received this event
  timestamp: string,   // ISO 8601 UTC timestamp
  payload: object      // The full resource data (document, file, etc.)
}
```

### 8e. Important Notes

- Realtime respects **permissions** — users only receive events for resources they have read access to
- If you authenticate after subscribing, you must **re-create** the subscription
- Each SDK creates a **single WebSocket** connection for all subscriptions
- Adding/removing subscriptions recreates the connection

### 8f. React Pattern

```typescript
"use client";
import { useEffect } from "react";
import { client } from "@/lib/appwrite/client";

export function useRealtimeDocuments(databaseId: string, collectionId: string, callback: (payload: any) => void) {
  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${databaseId}.collections.${collectionId}.documents`,
      (response) => {
        callback(response.payload);
      }
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, [databaseId, collectionId, callback]);
}
```

---

## 9. Teams

Teams provide group-based access control.

### 9a. Creating & Managing Teams

```typescript
import { teams, ID } from "@/lib/appwrite/client";

// Create a team
const team = await teams.create(ID.unique(), "Engineering");

// List teams
const teamsList = await teams.list();

// Get a team
const team = await teams.get("teamId");

// Update team name
await teams.updateName("teamId", "New Name");

// Delete team
await teams.delete("teamId");
```

### 9b. Memberships

```typescript
// Invite member (sends email invitation)
const membership = await teams.createMembership(
  "teamId",
  ["editor"],          // roles
  "user@example.com",  // email
  undefined,           // userId (optional, alternative to email)
  undefined,           // phone (optional)
  "http://localhost:3000/accept-invite" // redirect URL
);

// List members
const members = await teams.listMemberships("teamId");

// Update member roles
await teams.updateMembership("teamId", "membershipId", ["admin"]);

// Delete membership (remove member)
await teams.deleteMembership("teamId", "membershipId");
```

### 9c. Team Roles in Permissions

```typescript
// Any team member can read
Permission.read(Role.team("teamId"))

// Only team members with "admin" role
Permission.update(Role.team("teamId", "admin"))

// Specific membership
Permission.read(Role.member("membershipId"))
```

---

## 10. Messaging

Appwrite Messaging supports **Email**, **SMS**, and **Push Notifications**.

### 10a. Providers

Configure providers in the Appwrite Console:

| Channel | Providers |
|---------|-----------|
| **Email** | Mailgun, SendGrid, SMTP |
| **SMS** | Twilio, Vonage, Textmagic, MSG91 |
| **Push** | FCM (Firebase), APNS (Apple) |

### 10b. Sending Messages (Server SDK Only)

```typescript
import { Messaging } from "node-appwrite";

const messaging = new Messaging(adminClient);

// Send email
await messaging.createEmail(
  ID.unique(),
  "Subject Line",
  "<h1>Hello!</h1><p>Welcome to our app.</p>", // HTML content
  [],        // topics
  ["userId"], // users
  [],        // targets
  [],        // cc
  [],        // bcc
  false,     // draft
  false,     // html (set true for HTML content)
  undefined  // scheduledAt (ISO 8601 for scheduled send)
);

// Send SMS
await messaging.createSms(
  ID.unique(),
  "Your verification code is 123456",
  [],        // topics
  ["userId"], // users
  [],        // targets
  false,     // draft
  undefined  // scheduledAt
);

// Send push notification
await messaging.createPush(
  ID.unique(),
  "New Message!",       // title
  "You have a new message from John", // body
  [],        // topics
  ["userId"], // users
  [],        // targets
  {},        // data (custom payload)
  undefined, // action
  undefined, // image
  undefined, // icon
  undefined, // sound
  undefined, // color
  undefined, // tag
  undefined, // badge
  false,     // draft
  undefined  // scheduledAt
);
```

### 10c. Topics (Subscriber Groups)

```typescript
// Create a topic
const topic = await messaging.createTopic(ID.unique(), "newsletter");

// Subscribe a user to a topic
await messaging.createSubscriber(
  "topicId",
  ID.unique(),
  "userId",
  "targetId" // The user's messaging target (email, phone, or device)
);

// Send to all subscribers of a topic
await messaging.createEmail(
  ID.unique(),
  "Weekly Newsletter",
  "<p>This week's updates...</p>",
  ["topicId"], // topics
);
```

---

## 11. Avatars

Generate dynamic images for your app.

```typescript
import { avatars } from "@/lib/appwrite/client";

// User initials avatar (shows "JD" for "John Doe")
const initialsUrl = avatars.getInitials(
  "John Doe", // name
  100,         // width (optional)
  100,         // height (optional)
  "4F46E5"     // background color hex (optional)
);

// Browser icon/favicon
const faviconUrl = avatars.getBrowser("chrome");

// Country flag
const flagUrl = avatars.getFlag("us"); // ISO 3166-1 country code

// QR code
const qrUrl = avatars.getQR(
  "https://example.com", // text/URL to encode
  400,                    // size (optional)
  1,                      // margin (optional)
  false                   // download (optional)
);

// Get favicon of a website
const siteIconUrl = avatars.getFavicon("https://google.com");

// Credit card icon
const cardUrl = avatars.getCreditCard("visa"); // visa, mastercard, amex, etc.

// Image from URL (cached & optimized)
const imageUrl = avatars.getImage("https://example.com/photo.jpg", 200, 200);
```

---

## 12. Locale

Get locale-related data for internationalization.

```typescript
import { Locale } from "appwrite";

const locale = new Locale(client);

// Get user's locale based on IP
const userLocale = await locale.get();

// List all supported countries
const countries = await locale.listCountries();

// List EU countries
const euCountries = await locale.listCountriesEU();

// List phone country codes
const phoneCodes = await locale.listCountriesPhones();

// List continents
const continents = await locale.listContinents();

// List currencies
const currencies = await locale.listCurrencies();

// List languages
const languages = await locale.listLanguages();
```

---

## 13. Permissions System

### 13a. Permission Types

| Permission | Description | Applies To |
|------------|-------------|------------|
| `Permission.read()` | Read access | Documents, files |
| `Permission.create()` | Create new resources | Collections, buckets (NOT documents/files) |
| `Permission.update()` | Modify existing resource | Documents, files |
| `Permission.delete()` | Remove resource | Documents, files |
| `Permission.write()` | Alias for create + update + delete | Collections, buckets |

### 13b. Roles

| Role | Description |
|------|-------------|
| `Role.any()` | Anyone (authenticated or not) |
| `Role.guests()` | Only unauthenticated users |
| `Role.users()` | Any authenticated user |
| `Role.users("verified")` | Only verified users |
| `Role.user("userId")` | Specific user by ID |
| `Role.user("userId", "verified")` | Specific verified user |
| `Role.team("teamId")` | Any member of a team |
| `Role.team("teamId", "admin")` | Team members with specific role |
| `Role.member("membershipId")` | Specific team membership |
| `Role.label("labelId")` | All users with a specific label |

### 13c. Default Behavior

- **Server SDK (with API key):** Bypasses ALL permissions
- **Client SDK (no permissions set):** Creator gets read, update, delete by default
- **Server SDK (no permissions set):** No one can access (empty permissions)

### 13d. Document Security

When **document security** is enabled on a collection:
- Users need EITHER collection-level OR document-level permission to access a document
- This allows per-document access control

When **disabled** (default):
- Only collection-level permissions are checked

### 13e. Private Documents Pattern

```typescript
// Collection: Enable document security, grant CREATE to all users
// When creating documents, set per-user permissions:
const doc = await databases.createDocument(DB_ID, COL_ID, ID.unique(),
  { title: "My Private Note" },
  [
    Permission.read(Role.user(currentUserId)),
    Permission.update(Role.user(currentUserId)),
    Permission.delete(Role.user(currentUserId)),
  ]
);
```

---

## 14. Next.js SSR Integration

### 14a. How SSR Auth Works with Appwrite

1. User enters credentials in the browser
2. Browser sends credentials to your Next.js server (API route / server action)
3. Server uses **Node SDK** to authenticate with Appwrite
4. Appwrite returns a session
5. Server stores the session secret in a **cookie** and sends it to the browser
6. Browser includes the cookie in subsequent requests
7. Server reads the cookie and uses it with `setSession()` to act on behalf of the user

### 14b. SSR Auth Implementation

**Server Action — Login:**

```typescript
// app/actions/auth.ts
"use server";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

export async function login(email: string, password: string) {
  // Create admin client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const account = new Account(client);

  // Create session
  const session = await account.createEmailPasswordSession(email, password);

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("appwrite-session", session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");
  
  if (session) {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(session.value);

    const account = new Account(client);
    await account.deleteSession("current");
  }

  cookieStore.delete("appwrite-session");
}

export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session) return null;

  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(session.value);

    const account = new Account(client);
    return await account.get();
  } catch {
    return null;
  }
}
```

**Server Component — Protected Page:**

```typescript
// app/dashboard/page.tsx
import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return <div>Welcome, {user.name}</div>;
}
```

**Middleware — Route Protection:**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("appwrite-session");
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/register");
  const isProtectedPage = request.nextUrl.pathname.startsWith("/dashboard");

  // Redirect to login if no session on protected pages
  if (isProtectedPage && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if already logged in on auth pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

### 14c. SSR OAuth2 Flow

```typescript
// Server Action — Initiate OAuth
"use server";
import { Client, Account, OAuthProvider } from "node-appwrite";
import { redirect } from "next/navigation";

export async function loginWithGoogle() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const account = new Account(client);

  // Get the OAuth redirect URL
  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    "http://localhost:3000/api/oauth/callback", // success
    "http://localhost:3000/login"               // failure
  );

  redirect(redirectUrl);
}

// API Route — OAuth Callback
// app/api/oauth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const account = new Account(client);
  const session = await account.createSession(userId, secret);

  const cookieStore = await cookies();
  cookieStore.set("appwrite-session", session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

### 14d. Rate Limits

- Unauthenticated server requests share the server's IP — subject to rate limits
- Using an **API key** bypasses rate limits
- Anonymous sessions give each user their own rate limit without an API key

---

## 15. Feature Relevance for Hatch

### Features We NEED

| Feature | Why | Priority |
|---------|-----|----------|
| **Authentication (Email/Password)** | Core user registration & login | HIGH |
| **OAuth2 (Google, GitHub)** | Social login for convenience | HIGH |
| **Databases** | Store user profiles, ideas, projects, feedback | HIGH |
| **Storage** | User avatars, project images, file attachments | HIGH |
| **Permissions** | Control who can see/edit what | HIGH |
| **Teams** | If users collaborate on ideas/projects | MEDIUM |
| **Realtime** | Live updates on dashboards, notifications | MEDIUM |
| **Avatars (Initials)** | Auto-generated profile pictures | LOW |

### Features We PROBABLY DON'T Need (For Now)

| Feature | Why Not |
|---------|---------|
| **Functions** | We have Next.js API routes & server actions — no need for separate serverless functions unless we need event-driven triggers |
| **Messaging (Email/SMS/Push)** | Only if we need transactional emails or notifications — can use Functions or a third-party instead |
| **Phone/SMS Auth** | Email + OAuth covers most use cases |
| **MFA** | Nice-to-have, not MVP-critical |
| **Magic URL** | Email/password + OAuth is sufficient for now |
| **Locale** | Only needed for i18n, which isn't in scope yet |
| **Geo/Spatial Queries** | Not relevant to our use case |
| **Custom Token Auth** | Only for external auth system integration |

---

## Quick Reference: Common Imports

```typescript
// Client-side (browser)
import { Client, Account, Databases, Storage, Teams, Avatars, ID, Query, Permission, Role } from "appwrite";

// Server-side (API routes, server actions)
import { Client, Account, Databases, Storage, Users, Teams, ID, Query, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
```

## Links

- [Appwrite Console](https://cloud.appwrite.io/console)
- [Appwrite Docs](https://appwrite.io/docs)
- [Web SDK Reference](https://appwrite.io/docs/references/cloud/client-web)
- [Node SDK Reference](https://appwrite.io/docs/references/cloud/server-nodejs)
- [Permissions Guide](https://appwrite.io/docs/advanced/platform/permissions)
- [Next.js Quick Start](https://appwrite.io/docs/quick-starts/nextjs)
- [SSR Auth Guide](https://appwrite.io/docs/products/auth/server-side-rendering)
- [Realtime API](https://appwrite.io/docs/apis/realtime)
