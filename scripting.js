// --- Supabase Configuration ---
// Your Supabase Project Details
const SUPABASE_URL = "https://zbrdlqulzzbfdjdjarmjts.supabase.co"; // Placeholder URL
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpicmRscXVsenpiZmRqYXJtanRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjQ0NDYsImV4cCI6MjA4MDYwMDQ0Nn0.zzNMhvev-HvcatHUgAatFcUqmYCShFfO9d0m1Vg_HEE"; // Placeholder Key

const { createClient } = supabase;
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Authentication Functions (Rewritten) ---

/**
 * Checks if a user session is active.
 * @returns {Promise<Object|null>} The user object or null.
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  return user;
}

/**
 * Handles user sign-in.
 */
export async function signIn(email, password) {
  return supabaseClient.auth.signInWithPassword({ email, password });
}

/**
 * Handles user sign-up via Supabase Auth and inserts ALL required user data.
 * This is the critical section for the error.
 */
export async function signUpAndInsertUser(userData) {
  // 1. Attempt to create the user in the Supabase Auth system
  const { data: authData, error: authError } = await supabaseClient.auth.signUp(
    {
      email: userData.Email,
      password: userData.Password,
      options: {
        // Pass basic metadata to Auth (for future use/dashboard display)
        data: {
          first_name: userData.FirstName,
          last_name: userData.LastName,
        },
      },
    }
  );

  if (authError) {
    // If the error is 'User already registered', Supabase Auth handles it.
    return { user: null, error: authError };
  }

  const userId = authData.user.id;

  // 2. Insert detailed user data into the 'users' table (Profile creation)
  // This operation requires a specific RLS policy:
  // 'New users can insert their own profile into the users table using their auth ID.'
  const { error: userInsertError } = await supabaseClient.from("users").insert({
    user_id: userId,
    first_name: userData.FirstName,
    last_name: userData.LastName,
    email: userData.Email,
    date_of_birth: userData.DateOfBirth,
    phone_number: userData.PhoneNumber,
    occupation: userData.Occupation,
    address: userData.Address,
    national_id: userData.NIN,
    // BVN is omitted
  });

  if (userInsertError) {
    console.error(
      "CRITICAL: Failed to insert user profile. RLS Policy likely blocked the operation.",
      userInsertError
    );

    // We return a specific error that the front-end can use to instruct the user.
    // The Auth user is now orphaned, and the user must be instructed to sign in.
    return {
      user: null,
      error: new Error(
        `Profile creation failed: ${userInsertError.message}. You can now try to sign in, but you may need to check your email first.`
      ),
    };
  }

  // 3. Success (Auth created and Profile created)
  return { user: authData.user, error: null };
}

/**
 * Handles user sign-out.
 */
export async function signOut() {
  await supabaseClient.auth.signOut();
}

// --- Loan Data Functions (Unchanged) ---

/**
 * Fetches all loans for the current user, including related payments.
 */
export async function fetchLoans() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabaseClient
    .from("loans")
    .select("*, payments(*)")
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }
  return data;
}

/**
 * Inserts a new loan application.
 */
export async function insertNewLoan(loanData, userId) {
  const startDate = new Date().toISOString().split("T")[0];
  const nextDueDate = calculateDueDate(startDate, loanData.durationMonths);

  const record = {
    borrower_id: userId,
    loan_type: loanData.loanType,
    amount: loanData.amount,
    interest_rate: loanData.interestRate,
    duration_months: loanData.durationMonths,
    collateral: loanData.collateral || "None",
    status: "Pending",
    start_date: startDate,
    next_due_date: nextDueDate,
  };

  return supabaseClient.from("loans").insert([record]).select();
}

/**
 * Inserts a new payment record and updates the loan balance.
 */
export async function makePayment(loanId, paymentAmount) {
  // 1. Insert the payment record into the 'payments' table
  const { error: paymentError } = await supabaseClient.from("payments").insert({
    loan_id: loanId,
    amount_paid: paymentAmount,
    payment_date: new Date().toISOString(),
    payment_method: "Card", // Simulated method
    scheduled_due_date: new Date().toISOString().split("T")[0], // Dummy date, should be dynamic
  });

  if (paymentError) {
    console.error("Payment record failed:", paymentError);
    return { success: false, message: "Failed to record payment." };
  }

  // 2. Fetch the current loan balance
  const { data: loanData, error: fetchError } = await supabaseClient
    .from("loans")
    .select("amount")
    .eq("loan_id", loanId)
    .single();

  if (fetchError || !loanData) {
    console.error("Failed to fetch loan for update:", fetchError);
    return {
      success: false,
      message: "Payment recorded, but failed to verify loan balance.",
    };
  }

  const outstandingBalance = parseFloat(loanData.amount);
  const remainingBalance = outstandingBalance - paymentAmount;
  const newStatus = remainingBalance <= 0.01 ? "Paid" : "Active";

  // 3. Update the loan balance and status in the 'loans' table
  const { error: updateError } = await supabaseClient
    .from("loans")
    .update({ amount: remainingBalance, status: newStatus })
    .eq("loan_id", loanId);

  if (updateError) {
    console.error("Failed to update loan balance:", updateError);
    // Note: In a real app, you might want to reverse the payment record here.
    return {
      success: false,
      message: "Payment recorded, but failed to update loan balance.",
    };
  }

  return { success: true, newStatus: newStatus };
}

// --- Utility Functions (Unchanged) ---

// Helper to calculate the next due date (approximate based on months)
function calculateDueDate(startDate, durationMonths) {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + durationMonths);
  return date.toISOString().split("T")[0];
}

// Export common utility objects/variables for use in HTML files
export const DashboardConstants = {
  INTEREST_RATES: {
    Personal: 12.5,
    Business: 15.0,
    Mortgage: 8.5,
    Auto: 10.0,
    Education: 8.0,
  },
  // Used by dashboard.html to manage state without local storage
  LOCAL_LOANS: [
    // Dummy data structure to show dashboard initially before Supabase populates
    {
      loan_id: "dummy-1",
      loan_type: "Personal",
      amount: 500000,
      interest_rate: 12.5,
      duration_months: 12,
      collateral: "None",
      status: "Active",
      start_date: "2024-01-01",
      created_at: "2024-01-01",
    },
  ],
  calculateDueDate: calculateDueDate,
};
