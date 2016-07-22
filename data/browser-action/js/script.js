/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */
(function($, window) {
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
                    openInMaterialdesignIcons: $('#action-open-in-materialdesignicons')
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
            this.materialDesignIcons.forEach(function(icon) {
                iconWrap
                    .clone()
                    .data('icon', icon)
                    .append(
                        $('<i />')
                            .addClass('mdi ' + icon)
                    )
                    .click(function() {
                        self.setActiveIcon($(this), false);
                    })
                    .appendTo(self.ui.icons.list);
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

        setActiveIcon: function(iconElem, fake) {
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
