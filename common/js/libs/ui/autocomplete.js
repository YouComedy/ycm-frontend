// http://api.jqueryui.com/autocomplete/#method-close
// http://stackoverflow.com/questions/12662824/twitter-bootstrap-typeahead-multiple-values
// https://gist.github.com/gudbergur/1866577
// http://stackoverflow.com/questions/12111959/typeahead-bootstrap-trigger-when-an-item-is-selected-or-focused-from-the-menu-a
// https://github.com/tcrosen/twitter-bootstrap-typeahead
// http://www.hawkee.com/snippet/9391/ - текущий
//

;
(function ($, window, document, APP, undefined) {

    var testAC = [
        {
            value: "korzkora",
            name: "korzkora"
        }
    ];


    var AC = APP.Autocomplete;
    var QueryCache = {};

    AC.on("change:inited", function (){

        $.widget("ui.triggeredAutocomplete", $.extend(true, {}, $.ui.autocomplete.prototype, {

            options: {
                trigger: "@",
                allowDuplicates: false
            },

            _create: function () {

                // if(this.options.triggers && !this.options._trigger) {
                //     this.options.sources = {};
                //     this.options._trigger = [];
                //     $.each(this.options.triggers, function(k,v){
                //         this.options._trigger.push(k);
                //         this.options.sources[k] = v;
                //     });
                // }

                var self = this;
                this.id_map = new Object();
                this.stopIndex = -1;
                this.stopLength = -1;
                this.contents = '';
                this.cursorPos = 0;

                /** Fixes some events improperly handled by ui.autocomplete */
                this.element.bind('keydown.autocomplete.fix', function (e) {
                    switch (e.keyCode) {
                        case $.ui.keyCode.ESCAPE:
                            self.close(e);
                            e.stopImmediatePropagation();
                            break;
                        case $.ui.keyCode.UP:
                        case $.ui.keyCode.DOWN:
                            if (!self.menu.element.is(":visible")) {
                                e.stopImmediatePropagation();
                            }
                    }
                });

                // Check for the id_map as an attribute.  This is for editing.

                var id_map_string = this.element.attr('id_map');
                if (id_map_string) this.id_map = jQuery.parseJSON(id_map_string);

                this.ac = $.ui.autocomplete.prototype;
                this.ac._create.apply(this, arguments);

                this.updateHidden();

                // Select function defined via options.
                this.options.select = function (event, ui) {
                    var contents = self.contents;
                    var cursorPos = self.cursorPos;

                    // Save everything following the cursor (in case they went back to add a mention)
                    // Separate everything before the cursor
                    // Remove the trigger and search
                    // Rebuild: start + result + end

                    var end = contents.substring(cursorPos, contents.length);
                    var start = contents.substring(0, cursorPos);
                    start = start.substring(0, start.lastIndexOf(self.options.trigger));

                    var top = self.element.scrollTop();
                    this.value = start + self.options.trigger + ui.item.label + ' ' + end;
                    self.element.scrollTop(top);

                    // Create an id map so we can create a hidden version of this string with id's instead of labels.

                    self.id_map[ui.item.label] = ui.item.value;
                    self.updateHidden();

                    /** Places the caret right after the inserted item. */
                    var index = start.length + self.options.trigger.length + ui.item.label.length + 2;
                    if (this.createTextRange) {
                        var range = this.createTextRange();
                        range.move('character', index);
                        range.select();
                    } else if (this.setSelectionRange) {
                        this.setSelectionRange(index, index);
                    }

                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                };

                // Don't change the input as you browse the results.
                this.options.focus = function (event, ui) {
                    return false;
                }
                this.menu.options.blur = function (event, ui) {
                    return false;
                }

                // Any changes made need to update the hidden field.
                this.element.focus(function () {
                    self.updateHidden();
                });

                this.element.change(function () {
                    self.updateHidden();
                });

                return false;
            },

            // If there is an 'img' then show it beside the label.

            _renderItem: function (ul, item) {
                var li = $("<li></li>").data("item.autocomplete", item);
                li.html([
                    "<a class='row-fluid'>",
                        "<div class='autocomplete__thumb'>",
                            "<img src='" + (item.small_image || ("/common/img/profile/avatar_small.png?" + window.STATIC_VERSION)) + "'>",
                        "</div>",
                        "<div class='autocomplete__text'>",
                            (
                                item.name
                                    ? "<b>" + item.name + "</b>" + " " + (item.rating ?( '<i class="ycm-icon ycm-icon-star"></i>' + item.rating) : ("<i>"  + "@" + item.username + "</i>"))
                                    : "<b>" + item.username + "</b>"
                            ),
                            "<br />",
                            "<i style='font-size:11px'>" + item.followers_count + " " + plural(item.followers_count, "подписчик,подписчика,подписчиков") + "</i>",
                        "</div>",
                    "</a>"
                ].join(""));


                li.data("ui-autocomplete-item", item);

                // .append($("<a></a>").html("<b>" + item.label + "</b>" + " " + "(" + item.name + ")"));

                return li.appendTo(ul);
            },

            // This stops the input box from being cleared when traversing the menu.

            _move: function( direction, event ) {
                if ( !this.menu.element.is( ":visible" ) ) {
                    this.search( null, event );
                    return;
                }
                if ( this.menu.isFirstItem() && /^previous/.test( direction ) ||
                        this.menu.isLastItem() && /^next/.test( direction ) ) {
                    this._value( this.term );
                    this.menu.blur();
                    return;
                }
                this.menu[ direction ]( event );
            },

            search: function (value, event) {

                var contents = this.element.val();
                var cursorPos = this.getCursor();
                this.contents = contents;
                this.cursorPos = cursorPos;

                // Include the character before the trigger and check that the trigger is not in the middle of a word
                // This avoids trying to match in the middle of email addresses when '@' is used as the trigger

                var check_contents = contents.substring(contents.lastIndexOf(this.options.trigger) - 1, cursorPos);
                var regex = new RegExp('\\B\\' + this.options.trigger + '([\[\'\;\/\.a-zA-Zа-яА-Я\\-]+)[\\s\\b]?');

                // console.log(check_contents)

                // if(check_contents.indexOf(" ") > -1) return

                if (contents.indexOf(this.options.trigger) >= 0 && check_contents.match(regex)) {

                    // Get the characters following the trigger and before the cursor position.
                    // Get the contents up to the cursortPos first then get the lastIndexOf the trigger to find the search term.

                    contents = contents.substring(0, cursorPos);
                    var term = contents.substring(contents.lastIndexOf(this.options.trigger) + 1, contents.length);

                    if(term.indexOf(" ") > -1) {
                        term = "";
                    }

                    // Only query the server if we have a term and we haven't received a null response.
                    // First check the current query to see if it already returned a null response.

                    // console.log(this.stopIndex, contents.lastIndexOf(this.options.trigger));

                    if (this.stopIndex == contents.lastIndexOf(this.options.trigger) && term.length > this.stopLength) {
                        term = '';
                    }

                    if (term.length > 0) {
                        // Updates the hidden field to check if a name was removed so that we can put them back in the list.
                        this.updateHidden();
                        return this._search(term);
                    } else this.close();


                }
            },

            // Slightly altered the default ajax call to stop querying after the search produced no results.
            // This is to prevent unnecessary querying.

            _initSource: function () {
                var self = this,
                    array, url;
                if ($.isArray(this.options.source)) {
                    array = this.options.source;
                    this.source = function (request, response) {
                        response($.ui.autocomplete.filter(array, request.term));
                    };
                } else if (typeof this.options.source === "string") {
                    url = this.options.source;
                    this.source = function (request, response) {

                        if (self.xhr) {
                            self.xhr.abort();
                        }

                        var CacheID = (request.itemid = this.options.itemid) + ":" + (request.q = request.term);

                        if ( CacheID in QueryCache ) {
                            response( QueryCache[ CacheID ]);
                            self.stopLength = -1;
                            self.stopIndex = -1;
                            return;
                        }

                        self.xhr = $.ajax({
                            // после пула
                            url : url,
                            data : request,
                            // url: url + "/" + (request || {}).term || "",
                            dataType: 'json',
                            success: function (data) {
                                data = (data || {}).data;
                                if (data != null) {

                                    QueryCache[CacheID] = data;
                                    response( data );

                                    // response($.map(data, function (item) {
                                    //     if (typeof item === "string") {
                                    //         label = item;
                                    //     } else {
                                    //         label = item.label;
                                    //     }
                                    //     // If the item has already been selected don't re-include it.
                                    //     if (!self.id_map[label] || self.options.allowDuplicates) {
                                    //         return item
                                    //     }
                                    // }));

                                    self.stopLength = -1;
                                    self.stopIndex = -1;

                                } else {
                                    // No results, record length of string and stop querying unless the length decreases
                                    self.stopLength = request.term.length;
                                    self.stopIndex = self.contents.lastIndexOf(self.options.trigger);
                                    self.close();
                                }
                            },

                            error : function(){}
                        });
                    };
                } else {
                    this.source = this.options.source;
                }
            },

            destroy: function () {
                $.Widget.prototype.destroy.call(this);
            },

            // Gets the position of the cursor in the input box.

            getCursor: function () {
                var i = this.element[0];

                if (i.selectionStart) {
                    return i.selectionStart;
                } else if (i.ownerDocument.selection) {
                    var range = i.ownerDocument.selection.createRange();
                    if (!range) return 0;
                    var textrange = i.createTextRange();
                    var textrange2 = textrange.duplicate();

                    textrange.moveToBookmark(range.getBookmark());
                    textrange2.setEndPoint('EndToStart', textrange);
                    return textrange2.text.length;
                }
            },

            // Populates the hidden field with the contents of the entry box but with
            // ID's instead of usernames.  Better for storage.

            updateHidden: function () {
                var trigger = this.options.trigger;
                var top = this.element.scrollTop();
                var contents = this.element.val();
                for (var key in this.id_map) {
                    var find = trigger + key;
                    find = find.replace(/[^a-zA-Z 0-9а-яА-Я@]+/g, '\\$&');
                    var regex = new RegExp(find, "g");
                    var old_contents = contents;
                    contents = contents.replace(regex, trigger + '[' + this.id_map[key] + ']');
                    if (old_contents == contents) delete this.id_map[key];
                }
                $(this.options.hidden).val(contents);
                this.element.scrollTop(top);
            }

        }));

    });


    AC.enable = function( opts ) {
        var element = $( opts.el ).autocomplete($.extend({
            minLength: 0,
            delay : 33,
            max: 5,
            autoFocus: true,
            appendTo: 'body',
            open: function( e, ui){
                // #hack
                // @todo обновить версию jqueryUI
                var ul = $("ul.ui-autocomplete:visible");
                // ul.find("li:first a").addClass("ui-state-hover").trigger("mouseenter");
                ul.css("top", function(index, value) {return 15+parseInt(value)});
            }
        }, opts));

        if( opts.render ) {
            element.data('ui-autocomplete')._renderItem = opts.render;
        }
    }


    AC.applyTo = function ( opts ) {
        return $( opts.el ).triggeredAutocomplete({
            triggers : {
                "@" : "/users/suggest",
                "#" : "/tags/suggest"
            },

            minLength: 0,
            delay : 33,
            max: 5,
            autoFocus: true,
            allowDuplicates : false,
            hidden: '#hidden_inputbox',
            source: "/users/suggest",
            trigger: "@",
            appendTo: opts.parent || 'body',
            itemid : opts.itemid,
            open: function( e, ui){
                // #hack
                // @todo обновить версию jqueryUI
                var ul = $("ul.ui-autocomplete:visible");
                // ul.find("li:first a").addClass("ui-state-hover").trigger("mouseenter");
                ul.css("top", function(index, value) {return 15+parseInt(value)});
            }
        });
    }

})(jQuery, window, document, this.APP);