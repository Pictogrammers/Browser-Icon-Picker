<template>
  <div class="toast" :class="{visible: visible}">
    <div class="text">{{ text }}</div>
    <i class="mdi mdi-close" @click="reset"></i>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'toast-item',
  data: () => ({
    text: null as string|null,
    visible: false as boolean,
    timeoutHandler: null as number|null,
  }),
  methods: {
    addToast(text: string, duration = 3) {
      if (this.timeoutHandler !== null) {
        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = null;
      }

      this.text = text;
      this.visible = true;
      this.timeoutHandler = setTimeout(() => this.reset(), duration*1000);
    },
    reset() {
      if (this.timeoutHandler !== null) {
        clearTimeout(this.timeoutHandler);
      }
      this.visible = false;

      // Wait for animation end
      this.timeoutHandler = setTimeout(() => {
        this.text = null;
        this.timeoutHandler = null;
      }, 300);
    }
  }
});
</script>
