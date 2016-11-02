/*
 * jq.placeholder.js - jquery placeholder plugin
 * by E. Korzun
 */

;(function($) {
	$.win || ($.win = $(window));
	$.fn.placeHolder = function(o) {
		
		// default options
		o = $.extend({
			text : o.text || o,
			color: o.color || '#ddd'
		}, o);
		
		// detect html5 placeholder
		var canUse = Modernizr.input.placeholder;
		
		return $(this).each(function(){
			if( canUse ) {
				$(this).attr('placeholder', o.text );
			}
		});
		
		
		
		return this;
	};
})(jQuery);
