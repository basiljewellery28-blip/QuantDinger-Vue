# BASILX Frontend Notes

This repository is the **BASILX fork of QuantDinger-Vue**, paired with the
backend at [`basiljewellery28-blip/basilx`](https://github.com/basiljewellery28-blip/basilx)
(specifically `QuantDinger/backend_api_python/`).

Upstream: [QuantDinger Vue (private)](https://github.com/brokermr810/QuantDinger-Vue)
— see `README.md` / `README_CN.md` for the original docs.

## What's BASILX-specific

Everything below is added on top of upstream. Keep this list current when
landing new wizard cards / API integrations so the backend repo's mirror
copy doesn't drift.

### Trading-bot wizard

`src/views/trading-bot/components/BotCreateWizard.vue`
- Registers two new bot types in `BOT_TYPE_MAP`:
  - `vpin_toxic_scalper` (Tier 1 in the backend roadmap) — Avellaneda-Stoikov
    market maker with VPIN toxicity guard.
  - `pairs_trader` (Tier 3) — cointegration / Kalman hedge ratio.
- `buildPayload` branches that fetch the strategy script from the backend
  endpoints (`/api/bots/vpin-toxic-scalper-script`,
  `/api/bots/pairs-trader-script`) and inject `strategyParams.symbol` into
  `bot_params`. Both bots are bidirectional (`trade_direction='both'`) and
  use market orders.
- Auto-switching market category when the user picks a bot type that
  doesn't support the currently-selected market.

`src/views/trading-bot/components/configs/VpinConfig.vue`
`src/views/trading-bot/components/configs/PairsConfig.vue`
- New wizard step-2 forms for each bot. VPIN exposes γ/κ, VPIN threshold,
  bucket volume, etc. Pairs exposes symbolB, spread window, entry/exit/stop
  z-scores, Kalman prior, OU window.

### API client

`src/api/strategy.js`
- Adds `fetchVpinScript()` and `fetchPairsScript()` for the wizard.

### Localisation

`src/locales/lang/en-US.js`
- ~35 keys under `trading-bot.vpin.*` and `trading-bot.pairs.*` for the
  new wizard cards. The Chinese pack hasn't been mirrored yet — TODO if
  needed.

## How to develop against the BASILX backend

The wizard expects the backend at `http://localhost:5000` (see
`.env.development`). Start the backend first (via `start-backend.ps1` in
the backend repo) and confirm `GET /api/bots/vpin-toxic-scalper-script` +
`GET /api/bots/pairs-trader-script` return JSON, then run this Vue app in
dev mode.

## Backend coupling

When the backend lands a new `bot_type` (in `broker_market_policy.py`'s
`BOT_TYPE_MARKETS` and the matching `app/services/bot_scripts/*_template.py`),
the wizard needs three things added here:

1. A `BOT_TYPE_MAP` entry with the icon + gradient.
2. A `<bot>Config.vue` component for step 2 of the wizard.
3. A `fetch<Bot>Script()` API client function.
4. i18n keys for the card metadata + form labels.

There is no codegen, so the two repos must be updated together. See the
VPIN/pairs additions for the canonical pattern.
