// Grading company registry — QR patterns, cert formats, colors, registry URLs
export const GRADING_COMPANIES = {
  PSA: {
    name: 'PSA',
    fullName: 'Professional Sports Authenticator',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    // PSA QR codes: psacard.com/cert/XXXXXXXX
    qrPatterns: [/psacard\.com\/cert\/([A-Za-z0-9]+)/i],
    // PSA certs: 8-digit numeric
    certPattern: /^\d{8}$/,
    registryUrl: (cert) => `https://www.psacard.com/cert/${cert}`,
    hasQR: true,
  },
  BGS: {
    name: 'BGS',
    fullName: 'Beckett Grading Services',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    // BGS QR codes: beckett.com/grading or gradingservice.beckett.com
    qrPatterns: [
      /beckett\.com\/grading[^\s]*\/([A-Za-z0-9]+)/i,
      /gradingservice\.beckett\.com[^\s]*cert[^\s]*\/([A-Za-z0-9]+)/i,
    ],
    // BGS certs: typically 7-10 digit numeric
    certPattern: /^\d{7,10}$/,
    registryUrl: (cert) => `https://www.beckett.com/grading`,
    hasQR: true,
  },
  SGC: {
    name: 'SGC',
    fullName: 'Sportscard Guaranty',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    // SGC QR codes: sgccard.com
    qrPatterns: [/sgccard\.com[^\s]*\/([A-Za-z0-9]+)/i],
    // SGC certs: 7-8 digit numeric
    certPattern: /^\d{7,8}$/,
    registryUrl: (cert) => `https://www.sgccard.com`,
    hasQR: true,
  },
  CGC: {
    name: 'CGC',
    fullName: 'Certified Guaranty Company',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    // CGC QR codes: cgccomics.com or cgccards.com
    qrPatterns: [
      /cgccomics\.com[^\s]*\/([A-Za-z0-9-]+)/i,
      /cgccards\.com[^\s]*\/([A-Za-z0-9-]+)/i,
    ],
    // CGC certs: 10-digit numeric or alphanumeric
    certPattern: /^[A-Za-z0-9]{8,14}$/,
    registryUrl: (cert) => `https://www.cgccards.com/certlookup/${cert}`,
    hasQR: true,
  },
  HGA: {
    name: 'HGA',
    fullName: 'Hybrid Grading Approach',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    qrPatterns: [/hgagrading\.com[^\s]*\/([A-Za-z0-9]+)/i],
    certPattern: /^HGA-?[A-Za-z0-9]{5,10}$/i,
    registryUrl: (cert) => `https://www.hgagrading.com`,
    hasQR: false,
  },
  CSG: {
    name: 'CSG',
    fullName: 'Certified Sports Guaranty',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    qrPatterns: [/csgcards\.com[^\s]*\/([A-Za-z0-9]+)/i],
    certPattern: /^\d{8,12}$/,
    registryUrl: (cert) => `https://www.csgcards.com`,
    hasQR: false,
  },
  ACE: {
    name: 'ACE',
    fullName: 'ACE Grading',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    qrPatterns: [],
    certPattern: /^[A-Za-z0-9]{6,12}$/,
    registryUrl: () => `https://www.acegrading.com`,
    hasQR: false,
  },
};

// Try to detect grading company + cert from a scanned QR code string
export function detectGradingQR(raw) {
  const decoded = decodeURIComponent(raw);
  for (const [company, cfg] of Object.entries(GRADING_COMPANIES)) {
    for (const pattern of cfg.qrPatterns) {
      const match = decoded.match(pattern);
      if (match) return { company, cert: match[1] };
    }
  }
  return null;
}

// Get company config by key (case-insensitive)
export function getCompany(key) {
  if (!key) return null;
  const upper = key.toUpperCase();
  return GRADING_COMPANIES[upper] || null;
}

export const ALL_COMPANIES = Object.keys(GRADING_COMPANIES);