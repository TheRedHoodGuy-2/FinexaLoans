# 🚀 FinexaLoans Loan Management System: Technical Blueprint

## 1. System Overview and Architecture

The FinexaLoans system is a web application designed to manage the lifecycle of a loan, from application to repayment. It utilizes a **Client-Serverless architecture**, where the browser handles most of the logic and communicates directly with a cloud-hosted **Backend-as-a-Service (BaaS)**.

### Core Components

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS, JavaScript ES6+ | User interface, client-side validation, and business logic. |
| **Logic Layer** | `scripting.js` (ES Module) | Orchestrates all API calls and business rules (e.g., due date calculation). |
| **Backend (BaaS)** | Supabase (PostgreSQL) | Provides the Database, Authentication, and RESTful API. |
| **Security** | Supabase Auth, Row Level Security (RLS) | Handles user session management and ensures data isolation. |

---

### Architectural Flow (Client-Serverless Model)

Unlike a traditional server-based system (like the CGI example in the documentation), the FinexaLoans application runs entirely in the user's browser, using the Supabase Client SDK to communicate directly with the cloud database via a secure HTTPS/JSON API.

## 2. Technical Implementation and Frontend

The application is composed of three primary, responsive pages:

### 2.1 Authentication (`auth.html`) (FR1)

This page handles both user **Sign In** and **Sign Up** using a toggleable form.

| Field | Requirement (Sign Up Mode) | Validation |
| :--- | :--- | :--- |
| Email, Password | Required | Email format regex, Password $\ge$ 8 characters. |
| FirstName, LastName | Required | Non-empty string. |
| NIN (National ID) | Required | Exactly 11 digits (enforced via client-side `oninput` filter). |
| BVN (Bank Verification) | Optional | Exactly 11 digits (if provided). |

* **UI Feedback:** Validation errors are displayed inline below the input field and trigger the input border to turn red (`border-destructive`).
* **Toast Notifications:** A modern, non-blocking toast system (`showToast()`) provides feedback on submission success or failure.

### 2.2 Dashboard (`dashboard.html`) (FR2, FR3, FR4)

This is the core application hub for managing loans.

| Section | Purpose | Data Source |
| :--- | :--- | :--- |
| **Metrics Overview** | Summary of user's loan portfolio. | Calculated client-side from fetched loan list. |
| **Your Loans** | Displays all loan cards (Active, Pending, Paid). | `fetchLoans()` function returns all loans with embedded payments. |
| **New Loan Modal** | Application form for a new loan. | Submits to `insertNewLoan()`. |
| **Payment Modal** | Used to record a payment. | Executes the `makePayment` transaction. |

---

## 3. Data Structure and Persistence

The database model is normalized and hosted on **Supabase (PostgreSQL)**.

### 3.1 Entity-Relationship (ER) Model

The system uses three main tables linked by Foreign Keys:

* **Users (Borrowers):** Stores detailed borrower profile (linked to Supabase Auth UUID).
* **Loans (Contracts):** Stores loan terms, status, and current balance.
* **Payments (Transactions):** Immutable record of all payments made against a loan.

### 3.2 Key Table Schemas

| Table | Column | Description |
| :--- | :--- | :--- |
| **users** | `user_id` | PRIMARY KEY. UUID from Supabase Auth. |
| | `national_id` | Unique, for compliance and fraud prevention. |
| **loans** | `loan_id` | PRIMARY KEY. Unique Loan ID (UUID). |
| | `borrower_id` | FOREIGN KEY $\rightarrow$ `users.user_id`. |
| | `amount` | CRITICAL: The current outstanding balance (updated after payments). |
| | `status` | Pending, Active, Paid, Defaulted. |
| **payments** | `payment_id` | PRIMARY KEY. Unique Payment ID (UUID). |
| | `loan_id` | FOREIGN KEY $\rightarrow$ `loans.loan_id`. |

---

## 4. Application Logic and Transaction Flow

All critical business logic resides in `scripting.js`.

### 4.1 Authentication & Profile Creation (`signUpAndInsertUser`)

This is a required two-step process to ensure all necessary profile data is captured:

1.  **Auth Sign-Up (Supabase):** Creates the login credentials and generates the `user_id` (UUID).
2.  **Profile Insert (PostgreSQL):** Inserts the comprehensive borrower data (Name, NIN, BVN, etc.) into the separate `users` table, using the `user_id` as the Foreign Key.

### 4.2 Payment Processing (`makePayment`) (FR4)

This complex transaction simulates an atomic financial operation, requiring three sequenced API calls:

1.  **INSERT Payment:** An immutable record of the payment amount is created in the `payments` table.
2.  **SELECT Balance:** The current `amount` from the `loans` table is fetched.
3.  **UPDATE Loan:** The loan record is updated:
    * `amount` is reduced by the `paymentAmount`.
    * `status` is changed to `'Paid'` if the amount is $\le 0.01$; otherwise, it remains `'Active'`.

### 4.3 Loan Lifecycle Logic

| Function/Rule | Description | Code Reference |
| :--- | :--- | :--- |
| **Data Fetching** | `fetchLoans()` retrieves loans with nested payment history in a single API call (`select("*, payments(*)")`) | `scripting.js` |
| **Auto-Approval** | A 5-second `setTimeout` is used to simulate a backend approval process, changing a loan's status from `'Pending'` to `'Active'`. | `dashboard.html` |
| **Due Date** | Calculated client-side by adding `duration_months` to the `start_date` (loan approval date). | `scripting.js` |

---

## 5. Security Model (NFR1)

The system's security relies heavily on Supabase's built-in features to compensate for the client-side execution model.

### 5.1 Authorization via RLS

**Row Level Security (RLS)** is the critical security layer on the PostgreSQL database. RLS policies ensure that the authenticated user (`auth.uid()`) can only read, insert, or update **their own data**.

| Policy Example | Effect |
| :--- | :--- |
| `ON loans FOR SELECT USING (auth.uid() = borrower_id)` | A user can only fetch loans where the `borrower_id` matches their authenticated UUID. This prevents viewing other users' data, even if the client-side JavaScript is compromised. |

### 5.2 Protection Measures

* **SQL Injection:** Mitigated by using the **Supabase Client SDK**, which utilizes parameterized queries. User input is never concatenated directly into the SQL statement.
* **In-Transit Data:** Implemented via **HTTPS (TLS 1.3) encryption** for all communication between the browser and Supabase.
* **Password Security:** Implemented using **bcrypt hashing with salt** (managed entirely by the Supabase Auth service).
* **Cross-Site Scripting (XSS):** Mitigated as user input is generally handled through safe methods in the rendering functions, not raw `innerHTML`.

---

## 6. Project Contributions

The following team members contributed to the key components of the project:

### 6.1 Frontend Development

| Name | Matric |
| :--- | :--- |
| ADEBIYI SAMUEL OLAYINKA | 22/1923 |
| AJIROTUTU PRAISE DASOLA | 22/1539 |
| ALLINSON ADEWALE IBRAHIM | 22/0868 |
| ISAAC DIVINE OCHUKO | 22/0515 |
| MADUBOM JOY | 22/3022 |
| NNAEMEKA CHRISTOPHER | 22/2181 |
| OKON ISRAEL EYIBIO | 22/1677 |
| ONYEODIZIELU UGOCHUKWU M. | 22/1161 |
| VICTOR DAKOH IKAPEMINOGHENA | 22/2957 |
| YISA MORDECAI | 22/1890 |

### 6.2 Logic Layer (CGI/Scripting)

| Name | Matric |
| :--- | :--- |
| Pinwa Joshua Nwibari | 22/1290 |
| Oluwafemi Oluwasemilore Esther | 22/1399 |
| Onyenweaku Chibundu Emmanuel | 21/1872 |
| Obunadike Nzubechukwu | 23/2932 |
| Odukoya Eniola Ayooluwa | 22/2221 |
| Umunna Kenneth | 22/2485 |
| Ogbonna Somtochukwu David | 22/3026 |
| Soyinka Oluwadarasimi Toluwalase | 22/1022 |

### 6.3 Database Design

| Name | Matric |
| :--- | :--- |
| Obih Joan Chidinma | 22/2610 |
| Enakirerhi Julian | 23/1909 |
| Obika Martins Akachukwu | 22/1248 |
| Okpalanajiaku Xavier | 22/2549 |
| Olatunbosun Eniola David | 22/3058 |
| Vwarak Bliss-David | 22/3007 |
| Olubiyi Oluwatise Ikhafogue | 22/1148 |
| Onwusah Dorachima Ifeanyi | 23/0984 |
