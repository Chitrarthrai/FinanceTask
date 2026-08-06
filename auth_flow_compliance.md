# Supabase Authentication Compliance (2-Step Flow)

This document outlines how the `FinanceTask` mobile application satisfies the VAPT requirement for a secure 2-step authentication and token issuance flow.

## VAPT Requirement
The application must not return long-lived session tokens (e.g., JWTs) from initial login/OTP-request endpoints before the user has successfully proven their identity. A secure 2-step verification must be in place.

## Supabase Implementation
The application uses Supabase as its backend-as-a-service (BaaS), which natively enforces a highly secure, mathematically sound 2-step token exchange flow that fully complies with and exceeds this VAPT requirement.

### Step 1: Initial Request (Pre-Auth)
- The mobile app calls `supabase.auth.signInWithOtp({ phone })` or `signInWithPassword`.
- **Server Response**: The Supabase Auth server (GoTrue) validates the request. Crucially, it **does not** return an `access_token` or `refresh_token` in this initial response. It only returns a confirmation that the OTP was sent or the request was acknowledged. 
- *Compliance check:* No long-lived credentials leaked.

### Step 2: Verification and Token Exchange
- The user inputs the OTP code.
- The mobile app calls `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`.
- **Server Response**: The Supabase Auth server validates the OTP against the hashed value in the database.
- *Only upon successful verification* does the server issue the long-lived `access_token` (JWT) and `refresh_token`.

### Conclusion
By leveraging Supabase's managed authentication, the application inherently avoids the vulnerability of leaking long-lived tokens prior to full identity verification. The flow is strictly separated into request and exchange phases, fully satisfying the VAPT hardening standard.
