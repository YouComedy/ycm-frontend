



// pseudo code for validate( value, checks, ajax )
//	if not ajax and this.is-valid
//		return true
//	else
//		clear timer [this.id]
//	end if
//	
//	each checks as check is not ajax
//		if validators[check]( value ) is ok
//			do nothing
//		else
//			error ++
//		end if
//	end each
//	if not ajax check
//		if error == 0
//			add class valid
//		else
//			add class error
//		end if
//	else
//		set timer for ajax
//			ajax ( this.url, data, callback )
//			callback:
//				if response is ok
//					add class valid
//				else
//					add class error
//	end if


!function($){
	
	
	//$.fn.validate.checks = {};
	
	var validators = {
		
		"email": /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/i,
		
		"url": /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i,
		"image_url": /(?:jpe?g|gif|png)$/i,
		
		"name": /[\w\s]{2,18}/i,
		"password": /[\w\d]{5,}/i,
		"login": /^[\w\d\.\_a-z]{3,16}$/i,
		"phone": /(?:8|\+7)?\s?\(?(\d{3})\)?\s?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/,
		
		"title": /[a-zA-Z0-9\s\-\.а-яА-Я\u0410-\u044F\u0401\u0451]+/i,
		"date": /\d{2}[\.\-\/]\d{2}[\.\-\/](?:19)[5-9]\d/i,
		
		"required": /[^\s]{2,}/
		
	},
	
	timers = {};
	
	
	//$.fn.validate.checks = validators;
	
	
	
	function highlightSuccess(c){c.removeClass( "error warning" ).addClass( "success" )}
	function highlightError(c){c.removeClass( "success warning" ).addClass( "error" )}
	function highlightWarning(c){c.removeClass( "success error" ).addClass( "warning" )}
	
	
    function validate( input, container, value, id, checks, ajaxurl, block, equal, callback ){
    	
    	// clear ajax check timer
    	timers[id] && clearTimeout( timers[id] );
    	
    	// errors count
    	var error = 0;
    	
    	// each checks
    	for( var i = checks.length, fn, check; --i > -1;) {
    		
    		// set check function || regexp from validators and check if it exists
			if((check = validators[checks[i]])){
				if(
					((check.source && !check.test( value ))
					|| ($.isFunction(check) && !check.call( input, value, container )))
				){
					++error;
					break;
				} // end if
			} // end if
		} // end for
		
		if(equal && $.trim($(equal).val()) !== value ) {
			++error;
		}
		
		if( error == 0 ) {
			if( !ajaxurl ) {
				highlightSuccess( input );
				highlightSuccess( container );
				if( block ) {
					container.parents("form").data("error", false)
						.find("button:last").removeAttr('disabled');
				}
				callback && callback( true, value, input );
			} else {
				timers[id] = setTimeout(function(){
					var data = {};
					data[id] = value;
					highlightWarning( container );
					input.attr("disabled", "disabled");
					$.post( ajaxurl, data, function(r){
						//setTimeout(function(){
						if( r.available == true ) {
							highlightSuccess( container );
							if( block ) {
								container.parents("form").data("error", false)
								.find("button:last").removeAttr('disabled');
							}
							callback && callback(r);
						} else {
							highlightError( container );
							callback && callback(r);
						}
						input.removeAttr("disabled");
						//}, 100);
					});
				}, 800 );
			}
		} else {
			highlightError( input );
			highlightError( container );
			if( block ) {
				container.parents("form").data("error", true)
					.find("button:last").attr('disabled' , 'disabled')
			}
			//callback && callback( false, value, input );
		}
    }
	
	
	$.fn.validate = function( options ){
		
		//alert( $(this).attr("name") )
		
		var opts = $.extend({
			
		}, options);
		
		var input = $(this),
			ajaxurl = input.data('checkurl'),
			_input = this[0],
			id = input.attr('id'),
			value = $.trim(input.val()),
			container = input.parents("div.control-group"),
			checks = (input.data('validator') || "").split(/\s+/),
			block = input.data('block'),
			equal = input.data("equal"),
			callback = window[input.data("callback")];
			
		if(!checks || !checks.length || checks[0] == "" )
			return true;
		
		if( value != "" && input.data('old-value') == value ) {
			return true;
		} else {
			input.data('old-value', value );
		}
		
			
		// if( !checks ) {
			// checks = input.data('validator').split(/\s+/);
			// input.data( 'ycm-validator-checks', checks );
		// }
		
		validate( input, container, value, id, checks, ajaxurl, block, equal, callback );
			
		return true;
		
	}
	
}(jQuery);
