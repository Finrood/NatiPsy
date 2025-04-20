// Polyfill for Buffer (needed by gray-matter in the browser)
import { Buffer } from 'buffer';
(window as any).global = window;
(window as any).Buffer = Buffer;

// --- Existing polyfills below (if any) ---
// Example: import 'zone.js'; // Usually already in angular.json polyfills array 