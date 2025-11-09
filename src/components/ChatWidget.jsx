import { useMemo, useState } from "react";

const resourceLinks = [
  {
    label: "Emergency Services",
    description: "If you are in immediate danger, please call 911 right away.",
  },
  {
    label: "Mental Health Support",
    description: "Contact the 988 Suicide & Crisis Lifeline or visit 988lifeline.org.",
  },
  {
    label: "Community Resources",
    description: "Find local shelters and support services at www.hud.gov/findshelters.",
  },
];

const systemPrompt = `You are a compassionate, trauma-informed safety assistant named Beacon. Keep replies concise,
actionable, and supportive. When appropriate, remind the user about emergency services (911) and the 988
Suicide & Crisis Lifeline. Encourage seeking professional help and provide practical safety planning tips.
If the user requests resources, recommend trusted U.S. organizations and government services.`;

const buildBackendUrl = () => {
  const fallback = "http://localhost:8000";
  const raw = import.meta.env.VITE_BACKEND_URL ?? fallback;
  return raw.replace(/\/$/, "");
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      role: "assistant",
      text: "Hi there! I'm Beacon, your safety assistant. How can I support you today?",
    },
  ]);

  const backendUrl = useMemo(() => buildBackendUrl(), []);

  const appendBotFallback = (errorMessage) => {
    const fallbackText =
      `${errorMessage} In the meantime, you can reach out to these resources: ` +
      resourceLinks
        .map((resource) => `${resource.label}: ${resource.description}`)
        .join(" ");

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: "bot",
        role: "assistant",
        text: fallbackText,
      },
    ]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const conversation = [...messages, userMessage];


    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const payload = {
        messages: [
          { role: "system", content: systemPrompt },
          ...conversation.slice(-8).map((message) => ({
            role: message.role,
            content: message.text,
          })),
        ],
      };

      const response = await fetch(`${backendUrl}/api/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to reach the safety assistant right now.");
      }

      const data = await response.json();
      const replyText = data?.reply?.trim();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          role: "assistant",
          text:
            replyText && replyText.length > 0
              ? replyText
              : "I'm sorry, I couldn't generate a helpful response right now. Please consider reaching out to 911 in emergencies or the 988 Suicide & Crisis Lifeline.",
        },
      ]);
    } catch (error) {
      console.error("Chat assistant error", error);
      appendBotFallback(
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting the safety assistant."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-widget-container">
      <button
        type="button"
        className="chat-widget-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "Close Chat" : "Need Help?"}
      </button>

      {isOpen && (
        <div className="chat-widget-panel">
          <div className="chat-widget-header">Safety Assistant</div>
          <div className="chat-widget-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-widget-message chat-widget-message-${message.sender}`}
              >
                {message.text}
              </div>
            ))}
            {isSending && (
              <div className="chat-widget-message chat-widget-message-bot">
                Beacon is thinking...
              </div>
            )}
          </div>
          <form className="chat-widget-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isSending}
            />
            <button type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
