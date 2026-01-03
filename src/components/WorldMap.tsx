import React, { memo, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { COUNTRY_CODE_TO_NAME } from '@/types/places';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO numeric to alpha-2 mapping (most common countries)
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '4': 'AF', '8': 'AL', '12': 'DZ', '20': 'AD', '24': 'AO', '28': 'AG', '32': 'AR',
  '36': 'AU', '40': 'AT', '44': 'BS', '48': 'BH', '50': 'BD', '51': 'AM', '52': 'BB',
  '56': 'BE', '64': 'BT', '68': 'BO', '70': 'BA', '72': 'BW', '76': 'BR', '84': 'BZ',
  '90': 'SB', '96': 'BN', '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH',
  '120': 'CM', '124': 'CA', '132': 'CV', '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL',
  '156': 'CN', '158': 'TW', '170': 'CO', '174': 'KM', '178': 'CG', '180': 'CD', '188': 'CR',
  '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM',
  '214': 'DO', '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER', '233': 'EE',
  '242': 'FJ', '246': 'FI', '250': 'FR', '262': 'DJ', '266': 'GA', '268': 'GE', '270': 'GM',
  '275': 'PS', '276': 'DE', '288': 'GH', '300': 'GR', '308': 'GD', '320': 'GT', '324': 'GN',
  '328': 'GY', '332': 'HT', '340': 'HN', '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN',
  '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI',
  '388': 'JM', '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR',
  '414': 'KW', '417': 'KG', '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR',
  '434': 'LY', '438': 'LI', '440': 'LT', '442': 'LU', '450': 'MG', '454': 'MW', '458': 'MY',
  '462': 'MV', '466': 'ML', '470': 'MT', '478': 'MR', '480': 'MU', '484': 'MX', '492': 'MC',
  '496': 'MN', '498': 'MD', '499': 'ME', '504': 'MA', '508': 'MZ', '512': 'OM', '516': 'NA',
  '524': 'NP', '528': 'NL', '540': 'NC', '548': 'VU', '554': 'NZ', '558': 'NI', '562': 'NE',
  '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE',
  '608': 'PH', '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL', '630': 'PR', '634': 'QA',
  '642': 'RO', '643': 'RU', '646': 'RW', '659': 'KN', '662': 'LC', '670': 'VC', '674': 'SM',
  '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC', '694': 'SL', '702': 'SG',
  '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA', '716': 'ZW', '724': 'ES',
  '728': 'SS', '729': 'SD', '732': 'EH', '740': 'SR', '748': 'SZ', '752': 'SE', '756': 'CH',
  '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG', '776': 'TO', '780': 'TT', '784': 'AE',
  '788': 'TN', '792': 'TR', '795': 'TM', '800': 'UG', '804': 'UA', '807': 'MK', '818': 'EG',
  '826': 'GB', '831': 'GG', '832': 'JE', '833': 'IM', '834': 'TZ', '840': 'US', '854': 'BF',
  '858': 'UY', '860': 'UZ', '862': 'VE', '876': 'WF', '882': 'WS', '887': 'YE', '894': 'ZM',
  '-99': 'XK', // Kosovo
};

interface WorldMapProps {
  visitedCountries: string[];
  onCountryClick?: (countryCode: string, countryName: string) => void;
  interactive?: boolean;
}

const WorldMap = memo(function WorldMap({
  visitedCountries,
  onCountryClick,
  interactive = true,
}: WorldMapProps) {
  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);

  const getCountryCode = (geo: any): string => {
    const numericId = geo.id || geo.properties?.['ISO_A3_EH'] || '';
    return NUMERIC_TO_ALPHA2[numericId] || '';
  };

  const getCountryName = (geo: any): string => {
    const code = getCountryCode(geo);
    return COUNTRY_CODE_TO_NAME[code] || geo.properties?.name || 'Unknown';
  };

  return (
    <div className="w-full aspect-[2/1] bg-secondary/30 rounded-xl overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 130,
          center: [0, 30],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = getCountryCode(geo);
                const countryName = getCountryName(geo);
                const isVisited = visitedSet.has(countryCode);

                const geography = (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (interactive && onCountryClick && countryCode) {
                        onCountryClick(countryCode, countryName);
                      }
                    }}
                    style={{
                      default: {
                        fill: isVisited ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: interactive ? 'pointer' : 'default',
                        transition: 'fill 0.2s ease',
                      },
                      hover: {
                        fill: isVisited 
                          ? 'hsl(var(--primary) / 0.8)' 
                          : 'hsl(var(--muted-foreground) / 0.3)',
                        stroke: 'hsl(var(--foreground))',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: interactive ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: 'hsl(var(--primary) / 0.6)',
                        outline: 'none',
                      },
                    }}
                  />
                );

                if (interactive) {
                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        {geography}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{countryName}</p>
                        <p className="text-xs text-muted-foreground">
                          {isVisited ? '✓ Visited' : 'Click to mark as visited'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return geography;
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});

export default WorldMap;
