

;
(function( $, window ){
	
	
	
	
	function convertElement( el, x, y, width, height ){
		
	}
	
	
	var heights = [0,0,0,0,0,0];
	
	
	var container = "#items"
	
	
	var parts = 0;
	
	
	$.supagrid = function( items, pattern, render ){
		
		if(!items) return false;
		
		parts++;
		
		var index = -1;
		
		var opts = this.opts || $.extend({
			
			selector: "li",
			
			elements: null,
			
			offsetLeft: 10,
			
			offsetTop: 10,
			
			columnWidth: 220,
			
			columnHeight: 150,
			
			resize: true,
			
			columns: 4,
			
			pattern: 0, //"random",
			
			view: null,
			
			collection: null
			
		}, {});
		
		var template_index = 0; 
		
		var pattern = [
			1,1,1,1,
			1,1,1,1,
			1,1,1,1
		];

		_.each(pattern, function( row, row_index ){
			
			_.each(row, function( item, item_index ){
				
				if( item ) {
					
					
					var size = item.split( "x" );
					var width = 230;
					
					var model = items[++index];
					
					if(!model) return;
					
					var 
					
						item_top = heights[ (item_index + 1) % opts.columns ] + opts.offsetTop * 2,
						item_left = opts.columnWidth * item_index + opts.offsetLeft * item_index,
						item_width = width * opts.columnWidth + (opts.offsetLeft * width - opts.offsetLeft) - 20,
						item_height = rnd(200, 500);
						//item_height = size[1] * opts.columnHeight + ( size[1] > 1 ?  opts.offsetTop * size[1] -  opts.offsetTop: 0) - 20;

					$("#i" + model.id ).css({
						top: item_top,
						left:  item_left,
						width: item_width,
						height: item_height
					}).addClass( "c" + template_index );
					
					
					var width = size[0];
					while( width-- )
						heights[ (item_index + 1 + width ) % 4 ] += item_height + opts.offsetTop + 20;
					
				}
				
			});
			
			
		});
	}
	
	
	
	
	$.supagrid.clear = function(){
		$( container ).find("li").each(function(i){
			var block = $(this);
			setTimeout(function(){
				block.fadeOut(function(){
					block.remove();
				});
			}, 20 * i);
		});
		heights = [0,0,0,0,0,0];
	}
	
	
})(jQuery, this);

//скролл
//сортировка по новым
//новые итемы


