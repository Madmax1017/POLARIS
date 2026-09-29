/**
 * NORTHSTAR Map Tile Provider Configuration
 *
 * All providers here are 100% free with NO API key required.
 * Swap the active provider by editing `getTileProvider()` return values.
 *
 * Light mode:  OSM Standard  — canonical OpenStreetMap tiles
 * Dark  mode:  OSM Standard  — same tiles, CSS dark-filter applied by MapPage
 *
 * Additional presets (drop-in replacements, also no API key):
 *   OSM_HUMANITARIAN  – HOT humanitarian tiles (lighter labels, good for polar)
 *   OSM_CYCLE         – OpenCycleMap (terrain contour detail)
 */

export interface TileProviderConfig {
    /** Unique identifier for this provider */
    id: string;
    /** Leaflet tile URL template */
    url: string;
    /** Attribution HTML — must mention © OpenStreetMap contributors */
    attribution: string;
    /** Max native zoom level */
    maxZoom: number;
    /** Tile pixel size */
    tileSize: number;
    /** Subdomain characters for load-balancing */
    subdomains?: string;
    /** Whether to use Hi-DPI tiles on retina displays */
    detectRetina?: boolean;
    /**
     * Optional CSS filter to apply to the tile layer <img> elements.
     * Used to create a dark/inverted look without needing a separate dark tile set.
     * e.g. 'invert(100%) hue-rotate(180deg) brightness(0.85) saturate(0.7)'
     */
    cssFilter?: string;
}

// Shared OSM attribution — required by tile usage policy
const OSM_ATTR =
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

// ─── OSM Standard (light) ─────────────────────────────────────────────────────
export const OSM_STANDARD: TileProviderConfig = {
    id: 'osm-standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM_ATTR,
    maxZoom: 19,
    tileSize: 256,
    subdomains: 'abc',
    detectRetina: true,
};

// ─── OSM Standard — dark mode variant (CSS filter invert, hue-shift) ──────────
// Uses the same free OSM tiles but applies a CSS filter for a dark oceanic look.
// No extra tile server, no API key — all rendering is done in the browser.
export const OSM_DARK: TileProviderConfig = {
    id: 'osm-dark',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM_ATTR,
    maxZoom: 19,
    tileSize: 256,
    subdomains: 'abc',
    detectRetina: true,
    cssFilter: 'invert(100%) hue-rotate(200deg) brightness(0.80) saturate(0.65) contrast(0.9)',
};

// ─── HOT Humanitarian (light — cleaner labels, polar-region friendly) ─────────
export const OSM_HUMANITARIAN: TileProviderConfig = {
    id: 'osm-humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: `${OSM_ATTR}, Tiles courtesy <a href="https://hot.openstreetmap.org/" target="_blank" rel="noopener noreferrer">HOT</a>`,
    maxZoom: 19,
    tileSize: 256,
    subdomains: 'abc',
    detectRetina: true,
};

// ─── OpenCycleMap (light — great contour detail for terrain research) ──────────
export const OSM_CYCLE: TileProviderConfig = {
    id: 'osm-cycle',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: `${OSM_ATTR}, <a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM" target="_blank" rel="noopener noreferrer">CyclOSM</a>`,
    maxZoom: 20,
    tileSize: 256,
    subdomains: 'abc',
    detectRetina: true,
};

/**
 * Returns the active tile provider for the given theme.
 * Both are pure OSM data — no API key, completely free.
 *
 * To swap the tile style app-wide:
 *   - Modify the return values below, OR
 *   - Pass a different preset directly into `<TileLayer>` in MapPage.tsx
 */
export function getTileProvider(isDark: boolean): TileProviderConfig {
    return isDark ? OSM_DARK : OSM_STANDARD;
}
