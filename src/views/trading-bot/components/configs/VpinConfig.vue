<template>
  <a-form-model
    ref="form"
    :model="form"
    :rules="rules"
    :label-col="{ span: 10 }"
    :wrapper-col="{ span: 12 }"
  >
    <a-alert
      type="info"
      show-icon
      style="margin-bottom: 16px;"
      :message="$t('trading-bot.vpin.aboutTitle')"
      :description="$t('trading-bot.vpin.aboutDesc')"
    />

    <a-divider>{{ $t('trading-bot.vpin.asTitle') }}</a-divider>
    <a-form-model-item :label="$t('trading-bot.vpin.riskAversion')" prop="riskAversion">
      <a-input-number
        v-model="form.riskAversion"
        :min="0.001"
        :step="0.1"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.riskAversionHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.vpin.bookLiquidity')" prop="bookLiquidity">
      <a-input-number
        v-model="form.bookLiquidity"
        :min="0.01"
        :step="100"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.bookLiquidityHint') }}</div>
    </a-form-model-item>
    <div class="band-preview">
      <a-icon type="line-chart" /> {{ $t('trading-bot.vpin.spreadPreview') }}:
      <strong>{{ spreadPreview }}</strong>
    </div>

    <a-divider>{{ $t('trading-bot.vpin.vpinTitle') }}</a-divider>
    <a-form-model-item :label="$t('trading-bot.vpin.vpinThreshold')" prop="vpinThreshold">
      <a-input-number
        v-model="form.vpinThreshold"
        :min="0"
        :max="1"
        :step="0.05"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.vpinThresholdHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.vpin.bucketVolume')" prop="bucketVolume">
      <a-input-number
        v-model="form.bucketVolume"
        :min="1"
        :step="100"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.bucketVolumeHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.vpin.rollingWindow')" prop="rollingWindow">
      <a-input-number
        v-model="form.rollingWindow"
        :min="5"
        :max="500"
        :step="5"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.rollingWindowHint') }}</div>
    </a-form-model-item>

    <a-divider>{{ $t('trading-bot.vpin.executionTitle') }}</a-divider>
    <a-form-model-item :label="$t('trading-bot.vpin.orderSize')" prop="orderSize">
      <a-input-number
        v-model="form.orderSize"
        :min="0.01"
        :step="0.01"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.orderSizeHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.vpin.maxInventory')" prop="maxInventory">
      <a-input-number
        v-model="form.maxInventory"
        :min="0.01"
        :step="0.1"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.maxInventoryHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.vpin.volatilityPeriod')" prop="volatilityPeriod">
      <a-input-number
        v-model="form.volatilityPeriod"
        :min="2"
        :max="200"
        :step="1"
        style="width: 100%"
        @change="emit"
      />
      <div class="hint">{{ $t('trading-bot.vpin.volatilityPeriodHint') }}</div>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  name: 'VpinConfig',
  props: {
    value: { type: Object, default: () => ({}) },
    initialCapital: { type: Number, default: null },
    marketType: { type: String, default: 'spot' }
  },
  data () {
    return {
      form: {
        riskAversion: this.value.riskAversion != null ? this.value.riskAversion : 50,
        bookLiquidity: this.value.bookLiquidity != null ? this.value.bookLiquidity : 12500,
        vpinThreshold: this.value.vpinThreshold != null ? this.value.vpinThreshold : 0.8,
        bucketVolume: this.value.bucketVolume != null ? this.value.bucketVolume : 1000,
        rollingWindow: this.value.rollingWindow != null ? this.value.rollingWindow : 50,
        orderSize: this.value.orderSize != null ? this.value.orderSize : 0.01,
        maxInventory: this.value.maxInventory != null ? this.value.maxInventory : 1.0,
        volatilityPeriod: this.value.volatilityPeriod != null ? this.value.volatilityPeriod : 20
      },
      rules: {
        riskAversion: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.riskAversionReq'), trigger: 'change' }],
        bookLiquidity: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.bookLiquidityReq'), trigger: 'change' }],
        vpinThreshold: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.vpinThresholdReq'), trigger: 'change' }],
        bucketVolume: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.bucketVolumeReq'), trigger: 'change' }],
        rollingWindow: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.rollingWindowReq'), trigger: 'change' }],
        orderSize: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.orderSizeReq'), trigger: 'change' }],
        maxInventory: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.maxInventoryReq'), trigger: 'change' }],
        volatilityPeriod: [{ required: true, type: 'number', message: this.$t('trading-bot.vpin.volatilityPeriodReq'), trigger: 'change' }]
      }
    }
  },
  computed: {
    spreadPreview () {
      // Avellaneda-Stoikov spread in price units: (1/gamma) * ln(1 + gamma/kappa).
      // Display as a generic "X pips" (with EURUSD pip=0.0001 assumption) so the
      // user gets a fast sanity check. For non-1.1x pairs they should re-eyeball
      // against the actual band values that appear once running.
      const g = Number(this.form.riskAversion)
      const k = Number(this.form.bookLiquidity)
      if (!isFinite(g) || !isFinite(k) || g <= 0 || k <= 0) return '-'
      const spread = (1 / g) * Math.log(1 + g / k)
      const pips = spread / 0.0001
      return `${spread.toFixed(6)} price units (~${pips.toFixed(1)} pips on EURUSD-scale pairs)`
    }
  },
  methods: {
    emit () {
      this.$emit('input', { ...this.form })
    },
    validate () {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(ok => ok ? resolve() : reject(new Error(this.$t('trading-bot.vpin.validateFailed'))))
      })
    }
  },
  mounted () {
    this.emit()
  }
}
</script>

<style lang="less" scoped>
.hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}
.band-preview {
  background: #f6f8fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 8px 0 16px;
  font-size: 13px;
  color: #595959;
}
</style>
