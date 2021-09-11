<template>
  <div
    class="switch"
    :class="{active: value, boolean}"
  >
    <div class="handle"></div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'setting-switch',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    onChange: {
      type: Function,
      required: false,
    },
    boolean: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
});
</script>
