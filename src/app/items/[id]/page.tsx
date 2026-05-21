"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function ItemPage() {
  const { items, addToCart, user } = useApp();
  const params = useParams();
  const itemId = params?.id ? parseInt(params.id as string) : 1;
  
  // Find item from dynamic context list
  const item = items.find(i => i.id === itemId) || items[0];

  const [activeImage, setActiveImage] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!item) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Product Not Found</h2>
        <Link href="/" style={{ color: "var(--color-primary)", marginTop: "20px", display: "inline-block" }}>
          ← Back to Homepage
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(item);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2000);
  };

  return (
    <div className={styles.itemContainer}>
      
      {/* Gallery */}
      <div className={styles.gallery}>
        <img 
          src={(item.images && item.images[activeImage]) || item.image} 
          alt={item.title} 
          className={styles.mainImage} 
        />
        {item.images && item.images.length > 1 && (
          <div className={styles.thumbnailRow}>
            {item.images.map((img, idx) => (
              <img 
                key={idx}
                src={img} 
                alt={`Thumbnail ${idx}`} 
                className={`${styles.thumbnail} ${activeImage === idx ? styles.active : ""}`}
                onClick={() => setActiveImage(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className={styles.details}>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles.badgeProvince}`}>{item.province}</span>
          <span className={`${styles.badge} ${styles.badgeCategory}`}>{item.category}</span>
        </div>
        
        <h1 className={styles.title}>{item.title}</h1>
        
        <div className={styles.ratingRow}>
          <span>{"★".repeat(Math.floor(item.rating || 5))}</span>
          <span className={styles.reviewCount}>({item.reviews || 0} reviews)</span>
        </div>
        
        <div className={styles.price}>{item.price}</div>
        
        <div className={styles.sellerCard}>
          <div className={styles.sellerHeader}>
            <div className={styles.sellerName}>
              Sold by {item.seller}
              {item.isVerified && (
                <svg className={styles.verifiedIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                </svg>
              )}
            </div>
            <span style={{ color: "var(--color-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
              Verified Partner
            </span>
          </div>
          
          <div className={styles.deliveryInfo}>
            <svg className={styles.deliveryIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Delivery: {item.delivery}
          </div>
        </div>

        <div className={styles.actionGroup}>
          {user ? (
            <button 
              className={styles.addToCartBtn} 
              onClick={handleAddToCart}
              style={{
                backgroundColor: addedFeedback ? "var(--color-success)" : "var(--color-primary)",
                transition: "background-color 0.2s"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {addedFeedback ? "Added to Cart! ✓" : "Add to Cart"}
            </button>
          ) : (
            <Link href={`/auth?redirect=${encodeURIComponent(`/items/${item.id}`)}`} style={{ flex: 1 }}>
              <button className={styles.addToCartBtn} style={{ width: "100%" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Login to Add to Cart
              </button>
            </Link>
          )}
          
          <Link 
            href={user ? `/messages?seller=${encodeURIComponent(item.seller)}&itemId=${item.id}` : `/auth?redirect=${encodeURIComponent(`/items/${item.id}`)}`} 
            style={{ flex: 1 }}
          >
            <button className={styles.messageBtn} style={{ width: "100%" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              {user ? "Message Seller" : "Login to Message"}
            </button>
          </Link>
        </div>

        <div className={styles.divider}></div>
        
        <div>
          <h2 className={styles.descriptionTitle}>Description</h2>
          <p className={styles.description}>{item.description}</p>
        </div>
      </div>
      
    </div>
  );
}
