# Food Ordering System

A simple, responsive food ordering kiosk built with vanilla HTML, CSS, and JavaScript. The interface uses a bold red and yellow quick-service restaurant style, touch-friendly controls, and lightweight animations.

## Features

- Six food items with Philippine peso prices
- Food selection and quantity controls
- Automatic total calculation
- Customer name validation
- Supabase order storage
- Animated loading and confirmation states
- Responsive desktop and mobile layout
- Reduced-motion accessibility support

## Supabase Setup

The app uses the supplied Supabase publishable key. This key is designed for browser use; database access is restricted using Row Level Security.

1. Open the [Supabase dashboard](https://supabase.com/dashboard/project/nirtjqjcqaxlrskuvpjy).
2. Select **SQL Editor** and create a new query.
3. Paste the contents of `supabase-schema.sql`.
4. Click **Run**.

The policy permits public order creation but does not permit public reading, editing, or deleting of customer orders.

## Run Locally

Open the folder in Visual Studio Code and run `index.html` using the Live Server extension. You can also use any simple static web server.

## Project Files

- `index.html`: kiosk page structure
- `styles.css`: responsive design and animations
- `app.js`: menu, calculations, validation, and Supabase integration
- `supabase-schema.sql`: database table and security policy

## Repository

https://github.com/johnbenedictjavier/Food-Ordering-System

Menu photography is loaded from Unsplash. This educational project is McDonald's-inspired and is not affiliated with or endorsed by McDonald's Corporation.
