// Прикрутить пушхистори к попапу
// Добавить кнопку "все комментарии"
// /item/ID/allcomments -> рендер всех каментов

;
(function( $, window, document, APP ){



	$.blockUI.defaults.message = '<img width="24" height="24" src="/common/img/loader-mini.gif">';

	var Popup = APP.Popup;


	Popup.set({

		backUrl : window.__APP_goBack_URL || "",
		
		curItem : null,

		curItemID: 0,

		hidden : true

	});


	Popup.stack = [];

	
	// Define its shortcuts
	Popup.shortcuts = {
		'esc' : 'close',
		'left' : 'showPrev', 'A' : 'showPrev',
		'right' : 'showNext', 'D' : 'showNext',
		// 'W' : 'like', 'up' : 'like',
		// 'S' : 'hate', 'down' : 'hate'
	};


	// Define elements
	// Popup HTML elements with jQuery wrappers
	Popup.els = Popup.$ = {
		// overlay background
		overlay : $("#overlay"),
		// wrapper for popup
		wrapper : $("#popup_wrapper"),
		// Main container
		container : $("#popup"),
		// Content container inside popup
		content : $("#popupcontent"),
		// Title
		title : $("#popup-title > div")
	};




	Popup.showNext = Popup.next = function ( evt ) {
		if( evt && $(evt.target).is("input")) return true;
		try {
			Popup.open(APP.globals.Items.getNext(true), true);
		}
		catch(e){}
	}




	Popup.showPrev = Popup.prev = function (evt) {
		if( evt && $(evt.target).is("input")) return true;
		try {Popup.open(APP.globals.Items.getPrev(true), true);}
		catch(e){}
	}



	Popup.renderItem = function ( item, renderType, opts ) {
		if( item ) {

			$("#popup_wrapper").scrollTop(0);

			var view = (new APP.views.ItemPopup({
				model : item,
				inPopup: true,
				renderType : opts.render || renderType,
				view : opts.view
			}));

			Popup.stack.push( view );
			view.render();

			try {
				$.mainContainer.scrollTop($("#ig"+item.id).offset().top);
			} catch(e) {}
		}
	}



	// open(){
	// 	p = new Popup;
	// 	stack.push( p );

	// 	if(stack.length > 1) {
	// 		p.makeActive().appendTo( container );
	// 	}
	// }





	Popup.open = function ( item, clearStack, opts ) {

		opts = opts || {};


		if(!APP.globals.Items) {
			APP.globals.Items = item.collection;
		}

		var render = "append" || opts.render;

		if( clearStack === true || opts.clearStack ){
			Popup.stack = [];
			render = "html";
		}

		$("#popup").find("ul.ui-autocomplete").remove();

		if( Popup.$.container.is(":hidden") ) {
			// body_block();
			$.blockBody();

			Popup.renderItem( item, render, opts );
			// APP.prevModule
			// Popup.$.wrapper.show();
			// Popup.$.overlay.fadeIn(300, function(){
				// Make popup module active
				APP.Popup.active();
			// });
		} else {
			Popup.renderItem( item, render, opts );
		}
	}




	Popup.openByID = function ( item_id ) {
		if( $.isIphone() ) {
			window.open( "/" + item_id, "_blank");
			return false;
		}
		
		var item = new APP.models.Item({id: item_id});
		item.fetchFullModel({
			success : function( resp, item, err_state ){
				Popup.open( item );
			}
		});
	}


	Popup.openModeration = function( item_id ){

		if(!APP.User.isModerator()) {
			console.error("f u");
			return false;
		}

		setTimeout(function(){
			APP.Moderator.safecall("openPopup", item_id );
		}, 77);
	}




	Popup.openFromVar = function( varname ){
		var item = new APP.models.Item(window[varname]);
		Popup.open( item, true );
	}





	// close() {
	// 	curPopup = stack.pop();
	// 	curPopup.remove();
	// 	if( stack.length ) {
	// 		p  = stack[stack.length-1];
	// 		p.makeActive();
	// 	}
	// }

	Popup.close = function (argument) {
		var $popup = Popup.$.container;
		
		// Be sure that it is visible
		if( $popup.is(":visible") ) {
			// console.log(Popup.stack);
			var curItem = Popup.stack.pop(),
				lastItem = _.last(Popup.stack);

			if( lastItem ) {
				// alert(lastItem.id)
				lastItem.$el.makeActive( true, "_active");
				APP.go("/" + lastItem.model.id, false);

				curItem.$el.remove();

			} else {
				// alert(APP.get("prevModule"))
				// switch(APP.get("prevModule")) {
				// 	case "ItemsViewer": case "Popup":
				// 		APP.ItemsViewer && APP.ItemsViewer.active();
				// 		break;
				// 	case "News": 
				// 		APP.News && APP.News.active();
				// 		break;
				// }


				// Hiding it using fade out animation
				Popup.$.wrapper.find("iframe").remove();
				// Popup.$.wrapper.hide();
				// body_unblock();
				$.unblockBody();

				curItem  && curItem.$el.remove();

				// Hiding overlay element too
				// Popup.$.overlay.fadeOut(300);
				Popup.disActive();

				window.__APP_goBack_URL && APP.go(window.__APP_goBack_URL);
			}


			
			// try {
			// 	// var item = APP.globals.Items.get(Popup.get("itemID"));
			// 	// item && item.trigger("popupClosed");

			// } catch (e) {}

			
		}
	}




	
	Popup.like = function(){
		if(APP.globals.Items) {
			var i = APP.globals.Items.getCurrent();
			i && i.get("vote").like();
		}
		else if( APP.globals.lastActiveItem ) {
			APP.globals.lastActiveItem.get("vote").like();
		}
	}

	Popup.hate = function(){
		if(APP.globals.Items) {
			var i = APP.globals.Items.getCurrent();
			i && i.get("vote").dislike();
		}
		else if( APP.globals.lastActiveItem ) {
			APP.globals.lastActiveItem.get("vote").dislike();
		}
	}
	





	return;
	
	
	// UTILs
	
	var bodyWidth,
		scrollbarWidth;
	
	function body_block(){
		bodyWidth = $.body.width();
		$$(".navbar").width(bodyWidth);
		$.body.addClass("with_popup");
		$.body.width(bodyWidth);
		scrollbarWidth || (scrollbarWidth = $(window).width() - bodyWidth);
		
		$(window).on('resize.popup', function(){
			$.body.add($$(".navbar")).width($(window).width() - scrollbarWidth);
		});
	}
	
	
	
	function body_unblock(){
		$$(".navbar").css('width', 'auto');
		$.body.removeClass("with_popup");
		$.body.css('width', 'auto');
		$(window).off('resize.popup');
	}


	// #hack hack #workaround #megahack
	
	

})( jQuery, this, document, this.APP );
