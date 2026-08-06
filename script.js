const products = Object.fromEntries(window.catalogProducts.map((product) => [product.id, product]));

const modal = document.querySelector("#productModal");
const modalImage = document.querySelector("#modalImage");
const modalTag = document.querySelector("#modalTag");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalFeatures = document.querySelector("#modalFeatures");
const modalPrice = document.querySelector("#modalPrice");
const modalAddCart = document.querySelector("#modalAddCart");
const closeButton = document.querySelector(".modal-close");
const productGrid = document.querySelector("#productGrid");
const catalogSearch = document.querySelector("#catalogSearch");
const categoryFilters = document.querySelector("#categoryFilters");
const catalogCount = document.querySelector("#catalogCount");
const cartTrigger = document.querySelector(".cart-trigger");
const cartBackdrop = document.querySelector("#cartBackdrop");
const cartClose = document.querySelector(".cart-close");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
let selectedProduct = null;
let cart = [];
let activeCategory = "Todos";

const money = (value) => `S/ ${value.toFixed(2)}`;

function normalized(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

const categoriesByProduct = {
  "Alimentaci\u00f3n": [1, 10, 22, 23, 32, 34, 36, 37, 46, 48, 49, 50, 51, 52, 53, 65, 66, 67, 70],
  "Lactancia": [3, 6, 7, 8, 28, 31, 56, 57, 58, 59],
  "Paseo y seguridad": [9, 11, 15, 18, 27, 40, 42, 44, 47, 68],
  "Ropa y accesorios": [4, 5, 17, 43],
  "Higiene y cuidado": [21, 26, 45, 61],
  "Juguetes y estimulaci\u00f3n": [2, 12, 13, 14, 16, 19, 20, 24, 25, 29, 30, 33, 35, 38, 39, 41, 54, 55, 60, 62, 63, 64, 69],
};

function productCategory(product) {
  return Object.entries(categoriesByProduct).find(([, numbers]) => numbers.includes(product.number))?.[0] || "Otros";
}

window.catalogProducts.forEach((product) => { product.category = productCategory(product); });
catalogCount.textContent = `${window.catalogProducts.length} items disponibles`;
const categoryOrder = ["Todos", "Juguetes y estimulaci\u00f3n", "Alimentaci\u00f3n", "Lactancia", "Paseo y seguridad", "Ropa y accesorios", "Higiene y cuidado", "Otros"];

function renderCategoryFilters() {
  categoryFilters.innerHTML = categoryOrder.filter((category) => category === "Todos" || window.catalogProducts.some((product) => product.category === category)).map((category) => {
    const count = category === "Todos" ? window.catalogProducts.length : window.catalogProducts.filter((product) => product.category === category).length;
    return `<button class="category-filter${category === activeCategory ? " is-active" : ""}" type="button" data-category="${category}">${category} (${count})</button>`;
  }).join("");
}

function renderProducts() {
  const query = normalized(catalogSearch.value.trim());
  const visibleProducts = window.catalogProducts.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const matchesSearch = !query || normalized(`${product.title} ${product.description} ${product.number}`).includes(query);
    return matchesCategory && matchesSearch;
  });
  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image"><img src="${product.image}" alt="${product.alt}" loading="lazy"></div>
      <div class="product-info">
        <p class="product-tag">Código ${product.number}</p>
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p class="product-price">${money(product.price)}</p>
        <button class="detail-button" type="button" data-product="${product.id}">Ver especificaciones</button>
        <button class="add-cart-button" type="button" data-product="${product.id}">Añadir al carrito</button>
      </div>
    </article>`).join("") || '<p class="empty-catalog">No encontramos productos con esa b&uacute;squeda.</p>';
}

function closeMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.classList.remove("is-open");
  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}

function toggleMenu() {
  if (!menuToggle || !navLinks) return;

  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menu" : "Abrir menu");
}

function openModal(productKey) {
  const product = products[productKey];

  if (!product) return;

  modalImage.src = product.image;
  modalImage.alt = product.alt;
  modalTag.textContent = `C\u00f3digo ${product.number} · ${product.category}`;
  modalTitle.textContent = product.title;
  modalDescription.textContent = product.description;
  modalPrice.textContent = money(product.price);
  selectedProduct = productKey;
  modalFeatures.innerHTML = "";

  product.features.forEach((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    modalFeatures.appendChild(item);
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  closeButton.focus();
}

function openCart() {
  cartBackdrop.classList.add("is-open");
  cartBackdrop.setAttribute("aria-hidden", "false");
  cartClose.focus();
}

function closeCart() {
  cartBackdrop.classList.remove("is-open");
  cartBackdrop.setAttribute("aria-hidden", "true");
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + products[item.key].price * item.quantity, 0);
  cartCount.textContent = totalItems;
  cartTotal.textContent = money(total);
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío. Agrega una ropita para comenzar tu pedido.</p>';
    checkoutButton.classList.add("is-disabled");
    checkoutButton.href = "https://wa.me/51904226429";
    return;
  }
  checkoutButton.classList.remove("is-disabled");
  cartItems.innerHTML = cart.map(({ key, quantity }) => {
    const product = products[key];
    return `<article class="cart-item"><img src="${product.image}" alt="${product.alt}"><div><h3>${product.title}</h3><p>${money(product.price)}</p><div class="quantity-controls"><button type="button" data-action="decrease" data-product="${key}" aria-label="Restar una unidad">−</button><strong>${quantity}</strong><button type="button" data-action="increase" data-product="${key}" aria-label="Sumar una unidad">+</button><button class="remove-item" type="button" data-action="remove" data-product="${key}">Eliminar</button></div></div></article>`;
  }).join("");
  const message = cart.map(({ key, quantity }) => `${quantity} x ${products[key].title} (${money(products[key].price * quantity)})`).join("\n");
  checkoutButton.href = `https://wa.me/51904226429?text=${encodeURIComponent(`Hola, quiero hacer este pedido:\n${message}\n\nTotal: ${money(total)}`)}`;
}

function addToCart(productKey) {
  const item = cart.find((cartItem) => cartItem.key === productKey);
  if (item) item.quantity += 1;
  else cart.push({ key: productKey, quantity: 1 });
  renderCart();
  openCart();
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-product]");
  if (!button) return;
  if (button.classList.contains("detail-button")) openModal(button.dataset.product);
  if (button.classList.contains("add-cart-button")) addToCart(button.dataset.product);
});
catalogSearch.addEventListener("input", renderProducts);
categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategoryFilters();
  renderProducts();
});
modalAddCart.addEventListener("click", () => { if (selectedProduct) { closeModal(); addToCart(selectedProduct); } });
cartTrigger.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", (event) => { if (event.target === cartBackdrop) closeCart(); });
cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = cart.find((cartItem) => cartItem.key === button.dataset.product);
  if (!item) return;
  if (button.dataset.action === "increase") item.quantity += 1;
  if (button.dataset.action === "decrease") item.quantity -= 1;
  if (button.dataset.action === "remove" || item.quantity < 1) cart = cart.filter((cartItem) => cartItem.key !== button.dataset.product);
  renderCart();
});

menuToggle?.addEventListener("click", toggleMenu);

navItems.forEach((item) => {
  item.addEventListener("click", closeMenu);
});

closeButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }

  if (event.key === "Escape") {
    closeMenu();
    closeCart();
  }
});

renderCategoryFilters();
renderProducts();
renderCart();
