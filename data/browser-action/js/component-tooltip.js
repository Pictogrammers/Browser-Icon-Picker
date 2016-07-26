/**
 * MaterialDesignIcons-Picker
 * Tooltip component
 */
(function($) {
    var Tooltip = function(elem, options) {
        this.elem = $(elem);
        this.options = options;
    };

    Tooltip.prototype = {
        defaults: {
            text: '' // either "string" || function(elem) {}
        },

        init: function() {
            this.settings = $.extend({}, this.defaults, this.options);
            var self = this;

            // Prepare tooltip (once)
            this.tooltip = $('.tooltip');
            if (!this.tooltip.length) {
                this.tooltip = $('<div />')
                    .addClass('tooltip')
                    .hide()
                    .appendTo($('body'));
            }

            if (typeof this.settings.text != 'string')
                this.settings.text = this.settings.text(this.elem);

            this.elem.mouseenter(function() {
                var tooltip = self.tooltip,
                    elem = self.elem;

                self.tooltip.text(self.settings.text);

                // Show tooltip so we can get its width
                tooltip.show();

                // Compute position
                var top = elem.position().top + elem.outerHeight(true),
                    left = elem.position().left + elem.outerWidth(true)/2 - tooltip.outerWidth(true) / 2;

                tooltip
                    .css('top', top)
                    .css('left', left);

                // Check if tooltip is out of viewport
                if (left < 0)
                    tooltip.css('left', 5);
                else if (left + tooltip.outerWidth(true) > $('body').width())
                    tooltip.css('left', $('body').width() - tooltip.outerWidth(true) - 5);
            }).mouseleave(function() {
                self.tooltip.hide();
            })
        }
    };

    $.fn.tooltip = function(options) {
        return this.each(function() {
            new Tooltip(this, options).init();
        });
    };
})($);
