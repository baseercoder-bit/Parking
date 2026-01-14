export const openNavigation = (address: string, latitude?: number, longitude?: number) => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /android/i.test(userAgent);

  let url: string;

  if (latitude !== undefined && longitude !== undefined) {
    // Use coordinates if available for more accurate navigation
    if (isIOS) {
      // Apple Maps with coordinates
      url = `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
    } else if (isAndroid) {
      // Google Maps with coordinates
      url = `google.navigation:q=${latitude},${longitude}`;
    } else {
      // Desktop/fallback - Google Maps in browser
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }
  } else {
    // Use address
    const encodedAddress = encodeURIComponent(address);
    
    if (isIOS) {
      // Apple Maps with address
      url = `maps://maps.apple.com/?daddr=${encodedAddress}&dirflg=d`;
      // Fallback to web if app not available
      const fallbackUrl = `http://maps.apple.com/?daddr=${encodedAddress}&dirflg=d`;
      window.location.href = url;
      // Try fallback after a short delay if the app doesn't open
      setTimeout(() => {
        window.open(fallbackUrl, '_blank');
      }, 500);
      return;
    } else if (isAndroid) {
      // Google Maps with address
      url = `google.navigation:q=${encodedAddress}`;
      // Fallback to web
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.location.href = url;
      setTimeout(() => {
        window.open(fallbackUrl, '_blank');
      }, 500);
      return;
    } else {
      // Desktop/fallback - Google Maps in browser
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }
  }

  // Open the URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
};

