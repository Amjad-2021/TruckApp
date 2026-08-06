import { Linking, Platform } from 'react-native';
import { PLATFORM_FEE_PERCENT, CITIES } from './constants';

// ─── Fee calculator ────────────────────────────────────────────────────────────
export function calculateFee(agreedPrice) {
  const price = parseFloat(agreedPrice) || 0;
  const fee = (price * PLATFORM_FEE_PERCENT) / 100;
  const driverReceives = price - fee;
  return {
    agreedPrice: price,
    platformFee: parseFloat(fee.toFixed(2)),
    driverReceives: parseFloat(driverReceives.toFixed(2)),
    feePercent: PLATFORM_FEE_PERCENT,
  };
}

// ─── Privacy: fuzz GPS to city-center level ────────────────────────────────────
// Adds ±0.05° (~5 km) random offset so exact truck position stays private
export function fuzzyLocation(lat, lng) {
  const offset = () => (Math.random() - 0.5) * 0.1;
  return {
    latitude:  lat + offset(),
    longitude: lng + offset(),
  };
}

// ─── Format SAR currency ───────────────────────────────────────────────────────
export function formatSAR(amount) {
  return `SAR ${Number(amount).toLocaleString('en-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Relative time ─────────────────────────────────────────────────────────────
export function timeAgo(dateOrTimestamp) {
  const date = dateOrTimestamp?.toDate ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60)    return 'just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Open Google Maps with driving directions between two cities ───────────────
//
//  fromCityId / toCityId  — city .id strings from CITIES constant
//                           e.g. 'riyadh', 'jeddah'
//
//  Opens the native Google Maps app when installed, falls back to the
//  Google Maps website so it works on every device including Expo Web.
//
export function openRouteOnMaps(fromCityId, toCityId) {
  const from = CITIES.find(c => c.id === fromCityId);
  const to   = CITIES.find(c => c.id === toCityId);

  if (!from || !to) {
    // Fall back to a city-name search if IDs aren't in our list
    const nameQuery = encodeURIComponent(`${fromCityId} to ${toCityId} Saudi Arabia`);
    Linking.openURL(`https://www.google.com/maps/search/${nameQuery}`).catch(() => {});
    return;
  }

  const origin = `${from.lat},${from.lng}`;
  const dest   = `${to.lat},${to.lng}`;

  const webUrl = `https://www.google.com/maps/dir/?api=1`
               + `&origin=${origin}&destination=${dest}&travelmode=driving`;

  // ── Expo Web / Safari ────────────────────────────────────────────────────
  // canOpenURL() is async, which breaks Safari's user-gesture chain and causes
  // "address is invalid" / popup-blocked errors.  Call window.open() directly
  // and synchronously instead — this keeps us inside the tap gesture.
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  // ── iOS / Android — try native Google Maps app first ────────────────────
  const iosUrl     = `comgooglemaps://?saddr=${origin}&daddr=${dest}&directionsmode=driving`;
  const androidUrl = `google.navigation:q=${dest}&mode=d`;
  const nativeUrl  = Platform.OS === 'ios' ? iosUrl : androidUrl;

  Linking.canOpenURL(nativeUrl)
    .then(supported => Linking.openURL(supported ? nativeUrl : webUrl))
    .catch(() => Linking.openURL(webUrl));
}
