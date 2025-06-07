# Database Seed Data

This directory contains seed data for the database. The following data is seeded by default:

## Security & Encryption

🔐 **All sensitive data is properly encrypted using AES-256-CBC encryption:**

- **Card Numbers & CVV codes** - Encrypted using dedicated encryption keys and IVs
- **Credential Passwords** - Encrypted with bcrypt hashing + AES encryption
- **Secret Values** - All secret values (API keys, tokens, etc.) encrypted using AES-256
- **User Passwords** - Hashed using bcryptjs with salt rounds for authentication

The seeding process uses a dedicated encryption utility (`./encryption.ts`) that implements:

- AES-256-CBC encryption for all sensitive data
- Unique initialization vectors (IVs) for different data types
- Secure key management for development environments
- Proper encryption/decryption workflows

## Seeded Users

### 1. John Doe

- **Email**: <john.doe@example.com>
- **Password**: SecurePass123!
- **Avatar**: <https://avatar.vercel.sh/john.doe>

### 2. Jane Smith

- **Email**: <jane.smith@example.com>
- **Password**: SecurePass123!
- **Avatar**: <https://avatar.vercel.sh/jane.smith>

### 3. Mike Johnson

- **Email**: <mike.johnson@example.com>
- **Password**: SecurePass123!
- **Avatar**: <https://avatar.vercel.sh/mike.johnson>

## Seeded Platforms

- Google
- GitHub
- AWS
- Microsoft

## Seeded Containers

Each user has the following containers with specific purposes:

- **Personal** (Mixed) - Personal accounts and credentials
- **Work** (Mixed) - Work-related accounts and credentials
- **Finance** (Cards Only) - Financial accounts and payment information
- **Environment Variables** (Secrets Only) - Development environment secrets and API keys

## Seeded Tags

Each user has the following common tags:

- Important (#FF5733)
- Personal (#33FF57)
- Work (#3357FF)
- Finance (#F3FF33)
- Social (#FF33F3)

Additional container-specific tags are also created.

## Seeded Credentials

Each user has the following **encrypted** credentials:

- **Google account** - Personal email with encrypted password
- **GitHub account** - Development account with encrypted password and 2FA metadata
- **AWS account** - Work account with encrypted password (in Work container)

All credential passwords are properly encrypted and stored securely.

## Seeded Cards

Each user has the following **encrypted** payment cards in their Finance container:

- **Visa Credit Card**
  - Card Number: `4111111111111111` (encrypted)
  - CVV: `123` (encrypted)
  - Expiry: 2025-12-31
- **Mastercard**
  - Card Number: `5555555555554444` (encrypted)
  - CVV: `321` (encrypted)
  - Expiry: 2024-10-31

Card numbers and CVV codes are encrypted using AES-256 encryption.

## Seeded Secrets

Each user has the following **encrypted** secrets:

### Environment Variables Container:

- **DATABASE_URL** - PostgreSQL connection string (encrypted)
- **API_KEY** - Main API key for external services (encrypted)
- **JWT_SECRET** - JWT token signing secret (encrypted)
- **REDIS_URL** - Redis connection URL (encrypted)
- **STRIPE_SECRET_KEY** - Stripe payment processing key (encrypted)

### Work Container (Legacy):

- **AWS Access Key** - AWS API key (encrypted)
- **GitHub Personal Access Token** - GitHub API access token (encrypted)

All secret values are encrypted using AES-256-CBC encryption.

## Running the Seeder

To run the seeder, use the following command:

```bash
pnpm db:seed
```

## Security Notes

⚠️ **Important Security Information:**

1. **Development Only**: The encryption keys used in seeding are for development purposes only
2. **Production**: In production, use proper key management systems (AWS KMS, Azure Key Vault, etc.)
3. **Key Rotation**: Implement proper key rotation policies in production environments
4. **Access Control**: Ensure proper access controls are in place for encrypted data
5. **Compliance**: Follow your organization's security and compliance requirements

The seeded data demonstrates the full encryption workflow that should be implemented in production environments.
