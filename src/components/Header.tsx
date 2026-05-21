"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import Cart from "./Cart";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, cart, logout } = useApp();

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <>
      <header className={`glass ${styles.header}`}>
        <div className={styles.content}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className={styles.logo}>
              <span className={styles["logo-sme"]}>SME</span>
              <span className={styles["logo-png"]}>PNG</span>
              <span className={styles["logo-market"]}>Market</span>
            </div>
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={styles["nav-link"]}>Marketplace</Link>
            {user?.role === "seller" && (
              <Link href="/seller/dashboard" className={styles["nav-link"]}>Seller Dashboard</Link>
            )}
            {user?.role === "buyer" && (
              <Link href="/transactions" className={styles["nav-link"]}>My Orders</Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className={styles["nav-link"]}>Admin Portal</Link>
            )}
            {user && (
              <Link href="/messages" className={styles["nav-link"]}>Inbox</Link>
            )}
          </nav>
          <div className={styles.actions}>
            {/* Search Icon / Quick Link */}
            <Link href="/" className={styles["btn-icon"]} aria-label="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            
            {/* Cart Icon */}
            <button 
              className={styles["btn-icon"]} 
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Cart"
            >
              <div className={styles["cart-icon-wrapper"]}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                {cartCount > 0 && (
                  <span className={styles["cart-badge"]}>{cartCount}</span>
                )}
              </div>
            </button>
            
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: "0.8rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{user.name}</span>
                  <span style={{ color: "var(--color-secondary)", fontSize: "0.75rem", textTransform: "capitalize" }}>
                    {user.role === "seller" ? user.storeName || "Seller" : user.role}
                  </span>
                </div>
                
                <button 
                  className={styles["btn-primary"]} 
                  style={{ 
                    padding: "6px 12px", 
                    fontSize: "0.8rem", 
                    background: "rgba(255, 255, 255, 0.08)", 
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "none"
                  }}
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth">
                <button className={styles["btn-primary"]}>Login / Register</button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Cart */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
