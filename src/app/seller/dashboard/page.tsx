"use client";

import { useState, useMemo } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function SellerDashboard() {
  const { user, items, transactions, addListing, updateListing, deleteListing, updateTransactionStatus } = useApp();
  const [activeTab, setActiveTab] = useState("listings"); // 'listings' | 'orders' | 'delivery'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("Crafts");
  const [formType, setFormType] = useState<"product" | "service">("product");
  const [formDelivery, setFormDelivery] = useState("2-3 Days");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");

  const storeName = user?.storeName || "Mary's Craft Shop";
  const province = user?.province || "New Ireland";

  // Filter listings belonging to this seller
  const sellerListings = useMemo(() => {
    return items.filter(item => item.seller === storeName);
  }, [items, storeName]);

  // Find transactions that contain items from this seller
  const sellerTransactions = useMemo(() => {
    return transactions.filter(tx => 
      tx.items.some(cartItem => cartItem.item.seller === storeName)
    );
  }, [transactions, storeName]);

  // Calculate stats
  const revenue = useMemo(() => {
    return sellerTransactions
      .filter(tx => tx.status !== "pending") // only completed/shipped transactions count towards revenue
      .reduce((sum, tx) => {
        // Sum price of items matching this seller
        const sellerItemsSum = tx.items
          .filter(cartItem => cartItem.item.seller === storeName)
          .reduce((itemSum, cartItem) => {
            const price = parseFloat(cartItem.item.price.replace(/[^0-9.]/g, "")) || 0;
            return itemSum + price * cartItem.quantity;
          }, 0);
        return sum + sellerItemsSum;
      }, 0);
  }, [sellerTransactions, storeName]);

  const pendingOrdersCount = useMemo(() => {
    return sellerTransactions.filter(tx => tx.status === "pending").length;
  }, [sellerTransactions]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormPrice("K150.00");
    setFormCategory("Crafts");
    setFormType("product");
    setFormDelivery("2-3 Days");
    setFormDescription("");
    setFormImage("/images/handwoven_bilum.png");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormPrice(item.price);
    setFormCategory(item.category);
    setFormType(item.type);
    setFormDelivery(item.delivery);
    setFormDescription(item.description);
    setFormImage(item.image);
    setIsModalOpen(true);
  };

  const handleDelete = (itemId: number) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      deleteListing(itemId);
      alert("Listing deleted successfully!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const listingData = {
      title: formTitle,
      price: formPrice.startsWith("K") ? formPrice : `K${formPrice}`,
      category: formCategory,
      type: formType,
      delivery: formDelivery,
      description: formDescription,
      image: formImage || "/images/handwoven_bilum.png",
      images: [formImage || "/images/handwoven_bilum.png"],
      seller: storeName,
      province: province,
    };

    if (editingItem) {
      updateListing({
        ...editingItem,
        ...listingData
      });
      alert("Listing updated successfully!");
    } else {
      addListing(listingData);
      alert("New listing created successfully!");
    }

    setIsModalOpen(false);
  };

  const handleShipOrder = (txId: string) => {
    updateTransactionStatus(txId, "shipped");
    alert(`Order ${txId} marked as Dispatched/Shipped. The buyer has been notified!`);
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sellerProfile}>
          <div className={styles.avatar}>{storeName.charAt(0)}</div>
          <h2 className={styles.sellerName}>{storeName}</h2>
          <div className={styles.verifiedBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
            </svg>
            {user?.isVerified ? "Verified Seller" : "Pending Verification"}
          </div>
          <div style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "8px" }}>
            {province} Province
          </div>
        </div>

        <div className={styles.menuList}>
          <div 
            className={`${styles.menuItem} ${activeTab === "listings" ? styles.active : ""}`}
            onClick={() => setActiveTab("listings")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"></path><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
            My Listings ({sellerListings.length})
          </div>
          <div 
            className={`${styles.menuItem} ${activeTab === "orders" ? styles.active : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            Orders & Sales ({sellerTransactions.length})
          </div>
          <Link href="/messages" className={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            Chat Messages Inbox
          </Link>
          <div 
            className={`${styles.menuItem} ${activeTab === "delivery" ? styles.active : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Delivery Settings
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {activeTab === "listings" ? "Store Catalog" : activeTab === "orders" ? "Sales & Orders" : "Delivery Settings"}
          </h1>
          {activeTab === "listings" && (
            <button className={styles.addBtn} onClick={handleOpenAddModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Listing
            </button>
          )}
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Total Store Revenue</div>
            <div className={`${styles.statValue} ${styles.revenue}`}>K{revenue.toFixed(2)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Active Catalog Listings</div>
            <div className={styles.statValue}>{sellerListings.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Pending Shipments</div>
            <div className={styles.statValue} style={{ color: pendingOrdersCount > 0 ? "var(--color-warning)" : "var(--color-text-primary)" }}>
              {pendingOrdersCount}
            </div>
          </div>
        </div>

        {/* Dynamic Tabs */}
        {activeTab === "listings" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Your Products & Services</h3>
            </div>
            
            {sellerListings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--color-text-muted)" }}>
                You haven't listed any products or services yet. Click "New Listing" to start selling!
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Item</th>
                      <th className={styles.th}>Price</th>
                      <th className={styles.th}>Category</th>
                      <th className={styles.th}>Type</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerListings.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.td}>
                          <div className={styles.itemInfo}>
                            <img src={item.image} alt={item.title} className={item.id ? styles.itemThumb : ""} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px" }} />
                            <span className={styles.itemName}>{item.title}</span>
                          </div>
                        </td>
                        <td className={styles.td} style={{ fontWeight: 600, color: "var(--color-secondary)" }}>{item.price}</td>
                        <td className={styles.td}>{item.category}</td>
                        <td className={styles.td}>
                          <span className={`${styles.status} ${styles.active}`} style={{
                            backgroundColor: item.type === "product" ? "rgba(206, 17, 38, 0.1)" : "rgba(252, 209, 22, 0.1)",
                            color: item.type === "product" ? "var(--color-primary-light)" : "var(--color-secondary)",
                            textTransform: "capitalize"
                          }}>
                            {item.type}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <button className={styles.actionBtn} onClick={() => handleOpenEditModal(item)} aria-label="Edit listing">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                          </button>
                          <button className={styles.actionBtn} style={{ marginLeft: "8px", color: "var(--color-error)" }} onClick={() => handleDelete(item.id)} aria-label="Delete listing">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Sales Log & Customer Orders</h3>
            </div>
            
            {sellerTransactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--color-text-muted)" }}>
                No customer orders have been received yet. Keep sharing your shop!
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Order ID</th>
                      <th className={styles.th}>Customer</th>
                      <th className={styles.th}>Items Ordered</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className={styles.td} style={{ fontWeight: 600 }}>{tx.id}</td>
                        <td className={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600 }}>{tx.buyerName}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>{tx.phone}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", maxWidth: "200px" }}>{tx.address}, {tx.province}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            {tx.items
                              .filter(cartItem => cartItem.item.seller === storeName)
                              .map((i, idx) => (
                                <span key={idx} style={{ fontSize: "0.85rem" }}>
                                  {i.item.title} (x{i.quantity})
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.status}`} style={{
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
                          {tx.status === "pending" ? (
                            <button 
                              className={styles.addBtn}
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                              onClick={() => handleShipOrder(tx.id)}
                            >
                              Dispatch/Ship Order
                            </button>
                          ) : tx.status === "shipped" ? (
                            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Awaiting buyer receipt</span>
                          ) : (
                            <span style={{ fontSize: "0.85rem", color: "var(--color-success)", fontWeight: 500 }}>Delivered ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "delivery" && (
          <div className={styles.card} style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Configure Regional Delivery Operations</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
              Define shipping fees and timeframes for different provinces inside Papua New Guinea. Local buyers see these rates at checkout.
            </p>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                <div style={{ flex: 1, fontWeight: 600 }}>National Capital District (NCD)</div>
                <div style={{ width: "120px" }}><input type="text" className={styles.addBtn} style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px", width: "100%", borderRadius: "4px" }} defaultValue="K15.00" /></div>
                <div style={{ width: "150px" }}><input type="text" className={styles.addBtn} style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px", width: "100%", borderRadius: "4px" }} defaultValue="1-2 Days" /></div>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                <div style={{ flex: 1, fontWeight: 600 }}>Islands Region (NIP, ENB, WNB)</div>
                <div style={{ width: "120px" }}><input type="text" className={styles.addBtn} style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px", width: "100%", borderRadius: "4px" }} defaultValue="K25.00" /></div>
                <div style={{ width: "150px" }}><input type="text" className={styles.addBtn} style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px", width: "100%", borderRadius: "4px" }} defaultValue="2-4 Days" /></div>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ flex: 1, fontWeight: 600 }}>Momase / Highlands / Southern</div>
                <div style={{ width: "120px" }}><input type="text" className={styles.addBtn} style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px", width: "100%", borderRadius: "4px" }} defaultValue="K30.00" /></div>
                <div style={{ width: "150px" }}><input type="text" className={styles.addBtn} style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px", width: "100%", borderRadius: "4px" }} defaultValue="5-7 Days" /></div>
              </div>
            </div>
            
            <button className={styles.addBtn} style={{ marginTop: "2rem" }} onClick={() => alert("Delivery configurations updated successfully!")}>
              Save Delivery Settings
            </button>
          </div>
        )}
      </main>

      {/* Listing Form Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.85)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backdropFilter: "blur(5px)"
        }}>
          <form onSubmit={handleSubmit} style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "var(--radius-lg)",
            width: "100%",
            maxWidth: "600px",
            padding: "2rem",
            maxHeight: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, margin: 0 }}>
              {editingItem ? "Edit Product Listing" : "Create New Market Listing"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "-10px", marginBottom: "10px" }}>
              Fill in details to showcase your product or service on the PNG SME marketplace.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Listing Title</label>
              <input 
                type="text" 
                placeholder="e.g. Traditional Clay Pot" 
                required 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px", borderRadius: "var(--radius-sm)", outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Price (PGK Kina)</label>
                <input 
                  type="text" 
                  placeholder="e.g. K120.00" 
                  required 
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px", borderRadius: "var(--radius-sm)", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Category</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px", borderRadius: "var(--radius-sm)", outline: "none" }}
                >
                  <option value="Crafts">Crafts & Artifacts</option>
                  <option value="Agriculture">Agriculture & Fresh Produce</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Jewelry">Jewelry & Accessories</option>
                  <option value="Maintenance">Maintenance Services</option>
                  <option value="Digital Services">Digital Services</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Listing Type</label>
                <select 
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px", borderRadius: "var(--radius-sm)", outline: "none" }}
                >
                  <option value="product">Product (Physical Good)</option>
                  <option value="service">Service (Professional/Labor)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Delivery Timeframe</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2-3 Days or Local Delivery" 
                  required 
                  value={formDelivery}
                  onChange={(e) => setFormDelivery(e.target.value)}
                  style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px", borderRadius: "var(--radius-sm)", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Image URL</label>
              <input 
                type="text" 
                placeholder="e.g. /images/wooden_bowl.png or custom URL" 
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px", borderRadius: "var(--radius-sm)", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Listing Description</label>
              <textarea 
                placeholder="Describe your craft or service in details..." 
                required 
                rows={4}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                style={{ background: "var(--color-surface-light)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px", borderRadius: "var(--radius-sm)", outline: "none", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", padding: "8px 16px", borderRadius: "var(--radius-full)", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.addBtn}
              >
                {editingItem ? "Update Listing" : "Publish Listing"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
