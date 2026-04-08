# 🌍 Language Settings - Mobile App

## Two Independent Language Settings

The app now correctly implements **TWO separate language settings**, matching the web frontend:

---

## 1. 📱 App Language (UI Language)

**What it does:**

- Changes the app's interface text (buttons, labels, screens)
- Instant effect - no backend call needed
- Stored locally on your device (AsyncStorage/i18next)

**Where:**

- Profile Screen → "App Language"

**Options:**

- 🇬🇧 English
- 🇯🇵 日本語 (Japanese)
- 🇲🇲 မြန်မာ (Myanmar)

**Example:**

- Set to Japanese → All buttons, menus, screens show Japanese text
- This does NOT affect notifications

---

## 2. 📧 Notification Language

**What it does:**

- Tells the backend which language to use for:
  - Email notifications
  - Push notifications
  - SMS notifications
- Saved to your profile in the backend database
- Requires internet connection to update

**Where:**

- Profile Screen → "Notification Language"
- Hint text: "Language for email and push notifications"

**Options:**

- 🇬🇧 English
- 🇯🇵 日本語 (Japanese)
- 🇲🇲 မြန်မာ (Myanmar)

**Example:**

- Set to Myanmar → Backend sends emails in Myanmar language
- This does NOT affect the app UI

---

## 🎯 Use Cases

### Case 1: Different Languages

```
App Language: English
Notification Language: Japanese

Result:
✅ App shows English interface
✅ Emails/notifications arrive in Japanese
```

### Case 2: Same Language

```
App Language: Japanese
Notification Language: Japanese

Result:
✅ App shows Japanese interface
✅ Emails/notifications arrive in Japanese
```

### Case 3: Testing/Work

```
App Language: Myanmar (comfortable reading)
Notification Language: English (work emails)

Result:
✅ App shows Myanmar interface
✅ Emails/notifications arrive in English
```

---

## 💡 Why Separate?

1. **Personal Preference**
   - You might prefer using the app in one language
   - But receive emails in another language

2. **Multi-Language Teams**
   - Use app in your native language
   - But get notifications in company's official language

3. **Testing**
   - Developers can test different language combinations
   - QA can verify translations independently

---

## 🔧 Technical Implementation

### App Language (i18next)

```typescript
// Stored in: AsyncStorage (STORAGE_KEYS.LANGUAGE)
// Library: i18next + react-i18next
// File: hooks/useTranslation.ts

const { t, currentLanguage, changeLanguage } = useTranslation();

// Changes UI immediately
await changeLanguage("ja"); // Switch to Japanese
```

### Notification Language (Backend Profile)

```typescript
// Stored in: Backend database (Profile.locale)
// API: PUT /api/Profile { locale: "ja" }
// File: stores/useProfileStore.ts

const { updateNotificationLocale } = useProfileStore();

// Sends API request to backend
await updateNotificationLocale("ja"); // Backend emails in Japanese
```

---

## 📱 Profile Screen Layout

```
┌─────────────────────────────────────┐
│  Profile                            │
├─────────────────────────────────────┤
│  [User Avatar]                      │
│  Username                           │
│  email@example.com                  │
├─────────────────────────────────────┤
│  Settings                           │
│                                     │
│  App Language                       │
│  ┌─────────┬──────────┬──────────┐ │
│  │ English │ 日本語    │ မြန်မာ   │ │ ← Changes UI
│  └─────────┴──────────┴──────────┘ │
│                                     │
│  Notification Language              │
│  Language for email and push...     │
│  ┌─────────┬──────────┬──────────┐ │
│  │ English │ 日本語    │ မြန်မာ   │ │ ← Updates backend
│  └─────────┴──────────┴──────────┘ │
│                                     │
│  Currency                           │
│  $ USD                           ▸  │
│                                     │
│  Version                            │
│  1.0.0                              │
│                                     │
│  [Logout Button]                    │
└─────────────────────────────────────┘
```

---

## ✅ Fixed vs Before

### ❌ Before (Wrong)

- Only ONE language setting
- Changed both UI and notifications together
- No distinction between app language and backend notifications

### ✅ After (Correct - matches web frontend)

- TWO separate language settings
- App Language: Local (i18next)
- Notification Language: Backend (profile.locale)
- Independent control of each

---

## 🌐 Matching Web Frontend

The mobile app now works **exactly like the web frontend**:

**Web Frontend:**

- Top right: Language switcher (UI) → i18next
- Settings → Profile → Notification Language → Backend API

**Mobile App:**

- Profile Screen → App Language → i18next (localStorage)
- Profile Screen → Notification Language → Backend API

---

## 📝 Translation Keys

### English (en.json)

```json
{
  "profile": {
    "appLanguage": "App Language",
    "notificationLanguage": "Notification Language",
    "notificationLanguageHint": "Language for email and push notifications"
  }
}
```

### Japanese (ja.json)

```json
{
  "profile": {
    "appLanguage": "アプリの言語",
    "notificationLanguage": "通知言語",
    "notificationLanguageHint": "メールとプッシュ通知の言語"
  }
}
```

### Myanmar (my.json)

```json
{
  "profile": {
    "appLanguage": "အက်ပ်ဘာသာစကား",
    "notificationLanguage": "အကြောင်းကြားချက် ဘာသာစကား",
    "notificationLanguageHint": "အီးမေးလ်နှင့် ပုဆ့် အကြောင်းကြားချက်များအတွက်"
  }
}
```

---

## 🚀 Testing

1. **Test App Language:**

   ```
   1. Go to Profile
   2. Tap "App Language"
   3. Select Japanese
   4. UI immediately changes to Japanese
   5. Backend profile.locale unchanged
   ```

2. **Test Notification Language:**

   ```
   1. Go to Profile (in Japanese UI)
   2. Tap "Notification Language"
   3. Select English
   4. API call sends to backend
   5. profile.locale = "en"
   6. Future emails arrive in English
   7. UI stays in Japanese
   ```

3. **Test Independence:**

   ```
   App Language: Myanmar
   Notification Language: Japanese

   Result:
   - App shows မြန်မာ text
   - Backend sends 日本語 emails
   ```

---

## 🎓 Summary

| Setting                   | Purpose    | Storage              | Updates  |
| ------------------------- | ---------- | -------------------- | -------- |
| **App Language**          | UI text    | Local (AsyncStorage) | Instant  |
| **Notification Language** | Email/Push | Backend DB           | API call |

**Key Point:** They are completely independent! 🎯

Now the mobile app correctly mirrors the web frontend's language architecture.
