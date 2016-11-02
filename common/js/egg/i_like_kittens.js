
$(function(){
	
	window.EGG = window.EGG || {};
	
	
	
	var imgs = $("img"), urls = [];
	
	imgs.each(function(){
		urls.push( this.src );
	});
	
	var enable = false;
	
	$.preloadImages( imgs, function(){
		enable = true;
	});
	
	
	window.EGG.i_like_kittens = function(){
		// if( !enable ) {
			// setTimeout( arguments.callee, 100 );
			// return;
		// }
		
		imgs.each(function( i ){
			var img = $(this).data('old-src', this.src), w = img.width(), h = img.height();
			img.attr('src', 'http://placekitten.com/'+w+'/'+h);
			setTimeout(function(){
				img.attr('src', img.data('old-src'))
			}, 3000);
		});
	}

});
