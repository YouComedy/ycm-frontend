/*
 * http://vk.com/pages.php?o=-1&p=%D0%9F%D1%83%D0%B1%D0%BB%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D1%8F+%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BD%D0%BD%D0%B8%D1%85+%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86
 * https://developers.facebook.com/docs/share/
 * http://blog.ryantan.net/2010/10/image-not-showing-on-facebook-share/
 * http://api.yandex.ru/share/doc/dg/concepts/share-button-ov.xml
 */
;(function($){
	
	
	
	var Config = {
		"VK": "http://vkontakte.ru/share.php?url={1}",
		"FB": "https://www.facebook.com/sharer.php?u={1}",
		"TW": "https://twitter.com/intent/tweet?status={1}&image={3}"
	}
	
	var Links = null;
	
	$.fn.shareLinks = function( url, title, image ){
		
		if(!isURL( url )) {
			title = url;
			url = window.location.href;
		}
		
		this.find("a[data-share]").each(function(i, e){
			(e = $(this)).attr( 'href', stringTpl( Config[e.data('share')], url, title ));
		});
		
		return this;
	}
	
})(jQuery);
