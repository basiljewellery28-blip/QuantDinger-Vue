<template>
  <div class="research-page">
    <a-page-header
      title="VPIN / Avellaneda-Stoikov Research Desk"
      sub-title="Our microstructure strategy, live on real L2 — quoting state, toxicity, order-flow, and the cost/execution studies that decide if it works"
    >
      <template #extra>
        <a-button icon="reload" :loading="loading" @click="load">Refresh</a-button>
      </template>
    </a-page-header>

    <a-spin :spinning="loading">
      <!-- ===== VPIN / A-S LIVE DESK (the running strategy on real crypto L2) ===== -->
      <a-card :bordered="false" class="exp-card vpin-hero">
        <div class="exp-title">
          🛰️ VPIN / Avellaneda-Stoikov — Live Desk
          <a-tag :color="(vpin.bot && vpin.bot.status==='running') ? 'green' : 'red'">{{ vpin.bot ? vpin.bot.status : '—' }}</a-tag>
          <a-tag color="cyan">{{ (vpin.bot && vpin.bot.symbol) || 'BTC/USDT' }} · signal-mode (paper, no real money)</a-tag>
        </div>
        <div class="exp-hyp">Live A-S market-making state on a REAL crypto L2 book — reservation price, quoting bands, VPIN toxicity, order-flow imbalance, inventory.</div>
        <a-tag v-if="vpin.status==='ready'" :color="vpin.verdict_level || 'gray'" class="verdict">{{ vpin.verdict }}</a-tag>
      </a-card>
      <template v-if="vpin.status==='ready'">
        <a-row :gutter="16" class="kpis">
          <a-col :span="4"><a-card><a-statistic title="Mid" :value="vpin.state.mid || vpin.state.last_price" :precision="2" prefix="$" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Reservation" :value="vpin.state.reservation_price" :precision="2" prefix="$" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Band ±" :value="vpin.state.band_half_width" :precision="2" prefix="$" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="VPIN toxicity" :value="pct(vpin.state.vpin_cdf)" suffix="%" :value-style="vpinStyle(vpin.state.vpin_cdf)" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Net OFI" :value="vpin.state.ofi" :precision="2" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Inventory" :value="vpin.state.inventory" :precision="4" suffix=" BTC" /></a-card></a-col>
        </a-row>
        <a-row :gutter="16" class="kpis">
          <a-col :span="4"><a-card><a-statistic title="Round-trips" :value="vpin.stats.round_trips" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Net P&L" :value="vpin.stats.net_pnl" :precision="4" prefix="$" :value-style="pnlStyle(vpin.stats.net_pnl)" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Win rate" :value="vpin.stats.win_rate" suffix="%" :value-style="pnlStyle((vpin.stats.win_rate||0)-50)" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Avg gross" :value="vpin.stats.gross_bps_avg" :precision="2" suffix=" bps" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="κ (live)" :value="vpin.state.kappa_live" :precision="1" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="OU half-life" :value="vpin.state.ou_half_life_bars" :precision="1" suffix=" bars" /></a-card></a-col>
        </a-row>
        <a-card :bordered="false" class="chart-card" title="A-S quoting — mid price vs reservation & bid/ask bands (live, real BTC/USDT L2)">
          <div ref="asChart" class="scatter"></div>
          <div class="chart-note">
            The A-S maker centres a <b>reservation price</b> on the mid (skewed by inventory) and quotes a
            <b>bid band</b>/<b>ask band</b> ± a spread. The deployed bot takes liquidity when price breaches a band —
            see the Maker-vs-Taker study below for why execution mode decides the P&L.
          </div>
        </a-card>
      </template>
      <a-empty v-else description="Loading live VPIN / A-S desk…" style="margin-top: 30px" />

      <!-- ===== MAKER vs TAKER: does A-S as a MAKER beat fees where the taker lost? ===== -->
      <a-divider />
      <a-card :bordered="false" class="exp-card">
        <div class="exp-title">{{ makerTitle }} <a-tag color="cyan">REAL L2 sim</a-tag></div>
        <div class="exp-hyp">{{ makerHyp }}</div>
        <a-tag v-if="maker.status==='ready'" :color="maker.verdict_level || 'red'" class="verdict">{{ maker.verdict }}</a-tag>
        <a-tag v-else color="blue">Collecting real book path…</a-tag>
      </a-card>
      <template v-if="maker.status==='ready'">
        <a-row :gutter="16" class="kpis">
          <a-col :span="6"><a-card><a-statistic title="BTC spread (median)" :value="maker.spread_bps_median" :precision="4" suffix=" bps" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="Maker fee ÷ spread" :value="maker.fee_vs_spread_x" suffix="×" :value-style="{color:'#cf1322'}" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="Best net (≥40 fills)" :value="maker.best && maker.best.net_usd" :precision="2" prefix="$" :value-style="pnlStyle(maker.best && maker.best.net_usd)" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="Book snapshots" :value="maker.n_snapshots" /></a-card></a-col>
        </a-row>
        <a-card :bordered="false" class="chart-card" title="A-S MAKER net P&L vs band width (retail 0.02% fee) — grey = too few fills (noise)">
          <div ref="makerChart" class="scatter"></div>
          <div class="chart-note">
            <b>Insight:</b> {{ maker.insight }}<br/>
            <b>Caveat:</b> {{ maker.caveat }}
          </div>
        </a-card>
      </template>

      <a-divider />
      <!-- Experiment header -->
      <a-card :bordered="false" class="exp-card">
        <div class="exp-title">{{ expTitle }}</div>
        <div class="exp-hyp">{{ expHyp }}</div>
        <div class="exp-meta">
          <a-tag color="purple">Source: {{ study.source || 'bot 12 live OFI (L2 LOB)' }}</a-tag>
          <a-tag v-if="study.status === 'ready'" :color="study.verdict_level || 'red'" class="verdict">
            {{ study.verdict }}
          </a-tag>
          <a-tag v-else color="blue">Collecting live data…</a-tag>
        </div>
      </a-card>

      <!-- KPIs -->
      <a-row :gutter="16" class="kpis" v-if="study.status === 'ready'">
        <a-col :span="4"><a-card><a-statistic title="Samples" :value="study.n" /></a-card></a-col>
        <a-col :span="4"><a-card><a-statistic title="OFI ≠ 0 rate" :value="study.ofi_nonzero_pct" suffix="%" /></a-card></a-col>
        <a-col :span="4">
          <a-card><a-statistic title="Predictive R²" :value="pct(study.r2)" suffix="%" :value-style="r2Style(study.r2)" /></a-card>
        </a-col>
        <a-col :span="4"><a-card><a-statistic title="Contemp. R²" :value="pct(study.r2_contemp)" suffix="%" /></a-card></a-col>
        <a-col :span="4"><a-card><a-statistic title="β (price impact)" :value="study.beta" :precision="5" /></a-card></a-col>
        <a-col :span="4"><a-card><a-statistic title="t-stat (β)" :value="study.t_beta" :precision="2" /></a-card></a-col>
      </a-row>

      <!-- Scatter: OFI vs next-bar price change -->
      <a-card
        v-if="study.status === 'ready'"
        :bordered="false"
        class="chart-card"
        title="OFI (net L2 imbalance) vs next-bar Δprice — XAUUSD live"
      >
        <div ref="scatter" class="scatter"></div>
        <div class="chart-note">
          CKS-2014 found R² ≈ 65% on US-stock TAQ data. On our MT5 demo L2 feed the predictive R² is
          <b>{{ pct(study.r2) }}%</b> — the visual scatter shows whether OFI actually leads price here.
        </div>
      </a-card>

      <a-empty v-else description="Collecting live OFI + price… check back shortly." style="margin-top: 60px" />

      <!-- ===== Study 1b: SAME OFI test on a REAL crypto L2 feed ===== -->
      <a-card :bordered="false" class="exp-card" style="margin-top:16px">
        <div class="exp-title">{{ cryptoOfiTitle }} <a-tag color="cyan">REAL L2</a-tag></div>
        <div class="exp-hyp">{{ cryptoOfiHyp }}</div>
        <div class="exp-meta">
          <a-tag color="purple">Source: {{ cryptoOfi.source || 'real exchange L2 (ccxt)' }}</a-tag>
          <a-tag v-if="cryptoOfi.status === 'ready'" :color="cryptoOfi.verdict_level || 'red'" class="verdict">{{ cryptoOfi.verdict }}</a-tag>
          <a-tag v-else color="blue">Collecting real-L2 data…</a-tag>
        </div>
      </a-card>
      <template v-if="cryptoOfi.status === 'ready'">
        <a-row :gutter="16" class="kpis">
          <a-col :span="4"><a-card><a-statistic title="Samples" :value="cryptoOfi.n" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="OFI ≠ 0 rate" :value="cryptoOfi.ofi_nonzero_pct" suffix="%" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Predictive R²" :value="pct(cryptoOfi.r2)" suffix="%" :value-style="r2Style(cryptoOfi.r2)" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="Contemp. R²" :value="pct(cryptoOfi.r2_contemp)" suffix="%" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="β" :value="cryptoOfi.beta" :precision="6" /></a-card></a-col>
          <a-col :span="4"><a-card><a-statistic title="t-stat (β)" :value="cryptoOfi.t_beta" :precision="2" /></a-card></a-col>
        </a-row>
        <a-card :bordered="false" class="chart-card" title="OFI vs next-step Δprice — BTC/USDT REAL L2">
          <div ref="cryptoScatter" class="scatter"></div>
          <div class="chart-note">
            Same CKS test, but on a genuine deep order book. If R² here &gt; the demo feed's ~0%, the demo's
            synthetic L2 was the bottleneck — the microstructure/OFI method works when the data is real.
          </div>
        </a-card>
      </template>
      <a-empty v-else description="Collecting real crypto L2 OFI… (BTC/USDT, ~30s buckets)" style="margin-top: 40px" />

      <!-- ===== Study 2: Cost vs Edge (A-S band floor, To-Try #5) ===== -->
      <a-divider />
      <a-card :bordered="false" class="exp-card">
        <div class="exp-title">{{ costTitle }}</div>
        <div class="exp-hyp">{{ costHyp }}</div>
        <a-tag v-if="cost.status === 'ready'" color="orange" class="verdict">{{ cost.verdict }}</a-tag>
      </a-card>
      <template v-if="cost.status === 'ready'">
        <a-row :gutter="16" class="kpis">
          <a-col :span="6"><a-card><a-statistic title="Gross edge" :value="cost.headline.gross" prefix="$" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="Net edge (live cost)" :value="cost.headline.net" prefix="$" :value-style="{color:'#3f8600'}" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="Cost eats" :value="cost.headline.cost_drag_pct" suffix="%" :value-style="{color:'#cf1322'}" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="Optimal band" :value="cost.best.band_bps" suffix=" bps" /></a-card></a-col>
        </a-row>
        <a-card :bordered="false" class="chart-card" title="Net P&L vs A-S band width (XAUUSD) — the cost sweet-spot">
          <div ref="costChart" class="scatter"></div>
          <div class="chart-note">
            Narrow bands churn into cost (net &lt; 0); too-wide bands stop filling. Net peaks at the
            cost-optimal band ≈ <b>{{ cost.best.band_bps }} bps</b> — where bot 12 already runs.
          </div>
        </a-card>
      </template>

      <!-- ===== Study 3: Liquid-hours seasonality (CKS intraday) ===== -->
      <a-divider />
      <a-card :bordered="false" class="exp-card">
        <div class="exp-title">{{ hoursTitle }}</div>
        <div class="exp-hyp">{{ hoursHyp }}</div>
        <a-tag v-if="hours.status === 'ready'" :color="(hours.oos && hours.oos.helps) ? 'green' : 'red'" class="verdict">{{ hours.verdict }}</a-tag>
      </a-card>
      <template v-if="hours.status === 'ready'">
        <a-row :gutter="16" class="kpis">
          <a-col :span="6"><a-card><a-statistic title="TEST net — all hours" :value="hours.oos.net_test_all" prefix="$" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="TEST net — good hours (OOS)" :value="hours.oos.net_test_filtered" prefix="$" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="OOS improvement" :value="hours.oos.improvement" prefix="$" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="Good hours kept" :value="hours.oos.trades_test_kept" :suffix="'/ ' + hours.oos.trades_test_all + ' trd'" /></a-card></a-col>
        </a-row>
        <a-card :bordered="false" class="chart-card" title="Strategy net P&L by hour-of-day (XAUUSD) — in-sample">
          <div ref="hoursChart" class="scatter"></div>
          <div class="chart-note">
            Green = profitable hour, red = losing. The OOS test picks good hours on train and applies them to
            test — here the gain is marginal and still a loss, so the hour pattern is mostly noise (not tradeable).
          </div>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getOfiStudy, getOfiCryptoStudy, getCostStudy, getHoursStudy, getVpinLive, getVpinMaker } from '@/api/research'

export default {
  name: 'Research',
  data () {
    return { loading: true, vpin: {}, maker: {}, study: {}, cryptoOfi: {}, cost: {}, hours: {}, asChart: null, makerChart: null, chart: null, cryptoChart: null, costChart: null, hoursChart: null, timer: null }
  },
  computed: {
    expTitle () { return (this.study.experiment && this.study.experiment.title) || 'OFI → price impact (Cont-Kukanov-Stoikov 2014)' },
    expHyp () { return (this.study.experiment && this.study.experiment.hypothesis) || 'ΔP ≈ β·OFI — does it hold on our XAUUSD L2 feed?' },
    cryptoOfiTitle () { return (this.cryptoOfi.experiment && this.cryptoOfi.experiment.title) || 'OFI → price impact on REAL L2' },
    cryptoOfiHyp () { return (this.cryptoOfi.experiment && this.cryptoOfi.experiment.hypothesis) || 'Same CKS test on a real deep crypto book.' },
    costTitle () { return (this.cost.experiment && this.cost.experiment.title) || 'Cost vs Edge — A-S band floor (To-Try #5)' },
    costHyp () { return (this.cost.experiment && this.cost.experiment.hypothesis) || '' },
    hoursTitle () { return (this.hours.experiment && this.hours.experiment.title) || 'Liquid-hours seasonality (CKS intraday)' },
    hoursHyp () { return (this.hours.experiment && this.hours.experiment.hypothesis) || '' },
    makerTitle () { return (this.maker.experiment && this.maker.experiment.title) || 'A-S MAKER quoting on real BTC/USDT L2' },
    makerHyp () { return (this.maker.experiment && this.maker.experiment.hypothesis) || 'Post the A-S bands as resting limits (earn the spread). Does the MAKER version beat fees where the TAKER lost?' }
  },
  mounted () {
    this.load()
    this.timer = setInterval(this.load, 30000)
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy () {
    if (this.timer) clearInterval(this.timer)
    if (this.asChart) this.asChart.dispose()
    if (this.makerChart) this.makerChart.dispose()
    if (this.chart) this.chart.dispose()
    if (this.cryptoChart) this.cryptoChart.dispose()
    if (this.costChart) this.costChart.dispose()
    if (this.hoursChart) this.hoursChart.dispose()
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    pct (v) { return v == null ? 0 : Math.round(v * 1000) / 10 },
    r2Style (v) { return { color: (v >= 0.05) ? '#3f8600' : '#cf1322' } },
    vpinStyle (v) { return { color: (v >= 0.8) ? '#cf1322' : (v >= 0.5 ? '#d46b08' : '#3f8600') } },
    pnlStyle (v) { return { color: ((v || 0) >= 0) ? '#3f8600' : '#cf1322' } },
    resize () { [this.asChart, this.makerChart, this.chart, this.cryptoChart, this.costChart, this.hoursChart].forEach(c => { if (c) c.resize() }) },
    scatterOption (pts, xName, yName) {
      return {
        grid: { left: 60, right: 30, top: 20, bottom: 50 },
        tooltip: { trigger: 'item', formatter: p => `${xName} ${p.value[0]}<br/>${yName} ${p.value[1]}` },
        xAxis: { name: xName, nameLocation: 'middle', nameGap: 30, type: 'value' },
        yAxis: { name: yName, type: 'value' },
        series: [{ type: 'scatter', symbolSize: 6, data: pts, itemStyle: { color: '#1890ff', opacity: 0.5 } }]
      }
    },
    load () {
      getVpinLive().then(res => {
        this.vpin = (res && res.data) ? res.data : (res || {})
        this.loading = false
        this.$nextTick(this.renderAsChart)
      }).catch(() => { this.loading = false })
      getVpinMaker().then(res => {
        this.maker = (res && res.data) ? res.data : (res || {})
        this.$nextTick(this.renderMakerChart)
      }).catch(() => {})
      getOfiStudy().then(res => {
        this.study = (res && res.data) ? res.data : (res || {})
        this.loading = false
        this.$nextTick(this.renderChart)
      }).catch(() => { this.loading = false })
      getOfiCryptoStudy().then(res => {
        this.cryptoOfi = (res && res.data) ? res.data : (res || {})
        this.$nextTick(this.renderCryptoChart)
      }).catch(() => {})
      getCostStudy().then(res => {
        this.cost = (res && res.data) ? res.data : (res || {})
        this.$nextTick(this.renderCostChart)
      }).catch(() => {})
      getHoursStudy().then(res => {
        this.hours = (res && res.data) ? res.data : (res || {})
        this.$nextTick(this.renderHoursChart)
      }).catch(() => {})
    },
    renderHoursChart () {
      if (this.hours.status !== 'ready' || !this.$refs.hoursChart) return
      if (!this.hoursChart) this.hoursChart = echarts.init(this.$refs.hoursChart)
      const bh = this.hours.by_hour || []
      this.hoursChart.setOption({
        grid: { left: 60, right: 30, top: 20, bottom: 50 },
        tooltip: { trigger: 'axis', formatter: p => `h${p[0].axisValue}<br/>net $${p[0].data}` },
        xAxis: { name: 'hour-of-day', nameLocation: 'middle', nameGap: 30, type: 'category', data: bh.map(r => r.hour) },
        yAxis: { name: 'net P&L ($)', type: 'value' },
        series: [{
          type: 'bar',
          data: bh.map(r => ({ value: r.net, itemStyle: { color: r.net >= 0 ? '#3f8600' : '#cf1322' } })),
          markLine: { data: [{ yAxis: 0 }], silent: true, lineStyle: { color: '#aaa' } }
        }]
      })
    },
    renderCostChart () {
      if (this.cost.status !== 'ready' || !this.$refs.costChart) return
      if (!this.costChart) this.costChart = echarts.init(this.$refs.costChart)
      const sw = this.cost.sweep || []
      const bands = sw.map(r => r.band_bps)
      this.costChart.setOption({
        grid: { left: 60, right: 30, top: 30, bottom: 50 },
        legend: { data: ['Net (live cost)', 'Gross (no cost)'] },
        tooltip: { trigger: 'axis' },
        xAxis: { name: 'A-S half-band (bps)', nameLocation: 'middle', nameGap: 30, type: 'category', data: bands },
        yAxis: { name: 'P&L ($)', type: 'value' },
        series: [
          { name: 'Net (live cost)', type: 'line', smooth: true, data: sw.map(r => r.net), itemStyle: { color: '#3f8600' }, lineStyle: { width: 3 }, markLine: { data: [{ yAxis: 0 }], silent: true, lineStyle: { color: '#aaa' } } },
          { name: 'Gross (no cost)', type: 'line', smooth: true, data: sw.map(r => r.gross), itemStyle: { color: '#1890ff' }, lineStyle: { type: 'dashed' } }
        ]
      })
    },
    renderChart () {
      if (this.study.status !== 'ready' || !this.$refs.scatter) return
      if (!this.chart) this.chart = echarts.init(this.$refs.scatter)
      const pts = (this.study.scatter || []).map(p => [p.ofi, p.dp])
      this.chart.setOption(this.scatterOption(pts, 'OFI (net L2 imbalance)', 'Δ price next bar ($)'))
    },
    renderCryptoChart () {
      if (this.cryptoOfi.status !== 'ready' || !this.$refs.cryptoScatter) return
      if (!this.cryptoChart) this.cryptoChart = echarts.init(this.$refs.cryptoScatter)
      const pts = (this.cryptoOfi.scatter || []).map(p => [p.ofi, p.dp])
      this.cryptoChart.setOption(this.scatterOption(pts, 'OFI (real L2)', 'Δ mid next step ($)'))
    },
    renderAsChart () {
      if (this.vpin.status !== 'ready' || !this.$refs.asChart) return
      if (!this.asChart) this.asChart = echarts.init(this.$refs.asChart)
      const s = this.vpin.series || []
      const st = this.vpin.state || {}
      const data = s.map(p => [p.t * 1000, p.mid])
      const ml = []
      if (st.reservation_price) ml.push({ yAxis: st.reservation_price, lineStyle: { color: '#722ed1' }, label: { formatter: 'reservation', position: 'insideEndTop' } })
      if (st.bid_band) ml.push({ yAxis: st.bid_band, lineStyle: { color: '#3f8600', type: 'dashed' }, label: { formatter: 'bid band' } })
      if (st.ask_band) ml.push({ yAxis: st.ask_band, lineStyle: { color: '#cf1322', type: 'dashed' }, label: { formatter: 'ask band' } })
      this.asChart.setOption({
        grid: { left: 70, right: 30, top: 20, bottom: 50 },
        tooltip: { trigger: 'axis', formatter: p => `$${(p[0].data[1]).toFixed(2)}` },
        xAxis: { type: 'time' },
        yAxis: { name: 'price ($)', type: 'value', scale: true },
        series: [{ type: 'line', showSymbol: false, name: 'mid', data, lineStyle: { color: '#1890ff', width: 1.5 }, markLine: { symbol: 'none', silent: true, data: ml } }]
      })
    },
    renderMakerChart () {
      if (this.maker.status !== 'ready' || !this.$refs.makerChart) return
      if (!this.makerChart) this.makerChart = echarts.init(this.$refs.makerChart)
      const sw = this.maker.sweep || []
      this.makerChart.setOption({
        grid: { left: 60, right: 30, top: 20, bottom: 50 },
        tooltip: { trigger: 'axis', formatter: p => { const r = sw[p[0].dataIndex] || {}; return `band ${r.band_bps} bps<br/>net $${r.net_usd}<br/>fills ${r.fills}${r.significant ? '' : ' (too few — noise)'}` } },
        xAxis: { name: 'A-S half-band (bps)', nameLocation: 'middle', nameGap: 30, type: 'category', data: sw.map(r => r.band_bps) },
        yAxis: { name: 'maker net P&L ($)', type: 'value' },
        series: [{
          type: 'bar',
          data: sw.map(r => ({ value: r.net_usd, itemStyle: { color: !r.significant ? '#bfbfbf' : (r.net_usd >= 0 ? '#3f8600' : '#cf1322') } })),
          markLine: { data: [{ yAxis: 0 }], silent: true, lineStyle: { color: '#aaa' } }
        }]
      })
    }
  }
}
</script>

<style lang="less" scoped>
.research-page { padding: 0 8px 24px; }
.exp-card { margin-bottom: 16px; }
.vpin-hero { background: linear-gradient(90deg, rgba(114,46,209,.06), rgba(24,144,255,.04)); border-left: 3px solid #722ed1; }
.exp-title { font-size: 18px; font-weight: 600; }
.exp-hyp { color: rgba(0,0,0,.55); margin: 6px 0 12px; }
.exp-meta .verdict { font-weight: 600; }
.kpis { margin-bottom: 16px; }
.chart-card { margin-bottom: 16px; }
.scatter { width: 100%; height: 420px; }
.chart-note { color: rgba(0,0,0,.55); margin-top: 8px; font-size: 13px; }
</style>
