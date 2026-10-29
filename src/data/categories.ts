import type { Category } from "../types";

export const categories: Category[] = [
  { id: "fruits", name: "Fruits & Vegetables", emoji: "🥦", tint: "#E8F5E4" },
  { id: "dairy", name: "Dairy & Eggs", emoji: "🥛", tint: "#EAF2FB" },
  { id: "bakery", name: "Bakery", emoji: "🍞", tint: "#FBF1E4" },
  { id: "snacks", name: "Snacks", emoji: "🍿", tint: "#FDEFE9" },
  { id: "beverages", name: "Beverages", emoji: "🧃", tint: "#FFF6DB" },
  { id: "instant", name: "Instant Food", emoji: "🍜", tint: "#FCEBEB" },
  { id: "staples", name: "Rice & Atta", emoji: "🌾", tint: "#F5F0E6" },
  { id: "masala", name: "Masala & Oil", emoji: "🌶️", tint: "#FDECEC" },
  { id: "personal", name: "Personal Care", emoji: "🧴", tint: "#F1ECFB" },
  { id: "cleaning", name: "Cleaning", emoji: "🧽", tint: "#E6F6F7" },
  { id: "pet", name: "Pet Supplies", emoji: "🐾", tint: "#F4EFEA" },
  { id: "stationery", name: "Stationery", emoji: "✏️", tint: "#EEF1F6" },
];

export const findCategory = (id: string) => categories.find((c) => c.id === id);
