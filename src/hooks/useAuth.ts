/**
 * useAuth — re-exported from AuthContext for backward compatibility.
 *
 * Previously this hook created its own onAuthStateChange listener,
 * causing duplicate listeners and Navigator Locks deadlock.
 *
 * Now it reads auth state from AuthContext — the single source of truth.
 * The only onAuthStateChange listener lives in AuthProvider.
 *
 * WARNING: Do NOT create new onAuthStateChange listeners anywhere else.
 */
export { useAuth } from '../contexts/AuthContext'
