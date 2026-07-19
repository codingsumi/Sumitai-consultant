import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(__dirname, "../../prompts");

const loadMarkdown = (filename: string): string =>
    fs.readFileSync(path.join(PROMPTS_DIR, filename), "utf-8");

const basePrompt = loadMarkdown("base.md");

const consultantPromptMap: Record<string, string> = {
    allopathy: loadMarkdown("allopathy.md"),
    ayurveda: loadMarkdown("ayurveda.md"),
    homeopathy: loadMarkdown("homeopathy.md"),
    yoga: loadMarkdown("yoga.md"),
    nutrition: loadMarkdown("nutrition.md"),
    "mental-wellness": loadMarkdown("mental-wellness.md"),
};

export const buildSystemPrompt = (consultantSlug: string): string => {
    const consultantPrompt = consultantPromptMap[consultantSlug];
    if (!consultantPrompt) {
        throw new Error(`No prompt found for consultant slug: "${consultantSlug}"`);
    }
    return `${basePrompt}\n\n---\n\n${consultantPrompt}`;
};
