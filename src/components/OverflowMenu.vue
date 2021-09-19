<template>
  <div class="overflow-menu-container">
    <slot name="button" :set-open="setOpen">
      <button
        @click="setOpen()"
        v-html="mdiDotsVertical" />
    </slot>

    <transition name="overflow-menu">
      <div
        v-show="open"
        class="overflow-menu"
        :class="'pos-y-'+y+' pos-x-'+x"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'overflow-menu',
  props: {
    onOpen: {
      type: Function,
      required: true,
    },
    onClose: {
      type: Function,
      required: true,
    },
    x: {
      type: String,
      required: true,
      validator: (value: string) => ['center', 'right'].indexOf(value) !== -1,
    },
    y: {
      type: String,
      required: true,
      validator: (value: string) => ['top', 'bottom'].indexOf(value) !== -1,
    },
  },
  data: () => ({
    open: false,
  }),
  methods: {
    close() {
      this.open = false;
    },
    setOpen() {
      this.open = true;
    },
  },
  watch: {
    open(value) {
      if (value === false) {
        this.onClose();
      } else {
        this.onOpen();
      }
    }
  },
  computed: {
    mdiDotsVertical: () => require('!!svg-inline-loader!@mdi/svg/svg/dots-vertical.svg'),
  },
});
</script>
