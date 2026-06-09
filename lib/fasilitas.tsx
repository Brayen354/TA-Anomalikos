import type { ComponentType, SVGProps } from "react";
import {
  IconWifi,
  IconSnow,
  IconTv,
  IconShower,
  IconWashing,
  IconChefHat,
  IconShield,
  IconCamera,
  IconBolt,
  IconBed,
  IconHome,
  IconCheck,
} from "@/components/Icons";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const RULES: { match: string[]; icon: IconType }[] = [
  { match: ["wifi", "internet"], icon: IconWifi },
  { match: ["ac", "air condition", "pendingin"], icon: IconSnow },
  { match: ["tv", "televisi"], icon: IconTv },
  { match: ["water heater", "pemanas", "shower", "air panas"], icon: IconShower },
  { match: ["laundry", "cuci", "washing"], icon: IconWashing },
  { match: ["dapur", "kitchen", "masak"], icon: IconChefHat },
  { match: ["cctv", "kamera", "camera"], icon: IconCamera },
  { match: ["keamanan", "security", "satpam", "24 jam", "penjaga"], icon: IconShield },
  { match: ["listrik", "token"], icon: IconBolt },
  { match: ["kasur", "bed", "tempat tidur"], icon: IconBed },
  { match: ["parkir", "garasi", "garage"], icon: IconHome },
];

export function fasilitasIcon(nama?: string): IconType {
  const n = (nama ?? "").toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some((k) => n.includes(k))) return rule.icon;
  }
  return IconCheck;
}
