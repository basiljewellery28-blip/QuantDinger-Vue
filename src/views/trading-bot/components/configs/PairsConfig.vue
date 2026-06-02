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
      :message="$t('trading-bot.pairs.aboutTitle')"
      :description="$t('trading-bot.pairs.aboutDesc')"
    />

    <a-divider>{{ $t('trading-bot.pairs.pairTitle') }}</a-divider>
    <a-form-model-item :label="$t('trading-bot.pairs.symbolB')" prop="symbolB">
      <a-input v-model="form.symbolB" style="width: 100%" @change="emit" />
      <div class="hint">{{ $t('trading-bot.pairs.symbolBHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.pairs.orderSize')" prop="orderSize">
      <a-input-number v-model="form.orderSize" :min="0.01" :step="0.01" style="width: 100%" @change="emit" />
      <div class="hint">{{ $t('trading-bot.pairs.orderSizeHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.pairs.maxInventory')" prop="maxInventory">
      <a-input-number v-model="form.maxInventory" :min="0.01" :step="0.1" style="width: 100%" @change="emit" />
    </a-form-model-item>

    <a-divider>{{ $t('trading-bot.pairs.spreadTitle') }}</a-divider>
    <a-form-model-item :label="$t('trading-bot.pairs.spreadWindow')" prop="spreadWindow">
      <a-input-number v-model="form.spreadWindow" :min="10" :max="2000" :step="10" style="width: 100%" @change="emit" />
      <div class="hint">{{ $t('trading-bot.pairs.spreadWindowHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.pairs.entryZ')" prop="entryZ">
      <a-input-number v-model="form.entryZ" :min="0.5" :max="10" :step="0.1" style="width: 100%" @change="emit" />
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.pairs.exitZ')" prop="exitZ">
      <a-input-number v-model="form.exitZ" :min="0" :max="5" :step="0.1" style="width: 100%" @change="emit" />
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.pairs.stopZ')" prop="stopZ">
      <a-input-number v-model="form.stopZ" :min="1" :max="20" :step="0.1" style="width: 100%" @change="emit" />
      <div class="hint">{{ $t('trading-bot.pairs.stopZHint') }}</div>
    </a-form-model-item>

    <a-divider>{{ $t('trading-bot.pairs.kalmanTitle') }}</a-divider>
    <a-form-model-item :label="$t('trading-bot.pairs.kalmanInitBeta')" prop="kalmanInitBeta">
      <a-input-number v-model="form.kalmanInitBeta" :step="0.01" style="width: 100%" @change="emit" />
      <div class="hint">{{ $t('trading-bot.pairs.kalmanInitBetaHint') }}</div>
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.pairs.kalmanProcessVar')" prop="kalmanProcessVar">
      <a-input-number v-model="form.kalmanProcessVar" :step="0.00001" style="width: 100%" @change="emit" />
      <div class="hint">{{ $t('trading-bot.pairs.kalmanProcessVarHint') }}</div>
    </a-form-model-item>

    <a-divider>{{ $t('trading-bot.pairs.riskTitle') }}</a-divider>
    <a-form-model-item :label="$t('trading-bot.pairs.ouWindow')" prop="ouWindow">
      <a-input-number v-model="form.ouWindow" :min="20" :max="500" :step="10" style="width: 100%" @change="emit" />
    </a-form-model-item>
    <a-form-model-item :label="$t('trading-bot.pairs.maxHoldBarsCap')" prop="maxHoldBarsCap">
      <a-input-number v-model="form.maxHoldBarsCap" :min="10" :max="5000" :step="10" style="width: 100%" @change="emit" />
      <div class="hint">{{ $t('trading-bot.pairs.maxHoldBarsCapHint') }}</div>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  name: 'PairsConfig',
  props: {
    value: { type: Object, default: () => ({}) },
    initialCapital: { type: Number, default: null },
    marketType: { type: String, default: 'spot' }
  },
  data () {
    const v = this.value || {}
    return {
      form: {
        symbolB: v.symbolB != null ? v.symbolB : 'XAGUSD',
        orderSize: v.orderSize != null ? v.orderSize : 0.01,
        maxInventory: v.maxInventory != null ? v.maxInventory : 5.0,
        spreadWindow: v.spreadWindow != null ? v.spreadWindow : 120,
        entryZ: v.entryZ != null ? v.entryZ : 2.0,
        exitZ: v.exitZ != null ? v.exitZ : 0.5,
        stopZ: v.stopZ != null ? v.stopZ : 4.0,
        kalmanInitBeta: v.kalmanInitBeta != null ? v.kalmanInitBeta : 1.0,
        kalmanProcessVar: v.kalmanProcessVar != null ? v.kalmanProcessVar : 0.00001,
        ouWindow: v.ouWindow != null ? v.ouWindow : 60,
        maxHoldBarsCap: v.maxHoldBarsCap != null ? v.maxHoldBarsCap : 240
      },
      rules: {
        symbolB: [{ required: true, message: this.$t('trading-bot.pairs.symbolBReq'), trigger: 'change' }],
        orderSize: [{ required: true, type: 'number', message: this.$t('trading-bot.pairs.orderSizeReq'), trigger: 'change' }],
        entryZ: [{ required: true, type: 'number', message: this.$t('trading-bot.pairs.entryZReq'), trigger: 'change' }],
        stopZ: [{ required: true, type: 'number', message: this.$t('trading-bot.pairs.stopZReq'), trigger: 'change' }]
      }
    }
  },
  methods: {
    emit () {
      this.$emit('input', { ...this.form })
    },
    validate () {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(ok => ok ? resolve() : reject(new Error(this.$t('trading-bot.pairs.validateFailed'))))
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
</style>
