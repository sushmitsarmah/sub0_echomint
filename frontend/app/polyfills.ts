/**
 * Browser polyfills for Node.js packages
 * This file ensures compatibility of Node.js packages in the browser
 */

// Define global for Node.js packages that expect it
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Define process.env for packages that expect it
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {},
  };
}

export {};
