/*
  Common properties for events tracked
*/

export function getCommonTrackingProperties() {
  return {
    browser: navigator.userAgent,
    os: navigator.platform,
    referrer: document.referrer,
    origin: location.origin,
  };
}
