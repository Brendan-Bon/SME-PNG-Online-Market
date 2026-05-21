"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useApp } from "@/context/AppContext";

function MessagesContent() {
  const { user, messages, sendMessage, items, login } = useApp();
  const searchParams = useSearchParams();
  
  // Read optional deep-linking parameters
  const querySeller = searchParams?.get("seller") || null;
  const queryItemIdStr = searchParams?.get("itemId") || null;
  const queryItemId = queryItemIdStr ? parseInt(queryItemIdStr) : undefined;

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Get user messages
  const userMessages = useMemo(() => {
    if (!user) return [];
    return messages.filter(
      (m) => m.senderId === user.id || m.recipientId === user.id
    );
  }, [messages, user]);

  // 2. Group by the other participant's ID
  const activeConversations = useMemo(() => {
    if (!user) return [];

    const groups: { [otherId: string]: typeof messages } = {};
    userMessages.forEach((m) => {
      const otherId = m.senderId === user.id ? m.recipientId : m.senderId;
      if (!groups[otherId]) {
        groups[otherId] = [];
      }
      groups[otherId].push(m);
    });

    const chatsList = Object.keys(groups).map((otherId) => {
      const threadMsgs = groups[otherId].sort((a, b) => a.timestamp - b.timestamp);
      const latestMsg = threadMsgs[threadMsgs.length - 1];
      const otherName = latestMsg.senderId === user.id ? latestMsg.recipientName : latestMsg.senderName;
      
      const isOnline = otherId === "user-mary" || otherId === "user-admin";

      // Time formatting helper
      const date = new Date(latestMsg.timestamp);
      const today = new Date();
      const timeStr = date.toLocaleDateString() === today.toLocaleDateString()
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });

      return {
        id: otherId,
        name: otherName,
        lastMessage: latestMsg.text,
        time: timeStr,
        timestamp: latestMsg.timestamp,
        avatar: otherName ? otherName.charAt(0).toUpperCase() : "U",
        isOnline,
        itemId: latestMsg.itemId,
        itemTitle: latestMsg.itemTitle,
      };
    });

    return chatsList.sort((a, b) => b.timestamp - a.timestamp);
  }, [userMessages, user, messages]);

  // 3. Inject deep-linked conversation if no messages exist yet
  const conversations = useMemo(() => {
    const list = [...activeConversations];

    if (querySeller && user) {
      // Determine target seller ID
      let targetSellerId = "user-mary";
      if (querySeller !== "Mary's Craft Shop") {
        targetSellerId = `user-${querySeller.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      }

      const exists = list.some((c) => c.id === targetSellerId);
      if (!exists && targetSellerId !== user.id) {
        const matchedItem = queryItemId ? items.find((i) => i.id === queryItemId) : undefined;
        const title = matchedItem ? matchedItem.title : "Product Enquiry";

        list.unshift({
          id: targetSellerId,
          name: querySeller,
          lastMessage: `Start chatting about ${title}...`,
          time: "Now",
          timestamp: Date.now(),
          avatar: querySeller.charAt(0).toUpperCase(),
          isOnline: targetSellerId === "user-mary",
          itemId: queryItemId,
          itemTitle: title,
        });
      }
    }

    return list;
  }, [activeConversations, querySeller, queryItemId, items, user]);

  // 4. Manage active chat selection
  useEffect(() => {
    if (querySeller && user) {
      let targetSellerId = "user-mary";
      if (querySeller !== "Mary's Craft Shop") {
        targetSellerId = `user-${querySeller.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      }
      if (targetSellerId !== user.id) {
        setSelectedChatId(targetSellerId);
        return;
      }
    }

    if (!selectedChatId && conversations.length > 0) {
      setSelectedChatId(conversations[0].id);
    }
  }, [conversations, querySeller, user, selectedChatId]);

  // Find selected conversation
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === selectedChatId) || null;
  }, [conversations, selectedChatId]);

  // 5. Get messages for selected thread
  const activeChatMessages = useMemo(() => {
    if (!user || !selectedChatId) return [];
    return userMessages
      .filter(
        (m) =>
          (m.senderId === user.id && m.recipientId === selectedChatId) ||
          (m.senderId === selectedChatId && m.recipientId === user.id)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [userMessages, user, selectedChatId]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatMessages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !selectedChatId || !activeChat) return;

    // Use query product parameters if communicating on a new deep-link thread
    const isNewLinkedChat = querySeller && activeChat.id === (querySeller === "Mary's Craft Shop" ? "user-mary" : `user-${querySeller.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
    const matchedItem = (isNewLinkedChat && queryItemId)
      ? items.find((i) => i.id === queryItemId)
      : activeChat.itemId
      ? items.find((i) => i.id === activeChat.itemId)
      : undefined;

    sendMessage(
      selectedChatId,
      activeChat.name,
      inputText.trim(),
      matchedItem?.id,
      matchedItem?.title
    );
    setInputText("");
  };

  // Unauthorized state
  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "20px", textAlign: "center", padding: "20px" }}>
        <div style={{ fontSize: "3rem" }}>💬</div>
        <h2 style={{ fontFamily: "var(--font-heading)" }}>Access Denied</h2>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "400px" }}>
          Please register or log in to view and send messages. Connect with PNG artisans and customers directly!
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/auth" style={{ padding: "10px 24px", backgroundColor: "var(--color-primary)", color: "white", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
            Login / Register
          </Link>
          <button 
            onClick={() => login("buyer@png.com", "buyer")}
            style={{ padding: "10px 24px", backgroundColor: "var(--color-surface-light)", color: "var(--color-text-primary)", borderRadius: "var(--radius-full)", fontWeight: 600, border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}
          >
            Quick Buyer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagingContainer}>
      
      {/* Sidebar / Chat List */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Messages</h2>
        </div>
        <div className={styles.chatList}>
          {conversations.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              No messages yet. Browse listings to contact a seller!
            </div>
          ) : (
            conversations.map((chat) => (
              <div 
                key={chat.id} 
                className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.active : ""}`}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <div className={styles.chatAvatar} style={{ backgroundColor: chat.id === "user-mary" ? "var(--color-primary)" : "var(--color-surface-light)", color: "white" }}>
                  {chat.avatar}
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatNameRow}>
                    <span className={styles.chatName}>{chat.name}</span>
                    <span className={styles.chatTime}>{chat.time}</span>
                  </div>
                  <div className={styles.chatPreview}>{chat.lastMessage}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={styles.chatArea}>
        {activeChat ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.activeChatInfo}>
                <div className={styles.chatAvatar} style={{ backgroundColor: activeChat.id === "user-mary" ? "var(--color-primary)" : "var(--color-surface-light)", color: "white" }}>
                  {activeChat.avatar}
                </div>
                <div>
                  <h2 className={styles.activeChatName}>
                    {activeChat.name}
                    {activeChat.isOnline && (
                      <svg className={styles.verifiedIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                      </svg>
                    )}
                  </h2>
                  <div className={styles.chatStatus} style={{ color: activeChat.isOnline ? "#10B981" : "var(--color-text-muted)" }}>
                    {activeChat.isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            </div>

            {/* Deep-Linked Product Context Panel */}
            {activeChat.itemId && (
              <div style={{ backgroundColor: "rgba(252, 209, 22, 0.05)", borderBottom: "1px solid rgba(252, 209, 22, 0.1)", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  Inquiring about: <strong style={{ color: "var(--color-secondary)" }}>{activeChat.itemTitle}</strong>
                </span>
                <Link href={`/items/${activeChat.itemId}`} style={{ fontSize: "0.8rem", color: "var(--color-primary-light)", fontWeight: 600 }}>
                  View Item →
                </Link>
              </div>
            )}

            <div className={styles.messageList}>
              {activeChatMessages.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", gap: "10px" }}>
                  <span>💬 No messages yet with {activeChat.name}.</span>
                  <span style={{ fontSize: "0.85rem" }}>Type below and say hello!</span>
                </div>
              ) : (
                activeChatMessages.map((msg) => {
                  const isSentByMe = msg.senderId === user.id;
                  const date = new Date(msg.timestamp);
                  const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`${styles.messageWrapper} ${isSentByMe ? styles.sent : styles.received}`}
                    >
                      <div className={styles.messageBubble}>
                        {msg.text}
                      </div>
                      <span className={styles.messageTime}>{timeString}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputArea}>
              <input 
                type="text" 
                className={styles.messageInput} 
                placeholder="Type a message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
            Select a conversation to start messaging.
          </div>
        )}
      </main>

    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "80px", color: "var(--color-text-muted)" }}>Loading conversations...</div>}>
      <MessagesContent />
    </Suspense>
  );
}

