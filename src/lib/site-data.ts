// Central content source for the marketing site. Swap for a CMS later.
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import {
  Wifi, Building2, Cable, Radio, Router, ShieldCheck, PhoneCall, Cloud,
  Camera, Network, Activity, Wrench, Home, GraduationCap, HeartPulse,
  Hotel, Landmark, HandHeart, Briefcase, School,
} from "lucide-react";

export const site = {
  name: "SkyArt Networks Limited",
  tagline: "Fast, reliable and affordable internet for homes and businesses.",
  description:
    "SkyArt Networks Limited is a Tanzanian wireless internet service provider delivering dependable broadband connectivity to homes, businesses, institutions and communities.",
  phone: "+255625707139",
  email: "info@skyartnetworks.co.tz",
  address: "1040 Haile Selassie Road, Msasani, Masaki, Dar es Salaam, Tanzania",
  hours: "Mon–Sat · 8:00 – 20:00 · Support available 24/7",
  social: {
    twitter: "#",
    linkedin: "#",
    facebook: "#",
    instagram: "https://www.instagram.com/skyart_tech?igsh=MTV2ZHJ5MWIybmYzZA==",
    youtube: "https://youtube.com/@skyartnetwork?si=7IFBD5rpMHxzTYAY",
  },
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/products", label: "Products" },
  { href: "/solutions", label: "Solutions" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/coverage", label: "Coverage" },
  { href: "/careers", label: "Careers" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export type Service = { slug: string; title: string; icon: LucideIcon; blurb: string };
export const services: Service[] = [
  { slug: "residential-internet", title: "Residential Internet", icon: Wifi, blurb: "Reliable broadband connectivity designed for homes, apartments and residential communities." },
  { slug: "business-internet", title: "Business Internet", icon: Building2, blurb: "Stable, high-speed internet solutions that help businesses operate efficiently." },
  { slug: "public-wifi-hotspots", title: "Public Wi-Fi Hotspots", icon: Router, blurb: "Affordable public internet access for communities and high-traffic locations." },
  { slug: "fixed-wireless-access", title: "Fixed Wireless Access", icon: Radio, blurb: "Dedicated wireless broadband for customers needing higher bandwidth and consistent performance." },
  { slug: "fiber-connectivity", title: "Fiber Connectivity", icon: Network, blurb: "Future-ready fiber solutions including FTTH, FTTP and FTTB deployments." },
  { slug: "network-infrastructure", title: "Network Infrastructure", icon: Activity, blurb: "Wireless network planning, deployment, monitoring, optimization and maintenance." },
  { slug: "rural-connectivity", title: "Rural Connectivity", icon: Home, blurb: "Providing internet access to underserved and remote communities across Tanzania." },
];

export type Package = {
  name: string;
  down: number; up: number; price: number; install: number;
  features: string[]; recommended?: boolean; tier: "home" | "business";
};
export const packages: Package[] = [
  { name: "Starter", down: 30, up: 15, price: 45000, install: 50000, tier: "home",
    features: ["Unlimited data", "Fair usage 500 GB", "Free Wi-Fi router", "24/7 support"] },
  { name: "Family", down: 100, up: 50, price: 89000, install: 50000, tier: "home", recommended: true,
    features: ["Unlimited data", "Mesh Wi-Fi included", "Parental controls", "Priority support"] },
  { name: "Pro Gamer", down: 300, up: 150, price: 149000, install: 0, tier: "home",
    features: ["Ultra-low latency", "Static IPv4 option", "Gaming QoS", "Mesh Wi-Fi included"] },
  { name: "Business 200", down: 200, up: 200, price: 249000, install: 0, tier: "business",
    features: ["Symmetrical 1:4", "Static IP included", "99.5% uptime SLA", "4-hour response"] },
  { name: "Business 500", down: 500, up: 500, price: 499000, install: 0, tier: "business", recommended: true,
    features: ["Symmetrical 1:2", "/29 IP block", "99.9% uptime SLA", "2-hour response"] },
  { name: "Dedicated Gig", down: 1000, up: 1000, price: 1200000, install: 0, tier: "business",
    features: ["Dedicated 1:1", "BGP + own ASN", "99.99% uptime SLA", "Dedicated engineer"] },
];

export type StreetHotspotPackage = {
  name: string;
  cost: number;
  data: string;
  speed: string;
  devices: number;
  duration: string;
};

export const streetHotspotPackages: StreetHotspotPackage[] = [
  { name: "SIKU 1", cost: 1000, data: "3GBs", speed: "80/80Mbps", devices: 1, duration: "1 Day" },
  { name: "SIKU 2", cost: 2000, data: "7GBs", speed: "80/80Mbps", devices: 2, duration: "2 Days" },
  { name: "SIKU 1+", cost: 2000, data: "Unlimited", speed: "80/80Mbps", devices: 1, duration: "1 Day" },
  { name: "SIKU 7", cost: 7000, data: "35GBs", speed: "80/80Mbps", devices: 3, duration: "7 Days" },
  { name: "SIKU 7+", cost: 14000, data: "Unlimited", speed: "80/80Mbps", devices: 1, duration: "7 Days" },
  { name: "SIKU 10", cost: 10000, data: "50GBs", speed: "80/80Mbps", devices: 3, duration: "10 Days" },
  { name: "SIKU 30", cost: 28000, data: "200GBs", speed: "80/80Mbps", devices: 3, duration: "30 Days" },
  { name: "SIKU 30+", cost: 45000, data: "Unlimited", speed: "80/80Mbps", devices: 3, duration: "30 Days" },
  { name: "SIKU 30-", cost: 39000, data: "Unlimited", speed: "80/80Mbps", devices: 1, duration: "30 Days" },
  { name: "BUKU 2", cost: 2000, data: "3.5GBs", speed: "80/80Mbps", devices: 1, duration: "Unlimited" },
  { name: "BUKU 5", cost: 5000, data: "10GBs", speed: "80/80Mbps", devices: 1, duration: "Unlimited" },
];

export type Solution = { slug: string; title: string; icon: LucideIcon; challenge: string; answer: string };
export const solutions: Solution[] = [
  { slug: "home", title: "Home Users", icon: Home, challenge: "Slow evenings, buffering streams, and unreliable Wi-Fi coverage.", answer: "Symmetrical fiber with mesh Wi-Fi and 24/7 parental support." },
  { slug: "small-business", title: "Small Businesses", icon: Briefcase, challenge: "Downtime kills sales, VoIP drops mid-call, POS goes offline.", answer: "Business-grade fiber with SLA-backed uptime and 4G failover." },
  { slug: "enterprise", title: "Large Enterprises", icon: Building2, challenge: "Multi-site MPLS, cloud direct-connect, and secure remote access.", answer: "Dedicated fiber rings, SD-WAN, and BGP-multihomed connectivity." },
  { slug: "schools", title: "Schools", icon: School, challenge: "Shared bandwidth, safeguarding filters, thousands of devices.", answer: "Managed Wi-Fi with content filtering and per-classroom QoS." },
  { slug: "universities", title: "Universities", icon: GraduationCap, challenge: "Research bandwidth, campus-wide Wi-Fi, hostel connectivity.", answer: "10G+ campus backbone with eduroam integration." },
  { slug: "hospitals", title: "Hospitals", icon: HeartPulse, challenge: "24/7 uptime for EMR, imaging, and telemedicine.", answer: "Redundant fiber rings with dedicated clinical VLANs." },
  { slug: "hotels", title: "Hotels", icon: Hotel, challenge: "Guest Wi-Fi that just works — from lobby to top-floor suites.", answer: "High-density Wi-Fi 6 with captive portal and PMS billing." },
  { slug: "government", title: "Government", icon: Landmark, challenge: "Secure, compliant, sovereign connectivity.", answer: "Private fiber circuits with encryption and audit-ready reporting." },
  { slug: "ngos", title: "NGOs", icon: HandHeart, challenge: "Remote-site connectivity on a lean budget.", answer: "Hybrid fiber + LTE with discounted mission-driven pricing." },
];

export const stats = [
  { value: "Reliable Connectivity", label: "Dependable broadband performance for homes, businesses and institutions." },
  { value: "Affordable Packages", label: "Flexible solutions designed to fit everyday budgets and growth plans." },
  { value: "Modern Wireless Technology", label: "High-performance wireless systems built for speed and stability." },
  { value: "Growing Network Coverage", label: "Expanding across Dar es Salaam and beyond with a strong rollout roadmap." },
  { value: "Professional Support", label: "Skilled teams offering dependable guidance and technical assistance." },
  { value: "Future Expansion Across Tanzania", label: "A long-term vision for connecting more communities with quality internet." },
];

export const customerSegments = [
  { title: "Homes & Apartments", icon: Home, blurb: "Fast, dependable internet for everyday streaming, learning and remote work." },
  { title: "Small Businesses", icon: Briefcase, blurb: "Stable connectivity that keeps operations moving and customers connected." },
  { title: "Educational Institutions", icon: School, blurb: "Reliable access for classrooms, administration and digital learning." },
  { title: "Corporate Offices", icon: Building2, blurb: "High-performance broadband for productivity, communication and cloud access." },
  { title: "Government Organizations", icon: Landmark, blurb: "Secure, scalable connectivity for public services and digital operations." },
  { title: "Public Wi-Fi Users", icon: HandHeart, blurb: "Affordable internet access that supports community and public spaces." },
];

export const technologies = [
  "Wireless Broadband",
  "Fiber Optic Networks",
  "Wi-Fi 6",
  "High-Speed Wireless Backhaul",
  "Energy-Efficient Infrastructure",
  "Solar-Powered Network Sites",
  "Intelligent Network Monitoring",
];

export const portfolio = [
  { title: "Baraka Health Multi-Site Fiber", industry: "Healthcare", tech: ["Dedicated Fiber", "SD-WAN", "VPN"], location: "Dar es Salaam", date: "2025-03", result: "Three clinics unified on 1G ring, 99.99% uptime." },
  { title: "Sunrise Lodge Guest Wi-Fi", industry: "Hospitality", tech: ["Wi-Fi 6", "Captive Portal", "PMS Billing"], location: "Zanzibar", date: "2024-11", result: "220 access points, +38 pts guest-Wi-Fi NPS." },
  { title: "Coastal University Campus Backbone", industry: "Education", tech: ["10G Fiber Ring", "eduroam", "IPv6"], location: "Mombasa", date: "2025-06", result: "18,000 concurrent users, sub-10ms internal latency." },
  { title: "Kilimo Ltd SD-WAN Rollout", industry: "Agriculture", tech: ["SD-WAN", "LTE Failover", "SASE"], location: "14 sites", date: "2025-01", result: "60% MPLS cost reduction, 4× throughput." },
  { title: "MetroBank Branch Connectivity", industry: "Finance", tech: ["Dark Fiber", "MPLS", "PCI-DSS"], location: "Nairobi", date: "2024-09", result: "42 branches PCI-compliant on private WAN." },
  { title: "City Hall Smart CCTV", industry: "Government", tech: ["IP-CCTV", "PoE++", "Fiber Backbone"], location: "Arusha", date: "2025-05", result: "310 cameras, city-wide low-latency backhaul." },
];

export const coverage = [
  { region: "Kinondoni District", type: "Wireless Broadband", availability: "Active", cities: ["Msasani", "Mbezi", "Kijitonyama", "Mikocheni"] },
  { region: "Kigamboni District", type: "Wireless Broadband", availability: "Active", cities: ["Kigamboni", "Mjimwema", "Tungi", "Kibada"] },
  { region: "Ubungo District", type: "Wireless Broadband", availability: "Active", cities: ["Kimara", "Ubungo", "Mabibo", "Mlimani"] },
  { region: "Dar es Salaam Expansion", type: "Wireless + Fiber", availability: "Planned", cities: ["Temeke", "Ilala", "New areas across the city"] },
];

export const posts = [
  { slug: "fiber-vs-wireless", title: "Fiber vs Wireless: Which is right for your business?", date: "2026-06-14", category: "Guides", excerpt: "A no-jargon comparison to help you pick the right last-mile technology." },
  { slug: "wifi-6-explained", title: "Wi-Fi 6 explained — and when it actually matters", date: "2026-05-30", category: "Technology", excerpt: "Wi-Fi 6 isn't just a bigger number. Here's when the upgrade pays off." },
  { slug: "ddos-small-business", title: "5 cybersecurity habits every small business should adopt", date: "2026-05-11", category: "Cybersecurity", excerpt: "You don't need a SOC to defend your business. Start with these five." },
  { slug: "network-launch-mwanza", title: "NetPulse launches gigabit fiber in Mwanza", date: "2026-04-22", category: "Company News", excerpt: "Our newest metro fiber ring goes live, bringing 1 Gbps home fiber to Ilemela." },
  { slug: "voip-migration", title: "How to migrate your office to VoIP without downtime", date: "2026-03-18", category: "Guides", excerpt: "A four-week plan for switching from legacy PBX to hosted VoIP cleanly." },
  { slug: "sdwan-vs-mpls", title: "SD-WAN or MPLS in 2026? The honest answer", date: "2026-02-27", category: "Technology", excerpt: "The real trade-offs, minus the vendor marketing." },
];

export const jobs = [
  { title: "Senior Network Engineer", type: "Full-time", location: "Dar es Salaam", team: "NOC" },
  { title: "Field Installation Technician", type: "Full-time", location: "Arusha", team: "Field Ops" },
  { title: "Customer Success Manager", type: "Full-time", location: "Remote (EAT)", team: "Customer" },
  { title: "Frontend Engineer", type: "Full-time", location: "Remote (EAT)", team: "Product" },
  { title: "Sales Executive — Enterprise", type: "Full-time", location: "Nairobi", team: "Sales" },
  { title: "NOC Analyst (Night Shift)", type: "Full-time", location: "Dar es Salaam", team: "NOC" },
];

export const faqs = [
  { category: "Installation", q: "How long does installation take?", a: "Most home installations complete within 48 hours of activation. Business installs are scheduled within 5–7 working days." },
  { category: "Installation", q: "Do I need to be home?", a: "Yes, someone 18+ must be present to sign the service acceptance form and grant access to cable routing points." },
  { category: "Billing", q: "What payment methods do you accept?", a: "M-Pesa, Tigo Pesa, Airtel Money, bank transfer, Visa/Mastercard, and cash at any of our offices." },
  { category: "Billing", q: "When are invoices generated?", a: "On the 1st of each month, billed monthly in advance. Auto-suspension kicks in on day 8 after due date." },
  { category: "Packages", q: "Can I upgrade or downgrade my package?", a: "Yes, at any time from your customer portal. Upgrades apply immediately; downgrades take effect next billing cycle." },
  { category: "Packages", q: "Is there a fair-usage policy?", a: "Home plans have a FUP threshold; speeds are throttled only in the top 5% of usage during peak hours." },
  { category: "Technical Support", q: "Is support really 24/7?", a: "Yes. Our NOC is staffed around the clock — call, WhatsApp, or open a ticket from the portal." },
  { category: "Technical Support", q: "What's the SLA on outage response?", a: "Home: 8 hours. Business: 4 hours. Dedicated: 1 hour with dedicated engineer." },
  { category: "Equipment", q: "Do I own the router?", a: "Rented routers stay with NetPulse. You can purchase your CPE upfront for a one-off fee — ask sales." },
  { category: "Equipment", q: "Can I use my own router?", a: "Absolutely, provided it supports PPPoE or DHCP handoff. Our engineers will help you configure it." },
  { category: "Coverage", q: "How do I check if you cover my address?", a: "Use the coverage tool on the Coverage page, or call our sales team with your building name." },
  { category: "Coverage", q: "What if my area isn't covered yet?", a: "Register your interest — when 25 households in an area sign up, we prioritize expansion there." },
];

export const partners = ["Cisco", "MikroTik", "Ubiquiti", "Huawei", "Fortinet", "Juniper", "AWS", "Cloudflare"];

export const milestones = [
  { year: "2014", title: "Founded", body: "NetPulse begins as a wireless ISP with 40 pilot customers in Dar es Salaam." },
  { year: "2017", title: "First fiber ring", body: "5,000 homes connected on our first metro fiber deployment." },
  { year: "2020", title: "Regional expansion", body: "Networks live in Arusha, Mwanza, Mombasa. First data center opens." },
  { year: "2023", title: "10G backbone", body: "10G core, direct peering with AWS, Azure, Cloudflare and Google." },
  { year: "2025", title: "48,000+ customers", body: "Six cities, 800 employees, and an SLA-backed 99.99% uptime." },
];

export const values = [
  { title: "Reliability", body: "We build connectivity you can depend on for work, education, communication and everyday life." },
  { title: "Innovation", body: "We combine modern wireless technologies and smart network planning to deliver efficient services." },
  { title: "Customer First", body: "Every solution is shaped around the needs of the people and organizations we serve." },
  { title: "Affordability", body: "We strive to make quality internet access practical and accessible for more communities." },
  { title: "Integrity", body: "We act with transparency, accountability and respect in everything we deliver." },
  { title: "Sustainability", body: "Our network design considers efficiency, resilience and long-term environmental responsibility." },
  { title: "Excellence", body: "We are committed to high standards of performance, support and service quality." },
  { title: "Community Empowerment", body: "We connect underserved communities and support growth through dependable digital access." },
];

export function formatTZS(n: number) {
  return "TZS " + new Intl.NumberFormat("en-US").format(n);
}

export type LocalizedSiteData = {
  site: typeof site;
  nav: typeof nav;
  services: Service[];
  packages: Package[];
  streetHotspotPackages: StreetHotspotPackage[];
  solutions: Solution[];
  stats: typeof stats;
  customerSegments: typeof customerSegments;
  technologies: typeof technologies;
  portfolio: typeof portfolio;
  coverage: typeof coverage;
  posts: typeof posts;
  jobs: typeof jobs;
  faqs: typeof faqs;
  partners: typeof partners;
  milestones: typeof milestones;
  values: typeof values;
};
 
const swSite: typeof site = {
  ...site,
  tagline: "Intaneti ya haraka, ya kuaminika na nafuu kwa nyumba na biashara.",
  description:
    "SkyArt Networks Limited ni mtoa huduma wa intaneti wa wireless nchini Tanzania anayetoa muunganisho wa broadband wa kuaminika kwa nyumba, biashara, taasisi na jamii.",
  hours: "Jumatatu-Jumamosi · 8:00 - 20:00 · Msaada unapatikana saa 24/7",
};

const swNavLabels: Record<string, string> = {
  "/": "Nyumbani",
  "/about": "Kuhusu",
  "/services": "Huduma",
  "/packages": "Vifurushi",
  "/products": "Bidhaa",
  "/solutions": "Suluhisho",
  "/portfolio": "Miradi",
  "/coverage": "Ufikivu",
  "/careers": "Ajira",
  "/faq": "Maswali",
  "/blog": "Blogu",
  "/contact": "Wasiliana",
};

const swNav = nav.map((item) => ({ ...item, label: swNavLabels[item.href] ?? item.label }));

const swServicesBySlug: Record<string, { title: string; blurb: string }> = {
  "residential-internet": {
    title: "Intaneti ya Nyumbani",
    blurb: "Muunganisho wa broadband wa kuaminika ulioundwa kwa nyumba, vyumba na jamii za makazi.",
  },
  "business-internet": {
    title: "Intaneti ya Biashara",
    blurb: "Suluhisho thabiti za intaneti ya kasi ya juu zinazosaidia biashara kufanya kazi kwa ufanisi.",
  },
  "public-wifi-hotspots": {
    title: "Hotspot za Wi-Fi za Umma",
    blurb: "Huduma nafuu ya intaneti ya umma kwa jamii na maeneo yenye watu wengi.",
  },
  "fixed-wireless-access": {
    title: "Fixed Wireless Access",
    blurb: "Broadband maalum ya wireless kwa wateja wanaohitaji bandwidth kubwa na utendaji thabiti.",
  },
  "fiber-connectivity": {
    title: "Muunganisho wa Fiber",
    blurb: "Suluhisho za fiber za kisasa ikiwemo FTTH, FTTP na FTTB.",
  },
  "network-infrastructure": {
    title: "Miundombinu ya Mtandao",
    blurb: "Upangaji, utekelezaji, ufuatiliaji, uboreshaji na matengenezo ya mitandao ya wireless.",
  },
  "rural-connectivity": {
    title: "Muunganisho Vijijini",
    blurb: "Kutoa huduma ya intaneti kwa jamii zisizohudumiwa vya kutosha na maeneo ya mbali kote Tanzania.",
  },
};

const swServices = services.map((item) => {
  const translated = swServicesBySlug[item.slug];
  return translated ? { ...item, ...translated } : item;
});

const swStats = [
  { value: "Muunganisho wa Kuaminika", label: "Utendaji wa broadband unaotegemewa kwa nyumba, biashara na taasisi." },
  { value: "Vifurushi Nafuu", label: "Suluhisho zinazobadilika kulingana na bajeti za kila siku na mipango ya ukuaji." },
  { value: "Teknolojia ya Kisasa ya Wireless", label: "Mifumo ya wireless yenye utendaji wa juu kwa kasi na uthabiti." },
  { value: "Mtandao Unaopanuka", label: "Tunapanuka Dar es Salaam na maeneo mengine kwa mpango madhubuti wa usambazaji." },
  { value: "Msaada wa Kitaalamu", label: "Timu zenye ujuzi zinazotoa mwongozo wa kuaminika na msaada wa kiufundi." },
  { value: "Upanuzi Tanzania Nzima", label: "Dira ya muda mrefu ya kuunganisha jamii nyingi zaidi kwa intaneti bora." },
] as const;

const swCustomerSegments = [
  { title: "Nyumba na Vyumba", icon: Home, blurb: "Intaneti ya kasi na kuaminika kwa burudani, masomo na kazi za mbali." },
  { title: "Biashara Ndogo", icon: Briefcase, blurb: "Muunganisho thabiti unaoendelea kuwezesha shughuli za biashara na wateja wako." },
  { title: "Taasisi za Elimu", icon: School, blurb: "Huduma ya kuaminika kwa madarasa, usimamizi na ujifunzaji wa kidijitali." },
  { title: "Ofisi za Kampuni", icon: Building2, blurb: "Broadband ya utendaji wa juu kwa tija, mawasiliano na huduma za cloud." },
  { title: "Taasisi za Serikali", icon: Landmark, blurb: "Muunganisho salama na unaoweza kupanuka kwa huduma za umma." },
  { title: "Watumiaji wa Wi-Fi ya Umma", icon: HandHeart, blurb: "Huduma nafuu ya intaneti inayosaidia jamii na maeneo ya umma." },
] as const;

const swSolutionsBySlug: Record<string, { title: string; challenge: string; answer: string }> = {
  home: {
    title: "Watumiaji wa Nyumbani",
    challenge: "Kasi kupungua jioni, video kukwama na Wi-Fi kutofika kila chumba.",
    answer: "Fiber yenye kasi sawa pande zote, mesh Wi-Fi na msaada wa wazazi saa 24/7.",
  },
  "small-business": {
    title: "Biashara Ndogo",
    challenge: "Kukatika kwa mtandao hupunguza mauzo, VoIP hukatika na POS huzima.",
    answer: "Fiber ya biashara yenye SLA na failover ya 4G.",
  },
  enterprise: {
    title: "Makampuni Makubwa",
    challenge: "Mahitaji ya multi-site MPLS, cloud direct-connect na remote access salama.",
    answer: "Dedicated fiber rings, SD-WAN na muunganisho wa BGP-multihomed.",
  },
  schools: {
    title: "Shule",
    challenge: "Bandwidth ya pamoja, usalama wa maudhui na maelfu ya vifaa.",
    answer: "Managed Wi-Fi yenye content filtering na QoS kwa kila darasa.",
  },
  universities: {
    title: "Vyuo Vikuu",
    challenge: "Mahitaji ya bandwidth ya utafiti, Wi-Fi ya kampasi na hosteli.",
    answer: "Backbone ya kampasi ya 10G+ pamoja na eduroam.",
  },
  hospitals: {
    title: "Hospitali",
    challenge: "Upatikanaji wa saa 24/7 kwa EMR, imaging na telemedicine.",
    answer: "Fiber rings zenye redundancy na VLAN maalum za huduma za kliniki.",
  },
  hotels: {
    title: "Hoteli",
    challenge: "Wi-Fi ya wageni inayofanya kazi vizuri kuanzia lobby hadi vyumba vya juu.",
    answer: "High-density Wi-Fi 6 yenye captive portal na PMS billing.",
  },
  government: {
    title: "Serikali",
    challenge: "Muunganisho salama, unaokidhi taratibu na unaodhibitiwa ndani ya nchi.",
    answer: "Private fiber circuits zenye encryption na ripoti zinazokaguliwa.",
  },
  ngos: {
    title: "NGO",
    challenge: "Muunganisho wa maeneo ya mbali kwa bajeti ndogo.",
    answer: "Mchanganyiko wa fiber + LTE kwa bei rafiki kwa taasisi za kijamii.",
  },
};

const swSolutions = solutions.map((item) => {
  const translated = swSolutionsBySlug[item.slug];
  return translated ? { ...item, ...translated } : item;
});

const swCoverage = coverage.map((item) => {
  const type = item.type === "Wireless Broadband"
    ? "Wireless Broadband"
    : item.type === "Wireless + Fiber"
      ? "Wireless + Fiber"
      : item.type;
  const availability = item.availability === "Active"
    ? "Inapatikana"
    : item.availability === "Planned"
      ? "Imepangwa"
      : item.availability;
  return { ...item, type, availability };
});

const swPostsBySlug: Record<string, { title: string; category: string; excerpt: string }> = {
  "fiber-vs-wireless": {
    title: "Fiber au Wireless: Kipi kinafaa kwa biashara yako?",
    category: "Mwongozo",
    excerpt: "Ulinganisho rahisi kukusaidia kuchagua teknolojia sahihi ya last-mile.",
  },
  "wifi-6-explained": {
    title: "Wi-Fi 6 imeelezwa, na lini inahitajika kweli",
    category: "Teknolojia",
    excerpt: "Wi-Fi 6 si namba tu. Hapa ndipo kuboresha kunalipa.",
  },
  "ddos-small-business": {
    title: "Tabia 5 za usalama mtandaoni kwa biashara ndogo",
    category: "Usalama Mtandaoni",
    excerpt: "Huhitaji SOC kuilinda biashara yako. Anza na hatua hizi tano.",
  },
};

const swPosts = posts.map((item) => {
  const translated = swPostsBySlug[item.slug];
  return translated ? { ...item, ...translated } : item;
});

const swFaqsByQuestion: Record<string, { category: string; q: string; a: string }> = {
  "How long does installation take?": {
    category: "Ufungaji",
    q: "Ufungaji unachukua muda gani?",
    a: "Ufungaji mwingi wa nyumbani hukamilika ndani ya saa 48 baada ya uanzishaji. Biashara hupangiwa ndani ya siku 5-7 za kazi.",
  },
  "What payment methods do you accept?": {
    category: "Malipo",
    q: "Mnakubali njia zipi za malipo?",
    a: "M-Pesa, Tigo Pesa, Airtel Money, benki, Visa/Mastercard na fedha taslimu ofisini.",
  },
  "Can I upgrade or downgrade my package?": {
    category: "Vifurushi",
    q: "Naweza kubadili kifurushi changu?",
    a: "Ndiyo, muda wowote kupitia portal ya mteja. Kupandisha huanza mara moja; kushusha huanza mzunguko unaofuata wa bili.",
  },
  "Is support really 24/7?": {
    category: "Msaada wa Kiufundi",
    q: "Msaada ni saa 24/7 kweli?",
    a: "Ndiyo. NOC yetu inafanya kazi saa zote, piga simu, WhatsApp au fungua tiketi.",
  },
};

const swFaqs = faqs.map((item) => swFaqsByQuestion[item.q] ? { ...item, ...swFaqsByQuestion[item.q] } : item);

const swValuesByTitle: Record<string, { title: string; body: string }> = {
  Reliability: {
    title: "Utegemewaji",
    body: "Tunajenga muunganisho unaoweza kutegemewa kwa kazi, elimu, mawasiliano na maisha ya kila siku.",
  },
  Innovation: {
    title: "Ubunifu",
    body: "Tunachanganya teknolojia za kisasa za wireless na upangaji makini wa mtandao kutoa huduma bora.",
  },
  "Customer First": {
    title: "Mteja Kwanza",
    body: "Kila suluhisho huundwa kulingana na mahitaji ya watu na taasisi tunazohudumia.",
  },
  Affordability: {
    title: "Uwezo wa Kumudu",
    body: "Tunajitahidi kufanya intaneti bora iweze kupatikana kwa jamii nyingi zaidi.",
  },
  Integrity: {
    title: "Uadilifu",
    body: "Tunafanya kazi kwa uwazi, uwajibikaji na heshima katika kila tunachotoa.",
  },
};

const swValues = values.map((item) => swValuesByTitle[item.title] ? { ...item, ...swValuesByTitle[item.title] } : item);

const swPortfolioByTitle: Record<string, { title: string; result: string }> = {
  "Baraka Health Multi-Site Fiber": {
    title: "Baraka Health Multi-Site Fiber",
    result: "Kliniki tatu zimeunganishwa kwenye ring ya 1G, uptime 99.99%.",
  },
  "Sunrise Lodge Guest Wi-Fi": {
    title: "Sunrise Lodge Guest Wi-Fi",
    result: "Access points 220, ongezeko la alama 38 za NPS ya Wi-Fi ya wageni.",
  },
};

const swPortfolio = portfolio.map((item) => swPortfolioByTitle[item.title] ? { ...item, ...swPortfolioByTitle[item.title] } : item);

export const siteContentByLocale: Record<Locale, LocalizedSiteData> = {
  en: {
    site,
    nav,
    services,
    packages,
    streetHotspotPackages,
    solutions,
    stats,
    customerSegments,
    technologies,
    portfolio,
    coverage,
    posts,
    jobs,
    faqs,
    partners,
    milestones,
    values,
  },
  sw: {
    site: swSite,
    nav: swNav,
    services: swServices,
    packages,
    streetHotspotPackages,
    solutions: swSolutions,
    stats: swStats,
    customerSegments: swCustomerSegments,
    technologies,
    portfolio: swPortfolio,
    coverage: swCoverage,
    posts: swPosts,
    jobs,
    faqs: swFaqs,
    partners,
    milestones,
    values: swValues,
  },
};

export function getLocalizedSiteData(locale: Locale): LocalizedSiteData {
  return siteContentByLocale[locale] ?? siteContentByLocale.en;
}
