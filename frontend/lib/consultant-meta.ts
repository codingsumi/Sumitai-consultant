import {
  Apple,
  Atom,
  Brain,
  Leaf,
  PillBottle,
  Stethoscope,
  Tablets,
  type LucideIcon,
} from "lucide-react";

export type ConsultantMeta = {
  icon: LucideIcon;
  color: string;
  iconColor: string;
  blurb: string;
};

/** Visual metadata keyed by consultant slug from the backend. */
export const CONSULTANT_META: Record<string, ConsultantMeta> = {
  homeopathy: {
    icon: PillBottle,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    blurb: "Natural holistic remedies and constitutional guidance.",
  },
  yoga: {
    icon: Atom,
    color: "bg-violet-50",
    iconColor: "text-violet-600",
    blurb: "Movement, breathing, and flexibility for everyday wellness.",
  },
  allopathy: {
    icon: Tablets,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    blurb: "Evidence-based medical information and care guidance.",
  },
  ayurveda: {
    icon: Leaf,
    color: "bg-lime-50",
    iconColor: "text-lime-700",
    blurb: "Traditional Ayurvedic herbs, diet, and lifestyle balance.",
  },
  nutrition: {
    icon: Apple,
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    blurb: "Personalized nutrition and eating habit support.",
  },
  "mental-wellness": {
    icon: Brain,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    blurb: "Stress, focus, and emotional wellbeing guidance.",
  },
};

export function getConsultantMeta(slug: string): ConsultantMeta {
  return (
    CONSULTANT_META[slug] ?? {
      icon: Stethoscope,
      color: "bg-orange-50",
      iconColor: "text-[#FF7A00]",
      blurb: "Specialist AI guidance for your questions.",
    }
  );
}
