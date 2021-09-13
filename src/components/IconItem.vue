<template>
  <i
    class="mdi"
    :class="{
      [className]: true,
      active: isActive
    }"
    :title="name"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'icon',
  props: {
    name: {
      type: String,
    },
    className: {
      type: String,
    },
    isActive: {
      type: Boolean,
    }
  }
});
</script>
