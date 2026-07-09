# WalletWiz - Frontend Specification Document

This document outlines the requirements, tech stack, page-by-page specs, and integration details for the WalletWiz frontend. The application will connect directly to the existing WalletWiz FastAPI + MongoDB backend.

---

## 🛠️ 1. Frontend Tech Stack

* **Core Framework**: React (with Vite for fast bundling and development)
* **Language**: TypeScript (for type safety and compile-time error checking)
* **Styling**: Tailwind CSS v3 (utility-first CSS for responsive, custom layouts)
* **Routing**: React Router DOM v6
* **State Management**:
  * **Auth & Session State**: React Context API
  * **Chat History & Temporary Cache**: React Context API or lightweight state
* **HTTP Client**: Axios (configured with interceptors for JWT injection and global 429 error handling)
* **Data Visualization**: Recharts (fully responsive, customizable React charting library)
* **Icons**: Lucide React

---

## 📂 2. Recommended Directory Structure

```text
src/
├── assets/             # Static assets (logos, illustrations)
├── components/         # Reusable UI components
│   ├── ui/             # Atomic design elements (Buttons, Input, Card, Modal, Toast)
│   ├── Dashboard/      # Chart containers and metric cards
│   ├── Transactions/   # Filters, table, and manual entry forms
│   └── Chat/           # Chat window, message bubbles, and tool trigger renderers
├── context/            # React Contexts (AuthContext, ChatContext)
├── hooks/              # Custom hooks (useAuth, useTransactions)
├── pages/              # Main page views (Login, Register, Dashboard, Transactions, Chat)
├── services/           # API clients and network helpers (api.ts, authService.ts)
├── utils/              # Helper functions (formatters, dates)
├── App.tsx             # Main routing and provider setup
├── index.css           # Tailwind directives and global styles
└── main.tsx            # App mounting entrypoint
```

---

## 🔑 3. Authentication & Session Integration

WalletWiz uses JWT Bearer Tokens for authentication as specified in the backend API docs.

### 3.1 Flow & Token Storage
1. **Login/Register**: User submits credentials to `/api/v1/auth/login` or `/api/v1/auth/register`.
2. **Google OAuth**: User signs in via Google, returning an `id_token` sent to `/api/v1/auth/google`.
3. **Session Persistence**: On success, the API returns an `access_token`. The frontend stores this token in `localStorage` or `sessionStorage`.
4. **Header Injection**: All subsequent requests to protected endpoints must include the token:
   ```http
   Authorization: Bearer <your_jwt_access_token>
   ```
5. **Session Expiry**: Token is valid for 7 days. If a request returns `401 Unauthorized`, the frontend must automatically clear local storage and redirect the user to the Login page.

---

## 📊 4. Page-by-Page Requirements

### 4.1 Authentication Pages (Login / Signup)
* **Design**: Premium split-screen layout. Left side: interactive graphic or logo with visual intro. Right side: clean, modern forms.
* **Fields**:
  * **Login**: Email, Password.
  * **Register**: First Name, Email, Password.
* **Integrations**:
  * Google OAuth Sign-In button.
  * Form validation (email formats, password strength).
  * Informative error messages (e.g., "User with this email already registered").

### 4.2 Dashboard & Analytics View
* **Timeframe Selector**: Buttons/Dropdown to filter dashboard statistics by timeframe: `"this-month"`, `"last-30-days"`, or `"this-year"`.
* **Metric Cards**:
  * **Total Spent**: Displays standard currency formatting (e.g., `$12,450.00`).
  * **Daily Average**: Computes and highlights average daily spend.
* **Charts (Recharts)**:
  * **Spending by Category**: Pie/Donut chart illustrating percentage and amount per category.
  * **Spending by Payment Method**: Bar chart dividing expenses between `UPI`, `Card`, and `Cash`.
  * **Daily Trend**: Area/Line chart demonstrating spending fluctuations over time.
* **Recent Transactions List**: A list displaying the last 5-10 transactions with direct click-through to view/edit details.

### 💸 4.3 Transaction Manager (CRUD)
* **Filters Panel**: Dropdowns for Category, Payment Method, and Date Pickers (Start Date, End Date).
* **Pagination Controls**: Previous/Next page selectors showing total items and pages based on the pagination payload returned by the API.
* **Manual Add/Edit Modal**:
  * Fields: Amount, Merchant, Category (Dropdown), Payment Method (Dropdown), Date, Description.
  * Enforce strict backend enums:
    * **Categories**: `Food & Dining`, `Shopping`, `Travel & Transport`, `Bills & Utilities`, `Entertainment`, `Health & Medical`, `Others`
    * **Payment Methods**: `Cash`, `Card`, `UPI`
* **Delete Action**: Standard confirmation prompt prior to dispatching `DELETE /api/v1/transactions/{id}`.

### 🤖 4.4 AI Chat Assistant Panel
* **UI**: Floating chat widget on the bottom right or a dedicated full-screen Chat View. Responsive scrollable body.
* **History State**: Maintain an array of past messages (`role: "user" | "assistant"`, `content: string`) in React state and send the array with each new `/api/v1/chat` request to preserve LLM context.
* **Dynamic Tool Renderers**:
  When a `/chat` response contains `tool_triggered` metadata, render specialized UI blocks:
  * **`query_database`**: Render a styled summary box listing the query filters applied and the number of matches found.
  * **`log_transaction`**: Render a receipt-style card summarizing the logged transaction parameters (Merchant, Amount, Date) with an "Edit" shortcut.
* **⚠️ Rate Limit Handling**:
  If a `/chat` request returns a `429 Too Many Requests` status, catch it via the Axios interceptor and display a custom, prominent toast warning (e.g., *"Slow down! You are sending too many messages."*).

---

## 🎨 5. UI/UX & Styling Guidelines

* **Theme**: Modern Dark Mode by default.
  * Primary background: Sleek, high-contrast dark gray/black (`#0B0F19` or slate-900).
  * Primary accent: Vibrant blue, indigo, or emerald gradient.
  * Card elements: Glassmorphic borders (`backdrop-blur-md bg-white/5 border border-white/10`).
* **Animations**: Subtle transitions for hover states (e.g., button scaling, color transitions), list entry animations, and chart loading effects.
* **Typography**: Outfit or Inter font families with clear size hierarchies.
* **Responsiveness**: Flex/Grid layouts adapting seamlessly from mobile screens (single-column) to large desktop monitors.
