import HomePage from "@/app/HomePage";

interface Props {
  params: Promise<{ consultantSlug: string; chatId: string }>;
}

export default async function ChatConversationPage({ params }: Props) {
  const { consultantSlug, chatId } = await params;
  return <HomePage initialConsultantSlug={consultantSlug} initialChatId={chatId} />;
}
