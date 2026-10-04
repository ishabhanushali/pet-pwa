# Pet PWA - Email OTP Setup

Pet PWA now supports authentication using an OTP sent
to the customer's email address.

## Login / Signup Flow

The customer enters:

- Full Name
- Email Address
- Phone Number

Pet PWA then generates a random 6-digit OTP.

The OTP is:

1. Hashed using SHA-256.
2. Stored temporarily in PostgreSQL.
3. Valid for 5 minutes.
4. Limited to 5 verification attempts.
5. Deleted after successful verification.

After successful OTP verification, the customer's:

- Name
- Email
- Mobile Number

are saved in the Customer table.

A secure customer session is then created.

---

