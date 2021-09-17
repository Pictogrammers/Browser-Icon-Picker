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
          x="right"
          y="top"
        >
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
          <div @click="devTools = !devTools">
            <i class="mdi mdi-application-brackets"></i>
            Developer tools

            <setting-switch :value="devTools" boolean />
          </div>
          <div @click="changeAccentColor">
            <i class="mdi mdi-palette-swatch"></i>
            Accent color

            <code>{{ accentColor }}</code>
          </div>
          <div @click="changeIconClickAction">
            <i class="mdi mdi-cursor-default-click"></i>
            Icon action

            <code class="icon-click-action">{{ actionLabels[iconClickAction] }}</code>
          </div>
          <div class="overflow-footer">
            MDI v{{ version.default }} / MDI Light v{{ version.light }}<br />
            <a href="https://github.com/chteuchteu/MaterialDesignIcons-Picker" target="_blank">Open on GitHub</a>
          </div>
        </overflow-menu>
      </div>
      <div class="search-wrap">
        <input
          class="search"
          type="text"
          placeholder="Search…"
          v-model="search"
          ref="search"
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
      <!--
      item-size is calculated as such:
      height + padding*2 + border-width*2 + margin*2
       ┌───────────┐
       │    5      │
       │ ┌──1────┐ │
       │ │  12   │ │
       │ │ 24x24 │ │
       │ │  12   │ │
       │ └──1────┘ │
       │    5      │
       └───────────┘

      -->
      <RecycleScroller
        class="icons"
        ref="icons"
        @click="setActiveIcon(null)"
        :items="filteredIcons"
        :item-size="60"
        v-slot="{ item }"
        :prerender="15"
      >
        <IconsRow
          :icons="item.items"
          :active-icon="isIconActive ? activeIcon : null"
          @active="setActiveIcon"
        />
      </RecycleScroller>

      <transition name="footer">
        <footer
          v-show="isIconActive"
          :style="'width: calc(100% - '+browserScrollbarWidth+'px)'"
        >
          <div class="icon-properties">
            <i
              class="icon-icon"
              :class="getIconClass(activeIcon)"
              @click="doAction(iconClickAction)"
              :title="actionLabels[iconClickAction]"
            ></i>

            <div class="icon-info">
              <div class="icon-name">{{ activeIcon && activeIcon.name }}</div>
              <div class="icon-usage" v-if="usage === 'webfont'" @click="selectText($event)">{{ getIconClass(activeIcon) }}</div>
              <div class="icon-usage" v-else @click="selectText($event)">
                <span style="color: #c084ba">import </span>
                <span style="color: #ffffff">{ </span>
                <span style="color: #9ddcfc">mdi{{ activeIcon && activeIcon.name.split('-').map((name) => name.charAt(0).toUpperCase() + name.slice(1)).join('') }} </span>
                <span style="color: #ffffff"> } </span>
                <span style="color: #c084ba">from </span>
                <span style="color: #cd917b">'{{ activeIcon && activeIcon.family === 'light' ? '@mdi/light-js' : '@mdi/js' }}'</span><span style="color: #ffffff">;</span>
              </div>
              <div class="icon-more">
                <span
                  v-show="activeIcon && activeIcon.version"
                >v<span class="icon-version">{{ activeIcon && activeIcon.version }}</span></span>
                <span v-show="activeIcon && activeIcon.version && activeIcon.author"> &bullet; </span>
                <span
                  v-show="activeIcon && activeIcon.author"
                >by <span class="icon-author">{{ activeIcon && activeIcon.author }}</span></span>
              </div>
            </div>
          </div>

          <div class="icon-actions">
            <a
              v-show="isIconActive && activeIcon.family === 'default'"
              :href="isIconActive && 'https://materialdesignicons.com/icon/{icon}'.replace('{icon}', activeIcon.name)"
              target="_blank"
            >
              <i class="mdi mdi-open-in-new"></i>
              View on MDI
            </a>

            <overflow-menu
              ref="overflow-properties"
              :on-open="() => this.openOverflowMenu = this.$refs['overflow-properties']"
              :on-close="() => this.openOverflowMenu = null"
              x="center"
              y="bottom"
            >
              <div @click="copy('name')">
                <i class="mdi mdi-form-textbox"></i>
                <div>
                  {{ actionLabels['name'] }}<br />
                  <small>{{ activeIcon && activeIcon.name }}</small>
                </div>
              </div>
              <div @click="copy('codepoint')">
                <i class="mdi mdi-hexadecimal"></i>
                <div>
                  {{ actionLabels['codepoint'] }}<br />
                  <small>{{ activeIcon && activeIcon.codepoint }}</small>
                </div>
              </div>
              <div @click="copy('desktop-font-icon')">
                <i class="mdi mdi-select-place"></i>
                <div>
                  {{ actionLabels['desktop-font-icon'] }}<br />
                  <small><i :class="getIconClass(activeIcon)" class="desktop-font-icon-preview"></i></small>
                </div>
              </div>
              <div @click="copy('svg')">
                <i class="mdi mdi-svg"></i>
                <div>
                  {{ actionLabels['svg'] }}<br />
                  <small>{{ activeIcon && activeIconSvg }}</small>
                </div>
              </div>
              <div @click="copy('svg-path')">
                <i class="mdi mdi-xml"></i>
                <div>
                  {{ actionLabels['svg-path'] }}<br />
                  <small>{{ activeIcon && activeIconSvgPath }}</small>
                </div>
              </div>
              <div v-if="devTools" v-show="!activeIcon || activeIcon.family === 'default'" @click="copy('markdown-preview')">
                <i class="mdi mdi-language-markdown-outline"></i>
                <div>
                  {{ actionLabels['markdown-preview'] }}<br />
                  <small>{{ activeIcon && activeIconPreviewImage }}</small>
                </div>
              </div>
              <template v-slot:button="slotProps">
                <button type="button" @click="slotProps.setOpen()">
                  <i class="mdi mdi-content-copy"></i>
                  Copy&hellip;
                </button>
              </template>
            </overflow-menu>

            <button @click="downloadSvg" type="button" :disabled="!activeIconSvg">
              <i class="mdi mdi-download"></i>
              {{ actionLabels['download-svg'] }}
            </button>
          </div>
        </footer>
      </transition>
    </div>
    <input ref="input-copy" style="display: none" />
    <div
      v-show="openOverflowMenu !== null"
      class="overflow-menu-overlay"
      @click="openOverflowMenu.close()"
    ></div>
    <toast ref="toaster" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import OverflowMenu from './components/OverflowMenu.vue';
import SettingSwitch from './components/SettingSwitch.vue';
import IconsRow from './components/IconsRow.vue';
import {request} from '@/helpers/request';
import {getScrollbarWidth} from '@/helpers/dom';
import {Icon} from '@/types';
import {Action, Copy} from '@/enums';
import {getBrowserInstance} from '@/helpers/extension';
import * as icons from '../public/data/icons.min.json';
import {objectChunk} from '@/helpers/array';
import {getWeight} from '@/helpers/search';
import Toast from '@/components/Toast.vue';

const SETTINGS = {
  ACCENT_COLOR: 'color-accent',
  RANDOM_COLORS: 'random-colors',
  FLAVOUR: 'flavour',
  OUTLINE: 'outline',
  DARK: 'dark',
  USAGE: 'usage',
  DEV_TOOLS: 'dev-tools',
  ICON_CLICK_ACTION: 'icon-click-action',
};

const COLORS = [
  'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green',
  'light-green', 'lime', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey'
];

const ACTIONS_LABELS = {
  'name': 'Copy name',
  'codepoint': 'Copy codepoint',
  'desktop-font-icon': 'Copy desktop font icon',
  'svg': 'Copy SVG',
  'svg-path': 'Copy SVG path',
  'markdown-preview': 'Copy markdown preview',
  'download-svg': 'Download SVG',
} as Record<Action, string>;

const searchReplaceRegex = new RegExp('-', 'g');

const getResourceUrl = (filename: string) => {
  const browserApi = getBrowserInstance();
  return browserApi && browserApi.extension !== undefined
    ? browserApi.extension.getURL('dist/data/' + filename)
    : '../data/' + filename; // <- when debugging extension directly from index.html
}

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
  components: {Toast, OverflowMenu, SettingSwitch, IconsRow},
  data: () => ({
    darkTheme: isDarkTheme(),
    search: '',
    filters: {
      flavour: (localStorage.getItem(SETTINGS.FLAVOUR) || 'default') as 'default'|'light', // "default" vs "light"
      outline: (localStorage.getItem(SETTINGS.OUTLINE) || 'both') as 'both'|'outline', // "both" vs "outline"
    },
    icons: Object.freeze(icons.icons) as {default: Icon[], light: Icon[]},
    version: Object.freeze(icons.version) as {default: string, light: string}|Record<string, never>,
    openOverflowMenu: null as (typeof OverflowMenu)|null,

    accentColor: localStorage.getItem(SETTINGS.ACCENT_COLOR) || 'primary',
    randomColors: JSON.parse(localStorage.getItem(SETTINGS.RANDOM_COLORS) || 'false') === true,
    usage: localStorage.getItem(SETTINGS.USAGE) || 'js',
    devTools: JSON.parse(localStorage.getItem(SETTINGS.DEV_TOOLS) || 'false') === true,
    iconClickAction: (localStorage.getItem(SETTINGS.ICON_CLICK_ACTION) || 'name') as Action,

    activeIcon: null as Icon|null,
    activeIconSvg: null as string|null,
    activeIconSvgPath: null as string|null,
    activeIconPreviewImage: null as string|null,
    isIconActive: false,

    browserScrollbarWidth: 0,
  }),
  computed: {
    filteredIcons(): Array<{id: string, items: Icon[]}> {
      // Sanitize search val
      const searchVal = this.search
        .replace(searchReplaceRegex, ' ')
        .trim()
        .toLowerCase();

      let icons = this.icons[this.filters.flavour];

      // Exclude non-matching filters
      if (this.filters.outline !== 'both') {
        icons = icons.filter(icon => icon.family === 'light' || icon.name.includes('outline'));
      }

      if (searchVal.length > 0) {
        const searchValWords = searchVal.split(' ');

        // Build weighted result list
        const results = icons
          .map(icon => ({
            weight: getWeight(icon, searchVal, searchValWords),
            icon,
          }))
          // Filter-out non-matching results
          .filter(icon => icon.weight > 0) as Array<{ weight: number, icon: Icon }>;

        // Sort by weight & name
        results.sort((r1, r2) => {
          if (r1.weight < r2.weight) {
            return 1;
          }
          if (r1.weight > r2.weight) {
            return -1;
          }
          return r1.icon.name.localeCompare(r2.icon.name);
        });

        icons = results.map(r => r.icon);
      }

      // Chunk (by rows of 6)
      return objectChunk(icons, 6);
    },
    actionLabels: () => ACTIONS_LABELS,
  },
  mounted() {
    // Inspect browser's scrollbar width.
    // It's used to adjust .icon-properties width
    this.browserScrollbarWidth = getScrollbarWidth();

    document.dispatchEvent(new Event('prerender-ready'));

    // Give focus to search field
    const searchInput = this.$refs.search as HTMLInputElement;
    searchInput.focus();
  },
  methods: {
    getIconClass(icon: Icon|null): string|null {
      if (icon === null) {
        return null;
      }
      return icon.family === 'default' ? `mdi mdi-${icon.name}` : `mdil mdil-${icon.name}`;
    },
    setActiveIcon(icon: Icon|null): void {
      this.isIconActive = icon !== null;

      if (icon !== null) {
        this.activeIcon = icon;
        const {id, name} = icon;

        // Pre-fetch SVG
        this.activeIconSvg = null;
        this.activeIconSvgPath = null;
        this.activeIconPreviewImage = `[![${name}](https://materialdesignicons.com/icon/${name})](https://materialdesignicons.com/icon/${name})`;

        request(getResourceUrl(`svg/${id}.svg`))
          .then((svg) => {
            this.activeIconSvg = svg;

            // Take the "d" attribute from <path>
            const result = /d="([^"]+)"/.exec(svg);
            this.activeIconSvgPath = result && result[1] || '';
          });
      }
    },
    changeAccentColor(): void {
      const i = COLORS.indexOf(this.accentColor)+1;
      this.accentColor = COLORS[i > COLORS.length-1 ? 0 : i];
    },
    changeIconClickAction(): void {
      const actions = Object.keys(ACTIONS_LABELS);
      const i = actions.indexOf(this.iconClickAction)+1;
      this.iconClickAction = actions[i > actions.length-1 ? 0 : i] as Action;
    },
    doAction(action: Action): void {
      if (action === 'download-svg') {
        this.downloadSvg();
      } else {
        this.copy(action);
      }
    },
    copy(what: Copy): void {
      if (this.activeIcon === null || this.activeIcon.family === 'light' && what === 'markdown-preview') {
        return;
      }

      let text;
      switch (what) {
        case 'svg': text = this.activeIconSvg; break;
        case 'svg-path': text = this.activeIconSvgPath; break;
        case 'name': text = this.activeIcon.name; break;
        case 'markdown-preview': text = this.activeIconPreviewImage; break;
        case 'desktop-font-icon': text = String.fromCodePoint(parseInt(this.activeIcon.codepoint, 16)); break;
        case 'codepoint': text = this.activeIcon.codepoint; break;
        default:
          throw new Error();
      }
      this.copyAndClose(text);
    },
    copyAndClose(string: string|null): void {
      if (string === null) {
        return;
      }

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

      // Close overflow menu once done
      this.openOverflowMenu && this.openOverflowMenu.close();

      this.toast('Copied to clipboard');
    },
    downloadSvg(): void {
      if (this.activeIcon === null) {
        return;
      }

      let svg = this.activeIconSvg;
      if (svg === null) {
        return;
      }

      // Add namespace to <svg tag
      svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');

      const blob = new Blob([svg], {type: "image/svg+xml"});
      const url = URL.createObjectURL(blob);
      const filename = this.activeIcon.name+'.svg';

      const browserApi = getBrowserInstance();
      browserApi && browserApi.downloads.download({
        url,
        filename,
      });

      this.toast(`Downloaded ${filename}`);
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
    toast(text: string): void {
      const toaster = this.$refs.toaster as typeof Toast;
      toaster.addToast(text);
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
    devTools() {
      localStorage.setItem(SETTINGS.DEV_TOOLS, this.devTools.toString());
    },
    iconClickAction() {
      localStorage.setItem(SETTINGS.ICON_CLICK_ACTION, this.iconClickAction);
    }
  },
})

</script>
