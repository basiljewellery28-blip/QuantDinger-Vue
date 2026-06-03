import request from '@/utils/request'

// Research API — surfaces our quant research (the "brain") on-platform.
const api = {
  ofi: '/api/research/ofi',
  cost: '/api/research/cost',
  hours: '/api/research/hours'
}

// OFI -> price-impact study (Cont-Kukanov-Stoikov 2014) on our live XAUUSD feed.
export function getOfiStudy () {
  return request({
    url: api.ofi,
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
