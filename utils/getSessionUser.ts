import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';
import type { Session } from 'next-auth';

export interface SessionUser {
  user: Session['user'];
  userId: string;
  role?: string;
}

type GetSessionOptions = {
  required?: boolean;
  redirectTo?: string;
};

/**
 * Get the current user's session on the server side
 *
 * @param options Configuration options
 * @param options.required Whether to throw an error if no session exists
 * @returns The user session data or null if no session exists
 */
export const getSessionUser = async (
  options: GetSessionOptions = {}
): Promise<SessionUser | null> => {
  try {
    const session = await getServerSession(authOptions);
    console.log(session);

    if (!session || !session.user) {
      if (options.required) {
        throw new Error('Authentication required');
      }
      return null;
    }

    return {
      user: session.user,
      userId: session.user.id,
      role: session.user.role,
    };
  } catch (error) {
    console.error('Error getting session user:', error);

    // Re-throw the error if session is required
    if (options.required) {
      throw error;
    }

    return null;
  }
};

/**
 * Check if the current user has a specific role
 *
 * @param role The role to check for
 * @returns A function that takes a session user and returns a boolean
 */
export const hasRole = (role: string | string[]) => {
  const roles = Array.isArray(role) ? role : [role];

  return (sessionUser: SessionUser | null): boolean => {
    if (!sessionUser || !sessionUser.user.role) return false;
    return roles.includes(sessionUser.user.role);
  };
};

/**
 * Check if the current user is authenticated
 *
 * @param sessionUser The session user object
 * @returns Whether the user is authenticated
 */
export const isAuthenticated = (sessionUser: SessionUser | null): boolean => {
  return !!sessionUser;
};

/**
 * Check if the current user is an admin
 *
 * @param sessionUser The session user object
 * @returns Whether the user is an admin
 */
export const isAdmin = hasRole(['admin', 'superadmin']);
