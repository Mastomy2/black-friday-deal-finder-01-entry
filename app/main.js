// FridayFinds — routing, search, filters and sorting. The deals live in
// data.js, so the site needs no network to show them; each deal links out
// to its store. Routes (hash, so the static files work anywhere):
//
//   #/                 the deal list, with search and filters
//   #/cat/<category>   the list filtered to one category
//   #/deal/<id>        one deal, with its verdict and store comparison
//   #/about            how deals are checked
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { CATEGORIES, STORES, deals } from "./data.js";
import { about, card, detail, list, missing, percentOff, saved } from "./views.js";

const app = document.getElementById("app");
const catsNav = document.getElementById("cats");

function renderCats(active) {
  catsNav.innerHTML =
    `<a href="#/" class="${active === "" ? "on" : ""}">All deals</a>` +
    CATEGORIES.map(
      (c) => `<a href="#/cat/${encodeURIComponent(c)}" class="${active === c ? "on" : ""}">${c}</a>`,
    ).join("");
}

function applyFilters() {
  const q = document.getElementById("q").value.trim().toLowerCase();
  const store = document.getElementById("store").value;
  const minoff = Number(document.getElementById("minoff").value);
  const signal = document.getElementById("signal").value;
  const sort = document.getElementById("sort").value;
  const cat = window.__cat ?? "";
  let shown = deals.filter(
    (d) =>
      (cat === "" || d.category === cat) &&
      (store === "" || d.store === store) &&
      (signal === "" || d.signal === signal) &&
      percentOff(d) >= minoff &&
      (q === "" || `${d.title} ${d.store} ${d.category} ${d.signalNote}`.toLowerCase().includes(q)),
  );
  if (sort === "pct") shown = [...shown].sort((a, b) => percentOff(b) - percentOff(a));
  if (sort === "saved") shown = [...shown].sort((a, b) => saved(b) - saved(a));
  if (sort === "price") shown = [...shown].sort((a, b) => a.price - b.price);
  if (sort === "name") shown = [...shown].sort((a, b) => a.title.localeCompare(b.title));
  const box = document.getElementById("deals");
  const count = document.getElementById("count");
  box.innerHTML = shown.length ? shown.map(card).join("") : `<li class="empty">No deal matches — try clearing a filter.</li>`;
  count.textContent = `${shown.length} of ${deals.length} deals`;
}

function renderList() {
  window.__cat = "";
  app.innerHTML = list(deals, [...deals].sort((a, b) => percentOff(b) - percentOff(a)));
  const storeSel = document.getElementById("store");
  STORES.forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    storeSel.appendChild(o);
  });
  document.getElementById("count").textContent = `${deals.length} of ${deals.length} deals`;
  ["q", "store", "minoff", "signal", "sort"].forEach((id) =>
    document.getElementById(id).addEventListener("input", applyFilters),
  );
}

function renderCategory(cat) {
  window.__cat = cat;
  app.innerHTML = list(deals, deals.filter((d) => d.category === cat));
  const storeSel = document.getElementById("store");
  STORES.forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    storeSel.appendChild(o);
  });
  document.getElementById("count").textContent = `${deals.filter((d) => d.category === cat).length} of ${deals.length} deals`;
  ["q", "store", "minoff", "signal", "sort"].forEach((id) =>
    document.getElementById(id).addEventListener("input", applyFilters),
  );
}

function render() {
  window.__shotReady = false;
  const hash = location.hash;
  const dealMatch = hash.match(/^#\/deal\/([^/?]+)/);
  const catMatch = hash.match(/^#\/cat\/(.+)/);
  if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    renderCats("");
    document.title = `${found ? found.title : "Not found"} | FridayFinds`;
    app.innerHTML = found ? detail(found, deals) : missing();
  } else if (hash === "#/about") {
    renderCats("");
    document.title = "How deals are checked | FridayFinds";
    app.innerHTML = about();
  } else if (catMatch) {
    const cat = decodeURIComponent(catMatch[1]);
    renderCats(CATEGORIES.includes(cat) ? cat : "");
    document.title = `${cat} deals | FridayFinds`;
    renderCategory(cat);
  } else {
    renderCats("");
    document.title = "FridayFinds — Real Black Friday Deals, Checked Today";
    renderList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
