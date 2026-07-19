import type { LucideIcon } from "lucide-react";
import {
  Wifi, Router, Globe, Signal, Radio, Satellite, Antenna,
  Server, Cloud, Cable, Network, Building2, Home, Hotel,
  GraduationCap, Landmark, Factory, ShoppingBag,
  Zap, Shield, Headphones, Phone, Mail, MapPin, Users,
  Gauge, ShieldCheck, HeartPulse, HandHeart, Briefcase, School,
  Activity, Wrench, Camera, Clock,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Wifi, Router, Globe, Signal, Radio, Satellite, Antenna,
  Server, Cloud, Cable, Network, Building2, Home, Hotel,
  GraduationCap, Landmark, Factory, ShoppingBag,
  Zap, Shield, Headphones, Phone, Mail, MapPin, Users,
  Gauge, ShieldCheck, HeartPulse, HandHeart, Briefcase, School,
  Activity, Wrench, Camera, Clock,
  // Hospital not exported by our lucide version — map to HeartPulse.
  Hospital: HeartPulse,
};

export function iconByName(name: string | undefined, fallback: LucideIcon = Zap): LucideIcon {
  if (!name) return fallback;
  return MAP[name] ?? fallback;
}
