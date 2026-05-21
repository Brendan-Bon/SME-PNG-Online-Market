"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./Cart.module.css";
import { useApp } from "@/context/AppContext";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cart, updateCartQuantity, removeFromCart, user } = useApp();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const parsePrice = (priceStr: string) => {
    const numericStr = priceStr.replace(/[^0-9.]/g, "");
    return parseFloat(numericStr) || 0;
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = parsePrice(item.item.price);
    return sum + price * item.quantity;
  }, 0);

  const platformFee = Math.round(subtotal * 0.02 * 100) / 100;
  const total = subtotal + platformFee;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.cartContainer} ${isOpen ? styles.open : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>Your Cart</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-text-muted)" }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px", opacity: 0.5 }}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <p style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Your cart is empty</p>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Start browsing SMEs and add items to your cart.</p>
              <button 
                onClick={onClose} 
                style={{ 
                  marginTop: "20px", 
                  backgroundColor: "var(--color-primary)", 
                  color: "white", 
                  padding: "8px 16px", 
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  fontWeight: 600
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map(({ item, quantity }) => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image} alt={item.title} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemSeller}>{item.seller}</p>
                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>{item.price}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className={styles.quantityControl}>
                        <button 
                          className={styles.qtyBtn} 
                          onClick={() => updateCartQuantity(item.id, quantity - 1)}
                        >
                          -
                        </button>
                        <span className={styles.qty}>{quantity}</span>
                        <button 
                          className={styles.qtyBtn} 
                          onClick={() => updateCartQuantity(item.id, quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        aria-label="Remove item"
                        style={{ color: "var(--color-error)", display: "flex", alignItems: "center" }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>K{subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Platform Fee (2%)</span>
              <span>K{platformFee.toFixed(2)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span className={styles.totalPrice}>K{total.toFixed(2)}</span>
            </div>
            
            <Link href={user ? "/checkout" : "/auth?redirect=/checkout"} style={{ textDecoration: "none" }} onClick={onClose}>
              <button className={styles.checkoutBtn}>
                {user ? "Proceed to Checkout" : "Login to Checkout"}
              </button>
            </Link>
            
            <p className={styles.protectionNotice}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Multi-item checkout supported. Shuffle protected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
