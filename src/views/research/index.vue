<template>
  <div class="research-page">
    <a-page-header
      title="Research — Microstructure Lab"
      sub-title="Visual, on-platform quant research · wired to the Quant Bot Research brain"
    >
      <template #extra>
        <a-button icon="reload" :loading="loading" @click="load">Refresh</a-button>
      </template>
    </a-page-header>

    <a-spin :spinning="loading">
      <!-- Experiment header -->
      <a-card :bordered="false" class="exp-card">
        <div class="exp-title">{{ expTitle }}</div>
        <div class="exp-hyp">{{ expHyp }}</div>
        <div class="exp-meta">
          <a-tag color="purple">Source: {{ study.source || 'bot 12 live OFI (L2 LOB)' }}</a-tag>
          <a-tag v-if="study.status === 'ready'" :color="study.predictive ? 'green' : 'red'" class="verdict">
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
import { getOfiStudy, getCostStudy, getHoursStudy } from '@/api/research'

export default {
  name: 'Research',
  data () {
    return { loading: true, study: {}, cost: {}, hours: {}, chart: null, costChart: null, hoursChart: null, timer: null }
  },
  computed: {
    expTitle () { return (this.study.experiment && this.study.experiment.title) || 'OFI → price impact (Cont-Kukanov-Stoikov 2014)' },
    expHyp () { return (this.study.experiment && this.study.experiment.hypothesis) || 'ΔP ≈ β·OFI — does it hold on our XAUUSD L2 feed?' },
    costTitle () { return (this.cost.experiment && this.cost.experiment.title) || 'Cost vs Edge — A-S band floor (To-Try #5)' },
    costHyp () { return (this.cost.experiment && this.cost.experiment.hypothesis) || '' },
    hoursTitle () { return (this.hours.experiment && this.hours.experiment.title) || 'Liquid-hours seasonality (CKS intraday)' },
    hoursHyp () { return (this.hours.experiment && this.hours.experiment.hypothesis) || '' }
  },
  mounted () {
    this.load()
    this.timer = setInterval(this.load, 30000)
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy () {
    if (this.timer) clearInterval(this.timer)
    if (this.chart) this.chart.dispose()
    if (this.costChart) this.costChart.dispose()
    if (this.hoursChart) this.hoursChart.dispose()
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    pct (v) { return v == null ? 0 : Math.round(v * 1000) / 10 },
    r2Style (v) { return { color: (v >= 0.05) ? '#3f8600' : '#cf1322' } },
    resize () { if (this.chart) this.chart.resize(); if (this.costChart) this.costChart.resize(); if (this.hoursChart) this.hoursChart.resize() },
    load () {
      getOfiStudy().then(res => {
        this.study = (res && res.data) ? res.data : (res || {})
        this.loading = false
        this.$nextTick(this.renderChart)
      }).catch(() => { this.loading = false })
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
      this.chart.setOption({
        grid: { left: 60, right: 30, top: 20, bottom: 50 },
        tooltip: { trigger: 'item', formatter: p => `OFI ${p.value[0]}<br/>Δp ${p.value[1]}` },
        xAxis: { name: 'OFI (net L2 imbalance)', nameLocation: 'middle', nameGap: 30, type: 'value' },
        yAxis: { name: 'Δ price next bar ($)', type: 'value' },
        series: [{ type: 'scatter', symbolSize: 6, data: pts, itemStyle: { color: '#1890ff', opacity: 0.5 } }]
      })
    }
  }
}
</script>

<style lang="less" scoped>
.research-page { padding: 0 8px 24px; }
.exp-card { margin-bottom: 16px; }
.exp-title { font-size: 18px; font-weight: 600; }
.exp-hyp { color: rgba(0,0,0,.55); margin: 6px 0 12px; }
.exp-meta .verdict { font-weight: 600; }
.kpis { margin-bottom: 16px; }
.chart-card { margin-bottom: 16px; }
.scatter { width: 100%; height: 420px; }
.chart-note { color: rgba(0,0,0,.55); margin-top: 8px; font-size: 13px; }
</style>
