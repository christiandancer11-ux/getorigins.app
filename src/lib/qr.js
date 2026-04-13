const getOrigin = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  return 'https://yourdomain.com';
};

export const getCardUrl = (cardId) => `${getOrigin()}/cards/${cardId}`;

export const generateQRCode = (cardId) => cardId;

export const generateQRCodeImageUrl = (cardId, size = 600, format = 'png') => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(getCardUrl(cardId))}&bgcolor=0d1117&color=e5a825&format=${format}`;
};