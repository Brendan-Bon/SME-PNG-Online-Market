"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, createTransaction, user } = useApp();

  useEffect(() => {
    if (!user) {
      router.push("/auth?redirect=/checkout");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Loading secure checkout...</h2>
      </div>
    );
  }

  const [paymentMethod, setPaymentMethod] = useState("visa");

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("National Capital District (NCD)");
  const [phone, setPhone] = useState("");

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedTxId, setGeneratedTxId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const parsePrice = (priceStr: string) => {
    const numericStr = priceStr.replace(/[^0-9.]/g, "");
    return parseFloat(numericStr) || 0;
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = parsePrice(item.item.price);
    return sum + price * item.quantity;
  }, 0);

  // Dynamic shipping cost based on province
  let shipping = 20;
  if (province.includes("NCD") || province.includes("National")) {
    shipping = 15;
  } else if (
    province.includes("New Ireland") || 
    province.includes("East New Britain") || 
    province.includes("West New Britain")
  ) {
    shipping = 25;
  } else {
    shipping = 30;
  }

  const platformFee = Math.round(subtotal * 0.02 * 100) / 100;
  const total = subtotal + shipping + platformFee;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (!name || !address || !phone) {
      setErrorMessage("Please complete all delivery information.");
      return;
    }

    if (paymentMethod === "visa" && (!cardNumber || !expiry || !cvc)) {
      setErrorMessage("Please complete all payment card details.");
      return;
    }

    // Capture dynamic transaction details
    const referenceId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Trigger creation
    createTransaction(name, address, province, phone, subtotal, shipping, platformFee, total);
    
    setGeneratedTxId(referenceId);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2.5rem", textAlign: "center" }} className="glass">
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          color: "var(--color-success)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem auto",
          fontSize: "2.5rem"
        }}>
          ✓
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>Order Successful!</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>
          Thank you for supporting Papua New Guinea SMEs. Your payment was processed securely.
        </p>
        
        <div style={{
          background: "var(--color-surface)",
          padding: "1.2rem",
          borderRadius: "var(--radius-md)",
          margin: "1.5rem 0",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Order Reference:</span>
            <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>{generatedTxId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Amount Paid:</span>
            <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>K{total.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Deliver to:</span>
            <span style={{ fontWeight: 500, color: "var(--color-text-primary)", textAlign: "right" }}>
              {name}, {province}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link href="/transactions" style={{ flex: 1 }}>
            <button className={styles.payBtn} style={{ width: "100%", margin: 0 }}>
              Track Orders
            </button>
          </Link>
          <Link href="/" style={{ flex: 1 }}>
            <button 
              className={styles.payBtn} 
              style={{ 
                width: "100%", 
                margin: 0,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "var(--color-text-primary)"
              }}
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>Secure Checkout</h1>
      
      {errorMessage && (
        <div style={{ color: "var(--color-error)", padding: "10px", border: "1px solid var(--color-error)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }} className="glass">
          <p style={{ color: "var(--color-text-secondary)" }}>You have no items in your cart to checkout.</p>
          <Link href="/">
            <button className={styles.payBtn} style={{ maxWidth: "250px", marginTop: "1rem" }}>
              Go Browse Products
            </button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePay} className={styles.checkoutGrid}>
          
          {/* Left Column: Form */}
          <div className={styles.checkoutForm}>
            
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Delivery Information
              </h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="John Doe" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Street Address / Suburb</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. Section 10, Lot 5, Boroko" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Province</label>
                  <select 
                    className={styles.input}
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    <option value="National Capital District (NCD)">National Capital District (NCD)</option>
                    <option value="New Ireland Province">New Ireland Province</option>
                    <option value="East New Britain">East New Britain</option>
                    <option value="West New Britain">West New Britain</option>
                    <option value="Morobe Province">Morobe Province</option>
                    <option value="Madang Province">Madang Province</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input 
                    type="tel" 
                    className={styles.input} 
                    placeholder="e.g. +675 7000 0000" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Payment Method
              </h2>
              <div className={styles.paymentOptions}>
                <div 
                  className={`${styles.paymentOption} ${paymentMethod === "visa" ? styles.active : ""}`}
                  onClick={() => setPaymentMethod("visa")}
                >
                  <div className={styles.radio}></div>
                  <div className={styles.visaLogo}>VISA</div>
                  <span>Credit / Debit Card</span>
                </div>
                <div 
                  className={`${styles.paymentOption} ${paymentMethod === "bsp" ? styles.active : ""}`}
                  onClick={() => setPaymentMethod("bsp")}
                >
                  <div className={styles.radio}></div>
                  <div style={{ fontWeight: "bold", color: "#10B981" }}>BSP Pay</div>
                  <span>Secure Mock BSP API</span>
                </div>
              </div>

              {paymentMethod === "visa" && (
                <div style={{ marginTop: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Card Number</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="0000 0000 0000 0000" 
                      required={paymentMethod === "visa"}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Expiry Date</label>
                      <input 
                        type="text" 
                        className={styles.input} 
                        placeholder="MM/YY" 
                        required={paymentMethod === "visa"}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>CVC</label>
                      <input 
                        type="password" 
                        className={styles.input} 
                        placeholder="123" 
                        maxLength={3}
                        required={paymentMethod === "visa"}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "bsp" && (
                <div style={{ marginTop: "1rem", backgroundColor: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-success)" }}>
                    ✓ **BSP Pay Integration Simulation Selected**. Enter your mobile number in the Delivery form. You will receive a secure SMS verification request code upon submitting.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              
              <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "1rem" }}>
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <img src={item.image} alt={item.title} className={styles.summaryThumb} />
                    <div className={styles.summaryDetails}>
                      <h4 className={styles.summaryTitle}>{item.title}</h4>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Qty: {quantity}</div>
                    </div>
                    <div className={styles.summaryPrice}>K{(parsePrice(item.price) * quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>K{subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping ({province.split(" ")[0]})</span>
                  <span>K{shipping.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Platform Fee (2%)</span>
                  <span>K{platformFee.toFixed(2)}</span>
                </div>
                
                <div className={styles.totalRow}>
                  <span>Total to Pay</span>
                  <span style={{ color: "var(--color-secondary)", fontSize: "1.5rem" }}>K{total.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className={styles.payBtn}>Pay K{total.toFixed(2)}</button>

              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                🔒 Payments are secure and encrypted. Support local PNG SMEs.
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
