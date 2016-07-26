/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

var params = {
    upstreamSource: 'scss',
    storage: 'chromeStorage'
};

(function($, window) {
    const cols = 6;

    var MaterialDesignIconsPicker = function(options) {
        this.options = options;
    };

    MaterialDesignIconsPicker.prototype = {
        ui: {},
        defaults: {
            upstreamSource: 'scss', // json|scss
            upstreamSources: {
                json: {
                    url: 'http://cdn.materialdesignicons.com/1.5.54/meta.json',
                    dataType: 'json'
                },
                scss: {
                    url: 'https://raw.githubusercontent.com/Templarian/MaterialDesign-Webfont/master/scss/_variables.scss',
                    dataType: 'text'
                }
            },

            jsonUpstreamIgnoredKeys: ['id', 'codepoint'],
            cacheDuration: 5,

            storage: 'chromeStorage' // html5LocalStorage|chromeStorage
        },
        materialDesignIcons: [],

        init: function() {
            this.settings = $.extend({}, this.defaults, this.options);

            this.ui = {
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

        filterMatches: function(icon, filterVal) {
            if (icon.name.indexOf(filterVal) != -1)
                return true;

            for (var i=0; i<icon.aliases.length; i++) {
                if (icon.aliases[i].indexOf(filterVal) != -1)
                    return true;
            }
            return false;
        },

        prepareUI: function() {
            var self = this;

            // Filter keyup event
            this.ui.filter.on('keyup', function() {
                var value = $(this).val();

                self.materialDesignIcons.forEach(function(icon) {
                    icon.domElem.toggle(
                        self.filterMatches(icon, value)
                    );
                });
            });

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
            var that = this,
                lastRetrieval = localStorage.lastRetrieval;

            lastRetrieval = lastRetrieval || 0;
            var cacheAge = Math.ceil(Math.abs(Date.now() - lastRetrieval) / (1000 * 3600 * 24));

            if (cacheAge < this.settings.cacheDuration) {
                this.retrieveLocalCache(function(icons) {
                    that.materialDesignIcons = icons;
                    that.inflateUI();
                });
            }
            else
                this.downloadIconsList();
        },

        /**
         * Fetch icons list (ajax request) from upstream source
         */
        downloadIconsList: function() {
            var upstreamSource = this.settings.upstreamSource,
                upstreamSourceInfos = this.settings.upstreamSources[this.settings.upstreamSource],
                self = this;

            // Prepare parser
            var parser = null;
            switch (upstreamSource) {
                case 'json':
                    parser = function(result) {
                        self.materialDesignIcons = result;

                        // Ignore keys (avoid filling localStorage with unneeded information)
                        self.settings.jsonUpstreamIgnoredKeys.forEach(function (key) {
                            self.materialDesignIcons.forEach(function (icon) {
                                delete icon[key];
                            });
                        });
                    };
                    break;
                case 'scss':
                    parser = function(result) {
                        self.materialDesignIcons = [];
                        var regex = /    "(.*)": (F[A-F0-9]*),?/g,
                            match;

                        while (match = regex.exec(result)) {
                            var name = match[1];
                            self.materialDesignIcons.push({
                                name: name,
                                aliases: []
                            });
                        }
                    };
                    break;
                default:
                    throw new Error('Unknown upstreamSource ' + upstreamSource);
            }

            // LET'S DO THIS
            $.ajax({
                url: upstreamSourceInfos.url,
                dataType: upstreamSourceInfos.dataType,
                success: function(result) {
                    parser(result);

                    self.writeToLocalCache();
                    localStorage.lastRetrieval = Date.now();
                    self.inflateUI();
                },
                error: function (result) {
                    console.error(result);

                    self.onIconsRetrievalError("Could not connect to MaterialDesignIcons's repository")
                }
            });
        },

        onIconsRetrievalError: function(humanReadableError) {
            // TODO
        },

        writeToLocalCache: function() {
            switch (this.settings.storage) {
                case 'html5LocalStorage':
                    localStorage['icons'] = JSON.stringify(this.materialDesignIcons);
                    break;
                case 'chromeStorage':
                    chrome.storage.local.set({'icons': this.materialDesignIcons});
                    break;
                default:
                    throw new Error('Unknown storage method ' + this.settings.storage);
            }
        },

        retrieveLocalCache: function(callback) {
            switch (this.settings.storage) {
                case 'html5LocalStorage':
                    callback(JSON.parse(localStorage['icons']));
                    break;
                case 'chromeStorage':
                    chrome.storage.local.get('icons', function(storage) {
                        callback(storage.icons);
                    });
                    break;
                default:
                    throw new Error('Unknown storage method ' + this.settings.storage);
            }
        },

        inflateUI: function() {
            var self = this;

            // Inflate icons list
            var iconWrap = $('<div />').addClass('icon-wrap');
            var index = 0,
                row = 1;
            this.materialDesignIcons.forEach(function(icon) {
                var col = (index % cols)+1;

                icon.domElem = iconWrap
                    .clone()
                    .data('icon', icon)
                    .data('col', col)
                    .data('row', row)
                    .append(
                        $('<i />')
                            .addClass('mdi mdi-' + icon.name)
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

            // Add tooltips
            self.ui.icons.icons.tooltip({
                text: function(icon) {
                    return icon.data('icon').name;
                }
            });

            // Set random icon as selected
            this.setActiveIcon($(this.ui.icons.icons.get(
                randomInt(0, this.ui.icons.icons.length-1)
            )), true);
            this.ui.icons.icons.filter('.active').removeClass('active');

            this.ui.filter.focus();
        },

        setActiveIcon: function(iconElem, fake, ensureVisible) {
            fake = fake || false;
            ensureVisible = ensureVisible || false;

            var className = iconElem.data('icon').name;
            this.ui.icons.icons.filter('.active').removeClass('active');

            if (!fake) {
                iconElem.addClass('active');
                this.ui.properties.wrap.removeClass('inactive');
            }
            this.ui.properties.name.text(className);
            this.ui.properties.className.text('mdi-' + className);
            this.ui.properties.icon[0].classList = 'mdi mdi-' + className;
            this.ui.footer.openInMaterialdesignIcons.attr('href',
                'https://materialdesignicons.com/icon/' + className);

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
    window.picker = new MaterialDesignIconsPicker(params);
    window.picker.init();
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
