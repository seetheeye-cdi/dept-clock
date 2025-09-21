Of course. As a senior technical architect, my focus is on creating a blueprint that is lean, robust, and directly serves the product goals without unnecessary complexity. The original TRD was more of a file structure convention than an architectural document.

This refined TRD outlines the *system*, its *data flows*, and the *core logic*, providing a clear and direct path for implementation.

---

# **Technical Requirements Document (TRD) – Korea National Debt Clock**

## 1. Guiding Principles

-   **Simplicity First:** Implement the most direct path to achieve MVP features. Leverage platform-as-a-service (PaaS) capabilities to minimize infrastructure management.
-   **Performance is the Feature:** The user's "Wow!" experience depends on a fast load and a smooth, uninterrupted counter. All technical decisions must prioritize this.
-   **Stateless & Scalable:** The core application will be a static shell hydrated with real-time data, designed to handle viral traffic spikes via edge delivery.

## 2. Core Architecture

The system is composed of three main parts: a fast, responsive frontend; a simple, managed backend for data persistence and business logic; and a scheduled job for data ingestion.

```mermaid
graph TD
    subgraph Browser
        User(👤 User)
    end

    subgraph Vercel Edge Network
        WebApp[Next.js App]
        SSE_Endpoint[/api/sse]
    end

    subgraph Supabase (Backend Platform)
        DB[(PostgreSQL)]
        Cron[Cron Job: Daily Data Sync]
        API[API: Subscribe]
    end

    subgraph External
        DataSource[🏛️ Public Data Source API/Site]
    end

    User -- Requests Page --> WebApp
    WebApp -- Serves Static Shell --> User
    User -- Establishes Connection --> SSE_Endpoint
    SSE_Endpoint -- Pushes Updates --> User
    WebApp -- Reads/Writes --> DB
    WebApp -- Calls --> API

    Cron -- Fetches Data --> DataSource
    Cron -- Updates --> DB
    DB -- Triggers Update Push --> SSE_Endpoint
```

## 3. System Components & Data Flow

### 3.1. Frontend (Next.js on Vercel)

-   **Responsibility:** UI rendering, real-time counter animation, and user interaction (sharing, subscribing).
-   **Framework:** Next.js with App Router. The main page will be statically generated at build time (`SSG`) and revalidated periodically to ensure fast initial loads (LCP < 2.5s).
-   **Real-time Counter Logic (Critical):**
    1.  On page load, the client fetches the `base_debt_amount` and `increase_rate_per_second` once.
    2.  The counter animation is handled **entirely on the client-side** using `requestAnimationFrame`.
    3.  The displayed value is calculated in real-time in the browser: `currentDebt = base_debt_amount + (increase_rate_per_second * seconds_since_base_update)`.
    4.  This approach guarantees a smooth 60fps counter independent of network latency and dramatically reduces server load.
-   **Server-Sent Events (SSE):**
    -   A single SSE endpoint (`/api/sse`) is established on page load.
    -   Its **only purpose** is to push a notification to the client when the `base_debt_amount` or `increase_rate_per_second` is updated in the database (e.g., due to a policy event).
    -   Upon receiving a push, the client re-fetches the base values and seamlessly continues the client-side calculation from the new baseline. This is efficient and robust.

### 3.2. Backend (Supabase)

-   **Responsibility:** Data persistence, scheduled tasks, and transactional APIs (e.g., subscriptions).
-   **Database (PostgreSQL):**
    -   A single table, `debt_state`, will store the core parameters.
    -   A `alert_subscribers` table for KakaoTalk user IDs.
-   **Policy Event Logic:** This is simplified to a manual process for the MVP. An admin updates the `increase_rate_per_second` in the `debt_state` table via the Supabase dashboard. This action will trigger a database function that pushes a notification through the SSE channel.
-   **KakaoTalk Alerts (Cron Job):**
    -   A Supabase Cron Job is scheduled to run daily at 09:00 KST.
    -   The job executes a serverless Edge Function that:
        1.  Reads the current `base_debt_amount` and `rate`.
        2.  Calculates the current total debt.
        3.  Fetches all user IDs from the `alert_subscribers` table.
        4.  Loops through subscribers and sends a templated message via the KakaoTalk API.

## 4. Database Schema (Minimalist)

**Table: `debt_state`** (Singleton table, only one row)

| Column Name                 | Type      | Description                                                               |
| --------------------------- | --------- | ------------------------------------------------------------------------- |
| `id`                        | `int`     | Primary Key (always 1)                                                    |
| `base_debt_amount`          | `bigint`  | The foundational debt number (e.g., 1,200,000,000,000,000 KRW).           |
| `increase_rate_per_second`  | `numeric` | The amount the debt increases per second. The core of the "speed".        |
| `population_base`           | `int`     | Base population for per-capita calculation (defaults to 50,000,000).      |
| `last_updated_at`           | `timestamptz` | Timestamp of the last base value update. Used for client calculation. |
| `data_source_name`          | `text`    | Human-readable name of the data source (e.g., "Ministry of Finance").    |

**Table: `alert_subscribers`**

| Column Name     | Type     | Description                                     |
| --------------- | -------- | ----------------------------------------------- |
| `id`            | `uuid`   | Primary Key                                     |
| `kakao_user_id` | `text`   | The user identifier for the KakaoTalk API. Unique. |
| `created_at`    | `timestamptz` | Timestamp of subscription.                    |

## 5. API Endpoints

-   **`GET /`**: Main page. Statically generated, served from Vercel's Edge Network.
-   **`GET /api/sse`**: Establishes a Server-Sent Events connection. Pushes a simple `{ "type": "update" }` message when `debt_state` changes.
-   **`GET /api/state`**: Fetches the single row from the `debt_state` table. Called by the client on initial load and after receiving an SSE update message.
-   **`POST /api/subscribe`**:
    -   **Body:** `{ "kakaoUserId": "string" }`
    -   **Action:** Inserts a new record into the `alert_subscribers` table.

## 6. Non-Functional Requirements (Implementation Strategy)

-   **Performance:**
    -   **LCP < 2.5s:** Achieved via Next.js SSG and Vercel Edge deployment.
    -   **60fps Counter:** Guaranteed by pure client-side calculation using `requestAnimationFrame`.
-   **Reliability:**
    -   The UI will explicitly display the `data_source_name` and `last_updated_at` values from the `/api/state` endpoint.
-   **Scalability:**
    -   The architecture is inherently scalable for the target DAU. Vercel and Supabase auto-scale. The client-side calculation logic prevents the server from becoming a bottleneck during traffic spikes.
-   **Accessibility:**
    -   Use `aria-live="polite"` on the counter element to announce changes to screen readers, but not so frequently as to be disruptive. Standard semantic HTML and keyboard navigation will be implemented.

---
**Architect's Note:** This design strictly avoids over-engineering. There is no need for complex state management libraries (React Query is sufficient for the simple data fetch), microservices, or a dedicated backend server. By delegating heavy lifting to the client (counter animation) and managed services (Supabase Cron, Vercel Edge), we build a system that is cheap to run, easy to maintain, and exceptionally fast for the end-user, directly fulfilling the core PRD goals.