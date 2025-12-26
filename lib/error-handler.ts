/**
 * Global Error Handler for All CR AudioViz AI Apps
 * 
 * This handler:
 * 1. Captures all unhandled errors
 * 2. Auto-creates tickets
 * 3. Notifies user immediately
 * 4. Logs to central activity system
 * 
 * Usage: Import and call setupGlobalErrorHandler() in your app
 */

const CENTRAL_API = process.env.NEXT_PUBLIC_CENTRAL_API || 'https://craudiovizai.com/api';
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'unknown';

interface ErrorContext {
  componentStack?: string;
  userId?: string;
  userEmail?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export async function reportError(
  error: Error | unknown,
  context: ErrorContext = {}
): Promise<string | null> {
  try {
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    };
    
    // Determine priority based on error type
    let priority = 'medium';
    if (errorDetails.message.includes('payment') || 
        errorDetails.message.includes('auth') ||
        errorDetails.message.includes('credit')) {
      priority = 'critical';
    } else if (errorDetails.message.includes('timeout') ||
               errorDetails.message.includes('network')) {
      priority = 'high';
    }
    
    // Create ticket via central API
    const response = await fetch(`${CENTRAL_API}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bug',
        priority,
        subject: `[${APP_ID}] ${errorDetails.name}: ${errorDetails.message.substring(0, 100)}`,
        description: `
## Error Details
- **App:** ${APP_ID}
- **Error:** ${errorDetails.name}
- **Message:** ${errorDetails.message}
- **Route:** ${context.route || 'Unknown'}
- **User:** ${context.userId || 'Anonymous'}
- **Time:** ${new Date().toISOString()}

## Stack Trace
\`\`\`
${errorDetails.stack || 'No stack trace available'}
\`\`\`

## Component Stack
\`\`\`
${context.componentStack || 'N/A'}
\`\`\`

## Additional Context
\`\`\`json
${JSON.stringify(context.metadata || {}, null, 2)}
\`\`\`
        `,
        appId: APP_ID,
        userId: context.userId,
        autoCreated: true,
        metadata: errorDetails,
      }),
    });
    
    const result = await response.json();
    
    // Log to activity
    await fetch(`${CENTRAL_API}/activity/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'error',
        resource: APP_ID,
        userId: context.userId,
        metadata: {
          ticketId: result.ticketId,
          error: errorDetails.message,
        },
      }),
    });
    
    return result.ticketId;
  } catch (e) {
    console.error('Failed to report error:', e);
    return null;
  }
}

export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;
  
  // Catch unhandled errors
  window.onerror = (message, source, lineno, colno, error) => {
    reportError(error || new Error(String(message)), {
      metadata: { source, lineno, colno },
    });
  };
  
  // Catch unhandled promise rejections
  window.onunhandledrejection = (event) => {
    reportError(event.reason, {
      metadata: { type: 'unhandledRejection' },
    });
  };
  
  console.log(`[${APP_ID}] Global error handler initialized`);
}

// React Error Boundary helper
export function createErrorBoundaryHandler(componentName: string) {
  return (error: Error, errorInfo: { componentStack: string }) => {
    reportError(error, {
      componentStack: errorInfo.componentStack,
      metadata: { component: componentName },
    });
  };
}

export default {
  reportError,
  setupGlobalErrorHandler,
  createErrorBoundaryHandler,
};
