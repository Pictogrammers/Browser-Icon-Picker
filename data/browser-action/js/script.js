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
        materialDesignIcons: [],

        init: function() {
            this.settings = $.extend({}, this.defaults, this.options);

            this.ui = {
                tooltip: null,
                filter: $('#filter'),
                icons: {
                    list: $('#icons-list'),
                    icons: null
                },
                properties: {
                    wrap: $('#icon-properties'),
                    icon: $('#icon-icon'),
                    name: $('#icon-name'),
                    className: $('#icon-class').find('span')
                },
                footer: {
                    openInMaterialdesignIcons: $('#action-open-in-materialdesignicons'),
                    refresh: $('#action-refresh')
                }
            };

            this.prepareUI();
            this.retrieveIconsList();
        },

        prepareUI: function() {
            var self = this;

            // Filter keyup event
            this.ui.filter.on('keyup', function() {
                var value = $(this).val();

                self.ui.icons.icons.each(function() {
                    $(this).toggle(
                        $(this).data('icon').indexOf(value) != -1
                    );
                });
            });

            // Prepare tooltip
            this.ui.tooltip = $('<div />')
                .addClass('tooltip')
                .hide()
                .appendTo($('body'));

            this.ui.footer.refresh.click(function(e) {
                e.preventDefault();

                // Clear localStorage
                localStorage.clear();
                location.reload();
            });

            // Bind arrow keys
            $(document).keydown(function(e) {
                if (self.ui.filter.is(':focus'))
                    return;

                var iconWrap = self.ui.icons.icons.filter('.active'),
                    rows = Math.floor(self.ui.icons.icons.length/cols),
                    index = iconWrap.index();

                // Nothing's selected
                if (index == -1)
                    return;

                var row = iconWrap.data('row'),
                    col = iconWrap.data('col');

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

                var newIndex = (row-1) * cols + col - 1;
                self.setActiveIcon($(self.ui.icons.icons[newIndex]), false, true);

                e.preventDefault();
            });
        },

        retrieveIconsList: function() {
            var self = this,
                cachedIcons = localStorage.icons;

            if (cachedIcons !== undefined) {
                this.materialDesignIcons = JSON.parse(cachedIcons);
                this.inflateUI();
            }
            else {
                const upstreamSource = 'https://raw.githubusercontent.com/Templarian/MaterialDesign-Webfont/master/scss/_variables.scss';
                $.ajax({
                    url: upstreamSource,
                    success: function(result) {
                        var regex = /    "(.*)": (F[A-F0-9]*),?/g,
                            match;

                        while (match = regex.exec(result))
                            self.materialDesignIcons.push('mdi-' + match[1]);

                        localStorage.icons = JSON.stringify(self.materialDesignIcons);
                        self.inflateUI();
                    },
                    error: function(result) {
                        console.error(result);

                        self.onIconsRetrievalError("Could not connect to MaterialDesignIcons's repository")
                    }
                });
            }
        },

        onIconsRetrievalError: function(humanReadableError) {
            // TODO
        },

        inflateUI: function() {
            var self = this;

            // Inflate icons list
            var iconWrap = $('<div />').addClass('icon-wrap');
            var index = 0,
                row = 1;
            this.materialDesignIcons.forEach(function(icon) {
                var col = (index % cols)+1;

                iconWrap
                    .clone()
                    .data('icon', icon)
                    .data('col', col)
                    .data('row', row)
                    .append(
                        $('<i />')
                            .addClass('mdi ' + icon)
                    )
                    .click(function() {
                        self.setActiveIcon($(this));
                    })
                    .appendTo(self.ui.icons.list);

                if (col == cols)
                    row++;
                index++;
            });
            self.ui.icons.icons = self.ui.icons.list.children();

            // Register tooltip mouseenter / mouseleave events
            self.ui.icons.icons.mouseenter(function() {
                var icon = $(this),
                    tooltip = self.ui.tooltip;

                // Update label
                tooltip.text(icon.data('icon'));

                // Show tooltip so we can get its width
                tooltip.show();

                // Compute position
                var top = icon.position().top + icon.outerHeight(true),
                    left = icon.position().left + icon.outerWidth(true)/2 - tooltip.outerWidth(true) / 2;

                tooltip
                    .css('top', top)
                    .css('left', left);

                // Check if tooltip is out of viewport
                if (left < 0)
                    tooltip.css('left', 5);
                else if (left + tooltip.outerWidth(true) > $('body').width())
                    tooltip.css('left', $('body').width() - tooltip.outerWidth(true) - 5);
            }).mouseleave(function() {
                self.ui.tooltip.hide();
            });

            // Set random icon as selected
            this.setActiveIcon($(this.ui.icons.icons.get(
                randomInt(0, this.ui.icons.icons.length-1)
            )), true);
            this.ui.icons.icons.filter('.active').removeClass('active');
        },

        setActiveIcon: function(iconElem, fake, ensureVisible) {
            fake = fake || false;
            ensureVisible = ensureVisible || false;

            var className = iconElem.data('icon');
            this.ui.icons.icons.filter('.active').removeClass('active');

            if (!fake) {
                iconElem.addClass('active');
                this.ui.properties.wrap.removeClass('inactive');
            }
            this.ui.properties.name.text(className);
            this.ui.properties.className.text(className);
            this.ui.properties.icon[0].classList = 'mdi ' + className;
            this.ui.footer.openInMaterialdesignIcons.attr('href',
                'https://materialdesignicons.com/icon/' + className.substr('mdi-'.length));

            if (ensureVisible) {
                var offset = iconElem.offset().top - iconElem.parent().position().top;
                var iconElemHeight = iconElem.outerHeight(true);

                var scrollTop = iconElem.parent().scrollTop(),
                    initialScrollTop = scrollTop;
                if (offset - 5 < 0)
                    scrollTop = iconElem.parent().scrollTop() + offset - 5;
                else if (offset + iconElemHeight > iconElem.parent().height())
                    scrollTop = scrollTop + offset + iconElem.outerHeight(true) - iconElem.parent().height();

                if (scrollTop != initialScrollTop)
                    iconElem.parent().scrollTop(scrollTop);
            }
        }
    };

    window.MaterialDesignIconsPicker = MaterialDesignIconsPicker;
})($, window);

$(document).ready(function() {
    var picker = new MaterialDesignIconsPicker();
    picker.init();
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
