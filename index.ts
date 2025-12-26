/**
 * CR AudioViz AI - Central Components Library
 * 
 * This library provides ALL shared components per Henderson Standard.
 * Import from here to ensure consistency across apps.
 * 
 * @package crav-components
 * @version 1.0.0
 */

// UI Components
export { JavariChat } from './components/JavariChat';
export { CrossSell } from './components/CrossSell';

// Client Libraries (Central Services)
export * from './lib/central-auth';
export * from './lib/central-payments';
export * from './lib/central-ops';
export * from './lib/error-handler';

// Usage Example:
// import { JavariChat, CrossSell, signIn, createCheckout, reportError } from 'crav-components';
