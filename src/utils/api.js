// ─────────────────────────────────────────────────────────────────────────────
//  TruckLink  —  API Service
//  Place this file at:  src/utils/api.js
//
//  This replaces Firebase. All calls go to your Node.js + MySQL backend.
//  Change API_BASE_URL to your Railway deployment URL when you deploy.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Change this URL after you deploy to Railway ───────────────────────────────
// Local testing (your computer):   'http://localhost:3000'
// Railway (production):            'https://your-app-name.up.railway.app'
export const API_BASE_URL = 'https://trucklink-backend-production.up.railway.app';

// ─────────────────────────────────────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getToken() {
  return AsyncStorage.getItem('trucklink_token');
}

async function apiFetch(path, options = {}) {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Auth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {object} params - { phone, password, role, full_name, lang? }
 * @returns {{ token, user }}
 */
export async function register({ phone, password, role, full_name, lang = 'ar' }) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, role, full_name, lang }),
  });
  await AsyncStorage.setItem('trucklink_token', data.token);
  await AsyncStorage.setItem('trucklink_user',  JSON.stringify(data.user));
  return data;
}

/**
 * Login with phone + password.
 * @param {object} params - { phone, password }
 * @returns {{ token, user }}
 */
export async function login({ phone, password }) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
  await AsyncStorage.setItem('trucklink_token', data.token);
  await AsyncStorage.setItem('trucklink_user',  JSON.stringify(data.user));
  return data;
}

/**
 * Logout — clears stored token.
 */
export async function logout() {
  await AsyncStorage.removeItem('trucklink_token');
  await AsyncStorage.removeItem('trucklink_user');
}

/**
 * Get the currently logged-in user from local storage.
 * @returns {object|null}
 */
export async function getCurrentUser() {
  const json = await AsyncStorage.getItem('trucklink_user');
  return json ? JSON.parse(json) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Drivers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all available drivers.
 * @param {object} filters - { truck_type?, from_city?, to_city?, search? }
 * @returns {{ drivers: [] }}
 */
export async function getDrivers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.truck_type && filters.truck_type !== 'all') params.set('truck_type', filters.truck_type);
  if (filters.from_city) params.set('from_city', filters.from_city);
  if (filters.to_city)   params.set('to_city',   filters.to_city);
  if (filters.search)    params.set('search',     filters.search);

  const query = params.toString();
  return apiFetch(`/api/drivers${query ? '?' + query : ''}`);
}

/**
 * Get one driver's full profile.
 * @param {number} driverId
 */
export async function getDriver(driverId) {
  return apiFetch(`/api/drivers/${driverId}`);
}

/**
 * Create a driver profile after account registration.
 * @param {object} profile - { full_name, id_number, truck_type, plate_number,
 *                             truck_color?, capacity_tons?, price_per_ton?,
 *                             from_city?, to_city? }
 */
export async function createDriverProfile(profile) {
  const data = await apiFetch('/api/drivers', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
  // Store the driver ID so DriverAvailabilityScreen can fetch the profile without re-entering info
  if (data.driverId) {
    await AsyncStorage.setItem('trucklink_driver_id', String(data.driverId));
  }
  return data;
}

/**
 * Get the stored driver ID (set after createDriverProfile succeeds).
 * @returns {Promise<string|null>}
 */
export async function getStoredDriverId() {
  return AsyncStorage.getItem('trucklink_driver_id');
}

/**
 * Check if a phone number is already registered.
 * Public — no auth token needed.
 * Returns { exists, name?, role?, token? }
 * @param {string} phone  e.g. '+966501234567'
 */
export async function checkPhone(phone) {
  try {
    const data = await apiFetch(`/api/auth/check?phone=${encodeURIComponent(phone)}`);
    // If server returned a token for the returning user, store it so subsequent
    // API calls (getMyDriverProfile, etc.) work without a separate login step.
    if (data.token) {
      await AsyncStorage.setItem('trucklink_token', data.token);
      // Also update the stored user object
      await AsyncStorage.setItem('trucklink_user', JSON.stringify({
        phone, role: data.role, full_name: data.name,
        created_at: data.created_at ?? null,
      }));
    }
    return data;
  } catch {
    return { exists: false };
  }
}

/**
 * Get ALL trucks registered under the logged-in driver's account (up to 3).
 * @returns {{ trucks: [] }}
 */
export async function getMyTrucks() {
  return apiFetch('/api/drivers/my-trucks');
}

/**
 * Get the current user's own driver profile from the server (by JWT user_id).
 * Also stores/refreshes the driverId in AsyncStorage.
 * @returns {{ driver: object } | null}
 */
export async function getMyDriverProfile() {
  const data = await apiFetch('/api/drivers/me');
  if (data?.driver?.id) {
    await AsyncStorage.setItem('trucklink_driver_id', String(data.driver.id));
  }
  return data;
}

/**
 * Update a driver profile (partial update — only changed fields needed).
 * @param {number} driverId
 * @param {object} updates
 */
export async function updateDriverProfile(driverId, updates) {
  return apiFetch(`/api/drivers/${driverId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Loads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get loads.
 * @param {object} filters - { status?, from_city?, to_city?, cargo_type? }
 */
export async function getLoads(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiFetch(`/api/loads?${params.toString()}`);
}

/**
 * Get one load.
 * @param {number} loadId
 */
export async function getLoad(loadId) {
  return apiFetch(`/api/loads/${loadId}`);
}

/**
 * Create a new load (shipper).
 * @param {object} load - { cargo_type, weight_tons, from_city, to_city,
 *                          offered_price?, pickup_date?, notes? }
 */
export async function createLoad(load) {
  return apiFetch('/api/loads', {
    method: 'POST',
    body: JSON.stringify(load),
  });
}

/**
 * Update a load's status.
 * @param {number} loadId
 * @param {string} status - 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
 */
export async function updateLoadStatus(loadId, status) {
  return apiFetch(`/api/loads/${loadId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Accept a negotiated price — links driver to load and sets status=confirmed.
 * @param {number} loadId
 * @param {number} driverId
 * @param {number} agreedPrice
 */
export async function acceptLoad(loadId, driverId, agreedPrice) {
  return apiFetch(`/api/loads/${loadId}/accept`, {
    method: 'PUT',
    body: JSON.stringify({ driver_id: driverId, agreed_price: agreedPrice }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Messages / Chat
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all chat messages for a load.
 * @param {number} loadId
 */
export async function getMessages(loadId) {
  return apiFetch(`/api/messages/${loadId}`);
}

/**
 * Send a message in a load's chat.
 * @param {number} loadId
 * @param {object} msg - { body, msg_type?, offer_amount? }
 *   msg_type: 'text' | 'offer' | 'counter_offer' | 'accept' | 'reject'
 */
export async function sendMessage(loadId, msg) {
  return apiFetch(`/api/messages/${loadId}`, {
    method: 'POST',
    body: JSON.stringify(msg),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Reviews
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submit a review for a driver (after delivery).
 * @param {object} review - { load_id, driver_id, rating (1-5), comment? }
 */
export async function submitReview(review) {
  return apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

/**
 * Get all reviews for a driver.
 * @param {number} driverId
 */
export async function getDriverReviews(driverId) {
  return apiFetch(`/api/reviews/${driverId}`);
}
