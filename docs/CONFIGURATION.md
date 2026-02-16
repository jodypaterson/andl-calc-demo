# Environment Configuration Guide

## Purpose

This guide documents all environment variables used in the ANDL Demo Calculator application. Environment variables provide a secure, portable way to configure application behavior across development, staging, and production environments.

## Setup Instructions

### Quick Start

1. Copy the template to create your local configuration:
   ```bash
   cp .env.example .env
   ```

2. Update values in `.env` for your environment

3. **NEVER commit `.env` files** - they may contain secrets

### Package-Specific Configuration

For server-only or client-only development:

```bash
# Server configuration
cp packages/server/.env.example packages/server/.env

# Client configuration  
cp packages/client/.env.example packages/client/.env
```

## Environment Variables Reference

### Server Configuration

#### NODE_ENV

- **Type:** String (enum)
- **Required:** Yes
- **Default:** `development`
- **Values:** `development`, `production`, `test`
- **Description:** Application environment mode. Controls logging verbosity, error handling behavior, and optimization levels.
- **Security Notes:** Always set to `production` in production deployments.

#### PORT

- **Type:** Number
- **Required:** Yes
- **Default:** `3001`
- **Description:** Port number the server listens on.
- **Example:** `3001`, `8080`

#### API_BASE_URL

- **Type:** String (URL)
- **Required:** Yes
- **Default:** `http://localhost:3001`
- **Description:** Base URL for API endpoints. Used for constructing full API URLs.
- **Environment-Specific:**
  - **Development:** `http://localhost:3001`
  - **Staging:** `https://api-staging.example.com`
  - **Production:** `https://api.example.com`

### Client Configuration

#### VITE_API_URL

- **Type:** String (URL)
- **Required:** Yes
- **Default:** `http://localhost:3001/api`
- **Description:** API endpoint URL for client-side requests. **MUST use `VITE_` prefix** to be exposed to the browser bundle by Vite.
- **Environment-Specific:**
  - **Development:** `http://localhost:3001/api`
  - **Staging:** `https://api-staging.example.com/api`
  - **Production:** `https://api.example.com/api`
- **Security Notes:** Only variables prefixed with `VITE_` are exposed to the client bundle. Never put secrets in VITE_ variables.

### Authentication

#### JWT_SECRET

- **Type:** String
- **Required:** Yes
- **Minimum Length:** 32 characters (production)
- **Description:** Secret key used for signing and verifying JWT tokens.
- **Security Notes:**
  - **CRITICAL:** Must be at least 32 characters in production
  - Use cryptographically secure random generation
  - Different secret for each environment
  - Rotate periodically
- **Generation:**
  ```bash
  openssl rand -base64 32
  ```
- **Example (DO NOT USE):** `your-secret-key-here-min-32-characters`

#### JWT_EXPIRES_IN

- **Type:** String (duration)
- **Required:** Yes
- **Default:** `7d`
- **Description:** Token expiration duration. Uses zeit/ms format.
- **Examples:** `7d` (7 days), `24h` (24 hours), `60m` (60 minutes)
- **Environment-Specific:**
  - **Development:** `7d` (convenience)
  - **Production:** `1h` or `24h` (security)

### Security

#### CORS_ORIGIN

- **Type:** String (URL)
- **Required:** Yes
- **Default:** `http://localhost:5173`
- **Description:** Allowed origin for Cross-Origin Resource Sharing (CORS). Restricts which domains can make API requests.
- **Environment-Specific:**
  - **Development:** `http://localhost:5173`
  - **Staging:** `https://app-staging.example.com`
  - **Production:** `https://app.example.com`
- **Security Notes:** Never use `*` (wildcard) in production. Specify exact domains.

#### RATE_LIMIT_WINDOW_MS

- **Type:** Number (milliseconds)
- **Required:** Yes
- **Default:** `900000` (15 minutes)
- **Description:** Time window for rate limiting in milliseconds.
- **Example:** `900000` = 15 minutes, `3600000` = 1 hour

#### RATE_LIMIT_MAX

- **Type:** Number
- **Required:** Yes
- **Default:** `100`
- **Description:** Maximum number of requests allowed per rate limit window.
- **Environment-Specific:**
  - **Development:** `1000` (permissive)
  - **Production:** `100` (restrictive)

### Logging

#### LOG_LEVEL

- **Type:** String (enum)
- **Required:** No
- **Default:** `info`
- **Values:** `debug`, `info`, `warn`, `error`
- **Description:** Logging verbosity level. Lower levels include all higher levels.
- **Environment-Specific:**
  - **Development:** `debug` (verbose)
  - **Production:** `info` or `warn` (concise)

## Environment-Specific Guidance

### Development Environment

- Use default values from `.env.example`
- Permissive rate limiting for testing
- Verbose logging (`LOG_LEVEL=debug`)
- Short-lived tokens acceptable (`JWT_EXPIRES_IN=7d`)

### Staging Environment

- Match production configuration structure
- Use staging-specific domains
- Moderate logging (`LOG_LEVEL=info`)
- Production-like security settings

### Production Environment

**Critical Security Requirements:**

1. **JWT_SECRET:** Minimum 32 characters, cryptographically random
2. **CORS_ORIGIN:** Exact domain match, NO wildcards
3. **Rate Limiting:** Restrictive settings (default: 100 requests per 15 min)
4. **Logging:** Concise (`LOG_LEVEL=info` or `warn`)
5. **Token Expiration:** Short-lived (`JWT_EXPIRES_IN=1h` or `24h`)

## Configuration Loading

### Server (Node.js)

The server uses the `dotenv` package to load environment variables from `.env` files:

```javascript
import dotenv from 'dotenv';
dotenv.config();

// Access variables
const port = process.env.PORT;
const jwtSecret = process.env.JWT_SECRET;
```

### Client (Vite)

Vite automatically exposes variables prefixed with `VITE_` to the client bundle:

```javascript
// Access in client code
const apiUrl = import.meta.env.VITE_API_URL;
```

**Important:** Only `VITE_` prefixed variables are accessible in client code. Server variables (PORT, JWT_SECRET, etc.) are NOT exposed to the browser.

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use `.env.example` as template** with placeholder values
3. **Rotate secrets regularly** (quarterly minimum)
4. **Different secrets per environment** (dev, staging, prod)
5. **Minimum 32-character secrets** in production
6. **No real secrets in `.env.example`** files
7. **Client variables are public** - never put secrets in `VITE_` variables
8. **Audit environment variables** during security reviews

## Troubleshooting

### Server Can't Load Configuration

1. Verify `.env` file exists: `ls -la .env`
2. Check file permissions: `chmod 644 .env`
3. Ensure `dotenv` is installed: `pnpm list dotenv`
4. Verify no syntax errors in `.env`

### Client Variables Not Accessible

1. Verify variable has `VITE_` prefix
2. Restart Vite dev server after changes
3. Check browser console for import.meta.env object
4. Ensure `.env` file is in project root or package directory

### Git Tracking Issues

1. Verify `.gitignore` includes `.env` pattern
2. Check `.env.example` is NOT ignored
3. Remove `.env` from tracking if accidentally committed:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   ```

## References

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
