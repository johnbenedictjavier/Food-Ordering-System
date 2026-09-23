"use strict";

const SUPABASE_URL = "https://nirtjqjcqaxlrskuvpjy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eXaoAAUlqhnnEGKIfl-ZmQ_t0H-iyaQ";
const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const menuItems = [
  {
    id: "classic-cheeseburger",
    name: "Classic Cheeseburger",
    description: "Juicy beef, melted cheese, pickles, and our signature sauce.",
    price: 99,
    badge: "BEST SELLER",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "crispy-chicken-burger",
    name: "Crispy Chicken Burger",
    description: "Crunchy chicken, fresh lettuce, and creamy mayo.",
    price: 129,
    badge: "CRISPY",
    image: "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "fried-chicken-rice",
    name: "Fried Chicken & Rice",
    description: "Golden fried chicken served with warm steamed rice.",
    price: 149,
    badge: "FAVORITE",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "golden-fries",
    name: "Golden Fries",
    description: "Perfectly salted, hot, and crispy potato fries.",
    price: 59,
    badge: "SNACK",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "cheesy-spaghetti",
    name: "Cheesy Spaghetti",
    description: "Sweet-style tomato sauce finished with grated cheese.",
    price: 89,
    badge: "CHEESY",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "hot-fudge-sundae",
    name: "Hot Fudge Sundae",
    description: "Creamy vanilla soft serve with rich chocolate fudge.",
    price: 49,
    badge: "DESSERT",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85"
  }
];

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2
});

const elements = {
  menuGrid: document.querySelector("#menuGrid"),
  orderForm: document.querySelector("#orderForm"),
  customerName: document.querySelector("#customerName"),
  nameError: document.querySelector("#nameError"),
  foodError: document.querySelector("#foodError"),
  selectedFood: document.querySelector("#selectedFood"),
  selectedPlaceholder: document.querySelector("#selectedPlaceholder"),
  selectedContent: document.querySelector("#selectedContent"),
  selectedImage: document.querySelector("#selectedImage"),
  selectedName: document.querySelector("#selectedName"),
  unitPrice: document.querySelector("#unitPrice"),
  quantity: document.querySelector("#quantity"),
  decreaseQuantity: document.querySelector("#decreaseQuantity"),
  increaseQuantity: document.querySelector("#increaseQuantity"),
  totalPrice: document.querySelector("#totalPrice"),
  formStatus: document.querySelector("#formStatus"),
  placeOrderButton: document.querySelector("#placeOrderButton"),
  buttonLabel: document.querySelector(".button-label"),
  successOverlay: document.querySelector("#successOverlay"),
  successTitle: document.querySelector("#successTitle"),
  successTotal: document.querySelector("#successTotal"),
  newOrderButton: document.querySelector("#newOrderButton"),
  liveRegion: document.querySelector("#liveRegion")
};

let selectedItem = null;
let isSubmitting = false;

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function renderMenu() {
  elements.menuGrid.innerHTML = menuItems.map((item, index) => `
    <button
      class="menu-card"
      type="button"
      data-food-id="${item.id}"
      aria-pressed="false"
      style="--delay: ${index * 70}ms"
    >
      <span class="food-image">
        <img src="${item.image}" alt="" ${index < 3 ? "fetchpriority=\"high\"" : "loading=\"lazy\""}>
        <span class="food-badge">${item.badge}</span>
        <span class="card-check" aria-hidden="true">&#10003;</span>
      </span>
      <span class="food-info">
        <span class="food-name">${item.name}</span>
        <span class="food-description">${item.description}</span>
        <span class="food-price">${formatCurrency(item.price)}</span>
      </span>
    </button>
  `).join("");
}

function selectFood(foodId) {
  selectedItem = menuItems.find((item) => item.id === foodId);
  if (!selectedItem) return;

  document.querySelectorAll(".menu-card").forEach((card) => {
    const isSelected = card.dataset.foodId === foodId;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  elements.selectedPlaceholder.hidden = true;
  elements.selectedContent.hidden = false;
  elements.selectedImage.src = selectedItem.image;
  elements.selectedImage.alt = selectedItem.name;
  elements.selectedName.textContent = selectedItem.name;
  elements.quantity.disabled = false;
  elements.decreaseQuantity.disabled = false;
  elements.increaseQuantity.disabled = false;
  elements.quantity.value = "1";
  elements.foodError.textContent = "";
  elements.selectedFood.classList.remove("invalid");
  elements.formStatus.textContent = "";
  updatePrices();

  elements.liveRegion.textContent = `${selectedItem.name} selected. Price ${formatCurrency(selectedItem.price)}.`;
}

function getQuantity() {
  const quantity = Number.parseInt(elements.quantity.value, 10);
  return Number.isInteger(quantity) ? Math.min(99, Math.max(1, quantity)) : 1;
}

function updatePrices(animate = true) {
  const price = selectedItem ? selectedItem.price : 0;
  const total = price * getQuantity();
  elements.unitPrice.textContent = formatCurrency(price);
  elements.totalPrice.textContent = formatCurrency(total);

  if (animate) {
    elements.totalPrice.classList.remove("update");
    void elements.totalPrice.offsetWidth;
    elements.totalPrice.classList.add("update");
  }
}

function setQuantity(nextQuantity) {
  const quantity = Math.min(99, Math.max(1, nextQuantity));
  elements.quantity.value = String(quantity);
  elements.quantity.classList.remove("bump");
  void elements.quantity.offsetWidth;
  elements.quantity.classList.add("bump");
  updatePrices();
}

function validateOrder() {
  let isValid = true;
  const customerName = elements.customerName.value.trim();

  elements.nameError.textContent = "";
  elements.foodError.textContent = "";
  elements.customerName.classList.remove("invalid");
  elements.selectedFood.classList.remove("invalid");
  elements.formStatus.textContent = "";

  if (!customerName) {
    elements.nameError.textContent = "Please enter the customer name.";
    elements.customerName.classList.add("invalid");
    isValid = false;
  }

  if (!selectedItem) {
    elements.foodError.textContent = "Please choose a food item.";
    elements.selectedFood.classList.add("invalid");
    isValid = false;
  }

  if (!isValid) {
    const firstInvalid = document.querySelector(".invalid");
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return isValid;
}

function setSubmitting(submitting) {
  isSubmitting = submitting;
  elements.placeOrderButton.disabled = submitting;
  elements.placeOrderButton.classList.toggle("loading", submitting);
  elements.buttonLabel.textContent = submitting ? "Placing order" : "Place order";
}

async function saveOrder(order) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(order)
  });

  if (!response.ok) {
    let details = null;
    try {
      details = await response.json();
    } catch {
      details = { message: response.statusText };
    }
    const error = new Error(details.message || "Unable to save order.");
    error.code = details.code;
    throw error;
  }
}

function showSuccess(total) {
  elements.successTotal.textContent = formatCurrency(total);
  elements.successOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    elements.successOverlay.classList.add("show");
    elements.successTitle.focus();
  });
}

function resetOrder() {
  elements.orderForm.reset();
  selectedItem = null;
  document.querySelectorAll(".menu-card").forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });
  elements.selectedPlaceholder.hidden = false;
  elements.selectedContent.hidden = true;
  elements.selectedImage.src = EMPTY_IMAGE;
  elements.quantity.value = "1";
  elements.quantity.disabled = true;
  elements.decreaseQuantity.disabled = true;
  elements.increaseQuantity.disabled = true;
  elements.nameError.textContent = "";
  elements.foodError.textContent = "";
  elements.formStatus.textContent = "";
  updatePrices(false);
}

function closeSuccess() {
  elements.successOverlay.classList.remove("show");
  window.setTimeout(() => {
    elements.successOverlay.hidden = true;
    document.body.style.overflow = "";
    resetOrder();
    elements.customerName.focus();
  }, 250);
}

elements.menuGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".menu-card");
  if (card) selectFood(card.dataset.foodId);
});

elements.customerName.addEventListener("input", () => {
  if (elements.customerName.value.trim()) {
    elements.nameError.textContent = "";
    elements.customerName.classList.remove("invalid");
  }
});

elements.decreaseQuantity.addEventListener("click", () => setQuantity(getQuantity() - 1));
elements.increaseQuantity.addEventListener("click", () => setQuantity(getQuantity() + 1));

elements.quantity.addEventListener("input", () => {
  if (elements.quantity.value !== "") updatePrices();
});

elements.quantity.addEventListener("change", () => setQuantity(getQuantity()));

elements.orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting || !validateOrder()) return;

  const quantity = getQuantity();
  const total = selectedItem.price * quantity;
  const order = {
    customer_name: elements.customerName.value.trim(),
    food_id: selectedItem.id,
    food_name: selectedItem.name,
    unit_price: selectedItem.price,
    quantity
  };

  setSubmitting(true);

  try {
    await saveOrder(order);
    showSuccess(total);
  } catch (error) {
    console.error("Order submission failed:", error);
    elements.formStatus.textContent = error.code === "PGRST205"
      ? "Order database is not set up yet. Run supabase-schema.sql first."
      : "We could not place your order. Please try again.";
  } finally {
    setSubmitting(false);
  }
});

elements.newOrderButton.addEventListener("click", closeSuccess);

elements.successOverlay.addEventListener("click", (event) => {
  if (event.target === elements.successOverlay) closeSuccess();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.successOverlay.hidden) closeSuccess();
});

renderMenu();
updatePrices(false);
