//
//

$.win || ($.win = $(window));

function submitOnEnter(event, element){
	((event||{}).keyCode ==13 || (event||{}).which ==13) && $(element).parents("form").submit();
}

$.Share = {
	'urlVK' : function( url, title, descr, img ) {
		return [
			"http://vk.com/share.php?",
			"url=" + url,
			// "&title=" + title,
			// "&description=" + descr,
			// "&image=" + img
		].join("");
	},
	'urlFB' : function( url, title, descr, img ) {
		return "https://www.facebook.com/dialog/feed?app_id=216570901687097&redirect_uri=http%3A%2F%2Fwww.yandex.ru%2Fi-social__closer.html&link=" + url
	},

	'popup' : function( o  ) {

		var w = 500, h = 350;
		var left = (screen.width/2)-(w/2);
		var top = (screen.height/2)-(h/2);
		return window.open($.Share['url' + o.type](o.url, o.title, o.descr, o.img), "", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
	}
}

$.fn.sharingVK = function(){
	var link = $(this),
		url = link.attr("data-url") || (link.attr("href").indexOf("#") > -1 ? undefined : link.attr("href")) || '',
		title = link.attr("data-title") || link.attr("title") || '',
		descr = link.attr("data-descr") || '';
	$.Share.popup({
		title : title,
		descr : descr,
		img : '',
		type : "VK",
		url : url
	});

	return false
}

$.fn.sharingFB = function(){
	var link = $(this),
		url = link.attr("data-url") || (link.attr("href").indexOf("#") > -1 ? undefined : link.attr("href")) || '',
		title = link.attr("data-title") || link.attr("title") || '',
		descr = link.attr("data-descr") || '';

	APP.Social.safecall('proxyFB', function(){
		FB.ui({
			method: 'send',
			name: title,
			link: url,
			to : '',
			picture : $('meta[property="og:image"]').attr("content")
		});
	});

	return false
}

$.isIphone = function(){
	return $.__isIphone !== undefined ? $.__isIphone : (
		$.__isIphone = window.IS_MOBILE || (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Windows\sPhone/i.test(navigator.userAgent) || window.APP.globals.MOBILE_DEBUG)
	);
}


$.isIpad = function(){
	return $.__isIpad !== undefined ? $.__isIpad : (
		$.__isIpad = (/iPad/i.test(navigator.userAgent))
	);
}


// Complete body block with overlay and without scrolling
$.blockBody = function( classname ){

	if($.isIphone()){
		$("#body").css("overflow-y", "hidden");
		return;
	}


	var bw = ($.bodyWidth = ($.body || ($.body = $('body'))).width()),
		menu = $$("#menu").width(bw);

	$.body.addClass(classname !== undefined  ? classname : "with_popup").width(bw);
	$.sbWidth || ($.sbWidth = $.winWidth - bw);

	$.win.on('resize.popup', function(){
		$.body.add(menu).width($.winWidth - $.sbWidth);
	});

	if( $.isIphone() ) {
		$("html").css("height", $.winHeight );
		$.body.css({
			"position" : "relative",
			"height" : "100%"
		});
	}
}


// Unlock body
$.unblockBody = function(classname){

	if($.isIphone()){
		$("#body").css("overflow-y", "auto");
		return;
	}

	$.body.removeClass(classname !== undefined  ? classname : "with_popup").add($$("#menu")).css('width', '100%');
	$.win.off('resize.popup');
	if( $.isIphone() ) {
		$.body.css({
			"position" : "static",
			"height" : "auto"
		})
	}
}



$.fn.blockForm = function( opts ){
	opts = opts || {};
	return this.each(function(){
		var form = $(this);
		form.find(':submit').filter(':last').blockButton( undefined, opts.wtype );
		//console.log(form.find(':submit').filter(':last')[0])
		$.each(['input','textarea','button'], function(j,i){
			form.find(i).attr('disabled', 'disabled');
		});
	});
}


$.fn.unblockForm = function(){
	return this.each(function(){
		var form = $(this);
		form.find('button[type=submit]:visible').filter(':last').unblockButton();
		$.each(['input','textarea','button'], function(j,i){
			form.find(i).removeAttr('disabled');
		});
	});
}


$.fn.allAttrs = function(){
	var a, aLength, attributes,	map;
   if (this[0] && arguments.length === 0) {
         map = {};
         attributes = this[0].attributes;
         aLength = attributes.length;
         for (a = 0; a < aLength; a++) {
               map[attributes[a].name.toLowerCase()] = attributes[a].value;
         }
         return map;
   }
}


$.fn.selectText = function(){
	return this.setCursorPosition(this.val().length, 0)
}


$.fn.setCursorPosition = function(pos, start) {
	var el = this[0];
	if(!el) return;

	if(el.setSelectionRange) {
		el.setSelectionRange( start || pos, pos);
	} else if(el.createTextRange) {
		var range = el.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character',  start || pos);
		range.select();
	}
}


function makePlaceholdingInput( ph, input, opts ){

	if(!!input === false){
		$( ph ).prev().trigger("focus");
		return;
	}

	var flag = $( ph || input ).parent();

	!input && (input = (ph = $(ph)).prev());
	!ph && (ph = (input = $(input)).next());

	if(!flag.data('input-binded')) {
		flag.children("input").on({
			"blur" : function(){
				input.val() == "" && ph.show()
			},
			"keydown" : function(){
				ph.hide();
			}
		}).data('input-binded', true);
	}
}

$.fn.extend({
	blockButton: function( text, wtype ){
		var btn = $(this);

		if(btn.prop('disabled')) return this;

		btn.prop("disabled", true);

		if(!btn.data("oldtext")) {
			btn.data("oldtext", btn.html());
			btn.data('text-align', btn.css('text-align'));
			btn.data("width-diff", btn.innerWidth()-btn.width());
		}

		// btn.width(btn.width() - (btn.css("display") === "block" ? 0 : btn.data("width-diff")));
		btn.innerWidth(btn.innerWidth());
		btn.css('text-align', 'center');

		btn[text ? "text" : "html"]( text || '<img src="/common/img/loader-mini.gif" style="vertical-align:middle">' );

		return this;
	},


	unblockButton : function(){
		var btn = $(this);
		btn.css('text-align', btn.data('text-align'));
		btn.html(btn.data('oldtext'));
		btn.prop("disabled", false);
		return this;
	}
});



$.fn.onAJAX = function( o ){
	return this.each(function(){
		var element = $(o.el) || $(this),
			id = o.id || element.data('id'),
			url = o.url || element.attr('href') || element.attr('action') || element.data('url');
		element
			.on('ajaxSend', function( evt, resp, xhr ){
				var is_id = id && xhr.url.replace(/[^\d]+/g, '') == id,
					is_url = url && url == xhr.url;
				if( is_id || is_url ) {
					o.before.call( element, evt, resp, xhr );
				}
			})
			.on('ajaxSuccess', function( evt, resp, xhr ){
				var is_id = id && xhr.url.replace(/[^\d]+/g, '') == id,
					is_url = url && url == xhr.url;
				if( is_id || is_url ) {
					o.success.call( element, evt, resp, xhr );
				}
			});
	});
}



function isModelUrl( ajaxurl, model ){
	var ok = false;
	$.each(model._urlPatterns || typeof model === 'string' && [model] || [
		_.isFunction(model.url) ? model.url() : model.url,
		(model.urlRoot || "") + "/" + model.id,
		(model.urlRoot || "") + "/" + model.get("username")
	], function( i, url ){
		if( ajaxurl.split( url ).length > 1 ) {
			ok = true;
			return false;
		}
	});
	return ok;
}




$.hidePopovers = function() {
	$(".popover").remove();
}


$.fn.popover2 = function(o){
	$.hidePopovers();
	return this.each(function(){
		var btn = $(this);

		btn.popover({
			placement: o.place || "bottom",
			trigger: "manual",
			content: o.content, title: o.title,
			template : o.template
		});

		try {
			btn.data('popover').setContent();
		} catch(e){}

		btn.popover("show");
		!this._popover_evts && o.on && $(btn.data('popover').$tip).on( o.on ) && (this._popover_evts = 1);
	});
	return this;
}


$.hideTips = function(){
	$.body.children('.tooltip').remove();
}


$.fn.errorTip = function(o){
	return this.each(function(){
		var $this = $(this);

		if(!this._tip){
			$this.tooltip({
				placement: o.place || "bottom",
				title: o.title,
				trigger: "manual",
				classname : 'tooltip__error ' + (o.classname || ""),
				offsetY : o.offsetY || 0,
				offsetX : o.offsetX || 0,
				inside : o.inside,
				actualWidth : o.actualWidth
			});
			this._tip = true;


		}

		var $tip = $this.data('tooltip').tip();

		o.click && $tip.click(function( evt ){
			o.click( evt );
			return false;
		});

		$this.tooltip("show");

		o.fixed && $tip.css('position', 'fixed');

		this._tiptimer && clearTimeout( this._tiptimer );

		o.hide && (this._tiptimer = setTimeout(function(){
			$this.tooltip("hide");
			$this.hasClass('error') && $this.removeClass('error');
		}, o.hide ));
	});
}


$.fn.infoTip = function(o){
	return this.each(function(){
		var $this = $(this);
		if(!this._tip){
			$this.tooltip({
				placement: o.place || "bottom",
				title: o.title,
				trigger: "manual",
				// classname : 'tooltip__error',
				offsetY : o.offsetY || 0
			});
			this._tip = true;
		}

		$this.tooltip("show");

		this._tiptimer && clearTimeout( this._tiptimer );

		o.hide && (this._tiptimer = setTimeout(function(){
			$this.tooltip("hide");
		}, o.hide ));
	});
}


/**
 * Highlight active menu item
 */
$.fn.makeActive = function( one, cls ){
	this.addClass( cls || "active" );
	one && this.siblings().removeClass( cls || "active" );
	return this;
}


$.fn.chkDeselectAll = function( filter, context ){

	var block = $(this), form, chks;

	// if(!context){
	// 	if(block.is("form")){
	// 		form = block;
	// 	} else {
	// 		form = block.parents("form");
	// 		if(!form.length){
	// 			form = $(document.body);
	// 		}
	// 	}
	// } else {
	// 	form = context;
	// }

	chks = block.find("input:checkbox");
	// filter && chks.filter( filter );
	console.log(block)

	chks.attr("checked", false);
}


function prettyDate( time, unix ){
	time = unix === true ? time * 1000 : time;

	var date = $.isNumeric(time) ? new Date(time) : new Date((time + "").replace(/-/g,"/").replace(/[TZ]/g," ")),
		diff = ((+new Date - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400),
		ceil = Math.ceil, floor = Math.floor;

	if ( isNaN(day_diff) || day_diff < 0 )
		return "";

	var ago = "назад", dd;

	return day_diff < 1 ? (
			diff < 60 && "только что" ||
			diff < 120 && "минуту " + ago ||
			diff < 3600 && (dd = floor( diff / 60 )) + " " + plural(dd, "минуту,минуты,минут") + " " + ago ||
			diff < 7200 && "час назад" ||
			diff < 86400 && (dd = floor( diff / 3600 )) + " " + plural(dd,"час,часа,часов") + " "  + ago
		) : (
			day_diff == 1 && "вчера" ||
			day_diff < 7 && day_diff + " " + plural(day_diff, "день,дня,дней") + " " + ago ||
			day_diff < 30 && (dd = floor( day_diff / 7 )) + " " + plural(dd,"неделю,недели,недели") + " " + ago ||
			day_diff < 365 && (dd = floor( day_diff / 30 )) + " " + plural(dd,"месяц,месяца,месяцев") + " " + ago ||
			(dd = floor( day_diff / 365 )) + " " + plural(dd,"год,года,лет") + " " + ago
		);
}

// $.each([
// 	+new Date,  // щас
// 	1390812162000, // минут назад
// 	1390808562000, // час назад
// 	1390797762000, // 5 часов
// 	1390711362000, // вчера
// 	1390452162000, // 5 дней назад
// 	1390192962000, // неделю назад
// 	1389501762000, // 3 недели назад
// 	1387687362000, // месяц назад
// 	1382416962000, // 5 месяца
// 	1358188162000, // год
// 	1325565762000, // 2 годп
// 	], function(){
// 	console.log(prettyDate(this));
// })



$.fn.prettyDate = function(){
	return this.each(function(){
		var date = prettyDate(this.title);
		if ( date )
			$(this).text( date );
	});
}


/**
 * $ element finder function with cache
 */
function $$( selector ) {
	return (this.cache || (this.cache = {}))[selector] || (this.cache[selector] = $(selector));
}



/**
 *
 */
function safecall( callback ) {

	var context = this, closure,
		args = Array.prototype.slice.call(arguments).slice(1),
		callback = typeof callback === 'function'
			? callback : typeof callback === 'string'
				? window[ callback ] : null;

	(closure = callback ? function(){
		try {
			callback.apply( context, args );
		} catch ( e ) {
			setTimeout( closure, 1 );
		}
	} : function(){})();

}





/**
 * window.plural
 * 		Simple plural function
 * @param int count
 * @param words - comma separated string or array with words.
 * 		I.e. "рубль,рубля,рублей" or [рубль,рубля,рублей]
 * @return string form for @count
 * @example
 * 		"рубля" === plural(2,"рубль,рубля,рублей")
 */
function plural( count, words ) {
	return (words = typeof words === 'string' ?  words.split(',') : words)[ count % 10 == 1 && count % 100 != 11 ? 0
		: (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) ? 1 : 2];
}






function getPagesize(){
	var de = document.documentElement;
	return {
		width: window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth,
		height: window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight
	}
}



function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



/*********************************************************************************************************
 * STRING UTILITIES
 *********************************************************************************************************/

/**
 * Super simple string template engine.
 * @param {string} str - String which contains template vars
 * @param {object} - Object with props. Props will be converted to vars in string
 * @param {array} - Multiply arguments
 * @return {string} compiled string
 */
function stringTpl(str /*, arguments*/ ) {
	var args = arguments;
	return typeof args[1] === 'object' ? str.replace(/\{(\w+)\}/g, function(k, v) {
		return args[1][v];
	}) : str.replace(/\{(\d+)\}/g, function(k, v) {
		return args[v];
	});
}



/**
 * $._GET( str )
 * Converts any url string to js object
 * @param {string} [str] - String to be converted. By default it uses location.href
 */
$._GET =  function ( str, callback ) {
  for (var vars = ( str || window.location.href.split(/[\#\?]/)[1] || "").split("&"), i = vars.length, ret = {}, pair; --i > -1;) {
  	pair = vars[i].split("=");
  	ret[pair[0]] = $.isFunction( callback ) ? callback( pair[1] ) : pair[1];
  }
  return ret;
}


$._2GET =  function ( obj ) {
	var ret = "";
	for(var k in obj )
		ret += k + '=' + obj[k] + '&';
	return ret;
}



function fastJSON( json ) {
	if( typeof json === 'string' ) {
		if( IE ) {
			return eval("(" + json  + ")");
		} else {
			return (new Function("return " + json))();
		}
	} else {
		return json;
	}
}

$.exec = function( json ){
	return typeof json === 'string' ? $.parseJSON( json ) : json;
};


/**
 *
 */
function isEmail( str ) {
	return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test( str );
}

/**
 *
 */
function isURL( str ) {
	return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test( str );
}



/*********************************************************************************************************
 * ARRAY UTILITIES
 *********************************************************************************************************/


// simple random
function rnd(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}



/*********************************************************************************************************
 * $ SIMPLE UTILITIES
 *********************************************************************************************************/

$.fn.highlight = function( from, to, time ){
	time = time || "_fast"
	var oldBackground = to || $(this).css('backgroundColor');
	var el = $(this);
	if(!el.hasClass("_highlight"))
		el.addClass("_highlight").addClass(time);

	el.css("backgroundColor", from || "#FFFF9C");
	setTimeout(function(){
		el.css("backgroundColor", oldBackground || "transparent");
	}, time || 1500);
	// return $(this).stop().css("background-color", from || "#FFFF9C").animate({backgroundColor: oldBackground}, time || 1500);
}


/**
 * Animated scrolling to the top of the page
 */
$.toTop = function( to ){
	$('body,html').stop().animate({"scrollTop" : to || 0});
}



$.fn.jump = function(){
	return this.stop()
		.animate({'marginTop': '-=7'}, 100 ).animate({'marginTop': '+=7'}, 80 )
		.animate({'marginTop': '-=3'}, 60 ).animate({'marginTop': '+=3'}, 40 );
}



/**
 * Toggle animations. If animation is disabled, $ uses css transforms
 */
$.toggleAnimation = function(){return ($.fx.off ^= 1) && !1}




$.removeTips = function(){
	$("div.tooltip").remove();
}


$.fn.switchSrc = function( src1, src2, callback ) {
	var self = this,
		cur_src = self.attr("src"),
		next_src = cur_src == src1 ? src2 : src1,
		cached = self.data("img.cached");

	if( !cached )
		self.parent().block();

	$.preloadImages(next_src , function(){
		var _image = new Image, width, height;

		_image.src = next_src;
		width = _image.width;
		height = _image.height;

		if(!cached) {
			self.parent().unblock({
				onUnblock : function(){
					self.attr("src", next_src);
					self.data("img.cached", true);
				}
			});
		} else {
			self.attr("src", next_src);
		}


		callback && callback( next_src ==  src1 );
	});
}


$.preloadImages = function () {
	var callback, images , n;
    if (typeof arguments[arguments.length - 1] == 'function') {
        callback = arguments[arguments.length - 1];
    } else {
        callback = false;
    }
    if (typeof arguments[0] == 'object') {
        images = arguments[0], n;
        if( images ) n = images.length;
    } else {
        images = arguments;
        n = images.length - 1;
    }
    var not_loaded = n || 0;
    for (var i = 0; i < n; i++) {
    	var src = typeof images[i] === 'string' ? images[i] : $(images[i]).attr('src');
    	src && /(?:jpe?g|gif|png)/i.test( src ) &&
	        $(new Image()).attr('src', src ).load(function() {
	            if (--not_loaded < 1 && typeof callback == 'function') {
	                callback();
	            }
	        }).on("error", function(){
	        	if (--not_loaded < 1 && typeof callback == 'function') {
	                callback();
	            }
	        });
    }
}


$.fn.applyPlugin = function(){

	var callstack = {},
		inprogress = {},
		files = {};

	function pushStack(pluginName, context, args) {
		(callstack[pluginName] || (callstack[pluginName] = [])).push(function(){
			context[pluginName].apply(context, args);
		});
	}


	function execStack(pluginName) {
		$.each(callstack[pluginName], function(index, fn){
			fn && fn();
		});
	}


	return function( pluginName, opts, other ){
		var filename = files[pluginName] ||  (files[pluginName] = "/common/js/libs/" + "jq." + pluginName + ".js"),
			context = this,
			args = Array.prototype.slice.call(arguments);

		args.shift();

		if( $.fn[pluginName] ) {
			return context[pluginName].apply(context, args);
		}

		pushStack(pluginName, context, args);

		if( !inprogress[filename] ) {
			inprogress[filename] = true;
			$.getScript(filename, function(){
				execStack( pluginName );
			});
		}

	}

}();





$.cookie = function(key, value, options) {
    // key and at least value given, set cookie...
    if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
        options = $.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path    ? '; path=' + options.path : '',
            options.domain  ? '; domain=' + options.domain : '',
            options.secure  ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

    var pairs = document.cookie.split('; ');
    for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
        if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
    }
    return null;
};


$.fn.extend({
    disableSelection : function() {
        return this.each(function() {
                this.onselectstart = function() { return false; };
                this.unselectable = "on";
                $(this).css('-moz-user-select', 'none');
        });
    },
    enableSelection : function() {
        return this.each(function() {
                this.onselectstart = function() {};
                this.unselectable = "off";
                $(this).css('-moz-user-select', 'auto');
        });
    }
});


function capitaliseFirstLetter(string){return string.charAt(0).toUpperCase() + string.slice(1)}


function withLimiter(callback, pause, context) {
	var context = context || this,
		callback = typeof callback === 'string' ? context[callback] : callback;

	return function() {
		var timestamp = +new Date;
		(!callback.__lastcall__ || (timestamp - callback.__lastcall__ >= pause))
			&& (callback.__lastcall__ = timestamp)
			&& callback.apply(context, arguments);
	}
}


function getNearestNumber(a, n, offset){

	offset = offset || 0;

    for(var l = a.length, d = 0, m = Math.abs(a[0] - n), r = 0, i = -1; ++i < l;) {
    	d = Math.abs(a[i] - n);
    	if( m > d - offset) {
    		m = d;
    		r = i;
    	}
    }

    return {value : a[r], index : r};
}


function between( a, b, c ) {
	return a >= b && a <= c;
}

/*********************************************************************************************************
 * DATE UTILITIES
 *********************************************************************************************************/


if( !window.console ) {
	window.console = {};
	$.each(['log', 'group', 'groupEnd', 'info', 'error', 'g', 'ge', 'l', 'groupCollapsed'], function(){
		window.console[this] = function(){};
	});
}
