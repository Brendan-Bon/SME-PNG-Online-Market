"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useApp();

  const [userType, setUserType] = useState<"buyer" | "seller" | "admin">("buyer");
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [province, setProvince] = useState("New Ireland");

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (mode === "login") {
      const success = login(email, userType);
      if (success) {
        // Redirect based on role
        if (userType === "seller") {
          router.push("/seller/dashboard");
        } else if (userType === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setErrorMsg("Invalid credentials. Try our seeded login options below.");
      }
    } else {
      // Register
      if (userType === "seller") {
        register(name || storeName, email, "seller", storeName, province);
        router.push("/seller/dashboard");
      } else {
        register(name, email, "buyer");
        router.push("/");
      }
    }
  };

  // Seed user quick login helper
  const handleQuickLogin = (seedEmail: string, role: "buyer" | "seller" | "admin") => {
    login(seedEmail, role);
    if (role === "seller") {
      router.push("/seller/dashboard");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBg}></div>
      
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>
            {mode === "login" ? "Welcome Back" : "Join the Market"}
          </h1>
          <p className={styles.authSubtitle}>
            {userType === "buyer" 
              ? "Discover the best SMEs in Papua New Guinea."
              : userType === "seller" 
              ? "Grow your business and reach buyers nationwide."
              : "Access the marketplace administration dashboard."}
          </p>
        </div>

        {errorMsg && (
          <div style={{ color: "var(--color-error)", fontSize: "0.85rem", textAlign: "center", marginBottom: "1rem" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <div className={styles.tabs}>
          <button 
            type="button"
            className={`${styles.tab} ${userType === "buyer" ? styles.active : ""}`}
            onClick={() => { setUserType("buyer"); setErrorMsg(""); }}
          >
            Buyer
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${userType === "seller" ? styles.active : ""}`}
            onClick={() => { setUserType("seller"); setErrorMsg(""); }}
          >
            Seller
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${userType === "admin" ? styles.active : ""}`}
            onClick={() => { setUserType("admin"); setMode("login"); setErrorMsg(""); }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {userType === "seller" && mode === "register" && (
            <>
              <div className={styles.sellerNotice}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>Sellers must be verified before listing products. The verification process is quick and protects our marketplace.</span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business / Store Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. Kokopo Crafts" 
                  required 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Province</label>
                <select 
                  className={styles.input} 
                  required 
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  <option value="New Ireland">New Ireland Province</option>
                  <option value="East New Britain">East New Britain Province</option>
                  <option value="West New Britain">West New Britain Province</option>
                  <option value="National Capital District (NCD)">National Capital District (NCD)</option>
                </select>
              </div>
            </>
          )}

          {mode === "register" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="e.g. John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {userType !== "admin" && (
          <div className={styles.switchMode}>
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <span className={styles.link} onClick={() => { setMode("register"); setErrorMsg(""); }}>
                  Register now
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className={styles.link} onClick={() => { setMode("login"); setErrorMsg(""); }}>
                  Sign in
                </span>
              </>
            )}
          </div>
        )}

        {/* Seed accounts quick panel */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.5rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textAlign: "center", marginBottom: "0.8rem", fontWeight: 600 }}>
            🔑 ONE-CLICK TEST LOGINS
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button 
              type="button"
              onClick={() => handleQuickLogin("seller@png.com", "seller")}
              style={{
                background: "rgba(206, 17, 38, 0.1)",
                border: "1px solid rgba(206, 17, 38, 0.3)",
                color: "var(--color-primary-light)",
                padding: "8px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                fontWeight: 600,
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🏪 Seller (Mary's Craft Shop)</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Login →</span>
            </button>

            <button 
              type="button"
              onClick={() => handleQuickLogin("buyer@png.com", "buyer")}
              style={{
                background: "rgba(252, 209, 22, 0.1)",
                border: "1px solid rgba(252, 209, 22, 0.3)",
                color: "var(--color-secondary)",
                padding: "8px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                fontWeight: 600,
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🛒 Buyer (John Doe)</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Login →</span>
            </button>

            <button 
              type="button"
              onClick={() => handleQuickLogin("admin@png.com", "admin")}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--color-text-primary)",
                padding: "8px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                fontWeight: 600,
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>⚙️ Admin Panel</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Login →</span>
            </button>
          </div>
        </div>
        
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/" className={styles.link} style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
