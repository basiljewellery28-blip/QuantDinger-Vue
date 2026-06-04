import request from '@/utils/request'

// Research API — surfaces our quant research (the "brain") on-platform.
const api = {
  ofi: '/api/research/ofi',
  ofiCrypto: '/api/research/ofi_crypto',
  cost: '/api/research/cost',
  hours: '/api/research/hours',
  vpinLive: '/api/research/vpin_live',
  vpinMaker: '/api/research/vpin_maker'
}

// Live VPIN / A-S desk for the running crypto scalper (reservation/bands, VPIN, OFI, inventory, trades).
export function getVpinLive () {
  return request({
    url: api.vpinLive,
    method: 'get'
  })
}

// A-S MAKER-quoting test on the real crypto L2 book (does maker execution beat fees?).
export function getVpinMaker () {
  return request({
    url: api.vpinMaker,
    method: 'get'
  })
}

// OFI -> price-impact study (Cont-Kukanov-Stoikov 2014) on our live XAUUSD feed.
export function getOfiStudy () {
  return request({
    url: api.ofi,
    method: 'get'
  })
}

// Same CKS OFI study on a REAL crypto L2 feed (BTC/USDT) — synthetic-vs-real test.
export function getOfiCryptoStudy () {
  return request({
    url: api.ofiCrypto,
    method: 'get'
  })
}

// Cost vs edge — A-S band-floor study (To-Try #5).
export function getCostStudy () {
  return request({
    url: api.cost,
    method: 'get'
  })
}

// Liquid-hours seasonality study (CKS intraday) — P&L by hour + OOS filter test.
export function getHoursStudy () {
  return request({
    url: api.hours,
    method: 'get'
  })
}
