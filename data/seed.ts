// Realistic fake data for the Henrico County Recreation & Parks demo.
// Nothing here is real: names, emails, and transaction history are
// synthetically generated with a seeded RNG so the data is stable
// across runs and deploys.

import type {
  Facility,
  Program,
  MembershipTier,
  Member,
  Transaction,
  ReservableSpace,
} from "./types";

// ---------------------------------------------------------------------------
// Seeded RNG (mulberry32) so demo data is identical on every run/deploy.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(19620701); // Henrico County founded 1611... arbitrary fixed seed

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// "Today" for the demo is fixed so seed data reads consistently regardless
// of when the demo is actually run.
const TODAY = "2026-09-26";

// ---------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------
export const facilities: Facility[] = [
  {
    id: "fac-tuckahoe",
    name: "Tuckahoe Park",
    address: "8200 Tuckahoe Creek Pkwy",
    city: "Henrico",
    zip: "23229",
    description:
      "A community park with athletic fields, walking trails, and a fitness room used for adult and youth programming.",
    amenities: ["Walking trail", "Athletic fields", "Fitness room", "Picnic shelters"],
  },
  {
    id: "fac-deeprun",
    name: "Deep Run Park",
    address: "9900 Ridgefield Pkwy",
    city: "Henrico",
    zip: "23233",
    description:
      "Large multi-use park with a recreation center offering fitness, art, and youth sports programs year-round.",
    amenities: ["Recreation center", "Gymnasium", "Art studio", "Playground", "Disc golf"],
  },
  {
    id: "fac-dorey",
    name: "Dorey Park",
    address: "2999 Darbytown Rd",
    city: "Henrico",
    zip: "23231",
    description:
      "Eastern Henrico's largest park, home to sports leagues, a dog park, and senior wellness programming.",
    amenities: ["Sports complex", "Dog park", "Senior center", "Trails"],
  },
  {
    id: "fac-belmont",
    name: "Belmont Rec Center",
    address: "1600 Hilliard Rd",
    city: "Henrico",
    zip: "23228",
    description:
      "Indoor recreation center with a gymnasium and multipurpose rooms for fitness classes and youth programs.",
    amenities: ["Gymnasium", "Multipurpose rooms", "Weight room"],
  },
  {
    id: "fac-hiddencreek",
    name: "Hidden Creek",
    address: "6300 Springfield Rd",
    city: "Glen Allen",
    zip: "23060",
    description:
      "Neighborhood recreation center focused on youth sports, art classes, and senior wellness.",
    amenities: ["Multipurpose rooms", "Outdoor courts", "Art studio"],
  },
];

// ---------------------------------------------------------------------------
// Reservable spaces: picnic shelters, multipurpose rooms, and a pavilion,
// across the 5 parks. Attachment J §11 (Facility and Shelters).
// ---------------------------------------------------------------------------
export const reservableSpaces: ReservableSpace[] = [
  {
    id: "space-01",
    facilityId: "fac-tuckahoe",
    name: "Tuckahoe Picnic Shelter A",
    type: "picnic-shelter",
    capacity: 50,
    hourlyRateCents: 2500,
    amenities: ["Grill", "Picnic tables", "Parking nearby"],
    description:
      "A shaded picnic shelter near the walking trail, popular for birthday parties and family gatherings.",
  },
  {
    id: "space-02",
    facilityId: "fac-deeprun",
    name: "Deep Run Picnic Shelter",
    type: "picnic-shelter",
    capacity: 75,
    hourlyRateCents: 3000,
    amenities: ["Grill", "Picnic tables", "Electrical outlets"],
    description:
      "A large shelter adjacent to the playground, with power for music or catering equipment.",
  },
  {
    id: "space-03",
    facilityId: "fac-deeprun",
    name: "Deep Run Multipurpose Room",
    type: "multipurpose-room",
    capacity: 40,
    hourlyRateCents: 4000,
    amenities: ["Tables & chairs", "Electrical outlets", "AV equipment"],
    description:
      "An indoor room inside the recreation center, suitable for meetings, classes, or small receptions.",
  },
  {
    id: "space-04",
    facilityId: "fac-dorey",
    name: "Dorey Park Pavilion",
    type: "pavilion",
    capacity: 150,
    hourlyRateCents: 6000,
    amenities: ["Grill", "Picnic tables", "Electrical outlets", "Restrooms nearby"],
    description:
      "The largest reservable space in the county park system, ideal for community events and large gatherings.",
  },
  {
    id: "space-05",
    facilityId: "fac-dorey",
    name: "Dorey Picnic Shelter B",
    type: "picnic-shelter",
    capacity: 60,
    hourlyRateCents: 2500,
    amenities: ["Grill", "Picnic tables"],
    description: "A quieter shelter near the dog park, a short walk from parking.",
  },
  {
    id: "space-06",
    facilityId: "fac-belmont",
    name: "Belmont Multipurpose Room",
    type: "multipurpose-room",
    capacity: 30,
    hourlyRateCents: 3500,
    amenities: ["Tables & chairs", "Electrical outlets"],
    description:
      "A flexible indoor room at Belmont Rec Center for meetings, workshops, or small parties.",
  },
  {
    id: "space-07",
    facilityId: "fac-hiddencreek",
    name: "Hidden Creek Picnic Shelter",
    type: "picnic-shelter",
    capacity: 40,
    hourlyRateCents: 2000,
    amenities: ["Grill", "Picnic tables"],
    description: "A cozy neighborhood shelter, well suited for smaller gatherings.",
  },
];

// ---------------------------------------------------------------------------
// Programs (~20 classes across categories)
// ---------------------------------------------------------------------------
export const programs: Program[] = [
  {
    id: "prog-01",
    facilityId: "fac-deeprun",
    name: "Morning Vinyasa Yoga",
    category: "yoga",
    description: "A flowing, breath-linked yoga practice suitable for all levels.",
    instructor: "Maria Gonzalez",
    schedule: "Mon, Wed & Fri, 7:00–8:00 AM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 24,
    enrolled: 19,
    priceCents: 8500,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-02",
    facilityId: "fac-belmont",
    name: "Total Body Strength",
    category: "fitness",
    description: "Circuit-style strength training using free weights and resistance bands.",
    instructor: "Devon Marsh",
    schedule: "Tue & Thu, 6:00–7:00 PM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 20,
    enrolled: 20,
    priceCents: 9500,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-03",
    facilityId: "fac-tuckahoe",
    name: "Youth Soccer Skills (U8)",
    category: "youth-sports",
    description: "Fundamentals of dribbling, passing, and teamwork for young players.",
    instructor: "Coach Alan Whitfield",
    schedule: "Saturdays, 9:00–10:00 AM",
    startDate: "2026-09-12",
    endDate: "2026-10-31",
    capacity: 16,
    enrolled: 14,
    priceCents: 6000,
    ageRange: "Ages 6–8",
  },
  {
    id: "prog-04",
    facilityId: "fac-hiddencreek",
    name: "Watercolor Painting Basics",
    category: "art",
    description: "Introductory watercolor techniques: washes, blending, and composition.",
    instructor: "Priya Natarajan",
    schedule: "Wednesdays, 1:00–3:00 PM",
    startDate: "2026-09-09",
    endDate: "2026-11-11",
    capacity: 14,
    enrolled: 9,
    priceCents: 7500,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-05",
    facilityId: "fac-dorey",
    name: "Chair Yoga for Seniors",
    category: "senior-wellness",
    description: "Gentle, low-impact yoga performed seated or with chair support.",
    instructor: "Maria Gonzalez",
    schedule: "Tue & Thu, 10:00–11:00 AM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 18,
    enrolled: 16,
    priceCents: 5000,
    ageRange: "Ages 60+",
  },
  {
    id: "prog-06",
    facilityId: "fac-deeprun",
    name: "Youth Basketball League (U10)",
    category: "youth-sports",
    description: "Recreational league play with practices and weekend games.",
    instructor: "Coach Renee Fisk",
    schedule: "Mon & Wed practice, Sat games",
    startDate: "2026-09-14",
    endDate: "2026-11-21",
    capacity: 30,
    enrolled: 27,
    priceCents: 8000,
    ageRange: "Ages 9–10",
  },
  {
    id: "prog-07",
    facilityId: "fac-belmont",
    name: "Zumba Gold",
    category: "fitness",
    description: "Lower-intensity dance fitness set to Latin and world rhythms.",
    instructor: "Camille Robert",
    schedule: "Mon & Fri, 9:30–10:30 AM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 25,
    enrolled: 21,
    priceCents: 6500,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-08",
    facilityId: "fac-hiddencreek",
    name: "Youth Art Explorers",
    category: "art",
    description: "Drawing, painting, and sculpture projects for young artists.",
    instructor: "Priya Natarajan",
    schedule: "Saturdays, 10:00 AM–12:00 PM",
    startDate: "2026-09-12",
    endDate: "2026-11-14",
    capacity: 16,
    enrolled: 11,
    priceCents: 7000,
    ageRange: "Ages 7–12",
  },
  {
    id: "prog-09",
    facilityId: "fac-tuckahoe",
    name: "Beginner Pilates Mat",
    category: "fitness",
    description: "Core-focused mat Pilates for beginners, no equipment required.",
    instructor: "Devon Marsh",
    schedule: "Tue & Thu, 5:30–6:15 PM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 18,
    enrolled: 12,
    priceCents: 8000,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-10",
    facilityId: "fac-dorey",
    name: "Senior Strength & Balance",
    category: "senior-wellness",
    description: "Functional strength and fall-prevention balance training.",
    instructor: "Camille Robert",
    schedule: "Mon, Wed & Fri, 8:30–9:15 AM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 20,
    enrolled: 18,
    priceCents: 5500,
    ageRange: "Ages 60+",
  },
  {
    id: "prog-11",
    facilityId: "fac-deeprun",
    name: "Intro to Pottery",
    category: "art",
    description: "Hand-building and wheel-throwing basics with studio firing included.",
    instructor: "Priya Natarajan",
    schedule: "Thursdays, 6:00–8:00 PM",
    startDate: "2026-09-10",
    endDate: "2026-11-12",
    capacity: 12,
    enrolled: 12,
    priceCents: 11000,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-12",
    facilityId: "fac-belmont",
    name: "Youth Flag Football (U12)",
    category: "youth-sports",
    description: "Non-contact football fundamentals with weekly games.",
    instructor: "Coach Alan Whitfield",
    schedule: "Tue practice, Sat games",
    startDate: "2026-09-15",
    endDate: "2026-11-22",
    capacity: 24,
    enrolled: 20,
    priceCents: 7000,
    ageRange: "Ages 11–12",
  },
  {
    id: "prog-13",
    facilityId: "fac-hiddencreek",
    name: "Gentle Flow Yoga",
    category: "yoga",
    description: "Slow-paced yoga emphasizing stretching and relaxation.",
    instructor: "Maria Gonzalez",
    schedule: "Wednesdays, 6:30–7:30 PM",
    startDate: "2026-09-09",
    endDate: "2026-11-11",
    capacity: 20,
    enrolled: 13,
    priceCents: 7000,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-14",
    facilityId: "fac-tuckahoe",
    name: "HIIT Bootcamp",
    category: "fitness",
    description: "High-intensity interval training combining cardio and strength.",
    instructor: "Renee Fisk",
    schedule: "Mon, Wed & Fri, 6:00–6:45 AM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 22,
    enrolled: 22,
    priceCents: 9000,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-15",
    facilityId: "fac-dorey",
    name: "Youth Volleyball Clinic",
    category: "youth-sports",
    description: "Serving, passing, and setting fundamentals in a clinic format.",
    instructor: "Coach Renee Fisk",
    schedule: "Saturdays, 11:00 AM–12:30 PM",
    startDate: "2026-09-12",
    endDate: "2026-10-24",
    capacity: 16,
    enrolled: 10,
    priceCents: 6500,
    ageRange: "Ages 10–13",
  },
  {
    id: "prog-16",
    facilityId: "fac-deeprun",
    name: "Senior Tai Chi",
    category: "senior-wellness",
    description: "Slow, meditative movement practice for balance and flexibility.",
    instructor: "Camille Robert",
    schedule: "Tue & Thu, 9:00–10:00 AM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 20,
    enrolled: 15,
    priceCents: 5000,
    ageRange: "Ages 60+",
  },
  {
    id: "prog-17",
    facilityId: "fac-belmont",
    name: "Adult Beginner Ceramics",
    category: "art",
    description: "Hand-building techniques and glazing for first-time potters.",
    instructor: "Priya Natarajan",
    schedule: "Mondays, 6:30–8:30 PM",
    startDate: "2026-09-14",
    endDate: "2026-11-16",
    capacity: 12,
    enrolled: 8,
    priceCents: 10500,
    ageRange: "Adults 18+",
  },
  {
    id: "prog-18",
    facilityId: "fac-hiddencreek",
    name: "Youth Tumbling & Gymnastics",
    category: "youth-sports",
    description: "Introductory tumbling skills, balance, and body control.",
    instructor: "Coach Alan Whitfield",
    schedule: "Fridays, 5:00–6:00 PM",
    startDate: "2026-09-11",
    endDate: "2026-11-13",
    capacity: 14,
    enrolled: 14,
    priceCents: 7000,
    ageRange: "Ages 5–9",
  },
  {
    id: "prog-19",
    facilityId: "fac-tuckahoe",
    name: "Low-Impact Water Aerobics",
    category: "senior-wellness",
    description: "Pool-based cardio and toning class, joint-friendly.",
    instructor: "Devon Marsh",
    schedule: "Mon, Wed & Fri, 10:00–10:45 AM",
    startDate: "2026-09-08",
    endDate: "2026-11-13",
    capacity: 20,
    enrolled: 17,
    priceCents: 6000,
    ageRange: "Ages 55+",
  },
  {
    id: "prog-20",
    facilityId: "fac-dorey",
    name: "Power Yoga",
    category: "yoga",
    description: "A more vigorous, strength-building yoga practice.",
    instructor: "Maria Gonzalez",
    schedule: "Saturdays, 8:00–9:00 AM",
    startDate: "2026-09-12",
    endDate: "2026-11-14",
    capacity: 20,
    enrolled: 16,
    priceCents: 8500,
    ageRange: "Adults 18+",
  },
];

// ---------------------------------------------------------------------------
// Membership tiers
// ---------------------------------------------------------------------------
export const membershipTiers: MembershipTier[] = [
  {
    id: "tier-individual",
    name: "Individual",
    monthlyPriceCents: 3500,
    annualPriceCents: 37800,
    description: "Full access to fitness rooms and open gym hours at all facilities.",
    benefits: [
      "Access to all 5 facilities",
      "Open gym & fitness room hours",
      "10% off program registration",
    ],
  },
  {
    id: "tier-family",
    name: "Family",
    monthlyPriceCents: 6500,
    annualPriceCents: 70200,
    description: "Covers up to 5 household members with full facility access.",
    benefits: [
      "Access to all 5 facilities for up to 5 household members",
      "Open gym & fitness room hours",
      "15% off program registration",
      "Priority youth sports registration",
    ],
  },
  {
    id: "tier-senior",
    name: "Senior (60+)",
    monthlyPriceCents: 2000,
    annualPriceCents: 21600,
    description: "Discounted membership for residents 60 and older.",
    benefits: [
      "Access to all 5 facilities",
      "Free senior wellness programming",
      "10% off other program registration",
    ],
  },
];

// ---------------------------------------------------------------------------
// Members (~200)
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle",
  "Kevin", "Dorothy", "Brian", "Carol", "George", "Amanda", "Timothy", "Melissa",
  "Ronald", "Deborah", "Jason", "Stephanie", "Edward", "Rebecca", "Jeffrey", "Sharon",
  "Ryan", "Laura", "Jacob", "Cynthia", "Gary", "Kathleen", "Nicholas", "Amy",
  "Eric", "Angela", "Jonathan", "Shirley", "Stephen", "Anna", "Larry", "Brenda",
  "Justin", "Pamela", "Scott", "Emma", "Brandon", "Nicole", "Benjamin", "Helen",
  "Samuel", "Samantha", "Gregory", "Katherine", "Alexander", "Christine", "Patrick", "Debra",
  "Frank", "Rachel", "Raymond", "Carolyn", "Jack", "Janet", "Dennis", "Maria",
  "Jerry", "Catherine", "Tyler", "Heather",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
  "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
];

function emailFor(first: string, last: string, index: number): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "aol.com"];
  return `${first.toLowerCase()}.${last.toLowerCase()}${index}@${pick(domains)}`;
}

function phoneFor(): string {
  return `(804) ${randInt(200, 999)}-${String(randInt(0, 9999)).padStart(4, "0")}`;
}

export const members: Member[] = Array.from({ length: 200 }, (_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const joinDaysAgo = randInt(14, 900);
  const joinDate = addDays(TODAY, -joinDaysAgo);
  const hasMembership = rng() < 0.62;
  const tier = hasMembership ? pick(membershipTiers).id : null;
  const status: Member["status"] = rng() < 0.9 ? "active" : "inactive";

  return {
    id: `mem-${String(i + 1).padStart(4, "0")}`,
    firstName: first,
    lastName: last,
    email: emailFor(first, last, i + 1),
    phone: phoneFor(),
    homeFacilityId: pick(facilities).id,
    membershipTierId: tier,
    joinDate,
    status,
  };
});

// ---------------------------------------------------------------------------
// Transactions: ~12 months of membership + enrollment sales history.
// ---------------------------------------------------------------------------
function monthsBack(n: number): string {
  return addDays(TODAY, -n * 30);
}

const transactions: Transaction[] = [];
let txnCounter = 1;

function nextTxnId(): string {
  return `txn-${String(txnCounter++).padStart(5, "0")}`;
}

// Membership sales: each member with a tier is charged monthly, starting
// from whichever is later — their join date or 12 months ago.
for (const member of members) {
  if (!member.membershipTierId) continue;
  const tier = membershipTiers.find((t) => t.id === member.membershipTierId)!;

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const billingDate = monthsBack(monthOffset);
    if (billingDate < member.joinDate) continue;
    if (member.status === "inactive" && monthOffset < 2) continue; // lapsed recently

    transactions.push({
      id: nextTxnId(),
      type: "membership",
      memberId: member.id,
      date: billingDate,
      amountCents: tier.monthlyPriceCents,
      membershipTierId: tier.id,
    });
  }
}

// Enrollment sales: random members enroll in programs across the past
// 12 months, roughly tracking each program's current `enrolled` count.
for (const program of programs) {
  const enrollmentCount = program.enrolled;
  const eligibleMembers = members.filter((m) => m.status === "active");

  for (let i = 0; i < enrollmentCount; i++) {
    const member = pick(eligibleMembers);
    const monthOffset = randInt(0, 11);
    const enrollDate = monthsBack(monthOffset);

    transactions.push({
      id: nextTxnId(),
      type: "enrollment",
      memberId: member.id,
      date: enrollDate,
      amountCents: program.priceCents,
      programId: program.id,
    });
  }
}

transactions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

export { transactions };
