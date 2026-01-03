export interface VisitedPlace {
  id: string;
  countryCode: string; // ISO 3166-1 alpha-2 (e.g., "US", "FR")
  countryName: string;
  region?: string; // State, Province, Region name
  regionCode?: string; // Subdivision code (e.g., "US-CA", "IT-RM")
  visitCount: number;
  firstVisit: string; // ISO date
  lastVisit: string; // ISO date
  memoryIds: string[]; // IDs of memories associated with this place
  manuallyAdded: boolean; // Whether added manually vs. auto-detected from memories
  createdAt: number;
  updatedAt: number;
}

export interface PlaceStats {
  totalCountries: number;
  totalRegions: number;
  totalMemoriesWithLocation: number;
  continentBreakdown: Record<string, number>;
  percentageOfWorld: number; // Based on ~195 countries
}

// Continent mappings for common countries
export const CONTINENT_MAP: Record<string, string> = {
  // North America
  US: 'North America', CA: 'North America', MX: 'North America',
  // Europe
  GB: 'Europe', FR: 'Europe', DE: 'Europe', IT: 'Europe', ES: 'Europe',
  PT: 'Europe', NL: 'Europe', BE: 'Europe', CH: 'Europe', AT: 'Europe',
  PL: 'Europe', CZ: 'Europe', GR: 'Europe', SE: 'Europe', NO: 'Europe',
  DK: 'Europe', FI: 'Europe', IE: 'Europe', HU: 'Europe', RO: 'Europe',
  // Asia
  JP: 'Asia', CN: 'Asia', KR: 'Asia', IN: 'Asia', TH: 'Asia',
  VN: 'Asia', SG: 'Asia', MY: 'Asia', ID: 'Asia', PH: 'Asia',
  TW: 'Asia', HK: 'Asia', AE: 'Asia', IL: 'Asia', TR: 'Asia',
  // South America
  BR: 'South America', AR: 'South America', CL: 'South America',
  CO: 'South America', PE: 'South America', EC: 'South America',
  // Africa
  ZA: 'Africa', EG: 'Africa', MA: 'Africa', KE: 'Africa', TZ: 'Africa',
  NG: 'Africa', GH: 'Africa', ET: 'Africa',
  // Oceania
  AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania',
};

// Country name to code mapping (common countries)
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'US', 'usa': 'US', 'america': 'US',
  'united kingdom': 'GB', 'uk': 'GB', 'england': 'GB', 'britain': 'GB',
  'france': 'FR', 'germany': 'DE', 'italy': 'IT', 'spain': 'ES',
  'portugal': 'PT', 'netherlands': 'NL', 'belgium': 'BE',
  'switzerland': 'CH', 'austria': 'AT', 'poland': 'PL',
  'czech republic': 'CZ', 'czechia': 'CZ', 'greece': 'GR',
  'sweden': 'SE', 'norway': 'NO', 'denmark': 'DK', 'finland': 'FI',
  'ireland': 'IE', 'hungary': 'HU', 'romania': 'RO',
  'japan': 'JP', 'china': 'CN', 'south korea': 'KR', 'korea': 'KR',
  'india': 'IN', 'thailand': 'TH', 'vietnam': 'VN', 'singapore': 'SG',
  'malaysia': 'MY', 'indonesia': 'ID', 'philippines': 'PH',
  'taiwan': 'TW', 'hong kong': 'HK', 'uae': 'AE', 'dubai': 'AE',
  'israel': 'IL', 'turkey': 'TR', 'türkiye': 'TR',
  'brazil': 'BR', 'argentina': 'AR', 'chile': 'CL',
  'colombia': 'CO', 'peru': 'PE', 'ecuador': 'EC',
  'south africa': 'ZA', 'egypt': 'EG', 'morocco': 'MA',
  'kenya': 'KE', 'tanzania': 'TZ', 'nigeria': 'NG', 'ghana': 'GH',
  'australia': 'AU', 'new zealand': 'NZ', 'fiji': 'FJ',
  'canada': 'CA', 'mexico': 'MX',
  'russia': 'RU', 'iceland': 'IS', 'croatia': 'HR', 'slovenia': 'SI',
  'slovakia': 'SK', 'bulgaria': 'BG', 'serbia': 'RS', 'montenegro': 'ME',
  'albania': 'AL', 'north macedonia': 'MK', 'bosnia': 'BA',
  'luxembourg': 'LU', 'malta': 'MT', 'cyprus': 'CY', 'estonia': 'EE',
  'latvia': 'LV', 'lithuania': 'LT', 'ukraine': 'UA', 'belarus': 'BY',
  'georgia': 'GE', 'armenia': 'AM', 'azerbaijan': 'AZ',
  'saudi arabia': 'SA', 'qatar': 'QA', 'kuwait': 'KW', 'bahrain': 'BH',
  'oman': 'OM', 'jordan': 'JO', 'lebanon': 'LB', 'iraq': 'IQ', 'iran': 'IR',
  'pakistan': 'PK', 'bangladesh': 'BD', 'sri lanka': 'LK', 'nepal': 'NP',
  'cambodia': 'KH', 'laos': 'LA', 'myanmar': 'MM', 'mongolia': 'MN',
};

// Code to full country name mapping
export const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  US: 'United States', CA: 'Canada', MX: 'Mexico',
  GB: 'United Kingdom', FR: 'France', DE: 'Germany', IT: 'Italy', ES: 'Spain',
  PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland',
  AT: 'Austria', PL: 'Poland', CZ: 'Czech Republic', GR: 'Greece',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  IE: 'Ireland', HU: 'Hungary', RO: 'Romania', RU: 'Russia',
  IS: 'Iceland', HR: 'Croatia', SI: 'Slovenia', SK: 'Slovakia',
  BG: 'Bulgaria', RS: 'Serbia', ME: 'Montenegro', AL: 'Albania',
  MK: 'North Macedonia', BA: 'Bosnia and Herzegovina', LU: 'Luxembourg',
  MT: 'Malta', CY: 'Cyprus', EE: 'Estonia', LV: 'Latvia', LT: 'Lithuania',
  UA: 'Ukraine', BY: 'Belarus', GE: 'Georgia', AM: 'Armenia', AZ: 'Azerbaijan',
  JP: 'Japan', CN: 'China', KR: 'South Korea', IN: 'India', TH: 'Thailand',
  VN: 'Vietnam', SG: 'Singapore', MY: 'Malaysia', ID: 'Indonesia',
  PH: 'Philippines', TW: 'Taiwan', HK: 'Hong Kong', AE: 'United Arab Emirates',
  IL: 'Israel', TR: 'Turkey', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait',
  BH: 'Bahrain', OM: 'Oman', JO: 'Jordan', LB: 'Lebanon', IQ: 'Iraq', IR: 'Iran',
  PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka', NP: 'Nepal',
  KH: 'Cambodia', LA: 'Laos', MM: 'Myanmar', MN: 'Mongolia',
  BR: 'Brazil', AR: 'Argentina', CL: 'Chile', CO: 'Colombia',
  PE: 'Peru', EC: 'Ecuador', VE: 'Venezuela', UY: 'Uruguay', PY: 'Paraguay',
  BO: 'Bolivia', GY: 'Guyana', SR: 'Suriname',
  ZA: 'South Africa', EG: 'Egypt', MA: 'Morocco', KE: 'Kenya', TZ: 'Tanzania',
  NG: 'Nigeria', GH: 'Ghana', ET: 'Ethiopia', UG: 'Uganda', RW: 'Rwanda',
  TN: 'Tunisia', DZ: 'Algeria', LY: 'Libya', SD: 'Sudan', AO: 'Angola',
  MZ: 'Mozambique', ZW: 'Zimbabwe', BW: 'Botswana', NA: 'Namibia', ZM: 'Zambia',
  AU: 'Australia', NZ: 'New Zealand', FJ: 'Fiji', PG: 'Papua New Guinea',
  NC: 'New Caledonia', VU: 'Vanuatu', WS: 'Samoa', TO: 'Tonga',
  CU: 'Cuba', JM: 'Jamaica', HT: 'Haiti', DO: 'Dominican Republic',
  PR: 'Puerto Rico', TT: 'Trinidad and Tobago', BS: 'Bahamas', BB: 'Barbados',
  CR: 'Costa Rica', PA: 'Panama', GT: 'Guatemala', HN: 'Honduras',
  SV: 'El Salvador', NI: 'Nicaragua', BZ: 'Belize',
};
