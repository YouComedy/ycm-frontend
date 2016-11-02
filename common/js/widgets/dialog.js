
;
(function( $, window, document, APP ){


	// @todo
	// Портировать такую штуку в APP.isDefined()
	var file_path = "js/widgets/dialog.js";
	if(APP._files[file_path]) return;
	APP._files[file_path] = true;


	var Dialog = APP.Dialog,
		defaults = {
			"hidden" : true,
			"classname" : "",
			"lastclassname" : "",
			"layered" : false,
			"css" : ""
		}

	Dialog.on('change:title', function(){Dialog.el.find(".dialog__title").html(Dialog.get("title"))});

	Dialog.set( defaults );

	Dialog.el = $("#dialog-base");

	Dialog.close = function(){
		if(Dialog.get('hidden')) return;
		Dialog.el.hide();
		
		if(!Dialog.get("layered")){
			$.unblockBody("with_dialog");
		} else {
			$.unblockBody("with_dialog");
		}

		$("#dialog_wrapper").hide();
		Dialog.set('hidden', true);
		Dialog.el.prev().off('click.dialog');
		var c= Dialog.el.find(".dialog__content")
		c.find("*").off().end().empty();

	}

	Dialog.open = function( title, content, classname ){

		Dialog.el.removeAttr("class").addClass("dialog");
		
		// 
		(classname = classname || Dialog.get("classname"))
			&& Dialog.el.addClass( classname );

		Dialog.set("layered", $$("#overlay").is(":visible"));
		
		if( title !== undefined )
			Dialog.set('title', title);

		if( content !== undefined ){
			// Dialog.set('content', content);
			// Dialog.trigger("change:content");
			Dialog.el.find(".dialog__content").html( content );
		};

		if(Dialog.get('hidden')) {
			$.blockBody("with_dialog");
			Dialog.el.show();

			$("#dialog_wrapper").show();
			Dialog.set('hidden', false);

			Dialog.el.prev().on('click.dialog', function( evt ){
				Dialog.close();
			});
		}

	}

	Dialog.open2 = function(opts) {
		Dialog.open( opts.title, opts.content, opts.class );
		opts.open && opts.open( Dialog.el.find(".dialog__content") );
	}


	Dialog.reset = function(){
		Dialog.set( defaults );
		Dialog.close();
	}

	
	// Dialog.on('change:content', function(){Dialog.el.find(".dialog__content").html(Dialog.get("content"))});
	

})( this.jQuery, this, document, this.APP );
