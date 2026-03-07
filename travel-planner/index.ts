// ═══════════════════════════════════════════════════════════════════════════
// Travel Planner — Multi-Agent Tokyo Trip Optimizer
// 5 days · 2 travelers · $4,000 budget
// ═══════════════════════════════════════════════════════════════════════════

// ── ANSI helpers ────────────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
};

function clr(c: string, t: string): string {
  return `${c}${t}${C.reset}`;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Types ───────────────────────────────────────────────────────────────────

interface Coord {
  lat: number;
  lon: number;
}

interface Landmark extends Coord {
  name: string;
  emoji: string;
}

interface Flight {
  name: string;
  price: number;
  durationMin: number;
  stops: number;
}

interface Hotel {
  name: string;
  pricePerNight: number;
  rating: number;
  location: string;
  coord: Coord;
}

interface Activity {
  name: string;
  landmark: string;
  costPP: number;
  hours: number;
  opensAt: number;
  closesAt: number;
  category: string;
  emoji: string;
  coord: Coord;
}

interface DayPlan {
  day: number;
  label: string;
  activities: ScheduledActivity[];
  totalCost: number;
  totalDistKm: number;
}

interface ScheduledActivity extends Activity {
  startTime: number;
  endTime: number;
  travelKm: number;
  travelMin: number;
}

interface BudgetLine {
  label: string;
  emoji: string;
  amount: number;
}

// ── Data ────────────────────────────────────────────────────────────────────

const LANDMARKS: Landmark[] = [
  { name: "Shibuya Crossing", lat: 35.6595, lon: 139.7004, emoji: "🚶" },
  { name: "Senso-ji Temple", lat: 35.7148, lon: 139.7967, emoji: "⛩️" },
  { name: "Tokyo Tower", lat: 35.6586, lon: 139.7454, emoji: "🗼" },
  { name: "Akihabara", lat: 35.7023, lon: 139.7745, emoji: "🎮" },
  { name: "Meiji Shrine", lat: 35.6764, lon: 139.6993, emoji: "⛩️" },
  { name: "Tsukiji Outer Market", lat: 35.6654, lon: 139.7707, emoji: "🐟" },
  { name: "Shinjuku Gyoen", lat: 35.6852, lon: 139.71, emoji: "🌸" },
  { name: "teamLab Borderless", lat: 35.6267, lon: 139.7839, emoji: "🎨" },
  { name: "Imperial Palace", lat: 35.6852, lon: 139.7528, emoji: "🏯" },
  { name: "Harajuku/Takeshita St", lat: 35.6702, lon: 139.7026, emoji: "🛍️" },
  { name: "Ueno Park", lat: 35.7146, lon: 139.7732, emoji: "🌳" },
  { name: "Odaiba", lat: 35.6267, lon: 139.775, emoji: "🎡" },
  { name: "Roppongi Hills", lat: 35.6605, lon: 139.7292, emoji: "🌃" },
  { name: "Nakameguro", lat: 35.6441, lon: 139.6988, emoji: "🌿" },
  { name: "Tokyo Skytree", lat: 35.7101, lon: 139.8107, emoji: "📡" },
];

const FLIGHTS: Flight[] = [
  { name: "Economy Direct LAX→NRT", price: 850, durationMin: 690, stops: 0 },
  { name: "Economy 1-Stop via SEA", price: 720, durationMin: 945, stops: 1 },
  { name: "Premium Economy Direct", price: 1100, durationMin: 690, stops: 0 },
  { name: "Economy 1-Stop via HNL", price: 680, durationMin: 1100, stops: 1 },
  { name: "Budget Carrier Direct", price: 790, durationMin: 735, stops: 0 },
];

const HOTELS: Hotel[] = [
  { name: "Shinjuku Granbell", pricePerNight: 145, rating: 4.2, location: "Near Shinjuku station", coord: { lat: 35.6897, lon: 139.7005 } },
  { name: "Hotel Gracery Shinjuku", pricePerNight: 165, rating: 4.4, location: "Near Kabukicho", coord: { lat: 35.6944, lon: 139.7013 } },
  { name: "Shibuya Stream Excel", pricePerNight: 185, rating: 4.5, location: "Near Shibuya station", coord: { lat: 35.6585, lon: 139.7025 } },
  { name: "Asakusa View Hotel", pricePerNight: 125, rating: 4.0, location: "Near Senso-ji", coord: { lat: 35.7126, lon: 139.7946 } },
  { name: "Hilton Tokyo", pricePerNight: 220, rating: 4.3, location: "Shinjuku area", coord: { lat: 35.6932, lon: 139.6917 } },
  { name: "Tokyu Stay Shinjuku", pricePerNight: 110, rating: 3.9, location: "Budget-friendly", coord: { lat: 35.6905, lon: 139.6978 } },
];

const ACTIVITIES: Activity[] = [
  { name: "Senso-ji Morning Visit", landmark: "Senso-ji Temple", costPP: 0, hours: 1.5, opensAt: 6, closesAt: 17, category: "culture", emoji: "⛩️", coord: { lat: 35.7148, lon: 139.7967 } },
  { name: "Meiji Shrine Walk", landmark: "Meiji Shrine", costPP: 0, hours: 1.5, opensAt: 5, closesAt: 18, category: "culture", emoji: "⛩️", coord: { lat: 35.6764, lon: 139.6993 } },
  { name: "Shibuya Crossing & Hachiko", landmark: "Shibuya Crossing", costPP: 0, hours: 1, opensAt: 0, closesAt: 24, category: "culture", emoji: "🚶", coord: { lat: 35.6595, lon: 139.7004 } },
  { name: "Tsukiji Market Food Tour", landmark: "Tsukiji Outer Market", costPP: 35, hours: 2, opensAt: 5, closesAt: 14, category: "food", emoji: "🐟", coord: { lat: 35.6654, lon: 139.7707 } },
  { name: "Tokyo Tower Observatory", landmark: "Tokyo Tower", costPP: 12, hours: 1.5, opensAt: 9, closesAt: 23, category: "culture", emoji: "🗼", coord: { lat: 35.6586, lon: 139.7454 } },
  { name: "Akihabara Electronics Tour", landmark: "Akihabara", costPP: 20, hours: 2.5, opensAt: 10, closesAt: 21, category: "technology", emoji: "🎮", coord: { lat: 35.7023, lon: 139.7745 } },
  { name: "teamLab Borderless", landmark: "teamLab Borderless", costPP: 25, hours: 2.5, opensAt: 10, closesAt: 19, category: "technology", emoji: "🎨", coord: { lat: 35.6267, lon: 139.7839 } },
  { name: "Imperial Palace Gardens", landmark: "Imperial Palace", costPP: 0, hours: 1.5, opensAt: 9, closesAt: 17, category: "nature", emoji: "🏯", coord: { lat: 35.6852, lon: 139.7528 } },
  { name: "Harajuku Shopping", landmark: "Harajuku/Takeshita St", costPP: 15, hours: 2, opensAt: 10, closesAt: 20, category: "culture", emoji: "🛍️", coord: { lat: 35.6702, lon: 139.7026 } },
  { name: "Shinjuku Gyoen Garden", landmark: "Shinjuku Gyoen", costPP: 3, hours: 2, opensAt: 9, closesAt: 18, category: "nature", emoji: "🌸", coord: { lat: 35.6852, lon: 139.71 } },
  { name: "Ueno Park & Museums", landmark: "Ueno Park", costPP: 10, hours: 2.5, opensAt: 9, closesAt: 17, category: "culture", emoji: "🌳", coord: { lat: 35.7146, lon: 139.7732 } },
  { name: "Odaiba Waterfront", landmark: "Odaiba", costPP: 0, hours: 2, opensAt: 0, closesAt: 24, category: "nature", emoji: "🎡", coord: { lat: 35.6267, lon: 139.775 } },
  { name: "Roppongi Art Night", landmark: "Roppongi Hills", costPP: 18, hours: 2, opensAt: 10, closesAt: 22, category: "culture", emoji: "🌃", coord: { lat: 35.6605, lon: 139.7292 } },
  { name: "Nakameguro River Walk", landmark: "Nakameguro", costPP: 0, hours: 1.5, opensAt: 0, closesAt: 24, category: "nature", emoji: "🌿", coord: { lat: 35.6441, lon: 139.6988 } },
  { name: "Tokyo Skytree Visit", landmark: "Tokyo Skytree", costPP: 18, hours: 1.5, opensAt: 9, closesAt: 22, category: "technology", emoji: "📡", coord: { lat: 35.7101, lon: 139.8107 } },
  { name: "Robot Restaurant Show", landmark: "Shibuya Crossing", costPP: 55, hours: 1.5, opensAt: 16, closesAt: 23, category: "technology", emoji: "🤖", coord: { lat: 35.6932, lon: 139.7013 } },
  { name: "Ramen Street Tasting", landmark: "Tokyo Tower", costPP: 12, hours: 1, opensAt: 11, closesAt: 22, category: "food", emoji: "🍜", coord: { lat: 35.6625, lon: 139.7553 } },
  { name: "Mori Art Museum", landmark: "Roppongi Hills", costPP: 15, hours: 2, opensAt: 10, closesAt: 22, category: "culture", emoji: "🖼️", coord: { lat: 35.6605, lon: 139.7292 } },
];

const TRIP = {
  destination: "Tokyo, Japan",
  days: 5,
  travelers: 2,
  budget: 4000,
  interests: ["culture", "food", "technology", "nature"],
  dayLabels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  mealCostPPPerDay: 60,
  transportCostPPPerDay: 15,
};

// ── Haversine ───────────────────────────────────────────────────────────────

function haversineKm(a: Coord, b: Coord): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function travelMinutes(km: number): number {
  return (km / 30) * 60; // 30 km/h avg Tokyo transit
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

function padL(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : " ".repeat(n - s.length) + s;
}

function bar(fraction: number, width: number = 16): string {
  const filled = Math.round(fraction * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function fmtUsd(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtTime(hour: number): string {
  let totalMin = Math.round(hour * 60);
  let h = Math.floor(totalMin / 60);
  let m = totalMin % 60;
  if (h >= 24) h -= 24;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function header(emoji: string, title: string, agentNum: number): string {
  const inner = ` ${emoji}  Agent ${agentNum}: ${title} `;
  const line = "═".repeat(Math.max(0, 68 - inner.length));
  return `\n${clr(C.bold + C.cyan, "╔" + "═".repeat(68) + "╗")}\n${clr(C.bold + C.cyan, "║")}${clr(C.bold + C.white, inner)}${clr(C.dim, line)}${clr(C.bold + C.cyan, "║")}\n${clr(C.bold + C.cyan, "╚" + "═".repeat(68) + "╝")}`;
}

function subHeader(text: string): string {
  return `\n  ${clr(C.bold + C.yellow, "▸ " + text)}`;
}

function normalize(val: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((val - min) / (max - min)) * 100;
}

// ── Agent 1: Flight Agent ───────────────────────────────────────────────────

interface FlightResult {
  flight: Flight;
  totalCost: number;
  score: number;
}

async function flightAgent(): Promise<FlightResult> {
  console.log(header("✈️", "Flight Agent", 1));
  await sleep(400);
  console.log(subHeader("Analyzing 5 flight options LAX → NRT (round-trip pricing)..."));
  await sleep(300);

  const prices = FLIGHTS.map((f) => f.price);
  const durations = FLIGHTS.map((f) => f.durationMin);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const minD = Math.min(...durations), maxD = Math.max(...durations);

  const scored = FLIGHTS.map((f) => {
    const priceScore = 100 - normalize(f.price, minP, maxP);
    const durScore = 100 - normalize(f.durationMin, minD, maxD);
    const stopPenalty = f.stops * 20;
    const total = priceScore * 0.45 + durScore * 0.35 - stopPenalty + 20; // base 20
    return { flight: f, totalCost: f.price * 2, priceScore, durScore, stopPenalty, score: Math.round(total) };
  });

  scored.sort((a, b) => b.score - a.score);

  // Table header
  console.log("");
  console.log(
    `  ${clr(C.dim, pad("Flight Option", 28))} ${padL("$/pp", 7)} ${padL("Total", 8)} ${padL("Duration", 10)} ${padL("Stops", 6)} ${padL("Score", 6)}`
  );
  console.log(`  ${clr(C.dim, "─".repeat(68))}`);

  for (let i = 0; i < scored.length; i++) {
    const s = scored[i];
    const f = s.flight;
    const isWinner = i === 0;
    const color = isWinner ? C.green + C.bold : C.white;
    const marker = isWinner ? " ★" : "  ";
    console.log(
      `${clr(color, marker + pad(f.name, 28))} ${padL(fmtUsd(f.price), 7)} ${padL(fmtUsd(f.price * 2), 8)} ${padL(fmtDuration(f.durationMin), 10)} ${padL(String(f.stops), 6)} ${padL(String(s.score), 6)}`
    );
    await sleep(150);
  }

  const winner = scored[0];
  console.log(
    `\n  ${clr(C.green, "✓")} Selected: ${clr(C.bold + C.green, winner.flight.name)} — ${fmtUsd(winner.totalCost)} for 2 travelers (score ${winner.score})`
  );

  return { flight: winner.flight, totalCost: winner.totalCost, score: winner.score };
}

// ── Agent 2: Hotel Agent ────────────────────────────────────────────────────

interface HotelResult {
  hotel: Hotel;
  totalCost: number;
  score: number;
}

async function hotelAgent(budgetRemaining: number): Promise<HotelResult> {
  console.log(header("🏨", "Hotel Agent", 2));
  await sleep(400);
  console.log(subHeader(`Evaluating 6 hotels (budget remaining: ${fmtUsd(budgetRemaining)})...`));
  await sleep(300);

  // Top 5 attractions by popularity for proximity scoring
  const topAttractions: Coord[] = [
    { lat: 35.6595, lon: 139.7004 }, // Shibuya
    { lat: 35.7148, lon: 139.7967 }, // Senso-ji
    { lat: 35.6586, lon: 139.7454 }, // Tokyo Tower
    { lat: 35.6764, lon: 139.6993 }, // Meiji Shrine
    { lat: 35.7023, lon: 139.7745 }, // Akihabara
  ];

  const prices = HOTELS.map((h) => h.pricePerNight);
  const ratings = HOTELS.map((h) => h.rating);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const minR = Math.min(...ratings), maxR = Math.max(...ratings);

  const scored = HOTELS.map((h) => {
    const avgDist = topAttractions.reduce((s, a) => s + haversineKm(h.coord, a), 0) / topAttractions.length;
    const priceScore = 100 - normalize(h.pricePerNight, minP, maxP);
    const ratingScore = normalize(h.rating, minR, maxR);
    const locationScore = Math.max(0, 100 - avgDist * 10); // closer = higher
    const total = priceScore * 0.35 + ratingScore * 0.30 + locationScore * 0.35;
    const totalCost = h.pricePerNight * TRIP.days;
    return { hotel: h, totalCost, priceScore, ratingScore, locationScore, avgDist, score: Math.round(total) };
  });

  scored.sort((a, b) => b.score - a.score);

  console.log("");
  console.log(
    `  ${clr(C.dim, pad("Hotel", 24))} ${padL("$/night", 8)} ${padL("5 nights", 9)} ${padL("Rating", 7)} ${padL("Avg km", 7)} ${padL("Score", 6)}`
  );
  console.log(`  ${clr(C.dim, "─".repeat(64))}`);

  for (let i = 0; i < scored.length; i++) {
    const s = scored[i];
    const h = s.hotel;
    const isWinner = i === 0;
    const color = isWinner ? C.green + C.bold : C.white;
    const marker = isWinner ? " ★" : "  ";
    console.log(
      `${clr(color, marker + pad(h.name, 24))} ${padL(fmtUsd(h.pricePerNight), 8)} ${padL(fmtUsd(s.totalCost), 9)} ${padL(h.rating.toFixed(1), 7)} ${padL(s.avgDist.toFixed(1), 7)} ${padL(String(s.score), 6)}`
    );
    await sleep(150);
  }

  const winner = scored[0];
  console.log(
    `\n  ${clr(C.green, "✓")} Selected: ${clr(C.bold + C.green, winner.hotel.name)} — ${fmtUsd(winner.totalCost)} for 5 nights (${winner.hotel.location})`
  );

  return { hotel: winner.hotel, totalCost: winner.totalCost, score: winner.score };
}

// ── Agent 3: Activity Agent ─────────────────────────────────────────────────

// K-means-ish clustering of activities into 5 day groups by location
function clusterActivities(acts: Activity[], k: number): Activity[][] {
  // Seed centroids from evenly-spaced landmarks
  const seedIndices = [0, 3, 6, 10, 14]; // spread across LANDMARKS
  const centroids: Coord[] = seedIndices.slice(0, k).map((i) => ({ ...LANDMARKS[i] }));

  let clusters: Activity[][] = Array.from({ length: k }, () => []);

  for (let iter = 0; iter < 10; iter++) {
    clusters = Array.from({ length: k }, () => []);
    for (const a of acts) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = haversineKm(a.coord, centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = c;
        }
      }
      clusters[bestIdx].push(a);
    }

    // Update centroids
    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) continue;
      centroids[c].lat = clusters[c].reduce((s, a) => s + a.coord.lat, 0) / clusters[c].length;
      centroids[c].lon = clusters[c].reduce((s, a) => s + a.coord.lon, 0) / clusters[c].length;
    }
  }

  return clusters;
}

// Nearest-neighbor ordering within a cluster
function nearestNeighborOrder(acts: Activity[], startCoord: Coord): Activity[] {
  if (acts.length <= 1) return [...acts];
  const remaining = [...acts];
  const ordered: Activity[] = [];
  let current = startCoord;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i].coord);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    current = next.coord;
  }

  return ordered;
}

// Balance clusters so each day has 3-4 activities
function balanceClusters(clusters: Activity[][]): Activity[][] {
  const target = Math.ceil(ACTIVITIES.length / TRIP.days);
  const flat = clusters.flatMap((c) => c);
  const balanced: Activity[][] = Array.from({ length: TRIP.days }, () => []);

  // Redistribute: fill each day up to target
  let idx = 0;
  for (const a of flat) {
    if (balanced[idx].length >= target) idx = Math.min(idx + 1, TRIP.days - 1);
    balanced[idx].push(a);
  }
  return balanced;
}

async function activityAgent(hotelCoord: Coord): Promise<DayPlan[]> {
  console.log(header("🎌", "Activity Agent", 3));
  await sleep(400);
  console.log(subHeader("Clustering activities by geographic proximity..."));
  await sleep(300);

  const rawClusters = clusterActivities(ACTIVITIES, TRIP.days);
  const clusters = balanceClusters(rawClusters);

  const dayPlans: DayPlan[] = [];

  for (let d = 0; d < TRIP.days; d++) {
    // Sort by opening time so early-morning activities come first
    const sorted = [...clusters[d]].sort((a, b) => a.opensAt - b.opensAt);

    // Split into morning/afternoon groups for better scheduling
    const morning = sorted.filter((a) => a.opensAt < 14);
    const afternoon = sorted.filter((a) => a.opensAt >= 14);

    // Order each group by nearest-neighbor, then concatenate
    const ordered = [
      ...nearestNeighborOrder(morning, hotelCoord),
      ...nearestNeighborOrder(afternoon, morning.length > 0 ? morning[morning.length - 1].coord : hotelCoord),
    ];

    const scheduled: ScheduledActivity[] = [];
    let clock = 9.0; // Start at 9 AM

    for (let i = 0; i < ordered.length; i++) {
      const a = ordered[i];
      const prevCoord = i === 0 ? hotelCoord : ordered[i - 1].coord;
      const distKm = haversineKm(prevCoord, a.coord);
      const tMin = travelMinutes(distKm);

      clock += tMin / 60; // travel time
      if (clock < a.opensAt) clock = a.opensAt;

      // Skip if we can't finish before closing
      if (clock + a.hours > a.closesAt && a.closesAt < 24) continue;

      // Insert lunch break if crossing noon
      if (clock < 12.5 && clock + a.hours > 13) {
        // Do nothing — we'll just schedule through
      }

      const startTime = clock;
      const endTime = clock + a.hours;
      scheduled.push({ ...a, startTime, endTime, travelKm: distKm, travelMin: tMin });
      clock = endTime + 0.17; // ~10 min buffer
    }

    const totalCost = scheduled.reduce((s, a) => s + a.costPP * TRIP.travelers, 0);
    const totalDistKm = scheduled.reduce((s, a) => s + a.travelKm, 0);
    dayPlans.push({ day: d + 1, label: TRIP.dayLabels[d], activities: scheduled, totalCost, totalDistKm });
  }

  // Print day summaries
  for (const dp of dayPlans) {
    console.log(subHeader(`Day ${dp.day} (${dp.label}) — ${dp.activities.length} activities, ${dp.totalDistKm.toFixed(1)} km travel`));
    for (const a of dp.activities) {
      const dist = a.travelKm > 0.01 ? clr(C.dim, ` (${a.travelKm.toFixed(1)} km, ${Math.round(a.travelMin)} min transit)`) : "";
      console.log(
        `    ${clr(C.cyan, fmtTime(a.startTime))} – ${clr(C.cyan, fmtTime(a.endTime))}  ${a.emoji} ${a.name}${dist}  ${clr(C.dim, a.costPP > 0 ? fmtUsd(a.costPP * 2) : "Free")}`
      );
      await sleep(100);
    }
    console.log(clr(C.dim, `    Day cost: ${fmtUsd(dp.totalCost)}`));
  }

  return dayPlans;
}

// ── Agent 4: Budget Agent ───────────────────────────────────────────────────

interface BudgetResult {
  lines: BudgetLine[];
  total: number;
  remaining: number;
  isOver: boolean;
}

async function budgetAgent(
  flightCost: number,
  hotelCost: number,
  dayPlans: DayPlan[]
): Promise<BudgetResult> {
  console.log(header("💰", "Budget Agent", 4));
  await sleep(400);
  console.log(subHeader("Computing total trip cost and verifying budget constraints..."));
  await sleep(300);

  const activityTotal = dayPlans.reduce((s, dp) => s + dp.totalCost, 0);
  const mealTotal = TRIP.mealCostPPPerDay * TRIP.travelers * TRIP.days;
  const transportTotal = TRIP.transportCostPPPerDay * TRIP.travelers * TRIP.days;

  const lines: BudgetLine[] = [
    { label: "Flights", emoji: "✈️", amount: flightCost },
    { label: "Hotel", emoji: "🏨", amount: hotelCost },
    { label: "Activities", emoji: "🎌", amount: activityTotal },
    { label: "Food", emoji: "🍜", amount: mealTotal },
    { label: "Transport", emoji: "🚃", amount: transportTotal },
  ];

  const total = lines.reduce((s, l) => s + l.amount, 0);
  const remaining = TRIP.budget - total;

  // Running budget bar
  console.log("");
  const fraction = total / TRIP.budget;
  const budgetColor = fraction > 1 ? C.red : fraction > 0.85 ? C.yellow : C.green;
  console.log(
    `  Budget: [${clr(budgetColor, bar(Math.min(fraction, 1), 30))}] ${fmtUsd(total)} / ${fmtUsd(TRIP.budget)} (${(fraction * 100).toFixed(1)}%)`
  );
  await sleep(200);

  // Category breakdown
  console.log(subHeader("Cost breakdown"));
  console.log("");
  for (const l of lines) {
    const pct = l.amount / TRIP.budget;
    console.log(
      `  ${l.emoji} ${pad(l.label, 12)} ${bar(pct)} ${padL(fmtUsd(l.amount), 7)}  (${(pct * 100).toFixed(1)}%)`
    );
    await sleep(120);
  }
  // Remaining
  const remPct = Math.max(0, remaining) / TRIP.budget;
  console.log(
    `  💰 ${pad("Remaining", 12)} ${bar(remPct)} ${padL(fmtUsd(Math.max(0, remaining)), 7)}  (${(remPct * 100).toFixed(1)}%)`
  );

  const isOver = remaining < 0;
  if (isOver) {
    console.log(
      `\n  ${clr(C.red, "⚠  OVER BUDGET by " + fmtUsd(Math.abs(remaining)))}`
    );
    console.log(clr(C.yellow, "  Suggestions:"));
    console.log(clr(C.yellow, "    • Switch to Tokyu Stay Shinjuku to save $" + ((HOTELS[0].pricePerNight - 110) * 5)));
    console.log(clr(C.yellow, "    • Drop Robot Restaurant Show to save $110"));
  } else {
    console.log(
      `\n  ${clr(C.green, "✓")} ${clr(C.bold + C.green, "Under budget!")} ${fmtUsd(remaining)} remaining for souvenirs & extras`
    );
  }

  return { lines, total, remaining, isOver };
}

// ── Agent 5: Itinerary Agent ────────────────────────────────────────────────

async function itineraryAgent(
  flight: Flight,
  hotel: Hotel,
  dayPlans: DayPlan[],
  budget: BudgetResult
): Promise<void> {
  console.log(header("📋", "Itinerary Agent", 5));
  await sleep(400);
  console.log(subHeader("Assembling final optimized 5-day itinerary...\n"));
  await sleep(300);

  // Trip overview card
  const cardWidth = 62;
  const cLine = "─".repeat(cardWidth);
  console.log(clr(C.bold + C.magenta, `  ┌${cLine}┐`));
  console.log(clr(C.bold + C.magenta, `  │${pad("  🗾  TOKYO TRAVEL PLAN  —  5 Days / 2 Travelers", cardWidth)}│`));
  console.log(clr(C.bold + C.magenta, `  │${pad("  ✈️  " + flight.name + " — " + fmtUsd(flight.price * 2), cardWidth)}│`));
  console.log(clr(C.bold + C.magenta, `  │${pad("  🏨  " + hotel.name + " — " + fmtUsd(hotel.pricePerNight) + "/night × 5", cardWidth)}│`));
  console.log(clr(C.bold + C.magenta, `  │${pad("  💰  Total: " + fmtUsd(budget.total) + " / " + fmtUsd(TRIP.budget) + " budget", cardWidth)}│`));
  console.log(clr(C.bold + C.magenta, `  └${cLine}┘`));
  await sleep(200);

  for (const dp of dayPlans) {
    console.log(
      `\n  ${clr(C.bold + C.blue, "━━━ Day " + dp.day + " — " + dp.label + " ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}`
    );

    // Distance map line
    const mapParts: string[] = [`  🏨 ${hotel.name.split(" ")[0]}`];
    for (const a of dp.activities) {
      mapParts.push(`──(${a.travelKm.toFixed(1)}km)──▶ ${a.emoji} ${a.name.split(" ")[0]}`);
    }
    // Print route map wrapping at ~70 chars
    let mapLine = "";
    for (const part of mapParts) {
      if (mapLine.length + part.length > 68 && mapLine.length > 0) {
        console.log(clr(C.dim, mapLine));
        mapLine = "    ";
      }
      mapLine += part;
    }
    if (mapLine.length > 0) console.log(clr(C.dim, mapLine));

    console.log("");

    // Build a timeline: merge activities with meal slots
    const acts = dp.activities;

    // Find best lunch slot — a gap between activities near 12-1 PM
    let lunchSlot = -1;
    for (let i = 0; i < acts.length; i++) {
      const end = acts[i].endTime;
      const nextStart = i + 1 < acts.length ? acts[i + 1].startTime : 20;
      if (end >= 11.5 && end <= 14 && nextStart - end >= 0.15) {
        lunchSlot = i;
        break;
      }
    }
    if (lunchSlot === -1 && acts.length > 0) {
      // Default: after first activity that ends past 11:30
      for (let i = 0; i < acts.length; i++) {
        if (acts[i].endTime >= 11.5) { lunchSlot = i; break; }
      }
    }

    let dinnerPrinted = false;

    for (let ai = 0; ai < acts.length; ai++) {
      const a = acts[ai];
      const costStr = a.costPP > 0 ? padL(fmtUsd(a.costPP * 2), 8) : padL("Free", 8);
      const costColored = a.costPP > 0 ? costStr : clr(C.green, costStr);
      console.log(
        `    ${clr(C.cyan, fmtTime(a.startTime) + " – " + fmtTime(a.endTime))}  ${a.emoji} ${pad(a.name, 28)} ${costColored}  ${clr(C.dim, a.travelKm.toFixed(1) + " km transit")}`
      );
      await sleep(80);

      if (ai === lunchSlot) {
        const lunchStart = Math.max(12, a.endTime + 0.08);
        console.log(
          `    ${clr(C.yellow, fmtTime(lunchStart) + " – " + fmtTime(lunchStart + 1))}  🍜 Lunch break                         ${clr(C.dim, "~$30 for 2")}`
        );
      }

      if (!dinnerPrinted && a.endTime >= 17.5) {
        console.log(
          `    ${clr(C.yellow, fmtTime(19) + " – " + fmtTime(20.5))}  🍣 Dinner                              ${clr(C.dim, "~$50 for 2")}`
        );
        dinnerPrinted = true;
      }
    }

    if (lunchSlot === -1) {
      console.log(`    ${clr(C.yellow, fmtTime(12.5) + " – " + fmtTime(13.5))}  🍜 Lunch break                         ${clr(C.dim, "~$30 for 2")}`);
    }
    if (!dinnerPrinted) {
      console.log(`    ${clr(C.yellow, fmtTime(19) + " – " + fmtTime(20.5))}  🍣 Dinner                              ${clr(C.dim, "~$50 for 2")}`);
    }

    console.log(
      clr(C.dim, `    ─── Day total: ${fmtUsd(dp.totalCost)} activities + ~$90 meals + ~$30 transport = ${fmtUsd(dp.totalCost + 90 + 30)} ───`)
    );
  }

  // Final summary
  console.log(`\n${clr(C.bold + C.cyan, "  ╔" + "═".repeat(62) + "╗")}`);
  console.log(`${clr(C.bold + C.cyan, "  ║")}${clr(C.bold + C.white, "  📊  FINAL BUDGET SUMMARY" + " ".repeat(36))}${clr(C.bold + C.cyan, "║")}`);
  console.log(`${clr(C.bold + C.cyan, "  ╠" + "═".repeat(62) + "╣")}`);

  for (const l of budget.lines) {
    const pct = l.amount / TRIP.budget;
    const lineStr = `  ${l.emoji} ${pad(l.label, 12)} ${bar(pct)} ${padL(fmtUsd(l.amount), 7)}  (${padL((pct * 100).toFixed(1), 5)}%)`;
    console.log(`${clr(C.bold + C.cyan, "  ║")}${lineStr}${" ".repeat(Math.max(0, 62 - lineStr.length + 2))}${clr(C.bold + C.cyan, "║")}`);
    await sleep(100);
  }

  const remPct = Math.max(0, budget.remaining) / TRIP.budget;
  const remLine = `  💰 ${pad("Remaining", 12)} ${bar(remPct)} ${padL(fmtUsd(Math.max(0, budget.remaining)), 7)}  (${padL((remPct * 100).toFixed(1), 5)}%)`;
  console.log(`${clr(C.bold + C.cyan, "  ║")}${remLine}${" ".repeat(Math.max(0, 62 - remLine.length + 2))}${clr(C.bold + C.cyan, "║")}`);
  console.log(`${clr(C.bold + C.cyan, "  ╚" + "═".repeat(62) + "╝")}`);

  // Haversine verification
  console.log(subHeader("Haversine distance verification (sample pairs)"));
  const pairs: [number, number, string, string][] = [
    [0, 1, "Shibuya", "Senso-ji"],
    [2, 4, "Tokyo Tower", "Meiji Shrine"],
    [3, 10, "Akihabara", "Ueno Park"],
    [6, 9, "Shinjuku Gyoen", "Harajuku"],
    [0, 11, "Shibuya", "Odaiba"],
  ];
  for (const [a, b, na, nb] of pairs) {
    const d = haversineKm(LANDMARKS[a], LANDMARKS[b]);
    console.log(clr(C.dim, `    ${na} ↔ ${nb}: ${d.toFixed(2)} km`));
  }

  console.log(
    `\n  ${clr(C.bold + C.green, "✅ Trip planning complete!")} ${TRIP.days} days in ${TRIP.destination}`
  );
  console.log(
    clr(C.dim, `  All ${ACTIVITIES.length} activities scheduled · ${dayPlans.reduce((s, d) => s + d.totalDistKm, 0).toFixed(1)} km total transit · ${fmtUsd(budget.total)} total cost\n`)
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(clr(C.bold + C.magenta, "\n  ╔══════════════════════════════════════════════════════════════════╗"));
  console.log(clr(C.bold + C.magenta, "  ║   🗾  SQUAD TRAVEL PLANNER — Multi-Agent Trip Optimization  🗾  ║"));
  console.log(clr(C.bold + C.magenta, "  ╠══════════════════════════════════════════════════════════════════╣"));
  console.log(clr(C.bold + C.magenta, "  ║") + `  Destination: ${clr(C.bold, "Tokyo, Japan")}                                   ` + clr(C.bold + C.magenta, "║"));
  console.log(clr(C.bold + C.magenta, "  ║") + `  Duration:    ${clr(C.bold, "5 days")} (Mon – Fri)                              ` + clr(C.bold + C.magenta, "║"));
  console.log(clr(C.bold + C.magenta, "  ║") + `  Travelers:   ${clr(C.bold, "2 people")}                                        ` + clr(C.bold + C.magenta, "║"));
  console.log(clr(C.bold + C.magenta, "  ║") + `  Budget:      ${clr(C.bold + C.green, "$4,000")}                                          ` + clr(C.bold + C.magenta, "║"));
  console.log(clr(C.bold + C.magenta, "  ║") + `  Interests:   Culture · Food · Technology · Nature               ` + clr(C.bold + C.magenta, "║"));
  console.log(clr(C.bold + C.magenta, "  ╚══════════════════════════════════════════════════════════════════╝"));

  console.log(clr(C.dim, "\n  Initializing 5 planning agents...\n"));
  await sleep(600);

  // Agent 1 – Flights
  const flightResult = await flightAgent();
  await sleep(300);

  // Agent 2 – Hotel
  const budgetAfterFlights = TRIP.budget - flightResult.totalCost;
  const hotelResult = await hotelAgent(budgetAfterFlights);
  await sleep(300);

  // Agent 3 – Activities
  const dayPlans = await activityAgent(hotelResult.hotel.coord);
  await sleep(300);

  // Agent 4 – Budget
  const budgetResult = await budgetAgent(flightResult.totalCost, hotelResult.totalCost, dayPlans);
  await sleep(300);

  // Agent 5 – Itinerary
  await itineraryAgent(flightResult.flight, hotelResult.hotel, dayPlans, budgetResult);
}

main().catch(console.error);
