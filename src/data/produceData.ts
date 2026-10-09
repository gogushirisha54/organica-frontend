export interface ProduceVariant {
  id: string;
  label: string;
  weightLabel: string;
  price: number;
  savingsNote?: string;
}

export interface ProduceProduct {
  id: string;
  name: string;
  botanicalName: string;
  category: 'Heirloom Vegetables' | 'Orchard Fruits' | 'Leafy Greens & Roots' | 'Curated Crates';
  shortCategory: string;
  price: number;
  unit: string;
  image: string;
  imageObjectPosition?: string;
  harvestTime: string;
  parcelId: string;
  parcelLocation: string;
  brixScore: number;
  brixLabel: string;
  soilProfile: string;
  availabilityText: string;
  inStock: boolean;
  description: string;
  tastingNotes: string;
  storageGuide: string;
  culinaryPairing: string;
  nutritionHighlights: {
    label: string;
    value: string;
  }[];
  variants: ProduceVariant[];
}

export interface BoxProduceSlotItem {
  id: string;
  name: string;
  variety: string;
  type: 'Vegetable' | 'Fruit' | 'Greens & Herbs';
  weightLbs: number;
  unitLabel: string;
  retailValue: number;
  brix: string;
  image: string;
  nutrientFocus: 'Antioxidants' | 'Vitamin C' | 'Folate & Iron' | 'Prebiotic Fiber';
  harvestNote: string;
}

export interface CustomBoxTier {
  id: 'petite' | 'family' | 'cellar';
  name: string;
  slots: number;
  basePrice: number;
  estimatedWeight: string;
  idealFor: string;
}

export interface FieldParcelRecord {
  parcelCode: string;
  fieldName: string;
  region: string;
  cropFamily: string;
  soilOrganicMatter: string;
  coverCropRotation: string;
  dawnTempF: string;
  harvestWindow: string;
}

export interface ChefTestimonial {
  id: string;
  quote: string;
  beforeOutcome: string;
  author: string;
  role: string;
  organization: string;
  location: string;
}

export const GENERATED_IMAGES = {
  heroCrate: '/src/assets/images/hero_organic_harvest_crate_1791478367145.jpg',
  heirloomTomatoes: '/src/assets/images/product_heirloom_tomatoes_1791478379349.jpg',
  rainbowRoots: '/src/assets/images/product_rainbow_roots_beets_1791478390923.jpg',
  orchardCitrusFigs: '/src/assets/images/product_orchard_citrus_figs_1791478402983.jpg',
  tuscanKaleArtichokes: '/src/assets/images/product_tuscan_kale_artichokes_1791478412827.jpg',
};

export const PRODUCE_CATALOG: ProduceProduct[] = [
  {
    id: 'prod-heirloom-tomatoes',
    name: 'Brandywine & Cherokee Purple Vine Tomatoes',
    botanicalName: 'Solanum lycopersicum · Dry-Farmed',
    category: 'Heirloom Vegetables',
    shortCategory: 'Heirloom Nightshades',
    price: 12.50,
    unit: '2.0 lb Vine Cluster',
    image: GENERATED_IMAGES.heirloomTomatoes,
    imageObjectPosition: 'center center',
    harvestTime: '05:35 AM PDT',
    parcelId: 'Parcel 04-B',
    parcelLocation: 'South Loam Terrace, Capay Valley',
    brixScore: 9.4,
    brixLabel: '9.4° Brix (Peak Umami-Sweet)',
    soilProfile: 'Deep alluvial clay loam · Dry-farmed after fruit set',
    availabilityText: 'In Stock · Dawn Harvest',
    inStock: true,
    description:
      'Dry-farmed in deep alluvial clay loam without supplemental mid-summer irrigation, forcing roots six feet deep into mineral strata. The result is dense, thin-skinned flesh with concentrated sugars and complex wine-like acidity.',
    tastingNotes: 'Sun-warmed plum, savorybalsamic finish, zero mealiness, low seed-gel water ratio.',
    storageGuide: 'Store stem-side down on a breathable counter surface at 62°F–68°F. Never refrigerate; cold temperatures mute volatile aroma compounds.',
    culinaryPairing: 'Slice thick on warm sourdough or travertine platter with flaky sea salt, cold-pressed arbequina olive oil, and torn purple basil.',
    nutritionHighlights: [
      { label: 'Lycopene Density', value: '42.8 mg / lb' },
      { label: 'Vitamin C', value: '38% DV / serving' },
      { label: 'Dry Matter Ratio', value: '8.6% Solids' },
      { label: 'Pesticide Residue', value: '0.00 ppm Verified' },
    ],
    variants: [
      { id: 'v-tom-std', label: 'Standard 2.0 lb Vine Cluster', weightLabel: '2.0 lbs', price: 12.50 },
      { id: 'v-tom-chef', label: 'Chef’s 5.0 lb Flat Crate', weightLabel: '5.0 lbs', price: 28.00, savingsNote: 'Save 10%' },
      { id: 'v-tom-sub', label: 'Weekly Thursday Harvest Drop', weightLabel: '2.0 lbs / wk', price: 10.60, savingsNote: 'Save 15%' },
    ],
  },
  {
    id: 'prod-orchard-citrus-figs',
    name: 'Meyer Lemons, Moro Blood Oranges & Black Mission Figs',
    botanicalName: 'Citrus × meyeri & Ficus carica',
    category: 'Orchard Fruits',
    shortCategory: 'Orchard Citrus & Figs',
    price: 18.00,
    unit: '3.0 lb Orchard Flight',
    image: GENERATED_IMAGES.orchardCitrusFigs,
    imageObjectPosition: 'center center',
    harvestTime: '06:05 AM PDT',
    parcelId: 'Parcel 09-A',
    parcelLocation: 'West Ridge Sun Slope, Winters',
    brixScore: 18.8,
    brixLabel: '18.8° Brix (Honeyed Jam Core)',
    soilProfile: 'Volcanic gravelly loam · Under-canopy crimson clover',
    availabilityText: 'In Stock · Limited Run',
    inStock: true,
    description:
      'Hand-clipped with stem leaves intact from forty-year-old heritage orchard trees. Combines floral, thin-rinded Meyer lemons, anthocyanin-rich Moro blood oranges, and late-season Black Mission figs dripping with nectar.',
    tastingNotes: 'Bergamot blossom, tart raspberry citrus, and caramelized berry jam interior.',
    storageGuide: 'Enjoy figs within 3 days of delivery; keep citrus in a cool pantry or crisper drawer for up to 14 days.',
    culinaryPairing: 'Halve figs and broil briefly with thyme blossom honey; shave Meyer lemon zest over ricotta, bitter greens, or roasted sea bass.',
    nutritionHighlights: [
      { label: 'Anthocyanins', value: '115 mg / 100g' },
      { label: 'Vitamin C', value: '130% DV / serving' },
      { label: 'Dietary Fiber', value: '5.4 g / serving' },
      { label: 'Orchard Age', value: '42 Years Heritage' },
    ],
    variants: [
      { id: 'v-cit-std', label: '3.0 lb Orchard Tasting Flight', weightLabel: '3.0 lbs', price: 18.00 },
      { id: 'v-cit-double', label: '6.0 lb Cellar Hosting Case', weightLabel: '6.0 lbs', price: 32.50, savingsNote: 'Save 10%' },
      { id: 'v-cit-sub', label: 'Weekly Thursday Harvest Drop', weightLabel: '3.0 lbs / wk', price: 15.30, savingsNote: 'Save 15%' },
    ],
  },
  {
    id: 'prod-rainbow-roots',
    name: 'Rainbow Heirloom Carrots & Striped Chioggia Beets',
    botanicalName: 'Daucus carota & Beta vulgaris',
    category: 'Leafy Greens & Roots',
    shortCategory: 'Root & Top Bundles',
    price: 9.50,
    unit: '2.5 lb Field Bundle',
    image: GENERATED_IMAGES.rainbowRoots,
    imageObjectPosition: 'center center',
    harvestTime: '05:15 AM PDT',
    parcelId: 'Parcel 02-C',
    parcelLocation: 'North Creek Sandy Silt, Capay Valley',
    brixScore: 12.6,
    brixLabel: '12.6° Brix (Cold-Sweetened)',
    soilProfile: 'Fine creek-bed sandy loam ·Zero-till compost mulch',
    availabilityText: 'In Stock · Dawn Harvest',
    inStock: true,
    description:
      'Pulled by hand from friable sandy silt after cool autumn nights convert root starches into crisp natural sugars. Delivered unbleached with feathery carrot fronds and mineral-rich beet greens intact for whole-plant cooking.',
    tastingNotes: 'Clean sweet snap, zero woody core, delicate earthy sweetness with zero muddy bitterness.',
    storageGuide: 'Trim leafy tops to one inch upon arrival to preserve root crispness; store roots in a damp linen towel inside the crisper for 2 weeks.',
    culinaryPairing: 'Roast whole carrots over walnut embers with cumin and brown butter; shave Chioggia beets raw on a mandoline with citrus vinaigrette.',
    nutritionHighlights: [
      { label: 'Beta-Carotene', value: '210% DV / serving' },
      { label: 'Dietary Nitrates', value: '280 mg / 100g' },
      { label: 'Folate (B9)', value: '34% DV / serving' },
      { label: 'Top-to-Root Ratio', value: '100% Edible Greens' },
    ],
    variants: [
      { id: 'v-root-std', label: '2.5 lb Field Bundle with Tops', weightLabel: '2.5 lbs', price: 9.50 },
      { id: 'v-root-chef', label: '6.0 lb Roasting & Juicing Sack', weightLabel: '6.0 lbs', price: 20.50, savingsNote: 'Save 10%' },
      { id: 'v-root-sub', label: 'Weekly Thursday Harvest Drop', weightLabel: '2.5 lbs / wk', price: 8.10, savingsNote: 'Save 15%' },
    ],
  },
  {
    id: 'prod-tuscan-kale-artichokes',
    name: 'Lacinato Tuscan Kale, Purple Artichokes & Asparagus',
    botanicalName: 'Brassica oleracea & Cynara cardunculus',
    category: 'Heirloom Vegetables',
    shortCategory: 'Coastal Brassicas & Thistles',
    price: 14.50,
    unit: '2.5 lb Coastal Bundle',
    image: GENERATED_IMAGES.tuscanKaleArtichokes,
    imageObjectPosition: 'center center',
    harvestTime: '05:00 AM PDT',
    parcelId: 'Parcel 01-A',
    parcelLocation: 'Marine Fog Bench, Pescadero',
    brixScore: 8.2,
    brixLabel: '8.2° Brix (Fog-Tenderized)',
    soilProfile: 'Marine terrace loam · Kelp & vermicompost amended',
    availabilityText: 'In Stock · Dawn Harvest',
    inStock: true,
    description:
      'Grown along our coastal fog bench where cool maritime mornings prevent fibrous bolting. Includes deeply blistered dinosaur kale, tight-bracted violet globe artichokes, and pencil-thin tender green asparagus spears.',
    tastingNotes: 'Nutty artichoke heart, sweet chlorophyll snap, silky dark-leaf texture when massaged or charred.',
    storageGuide: 'Stand asparagus spears upright in 1 inch of cold water; wrap kale and artichokes unwashed in breathable cotton in the crisper.',
    culinaryPairing: 'Char artichokes and asparagus on a cast-iron plancha with preserved Meyer lemon, garlic confit, and aged sheep’s milk pecorino.',
    nutritionHighlights: [
      { label: 'Vitamin K1', value: '340% DV / serving' },
      { label: 'Lutein & Zeaxanthin', value: '18.4 mg / bunch' },
      { label: 'Prebiotic Inulin', value: '6.8 g / artichoke' },
      { label: 'Hydro-Cool Time', value: '< 25 mins post-cut' },
    ],
    variants: [
      { id: 'v-kale-std', label: '2.5 lb Coastal Green Trio', weightLabel: '2.5 lbs', price: 14.50 },
      { id: 'v-kale-chef', label: '5.5 lb Culinary Prep Crate', weightLabel: '5.5 lbs', price: 28.80, savingsNote: 'Save 10%' },
      { id: 'v-kale-sub', label: 'Weekly Thursday Harvest Drop', weightLabel: '2.5 lbs / wk', price: 12.30, savingsNote: 'Save 15%' },
    ],
  },
  {
    id: 'prod-autumn-equinox-crate',
    name: 'The Signature Dawn Harvest Provision Crate',
    botanicalName: '9 Certified Regenerative Seasonal Varieties',
    category: 'Curated Crates',
    shortCategory: 'Full Farm Assortment',
    price: 54.00,
    unit: '11.0 lb Cedar-Packed Crate',
    image: GENERATED_IMAGES.heroCrate,
    imageObjectPosition: 'center center',
    harvestTime: '05:00 AM – 06:30 AM PDT',
    parcelId: 'Parcels 01–09',
    parcelLocation: 'Capay Valley & Pescadero Estates',
    brixScore: 14.2,
    brixLabel: '14.2° Avg Brix (Full Spectrum)',
    soilProfile: 'Multi-parcel regenerative rotation · 6.4% Organic Matter',
    availabilityText: 'In Stock · Ships Cold-Chain',
    inStock: true,
    description:
      'Our flagship farm-to-table assortment harvested before sunrise and packed into an insulated liner. Includes Brandywine and Cherokee Purple tomatoes, rainbow carrots with tops, Lacinato kale, blood oranges, Black Mission figs, Chioggia beets, and culinary herb bundles.',
    tastingNotes: 'Complete weekly culinary larder balancing sweet orchard fruit, savory nightshades, earthy roots, and crisp coastal greens.',
    storageGuide: 'Includes a printed linen-card storage map sorting items into Countertop (Tomatoes, Figs) and High-Humidity Crisper (Kale, Roots).',
    culinaryPairing: 'Designed to provision 6 to 8 home-cooked meals, salads, and roasting sheets for a household of two to four.',
    nutritionHighlights: [
      { label: 'Plant Diversity', value: '9 Distinct Species' },
      { label: 'Total Crate Weight', value: '11.0 lbs Net' },
      { label: 'Harvest-to-Door', value: 'Under 14 Hours' },
      { label: 'Single-Item Savings', value: '22% vs. A La Carte' },
    ],
    variants: [
      { id: 'v-crate-std', label: '11.0 lb Signature Household Crate', weightLabel: '11.0 lbs', price: 54.00 },
      { id: 'v-crate-feast', label: '18.0 lb Estate Feast Crate', weightLabel: '18.0 lbs', price: 82.00, savingsNote: 'Save 14%' },
      { id: 'v-crate-sub', label: 'Weekly Thursday Harvest Subscription', weightLabel: '11.0 lbs / wk', price: 45.90, savingsNote: 'Save 15%' },
    ],
  },
  {
    id: 'prod-velvet-figs-citrus-reserve',
    name: 'Late-Harvest Black Mission Figs & Ruby Blood Oranges',
    botanicalName: 'Ficus carica · Old-Vine Orchard Reserve',
    category: 'Orchard Fruits',
    shortCategory: 'Late-Season Orchard Reserve',
    price: 16.50,
    unit: '2.2 lb Wooden Punnet',
    image: GENERATED_IMAGES.orchardCitrusFigs,
    imageObjectPosition: 'right bottom',
    harvestTime: '06:20 AM PDT',
    parcelId: 'Parcel 09-B',
    parcelLocation: 'South Limestone Bench, Winters',
    brixScore: 21.4,
    brixLabel: '21.4° Brix (Nectar-Drop Ripeness)',
    soilProfile: 'Calcareous limestone bench · Zero synthetic inputs',
    availabilityText: 'Limited Run · 18 Punnets Left',
    inStock: true,
    description:
      'Picked at the "neck-bend" stage when the fig droops on the branch and a bead of natural honey appears at the ostiole. Paired with deep crimson Moro blood oranges for bright aromatic contrast.',
    tastingNotes: 'Jammed black currant, wildflower honey, port-wine richness balanced by bright ruby citrus.',
    storageGuide: 'Keep figs in a single layer on a plate in the coolest part of your kitchen and enjoy within 48–72 hours.',
    culinaryPairing: 'Serve at room temperature with aged goat cheese, toasted walnuts, prosciutto di Parma, or reduced balsamic.',
    nutritionHighlights: [
      { label: 'Potassium & Calcium', value: '18% DV / serving' },
      { label: 'Natural Brix Sugar', value: '21.4° Refractometer' },
      { label: 'Polyphenols', value: 'High Skin Density' },
      { label: 'Packaging', value: 'Breathable Birch Punnet' },
    ],
    variants: [
      { id: 'v-fig-std', label: '2.2 lb Birch Punnet Reserve', weightLabel: '2.2 lbs', price: 16.50 },
      { id: 'v-fig-double', label: '4.4 lb Pastry & Cheeseboard Flat', weightLabel: '4.4 lbs', price: 29.70, savingsNote: 'Save 10%' },
    ],
  },
];

export const CUSTOM_BOX_TIERS: CustomBoxTier[] = [
  {
    id: 'petite',
    name: 'Petite Kitchen Crate',
    slots: 5,
    basePrice: 36.00,
    estimatedWeight: '6.5 – 8.0 lbs',
    idealFor: '1–2 people · 4–5 meals per week',
  },
  {
    id: 'family',
    name: 'Family Table Crate',
    slots: 8,
    basePrice: 54.00,
    estimatedWeight: '10.5 – 13.0 lbs',
    idealFor: '2–4 people · Daily cooking & fruit bowl',
  },
  {
    id: 'cellar',
    name: 'Chef’s Cellar Crate',
    slots: 12,
    basePrice: 76.00,
    estimatedWeight: '16.0 – 19.5 lbs',
    idealFor: '4+ people · Enthusiast roasting, juicing & hosting',
  },
];

export const BOX_PRODUCE_SLOTS: BoxProduceSlotItem[] = [
  {
    id: 'slot-heirloom-tom',
    name: 'Cherokee Purple & Brandywine Tomatoes',
    variety: 'Dry-Farmed Nightshade',
    type: 'Vegetable',
    weightLbs: 1.5,
    unitLabel: '1.5 lb vine cluster',
    retailValue: 9.50,
    brix: '9.4° Brix',
    image: GENERATED_IMAGES.heirloomTomatoes,
    nutrientFocus: 'Antioxidants',
    harvestNote: 'Parcel 04-B · Picked 05:35 AM',
  },
  {
    id: 'slot-rainbow-carrots',
    name: 'Rainbow Heirloom Carrots with Tops',
    variety: 'Purple, Gold & Scarlet',
    type: 'Vegetable',
    weightLbs: 1.5,
    unitLabel: '1.5 lb bunch',
    retailValue: 7.50,
    brix: '12.6° Brix',
    image: GENERATED_IMAGES.rainbowRoots,
    nutrientFocus: 'Prebiotic Fiber',
    harvestNote: 'Parcel 02-C · Picked 05:15 AM',
  },
  {
    id: 'slot-chioggia-beets',
    name: 'Striped Chioggia & Bull’s Blood Beets',
    variety: 'Candy-Stripe Root & Greens',
    type: 'Vegetable',
    weightLbs: 1.6,
    unitLabel: '1.6 lb bunch',
    retailValue: 7.50,
    brix: '13.1° Brix',
    image: GENERATED_IMAGES.rainbowRoots,
    nutrientFocus: 'Folate & Iron',
    harvestNote: 'Parcel 02-C · Picked 05:20 AM',
  },
  {
    id: 'slot-tuscan-kale',
    name: 'Lacinato Tuscan Dinosaur Kale',
    variety: 'Fog-Kissed Dark Leaf',
    type: 'Greens & Herbs',
    weightLbs: 1.0,
    unitLabel: '2 large bunches (1.0 lb)',
    retailValue: 8.00,
    brix: '8.2° Brix',
    image: GENERATED_IMAGES.tuscanKaleArtichokes,
    nutrientFocus: 'Folate & Iron',
    harvestNote: 'Parcel 01-A · Picked 05:00 AM',
  },
  {
    id: 'slot-globe-artichokes',
    name: 'Violetto Purple Globe Artichokes',
    variety: 'Frost-Kissed Coastal Thistle',
    type: 'Vegetable',
    weightLbs: 1.4,
    unitLabel: '3 medium globes (1.4 lb)',
    retailValue: 9.00,
    brix: '8.5° Brix',
    image: GENERATED_IMAGES.tuscanKaleArtichokes,
    nutrientFocus: 'Prebiotic Fiber',
    harvestNote: 'Parcel 01-A · Picked 05:10 AM',
  },
  {
    id: 'slot-asparagus',
    name: 'Tender Green Maritime Asparagus',
    variety: 'First-Cut Spear Bundle',
    type: 'Greens & Herbs',
    weightLbs: 1.0,
    unitLabel: '1.0 lb tied bundle',
    retailValue: 8.50,
    brix: '7.9° Brix',
    image: GENERATED_IMAGES.tuscanKaleArtichokes,
    nutrientFocus: 'Folate & Iron',
    harvestNote: 'Parcel 01-B · Picked 05:05 AM',
  },
  {
    id: 'slot-blood-oranges',
    name: 'Moro Ruby Blood Oranges',
    variety: 'Anthocyanin-Rich Citrus',
    type: 'Fruit',
    weightLbs: 2.0,
    unitLabel: '2.0 lb orchard bag (5–6 pcs)',
    retailValue: 9.00,
    brix: '15.4° Brix',
    image: GENERATED_IMAGES.orchardCitrusFigs,
    nutrientFocus: 'Vitamin C',
    harvestNote: 'Parcel 09-A · Picked 06:05 AM',
  },
  {
    id: 'slot-mission-figs',
    name: 'Tree-Ripened Black Mission Figs',
    variety: 'Old-Vine Nectar Drop',
    type: 'Fruit',
    weightLbs: 1.0,
    unitLabel: '1.0 lb birch punnet',
    retailValue: 9.50,
    brix: '21.4° Brix',
    image: GENERATED_IMAGES.orchardCitrusFigs,
    nutrientFocus: 'Antioxidants',
    harvestNote: 'Parcel 09-B · Picked 06:20 AM',
  },
  {
    id: 'slot-meyer-lemons',
    name: 'Stem- & Leaf-On Meyer Lemons',
    variety: 'Thin-Rind Floral Citrus',
    type: 'Fruit',
    weightLbs: 1.5,
    unitLabel: '1.5 lb branch cut',
    retailValue: 8.00,
    brix: '11.2° Brix',
    image: GENERATED_IMAGES.orchardCitrusFigs,
    nutrientFocus: 'Vitamin C',
    harvestNote: 'Parcel 09-A · Picked 06:00 AM',
  },
];

export const FIELD_PARCEL_LEDGER: FieldParcelRecord[] = [
  {
    parcelCode: 'PARCEL 01-A',
    fieldName: 'Marine Fog Bench',
    region: 'Pescadero Coast, CA',
    cropFamily: 'Brassicas, Artichokes & Asparagus',
    soilOrganicMatter: '6.8%',
    coverCropRotation: 'Bell Beans, Oats & Purple Vetch',
    dawnTempF: '48.5°F',
    harvestWindow: '04:45 AM – 05:45 AM',
  },
  {
    parcelCode: 'PARCEL 02-C',
    fieldName: 'North Creek Sandy Silt',
    region: 'Capay Valley, CA',
    cropFamily: 'Umbellifers & Chenopods (Carrots & Beets)',
    soilOrganicMatter: '6.1%',
    coverCropRotation: 'Buckwheat & Phacelia Pollinator Strip',
    dawnTempF: '51.2°F',
    harvestWindow: '05:00 AM – 06:00 AM',
  },
  {
    parcelCode: 'PARCEL 04-B',
    fieldName: 'South Loam Terrace',
    region: 'Capay Valley, CA',
    cropFamily: 'Dry-Farmed Solanaceae (Heirloom Tomatoes)',
    soilOrganicMatter: '6.5%',
    coverCropRotation: 'Subterranean Clover & Winter Rye',
    dawnTempF: '54.0°F',
    harvestWindow: '05:30 AM – 06:15 AM',
  },
  {
    parcelCode: 'PARCEL 09-A',
    fieldName: 'West Ridge Sun Slope',
    region: 'Winters Foothills, CA',
    cropFamily: 'Heritage Citrus & Old-Vine Figs',
    soilOrganicMatter: '6.2%',
    coverCropRotation: 'Perennial Crimson Clover & Sheep Grazing',
    dawnTempF: '56.4°F',
    harvestWindow: '06:00 AM – 07:00 AM',
  },
];

export const CHEF_TESTIMONIALS: ChefTestimonial[] = [
  {
    id: 'test-1',
    quote:
      'Before switching our larder to Verdure & Loam, wholesale heirloom tomatoes arrived mealy from 38°F cold-storage warehouses and lost 25% of their weight to trim waste. Now our Thursday morning crates arrive at 58°F cellar temperature within 9 hours of picking, raising our tomato course Brix from 5.8° to 9.4° and eliminating trim loss completely.',
    beforeOutcome: '0% trim waste · +3.6° Brix sweetness increase in plated courses',
    author: 'Elena Rostova',
    role: 'Executive Chef & Proprietor',
    organization: 'Osteria Calcare',
    location: 'San Francisco, CA',
  },
  {
    id: 'test-2',
    quote:
      'Supermarket organic greens wilted in our crisper after three days because they spent a week in transit. With Verdure & Loam’s Family Table Crate, the Lacinato kale and rainbow carrot tops stay turgid and crisp for 12 full days, increasing our household vegetable consumption from 4 meals a week to every single dinner.',
    beforeOutcome: '12-day crisper longevity · 100% weekly produce utilization',
    author: 'Marcus Vance, PhD',
    role: 'Nutritional Biochemist & Household Subscriber',
    organization: 'Bay Area Clinical Nutrition',
    location: 'Berkeley, CA',
  },
];
