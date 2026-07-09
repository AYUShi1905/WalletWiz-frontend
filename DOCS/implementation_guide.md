# WalletWiz - Frontend Step-by-Step Implementation Guide (Mobile-First)

This guide details the sequential steps required to build and integrate the WalletWiz frontend with the local FastAPI backend, optimized for mobile viewports.

---

## 🏁 Phase 1: Project Scaffolding & Configuration

### Step 1.1: Initialize React Project
Create the project base directory structure using Vite with JavaScript.
* Command to initialize:
  ```bash
  npx -y create-vite@latest ./ --template react --no-interactive
  ```

### Step 1.2: Install Core Dependencies
Install the required routing, state, network, rendering, and styling utility libraries:
```bash
npm install react-router-dom axios recharts lucide-react
```

### Step 1.3: Install & Set Up Tailwind CSS v3
1. Install Tailwind CSS v3 and its peer dependencies as devDependencies:
   ```bash
   npm install -D tailwindcss@3 postcss autoprefixer
   ```
2. Generate config files:
   ```bash
   npx tailwindcss init -p
   ```
3. Update `tailwind.config.js` to template paths and define custom brand colors (Vibrant Blue accent):
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           brand: {
             dark: '#0B0F19',
             card: 'rgba(255, 255, 255, 0.05)',
             accent: '#3B82F6', // Blue
           }
         }
       },
     },
     plugins: [],
   }
   ```
4. Add the Tailwind directives to your `./src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   body {
     @apply bg-brand-dark text-slate-100 min-h-screen antialiased;
   }
   ```

### Step 1.4: Create Folder Structure
Ensure the folder layout matches the structure outlined in the specifications:
```bash
mkdir -p src/{components/{ui,Dashboard,Transactions,Chat},context,hooks,pages,services,utils}
```

---

## 🔑 Phase 2: Core Integration & Authentication Flow

### Step 2.1: Configure Axios Interceptors
Create `src/services/api.js` to configure Axios to send the bearer token and catch global token expiration errors (401).
* Add code to read token from `localStorage` and set the request headers.
* Set base URL: `http://localhost:8000/api/v1`

### Step 2.2: Setup Authentication Context
Create `src/context/AuthContext.jsx` to handle:
* App-wide authentication status.
* Methods for `login`, `register`, and `logout`.
* Automatic loading of token on app initialization to restore sessions.

### Step 2.3: Build Registration & Login Pages
1. Implement the forms under `src/pages/Login.jsx` and `src/pages/Register.jsx`.
2. Connect input triggers to the corresponding API calls (`/auth/login`, `/auth/register`).
3. Add a Google Login callback handler pointing to `/auth/google`.
4. Provide immediate validation error handling (incorrect passwords, used emails).

### Step 2.4: Set Up Routing & Guards
1. Implement `src/components/ProtectedRoute.tsx` to wrap components and redirect unauthenticated requests to `/login`.
2. Define routes in `src/App.jsx` (Dashboard, Transactions, Chat as protected, Login/Register as public) and configure the mobile top header and bottom nav bar layout shell.

---

## 📊 Phase 3: Dashboard & Analytics View

### Step 3.1: Create Shell Layout
Create a standard navigation layout containing:
* Fixed Top Header: Logo, user profile name, and quick logout button.
* Fixed Bottom Navigation Bar: Icons for Dashboard, Transactions, and AI Chat.
* Main Content Container: Padding offsets (`pt-16 pb-16`) to fit inside mobile navigation.

### Step 3.2: Analytics Timeframe Filter State
Set up a standard query filter state variable (`timeframe`) at the Dashboard page level, defaulting to `"this-month"`. Connect it to query calls to `/analytics/dashboard?timeframe=...`.

### Step 3.3: Implement Metric Dashboard Cards
* Integrate API responses for `total_spent` and `daily_average` into premium glassmorphic display cards arranged in a stacked single-column flow.

### Step 3.4: Integrate Charts with Recharts
Map API data structures to Recharts elements:
* **Category Share**: `by_category` maps to `<PieChart>` (Donut style) with custom colors.
* **Payment breakdown**: `by_payment_method` maps to `<BarChart>`.
* **Daily Trend**: `daily_trend` maps to `<AreaChart>` with custom gradient fills, stacked vertically.

---

## 💸 Phase 4: Transactions CRUD Interface

### Step 4.1: List Transactions & Mobile Card Feed
* Create `src/pages/Transactions.jsx`.
* Render results in a vertical list feed of compact cards showing merchant, category, date, and amount.
* Implement a collapsible top filters drawer above the list.

### Step 4.2: Build Pagination Controls
* Read current pagination metadata (`page`, `limit`, `total_pages`).
* Construct large Prev/Next buttons.

### Step 4.3: Manual Entry & Slide-up bottom sheets
* Create `src/components/Transactions/TransactionModal.jsx` (or inline drawer).
* Build slide-up bottom sheet drawers for logging/editing transactions.
* Standardize selections for `category` and `payment_method` using HTML select drop-downs loaded with the required enums.

---

## 🤖 Phase 5: AI Assistant Chat & Interceptor Controls

### Step 5.1: Chat Context & Window Design
1. Create `src/context/ChatContext.jsx` to manage array memory `history` (array of message objects).
2. Design `src/pages/Chat.jsx` (mobile chat feed container with sticky bottom input bar).

### Step 5.2: Dispatch Query Messages
* Implement `POST /api/v1/chat` request, sending user input alongside current message history.
* Append backend's assistant responses back to the local history state.

### Step 5.3: Build Special Tool Result Renderers
Read `tool_triggered` response values:
* If value is `"log_transaction"`, dynamically render a printed receipt-style block showing details of the newly inserted item.
* If value is `"query_database"`, show a card summarizing the filter counts and matches.

### Step 5.4: Intercept 429 Rate Limits
Add response interceptors to your Axios module:
* Detect status code `429`.
* Trigger a state-based Toast notification informing the user: *"Slow down! You are sending too many messages."*

---

## 🎨 Phase 6: Styling Polishing & End-to-End Verification

### Step 6.1: Polish Mobile Theme & Animations
* Apply CSS transitions to buttons and cards.
* Ensure layout grid is optimized for mobile viewports.

### Step 6.2: Complete End-to-End Run
* Spin up the local FastAPI backend.
* Run Vite locally using `npm run dev`.
* Perform full flow verification: Register -> Sign in -> Create manual transaction -> Prompt the chatbot to log a transaction -> View Dashboard chart updates.
