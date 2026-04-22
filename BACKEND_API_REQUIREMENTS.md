# Backend API Requirements - Unified Login/Register Flow

## Admin Panel APIs

### 1. Send OTP
**POST** `/api/admin/send-otp`
```json
Request: { "mobile": "9876543210" }
Response: { "message": "OTP sent successfully" }
```

### 2. Verify OTP
**POST** `/api/admin/verify-otp`
```json
Request: { "mobile": "9876543210", "otp": "1234" }

// If existing user:
Response: { 
  "isNewUser": false,
  "token": "jwt_token",
  "admin": { ...adminData }
}

// If new user:
Response: { 
  "isNewUser": true
}
```

### 3. Complete Registration (New User)
**POST** `/api/admin/complete-registration`
```json
Request: { 
  "mobile": "9876543210",
  "name": "John Doe"
}
Response: { 
  "token": "jwt_token",
  "admin": { ...adminData }
}
```

---

## User Panel APIs

### 1. Send OTP
**POST** `/api/users/send-otp`
```json
Request: { "mobile": "9876543210" }
Response: { "message": "OTP sent successfully" }
```
*Note: Already exists, just verify it works*

### 2. Verify OTP
**POST** `/api/users/verify-otp`
```json
Request: { "mobile": "9876543210", "otp": "1234" }

// If existing user:
Response: { 
  "isNewUser": false,
  "token": "jwt_token",
  "user": { ...userData },
  "multipleShops": true/false
}

// If new user:
Response: { 
  "isNewUser": true
}
```
*Note: Modify existing endpoint to return `isNewUser` flag*

### 3. Complete Registration (New User)
**POST** `/api/users/complete-registration`
```json
Request: { 
  "mobile": "9876543210",
  "name": "John Doe",
  "shopId": "SHOP123" // optional
}
Response: { 
  "token": "jwt_token",
  "user": { ...userData }
}
```

---

## Implementation Notes

### OTP Storage
- Store OTP in temporary collection/cache with mobile number
- 5-minute expiry
- 3 attempts limit
- For testing: Fixed OTP "1234"

### User Detection Logic
```javascript
// Check if mobile exists in database
const existingUser = await User.findOne({ mobile });
if (existingUser) {
  // Return token + user data
  return { isNewUser: false, token, user };
} else {
  // Ask for name
  return { isNewUser: true };
}
```

### Admin Auto-Generation
- Generate unique `adminId` automatically (e.g., `ADM${timestamp}`)
- Generate unique `shopId` automatically (e.g., `SHOP${timestamp}`)
- No password needed anymore

### Database Changes
- Admin model: Make `password` field optional
- User model: Make `password` field optional
- Both: Ensure `mobile` field exists

---

## Benefits
✅ Single page for login/register
✅ Better UX - less confusion
✅ OTP-based security
✅ Auto-detect existing users
✅ Simplified flow

---

## Testing Flow

### New Admin:
1. Enter mobile → Send OTP
2. Enter OTP → Verify
3. System detects new user → Ask name
4. Enter name → Auto-generate adminId, shopId → Login

### Existing Admin:
1. Enter mobile → Send OTP
2. Enter OTP → Verify
3. System detects existing user → Direct login

### New User (with QR):
1. Scan QR (shopId in URL)
2. Enter mobile → Send OTP
3. Enter OTP → Verify
4. System detects new user → Ask name
5. Enter name → Register with shopId → Login

### Existing User:
1. Enter mobile → Send OTP
2. Enter OTP → Verify
3. System detects existing user → Direct login
4. If multiple shops → Show shop selection
