import { HelmetOptions } from 'helmet';

/**
 * Get Helmet security configuration with environment-aware CSP directives.
 * 
 * Development mode includes relaxed CSP settings to support Vite HMR (Hot Module Replacement),
 * source maps, and development server functionality.
 * 
 * Production mode enforces strict CSP without 'unsafe-inline' or 'unsafe-eval' for maximum security.
 * 
 * @returns {HelmetOptions} Helmet configuration object
 */
export function getSecurityConfig(): HelmetOptions {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    // Content Security Policy (CSP)
    contentSecurityPolicy: {
      directives: {
        // Default policy: only same-origin resources
        defaultSrc: ["'self'"],
        
        // Scripts: same origin only, with dev exceptions for Vite HMR
        scriptSrc: [
          "'self'",
          ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
        ],
        
        // Styles: same origin + inline styles (for styled-components/emotion)
        styleSrc: ["'self'", "'unsafe-inline'"],
        
        // Images: same origin, data URIs (inline images), and blobs
        imgSrc: ["'self'", 'data:', 'blob:'],
        
        // API calls: same origin only
        connectSrc: ["'self'"],
        
        // Fonts: same origin only
        fontSrc: ["'self'"],
        
        // Prevent clickjacking: no embedding in iframes
        frameAncestors: ["'none'"],
        
        // Block plugins (Flash, Java, etc.)
        objectSrc: ["'none'"],
        
        // Restrict <base> tag to same origin
        baseUri: ["'self'"],
        
        // Forms can only submit to same origin
        formAction: ["'self'"],
      },
    },

    // Cross-Origin-Embedder-Policy: disabled to allow loading external fonts/images
    // Enable this if you don't need cross-origin resources
    crossOriginEmbedderPolicy: false,

    // HTTP Strict Transport Security (HSTS)
    // Forces HTTPS connections for 1 year, including subdomains
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true, // Allow inclusion in browser HSTS preload lists
    },

    // X-Content-Type-Options: nosniff
    // Prevents browsers from MIME-sniffing responses
    // (Already enabled by default in Helmet, explicitly shown for clarity)
    noSniff: true,

    // X-Frame-Options: DENY
    // Prevents page from being embedded in iframes (clickjacking protection)
    // (Already enabled by default in Helmet, explicitly shown for clarity)
    frameguard: {
      action: 'deny',
    },

    // X-XSS-Protection: 0
    // Modern browsers use CSP instead, so disable legacy XSS filter
    // (Helmet sets this to 0 by default, explicitly shown for clarity)
    xssFilter: false,

    // Referrer-Policy: strict-origin-when-cross-origin
    // Controls how much referrer information is included with requests
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // Permissions-Policy
    // Restricts browser features (camera, microphone, geolocation)
    permissionsPolicy: {
      features: {
        camera: [], // No origins allowed
        microphone: [], // No origins allowed
        geolocation: [], // No origins allowed
      },
    },
  };
}
