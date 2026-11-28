// FridayFinds — HTML for the list, the deal pages and the method page.
// Every value from the data is escaped before it goes into the page; the
// discount and the saving are always computed from price and was, so the
// numbers on screen can never disagree with each other.

import { SIGNAL_LABELS } from "./data.js";

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const usd = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const saved = (d) => d.was - d.price;
export const checkedAt = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

export function stats(deals) {
  const totalSaved = deals.reduce((s, d) => s + saved(d), 0);
  const newLows = deals.filter((d) => d.signal === "new-low").length;
  const avg = Math.round(deals.reduce((s, d) => s + percentOff(d), 0) / deals.length);
  return `<div class="stats" role="list">
    <div class="stat" role="listitem"><b>${deals.length}</b><span>deals checked today</span></div>
    <div class="stat" role="listitem"><b>${avg}%</b><span>average discount</span></div>
    <div class="stat" role="listitem"><b>${newLows}</b><span>new lows</span></div>
    <div class="stat" role="listitem"><b>${usd(Math.round(totalSaved))}</b><span>total saving if you bought one of each</span></div>
  </div>`;
}

export function card(d) {
  return `<li class="deal">
    <span class="badge ${escape(d.signal)}">${escape(SIGNAL_LABELS[d.signal])}</span>
    <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
    <div class="meta">${escape(d.store)} · ${escape(d.category)}</div>
    <div class="price-row"><span class="now">${usd(d.price)}</span><span class="was">${usd(d.was)}</span><span class="off">${percentOff(d)}% off</span></div>
    <div class="saved">Save ${usd(saved(d))}</div>
    <p class="note">${escape(d.signalNote)}</p>
    <div class="checked">Checked ${checkedAt(d.checked)} · Source: ${escape(d.source)}</div>
    <a class="go" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} ↗</a>
  </li>`;
}

export function list(deals, shown) {
  return `${stats(deals)}
  <p>Black Friday is today, <strong>27 November 2026</strong>. Every deal below was checked today — sale price, usual price, store link and the time it was read. The badge on each deal says whether it is really a deal.</p>
  <div class="controls">
    <input type="search" id="q" placeholder="Search deals, stores, categories…" aria-label="Search deals">
    <select id="store" aria-label="Filter by store"><option value="">All stores</option></select>
    <select id="minoff" aria-label="Filter by discount">
      <option value="0">Any discount</option>
      <option value="25">25% off or more</option>
      <option value="40">40% off or more</option>
      <option value="50">50% off or more</option>
    </select>
    <select id="signal" aria-label="Filter by verdict">
      <option value="">Any verdict</option>
      <option value="new-low">New lows only</option>
      <option value="strong">Strong prices</option>
      <option value="routine">Routine sales</option>
      <option value="fine-print">Check the fine print</option>
    </select>
    <select id="sort" aria-label="Sort deals">
      <option value="pct">Biggest discount first</option>
      <option value="saved">Biggest saving first</option>
      <option value="price">Lowest price first</option>
      <option value="name">Name A–Z</option>
    </select>
  </div>
  <p class="count" id="count"></p>
  <ul class="deals" id="deals">${shown.map(card).join("")}</ul>`;
}

export function detail(d, all) {
  const others = all.filter((x) => x.id !== d.id && x.category === d.category).slice(0, 3);
  const compareRows = (d.alsoAt ?? [])
    .map((a) => `<tr><td>${escape(a.store)}</td><td>${usd(a.price)}</td><td>${a.price < d.price ? "Cheaper" : a.price === d.price ? "Same price" : "Pricier"}</td></tr>`)
    .join("");
  return `<p><a class="back" href="#/">&larr; All deals</a></p>
  <article class="detail">
    <span class="badge ${escape(d.signal)}">${escape(SIGNAL_LABELS[d.signal])}</span>
    <h1>${escape(d.title)}</h1>
    <p class="meta">${escape(d.store)} · ${escape(d.category)}</p>
    <dl class="facts">
      <div><dt>Sale price</dt><dd>${usd(d.price)}</dd></div>
      <div><dt>Usual price</dt><dd>${usd(d.was)}</dd></div>
      <div><dt>Discount</dt><dd>${percentOff(d)}% off — save ${usd(saved(d))}</dd></div>
      <div><dt>Checked</dt><dd>${checkedAt(d.checked)}</dd></div>
    </dl>
    <div class="verdict-box ${escape(d.signal)}">
      <strong>Is it really a deal? ${escape(SIGNAL_LABELS[d.signal])}.</strong>
      ${escape(d.signalNote)}
    </div>
    <p><strong>Where the price was read:</strong> ${escape(d.source)}</p>
    <p><a class="go" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} ↗</a></p>
    ${
      compareRows
        ? `<section><h2>Same product, other stores</h2>
      <table class="compare"><thead><tr><th>Store</th><th>Price</th><th>Against this deal</th></tr></thead>
      <tbody><tr><td>${escape(d.store)}</td><td>${usd(d.price)}</td><td>This deal</td></tr>${compareRows}</tbody></table>
      <p>Same product, checked today — compare before you buy.</p></section>`
        : ""
    }
    ${
      others.length
        ? `<section><h2>More in ${escape(d.category)}</h2><ul class="deals">${others.map(card).join("")}</ul></section>`
        : ""
    }
  </article>`;
}

export function about() {
  return `<p><a class="back" href="#/">&larr; All deals</a></p>
  <section>
    <h1>How deals are checked</h1>
    <p>FridayFinds is a deal finder, not a price scraper. Each deal on this site was found and checked by the agent that built it, on <strong>27 November 2026</strong>:</p>
    <ol>
      <li><strong>Found</strong> in a store's own Black Friday sale or in a deals report that names the store and the price — The Verge, 9to5Mac, MacRumors, Best Buy's own Black Friday release, and other deal trackers.</li>
      <li><strong>Checked</strong> — the sale price and the usual price were read together, and the discount on the page is computed from those two numbers, so it always adds up.</li>
      <li><strong>Judged honestly</strong> — a badge on every deal says whether it is a new low, a strong price, a routine sale, or a headline saving that needs a second look. The verdict follows one rule, applied to every deal from its own numbers: <strong>New low</strong> means the lowest price yet, with the evidence in the note; <strong>Strong price</strong> means 40% off or more, or $100 or more saved; <strong>Routine sale</strong> means a smaller cut, under 40% off and under $100 saved; <strong>Check the fine print</strong> means the headline saving overstates the real one. The Shark AI Ultra robot vacuum is the example: its list price is $549.99, but trackers put its typical selling price near $449.99, so the real saving is about $190, not $290.</li>
    </ol>
    <p><strong>What is not here:</strong> no deal is listed from a price the agent never saw, no store link goes anywhere but the store's own search for that product, and no price is invented. The full source for every deal is in SOURCES.md in the repository.</p>
    <p><strong>Prices move.</strong> Black Friday prices can change by the hour and stock runs out. Check the price at checkout before you pay — if it moved, the deal is gone.</p>
  </section>`;
}

export function missing() {
  return `<h1>Not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
