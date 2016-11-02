/*
 * jq.scrollfixed.js - jquery fixed scroll plugin
 * by E. Korzun
 */

;(function($) {
	$.win || ($.win = $(window));
	$.fn.fixedScroll = function(o, isFixed ) {
		
		// default options
		o = $.extend({
			appearAfterDiv : 0,
			hideBeforeDiv : 0,
			top : 0,
			updt: 0,
			css: false
		}, o);
		
		// cache element
		var element = $(this),
			offset = element.position(),
			distanceTop,
			bottom,
			top,
			left,
			marginLeft,
			calc = function(){
				
				
				
				element.css('position', 'relative');
				
				offset = element.position();
				
				// fix after offset-y
				distanceTop = o.appearAfterDiv ? offset.top + $(o.appearAfterDiv).outerHeight(true) + element.outerHeight(true) : offset.top;
				
				// hide after offset-y
				bottom = o.hideBeforeDiv ? $(o.hideBeforeDiv).offset().top - element.outerHeight(true) - 10 : Infinity;
				
				// top offset when fixed
				top = o.top,
				left = offset.left,
				marginleft = parseInt(element.css('marginLeft'));
			}
		
		// cache the width
		var width = element.width();
		calc();

		$.win.scroll(function() {
			var wtop = $.win.scrollTop();
			//console.log( wtop, top , distanceTop )
			element.css({'top' : wtop + top + 'px'});
			return;
			if(wtop + top > distanceTop && wtop < bottom) {
				
				//if( !isFixed ) {
					element.css({
						//'position' : 'fixed',
						'top' : top + 'px'
						//'left' : left - marginleft + 'px',
						//'width' : width + 'px'
					});
				// } else {
					// element.css({
						// 'top' : top + 'px'
					// });
				// }
			} else {
				//if(!isFixed)
					// element.css('position' , 'static');
			}
		}).resize(calc);
		
		return this;
	};
})(jQuery);
