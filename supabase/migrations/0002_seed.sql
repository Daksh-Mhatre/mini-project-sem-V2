-- Seed data mirroring src/data/*.ts so the Supabase-backed app shows the
-- same catalogue as the local demo mode. Safe to re-run (upserts).

insert into public.stores (id, name, rating, distance, delivery_time, area, status) values
  ('freshmart', 'Fresh Mart', 4.8, 1.2, '25–30 min', 'Station Road', 'online'),
  ('ganesh', 'Ganesh Supermarket', 4.6, 1.8, '30–35 min', 'Main Bazaar', 'online'),
  ('dailyneeds', 'Daily Needs', 4.5, 2.4, '35–40 min', 'Shivaji Nagar', 'online'),
  ('annapurna', 'Annapurna Stores', 4.3, 3.1, '40–45 min', 'Old Market', 'offline')
on conflict (id) do update set
  name = excluded.name, rating = excluded.rating, distance = excluded.distance,
  delivery_time = excluded.delivery_time, area = excluded.area, status = excluded.status;

insert into public.delivery_partners (id, name, vehicle, rating) values
  ('rahul', 'Rahul', 'MH 12 AB 4521 · Bike', 4.9),
  ('imran', 'Imran', 'MH 12 CK 1180 · Scooter', 4.7)
on conflict (id) do update set name = excluded.name, vehicle = excluded.vehicle, rating = excluded.rating;

insert into public.products (id, name, category, price, original_price, quantity) values
  ('milk', 'Amul Taaza Toned Milk', 'dairy', 32, 36, '500 ml'),
  ('bread', 'Brown Bread', 'bakery', 45, 50, '400 g'),
  ('eggs', 'Farm Fresh Eggs', 'dairy', 84, 96, '12 pcs'),
  ('butter', 'Salted Butter', 'dairy', 58, null, '100 g'),
  ('paneer', 'Fresh Malai Paneer', 'dairy', 90, 100, '200 g'),
  ('curd', 'Thick Dahi', 'dairy', 40, null, '400 g'),
  ('banana', 'Robusta Banana', 'fruits', 42, 50, '6 pcs'),
  ('tomato', 'Local Tomato', 'fruits', 24, 30, '500 g'),
  ('onion', 'Onion', 'fruits', 38, null, '1 kg'),
  ('potato', 'Potato', 'fruits', 32, 36, '1 kg'),
  ('apple', 'Shimla Apple', 'fruits', 120, 140, '4 pcs'),
  ('spinach', 'Palak (Spinach)', 'fruits', 20, null, '1 bunch'),
  ('rusk', 'Elaichi Rusk', 'bakery', 55, 60, '300 g'),
  ('cake', 'Chocolate Muffins', 'bakery', 80, null, '4 pcs'),
  ('chips', 'Classic Salted Chips', 'snacks', 20, null, '52 g'),
  ('namkeen', 'Aloo Bhujia', 'snacks', 52, 60, '200 g'),
  ('biscuit', 'Glucose Biscuits', 'snacks', 30, null, '250 g'),
  ('tea', 'Premium Tea Leaves', 'beverages', 135, 150, '250 g'),
  ('coffee', 'Instant Coffee', 'beverages', 175, 190, '50 g'),
  ('juice', 'Mixed Fruit Juice', 'beverages', 99, 120, '1 L'),
  ('cola', 'Cola Soft Drink', 'beverages', 40, null, '750 ml'),
  ('maggi', 'Masala Instant Noodles', 'instant', 56, 60, '4 × 70 g'),
  ('oats', 'Rolled Oats', 'instant', 99, 125, '500 g'),
  ('poha', 'Thick Poha', 'instant', 38, null, '500 g'),
  ('atta', 'Whole Wheat Atta', 'staples', 245, 275, '5 kg'),
  ('rice', 'Kolam Rice', 'staples', 360, 399, '5 kg'),
  ('dal', 'Toor Dal', 'staples', 155, 170, '1 kg'),
  ('oil', 'Groundnut Oil', 'masala', 189, 210, '1 L'),
  ('turmeric', 'Haldi Powder', 'masala', 32, null, '100 g'),
  ('soap', 'Neem Bathing Soap', 'personal', 120, 140, '4 × 100 g'),
  ('toothpaste', 'Herbal Toothpaste', 'personal', 95, null, '150 g'),
  ('detergent', 'Detergent Powder', 'cleaning', 110, 125, '1 kg'),
  ('dishwash', 'Dishwash Bar', 'cleaning', 60, null, '3 × 200 g'),
  ('petfood', 'Dog Food Chicken', 'pet', 240, 280, '1 kg'),
  ('notebook', 'Ruled Notebook', 'stationery', 45, null, '172 pages'),
  ('pen', 'Blue Ball Pens', 'stationery', 50, null, '5 pcs')
on conflict (id) do update set
  name = excluded.name, category = excluded.category, price = excluded.price,
  original_price = excluded.original_price, quantity = excluded.quantity;
