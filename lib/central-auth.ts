/**
 * CR AudioViz AI - Central Authentication Client
 * 
 * ALL APPS must use this for authentication.
 * Connects to craudiovizai.com central auth service.
 * 
 * Usage:
 *   import { signIn, signOut, getSession, useAuth } from '@/lib/central-auth';
 *   
 * @author CR AudioViz AI
 * @created December 25, 2025
 * @standard Henderson Standard v2.0
 */

import { createClient } from '@supabase/supabase-js';

// Central Supabase instance - ALL apps connect here
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create single shared Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// App identifier - set this in each app's env
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'unknown';

/**
 * Sign in with email/password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (data.user) {
    await trackUserActivity(data.user.id, 'sign_in');
  }
  
  return { data, error };
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'twitter' | 'facebook' | 'linkedin' | 'twitch') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  return { data, error };
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string, metadata?: { full_name?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (data.user) {
    // Track first app they signed up from
    await updateUserProfile(data.user.id, {
      first_seen_app: APP_ID,
      apps_used: [APP_ID],
    });
    await trackUserActivity(data.user.id, 'sign_up');
  }
  
  return { data, error };
}

/**
 * Sign out
 */
export async function signOut() {
  const session = await getSession();
  if (session?.user) {
    await trackUserActivity(session.user.id, 'sign_out');
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user
 */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Update user profile in central CRM
 */
export async function updateUserProfile(userId: string, updates: {
  full_name?: string;
  avatar_url?: string;
  first_seen_app?: string;
  last_active_app?: string;
  apps_used?: string[];
}) {
  // Add current app to apps_used if not already there
  if (updates.apps_used === undefined) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('apps_used')
      .eq('id', userId)
      .single();
    
    const currentApps = profile?.apps_used || [];
    if (!currentApps.includes(APP_ID)) {
      updates.apps_used = [...currentApps, APP_ID];
    }
  }
  
  // Always update last_active_app
  updates.last_active_app = APP_ID;
  
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    });
  
  return { error };
}

/**
 * Track user activity for CRM
 */
async function trackUserActivity(userId: string, action: string) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      app_id: APP_ID,
      action,
      metadata: {
        url: typeof window !== 'undefined' ? window.location.href : null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error('Failed to track activity:', e);
  }
}

/**
 * Hook to track page views and update user activity
 */
export function useTrackActivity() {
  if (typeof window === 'undefined') return;
  
  // Update last_active_app when user visits
  getSession().then(session => {
    if (session?.user) {
      updateUserProfile(session.user.id, {});
    }
  });
}

export default {
  supabase,
  signInWithEmail,
  signInWithOAuth,
  signUp,
  signOut,
  getSession,
  getUser,
  updateUserProfile,
  useTrackActivity,
};
