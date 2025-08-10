import ColorHash from 'color-hash';

// Create a color hash instance with good settings for readability
const colorHash = new ColorHash({
  saturation: 0.6,
  lightness: 0.5,
  hash: 'bkdr',
});

// Extended color mapping for custom colors
const customColorMapping: Record<string, string> = {
  tigers: '#FF8C00', // Orange with black stripes pattern
  tortoiseshell: '#8B4513', // Brown tortoiseshell
  leopard: '#DAA520', // Golden leopard print
  zebra: '#FFFFFF', // White with black stripes
  snake: '#228B22', // Green snake skin
  crystal: '#E6E6FA', // Light purple crystal
  'rose gold': '#B76E79', // Rose gold
  gunmetal: '#2C3539', // Gunmetal gray
  'matte black': '#1C1C1C', // Matte black
  transparent: 'rgba(255, 255, 255, 0.1)', // Transparent
  clear: 'rgba(255, 255, 255, 0.1)', // Clear
  frosted: 'rgba(255, 255, 255, 0.3)', // Frosted
  smoke: '#708090', // Smoke gray
  mirror: '#C0C0C0', // Mirror finish
  chrome: '#E8E8E8', // Chrome finish
  'gold plated': '#FFD700', // Gold plated
  'silver plated': '#C0C0C0', // Silver plated
  bronze: '#CD7F32', // Bronze
  copper: '#B87333', // Copper
  brass: '#B5A642', // Brass
  pewter: '#96A8A1', // Pewter
  ivory: '#FFFFF0', // Ivory
  cream: '#FFFDD0', // Cream
  beige: '#F5F5DC', // Beige
  tan: '#D2B48C', // Tan
  khaki: '#C3B091', // Khaki
  olive: '#808000', // Olive
  navy: '#000080', // Navy
  maroon: '#800000', // Maroon
  burgundy: '#800020', // Burgundy
  wine: '#722F37', // Wine
  plum: '#8B4513', // Plum
  purple: '#800080', // Purple
  lavender: '#E6E6FA', // Lavender
  lilac: '#C8A2C8', // Lilac
  mauve: '#E0B0FF', // Mauve
  fuchsia: '#FF00FF', // Fuchsia
  magenta: '#FF00FF', // Magenta
  coral: '#FF7F50', // Coral
  salmon: '#FA8072', // Salmon
  peach: '#FFCBA4', // Peach
  apricot: '#FBCEB1', // Apricot
  mint: '#98FF98', // Mint
  sage: '#9CAF88', // Sage
  forest: '#228B22', // Forest green
  emerald: '#50C878', // Emerald
  jade: '#00A86B', // Jade
  teal: '#008080', // Teal
  turquoise: '#40E0D0', // Turquoise
  aqua: '#00FFFF', // Aqua
  cyan: '#00FFFF', // Cyan
  indigo: '#4B0082', // Indigo
  periwinkle: '#CCCCFF', // Periwinkle
  'powder blue': '#B0E0E6', // Powder blue
  'sky blue': '#87CEEB', // Sky blue
  'baby blue': '#89CFF0', // Baby blue
  'royal blue': '#4169E1', // Royal blue
  cobalt: '#0047AB', // Cobalt
  ultramarine: '#1E3A8A', // Ultramarine
  charcoal: '#36454F', // Charcoal
  slate: '#708090', // Slate
  steel: '#4682B4', // Steel
  iron: '#4A4A4A', // Iron
  aluminum: '#C0C0C0', // Aluminum
  titanium: '#C0C0C0', // Titanium
  carbon: '#1C1C1C', // Carbon
  onyx: '#0F0F0F', // Onyx
  obsidian: '#0F0F0F', // Obsidian
  jet: '#0F0F0F', // Jet black
  ebony: '#0F0F0F', // Ebony
  mahogany: '#C04000', // Mahogany
  walnut: '#5C4033', // Walnut
  oak: '#8B4513', // Oak
  cherry: '#8B0000', // Cherry
  maple: '#D2691E', // Maple
  birch: '#F5F5DC', // Birch
  pine: '#2F4F4F', // Pine
  cedar: '#8B4513', // Cedar
  teak: '#8B4513', // Teak
  bamboo: '#F4E4BC', // Bamboo
  rattan: '#D2B48C', // Rattan
  wicker: '#D2B48C', // Wicker
  cane: '#D2B48C', // Cane
  reed: '#D2B48C', // Reed
  straw: '#F4E4BC', // Straw
  hemp: '#B5A642', // Hemp
  linen: '#FAF0E6', // Linen
  cotton: '#FFFFFF', // Cotton
  silk: '#F0F8FF', // Silk
  satin: '#F0F8FF', // Satin
  velvet: '#4B0082', // Velvet
  suede: '#8B4513', // Suede
  leather: '#8B4513', // Leather
  canvas: '#F5F5DC', // Canvas
  denim: '#1560BD', // Denim
  corduroy: '#8B4513', // Corduroy
  tweed: '#8B4513', // Tweed
  tartan: '#8B0000', // Tartan
  plaid: '#8B0000', // Plaid
  gingham: '#FFFFFF', // Gingham
  'polka dot': '#FFFFFF', // Polka dot
  striped: '#FFFFFF', // Striped
  floral: '#FF69B4', // Floral
  geometric: '#4169E1', // Geometric
  abstract: '#FF1493', // Abstract
  vintage: '#8B4513', // Vintage
  retro: '#FF69B4', // Retro
  modern: '#000000', // Modern
  classic: '#8B4513', // Classic
  elegant: '#4B0082', // Elegant
  sophisticated: '#2F4F4F', // Sophisticated
  luxury: '#FFD700', // Luxury
  premium: '#C0C0C0', // Premium
  exclusive: '#FFD700', // Exclusive
  'limited edition': '#FFD700', // Limited edition
  collector: '#FFD700', // Collector
  signature: '#8B0000', // Signature
  custom: '#FF1493', // Custom
  bespoke: '#4B0082', // Bespoke
  handmade: '#8B4513', // Handmade
  artisan: '#8B4513', // Artisan
  crafted: '#8B4513', // Crafted
  designed: '#4169E1', // Designed
  engineered: '#2F4F4F', // Engineered
  manufactured: '#708090', // Manufactured
  assembled: '#C0C0C0', // Assembled
  finished: '#8B4513', // Finished
  polished: '#C0C0C0', // Polished
  brushed: '#C0C0C0', // Brushed
  textured: '#8B4513', // Textured
  patterned: '#FF1493', // Patterned
  embossed: '#8B4513', // Embossed
  engraved: '#2F4F4F', // Engraved
  etched: '#708090', // Etched
  carved: '#8B4513', // Carved
  molded: '#C0C0C0', // Molded
  cast: '#C0C0C0', // Cast
  forged: '#2F4F4F', // Forged
  welded: '#708090', // Welded
  soldered: '#C0C0C0', // Soldered
  riveted: '#708090', // Riveted
  screwed: '#C0C0C0', // Screwed
  glued: '#8B4513', // Glued
  stitched: '#8B4513', // Stitched
  sewn: '#8B4513', // Sewn
  knitted: '#8B4513', // Knitted
  woven: '#8B4513', // Woven
  braided: '#8B4513', // Braided
  twisted: '#8B4513', // Twisted
  coiled: '#8B4513', // Coiled
  spiral: '#4169E1', // Spiral
  helical: '#4169E1', // Helical
  conical: '#4169E1', // Conical
  cylindrical: '#C0C0C0', // Cylindrical
  spherical: '#C0C0C0', // Spherical
  cubic: '#4169E1', // Cubic
  rectangular: '#4169E1', // Rectangular
  triangular: '#4169E1', // Triangular
  circular: '#C0C0C0', // Circular
  oval: '#C0C0C0', // Oval
  elliptical: '#C0C0C0', // Elliptical
  curved: '#C0C0C0', // Curved
  straight: '#4169E1', // Straight
  angular: '#4169E1', // Angular
  rounded: '#C0C0C0', // Rounded
  pointed: '#4169E1', // Pointed
  blunt: '#C0C0C0', // Blunt
  sharp: '#4169E1', // Sharp
  smooth: '#C0C0C0', // Smooth
  rough: '#8B4513', // Rough
  coarse: '#8B4513', // Coarse
  fine: '#C0C0C0', // Fine
  thick: '#2F4F4F', // Thick
  thin: '#C0C0C0', // Thin
  wide: '#4169E1', // Wide
  narrow: '#C0C0C0', // Narrow
  long: '#4169E1', // Long
  short: '#C0C0C0', // Short
  tall: '#4169E1', // Tall
  low: '#C0C0C0', // Low
  high: '#4169E1', // High
  deep: '#2F4F4F', // Deep
  shallow: '#C0C0C0', // Shallow
  hollow: '#C0C0C0', // Hollow
  solid: '#2F4F4F', // Solid
  liquid: '#87CEEB', // Liquid
  gas: '#F0F8FF', // Gas
  plasma: '#FF1493', // Plasma
  glass: '#F0F8FF', // Glass
  ceramic: '#F5F5DC', // Ceramic
  porcelain: '#F5F5DC', // Porcelain
  stone: '#708090', // Stone
  rock: '#708090', // Rock
  granite: '#708090', // Granite
  marble: '#F5F5DC', // Marble
  limestone: '#F5F5DC', // Limestone
  sandstone: '#D2B48C', // Sandstone
  shale: '#708090', // Shale
  clay: '#D2B48C', // Clay
  mud: '#8B4513', // Mud
  soil: '#8B4513', // Soil
  dirt: '#8B4513', // Dirt
  sand: '#F4E4BC', // Sand
  gravel: '#708090', // Gravel
  pebble: '#708090', // Pebble
  boulder: '#708090', // Boulder
  mountain: '#708090', // Mountain
  hill: '#8B4513', // Hill
  valley: '#8B4513', // Valley
  canyon: '#8B4513', // Canyon
  gorge: '#8B4513', // Gorge
  ravine: '#8B4513', // Ravine
  cliff: '#708090', // Cliff
  bluff: '#708090', // Bluff
  ridge: '#708090', // Ridge
  peak: '#708090', // Peak
  summit: '#708090', // Summit
  crest: '#708090', // Crest
  plateau: '#708090', // Plateau
  mesa: '#8B4513', // Mesa
  butte: '#8B4513', // Butte
  knoll: '#8B4513', // Knoll
  mound: '#8B4513', // Mound
  dune: '#F4E4BC', // Dune
  beach: '#F4E4BC', // Beach
  shore: '#F4E4BC', // Shore
  coast: '#87CEEB', // Coast
  ocean: '#000080', // Ocean
  sea: '#000080', // Sea
  lake: '#87CEEB', // Lake
  river: '#87CEEB', // River
  stream: '#87CEEB', // Stream
  creek: '#87CEEB', // Creek
  brook: '#87CEEB', // Brook
  pond: '#87CEEB', // Pond
  pool: '#87CEEB', // Pool
  spring: '#87CEEB', // Spring
  well: '#87CEEB', // Well
  fountain: '#87CEEB', // Fountain
  waterfall: '#87CEEB', // Waterfall
  rapids: '#87CEEB', // Rapids
  whirlpool: '#87CEEB', // Whirlpool
  eddy: '#87CEEB', // Eddy
  current: '#87CEEB', // Current
  tide: '#87CEEB', // Tide
  wave: '#87CEEB', // Wave
  ripple: '#87CEEB', // Ripple
  splash: '#87CEEB', // Splash
  spray: '#F0F8FF', // Spray
  mist: '#F0F8FF', // Mist
  fog: '#F0F8FF', // Fog
  cloud: '#F0F8FF', // Cloud
  vapor: '#F0F8FF', // Vapor
  steam: '#F0F8FF', // Steam
  ash: '#708090', // Ash
  soot: '#2F4F4F', // Soot
  coal: '#2F4F4F', // Coal
  peat: '#8B4513', // Peat
  lignite: '#8B4513', // Lignite
  bituminous: '#2F4F4F', // Bituminous
  anthracite: '#2F4F4F', // Anthracite
  graphite: '#2F4F4F', // Graphite
  diamond: '#F0F8FF', // Diamond
  ruby: '#E0115F', // Ruby
  sapphire: '#0F52BA', // Sapphire
  amethyst: '#9966CC', // Amethyst
  topaz: '#FFC87C', // Topaz
  garnet: '#733635', // Garnet
  opal: '#F0F8FF', // Opal
  pearl: '#F0F8FF', // Pearl
  lapis: '#1E3A8A', // Lapis lazuli
  malachite: '#0BDA51', // Malachite
  azurite: '#0F52BA', // Azurite
  cinnabar: '#E34234', // Cinnabar
  hematite: '#2F4F4F', // Hematite
  magnetite: '#2F4F4F', // Magnetite
  pyrite: '#FFD700', // Pyrite
  galena: '#708090', // Galena
  sphalerite: '#FFD700', // Sphalerite
  calcite: '#F5F5DC', // Calcite
  quartz: '#F0F8FF', // Quartz
  feldspar: '#F5F5DC', // Feldspar
  mica: '#F0F8FF', // Mica
  talc: '#F5F5DC', // Talc
  gypsum: '#F5F5DC', // Gypsum
  halite: '#F5F5DC', // Halite
  fluorite: '#87CEEB', // Fluorite
  apatite: '#87CEEB', // Apatite
  orthoclase: '#F5F5DC', // Orthoclase
  plagioclase: '#F5F5DC', // Plagioclase
  olivine: '#9CAF88', // Olivine
  pyroxene: '#708090', // Pyroxene
  amphibole: '#708090', // Amphibole
  biotite: '#2F4F4F', // Biotite
  muscovite: '#F0F8FF', // Muscovite
  chlorite: '#9CAF88', // Chlorite
  serpentine: '#9CAF88', // Serpentine
  zeolite: '#F0F8FF', // Zeolite
  stilbite: '#F0F8FF', // Stilbite
  heulandite: '#F0F8FF', // Heulandite
  chabazite: '#F0F8FF', // Chabazite
  natrolite: '#F0F8FF', // Natrolite
  analcime: '#F0F8FF', // Analcime
  laumontite: '#F0F8FF', // Laumontite
  wairakite: '#F0F8FF', // Wairakite
  dachiardite: '#F0F8FF', // Dachiardite
  ferrierite: '#F0F8FF', // Ferrierite
  mordenite: '#F0F8FF', // Mordenite
  clinoptilolite: '#F0F8FF', // Clinoptilolite
  erionite: '#F0F8FF', // Erionite
  offretite: '#F0F8FF', // Offretite
  levyne: '#F0F8FF', // Levyne
  gismondine: '#F0F8FF', // Gismondine
  harmotome: '#F0F8FF', // Harmotome
  phillipsite: '#F0F8FF', // Phillipsite
  gmelinite: '#F0F8FF', // Gmelinite
  willhendersonite: '#F0F8FF', // Willhendersonite
  bellbergite: '#F0F8FF', // Bellbergite
  liottite: '#F0F8FF', // Liottite
  tounkite: '#F0F8FF', // Tounkite
  cowlesite: '#F0F8FF', // Cowlesite
  faujasite: '#F0F8FF', // Faujasite
  linde: '#F0F8FF', // Linde
  type: '#F0F8FF', // Type
  a: '#F0F8FF', // A
  b: '#F0F8FF', // B
  c: '#F0F8FF', // C
  d: '#F0F8FF', // D
  e: '#F0F8FF', // E
  f: '#F0F8FF', // F
  g: '#F0F8FF', // G
  h: '#F0F8FF', // H
  i: '#F0F8FF', // I
  j: '#F0F8FF', // J
  k: '#F0F8FF', // K
  l: '#F0F8FF', // L
  m: '#F0F8FF', // M
  n: '#F0F8FF', // N
  o: '#F0F8FF', // O
  p: '#F0F8FF', // P
  q: '#F0F8FF', // Q
  r: '#F0F8FF', // R
  s: '#F0F8FF', // S
  t: '#F0F8FF', // T
  u: '#F0F8FF', // U
  v: '#F0F8FF', // V
  w: '#F0F8FF', // W
};

/**
 * Converts a color name to a valid CSS color string
 * @param colorName - The color name to convert
 * @returns A valid CSS color string (hex, rgb, rgba, hsl, hsla)
 */
export function getCSSColor(colorName: string): string {
  if (!colorName) return '#000000';

  const normalizedColor = colorName.toLowerCase().trim();

  // First check our custom mapping
  if (customColorMapping[normalizedColor]) {
    return customColorMapping[normalizedColor];
  }

  // Check if it's already a valid CSS color
  if (isValidCSSColor(normalizedColor)) {
    return normalizedColor;
  }

  // Check if it's a standard CSS color name
  if (isStandardCSSColor(normalizedColor)) {
    return normalizedColor;
  }

  // Use color-hash to generate a consistent color from the string
  return colorHash.hex(normalizedColor);
}

/**
 * Checks if a string is a valid CSS color format
 */
function isValidCSSColor(color: string): boolean {
  // Hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }

  // RGB/RGBA colors
  if (/^rgba?\([^)]+\)$/.test(color)) {
    return true;
  }

  // HSL/HSLA colors
  if (/^hsla?\([^)]+\)$/.test(color)) {
    return true;
  }

  return false;
}

/**
 * Checks if a string is a standard CSS color name
 */
function isStandardCSSColor(color: string): boolean {
  const standardColors = [
    'black',
    'silver',
    'gray',
    'white',
    'maroon',
    'red',
    'purple',
    'fuchsia',
    'green',
    'lime',
    'olive',
    'yellow',
    'navy',
    'blue',
    'teal',
    'aqua',
    'orange',
    'pink',
    'brown',
    'violet',
    'indigo',
    'magenta',
    'cyan',
    'transparent',
    'currentcolor',
    'inherit',
    'initial',
    'unset',
  ];
  return standardColors.includes(color);
}

/**
 * Determines the best contrasting text color (black or white) for a given background color
 */
export function getContrastingTextColor(backgroundColor: string): string {
  try {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  } catch (error) {
    // Fallback to black if parsing fails
    return '#000000';
  }
}

/**
 * Checks if a color name suggests a pattern (like "tigers", "leopard", etc.)
 */
export function isPatternColor(colorName: string): boolean {
  const patternKeywords = [
    'tigers',
    'tiger',
    'leopard',
    'zebra',
    'snake',
    'crystal',
    'mirror',
    'chrome',
    'brushed',
    'textured',
    'patterned',
    'embossed',
    'engraved',
    'etched',
    'carved',
    'molded',
    'cast',
    'forged',
    'welded',
    'soldered',
    'riveted',
    'screwed',
    'glued',
    'stitched',
    'sewn',
    'knitted',
    'woven',
    'braided',
    'twisted',
    'coiled',
    'spiral',
    'helical',
    'conical',
    'cylindrical',
    'spherical',
    'cubic',
    'rectangular',
    'triangular',
    'circular',
    'oval',
    'elliptical',
    'curved',
    'straight',
    'angular',
    'rounded',
    'pointed',
    'blunt',
    'sharp',
    'smooth',
    'rough',
    'coarse',
    'fine',
    'thick',
    'thin',
    'wide',
    'narrow',
    'long',
    'short',
    'tall',
    'low',
    'high',
    'deep',
    'shallow',
    'hollow',
    'solid',
    'liquid',
    'gas',
    'plasma',
    'glass',
    'ceramic',
    'porcelain',
    'stone',
    'rock',
    'granite',
    'marble',
    'limestone',
    'sandstone',
    'shale',
    'clay',
    'mud',
    'soil',
    'dirt',
    'sand',
    'gravel',
    'pebble',
    'boulder',
    'mountain',
    'hill',
    'valley',
    'canyon',
    'gorge',
    'ravine',
    'cliff',
    'bluff',
    'ridge',
    'peak',
    'summit',
    'crest',
    'plateau',
    'mesa',
    'butte',
    'knoll',
    'mound',
    'dune',
    'beach',
    'shore',
    'coast',
    'ocean',
    'sea',
    'lake',
    'river',
    'stream',
    'creek',
    'brook',
    'pond',
    'pool',
    'spring',
    'well',
    'fountain',
    'waterfall',
    'rapids',
    'whirlpool',
    'eddy',
    'current',
    'tide',
    'wave',
    'ripple',
    'splash',
    'spray',
    'mist',
    'fog',
    'cloud',
    'vapor',
    'steam',
    'smoke',
    'ash',
    'soot',
    'coal',
    'peat',
    'lignite',
    'bituminous',
    'anthracite',
    'graphite',
    'diamond',
    'ruby',
    'sapphire',
    'amethyst',
    'topaz',
    'garnet',
    'opal',
    'pearl',
    'lapis',
    'malachite',
    'azurite',
    'cinnabar',
    'hematite',
    'magnetite',
    'pyrite',
    'galena',
    'sphalerite',
    'calcite',
    'quartz',
    'feldspar',
    'mica',
    'talc',
    'gypsum',
    'halite',
    'fluorite',
    'apatite',
    'orthoclase',
    'plagioclase',
    'olivine',
    'pyroxene',
    'amphibole',
    'biotite',
    'muscovite',
    'chlorite',
    'serpentine',
    'zeolite',
    'stilbite',
    'heulandite',
    'chabazite',
    'natrolite',
    'analcime',
    'laumontite',
    'wairakite',
    'dachiardite',
    'ferrierite',
    'mordenite',
    'clinoptilolite',
    'erionite',
    'offretite',
    'levyne',
    'gismondine',
    'harmotome',
    'phillipsite',
    'gmelinite',
    'willhendersonite',
    'bellbergite',
    'liottite',
    'tounkite',
    'cowlesite',
    'faujasite',
    'linde',
  ];

  return patternKeywords.some((keyword) =>
    colorName.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Formats a color name for display
 */
export function getColorDisplayName(colorName: string): string {
  if (!colorName) return '';

  // Handle special cases
  if (colorName.toLowerCase() === 'tigers') {
    return 'Tigers (Orange with Black Stripes)';
  }

  // Capitalize first letter of each word
  return colorName
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
