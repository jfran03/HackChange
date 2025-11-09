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

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! I'm here to help you find safety resources. How can I assist you today?",
    },
  ]);

  const helpKeywords = useMemo(
    () => ["help", "resources", "support", "danger", "emergency", "unsafe"],
    []
  );

  const generateBotReply = (userMessage) => {
    const normalized = userMessage.toLowerCase();
    const needsHelp = helpKeywords.some((keyword) => normalized.includes(keyword));

    if (needsHelp) {
      return (
        "I understand this might be urgent. Here are some trusted resources: " +
        resourceLinks
          .map((resource) => `${resource.label}: ${resource.description}`)
          .join(" ")
      );
    }

    return "Thank you for sharing. I can connect you with resources or answer questions about staying safe—just let me know what you need.";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const botMessage = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: generateBotReply(trimmed),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInputValue("");
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
          </div>
          <form className="chat-widget-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
