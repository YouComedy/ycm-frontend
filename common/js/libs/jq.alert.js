/*!
 * jq.alert.js
 * Twitter Bootstrap based jQuery plugun
 * 
 * by E. Korzun
 */

!function( $ ){
	
	

var cache = {};

function Alert( opts, type ){
	this.opts = $.extend( this, opts );
	type && ( this.type = type );
	//return cache[this.opts.name] || this._new();
	return this._new();
}

Alert.prototype = {
	
	'_new': function(){
		this.dialog = $("<div class='alert'><a class='close' data-dismiss='alert'>&times;</a></div>")
			.addClass( "alert-" + (this.type || "info") )
			.append( this.title ? ("<strong>" + this.title + "</strong><br />" + this.msg) : this.msg )
			.css('display', 'none')
			.prependTo("#notify-wrapper");

		// caching
		cache[this.name || this.title] = this.dialog;
		// chaining
		return this.show();
	},
	
	'show': function(){
		this.dialog.fadeIn();
		return this;
	},
	
	'hide': function(){
		
	}
}


window.Alert = $.alert = function(o,t){
	return new Alert(o,t);
};
	
}( jQuery );
