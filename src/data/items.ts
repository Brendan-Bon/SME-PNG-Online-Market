export interface MarketItem {
  id: number;
  title: string;
  price: string;
  seller: string;
  isVerified: boolean;
  province: string;
  delivery: string;
  type: "product" | "service";
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  description: string;
  isSpotlight?: boolean;
}

export const marketItems: MarketItem[] = [
  {
    id: 1,
    title: "Handwoven Bilum - Custom Design",
    price: "K150.00",
    seller: "Mary's Craft Shop",
    isVerified: true,
    province: "New Ireland",
    delivery: "2-3 Days",
    type: "product",
    image: "/images/handwoven_bilum.png",
    images: [
      "/images/handwoven_bilum.png",
      "/images/wooden_bowl.png",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop"
    ],
    category: "Crafts",
    rating: 4.8,
    reviews: 124,
    description: "Authentic handwoven bilum from New Ireland Province. Made with traditional natural fibers combined with modern vibrant acrylic yarns. Perfect for everyday use. Each piece takes 2 weeks to complete."
  },
  {
    id: 2,
    title: "Fresh Organic Vanilla Beans (1kg)",
    price: "K450.00",
    seller: "East New Britain Spices",
    isVerified: true,
    province: "East New Britain",
    delivery: "1 Week",
    type: "product",
    image: "/images/vanilla_beans.png",
    images: [
      "/images/vanilla_beans.png"
    ],
    category: "Agriculture",
    rating: 4.9,
    reviews: 86,
    description: "Premium grade planifolia vanilla pods from East New Britain. Plump, oily, and highly aromatic. Ideal for culinary use, extracts, and baking. Hand-pollinated and sun-cured by local farmers."
  },
  {
    id: 3,
    title: "Local Cocoa Butter Soap",
    price: "K25.00",
    seller: "WNB Organics",
    isVerified: false,
    province: "West New Britain",
    delivery: "Local Pickup",
    type: "product",
    image: "/images/cocoa_soap.png",
    images: [
      "/images/cocoa_soap.png"
    ],
    category: "Health & Beauty",
    rating: 4.6,
    reviews: 42,
    description: "Natural handmade soap bar crafted with pure West New Britain cocoa butter. Rich in antioxidants and deeply moisturizing. Free from harsh chemicals, synthetic fragrances, or artificial colorants."
  },
  {
    id: 4,
    title: "Carved Wooden Tami Bowl",
    price: "K350.00",
    seller: "PNG Artifacts",
    isVerified: true,
    province: "New Ireland",
    delivery: "3-5 Days",
    type: "product",
    image: "/images/wooden_bowl.png",
    images: [
      "/images/wooden_bowl.png"
    ],
    category: "Crafts",
    rating: 4.7,
    reviews: 19,
    description: "Exquisite hand-carved wooden bowl from the Tami Islands. Carved from premium local hardwood with traditional animal and ancestral figures. A perfect center-piece or collector's item representing PNG's rich heritage."
  },
  {
    id: 5,
    title: "Plumbing Repair Services",
    price: "K80.00/hr",
    seller: "NIP Maintenance",
    isVerified: true,
    province: "New Ireland",
    delivery: "Service",
    type: "service",
    image: "/images/plumbing_service.png",
    images: [
      "/images/plumbing_service.png"
    ],
    category: "Maintenance",
    rating: 4.5,
    reviews: 31,
    description: "Professional plumbing repair services in New Ireland. Specializing in leak detection, pipe replacement, drain cleaning, and fixture installations. Reliable, fast, and fully equipped local technicians."
  },
  {
    id: 6,
    title: "Fresh Taro (10kg Bag)",
    price: "K60.00",
    seller: "Kokopo Farmers Market",
    isVerified: false,
    province: "East New Britain",
    delivery: "Local Delivery",
    type: "product",
    image: "/images/fresh_taro.png",
    images: [
      "/images/fresh_taro.png"
    ],
    category: "Agriculture",
    rating: 4.8,
    reviews: 65,
    description: "Freshly harvested taro corms from the fertile volcanic soils of East New Britain. Excellent texture and taste, perfect for traditional family meals. Organically grown with zero chemical pesticides."
  },
  {
    id: 7,
    title: "Handcrafted Shell Necklace",
    price: "K45.00",
    seller: "Island Treasures",
    isVerified: true,
    province: "West New Britain",
    delivery: "2-4 Days",
    type: "product",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Jewelry",
    rating: 4.7,
    reviews: 54,
    description: "Stunning handcrafted necklace made from carefully selected sea shells from West New Britain beaches. A beautiful piece of island accessory reflecting PNG's marine beauty."
  },
  {
    id: 8,
    title: "Graphic Design Services",
    price: "K120.00/project",
    seller: "Rabaul Creatives",
    isVerified: true,
    province: "East New Britain",
    delivery: "Digital",
    type: "service",
    image: "https://images.unsplash.com/photo-1626785779165-8b8a9235ebbd?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1626785779165-8b8a9235ebbd?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Digital Services",
    rating: 4.9,
    reviews: 78,
    description: "Professional graphic design services including logos, branding, posters, brochures, and social media flyers. Tailored to represent your PNG business identity with high-quality digital deliverables."
  }
];
