import { getDb } from "../api/queries/connection";
import { stations, inventory } from "./schema";

async function seed() {
  const db = getDb();

  // Seed gaming stations
  const stationData = [
    { name: "PC-01", type: "pc" as const, hourlyRate: "40.00", status: "vacant" as const },
    { name: "PC-02", type: "pc" as const, hourlyRate: "40.00", status: "vacant" as const },
    { name: "PC-03", type: "pc" as const, hourlyRate: "40.00", status: "vacant" as const },
    { name: "PC-04", type: "pc" as const, hourlyRate: "40.00", status: "vacant" as const },
    { name: "PS5-01", type: "ps5" as const, hourlyRate: "50.00", status: "vacant" as const },
    { name: "PS5-02", type: "ps5" as const, hourlyRate: "50.00", status: "vacant" as const },
    { name: "PS5-03", type: "ps5" as const, hourlyRate: "50.00", status: "vacant" as const },
    { name: "XBOX-01", type: "xbox" as const, hourlyRate: "45.00", status: "vacant" as const },
    { name: "XBOX-02", type: "xbox" as const, hourlyRate: "45.00", status: "vacant" as const },
    { name: "VR-01", type: "vr" as const, hourlyRate: "60.00", status: "vacant" as const },
  ];

  for (const station of stationData) {
    await db.insert(stations).values(station).onDuplicateKeyUpdate({
      set: { name: station.name },
    });
  }
  console.log("Seeded 10 gaming stations");

  // Seed inventory items
  const inventoryData = [
    { name: "Chips", category: "snack" as const, price: "15.00", stock: 50, lowStockThreshold: 5 },
    { name: "Cola", category: "drink" as const, price: "10.00", stock: 80, lowStockThreshold: 5 },
    { name: "Water", category: "drink" as const, price: "5.00", stock: 100, lowStockThreshold: 5 },
    { name: "Chocolate", category: "snack" as const, price: "20.00", stock: 40, lowStockThreshold: 5 },
    { name: "Coffee", category: "drink" as const, price: "25.00", stock: 30, lowStockThreshold: 5 },
    { name: "Energy Drink", category: "drink" as const, price: "30.00", stock: 45, lowStockThreshold: 5 },
    { name: "Popcorn", category: "snack" as const, price: "12.00", stock: 35, lowStockThreshold: 5 },
    { name: "Sandwich", category: "snack" as const, price: "35.00", stock: 20, lowStockThreshold: 5 },
    { name: "Ice Cream", category: "snack" as const, price: "18.00", stock: 25, lowStockThreshold: 5 },
    { name: "Juice", category: "drink" as const, price: "15.00", stock: 60, lowStockThreshold: 5 },
  ];

  for (const item of inventoryData) {
    await db.insert(inventory).values(item).onDuplicateKeyUpdate({
      set: { name: item.name },
    });
  }
  console.log("Seeded 10 inventory items");

  console.log("Seed complete!");
}

seed().catch(console.error);
