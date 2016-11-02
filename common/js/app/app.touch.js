
(function(document, $, win) {
    'use strict';

    // var TOUCH = $.support.touch = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    var HELPER_NAMESPACE = '._tap';
    var EVENT_NAME = 'tap';
    var MAX_TAP_DELTA = 40;
    var MAX_TAP_TIME = 400;

    var EVENT_VARIABLES = 'clientX clientY screenX screenY pageX pageY'.split(' ');


    function _indexOf(array, value) {
        return Array.prototype.indexOf?  array.indexOf(value) : $.inArray(value, array);
    };

    var TOUCH_VALUES = {
        $el: null,
        x: 0,
        y: 0,
        count: 0,
        cancel: false,
        start: 0
    };

    var _createEvent = function(type, e) {
        var originalEvent = e.originalEvent;
        var event = $.Event(originalEvent);
        var touch = originalEvent.changedTouches ? originalEvent.changedTouches[0] : originalEvent;

        event.type = type;

        var i = 0;
        var length = EVENT_VARIABLES.length;

        for (; i < length; i++) {
            event[EVENT_VARIABLES[i]] = touch[EVENT_VARIABLES[i]];
        }

        return event;
    };


    var _isTap = function(e) {
        var originalEvent = e.originalEvent;
        var touch = e.changedTouches ? e.changedTouches[0] : originalEvent.changedTouches[0];
        var xDelta = Math.abs(touch.pageX - TOUCH_VALUES.x);
        var yDelta = Math.abs(touch.pageY - TOUCH_VALUES.y);
        var delta = Math.max(xDelta, yDelta);

        return (
            Date.now() - TOUCH_VALUES.start < MAX_TAP_TIME &&
            delta < MAX_TAP_DELTA &&
            !TOUCH_VALUES.cancel &&
            TOUCH_VALUES.count === 1 &&
            Tap.isTracking
        );
    };


    var Tap = {


        isEnabled: false,

        isTracking: false,

        enable: function() {
            if (this.isEnabled) {
                return this;
            }

            this.isEnabled = true;

            $(document)
                .on('touchstart' + HELPER_NAMESPACE, this.onTouchStart)
                .on('touchend' + HELPER_NAMESPACE, this.onTouchEnd)
                .on('touchcancel' + HELPER_NAMESPACE, this.onTouchCancel);

            return this;
        },

        disable: function() {
            if (!this.isEnabled) {
                return this;
            }

            this.isEnabled = false;

            $(document)
                .off('touchstart' + HELPER_NAMESPACE, this.onTouchStart)
                .off('touchend' + HELPER_NAMESPACE, this.onTouchEnd)
                .off('touchcancel' + HELPER_NAMESPACE, this.onTouchCancel);

            return this;
        },

        onTouchStart: function(e) {
            var touches = e.originalEvent.touches;
            TOUCH_VALUES.count = touches.length;

            if (Tap.isTracking) {
                return;
            }

            Tap.isTracking = true;
            var touch = touches[0];

            TOUCH_VALUES.cancel = false;
            TOUCH_VALUES.start = Date.now();
            TOUCH_VALUES.$el = $(e.target);
            TOUCH_VALUES.x = touch.pageX;
            TOUCH_VALUES.y = touch.pageY;
        },

        onTouchEnd: function(e) {
            if (_isTap(e)) {
                TOUCH_VALUES.$el.trigger(_createEvent(EVENT_NAME, e));
            }
            // Cancel tap
            Tap.onTouchCancel(e);
        },

        onTouchCancel: function(e) {
            Tap.isTracking = false;
            TOUCH_VALUES.cancel = true;
        }
    };

    /*$.event.special[EVENT_NAME] = {
        setup: function() {
            Tap.enable();
        }
    };*/


    /*if( win.IS_IPAD || Modernizr.touch ) {

        Tap.enable();

        $.event._add = $.event.add;

        $.event.add = function(){
            var type = arguments[1];
            if(/mouse(?:over|leave|enter)/.test(type)) {
                // console.log(arguments);
                return false;
            }

            if(/click/.test(type)) {
                arguments[1] = "tap";
            }

            console.warn( "XXXX!!!!!*****", arguments[1] )
            $.event._add.apply(this, arguments);
        }

        $.fn._trigger = $.fn.trigger;
        $.fn.trigger = function( type, data ) {
            // console.warn( type, "SADASFRLVNRIVRPVNRPWRS:DKN:KDSNVDS" )
            // return this._trigger( type && type.replace("click", "tap") || type,  data )
            if(type && "string" === typeof type) type = type.replace("click", "tap");

            return this.each(function() {
                jQuery.event.trigger( type, data, this );
            });
        }

    }*/

}(document, jQuery, this));
