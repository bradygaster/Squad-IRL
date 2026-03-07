import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const supportsColor = stdout.isTTY && !process.env.NO_COLOR;
const C = {
  reset: supportsColor ? "\x1b[0m" : "",
  bold: supportsColor ? "\x1b[1m" : "",
  dim: supportsColor ? "\x1b[2m" : "",
  red: supportsColor ? "\x1b[31m" : "",
  green: supportsColor ? "\x1b[32m" : "",
  yellow: supportsColor ? "\x1b[33m" : "",
  blue: supportsColor ? "\x1b[34m" : "",
  magenta: supportsColor ? "\x1b[35m" : "",
  cyan: supportsColor ? "\x1b[36m" : "",
  white: supportsColor ? "\x1b[37m" : "",
};

const SEP = "-".repeat(76);

type ReadlineInterface = ReturnType<typeof createInterface>;

interface Coord {
  lat: number;
  lon: number;
}

interface DestinationResearch {
  destinationName: string;
  whyGo: string[];
  neighborhoods: { name: string; vibe: string; whyStay: string }[];
  landmarks: Landmark[];
  transit: TransitInfo;
  weather: WeatherInfo;
  phrases: Phrase[];
  safetyTips: string[];
}

interface Landmark extends Coord {
  name: string;
  category: string;
  neighborhood: string;
  visitDurationHours: number;
  estimatedCostUSD: number;
  bestTime: string;
  localTip: string;
}

interface TransitInfo {
  primaryModes: string[];
  dailyBudgetUSD: number;
  notes: string[];
  passes: string;
}

interface WeatherInfo {
  summary: string;
  seasonalNotes: string[];
  packingTips: string[];
}

interface Phrase {
  local: string;
  english: string;
  whenToUse: string;
}

interface FlightHotelResponse {
  originAssumption: string;
  flightOptions: FlightOption[];
  hotelOptions: HotelOption[];
}

interface FlightOption {
  name: string;
  pricePP: number;
  durationHours: number;
  stops: number;
  notes: string;
}

interface HotelOption extends Coord {
  name: string;
  neighborhood: string;
  nightlyRate: number;
  rating: number;
  vibe: string;
  notes: string;
}

interface ActivityRestaurantResponse {
  activities: Activity[];
  restaurants: Restaurant[];
}

interface Activity extends Coord {
  name: string;
  neighborhood: string;
  durationHours: number;
  costPP: number;
  category: string;
  opensAt: number;
  closesAt: number;
  tip: string;
}

interface Restaurant {
  name: string;
  neighborhood: string;
  cuisine: string;
  priceRange: string;
  mealType: MealType;
  costPP: number;
  tip: string;
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface DayThemeResponse {
  dayThemes: DayTheme[];
}

interface DayTheme {
  day: number;
  theme: string;
  focusNeighborhoods: string[];
  highlight: string;
}

interface ScheduledActivity extends Activity {
  startTime: number;
  endTime: number;
  travelKm: number;
  travelMin: number;
  transitHint: string;
}

interface DayPlan {
  day: number;
  label: string;
  theme: string;
  highlight: string;
  activities: ScheduledActivity[];
  meals: DailyMeals;
}

interface DailyMeals {
  breakfast: Restaurant;
  lunch: Restaurant;
  dinner: Restaurant;
  snack: Restaurant;
}

interface FlightResult {
  winner: FlightOption;
  scored: { option: FlightOption; score: number; totalCost: number }[];
}

interface HotelResult {
  winner: HotelOption;
  scored: { option: HotelOption; score: number; avgDistanceKm: number }[];
}

interface BudgetSummary {
  total: number;
  perPerson: number;
  lines: { label: string; amount: number }[];
  overage: number;
  suggestions: string[];
}

function color(code: string, text: string): string {
  return supportsColor ? `${code}${text}${C.reset}` : text;
}

function fmtUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Math.round(value)
  );
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

function fmtDurationHours(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function bar(value: number, max: number, width: number = 24): string {
  const ratio = max === 0 ? 0 : Math.min(1, value / max);
  const filled = Math.round(ratio * width);
  return "#".repeat(filled) + "-".repeat(width - filled);
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

function toNumber(value: unknown, fallback: number = 0): number {
  const num = typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toHour(value: unknown, fallback: number = 9): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/(\d{1,2})(?::(\d{2}))?/);
    if (match) {
      const hours = Number(match[1]);
      const mins = match[2] ? Number(match[2]) : 0;
      if (Number.isFinite(hours) && Number.isFinite(mins)) {
        return hours + mins / 60;
      }
    }
  }
  return fallback;
}

function haversineKm(a: Coord, b: Coord): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function travelMinutes(km: number): number {
  return (km / 30) * 60;
}

function dominantNeighborhood(activities: Activity[]): string {
  const counts = new Map<string, number>();
  for (const activity of activities) {
    counts.set(activity.neighborhood, (counts.get(activity.neighborhood) ?? 0) + 1);
  }
  let best = activities[0]?.neighborhood ?? "Downtown";
  let bestCount = 0;
  for (const [area, count] of counts.entries()) {
    if (count > bestCount) {
      best = area;
      bestCount = count;
    }
  }
  return best;
}

function nearestNeighborRoute(activities: Activity[]): Activity[] {
  if (activities.length <= 2) return [...activities];
  const remaining = [...activities];
  const route: Activity[] = [remaining.shift()!];
  while (remaining.length) {
    const last = route[route.length - 1];
    let bestIndex = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i += 1) {
      const dist = haversineKm(last, remaining[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    route.push(remaining.splice(bestIndex, 1)[0]);
  }
  return route;
}

function transitHint(
  from: Activity | null,
  to: Activity,
  transit: TransitInfo,
  travelKm: number,
  travelMin: number
): string {
  if (!from) {
    return `Start near your hotel in ${to.neighborhood}`;
  }
  if (travelKm < 1.2) {
    return `Walk about ${Math.max(8, Math.round(travelKm * 12))} min`;
  }
  const mode = transit.primaryModes[0] ?? "transit";
  return `Take ${mode} (~${Math.round(travelMin)} min)`;
}

function scheduleActivities(activities: Activity[], transit: TransitInfo): ScheduledActivity[] {
  const route = nearestNeighborRoute(activities);
  const scheduled: ScheduledActivity[] = [];
  let currentTime = 9;
  let prev: Activity | null = null;
  for (const activity of route) {
    const travelKm = prev ? haversineKm(prev, activity) : 0;
    const travelMin = prev ? Math.round(travelMinutes(travelKm)) : 0;
    const travelHours = travelMin / 60;
    let startTime = Math.max(currentTime + travelHours, activity.opensAt);
    if (startTime + activity.durationHours > activity.closesAt) {
      startTime = Math.max(activity.opensAt, activity.closesAt - activity.durationHours);
    }
    const endTime = startTime + activity.durationHours;
    scheduled.push({
      ...activity,
      startTime,
      endTime,
      travelKm,
      travelMin,
      transitHint: transitHint(prev, activity, transit, travelKm, travelMin),
    });
    currentTime = endTime;
    prev = activity;
  }
  return scheduled;
}

function parseInterests(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
}

async function askText(rl: ReadlineInterface, prompt: string): Promise<string> {
  while (true) {
    const answer = (await rl.question(color(C.cyan, prompt))).trim();
    if (answer.length > 0) return answer;
    console.log(color(C.red, "Please enter a response."));
  }
}

async function askNumber(rl: ReadlineInterface, prompt: string): Promise<number> {
  while (true) {
    const answer = (await rl.question(color(C.cyan, prompt))).trim();
    const parsed = toNumber(answer);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    console.log(color(C.red, "Please enter a valid number."));
  }
}

async function llmCall(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "api-key": apiKey,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned an empty response.");
  }
  return content;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in LLM response.");
  }
  return candidate.slice(start, end + 1);
}

async function llmJson<T>(label: string, systemPrompt: string, userPrompt: string): Promise<T> {
  const response = await llmCall(systemPrompt, userPrompt);
  try {
    return JSON.parse(extractJson(response)) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} JSON parse failed: ${message}`);
  }
}

function normalizeResearch(raw: DestinationResearch): DestinationResearch {
  return {
    ...raw,
    landmarks: (raw.landmarks ?? []).map((landmark) => ({
      ...landmark,
      lat: toNumber(landmark.lat),
      lon: toNumber(landmark.lon),
      visitDurationHours: toNumber(landmark.visitDurationHours, 1.5),
      estimatedCostUSD: toNumber(landmark.estimatedCostUSD),
    })),
    transit: {
      ...raw.transit,
      primaryModes: raw.transit?.primaryModes ?? [],
      dailyBudgetUSD: toNumber(raw.transit?.dailyBudgetUSD, 12),
      notes: raw.transit?.notes ?? [],
      passes: raw.transit?.passes ?? "Consider a multi-day transit pass if available.",
    },
    weather: {
      ...raw.weather,
      seasonalNotes: raw.weather?.seasonalNotes ?? [],
      packingTips: raw.weather?.packingTips ?? [],
    },
    phrases: raw.phrases ?? [],
    safetyTips: raw.safetyTips ?? [],
  };
}

function normalizeFlightsHotels(raw: FlightHotelResponse): FlightHotelResponse {
  return {
    ...raw,
    flightOptions: (raw.flightOptions ?? []).map((flight) => ({
      ...flight,
      pricePP: toNumber(flight.pricePP),
      durationHours: toNumber(flight.durationHours, 8),
      stops: Math.max(0, Math.round(toNumber(flight.stops, 0))),
    })),
    hotelOptions: (raw.hotelOptions ?? []).map((hotel) => ({
      ...hotel,
      nightlyRate: toNumber(hotel.nightlyRate),
      rating: toNumber(hotel.rating, 4),
      lat: toNumber(hotel.lat),
      lon: toNumber(hotel.lon),
    })),
  };
}

function normalizeActivitiesRestaurants(raw: ActivityRestaurantResponse): ActivityRestaurantResponse {
  return {
    ...raw,
    activities: (raw.activities ?? []).map((activity) => ({
      ...activity,
      lat: toNumber(activity.lat),
      lon: toNumber(activity.lon),
      durationHours: toNumber(activity.durationHours, 1.5),
      costPP: toNumber(activity.costPP),
      opensAt: toHour(activity.opensAt, 9),
      closesAt: toHour(activity.closesAt, 18),
    })),
    restaurants: (raw.restaurants ?? []).map((restaurant) => ({
      ...restaurant,
      costPP: toNumber(restaurant.costPP, 18),
    })),
  };
}

function buildDayLabels(days: number): string[] {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    labels.push(`Day ${i + 1} — ${weekday}`);
  }
  return labels;
}

async function flightAgent(options: FlightOption[], travelers: number): Promise<FlightResult> {
  console.log(color(C.bold + C.cyan, `\n${SEP}\nAgent 1: Flight Agent\n${SEP}`));
  const flights = options.filter((option) => option.pricePP > 0);
  if (flights.length === 0) {
    throw new Error("No flight options were returned by the LLM.");
  }
  const prices = flights.map((flight) => flight.pricePP);
  const durations = flights.map((flight) => flight.durationHours);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDur = Math.min(...durations);
  const maxDur = Math.max(...durations);

  const scored = flights.map((flight) => {
    const priceScore = 100 - normalize(flight.pricePP, minPrice, maxPrice);
    const durationScore = 100 - normalize(flight.durationHours, minDur, maxDur);
    const stopPenalty = flight.stops * 15;
    const totalScore = priceScore * 0.45 + durationScore * 0.35 - stopPenalty + 10;
    return {
      option: flight,
      score: Math.round(totalScore),
      totalCost: flight.pricePP * travelers,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0].option;

  console.log(color(C.dim, "Scoring flights by price, duration, and stops."));
  for (const entry of scored) {
    console.log(
      `  ${entry.option.name} | ${fmtUsd(entry.option.pricePP)} pp | ${fmtDurationHours(
        entry.option.durationHours
      )} | stops ${entry.option.stops} | score ${entry.score}`
    );
  }
  console.log(color(C.green, `Selected: ${winner.name} (${fmtUsd(winner.pricePP)} pp).`));
  return { winner, scored };
}

async function hotelAgent(options: HotelOption[], landmarks: Landmark[]): Promise<HotelResult> {
  console.log(color(C.bold + C.cyan, `\n${SEP}\nAgent 2: Hotel Agent\n${SEP}`));
  const hotels = options.filter((option) => option.nightlyRate > 0);
  if (hotels.length === 0) {
    throw new Error("No hotel options were returned by the LLM.");
  }
  const focusLandmarks = landmarks.slice(0, 5);
  const rates = hotels.map((hotel) => hotel.nightlyRate);
  const ratings = hotels.map((hotel) => hotel.rating);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  const scored = hotels.map((hotel) => {
    const distances = focusLandmarks.map((landmark) => haversineKm(hotel, landmark));
    const avgDistance = distances.reduce((sum, value) => sum + value, 0) / Math.max(1, distances.length);
    const priceScore = 100 - normalize(hotel.nightlyRate, minRate, maxRate);
    const ratingScore = normalize(hotel.rating, minRating, maxRating);
    const proximityScore = 100 - normalize(avgDistance, 0, Math.max(...distances, 1));
    const totalScore = priceScore * 0.4 + ratingScore * 0.3 + proximityScore * 0.3;
    return {
      option: hotel,
      score: Math.round(totalScore),
      avgDistanceKm: avgDistance,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0].option;
  for (const entry of scored) {
    console.log(
      `  ${entry.option.name} | ${entry.option.neighborhood} | ${fmtUsd(entry.option.nightlyRate)} nightly | ${
        entry.option.rating
      }★ | avg ${entry.avgDistanceKm.toFixed(1)} km`
    );
  }
  console.log(color(C.green, `Selected: ${winner.name} in ${winner.neighborhood}.`));
  return { winner, scored };
}

function scoreActivity(activity: Activity, interests: string[]): number {
  if (interests.length === 0) return 1;
  const category = activity.category.toLowerCase();
  const match = interests.some((interest) => category.includes(interest) || interest.includes(category));
  return match ? 3 : 1;
}

function clusterActivities(activities: Activity[], days: number, interests: string[]): Activity[][] {
  const scored = activities
    .map((activity) => ({ activity, score: scoreActivity(activity, interests) }))
    .sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, Math.max(days * 3, days + 2)).map((entry) => entry.activity);
  const remaining = [...selected];
  const clusters: Activity[][] = [];
  for (let i = 0; i < days; i += 1) {
    if (remaining.length === 0) break;
    const seed = remaining.shift()!;
    const cluster = [seed];
    while (cluster.length < 3 && remaining.length > 0) {
      let bestIndex = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let j = 0; j < remaining.length; j += 1) {
        const dist = haversineKm(seed, remaining[j]);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = j;
        }
      }
      cluster.push(remaining.splice(bestIndex, 1)[0]);
    }
    clusters.push(cluster);
  }
  return clusters;
}

function pickRestaurants(restaurants: Restaurant[], mealType: MealType, neighborhoods: string[], dayIndex: number): Restaurant {
  const options = restaurants.filter(
    (restaurant) => restaurant.mealType === mealType && neighborhoods.includes(restaurant.neighborhood)
  );
  const fallback = restaurants.filter((restaurant) => restaurant.mealType === mealType);
  const list = options.length > 0 ? options : fallback;
  if (list.length > 0) {
    return list[dayIndex % list.length];
  }
  return {
    name: "Local recommendation",
    neighborhood: neighborhoods[0] ?? "Central",
    cuisine: "Local",
    priceRange: "$$",
    mealType,
    costPP: 18,
    tip: "Ask your hotel for a nearby favorite.",
  };
}

function buildDayPlans(
  activities: Activity[],
  dayThemes: DayTheme[],
  dayLabels: string[],
  transit: TransitInfo,
  restaurants: Restaurant[],
  interests: string[]
): DayPlan[] {
  const clusters = clusterActivities(activities, dayThemes.length, interests);
  return dayThemes.map((theme, index) => {
    const dailyActivities = clusters[index] ?? clusters[index % Math.max(1, clusters.length)] ?? [];
    const scheduled = scheduleActivities(dailyActivities, transit);
    const neighborhoods = theme.focusNeighborhoods.length > 0 ? theme.focusNeighborhoods : [dominantNeighborhood(dailyActivities)];
    const meals: DailyMeals = {
      breakfast: pickRestaurants(restaurants, "breakfast", neighborhoods, index),
      lunch: pickRestaurants(restaurants, "lunch", neighborhoods, index),
      dinner: pickRestaurants(restaurants, "dinner", neighborhoods, index),
      snack: pickRestaurants(restaurants, "snack", neighborhoods, index),
    };
    return {
      day: theme.day,
      label: dayLabels[index] ?? `Day ${index + 1}`,
      theme: theme.theme,
      highlight: theme.highlight,
      activities: scheduled,
      meals,
    };
  });
}

function budgetAgent(
  travelers: number,
  days: number,
  flight: FlightOption,
  hotel: HotelOption,
  dayPlans: DayPlan[],
  transit: TransitInfo
): BudgetSummary {
  const flightTotal = flight.pricePP * travelers;
  const hotelTotal = hotel.nightlyRate * days;
  const activityTotal = dayPlans.reduce(
    (sum, day) => sum + day.activities.reduce((inner, activity) => inner + activity.costPP, 0) * travelers,
    0
  );
  const mealTotal = dayPlans.reduce((sum, day) => {
    const meals = [day.meals.breakfast, day.meals.lunch, day.meals.dinner, day.meals.snack];
    return sum + meals.reduce((inner, meal) => inner + meal.costPP, 0) * travelers;
  }, 0);
  const transitTotal = transit.dailyBudgetUSD * days * travelers;
  const total = flightTotal + hotelTotal + activityTotal + mealTotal + transitTotal;
  const lines = [
    { label: "Flights", amount: flightTotal },
    { label: "Hotel", amount: hotelTotal },
    { label: "Activities", amount: activityTotal },
    { label: "Meals", amount: mealTotal },
    { label: "Transit", amount: transitTotal },
  ];
  const suggestions: string[] = [];
  const perPerson = total / Math.max(1, travelers);
  return { total, perPerson, lines, overage: 0, suggestions };
}

function finalizeBudget(budget: BudgetSummary, budgetLimit: number): BudgetSummary {
  const overage = budget.total - budgetLimit;
  const suggestions = [...budget.suggestions];
  if (overage > 0) {
    suggestions.push("Shift to a mid-range hotel or trim one paid activity.");
    suggestions.push("Swap one dinner out for a market or casual spot.");
    suggestions.push("Use multi-day transit passes where available.");
  } else {
    suggestions.push("Budget has room for a special splurge or a premium upgrade.");
  }
  return { ...budget, overage, suggestions };
}

function printBudget(budget: BudgetSummary, budgetLimit: number): void {
  console.log(color(C.bold + C.cyan, `\n${SEP}\nAgent 4: Budget Agent\n${SEP}`));
  const maxLine = Math.max(...budget.lines.map((line) => line.amount), budgetLimit);
  for (const line of budget.lines) {
    console.log(
      `  ${line.label.padEnd(12)} ${fmtUsd(line.amount).padStart(10)}  ${bar(line.amount, maxLine)}`
    );
  }
  console.log(`  Total        ${fmtUsd(budget.total).padStart(10)}`);
  const statusColor = budget.overage > 0 ? C.red : C.green;
  const statusLabel = budget.overage > 0 ? `Over by ${fmtUsd(budget.overage)}` : "Within budget";
  console.log(color(statusColor, `  Status: ${statusLabel}`));
  for (const suggestion of budget.suggestions) {
    console.log(color(C.dim, `  Tip: ${suggestion}`));
  }
}

function printItinerary(
  destination: DestinationResearch,
  dayPlans: DayPlan[],
  budget: BudgetSummary,
  budgetLimit: number
): void {
  console.log(color(C.bold + C.green, `\nWhy ${destination.destinationName}?`));
  for (const line of destination.whyGo) {
    console.log(`  • ${line}`);
  }
  console.log(`\n${SEP}`);
  console.log(color(C.bold + C.white, "Weather guidance"));
  console.log(`  ${destination.weather.summary}`);
  for (const note of destination.weather.seasonalNotes) {
    console.log(`  • ${note}`);
  }
  if (destination.weather.packingTips.length > 0) {
    console.log(color(C.dim, `  Packing: ${destination.weather.packingTips.join("; ")}`));
  }

  console.log(color(C.bold + C.cyan, `\n${SEP}\nAgent 5: Itinerary Agent\n${SEP}`));
  for (const day of dayPlans) {
    console.log(color(C.bold + C.white, `\n${day.label}`));
    console.log(color(C.dim, `Theme: ${day.theme}`));
    if (day.activities.length === 0) {
      console.log(color(C.dim, "  No scheduled activities returned for this day."));
      continue;
    }
    const sections: { label: string; items: ScheduledActivity[] }[] = [
      { label: "Morning", items: day.activities.filter((activity) => activity.startTime < 12) },
      { label: "Afternoon", items: day.activities.filter((activity) => activity.startTime >= 12 && activity.startTime < 17) },
      { label: "Evening", items: day.activities.filter((activity) => activity.startTime >= 17) },
    ];
    for (const section of sections) {
      if (section.items.length === 0) continue;
      console.log(color(C.bold + C.yellow, `  ${section.label}`));
      for (const activity of section.items) {
        console.log(
          `    ${fmtTime(activity.startTime)} – ${fmtTime(activity.endTime)} | ${activity.name} (${activity.neighborhood})`
        );
        console.log(`      Cost: ${fmtUsd(activity.costPP)} pp | ${activity.transitHint}`);
        console.log(color(C.dim, `      Local tip: ${activity.tip}`));
      }
    }
    console.log(color(C.bold + C.yellow, "  Meals"));
    console.log(
      `    Breakfast: ${day.meals.breakfast.name} (${day.meals.breakfast.cuisine}, ${day.meals.breakfast.priceRange})`
    );
    console.log(`      Tip: ${day.meals.breakfast.tip}`);
    console.log(`    Lunch: ${day.meals.lunch.name} (${day.meals.lunch.cuisine}, ${day.meals.lunch.priceRange})`);
    console.log(`      Tip: ${day.meals.lunch.tip}`);
    console.log(`    Dinner: ${day.meals.dinner.name} (${day.meals.dinner.cuisine}, ${day.meals.dinner.priceRange})`);
    console.log(`      Tip: ${day.meals.dinner.tip}`);
    console.log(`    Snack: ${day.meals.snack.name} (${day.meals.snack.cuisine}, ${day.meals.snack.priceRange})`);
    console.log(`      Tip: ${day.meals.snack.tip}`);
    console.log(color(C.dim, `  Don't miss: ${day.highlight}`));
  }

  console.log(color(C.bold + C.white, `\nTrip highlights`));
  for (const day of dayPlans) {
    console.log(`  • ${day.highlight}`);
  }

  console.log(color(C.bold + C.white, `\nUseful local phrases`));
  for (const phrase of destination.phrases) {
    console.log(`  • ${phrase.local} — ${phrase.english} (${phrase.whenToUse})`);
  }

  const budgetStatus = budget.total > budgetLimit ? `Over by ${fmtUsd(budget.total - budgetLimit)}` : "On target";
  console.log(color(C.bold + C.white, `\nBudget snapshot: ${fmtUsd(budget.total)} total (${budgetStatus})`));
}

async function main(): Promise<void> {
  console.log(color(C.bold + C.white, "Interactive Travel Planner"));
  console.log(color(C.dim, "Answer a few prompts to build a custom itinerary."));

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const destination = await askText(rl, "Where are you going? ");
    const days = Math.round(await askNumber(rl, "How many days? "));
    const travelers = Math.round(await askNumber(rl, "How many travelers? "));
    const budget = await askNumber(rl, "What's your budget? ");
    const interestsRaw = await askText(rl, "What are your interests? ");
    const interests = parseInterests(interestsRaw);

    if (!process.env.OPENAI_API_KEY) {
      console.log(
        "Set OPENAI_API_KEY to use this planner. Works with OpenAI, Azure OpenAI, Ollama, or any OpenAI-compatible endpoint."
      );
      return;
    }

    console.log(color(C.dim, `\nPlanning ${days} days in ${destination} for ${travelers} traveler(s).`));

    const systemPrompt = "You are a meticulous travel planner. Return JSON only.";

    const researchRaw = await llmJson<DestinationResearch>(
      "Destination research",
      systemPrompt,
      `Destination: ${destination}\nTrip length: ${days} days\nTravelers: ${travelers}\nBudget: ${fmtUsd(
        budget
      )}\nInterests: ${interests.join(", ") || "open to anything"}\n\nReturn JSON with:\n{\n  "destinationName": "...",\n  "whyGo": ["..."],\n  "neighborhoods": [{"name": "...", "vibe": "...", "whyStay": "..."}],\n  "landmarks": [{"name": "...", "lat": 0, "lon": 0, "category": "culture|food|nature|history|relaxation", "neighborhood": "...", "visitDurationHours": 1.5, "estimatedCostUSD": 12, "bestTime": "morning|afternoon|evening", "localTip": "..."}],\n  "transit": {"primaryModes": ["metro", "bus", "walk"], "dailyBudgetUSD": 12, "notes": ["..."], "passes": "..."},\n  "weather": {"summary": "...", "seasonalNotes": ["..."], "packingTips": ["..."]},\n  "phrases": [{"local": "...", "english": "...", "whenToUse": "..."}],\n  "safetyTips": ["..."]\n}\nRules: 6-10 landmarks, coordinates as decimal degrees, costs in USD numbers, hours in 24h, JSON only.`
    );
    const research = normalizeResearch(researchRaw);

    const flightsHotelsRaw = await llmJson<FlightHotelResponse>(
      "Flights & hotels",
      systemPrompt,
      `Destination: ${research.destinationName}\nTrip length: ${days} days\nTravelers: ${travelers}\nBudget: ${fmtUsd(
        budget
      )}\nInterests: ${interests.join(", ") || "open"}\n\nReturn JSON with:\n{\n  "originAssumption": "...",\n  "flightOptions": [{"name": "...", "pricePP": 950, "durationHours": 11.5, "stops": 1, "notes": "..."}],\n  "hotelOptions": [{"name": "...", "neighborhood": "...", "nightlyRate": 180, "rating": 4.3, "lat": 0, "lon": 0, "vibe": "...", "notes": "..."}]\n}\nRules: 4-6 flight options, 5-8 hotels, costs in USD, JSON only.`
    );
    const flightsHotels = normalizeFlightsHotels(flightsHotelsRaw);

    const activitiesRestaurantsRaw = await llmJson<ActivityRestaurantResponse>(
      "Activities & restaurants",
      systemPrompt,
      `Destination: ${research.destinationName}\nTrip length: ${days} days\nInterests: ${interests.join(
        ", "
      )}\n\nReturn JSON with:\n{\n  "activities": [{"name": "...", "neighborhood": "...", "lat": 0, "lon": 0, "durationHours": 2, "costPP": 15, "category": "food|culture|nature|history|relaxation", "opensAt": 9, "closesAt": 18, "tip": "..."}],\n  "restaurants": [{"name": "...", "neighborhood": "...", "cuisine": "...", "priceRange": "$$","mealType": "breakfast|lunch|dinner|snack", "costPP": 18, "tip": "..."}]\n}\nRules: 10-14 activities, 12-18 restaurants, mix of meal types, hours in 24h, JSON only.`
    );
    const activitiesRestaurants = normalizeActivitiesRestaurants(activitiesRestaurantsRaw);

    const activitySummary = activitiesRestaurants.activities.slice(0, 16).map((activity) => ({
      name: activity.name,
      neighborhood: activity.neighborhood,
      lat: activity.lat,
      lon: activity.lon,
    }));

    const dayThemesRaw = await llmJson<DayThemeResponse>(
      "Day themes",
      systemPrompt,
      `Destination: ${research.destinationName}\nTrip length: ${days} days\nActivities summary: ${JSON.stringify(
        activitySummary
      )}\n\nReturn JSON with:\n{\n  "dayThemes": [{"day": 1, "theme": "...", "focusNeighborhoods": ["..."], "highlight": "..."}]\n}\nRules: Provide exactly ${days} entries, 1-indexed, themes based on geographic clustering, JSON only.`
    );
    const dayThemes = dayThemesRaw.dayThemes ?? [];
    if (dayThemes.length === 0) {
      throw new Error("No day themes were returned by the LLM.");
    }

    const flightResult = await flightAgent(flightsHotels.flightOptions, travelers);
    const hotelResult = await hotelAgent(flightsHotels.hotelOptions, research.landmarks);

    console.log(color(C.bold + C.cyan, `\n${SEP}\nAgent 3: Activity Agent\n${SEP}`));
    const dayLabels = buildDayLabels(days);
    const dayPlans = buildDayPlans(
      activitiesRestaurants.activities,
      dayThemes,
      dayLabels,
      research.transit,
      activitiesRestaurants.restaurants,
      interests
    );
    for (const plan of dayPlans) {
      const area = dominantNeighborhood(plan.activities);
      console.log(`  ${plan.label}: ${plan.theme} (focus: ${area})`);
    }

    const budgetBase = budgetAgent(travelers, days, flightResult.winner, hotelResult.winner, dayPlans, research.transit);
    const budgetSummary = finalizeBudget(budgetBase, budget);
    printBudget(budgetSummary, budget);

    printItinerary(research, dayPlans, budgetSummary, budget);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(color(C.red, `\n[ERR] ${message}`));
  console.error(
    "If an LLM call failed, verify OPENAI_API_KEY, OPENAI_BASE_URL, and OPENAI_MODEL. For Ollama, try OPENAI_BASE_URL=http://localhost:11434/v1."
  );
  process.exitCode = 1;
});
