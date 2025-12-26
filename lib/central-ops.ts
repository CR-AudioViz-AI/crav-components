/**
 * CR AudioViz AI - Central Operations Client
 * 
 * ALL APPS must use this for:
 * - Activity logging
 * - Error tracking
 * - Ticketing
 * - Notifications
 * 
 * Usage:
 *   import { logActivity, createTicket, sendNotification } from '@/lib/central-ops';
 *   
 * @author CR AudioViz AI
 * @created December 25, 2025
 * @standard Henderson Standard v2.0
 */

const CENTRAL_API = process.env.NEXT_PUBLIC_CENTRAL_API || 'https://craudiovizai.com/api';
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'unknown';

// ============================================================
// ACTIVITY LOGGING
// ============================================================

export type ActivityType = 
  | 'page_view'
  | 'feature_use'
  | 'purchase'
  | 'sign_in'
  | 'sign_up'
  | 'sign_out'
  | 'error'
  | 'api_call'
  | 'export'
  | 'share'
  | 'settings_change';

/**
 * Log user activity to central activity center
 */
export async function logActivity(options: {
  userId?: string;
  action: ActivityType | string;
  resource?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await fetch(`${CENTRAL_API}/activity/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        appId: APP_ID,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      }),
    });
  } catch (e) {
    // Silent fail for logging
    console.error('Activity log failed:', e);
  }
}

/**
 * Log page view
 */
export function logPageView(userId?: string, pageName?: string) {
  logActivity({
    userId,
    action: 'page_view',
    resource: pageName || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
  });
}

/**
 * Log feature usage
 */
export function logFeatureUse(userId: string | undefined, featureName: string, metadata?: Record<string, any>) {
  logActivity({
    userId,
    action: 'feature_use',
    resource: featureName,
    metadata,
  });
}

// ============================================================
// ERROR TRACKING & AUTO-TICKETING
// ============================================================

/**
 * Report error and auto-create support ticket
 */
export async function reportError(error: Error | string, options?: {
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  autoTicket?: boolean;
}) {
  const errorDetails = {
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    appId: APP_ID,
    userId: options?.userId,
    severity: options?.severity || 'medium',
    url: typeof window !== 'undefined' ? window.location.href : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    timestamp: new Date().toISOString(),
  };

  // Log the error
  await logActivity({
    userId: options?.userId,
    action: 'error',
    metadata: errorDetails,
  });

  // Auto-create ticket if severity is high or critical
  if (options?.autoTicket !== false && (options?.severity === 'high' || options?.severity === 'critical')) {
    await createTicket({
      type: 'bug',
      priority: options.severity === 'critical' ? 'urgent' : 'high',
      subject: `Auto-detected error in ${APP_ID}: ${errorDetails.message.slice(0, 100)}`,
      description: `
        **Auto-generated bug ticket**
        
        App: ${APP_ID}
        User: ${options.userId || 'Anonymous'}
        URL: ${errorDetails.url}
        Time: ${errorDetails.timestamp}
        
        **Error:**
        ${errorDetails.message}
        
        **Stack Trace:**
        \`\`\`
        ${errorDetails.stack || 'No stack trace available'}
        \`\`\`
      `,
      userId: options.userId,
    });
  }

  return errorDetails;
}

/**
 * Global error handler - call this in your app's error boundary
 */
export function setupGlobalErrorHandler() {
  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      reportError(error || String(message), { severity: 'high', autoTicket: true });
    };

    window.onunhandledrejection = (event) => {
      reportError(event.reason, { severity: 'high', autoTicket: true });
    };
  }
}

// ============================================================
// TICKETING SYSTEM
// ============================================================

export type TicketType = 'bug' | 'enhancement' | 'support' | 'security' | 'billing';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Create support ticket
 */
export async function createTicket(options: {
  type: TicketType;
  priority?: TicketPriority;
  subject: string;
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const response = await fetch(`${CENTRAL_API}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        priority: options.priority || 'medium',
        appId: APP_ID,
        status: 'open',
        createdAt: new Date().toISOString(),
      }),
    });
    
    return response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

/**
 * Get user's tickets
 */
export async function getUserTickets(userId: string) {
  try {
    const response = await fetch(`${CENTRAL_API}/tickets?userId=${userId}`);
    return response.json();
  } catch (error) {
    return { error: String(error), tickets: [] };
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert';

/**
 * Send notification to user
 */
export async function sendNotification(options: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  actionUrl?: string;
  channels?: ('in_app' | 'email' | 'push')[];
}) {
  try {
    const response = await fetch(`${CENTRAL_API}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        type: options.type || 'info',
        channels: options.channels || ['in_app'],
        appId: APP_ID,
      }),
    });
    
    return response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

/**
 * Get user's notifications
 */
export async function getNotifications(userId: string, unreadOnly = false) {
  try {
    const url = unreadOnly 
      ? `${CENTRAL_API}/notifications?userId=${userId}&unread=true`
      : `${CENTRAL_API}/notifications?userId=${userId}`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return { error: String(error), notifications: [] };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  try {
    const response = await fetch(`${CENTRAL_API}/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    return response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

export default {
  // Activity
  logActivity,
  logPageView,
  logFeatureUse,
  // Errors
  reportError,
  setupGlobalErrorHandler,
  // Tickets
  createTicket,
  getUserTickets,
  // Notifications
  sendNotification,
  getNotifications,
  markNotificationRead,
};
