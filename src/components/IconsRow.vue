<template>
  <IconItem
    v-for="icon in icons"
    :key="icon.id"
    :name="icon.name"
    :class-name="icon.family === 'default' ? `mdi mdi-${icon.name}` : `mdil mdil-${icon.name}`"
    :is-active="activeIcon && activeIcon.id === icon.id"
    @click.stop="onClick(icon)"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {Icon} from '@/types';
import IconItem from './IconItem.vue';

export default defineComponent({
  name: 'icon',
  components: {
    IconItem,
  },
  props: {
    icons: {
      type: Array as () => Icon[],
      required: true,
    },
    activeIcon: {
      type: Object as () => Icon|null,
    },
  },
  emits: ['active'],
  methods: {
    onClick(iconProxy: Icon) {
      this.$emit('active', iconProxy);
    }
  }
});
</script>
