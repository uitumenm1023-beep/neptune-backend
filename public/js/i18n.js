const translations = {
  en: {
    shop: "Shop",
    cart: "Cart",
    checkout: "Checkout",
    add_to_cart: "Add to cart",
    continue_shopping: "Continue shopping",
    your_cart: "Your cart",
    place_order: "Place order",
    total: "Total",
  },

  mn: {
    shop: "Дэлгүүр",
    cart: "Сагс",
    checkout: "Төлбөр",
    add_to_cart: "Сагсанд нэмэх",
    continue_shopping: "Худалдан авалтаа үргэлжлүүлэх",
    your_cart: "Таны сагс",
    place_order: "Захиалга өгөх",
    total: "Нийт дүн",
  }
};

function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations();
}

function applyTranslations() {
  const lang = localStorage.getItem("lang") || "mn";
  const dict = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
}

document.addEventListener("DOMContentLoaded", applyTranslations);
