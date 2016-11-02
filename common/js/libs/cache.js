


/**
 * Simple cache using window.name hack
 */
;
(function( window, exec, toString, undefined ){
	
	return false;
	
	var cache = exec( window.name == "_blank" ? 'null' : window.name ) || {};
	
	window.wincache = function( name, val, sub, subval ){
		
		if( val !== undefined ) {
			if( sub === undefined ) {
				cache[ name ] = val;
				this.name = toString( cache );
			} else {
				cache[name][val] = sub;
				this.name = toString( cache );
				// console.log( arguments, cache );
			}
		} else {
			return name === '*' ? cache : cache[ name ]; 
		}
		
	}
	

	_.each('leftmenu,panels,pcf'.split(','),function( name ){
		cache[name] || (cache[name] = {});
	});
	
	window.name = toString( cache );
	
})( window, jQuery.exec, JSON.stringify );
