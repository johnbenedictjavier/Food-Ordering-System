-- Run this script in the Supabase SQL Editor before accepting orders.
-- It replaces the previous demo schema and removes any existing order data.

drop function if exists public.place_order(text, jsonb);
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.menu_items cascade;

create table public.menu_items (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price > 0),
  active boolean not null default true
);

insert into public.menu_items (id, name, category, price) values
  ('lumpiang-shanghai', 'Lumpiang Shanghai', 'Appetizers', 89.00),
  ('fresh-lumpia', 'Fresh Lumpia', 'Appetizers', 79.00),
  ('gyoza', 'Gyoza', 'Appetizers', 99.00),
  ('takoyaki', 'Takoyaki', 'Appetizers', 99.00),
  ('sinigang-na-baboy', 'Sinigang na Baboy', 'Soup', 169.00),
  ('bulalo', 'Bulalo', 'Soup', 189.00),
  ('chicken-teriyaki', 'Chicken Teriyaki', 'Main Course', 149.00),
  ('lechon-kawali', 'Lechon Kawali', 'Main Course', 169.00),
  ('chicken-katsu', 'Chicken Katsu', 'Main Course', 149.00),
  ('leche-flan', 'Leche Flan', 'Desserts', 69.00),
  ('halo-halo', 'Halo-Halo', 'Desserts', 99.00),
  ('turon', 'Turon', 'Desserts', 49.00),
  ('mochi', 'Mochi', 'Desserts', 69.00),
  ('mango-shake', 'Mango Shake', 'Beverages', 89.00),
  ('calamansi-juice', 'Calamansi Juice', 'Beverages', 59.00),
  ('wintermelon-juice', 'Wintermelon Juice', 'Beverages', 69.00);

create table public.orders (
  id bigint generated always as identity primary key,
  reference text generated always as ('LL-' || lpad(id::text, 6, '0')) stored unique,
  customer_name text not null check (char_length(trim(customer_name)) between 1 and 80),
  total numeric(12, 2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  menu_item_id text not null references public.menu_items(id),
  food_name text not null,
  unit_price numeric(10, 2) not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total numeric(12, 2) generated always as (unit_price * quantity) stored,
  unique (order_id, menu_item_id)
);

create index order_items_order_id_idx on public.order_items(order_id);
create index orders_created_at_idx on public.orders(created_at desc);

alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.menu_items, public.orders, public.order_items from anon, authenticated;
revoke all on sequence public.orders_id_seq, public.order_items_id_seq from anon, authenticated;

create or replace function public.place_order(p_customer_name text, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id bigint;
  v_created_at timestamptz;
  v_item jsonb;
  v_menu_item public.menu_items%rowtype;
  v_quantity integer;
  v_total numeric(12, 2) := 0;
begin
  p_customer_name := btrim(p_customer_name);

  if p_customer_name is null or char_length(p_customer_name) not between 1 and 80 then
    raise exception 'Customer name must contain between 1 and 80 characters.'
      using errcode = '22023';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) not between 1 and 16 then
    raise exception 'An order must contain between 1 and 16 menu items.'
      using errcode = '22023';
  end if;

  insert into public.orders (customer_name)
  values (p_customer_name)
  returning id, created_at into v_order_id, v_created_at;

  for v_item in select value from jsonb_array_elements(p_items) as submitted(value)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or not (v_item ? 'id')
      or not (v_item ? 'quantity') then
      raise exception 'Every order item requires an id and quantity.'
        using errcode = '22023';
    end if;

    begin
      v_quantity := (v_item ->> 'quantity')::integer;
    exception when invalid_text_representation then
      raise exception 'Item quantity must be a whole number.'
        using errcode = '22023';
    end;

    if v_quantity not between 1 and 99 then
      raise exception 'Item quantity must be between 1 and 99.'
        using errcode = '22023';
    end if;

    select * into v_menu_item
    from public.menu_items
    where id = v_item ->> 'id' and active = true;

    if not found then
      raise exception 'Unknown or unavailable menu item: %', v_item ->> 'id'
        using errcode = '22023';
    end if;

    if exists (
      select 1 from public.order_items
      where order_id = v_order_id and menu_item_id = v_menu_item.id
    ) then
      raise exception 'Duplicate menu item: %', v_menu_item.id
        using errcode = '22023';
    end if;

    insert into public.order_items (
      order_id,
      menu_item_id,
      food_name,
      unit_price,
      quantity
    ) values (
      v_order_id,
      v_menu_item.id,
      v_menu_item.name,
      v_menu_item.price,
      v_quantity
    );

    v_total := v_total + (v_menu_item.price * v_quantity);
  end loop;

  update public.orders set total = v_total where id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'reference', 'LL-' || lpad(v_order_id::text, 6, '0'),
    'total', v_total,
    'created_at', v_created_at
  );
end;
$$;

revoke all on function public.place_order(text, jsonb) from public;
grant execute on function public.place_order(text, jsonb) to anon, authenticated;

comment on function public.place_order(text, jsonb) is
  'Validates current menu prices and atomically creates an order with its line items.';
comment on table public.orders is 'Laurel & Ladle order headers.';
comment on table public.order_items is 'Server-priced line items belonging to Laurel & Ladle orders.';
