import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Calendar, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useChatbot, ChatMessage } from "@/hooks/useChatbot"; // <-- import hook

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // 1️⃣ Hook chatbot
  // -----------------------------
  const { messages, loading: isLoading, sendMessage } = useChatbot("client-1"); // clientId optional

  // -----------------------------
  // 2️⃣ Scroll to bottom khi messages thay đổi
  // -----------------------------
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // -----------------------------
  // 3️⃣ Handle gửi message
  // -----------------------------
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    try {
      await sendMessage(inputValue); // gửi message qua hook
      setInputValue("");
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
      <>
        {/* Floating Chat Button */}
        {!isOpen && (
            <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-[100]"
                onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
        )}

        {/* Chat Frame */}
        {isOpen && (
            <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-[100] flex flex-col p-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Restaurant Assistant</h3>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? "Thinking..." : "Online"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-b bg-muted/30">
                <div className="flex gap-2">
                  <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleQuickAction("Show me today's bookings")}
                  >
                    <Calendar className="h-3 w-3 mr-1" /> Bookings
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleQuickAction("What tables are available?")}
                  >
                    <Table className="h-3 w-3 mr-1" /> Tables
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                      <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                  ))}

                  {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          </div>
                        </div>
                      </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
        )}
      </>
  );
};

export default ChatBot;
