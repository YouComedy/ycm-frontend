;
(function( APP, window, document, _, $, _gaq ){


// http://dannysu.com/2012/07/07/infinite-scroll-memory-optimization/?utm_source=rss&utm_medium=rss&utm_campaign=infinite-scroll-memory-optimization
//!!!!! http://engineering.linkedin.com/linkedin-ipad-5-techniques-smooth-infinite-scrolling-html5 !!!!
// http://stackoverflow.com/questions/12613113/performance-with-infinite-scroll-or-a-lot-of-dom-elements

//
// CONFIG
// ==============================================================================================================
var Grid = APP.ItemsViewer,
	Items = Grid.Records;



Grid.set({
	'itemsContainer' : "#container",
	'itemsGridContainer' : "#grid",
	'viewTimeout' : 400,
	'autoload' : true,
	'big' : true,
	'location' : "/top"
})

.setWindowDefaults();


Grid.location = function( url ){
	return Grid.get("location") + url
}

Grid.get("big") && (Grid.shortcuts = {
	"up"	: "goUp",
	"down" 	: "goDown"
	//,"enter" : "activateItem"
});



Grid.activateItem = function(){
	var itemIndex = (getNearestNumber(Grid._tops, $.winScrollTop) || {}).index;
	if(itemIndex === undefined) return;
	var itemID = APP.ItemsViewer.IDS[itemIndex];
	var longPostBtn = $("#i" + itemID).find(".item__longpost:visible");
	var playBtn = $("#i" + itemID).find(".play-btn-overlay:visible");

	if (longPostBtn.length){
		longPostBtn.trigger("click");
	} else if (playBtn.length){
		playBtn.trigger("click");
	}
}


Grid._scrollTo = function( offset ){
	/*var itemIndex = (getNearestNumber(Grid._tops, $.winScrollTop) || {}).index;
	var next_id = APP.ItemsViewer.IDS[itemIndex + offset];
	var scrollContainer = "#body";
	var topFN = "position";
	next_id && $$( scrollContainer ).stop().animate({
		scrollTop: $("#i" + next_id)[topFN]().top + 20
	});*/

	$$('#body').stop().animate({
		scrollTop: $.winScrollTop + 100 * offset
	}, 100);
}

function wait(fn, delay){
	var interval = 0;
	var timer = getTimer();


	function getTimer(){
		return new function(){
			var last = Date.now();

			this.timeit = function(){
				var now = Date.now();
				var elapsed = now - last;

				last = now;
				return elapsed;
			};
		};
	};

	return function(){
		var timeout = timer.timeit()

		if (timeout >= delay){
			fn();
		} else if (!interval){
			interval = setInterval(function(){
				fn();
				interval = clearInterval(interval);
			}, delay - timeout);
		}
	}
};

Grid.goDown = wait(function(){
	Grid._scrollTo(1);
}, 100);

Grid.goUp = wait(function(){
	Grid._scrollTo(-1);
}, 100);


//
// Module events
// ==============================================================================================================

Grid._tops = [];
Grid._els  = [];
Grid.on("itemsChanged renderSuccess", function(){
	var index = 0;
	$(Grid.get("itemsContainer")).children().each(function(i, e){
		if((e = $(e)).hasClass("item")) {
			Grid._tops[index]= e["position"]().top;
			Grid._els[index] = e;
			index++;
		}
	});
});


// APP will auto trigger Grid with scroll & loadNext
// because of autoload prop
// Grid.__counter = 0;
Grid.on("scroll", (function(){
	var timer, lastindex = -1, lasttop = 0;
	return function( scrollTop ){
		if(Math.abs(scrollTop - lasttop) < 100) return;
		// Grid.__counter++
		lasttop = scrollTop;
		var x = getNearestNumber(Grid._tops, scrollTop - 200);
		// console.log(lastindex, x.index)
		if(lastindex === x.index) return;
		lastindex = x.index;
		clearTimeout(timer);
		+function(x) {
			timer = setTimeout(function(){
				var m = Grid.Records.at(x.index);
				if(scrollTop > Grid._tops[x.index] - 300)
					m && m.markAsViewed();

				m = Grid.Records.at(x.index + 1);
				if(scrollTop > Grid._tops[x.index + 1] - 300)
					m && m.markAsViewed();


			}, Grid.get("viewTimeout"));
		}(x);
	}
})())
.on("loadNext", function(){
	Items.loadNext();
})
.on("change:period", function( m, period ){

	var items_cookie = APP.ItemsViewer.get('items_cookie') || 'RATING_ITEMS_PERIOD';
	var btn = m._getPeriodBtn().makeActive(true);
	Items.query("period", period);
	$.cookie(items_cookie, period);
	APP.go(Grid.location("?p=" + period));

	Grid.IDS = [];

	if(!m.has("json")){
		btn.block();
		$(m.get("itemsContainer")).children().remove();
		Items.resetAll();
		Items.loadNext();
		Grid.set("autoload", Grid.get("autoload-default"));
	}
});


//
// Initialize
// ==============================================================================================================

Grid.initItems = function(){
	Items = Grid.Records = APP.globals.Items = new (Grid.get("collection") || APP.collections.Items);
	Items.UNIQ_FIELD = Grid.get("UNIQ_FIELD") || window.__APP_Grid_UNIQ_FIELD;

	if(Grid.has("view")) {
		Items.view = APP.views[Grid.get("view")];
	} else {
		Items.view = Grid.get("big")
		? (APP.views[$.isIphone() ? 'ItemMobile' : 'ItemBig'])
		: APP.views.ItemGridMain;
	}

	Items.query("period", Grid.get("period"));

	Items.urlRoot = Grid.get("urlRoot");

	if(Grid.has("_page")){
		Items._page = Grid.get("_page");
	}


	if(window.items_page === "search") {
		if(window.start_tags) {
			Items.query("q", window.start_tags);
		} else {
			Items._enableLoading = false;
		}
	}

	var newItemsCounter = 0;


	// Вынести в item,collection
	Items
		.on("add", function( item ){
			item.set("followed", APP.User.isFollowing(item.get("user_id")));
		})
		.on('itemsMissed', function(){
			if( DEBUG ) alert("itemsMissed");
			!Items.items_count && $$(Items.emptyElement).show();
			Grid.set("autoload", false);
		})
		.on("maxItems", function() {
			Items.items_count && $$(Items.seenElement).show();
			Grid.set("autoload", false);
		})
		.on("renderSuccess", function(){
			Grid._getPeriodBtn().unblock();
			if( DEBUG ) {
				console.log("rendered", (+new Date - window.__starttime));
			}
		})
		.on('successLoad', function(){

			Grid.IDS = _.union( Grid.IDS, Items.pluck("id"));

			Grid.get("big")
				? _gaq.push(['_trackPageview', '/feedPreload'])
				: _gaq.push(['_trackPageview', '/gridPreload']);
			// Grid.insertNewsBlock( true );
		})
		.on("remove", function( i ){
			$("#i" + i.id ).remove();
		});



	Grid.set("_initItems", true);
}


Grid.init = function(){

	Grid.set("inited", true);

	if(!Grid.get("big")) Grid.set("itemsContainer", Grid.get("itemsGridContainer"));
	if(!Grid.get("big")) Grid.off("scroll");
	if(!Grid.has("_initItems")) Grid.initItems();

	Grid.set("autoload-default", Grid.get("autoload"));

	Grid.setActive();

	// Dirty hack
	var json = Grid.get("json");
	if( json ) {
		APP._ajaxDataDetect( json );
		Items.reset(Items.parse(json));
		if(Items.stopLoadingOn(json))
			Items._enableLoading = false;
		Grid.insertItems(Items);
		Grid.trigger("renderSuccess");
	} else {
		Items.loadNext();
	}

	Grid.IDS = Items.pluck("id");

	Grid.unset("json");


	+function _updatePositionsIndex(){
		Grid.trigger("itemsChanged");
		setTimeout(_updatePositionsIndex, 1000);
	}();

	// if( DEBUG ) {
	// 	$(window).load(function(){
	// 		$("html,body").animate({
	// 			scrollTop: $(document).height()
	// 		}, 10000, function(){
				console.log("SCROLL COUNTS", Grid.__counter);
	// 		});
	// 	})
	// }


	if( !APP.User.id ) {
		Grid.Records.on("successLoad", function(){
			Grid.Records.currentPage % 2 == 0 && APP.trigger("insertBlock", {type:"guest_block"});
		})
	}
}


//
// renders
// ==============================================================================================================

Grid.insertItems = function( items ){
	if(!items || !items.length) return false;
	_.each(items.models || items, function( item, index ){
		!item._index && (item._index = index);
		Grid.insertItem( item, items );
	});

	Grid.trigger("itemsChanged");
}



Grid.insertItem = function( item ){
	var view = (new Items.view({model : item}));
	view.render(Grid.get("itemsContainer"));
}



//
// UI
// ==============================================================================================================

Grid.setPeriod = function( period, useSelector, doNotLoad ){
	if(Items.isBusy()) return false;
	Grid.set("period",period);
	return false;
}


Grid._getPeriodBtn = function(){
	return $('#filters').children().filter('[data-param="'+Grid.get("period")+'"]');
}





// ==============================================================================================================
// NEWS BANNER CONTROL
// ==============================================================================================================




Grid.insertNewsBlock = function( show ){
	/* Если с бекэнда пришла весточка о том что надо показать баннер*/
	if(!GRID_NEWS)
		return false

	if($("#news-block-grid").length ) {
		show && !$("#news-block-grid").data("hidden") && $("#news-block-grid").show().css("visibility", "visible");
		return false;
	}

	if(!$$("#ycm-news-banner").length)
		return false;

	var block = $("<div id='news-block-grid' class='panel _clear bannerPanel _news'></div>");
	block.css("visibility", "hidden").show();
	block.html($$("#ycm-news-banner").html());

	if( GRID_TYPE == GRID_TYPE_SMALL ) {
		Grid.columns[0].parent().prepend(block);
	} else {
		$(Grid.get("itemsContainer")).prepend( block );
	}

	if( show )
		block.show().css("visibility", "visible");
}



Grid.closeNewsBanner = function() {
	$.get("/closeNewsBanner");
	$("#news-block-grid").fadeOut(function(){
		$("#grid").removeClass("grid-with-banner");
		$$("#news-block-grid").remove();
		GRID_NEWS = false;
	}).data("hidden", true);
}







if(Grid.get("autorun")) {
	Grid.init();
}


})(window.APP, window, document, window._, window.jQuery, window._gaq || []);
