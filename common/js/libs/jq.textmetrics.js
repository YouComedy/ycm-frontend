/*
 * jq.textMetrics.js - jquery fixed scroll plugin
 * by E. Korzun
 */

;(function($) {
	
	$.fn.textMetrics = function( o ){
		
		var div, element = this;
		
		// create tmp div
		(div = $(document.createElement('div')))
		.css({
			position : 'absolute',
			left : -1000,
			top : -1000,
			display : 'none'
		}).appendTo('body');
		
		// fill up tmp div with @this text
		div.html( element.html() );
		
		// apply the same text styles
		$(['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'])
			.each(function(i, style){
				div.css(style, element.css(style));
			});
		
		// calculate width & height
		var result = {
			height: div.outerHeight(),
			width: div.outerWidth()
		}
		
		// remove tmp div
		div.remove();
		
		// return object
		return result;
	};
	
})(jQuery);
