export const POPULAR_QUESTION_CATEGORIES = [
  "Health",
  "Technology",
  "Education",
  "Career",
  "Lifestyle",
  "Mental Wellness",
] as const;

export type PopularQuestionCategory =
  (typeof POPULAR_QUESTION_CATEGORIES)[number];

export interface PopularQuestion {
  id: string;
  question: string;
  category: PopularQuestionCategory;
  isPopular: boolean;
  order: number;
  /** Optional consultant slug hint for chat routing */
  preferredConsultantSlug?: string;
}

/**
 * Static catalog of popular questions.
 * Kept separate from UI so it can later move to DB/API without page rewrites.
 */
export const POPULAR_QUESTIONS: PopularQuestion[] = [
  // Health
  {
    id: "health-1",
    question: "What are natural ways to lower blood pressure?",
    category: "Health",
    isPopular: true,
    order: 1,
    preferredConsultantSlug: "homeopathy",
  },
  {
    id: "health-2",
    question: "Which homeopathic remedies help with seasonal allergies?",
    category: "Health",
    isPopular: true,
    order: 2,
    preferredConsultantSlug: "homeopathy",
  },
  {
    id: "health-3",
    question: "What should I know about managing a mild fever at home?",
    category: "Health",
    isPopular: true,
    order: 3,
    preferredConsultantSlug: "allopathy",
  },
  {
    id: "health-4",
    question: "What are the benefits of Ashwagandha for everyday wellness?",
    category: "Health",
    isPopular: false,
    order: 4,
    preferredConsultantSlug: "ayurveda",
  },
  {
    id: "health-5",
    question: "How can I support immunity through Ayurvedic habits?",
    category: "Health",
    isPopular: false,
    order: 5,
    preferredConsultantSlug: "ayurveda",
  },

  // Technology (health-adjacent)
  {
    id: "tech-1",
    question: "How does excess screen time affect sleep quality?",
    category: "Technology",
    isPopular: true,
    order: 1,
    preferredConsultantSlug: "mental-wellness",
  },
  {
    id: "tech-2",
    question: "What eye-care habits help if I work on a computer all day?",
    category: "Technology",
    isPopular: false,
    order: 2,
    preferredConsultantSlug: "allopathy",
  },
  {
    id: "tech-3",
    question: "How can I reduce tech-related neck and back strain?",
    category: "Technology",
    isPopular: false,
    order: 3,
    preferredConsultantSlug: "yoga",
  },
  {
    id: "tech-4",
    question: "Are there wellness tips for staying healthy while working remotely?",
    category: "Technology",
    isPopular: false,
    order: 4,
    preferredConsultantSlug: "nutrition",
  },

  // Education
  {
    id: "edu-1",
    question: "How can I reduce study stress before exams?",
    category: "Education",
    isPopular: true,
    order: 1,
    preferredConsultantSlug: "mental-wellness",
  },
  {
    id: "edu-2",
    question: "What yoga practices improve focus while studying?",
    category: "Education",
    isPopular: false,
    order: 2,
    preferredConsultantSlug: "yoga",
  },
  {
    id: "edu-3",
    question: "What foods support better concentration and memory?",
    category: "Education",
    isPopular: false,
    order: 3,
    preferredConsultantSlug: "nutrition",
  },
  {
    id: "edu-4",
    question: "How can I improve sleep during intensive study periods?",
    category: "Education",
    isPopular: false,
    order: 4,
    preferredConsultantSlug: "mental-wellness",
  },

  // Career
  {
    id: "career-1",
    question: "How do I manage work-related anxiety in a healthy way?",
    category: "Career",
    isPopular: true,
    order: 1,
    preferredConsultantSlug: "mental-wellness",
  },
  {
    id: "career-2",
    question: "What quick desk stretches help during long workdays?",
    category: "Career",
    isPopular: false,
    order: 2,
    preferredConsultantSlug: "yoga",
  },
  {
    id: "career-3",
    question: "How can I build healthier eating habits with a busy work schedule?",
    category: "Career",
    isPopular: false,
    order: 3,
    preferredConsultantSlug: "nutrition",
  },
  {
    id: "career-4",
    question: "What are practical ways to prevent burnout?",
    category: "Career",
    isPopular: false,
    order: 4,
    preferredConsultantSlug: "mental-wellness",
  },

  // Lifestyle
  {
    id: "life-1",
    question: "What is a balanced daily diet for better energy?",
    category: "Lifestyle",
    isPopular: true,
    order: 1,
    preferredConsultantSlug: "nutrition",
  },
  {
    id: "life-2",
    question: "Which yoga routine is best for beginners with back pain?",
    category: "Lifestyle",
    isPopular: true,
    order: 2,
    preferredConsultantSlug: "yoga",
  },
  {
    id: "life-3",
    question: "How can I improve my sleep naturally?",
    category: "Lifestyle",
    isPopular: false,
    order: 3,
    preferredConsultantSlug: "ayurveda",
  },
  {
    id: "life-4",
    question: "What Ayurvedic morning routine supports better digestion?",
    category: "Lifestyle",
    isPopular: false,
    order: 4,
    preferredConsultantSlug: "ayurveda",
  },
  {
    id: "life-5",
    question: "Suggest a simple weekly meal plan for diabetes-friendly eating.",
    category: "Lifestyle",
    isPopular: false,
    order: 5,
    preferredConsultantSlug: "nutrition",
  },

  // Mental Wellness
  {
    id: "mental-1",
    question: "How can I calm racing thoughts before bed?",
    category: "Mental Wellness",
    isPopular: true,
    order: 1,
    preferredConsultantSlug: "mental-wellness",
  },
  {
    id: "mental-2",
    question: "What breathing exercises help with everyday stress?",
    category: "Mental Wellness",
    isPopular: false,
    order: 2,
    preferredConsultantSlug: "yoga",
  },
  {
    id: "mental-3",
    question: "How do I build a healthier relationship with overthinking?",
    category: "Mental Wellness",
    isPopular: false,
    order: 3,
    preferredConsultantSlug: "mental-wellness",
  },
  {
    id: "mental-4",
    question: "What simple habits improve emotional resilience?",
    category: "Mental Wellness",
    isPopular: false,
    order: 4,
    preferredConsultantSlug: "mental-wellness",
  },
];
