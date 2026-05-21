"use client";

import { useState, useMemo } from "react";
import styles from "./page.module.css";
import { useApp } from "@/context/AppContext";

export default function TransactionsPage() {
  const { transactions, user, updateTransactionStatus } = useApp();
  const [tab, setTab] = useState<"history" | "audit">("history");

  const myTransactions = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return transactions;
    if (user.role === "seller") {
      // Find transactions containing this seller's products
      return transactions.filter(t => 
        t.items.some(item => item.item.seller === user.storeName)
      );
    }
    // Buyer
    return transactions.filter(t => t.buyerId === user.id);
  }, [transactions, user]);

  const downloadInvoice = (txId: string) => {
    alert(`Generating automatic PNG Tax Invoice for transaction ${txId}... Done! PDF ready for download.`);
  };

  const downloadReceipt = (txId: string) => {
    alert(`Generating automatic receipt for transaction ${txId}... Done! PDF ready for download.`);
  };

  // Compute dynamic audit logs based on actual transactions
  const auditLogs = useMemo(() => {
    const logs = [
      { id: 1, action: "Verification Badge Issued", target: "Mary's Craft Shop", actor: "System AI / Admin Approved", time: "May 19, 2026 11:22 AM" },
      { id: 2, action: "Spotlight Status Activated", target: "Custom Handwoven Bilum (Listing)", actor: "Mary's Craft Shop (Seller)", time: "May 19, 2026 09:15 AM" }
    ];

    transactions.forEach((tx, idx) => {
      logs.push({
        id: idx + 3,
        action: "Checkout Completed Successfully",
        target: `${tx.id} (K${tx.total.toFixed(2)})`,
        actor: `${tx.buyerName} (Buyer)`,
        time: `${tx.date} 12:00 PM`
      });

      if (tx.status === "shipped") {
        logs.push({
          id: idx + 100,
          action: "Listing Dispatched / Shipped",
          target: `${tx.id}`,
          actor: "Seller",
          time: `${tx.date} 3:00 PM`
        });
      } else if (tx.status === "received") {
        logs.push({
          id: idx + 200,
          action: "Delivery Confirmed Received",
          target: `${tx.id}`,
          actor: `${tx.buyerName} (Buyer)`,
          time: `${tx.date} 5:00 PM`
        });
      }
    });

    return logs.sort((a, b) => b.id - a.id);
  }, [transactions]);

  const handleConfirmReceived = (txId: string) => {
    updateTransactionStatus(txId, "received");
    alert("Delivery status updated. Thank you for confirming!");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <svg className={styles.titleIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="11" height="11" rx="2" ry="2"></rect></svg>
        Documentation Hub
      </h1>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${tab === "history" ? styles.active : ""}`}
          onClick={() => setTab("history")}
        >
          Transaction History & Invoices
        </button>
        <button 
          className={`${styles.tab} ${tab === "audit" ? styles.active : ""}`}
          onClick={() => setTab("audit")}
        >
          Platform Audit Logs
        </button>
      </div>

      {!user ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }} className="glass">
          <p style={{ color: "var(--color-text-secondary)" }}>Please log in to view your transaction history.</p>
        </div>
      ) : tab === "history" ? (
        <div className={styles.card}>
          {myTransactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
              No transactions recorded yet.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Transaction ID</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Items Bought</th>
                    <th className={styles.th}>Total Amount</th>
                    <th className={styles.th}>Platform Fee (2%)</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className={styles.td} style={{ fontWeight: 600 }}>{tx.id}</td>
                      <td className={styles.td}>{tx.date}</td>
                      <td className={styles.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {tx.items.map((i, idx) => (
                            <span key={idx} style={{ fontSize: "0.85rem" }}>
                              {i.item.title} (x{i.quantity})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={styles.td} style={{ color: "var(--color-primary-light)", fontWeight: 600 }}>
                        K{tx.total.toFixed(2)}
                      </td>
                      <td className={styles.td} style={{ color: "var(--color-text-secondary)" }}>
                        K{tx.fee.toFixed(2)}
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.status} ${
                          tx.status === "received" ? styles.statusSuccess :
                          tx.status === "shipped" ? styles.statusSuccess : ""
                        }`} style={{
                          backgroundColor: tx.status === "received" ? "rgba(16, 185, 129, 0.1)" :
                                           tx.status === "shipped" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: tx.status === "received" ? "var(--color-success)" :
                                 tx.status === "shipped" ? "var(--color-warning)" : "var(--color-error)",
                          textTransform: "capitalize"
                        }}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button className={styles.docBtn} onClick={() => downloadReceipt(tx.id)}>
                            Receipt
                          </button>
                          <button className={styles.docBtn} onClick={() => downloadInvoice(tx.id)}>
                            Invoice
                          </button>
                          
                          {user.role === "buyer" && tx.status === "shipped" && (
                            <button 
                              className={styles.docBtn} 
                              style={{ backgroundColor: "var(--color-success)", color: "white", borderColor: "var(--color-success)" }}
                              onClick={() => handleConfirmReceived(tx.id)}
                            >
                              Confirm Delivery
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.auditLog}>
          {auditLogs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logDetails}>
                <span className={styles.logAction}>{log.action}</span>
                <span className={styles.logMeta}>Target: {log.target} | Performed by: {log.actor}</span>
              </div>
              <span className={styles.logMeta} style={{ fontWeight: 600 }}>{log.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
