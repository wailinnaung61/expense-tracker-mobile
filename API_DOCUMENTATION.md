# Expense Tracker Backend - API Documentation

## Overview
This is a comprehensive API documentation for the Expense Tracker Backend built with .NET 8. The API uses AWS Cognito for authentication and DynamoDB for data storage.

**Base URL:** `https://your-api-domain.com/api`

---

## Authentication

All endpoints (except those marked as `[Public]`) require authentication using **JWT Bearer Token**.

### Headers Required for Protected Endpoints
```json
{
  "Authorization": "Bearer <your_access_token>",
  "Content-Type": "application/json"
}
```

---

## Enums Reference

### TransactionType
| Value | Description |
|-------|-------------|
| `0` or `"Income"` | Income transaction |
| `1` or `"Expense"` | Expense transaction |
| `2` or `"Investment"` | Investment transaction |
| `3` or `"Savings"` | Savings transaction |

### PaymentStatus
| Value | Description |
|-------|-------------|
| `0` or `"Pending"` | Payment is pending |
| `1` or `"Completed"` | Payment is completed |
| `2` or `"Failed"` | Payment has failed |

---

## Common Response Models

### Pagination Request (Query Parameters)
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pageNumber` | `int` | `1` | Page number (1-based) |
| `pageSize` | `int` | `10` | Items per page (max: 999999999) |
| `nextPageToken` | `string?` | `null` | Cursor for next page (for cursor-based pagination) |

### Paginated Response
```json
{
  "items": [],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 100,
  "totalPages": 10,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "nextPageToken": "cursor_string",
  "previousPageToken": null
}
```

### Success Response
```json
{
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

# 1. AUTH CONTROLLER

Base Path: `/api/auth`

---

## 1.1 Sign Up
**Creates a new user account**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/signup` |
| **Auth Required** | ❌ No (Public) |

### Request Body
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### Response - Success (200)
```json
{
  "userId": "string",
  "isConfirmed": false,
  "message": "User created successfully. Please check your email for confirmation code."
}
```

### Response - Error (400)
```json
{
  "message": "Username already exists"
}
```

---

## 1.2 Resend Confirmation Code
**Resends the email confirmation code**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/resend-confirmation` |
| **Auth Required** | ❌ No (Public) |

### Request Body
```json
{
  "username": "string"
}
```

### Response - Success (200)
```json
{
  "message": "If the account exists, a confirmation code has been sent."
}
```

---

## 1.3 Confirm Sign Up
**Confirms user registration with verification code**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/confirm` |
| **Auth Required** | ❌ No (Public) |

### Request Body
```json
{
  "username": "string",
  "confirmationCode": "string"
}
```

### Response - Success (200)
```json
{
  "message": "Account confirmed successfully. You can now sign in."
}
```

### Response - Error (400)
```json
{
  "message": "Account confirmation failed. Please try again."
}
```

---

## 1.4 Sign In
**Authenticates user and returns tokens**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/signin` |
| **Auth Required** | ❌ No (Public) |

### Request Body
```json
{
  "usernameOrEmail": "string",
  "password": "string"
}
```

### Response - Success (200) - Without MFA
```json
{
  "requiresMfa": false,
  "tokens": {
    "accessToken": "string",
    "idToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "mfaChallenge": null
}
```

### Response - Success (200) - With MFA Required
```json
{
  "requiresMfa": true,
  "tokens": null,
  "mfaChallenge": {
    "session": "string",
    "challengeName": "SOFTWARE_TOKEN_MFA",
    "username": "string",
    "message": "MFA verification required"
  }
}
```

### Response - Error (401)
```json
{
  "message": "Invalid credentials"
}
```

---

## 1.5 Refresh Token
**Refreshes access token using refresh token**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/refresh` |
| **Auth Required** | ❌ No (Public) |

### Request Body
```json
{
  "refreshToken": "string",
  "username": "string"
}
```

### Response - Success (200)
```json
{
  "accessToken": "string",
  "idToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### Response - Error (401)
```json
{
  "message": "Invalid refresh token"
}
```

---

## 1.6 Forgot Password
**Initiates password reset flow**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/forgot-password` |
| **Auth Required** | ❌ No (Public) |

### Request Body
```json
{
  "usernameOrEmail": "string"
}
```

### Response - Success (200)
```json
{
  "message": "If the account exists, a password reset code has been sent to the email"
}
```

---

## 1.7 Reset Password
**Resets password with confirmation code**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/reset-password` |
| **Auth Required** | ❌ No (Public) |

### Request Body
```json
{
  "usernameOrEmail": "string",
  "confirmationCode": "string",
  "newPassword": "string"
}
```

### Response - Success (200)
```json
{
  "message": "Password reset successfully"
}
```

### Response - Error (400)
```json
{
  "message": "Invalid confirmation code"
}
```

---

## 1.8 Change Password
**Changes password for authenticated user**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/change-password` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

### Response - Success (200)
```json
{
  "message": "Password changed successfully"
}
```

### Response - Error (401)
```json
{
  "message": "Invalid old password"
}
```

---

## 1.9 Sign Out
**Signs out user and invalidates all tokens globally**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/signout` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Response - Success (200)
```json
{
  "message": "Signed out successfully"
}
```

---

## 1.10 Get Current User
**Gets the current authenticated user's profile**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/auth/me` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Response - Success (200)
```json
{
  "userId": "string",
  "userName": "string",
  "email": "string",
  "phoneNumber": "string",
  "cognitoUserId": "string",
  "cognitoUserName": "string",
  "userPoolId": "string",
  "mfaEnabled": false,
  "roleId": "USER",
  "status": "ACTIVE",
  "dailyLimit": 1000.00,
  "currency": "USD",
  "menus": [
    {
      "menuId": "string",
      "menuName": "string"
    }
  ]
}
```

### Response - Error (401)
```json
{
  "message": "Invalid token"
}
```

---

## 1.11 Update Profile
**Updates user profile information**

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /api/auth/profile` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "userName": "string",
  "email": "string"
}
```

### Response - Success (200)
```json
{
  "userId": "string",
  "userName": "string",
  "email": "string",
  "phoneNumber": "string",
  "cognitoUserId": "string",
  "cognitoUserName": "string",
  "userPoolId": "string",
  "mfaEnabled": false,
  "roleId": "USER",
  "status": "ACTIVE",
  "dailyLimit": 1000.00,
  "currency": "USD",
  "menus": []
}
```

---

## 1.12 Resend Email Verification
**Resends email verification for the authenticated user**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/resend-email-verification` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Response - Success (200)
```json
{
  "message": "If the account exists, an email verification has been (re)sent."
}
```

---

## 1.13 Confirm Email Change
**Confirms email change with verification code**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/auth/confirm-email-change` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "confirmationCode": "string"
}
```

### Response - Success (200)
```json
{
  "message": "Email confirmed and updated."
}
```

---

# 2. EXPENSE CATEGORY CONTROLLER

Base Path: `/api/expensecategory`

**All endpoints require authentication**

---

## 2.1 Get Categories (Paginated with Filters)
**Get, search, and filter expense categories with pagination**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/expensecategory` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `TransactionType` | No | Filter by type: `Income`, `Expense`, `Investment`, `Savings` |
| `keyword` | `string` | No | Search by category name |
| `pageNumber` | `int` | No | Page number (default: 1) |
| `pageSize` | `int` | No | Items per page (default: 10) |

### Example Requests
```
GET /api/expensecategory?pageNumber=1&pageSize=10          - Get all
GET /api/expensecategory?type=Expense                      - Filter by type
GET /api/expensecategory?keyword=food                      - Search by name
GET /api/expensecategory?type=Expense&keyword=food         - Combined filters
```

### Response - Success (200)
```json
{
  "items": [
    {
      "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "displayName": "Food & Dining",
      "displayNameLower": "food & dining",
      "type": "Expense",
      "icon": "🍔",
      "color": "#FF5722",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 25,
  "totalPages": 3,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "nextPageToken": null,
  "previousPageToken": null
}
```

---

## 2.2 Get Categories List (No Pagination)
**Get all categories of a specific type without pagination - ideal for dropdowns**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/expensecategory/list` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `TransactionType` | Yes | Filter by type: `Income`, `Expense`, `Investment`, `Savings` |

### Example Requests
```
GET /api/expensecategory/list?type=Expense    - Get all expense categories
GET /api/expensecategory/list?type=Income     - Get all income categories
```

### Response - Success (200)
```json
[
  {
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "displayName": "Food & Dining",
    "displayNameLower": "food & dining",
    "type": "Expense",
    "icon": "🍔",
    "color": "#FF5722",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": null
  }
]
```

---

## 2.3 Get Category by ID
**Get a single expense category by its ID**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/expensecategory/{id}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `Guid` | Yes | The category ID |

### Response - Success (200)
```json
{
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "displayName": "Food & Dining",
  "displayNameLower": "food & dining",
  "type": "Expense",
  "icon": "🍔",
  "color": "#FF5722",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": null
}
```

### Response - Error (404)
```json
{
  "message": "Expense category with ID {id} not found"
}
```

---

## 2.4 Create Category
**Create a new expense category**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/expensecategory` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "displayName": "Food & Dining",
  "type": "Expense",
  "icon": "🍔",
  "color": "#FF5722"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | `string` | Yes | Category display name |
| `type` | `TransactionType` | Yes | `Income`, `Expense`, `Investment`, or `Savings` |
| `icon` | `string` | Yes | Icon emoji or icon name |
| `color` | `string` | Yes | Hex color code |

### Response - Success (201)
```json
{
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "displayName": "Food & Dining",
  "displayNameLower": "food & dining",
  "type": "Expense",
  "icon": "🍔",
  "color": "#FF5722",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": null
}
```

---

## 2.5 Update Category
**Update an existing expense category**

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /api/expensecategory/{id}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `Guid` | Yes | The category ID |

### Request Body
```json
{
  "displayName": "Food & Beverages",
  "icon": "🍕",
  "color": "#E91E63"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | `string` | Yes | Updated category name |
| `icon` | `string` | Yes | Updated icon |
| `color` | `string` | Yes | Updated hex color |

### Response - Success (200)
```json
{
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "displayName": "Food & Beverages",
  "displayNameLower": "food & beverages",
  "type": "Expense",
  "icon": "🍕",
  "color": "#E91E63",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

### Response - Error (404)
```json
{
  "message": "Expense category with ID {id} not found"
}
```

---

## 2.6 Delete Category
**Delete an expense category**

| Property | Value |
|----------|-------|
| **Endpoint** | `DELETE /api/expensecategory/{id}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `Guid` | Yes | The category ID |

### Response - Success (204)
No content

### Response - Error (404)
```json
{
  "message": "Expense category with ID {id} not found"
}
```

---

# 3. TRANSACTION CONTROLLER

Base Path: `/api/tranaction`

**All endpoints require authentication**

---

## 3.1 Get Transactions (Paginated with Filters)
**Get, search, and filter transactions with pagination**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/tranaction` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `TransactionType` | No | Filter by type: `Income`, `Expense`, `Investment`, `Savings` |
| `status` | `PaymentStatus` | No | Filter by status: `Pending`, `Completed`, `Failed` |
| `categoryId` | `Guid` | No | Filter by category ID |
| `startDate` | `DateTime` | No | Filter start date (ISO 8601 format) |
| `endDate` | `DateTime` | No | Filter end date (ISO 8601 format) |
| `keyword` | `string` | No | Search in description or notes |
| `pageNumber` | `int` | No | Page number (default: 1) |
| `pageSize` | `int` | No | Items per page (default: 10) |

### Example Requests
```
GET /api/tranaction?pageNumber=1&pageSize=10                                    - Get all
GET /api/tranaction?type=Expense                                                - Filter by type
GET /api/tranaction?status=Pending                                              - Filter by status
GET /api/tranaction?categoryId=3fa85f64-5717-4562-b3fc-2c963f66afa6            - Filter by category
GET /api/tranaction?startDate=2024-01-01&endDate=2024-01-31                     - Date range
GET /api/tranaction?keyword=coffee                                              - Search by keyword
GET /api/tranaction?type=Expense&status=Completed&keyword=coffee                - Combined filters
```

### Response - Success (200)
```json
{
  "items": [
    {
      "tranactionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "type": "Expense",
      "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "categoryName": "Food & Dining",
      "amount": 25.50,
      "description": "Lunch at restaurant",
      "merchant": "McDonald's",
      "paymentMethod": "Credit Card",
      "status": "Completed",
      "tranactionDate": "2024-01-15",
      "imageUrl": "https://example.com/receipt.jpg",
      "createdAt": "2024-01-15T12:30:00Z",
      "updatedAt": null,
      "note": "Business lunch"
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 150,
  "totalPages": 15,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "nextPageToken": null,
  "previousPageToken": null
}
```

---

## 3.2 Get Transaction by ID
**Get a single transaction by its ID**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/tranaction/{id}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `Guid` | Yes | The transaction ID |

### Response - Success (200)
```json
{
  "tranactionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "Expense",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryName": "Food & Dining",
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "merchant": "McDonald's",
  "paymentMethod": "Credit Card",
  "status": "Completed",
  "tranactionDate": "2024-01-15",
  "imageUrl": "https://example.com/receipt.jpg",
  "createdAt": "2024-01-15T12:30:00Z",
  "updatedAt": null,
  "note": "Business lunch"
}
```

### Response - Error (404)
```json
{
  "message": "Tranaction with ID {id} not found"
}
```

---

## 3.3 Create Transaction
**Create a new transaction**

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /api/tranaction/create` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "type": "Expense",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 25.50,
  "tranactionDate": "2024-01-15",
  "status": "Completed",
  "description": "Lunch at restaurant",
  "note": "Business lunch",
  "imageUrl": "https://example.com/receipt.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `TransactionType` | Yes | `Income`, `Expense`, `Investment`, or `Savings` |
| `categoryId` | `string` | Yes | Category ID (GUID as string) |
| `amount` | `decimal` | Yes | Transaction amount |
| `tranactionDate` | `string` | Yes | Date in format "YYYY-MM-DD" |
| `status` | `PaymentStatus` | Yes | `Pending`, `Completed`, or `Failed` |
| `description` | `string` | Yes | Transaction description |
| `note` | `string` | Yes | Additional notes |
| `imageUrl` | `string` | Yes | URL to receipt image (can be empty string) |

### Response - Success (201)
```json
{
  "tranactionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "Expense",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryName": "Food & Dining",
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "merchant": "",
  "paymentMethod": "",
  "status": "Completed",
  "tranactionDate": "2024-01-15",
  "imageUrl": "https://example.com/receipt.jpg",
  "createdAt": "2024-01-15T12:30:00Z",
  "updatedAt": null,
  "note": "Business lunch"
}
```

---

## 3.4 Update Transaction
**Update an existing transaction**

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /api/tranaction/{id}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `Guid` | Yes | The transaction ID |

### Request Body
```json
{
  "type": "Expense",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 30.00,
  "tranactionDate": "2024-01-15",
  "status": "Completed",
  "description": "Updated lunch description",
  "note": "Updated note",
  "imageUrl": "https://example.com/new-receipt.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `TransactionType` | Yes | `Income`, `Expense`, `Investment`, or `Savings` |
| `categoryId` | `string` | Yes | Category ID (GUID as string) |
| `amount` | `decimal` | Yes | Transaction amount |
| `tranactionDate` | `string` | Yes | Date in format "YYYY-MM-DD" |
| `status` | `PaymentStatus` | Yes | `Pending`, `Completed`, or `Failed` |
| `description` | `string` | Yes | Transaction description |
| `note` | `string` | Yes | Additional notes |
| `imageUrl` | `string` | Yes | URL to receipt image |

### Response - Success (200)
```json
{
  "tranactionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "Expense",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryName": "Food & Dining",
  "amount": 30.00,
  "description": "Updated lunch description",
  "merchant": "",
  "paymentMethod": "",
  "status": "Completed",
  "tranactionDate": "2024-01-15",
  "imageUrl": "https://example.com/new-receipt.jpg",
  "createdAt": "2024-01-15T12:30:00Z",
  "updatedAt": "2024-01-16T09:15:00Z",
  "note": "Updated note"
}
```

### Response - Error (404)
```json
{
  "message": "Tranaction with ID {id} not found"
}
```

---

## 3.5 Delete Transaction
**Delete a transaction**

| Property | Value |
|----------|-------|
| **Endpoint** | `DELETE /api/tranaction/{id}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `Guid` | Yes | The transaction ID |

### Response - Success (204)
No content

### Response - Error (404)
```json
{
  "message": "Tranaction with ID {id} not found"
}
```

---

# 4. AGGREGATION CONTROLLER

Base Path: `/api/aggregation`

**All endpoints require authentication**

---

## 4.1 Get Daily Aggregation
**Get aggregation data for a specific date**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/daily/{date}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `date` | `string` | Yes | `YYYY-MM-DD` | The specific date |

### Example
```
GET /api/aggregation/daily/2024-01-15
```

### Response - Success (200)
```json
{
  "period": "2024-01-15",
  "income": 500.00,
  "expense": 150.50,
  "saving": 100.00,
  "investment": 50.00,
  "transactionCount": 8
}
```

### Response - Error (404)
```json
{
  "message": "No aggregation data found for date 2024-01-15"
}
```

---

## 4.2 Get Daily Aggregations Range
**Get daily aggregation data for a date range**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/daily` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `startDate` | `string` | Yes | `YYYY-MM-DD` | Start date |
| `endDate` | `string` | Yes | `YYYY-MM-DD` | End date |

### Example
```
GET /api/aggregation/daily?startDate=2024-01-01&endDate=2024-01-31
```

### Response - Success (200)
```json
[
  {
    "period": "2024-01-01",
    "income": 500.00,
    "expense": 150.50,
    "saving": 100.00,
    "investment": 50.00,
    "transactionCount": 8
  },
  {
    "period": "2024-01-02",
    "income": 0.00,
    "expense": 75.25,
    "saving": 0.00,
    "investment": 0.00,
    "transactionCount": 3
  }
]
```

---

## 4.3 Get Weekly Aggregation
**Get aggregation data for a specific week**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/weekly/{week}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `week` | `string` | Yes | `YYYY-Www` | Week identifier (e.g., "2024-W03") |

### Example
```
GET /api/aggregation/weekly/2024-W03
```

### Response - Success (200)
```json
{
  "period": "2024-W03",
  "income": 2500.00,
  "expense": 850.75,
  "saving": 500.00,
  "investment": 200.00,
  "transactionCount": 35
}
```

### Response - Error (404)
```json
{
  "message": "No aggregation data found for week 2024-W03"
}
```

---

## 4.4 Get Weekly Aggregations Range
**Get weekly aggregation data for a week range**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/weekly` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `startWeek` | `string` | Yes | `YYYY-Www` | Start week |
| `endWeek` | `string` | Yes | `YYYY-Www` | End week |

### Example
```
GET /api/aggregation/weekly?startWeek=2024-W01&endWeek=2024-W04
```

### Response - Success (200)
```json
[
  {
    "period": "2024-W01",
    "income": 2500.00,
    "expense": 850.75,
    "saving": 500.00,
    "investment": 200.00,
    "transactionCount": 35
  }
]
```

---

## 4.5 Get Monthly Aggregation
**Get aggregation data for a specific month**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/monthly/{month}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `month` | `string` | Yes | `YYYY-MM` | Month identifier (e.g., "2024-01") |

### Example
```
GET /api/aggregation/monthly/2024-01
```

### Response - Success (200)
```json
{
  "period": "2024-01",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "income": 10000.00,
  "expense": 3500.50,
  "saving": 2000.00,
  "investment": 1000.00,
  "transactionCount": 125
}
```

### Response - Error (404)
```json
{
  "message": "No aggregation data found for month 2024-01"
}
```

---

## 4.6 Get Monthly Aggregations Range
**Get monthly aggregation data for a month range**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/monthly` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `startMonth` | `string` | Yes | `YYYY-MM` | Start month |
| `endMonth` | `string` | Yes | `YYYY-MM` | End month |

### Example
```
GET /api/aggregation/monthly?startMonth=2024-01&endMonth=2024-06
```

### Response - Success (200)
```json
[
  {
    "period": "2024-01",
    "periodStart": "2024-01-01",
    "periodEnd": "2024-01-31",
    "income": 10000.00,
    "expense": 3500.50,
    "saving": 2000.00,
    "investment": 1000.00,
    "transactionCount": 125
  }
]
```

---

## 4.7 Get Yearly Aggregation
**Get aggregation data for a specific year**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/yearly/{year}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `year` | `string` | Yes | `YYYY` | Year (e.g., "2024") |

### Example
```
GET /api/aggregation/yearly/2024
```

### Response - Success (200)
```json
{
  "period": "2024",
  "income": 120000.00,
  "expense": 45000.00,
  "saving": 24000.00,
  "investment": 12000.00,
  "transactionCount": 1500
}
```

### Response - Error (404)
```json
{
  "message": "No aggregation data found for year 2024"
}
```

---

## 4.8 Get Yearly Aggregations Range
**Get yearly aggregation data for a year range**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/yearly` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `startYear` | `string` | Yes | `YYYY` | Start year |
| `endYear` | `string` | Yes | `YYYY` | End year |

### Example
```
GET /api/aggregation/yearly?startYear=2022&endYear=2024
```

### Response - Success (200)
```json
[
  {
    "period": "2022",
    "income": 100000.00,
    "expense": 40000.00,
    "saving": 20000.00,
    "investment": 10000.00,
    "transactionCount": 1200
  },
  {
    "period": "2023",
    "income": 110000.00,
    "expense": 42000.00,
    "saving": 22000.00,
    "investment": 11000.00,
    "transactionCount": 1350
  }
]
```

---

## 4.9 Get Category Monthly Aggregations
**Get monthly aggregations grouped by category**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/category/monthly/{month}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `month` | `string` | Yes | `YYYY-MM` | Month (e.g., "2024-01") |

### Example
```
GET /api/aggregation/category/monthly/2024-01
```

### Response - Success (200)
```json
[
  {
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "period": "2024-01",
    "periodStart": "2024-01-01",
    "periodEnd": "2024-01-31",
    "totalAmount": 850.50,
    "transactionCount": 25
  },
  {
    "categoryId": "4fb96g75-6828-5673-c4gd-3d074g77bgb7",
    "period": "2024-01",
    "periodStart": "2024-01-01",
    "periodEnd": "2024-01-31",
    "totalAmount": 500.00,
    "transactionCount": 15
  }
]
```

---

## 4.10 Get Expense Breakdown
**Get expense breakdown with categories for a specific month**

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/aggregation/expense-breakdown/{month}` |
| **Auth Required** | ✅ Yes |

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `month` | `string` | Yes | `YYYY-MM` | Month (e.g., "2024-01") |

### Example
```
GET /api/aggregation/expense-breakdown/2024-01
```

### Response - Success (200)
```json
{
  "totalExpenses": 3500.50,
  "categories": [
    {
      "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "categoryName": "Food & Dining",
      "amount": 850.50,
      "percentage": 24.3
    },
    {
      "categoryId": "4fb96g75-6828-5673-c4gd-3d074g77bgb7",
      "categoryName": "Transportation",
      "amount": 500.00,
      "percentage": 14.28
    },
    {
      "categoryId": "5gc07h86-7939-6784-d5he-4e185h88chc8",
      "categoryName": "Entertainment",
      "amount": 350.00,
      "percentage": 10.0
    }
  ],
  "comparison": {
    "lastMonth": 3200.00,
    "thisMonth": 3500.50,
    "difference": 300.50,
    "percentageChange": 9.39
  }
}
```

---

# API ENDPOINTS QUICK REFERENCE

## Authentication Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/resend-confirmation` | ❌ | Resend confirmation code |
| POST | `/api/auth/confirm` | ❌ | Confirm registration |
| POST | `/api/auth/signin` | ❌ | Sign in |
| POST | `/api/auth/refresh` | ❌ | Refresh token |
| POST | `/api/auth/forgot-password` | ❌ | Initiate password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password with code |
| POST | `/api/auth/change-password` | ✅ | Change password |
| POST | `/api/auth/signout` | ✅ | Sign out |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| POST | `/api/auth/resend-email-verification` | ✅ | Resend email verification |
| POST | `/api/auth/confirm-email-change` | ✅ | Confirm email change |

## Category Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/expensecategory` | ✅ | Get categories (paginated) |
| GET | `/api/expensecategory/list` | ✅ | Get categories (no pagination) |
| GET | `/api/expensecategory/{id}` | ✅ | Get category by ID |
| POST | `/api/expensecategory` | ✅ | Create category |
| PUT | `/api/expensecategory/{id}` | ✅ | Update category |
| DELETE | `/api/expensecategory/{id}` | ✅ | Delete category |

## Transaction Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tranaction` | ✅ | Get transactions (paginated) |
| GET | `/api/tranaction/{id}` | ✅ | Get transaction by ID |
| POST | `/api/tranaction/create` | ✅ | Create transaction |
| PUT | `/api/tranaction/{id}` | ✅ | Update transaction |
| DELETE | `/api/tranaction/{id}` | ✅ | Delete transaction |

## Aggregation Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/aggregation/daily/{date}` | ✅ | Get daily aggregation |
| GET | `/api/aggregation/daily` | ✅ | Get daily aggregations range |
| GET | `/api/aggregation/weekly/{week}` | ✅ | Get weekly aggregation |
| GET | `/api/aggregation/weekly` | ✅ | Get weekly aggregations range |
| GET | `/api/aggregation/monthly/{month}` | ✅ | Get monthly aggregation |
| GET | `/api/aggregation/monthly` | ✅ | Get monthly aggregations range |
| GET | `/api/aggregation/yearly/{year}` | ✅ | Get yearly aggregation |
| GET | `/api/aggregation/yearly` | ✅ | Get yearly aggregations range |
| GET | `/api/aggregation/category/monthly/{month}` | ✅ | Get category monthly aggregations |
| GET | `/api/aggregation/expense-breakdown/{month}` | ✅ | Get expense breakdown |

---

# HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (for POST requests that create resources) |
| 204 | No Content (for successful DELETE requests) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required or invalid token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

# Mobile App Integration Tips

1. **Token Storage**: Store `accessToken`, `refreshToken`, and `idToken` securely (e.g., Secure Storage/Keychain)
2. **Token Refresh**: Implement automatic token refresh using `/api/auth/refresh` before tokens expire
3. **Offline Support**: Cache category list and recent transactions for offline viewing
4. **MFA Flow**: Handle the `requiresMfa` response in sign-in for two-factor authentication
5. **Pagination**: Use `nextPageToken` for cursor-based pagination when available for better performance
6. **Date Formats**: Always use ISO 8601 format for dates (`YYYY-MM-DD`) and datetime (`YYYY-MM-DDTHH:mm:ssZ`)
