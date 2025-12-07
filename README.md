# 🚀 FinexaLoans Loan Management System: Comprehensive Technical Blueprint

## 1. FinexaLoans Loan Management System - Group 10
This document serves as the **Technical Documentation and System Architecture** for the **FinexaLoans Loan Management System**. It was developed by **Group 10**.

The system utilizes a **Client-Serverless** architecture, relying on client-side JavaScript for logic and **Supabase (PostgreSQL)** as its Backend-as-a-Service (BaaS).



### Group 10 Contributor Listing

| **Area** | **Name** | **Matric** |
| :--- | :--- | :--- |
| **Frontend Development** | ADEBIYI SAMUEL OLAYINKA | 22/1923 |
| | AJIROTUTU PRAISE DASOLA | 22/1539 |
| | ALLINSON ADEWALE IBRAHIM | 22/0868 |
| | ISAAC DIVINE OCHUKO | 22/0515 |
| | MADUBOM JOY | 22/3022 |
| | NNAEMEKA CHRISTOPHER | 22/2181 |
| | OKON ISRAEL EYIBIO | 22/1677 |
| | ONYEODIZIELU UGOCHUKWU M. | 22/1161 |
| | VICTOR DAKOH IKPEMINOGHENA | 22/2957 |
| | YISA MORDECAI | 22/1890 |
| | Ene-Dede Precious Deinma | 22/2420 |
| | Okafor Ebubechukwu Samuel | 22/2332 |
| | Nyuiring-Yohrhagninyui | 21/3135 |
| | Odedele Segun | 21/1850 |
| | Obisanya Dominion | 22/1822 |
| | Epebinu Ayomipo Daniel | 22/2423 |
| | Agi Vine Ozioma | 22/3087 |
| | Ifunanya Osonwa | 22/2911 |
| | Ogiye Jennifer | 22/2585 |
| | Oranika John | 22/2994 |
| **Database Design** | Olugbeje Boluwatife Modupe | 22/2408 |
| | Chigbo Chidubem | 17/1740 |
| | Solomon Chukwuemeka Marvelous | 22/1889 |
| | Olukoya Ayoola | 20/0096 |
| | Towolawi Omotola Faith | 22/1695 |
| | Udotong Jeremiah William | 22/0843 |
| | Abiola Oluwasemilore Esther | 23/1489 |
| | Ororho Uruemesiri David | 23/2546 |
| | Soji-Oni Ayomide Testimony | 22/1054 |
| | Obih Joan Chidinma | 22/2610 |
| | Enakirerhi Julian | 23/1909 |
| | Obika Martins Akachukwu | 22/1248 |
| | Okpalanajiaku Xavier | 22/2549 |
| | Olatunbosun Eniola David | 22/3058 |
| | Vwarak Bliss-David | 22/3007 |
| | Olubiyi Oluwatise Ikhafoghwe | 22/1148 |
| | Onwusah Dorachima Ifeanyi | 23/0984 |
| **CGI Scripting** | Ibironke Victor Damilola | 23/1084 |
| | Onasanya Grace | 22/2763 |
| | Olatunji Oluwafemi Temitope | 22/0566 |
| | Itamah Osedebame Ehigie | 23/1860 |
| | Nwosu Jason | 22/0927 |
| | Olungwe Christian | 22/0633 |
| | Nathaniel Abraham Owoidighe | 22/1915 |
| | Madagwa Success | 22/2386 |
| | Pinwa Joshua Nwibari | 22/1290 |
| | Oluwafemi Oluwasemilore Esther | 22/1399 |
| | Onyenweaku Chibundu Emmanuel | 21/1872 |
| | Obunadike Nzubechukwu | 23/2932 |
| | Odukoya Eniola Ayooluwa | 22/2221 |
| | Umunna Kenneth | 22/2485 |
| | Ogbonna Somtochukwu David | 22/3026 |
| | Soyinka Oluwadarasimi Toluwalase | 22/1022 |



## 2. Core Architecture and Technology Stack

The system utilizes a **Client-Serverless** architecture, relying on client-side JavaScript for UI logic and Supabase (PostgreSQL) as its Backend-as-a-Service (BaaS).

### 2.1 Technology Stack Summary

| Component | Technology | Rationale and Role |
| :--- | :--- | :--- |
| **Frontend (UI)** | HTML5, Tailwind CSS (CDN), JavaScript ES6+ | Utility-first styling for fast, responsive design. All UI logic runs in the browser. |
| **Logic Layer** | `scripting.js` (ES Module) | A single, modular script to manage all business logic, data fetching, and API calls. |
| **Backend (BaaS)** | Supabase (PostgreSQL) | [cite_start]Provides database, authentication service, and auto-generated RESTful API endpoints[cite: 1, 2, 3, 4]. |
| **Security** | Supabase Auth, Row Level Security (RLS) | [cite_start]Secures the data layer, ensuring a user can only interact with their own data[cite: 5]. |



## 3. Frontend Design and User Flow

The application is built around three pages, each with specific validation and interaction patterns.

### 3.1 Authentication (`auth.html`) and Validation (FR1)

[cite_start]The authentication page provides a seamless switch between sign-in and sign-up modes using the `switchMode()` function[cite: 6].

| Field | Validation Rule (Sign-Up Mode) | UI Implementation |
| :--- | :--- | :--- |
| **Email** | [cite_start]Must match the regex `/\S+@\S+\.\S+/`[cite: 7]. | [cite_start]Inline error message appears below input[cite: 8]. |
| **Password** | [cite_start]Must be at least 8 characters long[cite: 9]. | [cite_start]Input border changes to red (`border-destructive`) on failure[cite: 10]. |
| **NIN** | [cite_start]Must be exactly 11 digits[cite: 11]. | [cite_start]Input uses `oninput="this.value=this.value.replace(/\D/g, '')"` to enforce numeric-only entry[cite: 12, 12, 12, 12]. |

### 3.2 Dashboard (`dashboard.html`) and Dynamic Rendering

The dashboard is dynamically rendered by `renderDashboard()` which runs upon page load.

* [cite_start]**Data Aggregation**: The function calls `fetchLoans()` to retrieve the user's loans and all associated payment records in a single query using Supabase's embedding syntax (`select("*, payments(*)")`)[cite: 13]. [cite_start]This avoids the inefficient **$N+1$ query problem**[cite: 14, 14, 14, 14].
* [cite_start]**Metrics Calculation**: Key metrics—**Active Loans**, **Pending Applications**, and **Completed Loans**—are calculated client-side based on the fetched data and displayed in distinct, color-coded cards[cite: 15].
* [cite_start]**Status Indicators**: Each loan card uses a specific background and text color to instantly indicate status: **'Active'** (Warning/Yellow), **'Pending'** (Info/Blue), **'Paid'** (Success/Green), and **'Past Due'** (Destructive/Red)[cite: 16, 16, 16, 16].



## 4. Database Schema and Persistence

[cite_start]The database is built on a normalized **Third Normal Form (3NF)** relational model to ensure data integrity and avoid redundancy[cite: 17, 17, 17, 17].

### 4.1 Schema Design (`users`, `loans`, `payments`)

| Table | Relationship | Key Fields and Purpose |
| :--- | :--- | :--- |
| **users** | Linked 1:1 with Supabase Auth. | [cite_start]Stores comprehensive personal data like **NIN (Unique)** and **BVN (Optional)**[cite: 18]. [cite_start]`user_id` is the primary key and links to the Auth service[cite: 19]. |
| **loans** | 1:N with `users` (via `borrower_id` FK). | Tracks the loan contract. [cite_start]The `amount` column stores the **current outstanding balance**, not the original principal[cite: 20]. |
| **payments** | 1:N with `loans` (via `loan_id` FK). | An immutable audit trail of all transactions. [cite_start]**ON DELETE CASCADE** ensures payment records are removed if the loan is deleted[cite: 21]. |

### 4.2 Integrity and Constraints (PostgreSQL)

[cite_start]Database constraints are used to enforce business rules at the persistence layer, backing up client-side validation[cite: 22].

* [cite_start]**Uniqueness**: Enforced on `email` and `national_id` to prevent duplicate borrower profiles[cite: 23].
* [cite_start]**Foreign Keys**: `borrower_id` and `loan_id` maintain referential integrity[cite: 24].
* [cite_start]**Check Constraints**: Application-level checks ensure the financial data is valid[cite: 25]. [cite_start]For example, `amount` must be $\ge 0$ and `interest_rate` must be $>0$ and $<1$[cite: 26].
* [cite_start]**Indexing**: Indexes are created on frequently queried foreign keys (`idx_loans_borrower_id`) and status columns (`idx_loans_status`) for performance optimization[cite: 27, 27, 27, 27].



## 5. Scripting Logic and Data Flow

[cite_start]The `scripting.js` module contains all API-related functions and business rule implementation[cite: 28].

### 5.1 Loan Application and Auto-Approval

[cite_start]The `insertNewLoan` function first looks up the interest rate from a constant object (`DashboardConstants.INTEREST_RATES`) based on the selected loan type[cite: 29, 29, 29, 29]. [cite_start]It then constructs a loan record with status: **"Pending"**[cite: 30].

The dashboard then runs a simulated auto-approval process:

1.  [cite_start]On load, `renderDashboard()` detects loans with `status: "Pending"`[cite: 31, 31, 31, 31].
2.  [cite_start]It calls `scheduleLoanApproval(loanId)`, which sets a **5-second timer** (`setTimeout`)[cite: 32, 32, 32, 32].
3.  [cite_start]After the delay, `updateLoanStatusInDB` executes an **UPDATE** query on Supabase, setting the loan's status to **'Active'**[cite: 33].

### 5.2 The `makePayment` Transaction (Expanded)

The `makePayment(loanId, paymentAmount)` function handles the financial transaction logic:

1.  **Client-Side Check**: Before the API call, the system verifies:
    * [cite_start]The payment amount is positive[cite: 34].
    * [cite_start]The payment amount does not exceed the current outstanding balance (with a small floating-point tolerance of $0.01$)[cite: 35].
2.  **API Call 1 (INSERT)**: Creates the payment record.
3.  **API Call 2 (SELECT)**: Fetches the current loan balance.
4.  [cite_start]**API Call 3 (UPDATE)**: Updates the balance and status[cite: 36]:
    [cite_start]$$remainingBalance = outstandingBalance - paymentAmount$$ [cite: 37]
    [cite_start]$$newStatus = \begin{cases} \text{'Paid'} & \text{if } remainingBalance \le 0.01 \\ \text{'Active'} & \text{otherwise} \end{cases}$$ [cite: 38]



## 6. Security and Authorization

Security is layered to protect the system against client-side tampering, which is critical in a client-serverless model.

### 6.1 Defense against External Attacks

* [cite_start]**SQL Injection**: Prevented by the Supabase SDK's use of **parameterized queries** (`.eq("loan_id", userInput)`), which keeps user input separate from the SQL command structure[cite: 39].
* [cite_start]**In-Transit Encryption**: All API traffic is secured using **HTTPS (TLS 1.3)**[cite: 40].

### 6.2 Defense against Internal User Tampering

[cite_start]The **Row Level Security (RLS)** policies enforce vertical and horizontal security directly in the database[cite: 41].

* [cite_start]**Vertical Security (What actions are allowed)**: Policies restrict users to only **SELECT (read)**, **INSERT (create)**, and **UPDATE** their own data in the `users` and `loans` tables[cite: 42, 42, 42, 42].
* [cite_start]**Horizontal Security (Whose data can be accessed)**: RLS checks if the user's authenticated ID (`auth.uid()`) matches the record's ownership ID (`user_id` or `borrower_id`)[cite: 43, 43, 43, 43]. [cite_start]This means if a user attempts a malicious query like fetching `borrower_id = 'another-user-id'`, RLS simply denies the query, returning empty results instead of leaking data[cite: 44].
