/* Mama Authentic Foods: small, dependency-free behaviour layer. */

const WHATSAPP = "2348065906888";
const ORDER_KEY = "mama-order";
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Storage that never throws ---------- */

const store = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  },
};

const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/* ---------- Load sequence ---------- */

function onLoaded() {
  requestAnimationFrame(() => {
    root.classList.add("is-loaded");
    document.querySelectorAll(".hero .bowl").forEach((b) => b.classList.add("is-in"));
  });
}

/* ---------- Header ---------- */

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* ---------- Mobile nav sheet ---------- */

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const sheet = document.getElementById("nav-sheet");
  if (!toggle || !sheet) return;
  const close = sheet.querySelector(".nav-close");

  const open = () => {
    sheet.classList.add("is-open");
    sheet.removeAttribute("inert");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    close.focus();
  };
  const shut = () => {
    sheet.classList.remove("is-open");
    sheet.setAttribute("inert", "");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    toggle.focus();
  };

  toggle.addEventListener("click", open);
  close.addEventListener("click", shut);
  sheet.addEventListener("keydown", (e) => {
    if (e.key === "Escape") shut();
    if (e.key !== "Tab") return;
    const items = [...sheet.querySelectorAll("a, button")];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

/* ---------- Scroll reveals ---------- */

function initReveals() {
  const targets = document.querySelectorAll("[data-reveal], [data-reveal-bowls], .bowl:not(.hero .bowl)");
  if (!targets.length) return;

  document.querySelectorAll("[data-reveal-bowls]").forEach((group) => {
    group.querySelectorAll(".dish-bowl").forEach((b, i) => b.style.setProperty("--i", i));
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });

  targets.forEach((t) => io.observe(t));
}

/* ---------- Order tray (menu page) ---------- */

function getOrder() { return store.get(ORDER_KEY, []); }
function setOrder(items) { store.set(ORDER_KEY, items); }

function initOrderButtons() {
  const buttons = document.querySelectorAll("[data-add]");
  const tray = document.querySelector(".tray");
  if (!buttons.length) return;

  const count = tray?.querySelector("[data-tray-count]");

  const render = () => {
    const order = getOrder();
    buttons.forEach((btn) => {
      const added = order.includes(btn.dataset.add);
      btn.setAttribute("aria-pressed", String(added));
      btn.querySelector("[data-label]").textContent = added ? "Added" : (btn.dataset.addLabel || "Add to order");
    });
    if (tray) {
      const n = order.length;
      count.textContent = n === 1 ? "1 dish in your order" : `${n} dishes in your order`;
      tray.classList.toggle("is-visible", n > 0);
      tray.toggleAttribute("inert", n === 0);
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.add;
      const order = getOrder();
      setOrder(order.includes(name) ? order.filter((d) => d !== name) : [...order, name]);
      render();
    });
  });

  tray?.querySelector(".tray-clear")?.addEventListener("click", () => {
    setOrder([]);
    render();
  });

  render();
}

/* ---------- Forms that send to WhatsApp ---------- */

const messages = {
  valueMissing: (label) => `Enter ${label} so we can get back to you.`,
  tel: "Enter a phone number with at least 10 digits, like 0806 590 6888.",
  date: "Choose a date that hasn't passed yet.",
};

function fieldLabel(input) {
  const label = input.closest(".field")?.querySelector("label, legend");
  if (label?.dataset.name) return label.dataset.name;
  const text = (label?.textContent || "this field").replace("*", "").trim().toLowerCase();
  return text.startsWith("your ") ? text : `your ${text}`;
}

function validateField(input) {
  const field = input.closest(".field");
  const error = field?.querySelector(".error");
  if (!error) return true;
  let msg = "";

  const value = input.value.trim();
  if (input.required && !value) msg = messages.valueMissing(fieldLabel(input));
  else if (input.type === "tel" && value && value.replace(/\D/g, "").length < 10) msg = messages.tel;
  else if (input.type === "date" && value && input.min && value < input.min) msg = messages.date;

  error.querySelector("span").textContent = msg;
  error.classList.toggle("is-shown", Boolean(msg));
  input.setAttribute("aria-invalid", String(Boolean(msg)));
  return !msg;
}

function initForms() {
  document.querySelectorAll("form[data-whatsapp]").forEach((form) => {
    const inputs = [...form.querySelectorAll("input:not([type=radio]), select, textarea")];
    const status = form.querySelector(".form-status");

    inputs.forEach((input) => {
      input.addEventListener("blur", () => { if (input.value || input.getAttribute("aria-invalid")) validateField(input); });
      input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") validateField(input); });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const invalid = inputs.filter((i) => !validateField(i));
      if (invalid.length) {
        invalid[0].focus();
        return;
      }

      const data = new FormData(form);
      const lines = [form.dataset.whatsapp];
      form.querySelectorAll("[data-line]").forEach((el) => {
        const name = el.name || el.querySelector("input")?.name;
        const value = String(data.get(name) || "").trim();
        if (value) lines.push(`${el.dataset.line}: ${value}`);
      });

      window.open(waLink(lines.join("\n")), "_blank", "noopener");
      if (status) {
        status.hidden = false;
        status.textContent = "WhatsApp is opening with your message. Press send there and we'll reply shortly.";
      }
      if (form.id === "order-form") setOrder([]);
    });
  });

  // Carry dishes picked on the menu into the order form
  const items = document.getElementById("order-items");
  if (items && !items.value) {
    const order = getOrder();
    if (order.length) items.value = order.map((d) => `1 x ${d}`).join("\n");
  }

  // No event dates in the past
  const date = document.getElementById("event-date");
  if (date) date.min = new Date().toISOString().slice(0, 10);
}

/* ---------- Menu chips follow the scroll ---------- */

function initMenuNav() {
  const links = [...document.querySelectorAll(".menu-nav a")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove("is-active"));
      map.get(entry.target.id)?.classList.add("is-active");
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ---------- Boot ---------- */

root.classList.add("js");
initHeader();
initNav();
initReveals();
initOrderButtons();
initForms();
initMenuNav();
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

if (document.readyState === "complete") onLoaded();
else window.addEventListener("load", onLoaded, { once: true });
// Never leave the hero hidden if an image is slow
setTimeout(onLoaded, 1800);
