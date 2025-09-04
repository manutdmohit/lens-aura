// Utility to force refresh promotional pricing across the app
let refreshCallbacks: (() => void)[] = [];

export function registerRefreshCallback(callback: () => void) {
  refreshCallbacks.push(callback);
  return () => {
    const index = refreshCallbacks.indexOf(callback);
    if (index > -1) {
      refreshCallbacks.splice(index, 1);
    }
  };
}

export function refreshAllPromotionalPricing() {
  console.log('🔍 Refreshing all promotional pricing...');
  refreshCallbacks.forEach((callback) => callback());
}

// Call this function when you want to refresh all promotional pricing
// For example, after deactivating a promotion in the admin panel
export function forceRefreshPromotionalPricing() {
  refreshAllPromotionalPricing();
}
