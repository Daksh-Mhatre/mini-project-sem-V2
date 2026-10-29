import type { Product } from "../types";

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&q=70`;

type Seed = Omit<Product, "description"> & { description?: string };

const seeds: Seed[] = [
  { id: "milk", name: "Amul Taaza Toned Milk", category: "dairy", image: img("1563636619-e9143da7973b"), emoji: "🥛", quantity: "500 ml", price: 32, originalPrice: 36, tags: ["breakfast", "popular"] },
  { id: "bread", name: "Brown Bread", category: "bakery", image: img("1509440159596-0249088772ff"), emoji: "🍞", quantity: "400 g", price: 45, originalPrice: 50, tags: ["breakfast", "popular"] },
  { id: "eggs", name: "Farm Fresh Eggs", category: "dairy", image: img("1582722872445-44dc5f7e3c8f"), emoji: "🥚", quantity: "12 pcs", price: 84, originalPrice: 96, tags: ["breakfast", "fresh"] },
  { id: "butter", name: "Salted Butter", category: "dairy", image: img("1589985270826-4b7bb135bc9d"), emoji: "🧈", quantity: "100 g", price: 58, tags: ["breakfast"] },
  { id: "paneer", name: "Fresh Malai Paneer", category: "dairy", image: img("1631452180519-c014fe946bc7"), emoji: "🧀", quantity: "200 g", price: 90, originalPrice: 100, tags: ["fresh"] },
  { id: "curd", name: "Thick Dahi", category: "dairy", image: img("1488477181946-6428a0291777"), emoji: "🥣", quantity: "400 g", price: 40, tags: ["popular"] },
  { id: "banana", name: "Robusta Banana", category: "fruits", image: img("1571771894821-ce9b6c11b08e"), emoji: "🍌", quantity: "6 pcs", price: 42, originalPrice: 50, tags: ["breakfast", "fresh"] },
  { id: "tomato", name: "Local Tomato", category: "fruits", image: img("1546094096-0df4bcaaa337"), emoji: "🍅", quantity: "500 g", price: 24, originalPrice: 30, tags: ["fresh", "popular"] },
  { id: "onion", name: "Onion", category: "fruits", image: img("1618512496248-a07fe83aa8cb"), emoji: "🧅", quantity: "1 kg", price: 38, tags: ["fresh"] },
  { id: "potato", name: "Potato", category: "fruits", image: img("1518977676601-b53f82aba655"), emoji: "🥔", quantity: "1 kg", price: 32, originalPrice: 36, tags: ["fresh"] },
  { id: "apple", name: "Shimla Apple", category: "fruits", image: img("1560806887-1e4cd0b6cbd6"), emoji: "🍎", quantity: "4 pcs", price: 120, originalPrice: 140, tags: ["fresh"] },
  { id: "spinach", name: "Palak (Spinach)", category: "fruits", image: img("1576045057995-568f588f82fb"), emoji: "🥬", quantity: "1 bunch", price: 20, tags: ["fresh"] },
  { id: "rusk", name: "Elaichi Rusk", category: "bakery", image: img("1558961363-fa8fdf82db35"), emoji: "🥖", quantity: "300 g", price: 55, originalPrice: 60, tags: ["breakfast"] },
  { id: "cake", name: "Chocolate Muffins", category: "bakery", image: img("1607958996333-41aef7caefaa"), emoji: "🧁", quantity: "4 pcs", price: 80, tags: [] },
  { id: "chips", name: "Classic Salted Chips", category: "snacks", image: img("1566478989037-eec170784d0b"), emoji: "🥔", quantity: "52 g", price: 20, tags: ["popular"] },
  { id: "namkeen", name: "Aloo Bhujia", category: "snacks", image: img("1599490659213-e2b9527bd087"), emoji: "🥜", quantity: "200 g", price: 52, originalPrice: 60, tags: ["popular"] },
  { id: "biscuit", name: "Glucose Biscuits", category: "snacks", image: img("1558961363-fa8fdf82db35"), emoji: "🍪", quantity: "250 g", price: 30, tags: ["breakfast"] },
  { id: "tea", name: "Premium Tea Leaves", category: "beverages", image: img("1597318181409-cf64d0b5d8a2"), emoji: "🍵", quantity: "250 g", price: 135, originalPrice: 150, tags: ["breakfast", "popular"] },
  { id: "coffee", name: "Instant Coffee", category: "beverages", image: img("1559056199-641a0ac8b55e"), emoji: "☕", quantity: "50 g", price: 175, originalPrice: 190, tags: ["breakfast"] },
  { id: "juice", name: "Mixed Fruit Juice", category: "beverages", image: img("1600271886742-f049cd451bba"), emoji: "🧃", quantity: "1 L", price: 99, originalPrice: 120, tags: [] },
  { id: "cola", name: "Cola Soft Drink", category: "beverages", image: img("1622483767028-3f66f32aef97"), emoji: "🥤", quantity: "750 ml", price: 40, tags: ["popular"] },
  { id: "maggi", name: "Masala Instant Noodles", category: "instant", image: img("1612929633738-8fe44f7ec841"), emoji: "🍜", quantity: "4 × 70 g", price: 56, originalPrice: 60, tags: ["popular"] },
  { id: "oats", name: "Rolled Oats", category: "instant", image: img("1614961233913-a5113a4a34ed"), emoji: "🥣", quantity: "500 g", price: 99, originalPrice: 125, tags: ["breakfast"] },
  { id: "poha", name: "Thick Poha", category: "instant", image: img("1586201375761-83865001e31c"), emoji: "🍚", quantity: "500 g", price: 38, tags: ["breakfast"] },
  { id: "atta", name: "Whole Wheat Atta", category: "staples", image: img("1574323347407-f5e1ad6d020b"), emoji: "🌾", quantity: "5 kg", price: 245, originalPrice: 275, tags: ["popular"] },
  { id: "rice", name: "Kolam Rice", category: "staples", image: img("1586201375761-83865001e31c"), emoji: "🍚", quantity: "5 kg", price: 360, originalPrice: 399, tags: [] },
  { id: "dal", name: "Toor Dal", category: "staples", image: img("1515543904379-3d757afe72e4"), emoji: "🫘", quantity: "1 kg", price: 155, originalPrice: 170, tags: [] },
  { id: "oil", name: "Groundnut Oil", category: "masala", image: img("1474979266404-7eaacbcd87c5"), emoji: "🫒", quantity: "1 L", price: 189, originalPrice: 210, tags: [] },
  { id: "turmeric", name: "Haldi Powder", category: "masala", image: img("1615485500704-8e990f9900f7"), emoji: "🟡", quantity: "100 g", price: 32, tags: [] },
  { id: "soap", name: "Neem Bathing Soap", category: "personal", image: img("1600857544200-b2f666a9a2ec"), emoji: "🧼", quantity: "4 × 100 g", price: 120, originalPrice: 140, tags: [] },
  { id: "toothpaste", name: "Herbal Toothpaste", category: "personal", image: img("1559591937-abc3a5f7e3b3"), emoji: "🪥", quantity: "150 g", price: 95, tags: [] },
  { id: "detergent", name: "Detergent Powder", category: "cleaning", image: img("1585421514738-01798e348b17"), emoji: "🧺", quantity: "1 kg", price: 110, originalPrice: 125, tags: [] },
  { id: "dishwash", name: "Dishwash Bar", category: "cleaning", image: img("1583947215259-38e31be8751f"), emoji: "🧽", quantity: "3 × 200 g", price: 60, tags: [] },
  { id: "petfood", name: "Dog Food Chicken", category: "pet", image: img("1589924691995-400dc9ecc119"), emoji: "🐶", quantity: "1 kg", price: 240, originalPrice: 280, tags: [] },
  { id: "notebook", name: "Ruled Notebook", category: "stationery", image: img("1531346878377-a5be20888e57"), emoji: "📒", quantity: "172 pages", price: 45, tags: [] },
  { id: "pen", name: "Blue Ball Pens", category: "stationery", image: img("1583485088034-697b5bc54ccd"), emoji: "🖊️", quantity: "5 pcs", price: 50, tags: [] },
];

export const products: Product[] = seeds.map((s) => ({
  ...s,
  description:
    s.description ??
    `Sourced and packed by your local partner store. ${s.name} is picked fresh from the shelf when you order — no warehouse, no long storage.`,
}));

const byId = new Map(products.map((p) => [p.id, p]));
export const findProduct = (id: string) => byId.get(id);
export const productsByTag = (tag: string) => products.filter((p) => p.tags.includes(tag));
export const productsByCategory = (id: string) => products.filter((p) => p.category === id);

export const popularSearches = ["Milk", "Bread", "Eggs", "Atta", "Maggi", "Tea", "Tomato", "Chips"];

export const deals = [
  { id: "d1", title: "Flat ₹30 off", subtitle: "On orders above ₹299", code: "LOCAL30", tint: "#EAF7EE", emoji: "🛒" },
  { id: "d2", title: "Free delivery", subtitle: "First 3 orders from any store", code: "FREEDEL", tint: "#FFF6DB", emoji: "🛵" },
  { id: "d3", title: "Fresh Fridays", subtitle: "Up to 20% off on veggies", code: "FRESH20", tint: "#FDEFE9", emoji: "🥕" },
];
