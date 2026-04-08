# Expense Tracker Mobile - API Services

## 📱 Overview

This directory contains all API service modules for the Expense Tracker Mobile app. All services use **Axios** for HTTP requests with automatic token refresh, error handling, and language header support.

---

## 🏗️ Architecture

### Base API Client (`lib/api.ts`)

- **Automatic Bearer Token Injection**: Access token automatically added to all requests
- **Token Refresh Flow**: Handles 401 errors and refreshes tokens automatically
- **Language Support**: Sends `Accept-Language` header based on user's language preference
- **Request Queue**: Prevents multiple concurrent refresh token requests
- **Logging**: Console logs for debugging API calls

### Storage Keys

```typescript
STORAGE_KEYS = {
  ACCESS_TOKEN: "et_access_token",
  ID_TOKEN: "et_id_token",
  REFRESH_TOKEN: "et_refresh_token",
  USERNAME: "et_username",
  LANGUAGE: "et_language",
};
```

---

## 📦 Available Services

### 1. **Authentication Service** (`auth.service.ts`)

Handles user authentication, MFA, and account management.

**Key Methods:**

- `signUp(username, email, password)` - Register new user
- `signIn(usernameOrEmail, password)` - Sign in (returns MFA challenge if enabled)
- `verifyTotp(session, username, totpCode)` - Verify MFA code
- `setupMfa()` - Get QR code and secret for MFA setup
- `verifyMfaSetup({ totpCode, session })` - Complete MFA setup
- `getMfaStatus()` - Check if MFA is enabled
- `disableMfa()` - Disable MFA
- `disableMfaWithBackup(username, backupCode)` - Disable MFA using backup code
- `forgotPassword(usernameOrEmail)` - Request password reset
- `resetPassword(usernameOrEmail, code, newPassword)` - Reset password
- `changePassword(current, new, confirm)` - Change password
- `getMe()` - Get current user info
- `updateProfile(userName, email)` - Update auth profile
- `signOut()` - Sign out and clear tokens
- `getGoogleAuthUrl(redirectUri)` - Get Google OAuth URL
- `googleCallback(code, state)` - Handle Google OAuth callback

### 2. **Profile Service** (`profile.service.ts`)

Manages user profile settings (currency, locale, notifications).

**Key Methods:**

- `getProfile()` - Get current user's profile
- `updateProfile(data)` - Update profile (phoneNumber, currency, locale, dailyLimit, notificationPreferences)

**Profile Fields:**

- `currency` - User's preferred currency (JPY, USD, EUR, GBP, SGD, THB, MMK)
- `locale` - Notification language (en, ja, my)
- `dailyLimit` - Daily spending alert threshold
- `notificationPreferences` - Boolean flags for 7 notification types

### 3. **Dashboard Service** (`dashboard.service.ts`)

Provides dashboard summary and analytics.

**Key Methods:**

- `getDashboard(month?)` - Get dashboard data (optional month filter in YYYY-MM format)

**Returns:**

- `summary` - Total income/expense/savings/investment, net balance, transaction count
- `categoryBreakdown` - Spending by category with percentages
- `monthlyTrends` - Income/expense trends over months
- `recentTransactions` - Latest 10 transactions
- `upcomingBills` - Recurring payments due soon
- `budgetSnapshot` - Current month's budget summary
- `savingsSnapshot` - Savings goals progress
- `investmentSnapshot` - Investment portfolio summary

### 4. **Transaction Service** (`transaction.service.ts`)

Manages financial transactions (Income, Expense, Investment, Savings).

**Key Methods:**

- `getTransactions(filters)` - Get paginated transactions
- `getTransaction(id)` - Get single transaction
- `createTransaction(data)` - Create new transaction
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction
- `uploadReceipt(transactionId, imageFile)` - Upload receipt image

**Filters:**

- `type` - Income/Expense/Investment/Savings
- `categoryId` - Filter by category
- `status` - Pending/Completed/Failed
- `startDate`, `endDate` - Date range
- `minAmount`, `maxAmount` - Amount range
- `pageNumber`, `pageSize` - Pagination

### 5. **Category Service** (`category.service.ts`)

Manages expense/income categories.

**Key Methods:**

- `getCategories(filters)` - Get paginated categories
- `getCategory(id)` - Get single category
- `createCategory(data)` - Create new category
- `updateCategory(id, data)` - Update category
- `deleteCategory(id)` - Delete category

**Category Fields:**

- `displayName` - Category name
- `type` - Income/Expense/Investment/Savings
- `icon` - Emoji icon
- `color` - Hex color code
- `isActive` - Enable/disable category

### 6. **Budget Service** (`budget.service.ts`)

Manages monthly budgets and category allocations.

**Key Methods:**

- `getBudgetByMonth(year, month)` - Get budget for specific month
- `createBudget({ month, totalAllocated })` - Create monthly budget
- `updateBudget(id, data)` - Update total allocated amount
- `addBudgetCategory(budgetId, { categoryId, allocatedAmount })` - Add category to budget
- `updateBudgetCategory(categoryId, { allocatedAmount })` - Update category allocation
- `removeBudgetCategory(categoryId)` - Remove category from budget
- `resetBudget(budgetId)` - Reset all spending to 0
- `deleteBudget(budgetId)` - Delete budget

**Budget Workflow:**

1. Create budget for month (e.g., "2026-04")
2. Add categories with allocated amounts
3. Track spending automatically from transactions
4. View remaining budget per category

### 7. **Savings Service** (`savings.service.ts`)

Manages savings goals and contributions.

**Key Methods:**

- `getAllGoals()` - Get all savings goals
- `getGoalDetail(goalId)` - Get goal with contributions
- `createGoal(data)` - Create new savings goal
- `updateGoal(goalId, data)` - Update goal
- `deleteGoal(goalId)` - Delete goal
- `addContribution(goalId, { amount, note, date })` - Add contribution
- `getContributions(goalId)` - Get all contributions
- `deleteContribution(contributionId)` - Delete contribution

**Goal Fields:**

- `goalName` - Name of goal
- `targetAmount` - Target amount to save
- `currentAmount` - Current saved amount
- `deadline` - Optional deadline date
- `contributionFrequency` - Daily/Weekly/Monthly/Yearly/OneTime
- `contributionAmount` - Auto-contribution amount
- `status` - Active/Completed/Cancelled

### 8. **Investment Service** (`investment.service.ts`)

Manages investment portfolio and holdings.

**Key Methods:**

- `getDashboard()` - Get investment summary
- `getAllInvestments(filters)` - Get paginated investments
- `getInvestment(id)` - Get single investment
- `createInvestment(data)` - Add new investment
- `updateInvestment(id, data)` - Update investment (e.g., current price)
- `deleteInvestment(id)` - Delete investment
- `getAllPortfolios()` - Get all portfolios
- `getPortfolio(id)` - Get portfolio details
- `createPortfolio(data)` - Create portfolio
- `updatePortfolio(id, data)` - Update portfolio
- `deletePortfolio(id)` - Delete portfolio

**Investment Types:**

- Stock, Crypto, Bond, MutualFund, RealEstate, Gold, Other

**Investment Status:**

- Holding, Sold, PartialSold

### 9. **Recurring Payment Service** (`recurring.service.ts`)

Manages recurring bills and subscriptions.

**Key Methods:**

- `getAllPayments()` - Get all recurring payments
- `getUpcomingPayments()` - Get payments due in next 30 days
- `getPayment(id)` - Get single payment
- `createPayment(data)` - Create recurring payment
- `updatePayment(id, data)` - Update payment
- `deletePayment(id)` - Delete payment
- `processPayment(id, { paidDate, amount })` - Mark as paid (creates transaction)
- `skipPayment(id)` - Skip next payment

**Frequency:**

- Daily, Weekly, Monthly, Yearly

**Features:**

- Auto-payment flag
- Notifications before due date
- Automatic transaction creation

### 10. **Notification Service** (`notification.service.ts`)

Manages in-app notifications.

**Key Methods:**

- `getSummary()` - Get unread count + 5 latest notifications
- `getUnreadCount()` - Get badge count for polling
- `getNotifications(filters)` - Get paginated notifications (cursor-based)
- `markAsRead(id)` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete single notification
- `deleteAllRead()` - Delete all read notifications

**Notification Types:**

- Budget alerts (80% warning, exceeded)
- Recurring payment reminders (3 days before)
- Auto-payment confirmations
- Saving goal milestones
- Large transactions (exceeding daily limit)
- Payment failures
- Export ready notifications

### 11. **Aggregation Service** (`aggregation.service.ts`)

Provides aggregated analytics and reports.

**Key Methods:**

- `getAggregation(params)` - Get aggregated data by period/category
- `getCategoryAggregation(params)` - Category-wise breakdown
- `getMonthlyComparison(params)` - Month-over-month comparison

**Params:**

- `period` - Daily/Weekly/Monthly/Yearly
- `startDate`, `endDate` - Date range
- `type` - Income/Expense/Investment/Savings
- `categoryId` - Filter by category

---

## 🔧 Usage Examples

### Authentication with MFA

```typescript
import { authService } from "@/services";

// 1. Sign In
const signInResult = await authService.signIn("user@example.com", "password");

if (signInResult.requiresMfa) {
  // 2. Show MFA input screen
  const session = signInResult.mfaChallenge.session;
  const username = signInResult.mfaChallenge.username;

  // 3. Verify TOTP code
  const tokens = await authService.verifyTotp(session, username, "123456");
  // User is now signed in, tokens stored automatically
} else {
  // No MFA - user is signed in immediately
  const user = await authService.getMe();
}
```

### Creating Budget

```typescript
import { budgetService } from "@/services";

// 1. Create budget for current month
const budget = await budgetService.createBudget({
  month: "2026-04",
  totalAllocated: 100000,
});

// 2. Add categories
await budgetService.addBudgetCategory(budget.budgetId, {
  categoryId: "groceries-id",
  allocatedAmount: 30000,
});

await budgetService.addBudgetCategory(budget.budgetId, {
  categoryId: "transport-id",
  allocatedAmount: 15000,
});

// 3. View budget
const monthlyBudget = await budgetService.getBudgetByMonth(2026, 4);
console.log(
  `Spent: ${monthlyBudget.budget.totalSpent} / ${monthlyBudget.budget.totalAllocated}`,
);
```

### Dashboard Analytics

```typescript
import { dashboardService } from "@/services";

// Get current month dashboard
const dashboard = await dashboardService.getDashboard();

console.log("Net Balance:", dashboard.summary.netBalance);
console.log("Top Category:", dashboard.categoryBreakdown[0].categoryName);
console.log("Recent Transactions:", dashboard.recentTransactions.length);
console.log("Upcoming Bills:", dashboard.upcomingBills.length);
```

### Managing Savings Goals

```typescript
import { savingsService } from "@/services";

// Create goal
const goal = await savingsService.createGoal({
  goalName: "Emergency Fund",
  targetAmount: 500000,
  deadline: "2026-12-31",
  contributionFrequency: "Monthly",
  contributionAmount: 50000,
});

// Add contribution
await savingsService.addContribution(goal.savingGoalId, {
  amount: 50000,
  note: "Monthly deposit",
});

// Check progress
const detail = await savingsService.getGoalDetail(goal.savingGoalId);
console.log(`Progress: ${detail.goal.progress}%`);
```

---

## 🌐 Localization (i18n)

All API calls include the `Accept-Language` header based on user preference:

```typescript
// User selects language in app settings
await storage.setItem(STORAGE_KEYS.LANGUAGE, "ja"); // Japanese

// All subsequent API calls will include:
// Headers: { 'Accept-Language': 'ja' }

// Backend sends notifications in Japanese! 📧🇯🇵
```

**Supported Languages:**

- `en` - English
- `ja` - 日本語 (Japanese)
- `my` - မြန်မာ (Myanmar)

---

## 🛠️ Type Definitions

All services are fully typed with TypeScript. Type definitions are located in `types/`:

- `api.types.ts` - Base types (User, Transaction, Category, Pagination)
- `profile.types.ts` - Profile and notification preferences
- `budget.types.ts` - Budget and budget categories
- `dashboard.types.ts` - Dashboard summary and charts
- `notification.types.ts` - Notifications
- `savings.types.ts` - Savings goals and contributions
- `investment.types.ts` - Investments and portfolios
- `recurring.types.ts` - Recurring payments

---

## 🔒 Security Features

✅ **Automatic Token Refresh**: Handles expired tokens seamlessly  
✅ **Secure Storage**: Uses Expo SecureStore for sensitive data  
✅ **Request Queue**: Prevents race conditions during token refresh  
✅ **Automatic Logout**: Clears tokens when refresh fails  
✅ **MFA Support**: TOTP-based two-factor authentication  
✅ **Backup Codes**: Emergency access when MFA device lost

---

## 📊 API Endpoints Summary

| Service            | Endpoints Count | Base Path                             |
| ------------------ | --------------- | ------------------------------------- |
| Auth               | 15              | `/api/Auth`                           |
| Profile            | 2               | `/api/Profile`                        |
| Dashboard          | 1               | `/api/Dashboard`                      |
| Transactions       | 6               | `/api/transactions`                   |
| Categories         | 5               | `/api/categories`                     |
| Budgets            | 8               | `/api/budgets`                        |
| Savings Goals      | 8               | `/api/saving-goals`                   |
| Investments        | 11              | `/api/investments`, `/api/portfolios` |
| Recurring Payments | 8               | `/api/recurring-payments`             |
| Notifications      | 6               | `/api/notifications`                  |
| Aggregation        | 3               | `/api/aggregation`                    |

**Total: 73 API endpoints** 🚀

---

## 🎯 Next Steps

1. ✅ **API Services Created** - All 11 services with full TypeScript types
2. ⏳ **Context/State Management** - Create Zustand stores for state
3. ⏳ **UI Components** - Build screens using services
4. ⏳ **Navigation** - Setup React Navigation with auth flow
5. ⏳ **Localization** - Integrate i18n for multi-language support

---

**Created:** April 5, 2026  
**Status:** ✅ Production Ready  
**Backend API:** C# .NET with AWS Cognito Auth
