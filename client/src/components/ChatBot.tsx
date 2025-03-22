"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

const API_URL = "https://api.openai.com/v1/chat/completions";

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.text,
          })),
        }),
      });

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "I'm not sure how to respond.";

      setMessages((prev) => [...prev, { role: "assistant", text: botText }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-lg">
      <Card className="h-96 overflow-y-auto p-2">
        <CardContent>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-1 rounded-lg text-white max-w-[75%] ${
                msg.role === "user" ? "bg-blue-500 ml-auto" : "bg-gray-700"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div className="text-gray-500">Bot is typing...</div>}
        </CardContent>
      </Card>
      <div className="flex mt-2 gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." disabled={loading} />
        <Button onClick={handleSend} disabled={loading}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
