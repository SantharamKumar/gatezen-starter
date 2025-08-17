// Tiny auth helpers using localStorage

const KEY = 'user';

/** Return the saved user object (or null). */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

/** Save the logged-in user object (from /auth/login response). */
export function setUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

/** Remove user and effectively log out. */
export function clearUser() {
  localStorage.removeItem(KEY);
}

/** Boolean: is someone logged in? */
export function isAuthed() {
  return !!getUser();
}

/** Optional: convenience accessors */
export function getUserEmail() {
  return getUser()?.email || null;
}
export function getUserId() {
  return getUser()?.id || null;
}
