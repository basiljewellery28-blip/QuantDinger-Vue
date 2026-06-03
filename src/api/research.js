import request from '@/utils/request'

// Research API — surfaces our quant research (the "brain") on-platform.
const api = {
  ofi: '/api/research/ofi',
  cost: '/api/research/cost'
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
