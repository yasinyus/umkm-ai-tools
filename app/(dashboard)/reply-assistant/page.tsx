import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MessageInbox } from "@/components/reply-assistant/message-inbox";
import { getMessages } from "@/actions/reply-assistant";

export const metadata = { title: "Reply Assistant — SosmedAI" };

export default async function ReplyAssistantPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const messages = await getMessages();

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold">AI Reply Assistant</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Balas pesan calon pembeli dengan 3 gaya berbeda — AI membuatkan draft, Anda tinggal kirim.
        </p>
      </div>

      <MessageInbox messages={messages} />
    </div>
  );
}
