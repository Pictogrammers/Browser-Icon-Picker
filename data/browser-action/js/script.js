$(document).ready(function() {
    var ui = {
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

    // Inflate icons list
    var iconWrap = $('<div />').addClass('icon-wrap');
    window.MaterialDesignIcons.forEach(function(icon) {
        iconWrap
            .clone()
            .data('icon', icon)
            .append(
                $('<i />')
                    .addClass('mdi ' + icon)
            )
            .click(function() {
                setActiveIcon($(this), false);
            })
            .appendTo(ui.icons.list);
    });
    ui.icons.icons = ui.icons.list.children();

    // Filter keyup event
    $('#filter').on('keyup', function() {
        var value = $(this).val();

        ui.icons.icons.each(function() {
            $(this).toggle(
                $(this).data('icon').indexOf(value) != -1
            );
        });
    });

    function setActiveIcon(iconElem, fake) {
        var className = iconElem.data('icon');
        ui.icons.icons.filter('.active').removeClass('active');

        if (!fake) {
            iconElem.addClass('active');
            ui.properties.wrap.removeClass('inactive');
        }
        ui.properties.name.text(className);
        ui.properties.className.text(className);
        ui.properties.icon[0].classList = 'mdi ' + className;
        ui.footer.openInMaterialdesignIcons.attr('href',
            'https://materialdesignicons.com/icon/' + className.substr('mdi-'.length));
    }

    // Set random icon as selected
    setActiveIcon($(ui.icons.icons.get(
        randomInt(0, ui.icons.icons.length-1)
    )), true);
    ui.icons.icons.filter('.active').removeClass('active');

    // Prepare tooltip
    var tooltip = $('<div />')
        .addClass('tooltip')
        .hide()
        .appendTo($('body'));

    // Register tooltip mouseenter / mouseleave events
    ui.icons.icons.mouseenter(function() {
        var icon = $(this);

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
        tooltip.hide();
    });
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
