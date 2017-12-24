/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

(function($, window) {
    const cols = 6;

    var MaterialDesignIconsPicker = function(options) {
        this.options = options;
    };

    MaterialDesignIconsPicker.prototype = {
        ui: {},
        defaults: {},

        init: function() {
            this.settings = $.extend({}, this.defaults, this.options);

            this.ui = {
                body: $('body'),
                header: {
                    filter: $('#filter'),
                    filterClear: $('#filter-clear'),
                    version: $('#version')
                },
                content: $('.content'),
                icons: {
                    list: $('#icons-list'),
                    loading: $('#loading'),
                    icons: null
                },
                properties: {
                    wrap: $('.icon-properties-wrap'),
                    elem: $('#icon-properties'),
                    icon: $('#icon-icon'),
                    name: $('#icon-name'),
                    className: $('#icon-class').find('span'),
                    version: $('#icon-version'),
                    versionWrap: $('#icon-version-wrap'),
                    author: $('#icon-author'),
                    authorWrap: $('#icon-author-wrap'),
                    codepoint: $('#icon-codepoint')
                },
                footer: {
                    openInMaterialdesignIcons: $('#action-open-in-materialdesignicons'),
                    random: $('#action-random'),
                    randomColors: $('#action-random-colors'),
                    copySvg: $('#action-copy-svg'),
                    author: $('#action-author'),
                    github: $('#action-github')
                },
                colors: [
                    'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green',
                    'light-green', 'lime', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey'
                ],
                copyInput: $('#input-copy')
            };

            this.prepareUI();
            this.fetchIcons();
        },

        prepareUI: function() {
            var self = this;

            // Filter keyup event
            var filterReplaceRegex = new RegExp('-', 'g');
            this.ui.header.filter.on('keyup', function() {
                var value = $(this).val().replace(filterReplaceRegex, ' ');

                if ($.trim(value).length == 0) {
                    self.ui.icons.icons.show();
                    self.ui.header.filterClear.addClass('hidden');
                    return;
                }
                self.ui.header.filterClear.removeClass('hidden');

                window.MaterialDesignIcons.icons.forEach(function(icon) {
                    icon.domElem.toggle(
                        icon.searchable.indexOf(value) != -1
                    );
                });
            });
            this.ui.header.filterClear.click(function() {
                self.ui.header.filter
                    .val('')
                    .trigger('keyup');

                self.ui.header.filter.focus();
            });

            // Bind arrow keys
            $(document).keydown(function(e) {
                if (self.ui.header.filter.is(':focus')  // Filter has focus
                    || self.ui.icons.icons == null      // Icons not loaded yet
                    || e.which < 37 || e.which > 40)    // Not an arrow key
                    return;

                var iconWrap = self.ui.icons.icons.filter('.active'),
                    visibleIcons = self.ui.icons.icons.filter(':visible'),
                    rows = Math.ceil(visibleIcons.length/cols),
                    index = visibleIcons.index(iconWrap);

                // Nothing's selected
                if (index == -1)
                    return;

                var row = Math.floor(index/cols)+1,
                    col = (index % cols)+1;

                //var _row = row, _col = col;

                switch(e.which) {
                    case 37: // left
                        col--;
                        break;
                    case 38: // up
                        row--;
                        break;
                    case 39: // right
                        col++;
                        break;
                    case 40: // down
                        row++;
                        break;
                    default: return;
                }

                if (col == 0 && row != 1) {
                    col = cols;
                    row--;
                } else if (col == cols+1 && row != rows) {
                    col = 1;
                    row++;
                }

                if (row == 0 || row > rows
                    || col == 0 || col > cols)
                    return;

                //console.log('[' + _row + ', ' + _col + '] => [' + row + ', ' + col + ']');

                var newIndex = (row-1) * cols + col - 1,
                    newIcon = $(visibleIcons[newIndex]);

                if (!newIcon.length)
                    return;

                self.setActiveIcon(newIcon, true);

                e.preventDefault();
            });

            // Footer tooltips
            this.ui.footer.openInMaterialdesignIcons.tooltip({
                text: function() {
                    var activeIcon = self.ui.icons.icons.filter('.active');

                    if (!activeIcon.length)
                        return 'Open MaterialDesignIcons.com';
                    else
                        return 'Open ' + activeIcon.data('icon').name + ' in MaterialDesignIcons.com';
                }
            });
            this.ui.footer.random.tooltip({text: 'Random icon'});
            this.ui.footer.randomColors.tooltip({text: 'Random colors'});
            this.ui.footer.copySvg.tooltip({text: 'Copy SVG'});
            this.ui.footer.author.tooltip({text: 'Made with <3 by Quentin S.'});
            this.ui.footer.github.tooltip({text: 'GitHub'});

            // Footer actions
            this.ui.footer.random.click(function() {
                self.setActiveIcon(self.getRandomIcon(), true);
            });

            this.ui.footer.randomColors.click(function() {
                var randomColors = !$(this).is('.active');
                self.setRandomIconsColors(randomColors);
                localStorage.setItem('random-colors', randomColors);
            });

            this.ui.footer.copySvg.click(function() {
                const activeIcon = self.ui.icons.icons.filter('.active');
                const name = activeIcon.data('icon').name;

                // Then, read svg file
                const url = typeof(chrome) !== 'undefined' && chrome.extension !== undefined
                    ? chrome.extension.getURL('shared/data/icons-svg.min.json')
                    : '../data/icons-svg.min.json'; // <- when debugging extension directly from index.html

                $.ajax({
                    dataType: 'json',
                    url: url,
                    success: function(data) {
                        // Finally, copy!
                        const svg = data[name];

                        self.ui.copyInput.val(svg);
                        self.ui.copyInput.select();

                        document.oncopy = function(event) {
                            event.clipboardData.setData('text/plain', svg);
                            event.preventDefault();
                        };
                        document.execCommand("Copy", false, null);
                    }
                });
            });

            // Change accent color on properties icon click
            this.ui.properties.icon.click(function() {
                var i = self.ui.colors.indexOf(self.ui.body.attr('data-accent'))+1;
                var accentColor = self.ui.colors[i > self.ui.colors.length-1 ? 0 : i];
                self.ui.body.attr('data-accent', accentColor);

                localStorage.setItem('color-accent', accentColor);
            });
            var accentColor = localStorage.getItem('color-accent');
            accentColor = accentColor || 'orange';
            this.ui.body.attr('data-accent', accentColor);

            // Restore "random colors" state
            this.setRandomIconsColors((localStorage.getItem('random-colors') || 'false') == 'true');

            this.iconsListInitialHeight = this.ui.icons.list.height();
        },

        setRandomIconsColors: function(state) {
            this.ui.body.toggleClass('random-icon-colors', state);
            this.ui.footer.randomColors.toggleClass('active', state);
        },

        fetchIcons: function() {
            var self = this,
                url = typeof(chrome) !== 'undefined' && chrome.extension !== undefined
                    ? chrome.extension.getURL('shared/data/icons.min.json')
                    : '../data/icons.min.json'; // <- when debugging extension directly from index.html

            $.ajax({
                dataType: 'json',
                url: url,
                success: function(data) {
                    window.MaterialDesignIcons = data;
                    self.ui.icons.loading.remove();

                    self.inflateUI();
                }
            });
        },

        inflateUI: function() {
            var self = this;

            // Inflate icons list
            var iModel = document.createElement('i');
            iModel.classList.add('mdi');

            var index = 0,
                icon;

            for (var y=0, l=window.MaterialDesignIcons.icons.length; y<l; y++) {
                icon = window.MaterialDesignIcons.icons[y];

                var i = iModel.cloneNode(false);
                i.classList.add('mdi-' + icon.name);

                icon.domElem = $(i)
                    .data('icon', icon)
                    .appendTo(self.ui.icons.list);

                index++;
            }
            self.ui.icons.icons = self.ui.icons.list.children();
            this.ui.icons.list.click(function() {
                self.setActiveIcon(null);
            });
            self.ui.icons.list.on('click', '.mdi', function(e) {
                self.setActiveIcon($(this));
                e.stopPropagation();
            });

            // Add tooltips
            self.ui.icons.icons.tooltip({
                text: function(icon) {
                    return icon.data('icon').name;
                }
            });

            this.ui.header.version.text('v' + window.MaterialDesignIcons.version);

            this.ui.header.filter.focus();
        },

        getRandomIcon: function() {
            return $(this.ui.icons.icons.get(
                randomInt(0, this.ui.icons.icons.length-1)
            ));
        },

        setActiveIcon: function(iconElem, ensureVisible) {
            ensureVisible = ensureVisible || false;

            this.ui.icons.icons.filter('.active').removeClass('active');
            this.ui.footer.copySvg.toggle(iconElem !== null);

            // We unselected current icon, let's finish here
            if (iconElem != null) {
                var iconMeta = iconElem.data('icon'),
                    className = iconMeta.name;
                iconElem.addClass('active');

                this.ui.properties.name.text(className);
                this.ui.properties.className.text('mdi-' + className);
                this.ui.properties.icon[0].classList = 'mdi-set mdi-' + className;
                this.ui.properties.version.text(iconMeta.version);
                this.ui.properties.versionWrap.toggle(iconMeta.version !== null);
                this.ui.properties.author.text(iconMeta.author);
                this.ui.properties.authorWrap.toggle(iconMeta.version !== null);
                this.ui.properties.codepoint.text(iconMeta.codepoint);
                this.ui.footer.openInMaterialdesignIcons.attr('href',
                    'https://materialdesignicons.com/icon/' + className);

                if (ensureVisible) {
                    var offset = iconElem.offset().top - iconElem.parent().offset().top;
                    var iconElemHeight = iconElem.outerHeight(true);

                    var scrollTop = iconElem.parent().scrollTop(),
                        initialScrollTop = scrollTop;
                    if (offset - 5 < 0)
                        scrollTop += offset - 5;
                    else if (offset + iconElemHeight > iconElem.parent().height())
                        scrollTop += offset + iconElemHeight - iconElem.parent().height();

                    if (scrollTop != initialScrollTop)
                        iconElem.parent().scrollTop(scrollTop);
                }
            }

            // Update properties height
            var autoHeight = iconElem != null
                ? this.ui.properties.elem[0].scrollHeight
                : 0;
            this.ui.properties.wrap.css('height', autoHeight);
            this.ui.icons.list.css('height', this.iconsListInitialHeight-autoHeight);
        }
    };

    window.MaterialDesignIconsPicker = MaterialDesignIconsPicker;

    $(document).ready(function() {
        window.picker = new MaterialDesignIconsPicker();
        window.picker.init();
    });

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

})($, window);
