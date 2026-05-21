"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useApp } from "@/context/AppContext";

const initialScamReports = [
  { id: 101, reportedUser: "Quick Cash PNG (Seller)", reporter: "Jerry M.", reason: "Direct payment requested offline, refusing in-app payment.", time: "1 hour ago" },
  { id: 102, reportedUser: "Unknown Seller (ID: 489)", reporter: "Sarah W.", reason: "Suspected fake item listing with stock internet photos.", time: "3 hours ago" },
];

const mockAiLogs = [
  { id: 1, label: "HIGH RISK", risk: "high", msg: "AI flagged listing 'Easy Money Investment' for immediate deletion (scam pattern detected). Sent to admin review queue.", time: "15 mins ago" },
  { id: 2, label: "INFO", risk: "info", msg: "Verification auto-check: 'Kokopo Vanilla Hub' registration matches PNG IPA registry data (Score: 92%).", time: "5 hours ago" },
  { id: 3, label: "HIGH RISK", risk: "high", msg: "Emergency: System detected 5 rapid direct-payment messages sent by Seller ID 322. Auto-restricting account.", time: "1 day ago" }
];

export default function AdminPage() {
  const { user, items, transactions, login, toggleSpotlight, toggleSellerVerification, deleteListing } = useApp();

  const [reports, setReports] = useState(initialScamReports);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"verifications" | "listings">("verifications");

  // Emergency seller freeze helper
  const handleFreeze = (id: number, username: string) => {
    setReports(reports.filter(item => item.id !== id));
    alert(`Emergency seller freeze initiated for ${username}. Listing disabled.`);
  };

  const handleDismiss = (id: number) => {
    setReports(reports.filter(item => item.id !== id));
  };

  // Compute Platform Metrics from AppContext
  const metrics = useMemo(() => {
    const totalSales = transactions.reduce((sum, tx) => sum + tx.total, 0);
    const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);
    
    // Count unique verified sellers
    const verifiedSellers = new Set(
      items.filter(item => item.isVerified).map(item => item.seller)
    );

    return {
      totalSales,
      totalFees,
      verifiedSellersCount: verifiedSellers.size,
      totalListings: items.length
    };
  }, [transactions, items]);

  // Extract all unique sellers and their verification status
  const sellerList = useMemo(() => {
    const sellerMap: { [name: string]: { name: string; province: string; isVerified: boolean; itemCount: number } } = {};
    
    items.forEach(item => {
      if (!item.seller) return;
      if (!sellerMap[item.seller]) {
        sellerMap[item.seller] = {
          name: item.seller,
          province: item.province || "Unknown Province",
          isVerified: item.isVerified || false,
          itemCount: 0
        };
      }
      sellerMap[item.seller].itemCount += 1;
    });

    return Object.values(sellerMap);
  }, [items]);

  // Partition into verified and pending verification lists
  const pendingSellers = useMemo(() => sellerList.filter(s => !s.isVerified), [sellerList]);
  const verifiedSellers = useMemo(() => sellerList.filter(s => s.isVerified), [sellerList]);

  // AI assistant queries active state
  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      const q = aiQuery.toLowerCase();
      let response = "";

      if (q.includes("mary") || q.includes("craft")) {
        const maryItems = items.filter(i => i.seller === "Mary's Craft Shop");
        const isMaryVerified = maryItems.some(i => i.isVerified);
        response = `Evaluation for 'Mary's Craft Shop': Good standing. Verified: ${isMaryVerified ? "YES" : "NO"}. Dynamic catalog size: ${maryItems.length} active listings. Risk score: 2% (Very Low). Recommended Action: None required.`;
      } else if (q.includes("scam") || q.includes("quick cash")) {
        response = "Risk Warning: 'Quick Cash PNG' has triggered 3 suspicious indicators. They requested offline payment in Kina and sent bank details directly in messages. Recommendation: Execute Emergency Freeze immediately.";
      } else if (q.includes("verify") || q.includes("sellers")) {
        response = `Verification Analysis: Out of ${sellerList.length} total registered SMEs, ${metrics.verifiedSellersCount} are verified. There are currently ${pendingSellers.length} sellers in the verification queue. Recommend verifying shops with active IPA business registries.`;
      } else {
        response = `AI Copilot: I am actively monitoring the platform. We currently have ${items.length} total listings, with ${metrics.verifiedSellersCount} verified sellers and ${transactions.length} total transactions. I can help evaluate risk or scan registrations.`;
      }

      setAiResponse(response);
      setIsAiLoading(false);
    }, 800);
  };

  // Unauthorized page overlay
  if (!user || user.role !== "admin") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: "24px", textAlign: "center", padding: "40px var(--spacing-md)" }}>
        <div style={{ fontSize: "4rem" }}>🛡️</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", margin: 0 }}>Admin Privileges Required</h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "450px", lineHeight: 1.6 }}>
          This control center is restricted to System Administrators. To verify sellers, feature products, or moderate listings, please authenticate.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button 
            onClick={() => login("admin@png.com", "admin")}
            style={{ padding: "12px 28px", backgroundColor: "var(--color-primary)", color: "white", borderRadius: "var(--radius-full)", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 4px 15px rgba(206,17,38,0.3)" }}
          >
            Quick Login as Administrator
          </button>
          <Link href="/" style={{ padding: "12px 28px", backgroundColor: "var(--color-surface-light)", color: "var(--color-text-primary)", borderRadius: "var(--radius-full)", fontWeight: 600, border: "1px solid rgba(255,255,255,0.05)" }}>
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      
      <div className={styles.header}>
        <h1 className={styles.title}>
          Control Center <span className={styles.adminBadge}>Admin Portal</span>
        </h1>
        <div style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          Logged in: <strong style={{ color: "white" }}>{user.name}</strong>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Platform Sales</div>
          <div className={styles.statValue}>K{metrics.totalSales.toFixed(2)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Platform Fees Collected (2%)</div>
          <div className={styles.statValue} style={{ color: "var(--color-primary-light)" }}>K{metrics.totalFees.toFixed(2)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Active Verified Sellers</div>
          <div className={styles.statValue} style={{ color: "var(--color-secondary)" }}>{metrics.verifiedSellersCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Active Listings</div>
          <div className={styles.statValue}>{metrics.totalListings}</div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        
        {/* Left Column: Moderation & Verifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Moderation Controls Tab Selector */}
          <div className={styles.card}>
            <div className={styles.cardHeader} style={{ padding: 0 }}>
              <div style={{ display: "flex", width: "100%" }}>
                <button 
                  onClick={() => setActiveTab("verifications")}
                  style={{ flex: 1, padding: "16px", background: activeTab === "verifications" ? "transparent" : "rgba(0,0,0,0.2)", border: "none", borderBottom: activeTab === "verifications" ? "2px solid var(--color-primary)" : "none", color: activeTab === "verifications" ? "var(--color-text-primary)" : "var(--color-text-muted)", cursor: "pointer", fontWeight: 600 }}
                >
                  SME Verifications ({pendingSellers.length} pending)
                </button>
                <button 
                  onClick={() => setActiveTab("listings")}
                  style={{ flex: 1, padding: "16px", background: activeTab === "listings" ? "transparent" : "rgba(0,0,0,0.2)", border: "none", borderBottom: activeTab === "listings" ? "2px solid var(--color-primary)" : "none", color: activeTab === "listings" ? "var(--color-text-primary)" : "var(--color-text-muted)", cursor: "pointer", fontWeight: 600 }}
                >
                  Catalog Moderation ({items.length} items)
                </button>
              </div>
            </div>

            {/* TAB 1: SME Verifications */}
            {activeTab === "verifications" && (
              <div className={styles.list}>
                <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  Toggle blue verification checkmarks for Papua New Guinea SMEs.
                </div>
                {sellerList.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--color-text-muted)" }}>
                    No registered stores detected.
                  </div>
                ) : (
                  sellerList.map((seller, idx) => (
                    <div key={idx} className={styles.listItem}>
                      <div className={styles.listItemInfo}>
                        <span className={styles.itemMain} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {seller.name}
                          {seller.isVerified && (
                            <svg className={styles.verifiedIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#10B981" }}>
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                            </svg>
                          )}
                        </span>
                        <span className={styles.itemSub}>Province: {seller.province} | Listings count: {seller.itemCount}</span>
                      </div>
                      <div className={styles.btnGroup}>
                        <button 
                          className={`${styles.actionBtn} ${styles.verifyBtn}`} 
                          onClick={() => toggleSellerVerification(seller.name)}
                          style={{ backgroundColor: seller.isVerified ? "var(--color-surface-hover)" : "var(--color-success)", border: seller.isVerified ? "1px solid rgba(255,255,255,0.1)" : "none", color: seller.isVerified ? "var(--color-text-primary)" : "white" }}
                        >
                          {seller.isVerified ? "Revoke Verification" : "Approve & Verify"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: Catalog Moderation */}
            {activeTab === "listings" && (
              <div className={styles.list}>
                <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  Feature premium products in the Spotlight Hub (toggles homepage star banner) or delete standard items.
                </div>
                {items.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--color-text-muted)" }}>
                    No listings in catalog.
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className={styles.listItem} style={{ gap: "10px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, overflow: "hidden" }}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                          <span className={styles.itemMain} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.title}
                          </span>
                          <span className={styles.itemSub} style={{ fontSize: "0.8rem" }}>
                            Seller: {item.seller} | Price: {item.price}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.btnGroup}>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => toggleSpotlight(item.id)}
                          style={{ 
                            backgroundColor: item.isSpotlight ? "var(--color-secondary)" : "var(--color-surface-hover)", 
                            color: item.isSpotlight ? "#000" : "var(--color-text-primary)",
                            border: item.isSpotlight ? "none" : "1px solid rgba(255,255,255,0.05)"
                          }}
                        >
                          {item.isSpotlight ? "★ Spotlighted" : "Spotlight"}
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${styles.freezeBtn}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete listing '${item.title}'?`)) {
                              deleteListing(item.id);
                            }
                          }}
                          style={{ padding: "6px 10px" }}
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Scam & Abuse Reports */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Scam Reports (User Flagged)</h3>
            </div>
            <div className={styles.list}>
              {reports.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  No reports currently active.
                </div>
              ) : (
                reports.map(item => (
                  <div key={item.id} className={styles.listItem} style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div className={styles.listItemInfo}>
                        <span className={styles.itemMain} style={{ color: "var(--color-error)" }}>{item.reportedUser}</span>
                        <span className={styles.itemSub}>Reported by: {item.reporter} | {item.time}</span>
                      </div>
                      <div className={styles.btnGroup}>
                        <button className={`${styles.actionBtn} ${styles.freezeBtn}`} onClick={() => handleFreeze(item.id, item.reportedUser)}>
                          Emergency Freeze
                        </button>
                        <button className={`${styles.actionBtn} ${styles.dismissBtn}`} onClick={() => handleDismiss(item.id)}>
                          Dismiss
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "6px", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
                      <strong>Reason: </strong> {item.reason}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Assistant Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* AI Copilot Chat */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: "var(--color-secondary)"}}><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12c0-2.4 1-4.7 2.75-6.25"></path><path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"></path></svg>
                AI Admin Assistant
              </h3>
            </div>
            <div className={styles.aiAssistantArea}>
              <div className={styles.aiChatbox}>
                <div>Welcome, Admin. I can scan platform listings and check registration details. Try asking about a registered SME.</div>
                
                {aiResponse && (
                  <div className={styles.aiBubble}>
                    {aiResponse}
                  </div>
                )}
                {isAiLoading && (
                  <div className={styles.aiBubble} style={{ fontStyle: "italic" }}>
                    Analyzing registers & chat transcripts...
                  </div>
                )}
              </div>

              <form onSubmit={handleAiAsk} className={styles.aiInputRow}>
                <input 
                  type="text" 
                  className={styles.aiInput} 
                  placeholder="Ask: 'Is Mary's Craft Shop verified?' or 'verify sellers'..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                />
                <button type="submit" className={styles.aiSendBtn}>
                  Ask AI
                </button>
              </form>

              <div className={styles.aiRecommendationCard}>
                <div className={styles.aiRecHeader}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  AI Alert: Flagged Direct Payments
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: "1.4" }}>
                  Seller <strong>Quick Cash PNG</strong> was detected sending payment account details to buyers. Direct bank transfers violate marketplace safety guidelines. Recommended: Freeze.
                </p>
              </div>
            </div>
          </div>

          {/* AI Logs */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>AI Activity Logs</h3>
            </div>
            <div className={styles.list}>
              {mockAiLogs.map(log => (
                <div key={log.id} className={styles.aiLogItem}>
                  <svg className={styles.aiIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <div className={styles.aiLogContent}>
                    <div className={styles.aiLogHeader}>
                      <span className={`${styles.aiLogLabel} ${log.risk === 'high' ? styles.highRisk : styles.info}`}>
                        {log.label}
                      </span>
                      <span className={styles.aiLogTime}>{log.time}</span>
                    </div>
                    <div className={styles.aiLogMsg}>{log.msg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

