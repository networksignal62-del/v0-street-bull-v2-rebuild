"use client";

import { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Star,
  Archive,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const conversations = [
  {
    id: 1,
    name: "Mohamed Kamara",
    avatar: null,
    lastMessage: "Thanks for the opportunity!",
    time: "2 min ago",
    unread: 2,
    online: true,
    role: "Player",
  },
  {
    id: 2,
    name: "John Smith",
    avatar: null,
    lastMessage: "When can we schedule a trial?",
    time: "15 min ago",
    unread: 0,
    online: true,
    role: "Agent",
  },
  {
    id: 3,
    name: "FC Freetown",
    avatar: null,
    lastMessage: "We're interested in your player",
    time: "1 hour ago",
    unread: 1,
    online: false,
    role: "Club",
  },
  {
    id: 4,
    name: "Ibrahim Sesay",
    avatar: null,
    lastMessage: "I've uploaded my new highlights",
    time: "3 hours ago",
    unread: 0,
    online: false,
    role: "Player",
  },
  {
    id: 5,
    name: "Scout United",
    avatar: null,
    lastMessage: "Great performance yesterday!",
    time: "Yesterday",
    unread: 0,
    online: false,
    role: "Scout",
  },
];

const messages = [
  {
    id: 1,
    sender: "Mohamed Kamara",
    content: "Hello! I saw your profile and I'm very interested in your agency.",
    time: "10:30 AM",
    isMe: false,
    status: "read",
  },
  {
    id: 2,
    sender: "You",
    content:
      "Hi Mohamed! Thanks for reaching out. I've watched your highlights and I'm impressed with your skills.",
    time: "10:32 AM",
    isMe: true,
    status: "read",
  },
  {
    id: 3,
    sender: "Mohamed Kamara",
    content:
      "Thank you so much! I've been playing for FC Freetown for 2 years now and I'm looking to take the next step in my career.",
    time: "10:35 AM",
    isMe: false,
    status: "read",
  },
  {
    id: 4,
    sender: "You",
    content:
      "That's great to hear. Can you tell me more about your goals? Are you looking for opportunities locally or internationally?",
    time: "10:38 AM",
    isMe: true,
    status: "read",
  },
  {
    id: 5,
    sender: "Mohamed Kamara",
    content:
      "I'd love to explore international opportunities, especially in Europe or North Africa. But I'm open to any good opportunity that helps me grow.",
    time: "10:42 AM",
    isMe: false,
    status: "read",
  },
  {
    id: 6,
    sender: "You",
    content:
      "Perfect. I have some contacts in Tunisia and Morocco who are always looking for talented African players. Let me review your profile in detail and get back to you with some options.",
    time: "10:45 AM",
    isMe: true,
    status: "delivered",
  },
  {
    id: 7,
    sender: "Mohamed Kamara",
    content: "Thanks for the opportunity!",
    time: "10:47 AM",
    isMe: false,
    status: "read",
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-lg border bg-card">
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation.id === conv.id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {conv.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{conv.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {conv.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-xs">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedConversation.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {selectedConversation.online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
              )}
            </div>
            <div>
              <p className="font-medium">{selectedConversation.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedConversation.online ? "Online" : "Offline"} -{" "}
                {selectedConversation.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Star Conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 ${
                      message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-[10px]">{message.time}</span>
                    {message.isMe && (
                      <span>
                        {message.status === "read" ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
