# 🚀 FinexaLoans Loan Management System: Comprehensive Technical Blueprint

## 1. Introduction: FinexaLoans Loan Management System - Group 10

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
| | VICTOR DAKOH IKEMINOGHENA | 22/2957 |
| | YISA MORDECAI | 22/1890 |
| **Database Design** | Obih Joan Chidinma | 22/2610 |
| | Enakirerhi Julian | 23/1909 |
| | Obika Martins Akachukwu | 22/1248 |
| | Okpalanajiaku Xavier | 22/2549 |
| | Olatunbosun Eniola David | 22/3058 |
| | Vwarak Bliss-David | 22/3007 |
| | Olubiyi Oluwatise Ikhafoghwe | 22/1148 |
| | Onwusah Dorachima Ifeanyi | 23/0984 |
| **CGI Scripting** | Pinwa Joshua Nwibari | 22/1290 |
| | Oluwafemi Oluwasemilore Esther | 22/1399 |
| | Onyenweaku Chibundu Emmanuel | 21/1872 |
| | Obunadike Nzubechukwu | 23/2932 |
| | Odukoya Eniola Ayooluwa | 22/2221 |
| | Umunna Kenneth | 22/2485 |
| | Ogbonna Somtochukwu David | 22/3026 |
| | Soyinka Oluwadarasimi Toluwalase | 22/1022 |



## 2. Core Architecture and Technology Stack

FinexaLoans uses a **Client-Serverless** architecture, relying on client-side JavaScript for UI logic and Supabase (PostgreSQL) as its Backend-as-a-Service (BaaS).

### 2.1 Technology Stack Summary

| Component | Technology | Rationale and Role |
| :--- | :--- | :--- |
| **Frontend (UI)** | HTML5, Tailwind CSS (CDN), JavaScript ES6+ | Utility-first styling for fast, responsive design. All UI logic runs in the browser. |
| **Logic Layer** | `scripting.js` (ES Module) | A single, modular script to manage all business logic, data fetching, and API calls. |
| **Backend (BaaS)** | Supabase (PostgreSQL) | Provides database, authentication service, and auto-generated RESTful API endpoints. |
| **Security** | Supabase Auth, Row Level Security (RLS) | Secures the data layer, ensuring a user can only interact with their own data. |



## 3. Frontend Design and User Flow

The application is built around three pages, each with specific validation and interaction patterns.

### 3.1 Authentication (`auth.html`) and Validation (FR1)

The authentication page provides a seamless switch between sign-in and sign-up modes using the `switchMode()` function.

| Field | Validation Rule (Sign-Up Mode) | UI Implementation |
| :--- | :--- | :--- |
| **Email** | Must match the regex `/\S+@\S+\.\S+/`. | Inline error message appears below input. |
| **Password** | Must be at least 8 characters long. | Input border changes to red (`border-destructive`) on failure. |
| **NIN** | Must be exactly 11 digits. | Input uses `oninput="this.value=this.value.replace(/\D/g, '')"` to enforce numeric-only entry. |

### 3.2 Dashboard (`dashboard.html`) and Dynamic Rendering

The dashboard is dynamically rendered by `renderDashboard()` which runs upon page load.

* **Data Aggregation**: The function calls `fetchLoans()` to retrieve the user's loans and all associated payment records in a single query using Supabase's embedding syntax (`select("*, payments(*)")`). This avoids the inefficient **$N+1$ query problem**.
* **Metrics Calculation**: Key metrics—**Active Loans**, **Pending Applications**, and **Completed Loans**—are calculated client-side based on the fetched data and displayed in distinct, color-coded cards.
* **Status Indicators**: Each loan card uses a specific background and text color to instantly indicate status: **'Active'** (Warning/Yellow), **'Pending'** (Info/Blue), **'Paid'** (Success/Green), and **'Past Due'** (Destructive/Red).



## 4. Database Schema and Persistence

The database is built on a normalized **Third Normal Form (3NF)** relational model to ensure data integrity and avoid redundancy.

### 4.1 Schema Design (`users`, `loans`, `payments`)

| Table | Relationship | Key Fields and Purpose |
| :--- | :--- | :--- |
| **users** | Linked 1:1 with Supabase Auth. | Stores comprehensive personal data like **NIN (Unique)** and **BVN (Optional)**. `user_id` is the primary key and links to the Auth service. |
| **loans** | 1:N with `users` (via `borrower_id` FK). | Tracks the loan contract. The `amount` column stores the **current outstanding balance**, not the original principal. |
| **payments** | 1:N with `loans` (via `loan_id` FK). | An immutable audit trail of all transactions. **ON DELETE CASCADE** ensures payment records are removed if the loan is deleted. |

### 4.2 Integrity and Constraints (PostgreSQL)

Database constraints are used to enforce business rules at the persistence layer, backing up client-side validation.

* **Uniqueness**: Enforced on `email` and `national_id` to prevent duplicate borrower profiles.
* **Foreign Keys**: `borrower_id` and `loan_id` maintain referential integrity.
* **Check Constraints**: Application-level checks ensure the financial data is valid. For example, `amount` must be $\ge 0$ and `interest_rate` must be $>0$ and $<1$.
* **Indexing**: Indexes are created on frequently queried foreign keys (`idx_loans_borrower_id`) and status columns (`idx_loans_status`) for performance optimization.



## 5. Scripting Logic and Data Flow

The `scripting.js` module contains all API-related functions and business rule implementation.

### 5.1 Loan Application and Auto-Approval

The `insertNewLoan` function first looks up the interest rate from a constant object (`DashboardConstants.INTEREST_RATES`) based on the selected loan type. It then constructs a loan record with status: **"Pending"**.

The dashboard then runs a simulated auto-approval process:

1.  On load, `renderDashboard()` detects loans with `status: "Pending"`.
2.  It calls `scheduleLoanApproval(loanId)`, which sets a **5-second timer** (`setTimeout`).
3.  After the delay, `updateLoanStatusInDB` executes an **UPDATE** query on Supabase, setting the loan's status to **'Active'**.

### 5.2 The `makePayment` Transaction (Expanded)

The `makePayment(loanId, paymentAmount)` function handles the financial transaction logic:

1.  **Client-Side Check**: Before the API call, the system verifies:
    * The payment amount is positive.
    * The payment amount does not exceed the current outstanding balance (with a small floating-point tolerance of $0.01$).
2.  **API Call 1 (INSERT)**: Creates the payment record.
3.  **API Call 2 (SELECT)**: Fetches the current loan balance.
4.  **API Call 3 (UPDATE)**: Updates the balance and status:
    $$remainingBalance = outstandingBalance - paymentAmount$$
    $$newStatus = \begin{cases} \text{'Paid'} & \text{if } remainingBalance \le 0.01 \\ \text{'Active'} & \text{otherwise} \end{cases}$$



## 6. Security and Authorization

Security is layered to protect the system against client-side tampering, which is critical in a client-serverless model.

### 6.1 Defense against External Attacks

* **SQL Injection**: Prevented by the Supabase SDK's use of **parameterized queries** (`.eq("loan_id", userInput)`), which keeps user input separate from the SQL command structure.
* **In-Transit Encryption**: All API traffic is secured using **HTTPS (TLS 1.3)**.

### 6.2 Defense against Internal User Tampering

The **Row Level Security (RLS)** policies enforce vertical and horizontal security directly in the database.

* **Vertical Security (What actions are allowed)**: Policies restrict users to only **SELECT (read)**, **INSERT (create)**, and **UPDATE** their own data in the `users` and `loans` tables.
* **Horizontal Security (Whose data can be accessed)**: RLS checks if the user's authenticated ID (`auth.uid()`) matches the record's ownership ID (`user_id` or `borrower_id`). This means if a user attempts a malicious query like fetching `borrower_id = 'another-user-id'`, RLS simply denies the query, returning empty results instead of leaking data.
