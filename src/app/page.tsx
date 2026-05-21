"use client";

import { useState, useMemo } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const { items } = useApp();
  const [selectedProvince, setSelectedProvince] = useState("All");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'product' | 'service'
  const [searchQuery, setSearchQuery] = useState("");

  const spotlightItems = useMemo(() => {
    const featured = items.filter(item => item.isSpotlight);
    return featured.length > 0 ? featured : items.filter(item => item.id <= 4);
  }, [items]);

  const provincialItems = useMemo(() => {
    const featuredIds = spotlightItems.map(i => i.id);
    return items.filter(item => !featuredIds.includes(item.id));
  }, [items, spotlightItems]);

  const filteredSpotlight = useMemo(() => {
    return spotlightItems.filter(item => {
      const matchesProvince = selectedProvince === "All" || item.province === selectedProvince;
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProvince && matchesType && matchesSearch;
    });
  }, [spotlightItems, selectedProvince, filterType, searchQuery]);

  const filteredProvincial = useMemo(() => {
    return provincialItems.filter(item => {
      const matchesProvince = selectedProvince === "All" || item.province === selectedProvince;
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProvince && matchesType && matchesSearch;
    });
  }, [provincialItems, selectedProvince, filterType, searchQuery]);

  return (
    <>
      <section className={styles["hero-section"]}>
        <div className={styles["hero-bg"]}></div>
        <h1 className={styles["hero-title"]}>Empowering PNG Businesses</h1>
        <p className={styles["hero-subtitle"]}>
          The premier marketplace connecting SMEs and vendors with buyers across Papua New Guinea.
        </p>
        <div className={styles["search-container"]}>
          <input 
            type="text" 
            className={styles["search-input"]} 
            placeholder="Search products, services, or stores..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles["search-btn"]}>Search</button>
        </div>
      </section>

      {/* Main Filter Bar */}
      <section className={styles["section-container"]} style={{ marginBottom: "2rem" }}>
        <div className={styles.filters} style={{ justifyContent: "center", gap: "12px" }}>
          <button 
            className={`${styles["filter-btn"]} ${filterType === "all" ? styles.active : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Listings
          </button>
          <button 
            className={`${styles["filter-btn"]} ${filterType === "product" ? styles.active : ""}`}
            onClick={() => setFilterType("product")}
          >
            Products
          </button>
          <button 
            className={`${styles["filter-btn"]} ${filterType === "service" ? styles.active : ""}`}
            onClick={() => setFilterType("service")}
          >
            Services
          </button>
        </div>
      </section>

      {/* Spotlight Hub */}
      <section className={styles["section-container"]}>
        <div className={styles["section-header"]}>
          <h2 className={styles["section-title"]}>
            <span className={styles["section-title-icon"]}>★</span> Spotlight Hub
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Featured Artisans & Premium Deals
          </span>
        </div>
        
        {filteredSpotlight.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
            No Spotlight listings match your criteria.
          </div>
        ) : (
          <div className={styles["product-grid"]}>
            {filteredSpotlight.map(item => (
              <Link href={`/items/${item.id}`} key={item.id}>
                <div className={styles["product-card"]}>
                  <div className={styles["card-image-wrapper"]}>
                    <img src={item.image} alt={item.title} className={styles["card-image"]} />
                    <div className={styles["card-badges"]}>
                      <span className={`${styles.badge} ${styles.spotlight}`}>Spotlight</span>
                      <span className={`${styles.badge} ${styles.province}`}>{item.province}</span>
                    </div>
                  </div>
                  <div className={styles["card-content"]}>
                    <h3 className={styles["card-title"]}>{item.title}</h3>
                    <div className={styles["card-seller"]}>
                      {item.seller}
                      {item.isVerified && (
                        <svg className={styles["verified-icon"]} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                        </svg>
                      )}
                    </div>
                    <div className={styles["card-footer"]}>
                      <div className={styles["card-price"]}>{item.price}</div>
                      <div className={styles["card-delivery"]}>{item.delivery}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Provincial Markets */}
      <section className={styles["section-container"]}>
        <div className={styles["section-header"]}>
          <h2 className={styles["section-title"]}>Provincial Markets</h2>
          <div className={styles.filters}>
            <button 
              className={`${styles["filter-btn"]} ${selectedProvince === "All" ? styles.active : ""}`}
              onClick={() => setSelectedProvince("All")}
            >
              All Provinces
            </button>
            <button 
              className={`${styles["filter-btn"]} ${selectedProvince === "New Ireland" ? styles.active : ""}`}
              onClick={() => setSelectedProvince("New Ireland")}
            >
              New Ireland
            </button>
            <button 
              className={`${styles["filter-btn"]} ${selectedProvince === "East New Britain" ? styles.active : ""}`}
              onClick={() => setSelectedProvince("East New Britain")}
            >
              East New Britain
            </button>
            <button 
              className={`${styles["filter-btn"]} ${selectedProvince === "West New Britain" ? styles.active : ""}`}
              onClick={() => setSelectedProvince("West New Britain")}
            >
              West New Britain
            </button>
          </div>
        </div>

        {filteredProvincial.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
            No listings found in this region matching your criteria.
          </div>
        ) : (
          <div className={styles["product-grid"]}>
            {filteredProvincial.map(item => (
              <Link href={`/items/${item.id}`} key={item.id}>
                <div className={styles["product-card"]}>
                  <div className={styles["card-image-wrapper"]}>
                    <img src={item.image} alt={item.title} className={styles["card-image"]} />
                    <div className={styles["card-badges"]}>
                      <span className={`${styles.badge} ${styles.province}`}>{item.province}</span>
                    </div>
                  </div>
                  <div className={styles["card-content"]}>
                    <h3 className={styles["card-title"]}>{item.title}</h3>
                    <div className={styles["card-seller"]}>
                      {item.seller}
                      {item.isVerified && (
                        <svg className={styles["verified-icon"]} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                        </svg>
                      )}
                    </div>
                    <div className={styles["card-footer"]}>
                      <div className={styles["card-price"]}>{item.price}</div>
                      <div className={styles["card-delivery"]}>{item.delivery}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
