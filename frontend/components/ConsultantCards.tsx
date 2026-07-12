import { Stethoscope, Dumbbell, Languages, Leaf, ChevronRight } from "lucide-react";

const cards = [
  {
    icon: Stethoscope,
    title: "Homeopathy",
    description: "Natural healing & holistic wellness",
  },
  {
    icon: Dumbbell,
    title: "Yoga",
    description: "Fitness, flexibility & mindful movement",
  },
  {
    icon: Languages,
    title: "English",
    description: "Grammar, writing & communication",
  },
  {
    icon: Leaf,
    title: "Ayurvedic",
    description: "Traditional wellness & herbal guidance",
  },
];

export default function ConsultantCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ icon: Icon, title, description }) => (
        <button
          key={title}
          className="group flex flex-col items-start gap-3 rounded-2xl border border-[#E5E7EB] dark:border-[#1F1F1F] bg-white dark:bg-[#1A1A1A] p-4 text-left shadow-sm hover:border-[#F97316] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF7ED] dark:bg-[#1F1200] text-[#F97316] group-hover:bg-[#FED7AA] transition-colors">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#111827] dark:text-white">{title}</p>
            <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
              {description}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#9CA3AF] group-hover:text-[#F97316] transition-colors" />
        </button>
      ))}
    </div>
  );
}
