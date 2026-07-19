// Central content source for the marketing site. Swap for a CMS later.
import type { LucideIcon } from "lucide-react";
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
