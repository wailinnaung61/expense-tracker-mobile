# Mobile App Installation & Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd C:\my\code\expense-tracker-mobile
npm install
```

This will install all required packages including:

- React Native & Expo
- Zustand (state management)
- React Navigation
- i18next (internationalization)
- Axios (HTTP client)
- And all other dependencies

### 2. Configure Environment

Create `.env` file in the root directory:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5038
```

**Note**: For Android emulator accessing localhost, you may need to use `10.0.2.2:5038` instead of `localhost:5038`.

### 3. Start the Backend API

Make sure your .NET backend is running on `http://localhost:5038`

### 4. Start Expo Development Server

```bash
npm start
```

This will open Expo Dev Tools in your browser.

### 5. Run on Your Platform

#### Option A: iOS Simulator (Mac only)

```bash
npm run ios
```

Or press `i` in the Expo terminal

#### Option B: Android Emulator

```bash
npm run android
```

Or press `a` in the Expo terminal

#### Option C: Physical Device

1. Install **Expo Go** app from App Store or Play Store
2. Scan the QR code shown in the terminal
3. App will load on your device

#### Option D: Web Browser

```bash
npm run web
```

Or press `w` in the Expo terminal

## Supported Languages

The app supports 3 languages:

- 🇬🇧 English (en) - Default
- 🇯🇵 Japanese (ja)
- 🇲🇲 Myanmar (my)

Change language from Profile screen.

## Troubleshooting

### Issue: "Unable to resolve module"

**Solution**: Clear cache and reinstall

```bash
npm run start -- --clear
# or
expo start -c
```

### Issue: "Network request failed"

**Solution**: Check environment variables

- Verify `.env` file exists with `EXPO_PUBLIC_API_BASE_URL`
- For Android emulator, use `http://10.0.2.2:5038` instead of `localhost`
- Ensure backend API is running

### Issue: Metro bundler errors

**Solution**: Reset Metro cache

```bash
npx expo start --clear
```

### Issue: iOS build errors (Mac)

**Solution**: Install Xcode and CocoaPods

```bash
cd ios
pod install
cd ..
npm run ios
```

### Issue: Android build errors

**Solution**: Sync Gradle and rebuild

```bash
cd android
./gradlew clean
cd ..
npm run android
```

## Project Structure Overview

```
expense-tracker-mobile/
├── App.tsx                 # Main entry point
├── index.js                # Root registration
├── package.json            # Dependencies
├── .env                    # Environment config
├── app.json                # Expo configuration
│
├── components/ui/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ErrorMessage.tsx
│
├── constants/
│   ├── config.ts           # API base URL
│   └── theme.ts            # Colors, fonts, spacing
│
├── hooks/
│   └── useTranslation.ts   # i18n hook
│
├── i18n/
│   ├── index.ts            # i18n config
│   └── locales/            # Translation files
│       ├── en.json
│       ├── ja.json
│       └── my.json
│
├── lib/
│   ├── api.ts              # Axios instance with interceptors
│   └── storage.ts          # Secure storage wrapper
│
├── screens/
│   ├── auth/
│   │   ├── SignInScreen.tsx
│   │   └── MfaScreen.tsx
│   ├── dashboard/
│   │   └── DashboardScreen.tsx
│   ├── transactions/
│   │   └── TransactionsScreen.tsx
│   ├── budget/
│   │   └── BudgetScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
│
├── services/               # API service layer (73 endpoints)
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── transaction.service.ts
│   ├── category.service.ts
│   ├── budget.service.ts
│   ├── savings.service.ts
│   ├── investment.service.ts
│   ├── recurring.service.ts
│   ├── notification.service.ts
│   ├── dashboard.service.ts
│   ├── aggregation.service.ts
│   └── index.ts
│
├── stores/                 # Zustand state management
│   ├── useAuthStore.ts
│   ├── useTransactionStore.ts
│   ├── useDashboardStore.ts
│   ├── useBudgetStore.ts
│   ├── useNotificationStore.ts
│   └── index.ts
│
└── types/                  # TypeScript definitions
    ├── profile.types.ts
    ├── budget.types.ts
    ├── dashboard.types.ts
    ├── notification.types.ts
    ├── savings.types.ts
    ├── investment.types.ts
    └── recurring.types.ts
```

## Testing the App

### 1. Sign In Flow

1. Launch app
2. Enter email and password (from your backend Cognito users)
3. If MFA enabled, enter 6-digit code from authenticator app
4. Should navigate to Dashboard

### 2. Dashboard

- View income/expense/savings summary
- See recent transactions
- Pull down to refresh

### 3. Transactions

- View paginated transaction list
- Scroll to bottom to load more
- Tap + button to add (form coming soon)

### 4. Budget

- View monthly budget
- See category allocations and progress bars
- Red indicates over-budget categories

### 5. Profile

- Switch language (English/Japanese/Myanmar)
- View user info
- Sign out

## Next Development Tasks

### High Priority

1. **Transaction Forms** - Add/Edit transaction dialogs
2. **Budget Forms** - Create/Edit budget with categories
3. **Form Validation** - Integrate react-hook-form + zod
4. **Charts** - Add monthly trend charts to Dashboard
5. **Savings Screen** - Goals, contributions, progress
6. **Investments Screen** - Portfolio, holdings, performance

### Medium Priority

7. **Categories Screen** - Manage categories
8. **Recurring Payments** - Setup & manage recurring bills
9. **Notifications** - In-app notification center
10. **Settings** - Currency, preferences, MFA setup
11. **Dark Mode** - Theme switcher
12. **Search & Filters** - Advanced filtering UI

### Low Priority

13. **Biometric Auth** - Face ID / Fingerprint
14. **Offline Support** - Local caching with AsyncStorage
15. **Export** - PDF/CSV export functionality
16. **Charts Expansion** - More visualization types
17. **Push Notifications** - Budget alerts, bill reminders

## Development Commands

```bash
# Start dev server
npm start

# Clear cache and start
npm start -- --clear

# Run on specific platform
npm run ios
npm run android
npm run web

# TypeScript type checking
npx tsc --noEmit

# Linting
npm run lint

# Build for production
eas build --platform ios
eas build --platform android
```

## API Integration Status

✅ **Complete** - 73 endpoints across 11 services

- Authentication (Sign In, Sign Up, MFA, Password Reset)
- Profile Management
- Transaction CRUD & Pagination
- Category Management
- Budget Management
- Savings Goals
- Investment Tracking
- Recurring Payments
- Notifications
- Dashboard Analytics
- Account Aggregation

All services include:

- TypeScript typing
- Error handling
- Loading states
- Authentication headers
- Accept-Language headers for i18n

## State Management

All stores use Zustand with:

- Actions for data operations
- Loading states
- Error handling
- Automatic token refresh
- Language persistence

Example usage:

```typescript
import { useAuthStore } from '@/stores';

function MyComponent() {
  const { user, signIn, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    await signIn(email, password);
  };

  return (
    // Your component
  );
}
```

## Need Help?

- Check `API_SERVICES_DOCUMENTATION.md` for API details
- Review `README.md` for feature overview
- Expo docs: https://docs.expo.dev
- React Navigation: https://reactnavigation.org
- Zustand: https://zustand-demo.pmnd.rs

---

**Status**: Mobile app foundation complete! 🎉
Ready for feature development and UI refinement.
