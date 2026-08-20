export type AdFormat = 'image' | 'video' | 'carousel';
export type AdStatus = 'active' | 'inactive';

export interface WorkflowAd {
  id: string;
  brand: string;
  format: AdFormat;
  status: AdStatus;
  startedAt: string;
  thumbnail: string;
  primaryText: string;
  landingPageUrl?: string;
  signals?: {
    creativeFatigue: string;
    scaling: string;
  };
}

const svgLayerstory = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="gLS" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111111" />
      <stop offset="100%" stop-color="#2a2a2a" />
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#gLS)" />
  <text x="200" y="240" font-family="system-ui, sans-serif" font-size="36" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-1">LAYERSTORY</text>
  <text x="200" y="280" font-family="system-ui, sans-serif" font-size="18" font-weight="400" fill="#aaaaaa" text-anchor="middle">Interactive Video Platform</text>
</svg>`);

const svgPuma = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="gPuma" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d30f30" />
      <stop offset="100%" stop-color="#8a071d" />
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#gPuma)" />
  <text x="200" y="240" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-1">PUMA</text>
  <text x="200" y="280" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#fbb6c0" text-anchor="middle" text-transform="uppercase">Forever Faster</text>
</svg>`);

const svgSamsung = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="gSam" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#034ea2" />
      <stop offset="100%" stop-color="#0870df" />
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#gSam)" />
  <text x="200" y="250" font-family="system-ui, sans-serif" font-size="42" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-1">SAMSUNG</text>
  <text x="200" y="290" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#99c6f5" text-anchor="middle" letter-spacing="2">GALAXY AI</text>
</svg>`);

const svgPuma2 = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#181818" />
  <circle cx="200" cy="200" r="80" fill="#333333" />
  <text x="200" y="340" font-family="system-ui, sans-serif" font-size="32" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-1">Puma RS-X</text>
</svg>`);

export const workflowAds: WorkflowAd[] = [
  {
    id: 'ad_layerstory_1',
    brand: 'Layerstory',
    format: 'video',
    status: 'active',
    startedAt: '2026-08-10',
    thumbnail: `data:image/svg+xml;utf8,${svgLayerstory}`,
    primaryText: 'Turn your static videos into interactive experiences that drive 3x more conversions.',
    landingPageUrl: 'layerstory.com/demo',
    signals: {
      creativeFatigue: 'Low',
      scaling: 'High'
    }
  },
  {
    id: 'ad_puma_1',
    brand: 'Puma',
    format: 'image',
    status: 'active',
    startedAt: '2026-08-12',
    thumbnail: `data:image/svg+xml;utf8,${svgPuma}`,
    primaryText: 'Unleash your speed with the all-new Puma Velocity Nitro. Engineered for athletes.',
    landingPageUrl: 'puma.com/running',
    signals: {
      creativeFatigue: 'Medium',
      scaling: 'Steady'
    }
  },
  {
    id: 'ad_samsung_1',
    brand: 'Samsung',
    format: 'video',
    status: 'active',
    startedAt: '2026-08-14',
    thumbnail: `data:image/svg+xml;utf8,${svgSamsung}`,
    primaryText: 'Galaxy AI is here. Epic cameras, intelligent editing, and performance that lasts all day.',
    landingPageUrl: 'samsung.com/galaxy-s24',
    signals: {
      creativeFatigue: 'Low',
      scaling: 'High'
    }
  },
  {
    id: 'ad_puma_2',
    brand: 'Puma',
    format: 'carousel',
    status: 'inactive',
    startedAt: '2026-07-01',
    thumbnail: `data:image/svg+xml;utf8,${svgPuma2}`,
    primaryText: 'Retro design meets future tech. Shop the RS-X collection today.',
    landingPageUrl: 'puma.com/rs-x',
    signals: {
      creativeFatigue: 'High',
      scaling: 'Declining'
    }
  }
];
