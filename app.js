"use strict";

const SUPABASE_URL = "https://nirtjqjcqaxlrskuvpjy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eXaoAAUlqhnnEGKIfl-ZmQ_t0H-iyaQ";

const menuItems = [
  {
    id: "lumpiang-shanghai",
    name: "Lumpiang Shanghai",
    category: "Appetizers",
    description: "Crisp pork spring rolls with sweet chili dip.",
    price: 89,
    image: "assets/images/lumpiang-shanghai.jpg"
  },
  {
    id: "fresh-lumpia",
    name: "Fresh Lumpia",
    category: "Appetizers",
    description: "Garden vegetables in a soft wrap with peanut-garlic sauce.",
    price: 79,
    image: "assets/images/fresh-lumpia.jpg"
  },
  {
    id: "gyoza",
    name: "Gyoza",
    category: "Appetizers",
    description: "Pan-seared dumplings served with a savory soy dip.",
    price: 99,
    image: "assets/images/gyoza.jpg"
  },
  {
    id: "takoyaki",
    name: "Takoyaki",
    category: "Appetizers",
    description: "Tender octopus bites finished with bonito and mayo.",
    price: 99,
    image: "assets/images/takoyaki.jpg"
  },
  {
    id: "sinigang-na-baboy",
    name: "Sinigang na Baboy",
    category: "Soup",
    description: "Pork and vegetables in a bright tamarind broth.",
    price: 169,
    image: "assets/images/sinigang-na-baboy.jpg"
  },
  {
    id: "bulalo",
    name: "Bulalo",
    category: "Soup",
    description: "Slow-braised beef shank, marrow, corn, and greens.",
    price: 189,
    image: "assets/images/bulalo.jpg"
  },
  {
    id: "chicken-teriyaki",
    name: "Chicken Teriyaki",
    category: "Main Course",
    description: "Grilled chicken glazed with sweet-savory teriyaki.",
    price: 149,
    image: "assets/images/chicken-teriyaki.jpg"
  },
  {
    id: "lechon-kawali",
    name: "Lechon Kawali",
    category: "Main Course",
    description: "Golden pork belly with crisp skin and tender center.",
    price: 169,
    image: "assets/images/lechon-kawali.jpg"
  },
  {
    id: "chicken-katsu",
    name: "Chicken Katsu",
    category: "Main Course",
    description: "Panko-crusted chicken with cabbage and katsu sauce.",
    price: 149,
    image: "assets/images/chicken-katsu.jpg"
  },
  {
    id: "leche-flan",
    name: "Leche Flan",
    category: "Desserts",
    description: "Silky caramel custard, rich and delicately sweet.",
    price: 69,
    image: "assets/images/leche-flan.jpg"
  },
  {
    id: "halo-halo",
    name: "Halo-Halo",
    category: "Desserts",
    description: "Shaved ice, sweet preserves, milk, and creamy toppings.",
    price: 99,
    image: "assets/images/halo-halo.jpg"
  },
  {
    id: "turon",
    name: "Turon",
    category: "Desserts",
    description: "Caramelized banana wrapped and fried until crisp.",
    price: 49,
    image: "assets/images/turon.jpg"
  },
  {
    id: "mochi",
    name: "Mochi",
    category: "Desserts",
    description: "Soft, chewy rice cakes with a gently sweet filling.",
    price: 69,
    image: "assets/images/mochi.jpg"
  },
  {
    id: "mango-shake",
    name: "Mango Shake",
    category: "Beverages",
    description: "Ripe mango blended smooth and served ice-cold.",
    price: 89,
    image: "assets/images/mango-shake.jpg"
  },
  {
    id: "calamansi-juice",
    name: "Calamansi Juice",
    category: "Beverages",
    description: "A refreshing sweet-tart Filipino citrus cooler.",
    price: 59,
    image: "assets/images/calamansi-juice.jpg"
  },
  {
    id: "wintermelon-juice",
    name: "Wintermelon Juice",
    category: "Beverages",
    description: "Lightly sweet wintermelon tea poured over ice.",
    price: 69,
    image: "assets/images/wintermelon-juice.jpg"
  }
];

const menuById = new Map(menuItems.map((item) => [item.id, item]));
const cart = new Map();
const numberFormatter = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const elements = {
  menuGrid: document.querySelector("#menuGrid"),
  categoryTabs: document.querySelector("#categoryTabs"),
  orderForm: document.querySelector("#orderForm"),
  customerName: document.querySelector("#customerName"),
  nameError: document.querySelector("#nameError"),
  cartError: document.querySelector("#cartError"),
  cartList: document.querySelector("#cartList"),
  cartItemCount: document.querySelector("#cartItemCount"),
  headerCartCount: document.querySelector("#headerCartCount"),
  subtotalPrice: document.querySelector("#subtotalPrice"),
  totalPrice: document.querySelector("#totalPrice"),
  formStatus: document.querySelector("#formStatus"),
  placeOrderButton: document.querySelector("#placeOrderButton"),
  buttonLabel: document.querySelector(".button-label"),
  receiptOverlay: document.querySelector("#receiptOverlay"),
  receiptTitle: document.querySelector("#receiptTitle"),
  receiptReference: document.querySelector("#receiptReference"),
  receiptDate: document.querySelector("#receiptDate"),
  receiptCustomer: document.querySelector("#receiptCustomer"),
  receiptItems: document.querySelector("#receiptItems"),
  receiptTotal: document.querySelector("#receiptTotal"),
  receiptCode: document.querySelector("#receiptCode"),
  printReceiptButton: document.querySelector("#printReceiptButton"),
  newOrderButton: document.querySelector("#newOrderButton"),
  liveRegion: document.querySelector("#liveRegion")
};

let activeCategory = "All";
let isSubmitting = false;

function formatCurrency(value) {
  return `₱${numberFormatter.format(value)}`;
}

function renderMenu() {
  const visibleItems = activeCategory === "All"
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  elements.menuGrid.innerHTML = visibleItems.map((item, index) => `
    <article class="menu-card" style="--delay: ${index * 45}ms">
      <div class="food-image">
        <img src="${item.image}" alt="${item.name}" ${index < 4 ? "fetchpriority=\"high\"" : "loading=\"lazy\""}>
        <span class="food-category">${item.category}</span>
        <button class="add-button" type="button" data-add-id="${item.id}" aria-label="Add ${item.name} to order">+</button>
      </div>
      <div class="food-info">
        <div class="food-name-row">
          <span class="food-name">${item.name}</span>
          <span class="food-price">${formatCurrency(item.price)}</span>
        </div>
        <span class="food-description">${item.description}</span>
      </div>
    </article>
  `).join("");
}

function getCartSnapshot() {
  return [...cart.entries()].map(([id, quantity]) => ({
    item: menuById.get(id),
    quantity
  }));
}

function getCartTotal(snapshot = getCartSnapshot()) {
  return snapshot.reduce((total, entry) => total + entry.item.price * entry.quantity, 0);
}

function renderCart(animateTotal = true) {
  const entries = getCartSnapshot();
  const totalQuantity = entries.reduce((total, entry) => total + entry.quantity, 0);
  const total = getCartTotal(entries);

  if (entries.length === 0) {
    elements.cartList.innerHTML = `
      <div class="empty-cart">
        <div>
          <i aria-hidden="true">+</i>
          <strong>Your table is waiting</strong>
          <span>Add a dish from the menu to begin.</span>
        </div>
      </div>
    `;
  } else {
    elements.cartList.innerHTML = entries.map(({ item, quantity }) => `
      <div class="cart-item">
        <img src="${item.image}" alt="">
        <div>
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${formatCurrency(item.price)} each</span>
          <div class="cart-item-controls">
            <button class="quantity-button" type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button>
            <span class="cart-quantity" aria-label="Quantity ${quantity}">${quantity}</span>
            <button class="quantity-button" type="button" data-action="increase" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
            <button class="remove-button" type="button" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">×</button>
          </div>
        </div>
        <strong class="cart-line-total">${formatCurrency(item.price * quantity)}</strong>
      </div>
    `).join("");
  }

  elements.cartItemCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;
  elements.headerCartCount.textContent = String(totalQuantity);
  elements.subtotalPrice.textContent = formatCurrency(total);
  elements.totalPrice.textContent = formatCurrency(total);

  if (animateTotal) {
    elements.totalPrice.classList.remove("update");
    void elements.totalPrice.offsetWidth;
    elements.totalPrice.classList.add("update");
  }

  if (entries.length > 0) elements.cartError.textContent = "";
}

function addToCart(id, button) {
  if (isSubmitting || !menuById.has(id)) return;
  const quantity = cart.get(id) || 0;
  cart.set(id, Math.min(quantity + 1, 99));
  renderCart();

  button.classList.remove("added");
  void button.offsetWidth;
  button.classList.add("added");
  window.setTimeout(() => button.classList.remove("added"), 400);

  const item = menuById.get(id);
  elements.liveRegion.textContent = `${item.name} added. Quantity ${cart.get(id)}.`;
}

function updateCartItem(id, action) {
  if (isSubmitting || !cart.has(id)) return;
  const quantity = cart.get(id);

  if (action === "increase") cart.set(id, Math.min(quantity + 1, 99));
  if (action === "decrease") cart.set(id, Math.max(quantity - 1, 1));
  if (action === "remove") cart.delete(id);

  renderCart();
}

function validateOrder() {
  const customerName = elements.customerName.value.trim();
  let isValid = true;

  elements.nameError.textContent = "";
  elements.cartError.textContent = "";
  elements.formStatus.textContent = "";
  elements.customerName.classList.remove("invalid");

  if (!customerName) {
    elements.nameError.textContent = "Please enter a name for the order.";
    elements.customerName.classList.add("invalid");
    isValid = false;
  }

  if (cart.size === 0) {
    elements.cartError.textContent = "Please add at least one item.";
    isValid = false;
  }

  if (!isValid) {
    const target = elements.customerName.classList.contains("invalid") ? elements.customerName : elements.cartList;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return isValid;
}

function setSubmitting(submitting) {
  isSubmitting = submitting;
  elements.placeOrderButton.disabled = submitting;
  elements.placeOrderButton.classList.toggle("loading", submitting);
  elements.buttonLabel.textContent = submitting ? "Sending to kitchen" : "Send order to kitchen";
}

async function saveOrder(customerName, entries) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/place_order`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      p_customer_name: customerName,
      p_items: entries.map(({ item, quantity }) => ({ id: item.id, quantity }))
    })
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "Unable to save the order.");
    error.code = payload?.code || String(response.status);
    throw error;
  }

  return payload;
}

function showReceipt(result, customerName, entries, fallbackTotal) {
  const total = Number(result?.total) || fallbackTotal;
  const date = result?.created_at ? new Date(result.created_at) : new Date();
  const reference = result?.reference || `LL-${String(result?.order_id || "ORDER").padStart(6, "0")}`;

  elements.receiptReference.textContent = reference;
  elements.receiptDate.textContent = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
  elements.receiptCustomer.textContent = customerName;
  elements.receiptTotal.textContent = formatCurrency(total);
  elements.receiptItems.innerHTML = entries.map(({ item, quantity }) => `
    <div class="receipt-item">
      <span>${item.name}<small>${quantity} × ${formatCurrency(item.price)}</small></span>
      <strong>${formatCurrency(item.price * quantity)}</strong>
    </div>
  `).join("");
  elements.receiptCode.setAttribute("aria-label", reference);

  elements.receiptOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    elements.receiptOverlay.classList.add("show");
    elements.receiptTitle.setAttribute("tabindex", "-1");
    elements.receiptTitle.focus();
  });
}

function startNewOrder() {
  elements.receiptOverlay.classList.remove("show");
  window.setTimeout(() => {
    elements.receiptOverlay.hidden = true;
    document.body.style.overflow = "";
    cart.clear();
    elements.orderForm.reset();
    elements.nameError.textContent = "";
    elements.cartError.textContent = "";
    elements.formStatus.textContent = "";
    elements.customerName.classList.remove("invalid");
    renderCart(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 250);
}

elements.menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-id]");
  if (button) addToCart(button.dataset.addId, button);
});

elements.categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;
  elements.categoryTabs.querySelectorAll("button").forEach((tab) => {
    const isActive = tab === button;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  renderMenu();
});

elements.cartList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button) updateCartItem(button.dataset.id, button.dataset.action);
});

elements.customerName.addEventListener("input", () => {
  if (elements.customerName.value.trim()) {
    elements.nameError.textContent = "";
    elements.customerName.classList.remove("invalid");
  }
});

elements.orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting || !validateOrder()) return;

  const customerName = elements.customerName.value.trim();
  const entries = getCartSnapshot();
  const total = getCartTotal(entries);
  setSubmitting(true);

  try {
    const result = await saveOrder(customerName, entries);
    showReceipt(result, customerName, entries, total);
    elements.liveRegion.textContent = "Order confirmed and sent to the kitchen.";
  } catch (error) {
    console.error("Order submission failed:", error);
    const schemaMissing = ["PGRST202", "PGRST205", "404"].includes(error.code);
    elements.formStatus.textContent = schemaMissing
      ? "Database setup is required. Run supabase-schema.sql in Supabase."
      : "We could not send the order. Please check your connection and try again.";
  } finally {
    setSubmitting(false);
  }
});

elements.printReceiptButton.addEventListener("click", () => window.print());
elements.newOrderButton.addEventListener("click", startNewOrder);

renderMenu();
renderCart(false);
