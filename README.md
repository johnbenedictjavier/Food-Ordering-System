# Laurel & Ladle

A responsive Filipino and Asian comfort-food ordering kiosk built with vanilla HTML, CSS, and JavaScript.

## Features

- 16 locally stored menu images across appetizers, soup, main courses, desserts, and beverages
- Category filters and touch-friendly menu cards
- Multi-item cart with quantity and remove controls
- Live line totals and Philippine peso order total
- Customer validation and accessible status messages
- Atomic Supabase checkout with database-controlled menu prices
- Animated thermal-style receipt with an 80 mm print layout
- Responsive desktop, tablet, and mobile layouts
- Reduced-motion accessibility support

## Supabase Setup

The browser uses a Supabase publishable key. Public clients can only execute the checkout function; Row Level Security and revoked table privileges prevent public order reads, edits, and deletes.

> `supabase-schema.sql` replaces the old demo schema and deletes any existing order data.

1. Open the [Supabase project dashboard](https://supabase.com/dashboard/project/nirtjqjcqaxlrskuvpjy).
2. Open **SQL Editor** and create a new query.
3. Paste the contents of `supabase-schema.sql`.
4. Select **Run**.

The script creates:

- `menu_items`: the server-side product and price catalog
- `orders`: customer, reference, total, and timestamp
- `order_items`: normalized quantity, price, and line-total records
- `place_order(customer_name, items)`: an atomic checkout function that rejects unknown products, invalid quantities, duplicate lines, and client-side price manipulation

## Run Locally

Serve the project directory with any static server. For example:

```bash
npx serve .
```

Opening `index.html` directly also works, although a local server gives browser behavior closer to production.

## Project Files

- `index.html`: semantic kiosk and receipt structure
- `styles.css`: brand design, responsive layout, animations, and print rules
- `app.js`: menu catalog, filters, cart, checkout, and receipt behavior
- `supabase-schema.sql`: normalized schema, permissions, and checkout function
- `assets/images`: local menu photography
- `IMAGE_CREDITS.md`: photography sources and attribution links

## Repository

https://github.com/johnbenedictjavier/Food-Ordering-System

Laurel & Ladle is an original project identity. See `IMAGE_CREDITS.md` for third-party photography sources.
