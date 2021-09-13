<template>
  <div
    class="app"
    :class="{
      ['accent-color--'+accentColor]: true,
      'dark-theme': darkTheme,
      'random-icon-colors': randomColors
    }"
  >
    <header class="header">
      <div class="title">
        <h1>
          <a href="https://materialdesignicons.com" target="_blank">
            <i class="mdi mdi-vector-square"></i> MaterialDesignIcons
          </a>
        </h1>
        <overflow-menu
          ref="overflow-main"
          :on-open="() => this.openOverflowMenu = this.$refs['overflow-main']"
          :on-close="() => this.openOverflowMenu = null"
          attach-to="top"
        >
          <div @click="setActiveIcon(getRandomIcon(), true)">
            <i class="mdi mdi-shuffle"></i>
            Random icon
          </div>
          <div @click="filters.flavour = filters.flavour === 'light' ? 'default' : 'light'">
            <i class="mdil mdil-account"></i>
            Standard / light

            <setting-switch :value="filters.flavour === 'light'" />
          </div>
          <div @click="filters.outline = filters.outline === 'outline' ? 'both' : 'outline'">
            <i class="mdi mdi-account-multiple-outline"></i>
            Outline only

            <setting-switch :value="filters.outline === 'outline'" boolean />
          </div>
          <div @click="randomColors = !randomColors">
            <i class="mdi mdi-palette"></i>
            Random colors

            <setting-switch :value="randomColors" boolean />
          </div>
          <div @click="darkTheme = !darkTheme">
            <i class="mdi mdi-theme-light-dark"></i>
            Dark theme

            <setting-switch :value="darkTheme" boolean />
          </div>
          <div @click="usage = usage === 'js' ? 'webfont' : 'js'">
            <i class="mdi mdi-format-font"></i>
            JS / webfont

            <setting-switch :value="usage === 'webfont'" />
          </div>
          <div class="overflow-footer">
            MDI v{{ version && version.default }} / MDI light v{{ version && version.light }}<br />
            <a href="https://github.com/chteuchteu/MaterialDesignIcons-Picker">Open on GitHub</a>
          </div>
        </overflow-menu>
      </div>
      <div class="search-wrap">
        <input
          class="search" type="text"
          placeholder="Search…" autofocus
          v-model="search"
        />
        <i
          class="search-clear mdi mdi-close"
          :class="{
            hidden: search.length === 0
          }"
          @click="search = ''"
        ></i>
      </div>
    </header>

    <div class="content">
      <div
        class="icons"
        ref="icons"
        @click="setActiveIcon(null)"
      >
        <i
          v-for="icon in filteredIcons"
          :key="icon.id"
          class="mdi"
          :class="{
            [icon.class]: true,
            active: isIconActive && activeIcon === icon
          }"
          @click.stop="setActiveIcon(icon)"
          :title="icon.name"
        />

        <div class="properties-spacer"></div>
      </div>

      <transition name="properties">
        <div
          class="icon-properties"
          v-show="isIconActive"
          :style="'width: calc(100% - '+browserScrollbarWidth+'px)'"
        >
          <i
            class="icon-icon"
            :class="activeIcon && activeIcon.class"
            @click="changeAccentColor"
          ></i>

          <div class="properties">
            <overflow-menu
              ref="overflow-properties"
              :on-open="() => onPropertiesOverflowMenuOpened() || (this.openOverflowMenu = this.$refs['overflow-properties'])"
              :on-close="() => this.openOverflowMenu = null"
              attach-to="bottom"
            >
              <a
                v-show="isIconActive && !activeIcon.styles.includes('light')"
                :href="isIconActive && 'https://materialdesignicons.com/icon/{icon}'.replace('{icon}', activeIcon.name)"
                target="_blank"
              >
                <i class="mdi mdi-open-in-new"></i>
                {{ isIconActive && 'Open {icon}'.replace('{icon}', activeIcon.name) }}
              </a>
              <div @click="copySvg(false)">
                <i class="mdi mdi-xml"></i>
                Copy SVG
              </div>
              <div @click="copySvg(true)">
                <i class="mdi mdi-xml"></i>
                Copy SVG path
              </div>
              <div @click="copyName">
                <i class="mdi mdi-content-copy"></i>
                Copy name
              </div>
              <div @click="downloadSvg">
                <i class="mdi mdi-download"></i>
                Download SVG
              </div>
            </overflow-menu>

            <div class="icon-name">{{ activeIcon && activeIcon.name }}</div>
            <div class="icon-usage" v-if="usage === 'webfont'" @click="selectText($event)">{{ activeIcon && activeIcon.class }}</div>
            <div class="icon-usage" v-else @click="selectText($event)">
              <span style="color: #c084ba">import </span>
              <span style="color: #ffffff">{</span>
              <span style="color: #9ddcfc">mdi{{ activeIcon && activeIcon.name.split('-').map((name) => name.charAt(0).toUpperCase() + name.slice(1)).join('') }} </span>
              <span style="color: #ffffff">} </span>
              <span style="color: #c084ba">from </span>
              <span style="color: #cd917b">'@mdi/js'</span><span style="color: #ffffff">;</span>
            </div>
            <div class="icon-more">
              <span class="icon-codepoint">{{ activeIcon && activeIcon.codepoint }}</span>
              <span
                v-show="activeIcon && activeIcon.version"
              > &bullet; v<span class="icon-version">{{ activeIcon && activeIcon.version }}</span></span>
              <span
                v-show="activeIcon && activeIcon.author"
              > &bullet; by <span class="icon-author">{{ activeIcon && activeIcon.author }}</span></span>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <input ref="input-copy" style="display: none" />
    <div
      v-show="openOverflowMenu !== null"
      class="overflow-menu-overlay"
      @click="openOverflowMenu.close()"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import OverflowMenu from './components/OverflowMenu.vue';
import SettingSwitch from './components/SettingSwitch.vue';
import {request} from '@/helpers/request';
import {outerHeight, computeOffset} from '@/helpers/dom';
import {Icon} from '@/types';
import {randomInt} from '@/helpers/math';
import {getBrowserInstance} from '@/helpers/extension';
import * as icons from '../public/data/icons.json';

const SETTINGS = {
  ACCENT_COLOR: 'color-accent',
  RANDOM_COLORS: 'random-colors',
  FLAVOUR: 'flavour',
  OUTLINE: 'outline',
  DARK: 'dark',
  USAGE: 'usage',
};

const COLORS = [
  'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green',
  'light-green', 'lime', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey'
];

const searchReplaceRegex = new RegExp('-', 'g');

const getResourceUrl = (filename: string) => typeof(chrome) !== 'undefined' && getBrowserInstance().extension !== undefined
  ? getBrowserInstance().extension.getURL('dist/data/' + filename)
  : '../data/' + filename; // <- when debugging extension directly from index.html

const isDarkTheme = () => {
  if (localStorage.getItem(SETTINGS.DARK) !== null) {
    // Has a forced value in local storage
    return JSON.parse(localStorage.getItem(SETTINGS.DARK) || 'false') === true;
  }

  // No value, auto-detect
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export default defineComponent({
  name: 'icons-picker',
  components: {OverflowMenu, SettingSwitch},
  data: () => ({
    darkTheme: isDarkTheme(),
    search: '',
    filters: {
      flavour: (localStorage.getItem(SETTINGS.FLAVOUR) || 'default') as 'default'|'light', // "default" vs "light"
      outline: (localStorage.getItem(SETTINGS.OUTLINE) || 'both') as 'both'|'outline', // "both" vs "outline"
    },
    icons: icons.icons as {default: Icon[], light: Icon[]},
    version: icons.version as {default: string, light: string}|Record<string, never>,
    openOverflowMenu: null as (typeof OverflowMenu)|null,

    accentColor: localStorage.getItem(SETTINGS.ACCENT_COLOR) || 'primary',
    randomColors: JSON.parse(localStorage.getItem(SETTINGS.RANDOM_COLORS) || 'false') === true,
    usage: localStorage.getItem(SETTINGS.USAGE) || 'js',
    activeIcon: null as Icon|null,
    isIconActive: false,

    cachedSvgs: {} as {[key: string]: string},

    browserScrollbarWidth: 0,
  }),
  computed: {
    filteredIcons(): Icon[] {
      const searchVal = this.search
        .replace(searchReplaceRegex, ' ')
        .toLowerCase();

      return this.icons[this.filters.flavour].filter(
        (icon: Icon) =>
          icon.searchable.indexOf(searchVal) !== -1
          && (this.filters.outline === 'both' || icon.styles.includes(this.filters.outline))
      );
    },
  },
  mounted() {
    // Inspect browser's scrollbar width.
    // It's used to adjust .icon-properties width
    const iconsElement = this.$refs.icons as HTMLElement;
    this.browserScrollbarWidth = iconsElement.offsetWidth - iconsElement.clientWidth;

    document.dispatchEvent(new Event('prerender-ready'));
  },
  methods: {
    setActiveIcon(icon: Icon|null, ensureVisible=false): void {
      const hasActiveIcon = this.isIconActive;
      this.isIconActive = icon !== null;

      if (icon !== null) {
        this.activeIcon = icon;

        if (ensureVisible) {
          // Wait for the UI to be updated for calculations
          const iconElem = (document.querySelector('.mdi-'+icon.name) || document.querySelector('.mdil-'+icon.name)) as HTMLElement,
            iconsList = this.$refs['icons'] as HTMLElement;

          const offset = computeOffset(iconElem).top - computeOffset(iconsList).top,
            iconElemHeight = outerHeight(iconElem, true);

          // Take properties panel height into account when it appears
          // (it's not shown yet)
          let iconsListHeight = iconsList.clientHeight;
          if (!hasActiveIcon) {
            iconsListHeight -= 80;
          }

          let scrollTop = iconsList.scrollTop;
          if (offset - 5 < 0) {
            scrollTop += offset -5;
          }
          else if (offset + iconElemHeight > iconsListHeight) {
            scrollTop += offset + iconElemHeight - iconsListHeight;
          }

          iconsList.scrollTop = scrollTop;
        }
      }
    },
    getRandomIcon(): Icon {
      return this.icons[this.filters.flavour][randomInt(0, this.icons[this.filters.flavour].length-1)];
    },
    changeAccentColor(): void {
      const i = COLORS.indexOf(this.accentColor)+1;
      this.accentColor = COLORS[i > COLORS.length-1 ? 0 : i];
    },
    copySvg(onlyPath: boolean): void {
      if (this.activeIcon === null) {
        return;
      }

      let id = this.activeIcon.id;

      // SVG should have been loaded when overflow menu opened
      if (Object.keys(this.cachedSvgs).indexOf(id) === -1) {
        return;
      }

      let svg = this.cachedSvgs[id];

      if (onlyPath) {
        // Take the "d" attribute from <path>
        const result = /d="([^"]+)"/.exec(svg);
        svg = result && result[1] || '';
      }

      this.copy(svg);

      // Close overflow menu once done
      this.openOverflowMenu && this.openOverflowMenu.close();
    },
    copyName(): void {
      if (this.activeIcon === null) {
        return;
      }

      this.copy(this.activeIcon.name);

      // Close overflow menu once done
      this.openOverflowMenu && this.openOverflowMenu.close();
    },
    copy(string: string): void {
      const input = this.$refs['input-copy'] as HTMLInputElement;

      input.value = string;
      input.select();

      document.oncopy = event => {
        if (event.clipboardData) {
          event.clipboardData.setData('text/plain', string);
        }
        event.preventDefault();
      };
      document.execCommand("Copy", false, undefined);
    },
    downloadSvg(): void {
      if (this.activeIcon === null) {
        return;
      }

      let id = this.activeIcon.id;

      if (Object.keys(this.cachedSvgs).indexOf(id) === -1) {
        return;
      }

      // Add namespace to <svg tag
      const svg = this.cachedSvgs[id].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');

      const blob = new Blob([svg], {type: "image/svg+xml"});
      const url = URL.createObjectURL(blob);

      getBrowserInstance().downloads.download({
        url: url,
        filename: this.activeIcon.name+'.svg',
      });
    },
    onPropertiesOverflowMenuOpened(): void {
      if (!this.activeIcon) {
        return;
      }

      // Pre-fetch SVG
      let id = this.activeIcon.id;

      if (Object.keys(this.cachedSvgs).indexOf(id) !== -1) {
        return;
      }

      request(getResourceUrl(`svg/${id}.svg`))
        .then((response) => {
          this.cachedSvgs[id] = response;
        });
    },
    selectText(e: Event): void {
      // Find .icon-usage
      const usage = (e.target as Element).closest('.icon-usage') as Element;
      const selection = window.getSelection();
      if (selection !== null) {
        const range = document.createRange();
        range.selectNodeContents(usage);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
  },
  watch: {
    accentColor() {
      localStorage.setItem(SETTINGS.ACCENT_COLOR, this.accentColor);
    },
    randomColors() {
      localStorage.setItem(SETTINGS.RANDOM_COLORS, this.randomColors.toString());
    },
    darkTheme() {
      localStorage.setItem(SETTINGS.DARK, this.darkTheme.toString());
    },
    'filters.flavour'() {
      // When setting "flavour" to "light", force the "outline" one to "outline"
      if (this.filters.flavour === 'light') {
        this.filters.outline = 'outline';
      }

      localStorage.setItem(SETTINGS.FLAVOUR, this.filters.flavour);
    },
    'filters.outline'() {
      localStorage.setItem(SETTINGS.OUTLINE, this.filters.outline);
    },
    usage() {
      localStorage.setItem(SETTINGS.USAGE, this.usage);
    },
  },
})

</script>
