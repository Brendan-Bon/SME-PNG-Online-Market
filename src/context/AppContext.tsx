"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { marketItems, MarketItem } from "@/data/items";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  storeName?: string;
  province?: string;
  isVerified?: boolean;
}

export interface CartItem {
  item: MarketItem;
  quantity: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  itemId?: number;
  itemTitle?: string;
  text: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  buyerId: string;
  buyerName: string;
  address: string;
  province: string;
  phone: string;
  subtotal: number;
  shipping: number;
  fee: number;
  total: number;
  date: string;
  status: "pending" | "shipped" | "received";
}

interface AppContextType {
  user: User | null;
  users: User[];
  items: MarketItem[];
  cart: CartItem[];
  messages: Message[];
  transactions: Transaction[];
  login: (email: string, role: "buyer" | "seller" | "admin") => boolean;
  register: (
    name: string,
    email: string,
    role: "buyer" | "seller" | "admin",
    storeName?: string,
    province?: string
  ) => void;
  logout: () => void;
  addToCart: (item: MarketItem) => void;
  removeFromCart: (itemId: number) => void;
  updateCartQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  addListing: (listing: Omit<MarketItem, "id" | "rating" | "reviews" | "isVerified">) => void;
  updateListing: (listing: MarketItem) => void;
  deleteListing: (itemId: number) => void;
  createTransaction: (
    buyerName: string,
    address: string,
    province: string,
    phone: string,
    subtotal: number,
    shipping: number,
    fee: number,
    total: number
  ) => void;
  sendMessage: (recipientId: string, recipientName: string, text: string, itemId?: number, itemTitle?: string) => void;
  toggleSpotlight: (itemId: number) => void;
  toggleSellerVerification: (sellerName: string) => void;
  updateTransactionStatus: (transactionId: string, status: "pending" | "shipped" | "received") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SEED_USERS: User[] = [
  {
    id: "user-mary",
    name: "Mary Kuan",
    email: "seller@png.com",
    role: "seller",
    storeName: "Mary's Craft Shop",
    province: "New Ireland",
    isVerified: true,
  },
  {
    id: "user-buyer",
    name: "John Doe",
    email: "buyer@png.com",
    role: "buyer",
  },
  {
    id: "user-admin",
    name: "System Administrator",
    email: "admin@png.com",
    role: "admin",
  },
];

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    // 1. Load Listings
    const savedItems = localStorage.getItem("sme_market_items");
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        setItems(marketItems);
      }
    } else {
      setItems(marketItems);
      localStorage.setItem("sme_market_items", JSON.stringify(marketItems));
    }

    // 2. Load User
    const savedUser = localStorage.getItem("sme_market_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }

    // 2b. Load All Users
    const savedUsers = localStorage.getItem("sme_market_users");
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        setUsers(SEED_USERS);
      }
    } else {
      setUsers(SEED_USERS);
      localStorage.setItem("sme_market_users", JSON.stringify(SEED_USERS));
    }

    // 3. Load Cart
    const savedCart = localStorage.getItem("sme_market_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }

    // 4. Load Messages
    const savedMessages = localStorage.getItem("sme_market_messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {}
    } else {
      // Seed default welcome message
      const defaultMsg: Message = {
        id: "msg-welcome",
        senderId: "user-mary",
        senderName: "Mary's Craft Shop",
        recipientId: "user-buyer",
        recipientName: "John Doe",
        text: "Hi John! Welcome to the SME Market. Let me know if you have any questions about the Custom Handwoven Bilum.",
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
      };
      setMessages([defaultMsg]);
      localStorage.setItem("sme_market_messages", JSON.stringify([defaultMsg]));
    }

    // 5. Load Transactions
    const savedTrans = localStorage.getItem("sme_market_transactions");
    if (savedTrans) {
      try {
        setTransactions(JSON.parse(savedTrans));
      } catch (e) {}
    } else {
      // Seed an initial transaction
      const defaultTrans: Transaction = {
        id: "TX-10024",
        items: [{ item: marketItems[0], quantity: 1 }],
        buyerId: "user-buyer",
        buyerName: "John Doe",
        address: "Section 10, Lot 5, Boroko",
        province: "National Capital District (NCD)",
        phone: "+675 7123 4567",
        subtotal: 150,
        shipping: 20,
        fee: 3,
        total: 173,
        date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), // 2 days ago
        status: "shipped",
      };
      setTransactions([defaultTrans]);
      localStorage.setItem("sme_market_transactions", JSON.stringify([defaultTrans]));
    }

    setMounted(true);
  }, []);

  // Save updates helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Auth Operations
  const login = (email: string, role: "buyer" | "seller" | "admin"): boolean => {
    // Attempt match in dynamic users array
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (found) {
      setUser(found);
      saveState("sme_market_user", found);
      return true;
    }

    // Create custom user if not exist
    const customUser: User = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      email: email,
      role: role,
      storeName: role === "seller" ? `${email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)}'s Store` : undefined,
      province: role === "seller" ? "New Ireland" : undefined,
      isVerified: false,
    };
    
    const updatedUsers = [...users, customUser];
    setUsers(updatedUsers);
    saveState("sme_market_users", updatedUsers);

    setUser(customUser);
    saveState("sme_market_user", customUser);
    return true;
  };

  const register = (
    name: string,
    email: string,
    role: "buyer" | "seller" | "admin",
    storeName?: string,
    province?: string
  ) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      storeName: role === "seller" ? storeName || `${name}'s Store` : undefined,
      province: role === "seller" ? province || "New Ireland" : undefined,
      isVerified: false,
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveState("sme_market_users", updatedUsers);

    setUser(newUser);
    saveState("sme_market_user", newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sme_market_user");
  };

  // Cart Operations
  const addToCart = (item: MarketItem) => {
    const updated = [...cart];
    const existing = updated.find((c) => c.item.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      updated.push({ item, quantity: 1 });
    }
    setCart(updated);
    saveState("sme_market_cart", updated);
  };

  const removeFromCart = (itemId: number) => {
    const updated = cart.filter((c) => c.item.id !== itemId);
    setCart(updated);
    saveState("sme_market_cart", updated);
  };

  const updateCartQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const updated = cart.map((c) => (c.item.id === itemId ? { ...c, quantity } : c));
    setCart(updated);
    saveState("sme_market_cart", updated);
  };

  const clearCart = () => {
    setCart([]);
    saveState("sme_market_cart", []);
  };

  // Listings Operations
  const addListing = (listing: Omit<MarketItem, "id" | "rating" | "reviews" | "isVerified">) => {
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: MarketItem = {
      ...listing,
      id: newId,
      rating: 5.0,
      reviews: 0,
      isVerified: user?.isVerified || false,
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveState("sme_market_items", updated);
  };

  const updateListing = (listing: MarketItem) => {
    const updated = items.map((i) => (i.id === listing.id ? listing : i));
    setItems(updated);
    saveState("sme_market_items", updated);
  };

  const deleteListing = (itemId: number) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    saveState("sme_market_items", updated);
  };

  // Checkout Operations
  const createTransaction = (
    buyerName: string,
    address: string,
    province: string,
    phone: string,
    subtotal: number,
    shipping: number,
    fee: number,
    total: number
  ) => {
    const newTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      items: [...cart],
      buyerId: user?.id || "anonymous",
      buyerName,
      address,
      province,
      phone,
      subtotal,
      shipping,
      fee,
      total,
      date: new Date().toLocaleDateString(),
      status: "pending",
    };

    const updatedTrans = [newTx, ...transactions];
    setTransactions(updatedTrans);
    saveState("sme_market_transactions", updatedTrans);
    clearCart();
  };

  const updateTransactionStatus = (transactionId: string, status: "pending" | "shipped" | "received") => {
    const updated = transactions.map((t) => (t.id === transactionId ? { ...t, status } : t));
    setTransactions(updated);
    saveState("sme_market_transactions", updated);
  };

  // Messages Operations
  const sendMessage = (recipientId: string, recipientName: string, text: string, itemId?: number, itemTitle?: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || "guest",
      senderName: user?.name || (user?.role === "seller" ? user?.storeName || "Anonymous Seller" : "Guest Buyer"),
      recipientId,
      recipientName,
      itemId,
      itemTitle,
      text,
      timestamp: Date.now(),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    saveState("sme_market_messages", updated);
  };

  // Admin Actions
  const toggleSpotlight = (itemId: number) => {
    const updated = items.map((i) => (i.id === itemId ? { ...i, isSpotlight: !(i as any).isSpotlight } : i));
    // Wait, the interface MarketItem might not have isSpotlight officially in items.ts but let's check
    // Wait, in page.tsx Spotlight items are:
    // const initialSpotlightItems = marketItems.filter(item => item.id <= 4);
    // So to make it generic let's just add it dynamically, or we can use custom logic
    setItems(updated);
    saveState("sme_market_items", updated);
  };

  const toggleSellerVerification = (sellerName: string) => {
    // 1. Update verification in listings catalog
    const updatedItems = items.map((i) => (i.seller === sellerName ? { ...i, isVerified: !i.isVerified } : i));
    setItems(updatedItems);
    saveState("sme_market_items", updatedItems);
    
    // 2. Update verification in users registry
    const updatedUsers = users.map((u) => {
      if (u.role === "seller" && u.storeName === sellerName) {
        const newVerified = !u.isVerified;
        // If the verified user is currently logged in, update their active session too
        if (user && user.id === u.id) {
          const updatedCurrentUser = { ...user, isVerified: newVerified };
          setUser(updatedCurrentUser);
          saveState("sme_market_user", updatedCurrentUser);
        }
        return { ...u, isVerified: newVerified };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveState("sme_market_users", updatedUsers);
  };

  // Avoid SSR hydration mismatch
  if (!mounted) {
    return (
      <AppContext.Provider
        value={{
          user: null,
          users: SEED_USERS,
          items: marketItems,
          cart: [],
          messages: [],
          transactions: [],
          login: () => false,
          register: () => {},
          logout: () => {},
          addToCart: () => {},
          removeFromCart: () => {},
          updateCartQuantity: () => {},
          clearCart: () => {},
          addListing: () => {},
          updateListing: () => {},
          deleteListing: () => {},
          createTransaction: () => {},
          sendMessage: () => {},
          toggleSpotlight: () => {},
          toggleSellerVerification: () => {},
          updateTransactionStatus: () => {},
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        items,
        cart,
        messages,
        transactions,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addListing,
        updateListing,
        deleteListing,
        createTransaction,
        sendMessage,
        toggleSpotlight,
        toggleSellerVerification,
        updateTransactionStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
}
