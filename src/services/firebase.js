// ─── Firebase stub ────────────────────────────────────────────────────────────
// TruckLink auth uses JWT + AsyncStorage, NOT Firebase Auth.
// This stub prevents import errors in screens that haven't been migrated yet.
// Real Firebase can be wired up later by replacing with actual config.

export const auth = { currentUser: null };
export const db   = {};
export default {};
