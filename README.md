# FridayFinds — Real Black Friday Deals, Checked Today

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/Mastomy2/black-friday-deal-finder-01-entry/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/Mastomy2/black-friday-deal-finder-01-entry/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

FridayFinds is a Black Friday and Cyber Monday deal finder that runs from static files, with no network request, on a desktop and on a phone. It lists **33 real deals** — each with its product, store, link to the product at that store, sale price, usual price, discount and the time its price was checked — found and checked by the agent that built it on **27 November 2026** (Black Friday).

## What makes it a finder, not a list

- **Search and filters that work** — search across titles, stores and categories; filter by category, store, minimum discount and verdict; sort by biggest discount, biggest saving, lowest price or name.
- **An honest verdict on every deal** — each deal carries a badge: *New low* (lowest price yet), *Strong price* (a real cut), *Routine sale* (a small cut), or *Check the fine print* (the headline saving overstates the real one — the Shark AI Ultra robot vacuum's typical price is near $449.99, not $549.99, so the real saving is about $190).
- **Same product, other stores** — AirPods Pro 3, the Nintendo Switch 2 bundle, the Kindle Paperwhite and the MacBook Air show their price at other stores too, so a shopper can compare before buying.
- **Every price is sourced** — the store or deals report where each price was read is shown on the deal, and the full per-deal source list is in `SOURCES.md`. The discount is always computed from the two prices, so it always adds up.

## Pages

- **All deals** — the full board, with stats (33 deals, average discount, new lows, total saving)
- **Category pages** — Audio, Laptops & tablets, TVs, Smart home, Gaming, Kitchen & home, Toys, each reached from the header
- **Deal pages** — full facts, the verdict with its evidence, the store comparison table, and more in the same category
- **How deals are checked** — the method, the sources, and the warning that prices move

## Running

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network request: every file the site loads is under `app/`.
