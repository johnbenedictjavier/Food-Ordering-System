-- Run this script once in the Supabase SQL Editor.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (
    char_length(trim(customer_name)) between 1 and 80
  ),
  food_id text not null,
  food_name text not null,
  unit_price numeric(10, 2) not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 99),
  total_price numeric(12, 2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now(),
  constraint valid_menu_item check (
    (food_id = 'classic-cheeseburger' and food_name = 'Classic Cheeseburger' and unit_price = 99.00)
    or (food_id = 'crispy-chicken-burger' and food_name = 'Crispy Chicken Burger' and unit_price = 129.00)
    or (food_id = 'fried-chicken-rice' and food_name = 'Fried Chicken & Rice' and unit_price = 149.00)
    or (food_id = 'golden-fries' and food_name = 'Golden Fries' and unit_price = 59.00)
    or (food_id = 'cheesy-spaghetti' and food_name = 'Cheesy Spaghetti' and unit_price = 89.00)
    or (food_id = 'hot-fudge-sundae' and food_name = 'Hot Fudge Sundae' and unit_price = 49.00)
  )
);

alter table public.orders enable row level security;

revoke all on table public.orders from anon, authenticated;
grant insert (customer_name, food_id, food_name, unit_price, quantity)
  on table public.orders to anon, authenticated;

drop policy if exists "Public can place orders" on public.orders;
create policy "Public can place orders"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

comment on table public.orders is
  'Orders submitted by the Food Ordering System kiosk.';
