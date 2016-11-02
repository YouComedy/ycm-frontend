

// Стандартные тултипы
// window.queue_start_calls.push(function(){
// 	$("a[title]").each(function(){
// 		!$(this).is("[data-action]") && $(this).tooltip({placement:$(this).attr('data-placement') || 'bottom'})
// 	});
// });




// Поиск в хедере
window.queue_start_calls.push(function(){
	$("#menu__search").one("focus", function(){

		APP.Autocomplete.safecall("enable", {
			'source' : "/suggest",
			'el' : $(this),
			'appendTo' : '#header-ac',
			'select': function(event, ui) {
				$(this).val(ui.item.value);

				if(ui.item.type == "user") {
					window.location = "/user/" + ui.item.username;
					return false;
				} else {
					window.location = "/tag/" + ui.item.value;
				}
			 },
			'render' : function (ul, item) {
				var li = $("<li></li>");
				if( item.type == "user" ) {
					item.label = item.name;
					item.id = item.name;
					item.value  = item.name;
					li.html([
	                    "<a class='row-fluid'>",
	                        "<div class='autocomplete__thumb'>",
	                            "<img src='" + (item.small_image || ("/common/img/profile/avatar_small.png?" + window.STATIC_VERSION)) + "'>",
	                        "</div>",
	                        "<div class='autocomplete__text'>",
	                            (
	                                item.name
	                                    ? "<b>" + item.name + "</b>" + " " + (item.rating ?( '<i class="ycm-icon ycm-icon-star"></i>' + item.rating) : ("<i>"  + "@" + item.username + "</i>"))
	                                    : "<b>" + item.username + "</b>"
	                            ),
	                            "<br />",
	                            "<i style='font-size:11px'>" + item.followers_count + " " + plural(item.followers_count, "подписчик,подписчика,подписчиков") + "</i>",
	                        "</div>",
	                    "</a>"
	                ].join(""));
	            } else {
					li.html([
						"<a class='row-fluid title'>",
							item.label,
							item.weight ?
							"<div class='remark _small'>" + item.weight + " " + plural(item.weight, "шутка,шутки,шуток") + "</div>" : '',
						"</a>"
					].join(""));
				}

				li.data("ui-autocomplete-item", item);

				return li.appendTo(ul);
			}
		});
	});
});


window.queue_start_calls.push(function(){

	if(Modernizr.touch) {
		$("#go-to-top").remove();
		return false;
	}

	// go to top button
	var _lasttop = 0;
	var showPosition = $$("#main-page-sidebar").height() + 200;
	var toTheTopBtn = $$("#go-to-top").click(function(){
		if (toTheTopBtn.hasClass('_down')) {
			$$("#body").stop().animate({
				'scrollTop' : _lasttop
			}, function(){
				toTheTopBtn.removeClass('_down');
			});
		} else {
			_lasttop = $$("#body").scrollTop();
			$$("#body").stop().animate({
				'scrollTop' : 0
			}, function(){
				toTheTopBtn.addClass('_down');
			});
		}
	});

	$$("#body").on("scroll.totop", function(){
		if( $.winScrollTop > showPosition ) {
			if( !toTheTopBtn.is(":animated") ) {
				toTheTopBtn.removeClass('_down');
				if( $.winScrollTop > $.winHeight ) {
					toTheTopBtn.fadeIn( 150 );
				} else {
					toTheTopBtn.fadeOut( 150 );
				}
			}
		}
	});

});


window.queue_start_calls.push(function(){
	// $(document.body).on('click', 'a[data-tab]', function(event){

	// 	return false;
	// });

	$.fn.simpleTab = function( tab ){
		var btn = $(this),
			tab = tab || btn.data("tab");
		btn.makeActive( true, "_active" );
		$(tab)
			.removeClass("_hide")
			.addClass("_show")
			.siblings()
			.removeClass("_show")
			.addClass("_hide");
	}
});



// window.queue_start_calls.push(function(){


	var ACTIVITY_FRIENDS_ERR_MSG = [
		// style background: url(\"\") 40px center no-repeat;"
		'<div class="_textCenter" style="{style}">',
			'<p style="margin: 20px 20px 0;">{text}</p>',
			'<a href="/friends/invite" class="button _xlarge">Пригласить друзей</a><br>',
			'или <a href="/friends" class="link _underline">найти друзей</a>',
		'</div>'
	].join("");


	var ActivityWidget = new APP.Module({
		name: "WActivity",
		inited : false,
		tab : (!window.user_id ? ("comments") : ($.cookie("ACTIVITY_TAB") || "comments")),
		timeout : 5000,
		lid : cache.get("ACTIVITY_LID") || window.__APP_WActivity_lid
	});

	var classNamesMap = {
			'item_like': '_like',
	        'content_post': '_post',
	        'content_repost': '_repost',
	        'content_like': '_like',
	        'comment_post': '_comment',
	        'comment_like': '_like',
	        // 'comment_dislike' :'_',
	        'user_registered': '_follow',
	        'user_follow': '_follow',
	        'comment_usermention' : '_comment',
			'badge_received' : '_badge',

	        'content_send' : '_shared'
		}

	ActivityWidget._conf = {
		"activity" : {},
		"comments" : {}
	}

	ActivityWidget
		.on("change:inited", function( model, inited ){
			ActivityWidget.off("change:inited");
			ActivityWidget.trigger("change:lid", undefined, ActivityWidget.get("lid"));

			// if(ActivityWidget.get("tab") === "activity") {
			var oldEntries = cache.get("ACTIVITY_ENTRIES");
			if( oldEntries && oldEntries.length ) {
				activity === undefined && (activity = newList("activity"));
				activity.reset( oldEntries );
				activity._quieries++;
				ActivityWidget._renderAll(activity, "activity");
			}
			// }

			ActivityWidget['push' + (inited ? "Start" : "Stop")]();
		})
		.on("change:tab", function( module, tab ){

			$.cookie("ACTIVITY_TAB", tab);
			// ActivityWidget.set("timeout", (tab || "").indexOf("comment") > -1 ? 10E3 : 5E3);
			ActivityWidget["_push" + ActivityWidget.get("tab")]();


			// HARDCORE HACK
			$$("#fixedfeed > div > a[data-param='"+tab+"']").makeActive(true, "_active");
			$("#" + tab  + "tab")
				.removeClass("_hide")
				.addClass("_show")
				.siblings()
				.removeClass("_show")
				.addClass("_hide");

			// hard hack
			$("#fixedfeed")[(tab == "activity" ? "add" : "remove")+"Class"]("_noshade");
		})
		.on("change:lid", function(model, lid){
			// lid == -1 нет друзкй
			// lid == 0 нет новостей
			if( lid == 0 || lid == -1){
				clearTimeout(ActivityWidget._timer);
				for(var i = 0; ++i < 10;)
					(function(i){
						setTimeout(function(){
							clearTimeout(ActivityWidget._timer);
						}, 100 * i);
					})(i);

				var text, style = "";

				if(lid == 0) {
					$("#fixedfeed").removeClass("_nofriends");
					text = "Выши друзья не проявляют абсолютно никакой активности.";
				} else {
					text = "К сожалению, пока никто из ваших друзей не сидит на YouComedy :(";
					$("#fixedfeed").addClass("_nofriends");
				}

				$("#activityfeed").html(stringTpl(ACTIVITY_FRIENDS_ERR_MSG, {text : text, style: style}));

			} else {
				$("#fixedfeed").removeClass("_nofriends");
				cache.set("ACTIVITY_LID", lid);
				ActivityWidget._pushactivityFull();
			}
		})
	;


	ActivityWidget._removeOldTimer = null;


	function newList( tabname ){
		var tmp = new Backbone.Collection;
		tmp._counter = 0;
		tmp._quieries = 0;
		tmp.on("add", ActivityWidget._onAdd);
		tabname && (tmp._tab = tabname);
		return tmp;
	}




	var comments,
		commentTPL = _.template([
			'<a class="thumb _small _right" href="/{{= content_id }}" target="_blank" data-owner="Popup" role="button" data-param="{{= content_id }}" data-action="openByID">',
				'<img class="thumb__img" src="{{= item_small_image ? item_small_image : \"/common/img/items/aa.jpg\" }}" alt="">',
			'</a>',
			'<a href="/user/{{= username }}" class="title _small">{{= fullname || username }}</a>',
			'<span class="text _small">: ',
				'{{= text }}',
			'</span>',
		].join(""));


	ActivityWidget._pushcomments = function(){
		clearTimeout(ActivityWidget._timer);
		comments === undefined && (comments = newList("comments"));
		$.get("/commentfeed", function( resp ){
			resp = $.exec(resp) || {};
			if( resp.data && resp.state ) {
				var tmp = resp.data.reverse();
				comments.add( tmp );
				comments._quieries++;
				ActivityWidget._renderAll(comments);
			}

			ActivityWidget._timer = setTimeout(ActivityWidget._pushcomments, ActivityWidget.get("timeout"));
		});
	}

	ActivityWidget._rendercomments = function( comment, highlight ){
		var div = $(document.createElement('div'));
		div.addClass("widget__section _clear").attr("id", "sbc" + comment.id);

		_.each(["content_id", "item_small_image", "username"], function( prop ){
			!comment.get( prop ) && comment.set( prop, "" );
		});

		div.html(commentTPL(comment.toJSON()));
		return div;
	}


	var activity;

	ActivityWidget._renderactivity = function( activity, highlight ){
		var div = $(document.createElement('div'));
		div.addClass("widget__section _clear").attr("id", "sba" + activity.id);
		div.html(activity.get("html")).addClass(classNamesMap[activity.get("action")]);
		return div;
	}

	ActivityWidget._pushactivityFull = function(){
		activity === undefined && (activity = newList("activity"));
		$.get("/activity", function(resp){
			if((resp = $.exec(resp) || {}).items){
				var tmp = resp.items.reverse();
				ActivityWidget.set("lid", Number(resp.lid));
				activity.add( tmp );
				activity._quieries++;
				ActivityWidget._renderAll(activity);
				cache.set("ACTIVITY_ENTRIES", tmp);
			}

		});

	}

	ActivityWidget._pushactivity = function(){
		if(APP.has("disableAjaxComplete") || !APP.User.id) return;
		clearTimeout(ActivityWidget._timer);
		$.get("/activitylid?u="+APP.User.id,function(resp){
			if((resp = $.exec(resp) || {}).lid) {
				ActivityWidget.set("lid", Number(resp.lid));
			}
			ActivityWidget._timer = setTimeout(ActivityWidget._pushactivity, ActivityWidget.get("timeout"));
		});
	}




	ActivityWidget._renderAll = function( list, forcedTAB ){
		var renderFN = ActivityWidget["_render" + (forcedTAB || ActivityWidget.get("tab"))];
		if( list._quieries === 1 ) {
			list.each(function(obj, i){
				ActivityWidget._renderEntry( obj, false, renderFN, forcedTAB );
			});
		}

		(function( tab ){
			_.each(list.filter(function(o){return !o._rendered}), function(obj, i){
				setTimeout(function(){
					ActivityWidget._renderEntry( obj, true, renderFN, tab )
				}, 2000 * i);
			});
		})(forcedTAB || ActivityWidget.get("tab"));
	}

	ActivityWidget._renderEntry = function(obj, highlight, renderFN, forcedTAB){
		if( obj._rendered ) return;
		obj._rendered = true;
		clearTimeout(ActivityWidget._removeOldTimer);
		var div = renderFN( obj );
		var attachContainer = div.find("div[data-attach-imagebig]");

		if(attachContainer.length && attachContainer.is(":empty")) {
			var imgBig = attachContainer.data("attach-imagebig");
			attachContainer.html('<div class="widgetActivity__linkImage"></div>');
		}

		$("#"+(forcedTAB || ActivityWidget.get("tab"))+"feed").prepend(div);
		highlight && div.highlight("#FFFF9C", "#FFF");
		ActivityWidget._removeOldTimer = setTimeout(ActivityWidget._removeOldEntries, 1000)
	}

	ActivityWidget._removeOldEntries = function(){
		var elementID = "#" + ActivityWidget.get("tab") + "feed";
		if($$( elementID ).scrollTop() == 0) {
			$$(elementID).children().filter(":gt(29)").remove();
		}
	}


	ActivityWidget._onAdd = function( obj, list ){
		if(list._quieries < 2) return;
		var timerID = "_timer" + ActivityWidget.get("tab");

		clearTimeout(ActivityWidget[timerID]);
		obj.index = ++list._counter;

		(function( tab ){
			setTimeout(function(){
				// renderComment( comment, true )
				ActivityWidget._renderEntry(obj, true, ActivityWidget["_render" + tab]);
			}, 2000 * obj.index);
		})(list._tab || ActivityWidget.get("tab"));

		ActivityWidget[timerID] = setTimeout(function(){
			list._counter = 0;
		}, 2000);
	}

	ActivityWidget._removeEntries = function(){

	}

	ActivityWidget.pushStart = function(){
		ActivityWidget["_push" + ActivityWidget.get("tab")]();
	}

	ActivityWidget.pushStop = function(){
		clearTimeout(ActivityWidget._timer);
		ActivityWidget._timer = null;
	}


	ActivityWidget.switchTab = function( tab, e ){
		e && $(e.currentTarget).makeActive(true, "_active");
		$("#" + tab  + "tab")
			.removeClass("_hide")
			.addClass("_show")
			.siblings()
			.removeClass("_show")
			.addClass("_hide");
		ActivityWidget.set("tab", tab);
		return false;
	}


	ActivityWidget.set("inited", true);

// });



//
window.queue_start_calls.push(function(){
	Backbone.history.start({
		pushState: Modernizr.history,
		root : "/"
	});

	// try {

		// if(!Modernizr.history) {
		//     var fragment = window.location.href.split("#")[1] || window.location.pathname.substr(Backbone.history.options.root.length);
		//     if(fragment) {
		//     	setTimeout(function(){
		//     		APP.go(fragment);
		//     	}, 200);
		//     }
		// } else {
		//     Backbone.history.loadUrl(Backbone.history.getFragment());
		// }
	// } catch (e){}
});






window.queue_start_calls.push(function(){

	if(Modernizr.touch) return false;

	var allLinks = document.getElementsByTagName("a"),
		timer;

	setTimeout(function _addPopovers(){
		clearTimeout(timer);
		timer = setTimeout(_addPopovers, 1111);
		$.each(allLinks, function(i, link){
			if(
				link._tip
				|| !((link = $(link)).is("[data-title]") || link.is("[class^='b-share']"))
				|| link.has(".popover").length
			) return;

			link[0]._tip = true;
			// console.log( link );
			link.one("mouseenter.tip", function(){
				link.tooltip({placement: "in bottom", animation: false, delay: false}).tooltip("show");
				!timer && (timer = setTimeout(_addPopovers, 1111));
			});
		});
	}, 1000);

});



// Executing any scripts or functions generated from php
if( window.queue_start_calls && window.queue_start_calls.length ) {
	var fn;
	while(fn = window.queue_start_calls.shift())
		safecall(fn);
}