import type { DeliveryPartner, Store, User } from "../types";

export const stores: Store[] = [
  { id: "freshmart", name: "Fresh Mart", rating: 4.8, distance: 1.2, deliveryTime: "25–30 min", area: "Station Road", status: "online" },
  { id: "ganesh", name: "Ganesh Supermarket", rating: 4.6, distance: 1.8, deliveryTime: "30–35 min", area: "Main Bazaar", status: "online" },
  { id: "dailyneeds", name: "Daily Needs", rating: 4.5, distance: 2.4, deliveryTime: "35–40 min", area: "Shivaji Nagar", status: "online" },
  { id: "annapurna", name: "Annapurna Stores", rating: 4.3, distance: 3.1, deliveryTime: "40–45 min", area: "Old Market", status: "offline" },
];

export const deliveryPartners: DeliveryPartner[] = [
  { id: "rahul", name: "Rahul", vehicle: "MH 12 AB 4521 · Bike", rating: 4.9 },
  { id: "imran", name: "Imran", vehicle: "MH 12 CK 1180 · Scooter", rating: 4.7 },
];

export const currentUser: User = {
  name: "Aarav",
  phone: "+91 98765 43210",
  addressLabel: "Home",
  address: "Flat 204, Sai Krupa Society, Near Bus Stand",
  city: "Baramati, Maharashtra",
};

export const findStore = (id: string) => stores.find((s) => s.id === id) ?? stores[0];
export const findPartner = (id?: string) => deliveryPartners.find((p) => p.id === id);
