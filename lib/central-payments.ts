/**
 * CR AudioViz AI - Central Payments Client
 * 
 * ALL APPS must use this for payments.
 * Connects to craudiovizai.com central payment service.
 * 
 * Usage:
 *   import { createStripeCheckout, createPayPalOrder, getBalance } from '@/lib/central-payments';
 *   
 * @author CR AudioViz AI
 * @created December 25, 2025
 * @standard Henderson Standard v2.0
 */

const CENTRAL_API = process.env.NEXT_PUBLIC_CENTRAL_API || 'https://craudiovizai.com/api';
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'unknown';

// ============================================================
// STRIPE PAYMENTS
// ============================================================

/**
 * Create Stripe checkout session
 */
export async function createStripeCheckout(options: {
  priceId?: string;
  productId?: string;
  quantity?: number;
  mode?: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  userId?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const response = await fetch(`${CENTRAL_API}/stripe/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        appId: APP_ID,
        successUrl: options.successUrl || `${window.location.origin}/success`,
        cancelUrl: options.cancelUrl || `${window.location.origin}/cancel`,
      }),
    });
    
    const data = await response.json();
    
    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    }
    
    return data;
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return { error: String(error) };
  }
}

/**
 * Get Stripe customer portal URL
 */
export async function getStripePortalUrl(userId: string) {
  try {
    const response = await fetch(`${CENTRAL_API}/stripe/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, appId: APP_ID }),
    });
    
    return response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

// ============================================================
// PAYPAL PAYMENTS
// ============================================================

/**
 * Create PayPal order
 */
export async function createPayPalOrder(options: {
  amount: number;
  currency?: string;
  description?: string;
  userId?: string;
}) {
  try {
    const response = await fetch(`${CENTRAL_API}/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        currency: options.currency || 'USD',
        appId: APP_ID,
      }),
    });
    
    return response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

/**
 * Capture PayPal order (after user approval)
 */
export async function capturePayPalOrder(orderId: string) {
  try {
    const response = await fetch(`${CENTRAL_API}/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, appId: APP_ID }),
    });
    
    return response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

// ============================================================
// CREDITS SYSTEM
// ============================================================

/**
 * Get user's credit balance
 */
export async function getCreditsBalance(userId: string) {
  try {
    const response = await fetch(`${CENTRAL_API}/credits/balance?userId=${userId}`);
    return response.json();
  } catch (error) {
    return { error: String(error), balance: 0 };
  }
}

/**
 * Spend credits
 */
export async function spendCredits(userId: string, amount: number, description: string) {
  try {
    const response = await fetch(`${CENTRAL_API}/credits/spend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        amount,
        description,
        appId: APP_ID,
      }),
    });
    
    return response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: string, required: number): Promise<boolean> {
  const { balance } = await getCreditsBalance(userId);
  return (balance || 0) >= required;
}

/**
 * Get credit transaction history
 */
export async function getCreditHistory(userId: string, limit = 50) {
  try {
    const response = await fetch(`${CENTRAL_API}/credits/history?userId=${userId}&limit=${limit}`);
    return response.json();
  } catch (error) {
    return { error: String(error), transactions: [] };
  }
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

/**
 * Get user's subscription status
 */
export async function getSubscription(userId: string) {
  try {
    const response = await fetch(`${CENTRAL_API}/subscriptions/status?userId=${userId}`);
    return response.json();
  } catch (error) {
    return { error: String(error), tier: 'free' };
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { tier } = await getSubscription(userId);
  return tier && tier !== 'free';
}

// ============================================================
// PRODUCT CATALOG
// ============================================================

/**
 * Get available products
 */
export async function getProducts(category?: string) {
  try {
    const url = category 
      ? `${CENTRAL_API}/checkout/products?category=${category}`
      : `${CENTRAL_API}/checkout/products`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return { error: String(error), products: [] };
  }
}

/**
 * Get credit packages for purchase
 */
export async function getCreditPackages() {
  return getProducts('credits');
}

export default {
  // Stripe
  createStripeCheckout,
  getStripePortalUrl,
  // PayPal
  createPayPalOrder,
  capturePayPalOrder,
  // Credits
  getCreditsBalance,
  spendCredits,
  hasEnoughCredits,
  getCreditHistory,
  // Subscriptions
  getSubscription,
  hasActiveSubscription,
  // Products
  getProducts,
  getCreditPackages,
};
