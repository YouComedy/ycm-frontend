
;
(function( $, window, document, APP ){


	var Popover = APP.Popover;

	var POPOVER_TPL = APP.globals.POPOVER_TPL = [
		'<div class="popover">',
			'<div class="arrow"></div>',
			'<div class="popover-inner">',
				// '<h3 class="popover-title"><span></span><a style="float:right" onclick="jQuery(this.parentNode.parentNode.parentNode).hide()">&times;</a></h3>',
				'<div class="popover-content"></div>',
			'</div>',
		'</div>'
	].join("");


	Popover.register = function(element) {
		
	}


	Popover._activity = function( element ) {
		element = $(element);
		clearTimeout(element.data("popover.timer"));
		element.data("popover.last", +new Date);
		element.data("popover.timer", setTimeout(function(){
			Popover.unregister(element);
		}, 7000));
	}


	Popover.unregister = function(element) {
		var p = IDs[element] || element;
		if(p) {
			// ...
		}
	}


	$.fn.smartPopover = function( opts ){
		return this.each(function(){
			var btn = $(this);
			// btn.one("mouseenter.init-popover", function(){
				// delete this.onmouseover;

				var showTimer, hideTimer, popover, visible, busy;
				opts.item = opts.item || {};

				popover = btn.data("popover");

				function initButton(){

					// btn.on("click", "label", function( evt ){
					// 	var test = $(this);
					// 	if(test.is("label"))
					// 		test = test.find(":checkbox");

					// 	if(test.is("input:checkbox")) {
					//         test.prop("checked", !test.prop("checked"));
					//         // test.attr("checked", "checked");
					//         // alert(test[0].checked)
					//         return true;
					//     }
					// });

					btn.on("click.popover", "[data-popover-action]", function(evt){
						var test = $(evt.currentTarget);
						opts.view["popover-" + test.attr("data-popover-action")] &&
									opts.view["popover-" + test.attr("data-popover-action")](evt, $(popover.$tip));
					})

					.on({

						'mouseenter.popover' : function(evt){
							if($.fn.smartPopover.disabled) return;
							clearTimeout( hideTimer );
							if(popover.$tip && popover.$tip.is(":visible")) return;
							var self = this;

							showTimer = setTimeout(function(){
								// console.log(opts.content());
								// popover.setContent();
								opts.item.id &&
									$(popover.$tip).attr("id", "i" + opts.item.id + "-popover").find(".popover-content")
								// .html(content)
								// console.log(popover)
								popover.show();
								opts.after && opts.after(btn, popover);
							}, 777);
						},


						'mouseleave.popover' : function(evt){
							// return
							clearTimeout( showTimer );
							// if(!visible) return;
							hideTimer = setTimeout(function(){
								popover.hide();
							}, opts.hide || 444);
						},


						'click.popover' : function( evt ){
							if($.fn.smartPopover.disabled || opts.click === false) return;

							clearTimeout( showTimer );
							clearTimeout( hideTimer );

							var target = $(evt.target);

							if(popover.$tip && popover.$tip.is(":visible")){
								if(target.parents(".popover").length) {
									if(target.is("a") || target.parent().is("a"))
										return true;
									return false;
								}

								opts.hideOnClick && popover.hide();

							} else {
								popover.show();
								opts.after && opts.after(btn, popover);
							}

							evt && evt.preventDefault();

							// if(opts.prevent === true)
							// 	return false;
						}
					});

					if( opts.leave && !opts.hover){
						// console.log(btn);
						btn.off("mouseenter.popover");
					}
					else if(!opts.leave && !opts.hover)
						btn.off("hover.popover");



					// opts.view && opts.events && _.each(opts.events, function( e ){
					// 	btn.on(e[0], e[1], function(evt){

					// 		// return false;
					// 	});
					// });
				}

				if( opts.url ) {

					var xhr = null;

					btn.on("mouseenter.popover.url", function(){
						
						var url = _.isFunction(opts.url)
						 	? opts.url( btn )
						 	: opts.url;

						xhr = $.get(url, function(data){
							btn
								.off("mouseenter.popover.url")
								.off("mouseleave.popover.url");

							xhr = null;

							if(!popover){
								popover = btn.popover({
									trigger : 'manual',
									content : function(){
										return opts.content(data, btn);
									},
									template: opts.tpl || APP.globals.POPOVER_TPL,
									placement : opts.placement,
									animate : true
								}).data("popover");
							}
							initButton();
							showTimer = setTimeout(function(){
								btn.off("mouseenter.popover.url");
								popover.show();
							}, 333);
						}).error(function(){});

					}).on("mouseleave.popover.url", function(){
						clearTimeout(showTimer);
						xhr && xhr.abort();
						xhr = null;
					});
				} else {
					if(!popover){
						popover = btn.popover({
							trigger : 'manual',
							content : opts.content,
							template: opts.tpl || APP.globals.POPOVER_TPL,
							placement : opts.placement,
							animate : true
						}).data("popover");
					}
					initButton();
				}

				if( popover ){
					popover._show = popover.show;
					popover.show = function() {
						opts.after && opts.after(btn, popover);
						popover._show();
					}
				}

				// #hack
				btn.data('popover-after-callback', opts.after);

				btn.off("mouseenter.init-popover").trigger("mouseenter");

			// });
		});

	}
	

})( this.jQuery, this, document, this.APP );
