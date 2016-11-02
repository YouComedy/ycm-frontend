
!function(){

	var inviewObjects = {}, viewportSize, viewportOffset,
		d = document,
		w = window,
		documentElement = d.documentElement,
		expando = $.expando,
		fixedHeaderHeight = 65;

	var hMap = {},
		oMap = {};

	var DPos = $.fn.DPos = function( action, value ) {
		return DPos[action](this, value);
	}

	DPos.update = function( elements ) {

	}


	$.event.special.inview = {
		add: function (data) {
			// console.log(data.guid)
			inviewObjects[data.guid + "-" + this[expando]] = {
				data: data,
				$element: $(this)
			};
		},

		remove: function (data) {
			try {
				delete inviewObjects[data.guid + "-" + this[expando]];
			} catch (e) {}
		}
	};

	function getViewportSize() {
		var mode, domObject, size = {
				height: w.innerHeight,
				width: w.innerWidth
			};

		if (!size.height) {
			mode = d.compatMode;
			if (mode || !$.support.boxModel) {
				domObject = mode === 'CSS1Compat' ? documentElement : d.body;
				size = {
					height: domObject.clientHeight,
					width: domObject.clientWidth
				};
			}
		}

		return size;
	}

	function getViewportOffset() {
		return {
			top: w.pageYOffset || documentElement.scrollTop || d.body.scrollTop,
			left: w.pageXOffset || documentElement.scrollLeft || d.body.scrollLeft
		};
	}

	function checkInView() {
		var $elements = $(),
			elementsLength, i = 0;

		$.each(inviewObjects, function (i, inviewObject) {
			var selector = inviewObject.data.selector,
				$element = inviewObject.$element;

			$elements = $elements.add(selector ? $element.find(selector) : $element);
		});

		elementsLength = $elements.length;
		if (elementsLength) {
			viewportSize = viewportSize || getViewportSize();
			viewportOffset = viewportOffset || getViewportOffset();

			for (; i < elementsLength; i++) {

				// if (!$.contains(documentElement, $elements[i])) {
				//     continue;
				// }

				var $element = $($elements[i]),
					elementSize = {
						height: $element.height(),
						width: $element.width()
					},
					elementOffset = $element.offset(),
					inView = $element.data('inview'),
					visiblePartX,
					visiblePartY,
					visiblePartsMerged;

				if (!viewportOffset || !viewportSize)
					return;

				var
					  eTop = elementOffset.top -  fixedHeaderHeight
					, eHeight = elementSize.height

					, vTop = viewportOffset.top
					, vHeight = viewportSize.height

					// , vWidth = viewportSize.width
					// , vLeft = viewportOffset.left
					// , eWidth = elementSize.width
					// , eLeft = elementOffset.left
					;

				if (

					eTop + eHeight > vTop
					&& eTop < vTop + vHeight

					// && eLeft + eWidth > vLeft
					// && eLeft < vLeft + vWidth
				) {

					visiblePartX = 'both';
					// visiblePartX = (vLeft > eLeft ?
					// 	'right' : (vLeft + vWidth) < (eLeft + eWidth) ?
					// 	'left' : 'both');

					visiblePartY = (vTop > eTop ? 'bottom' : (vTop + vHeight) < (eTop + eHeight) ? 'top' : 'both');

					visiblePartsMerged = visiblePartX + "-" + visiblePartY;


					if (!inView || inView !== visiblePartsMerged) {
						$element
							.data('inview', visiblePartsMerged)
							.trigger('inview', [true, visiblePartX, visiblePartY]);
					}

				} else if (inView) {
					$element
						.data('inview', false)
						.trigger('inview', [false]);
				}
			}
		}
	}

	$("#body").bind("scroll resize", function () {
		viewportSize = viewportOffset = null;
	});


	if (!documentElement.addEventListener && documentElement.attachEvent) {
		documentElement.attachEvent("onfocusin", function () {
			viewportOffset = null;
		});
	}


	// Init
	// !function __checkInView(){
	// 	checkInView();
	// 	setTimeout(__checkInView, 222);
	// }();

	// alert(33)

	setInterval(checkInView, 222);

	var f = 0;

	window.onscroll = checkInView;
	window.addEventListener("touchmove", function(){
		checkInView();
	}, false);

	// $.extend($.expr[':'],{
	//     inView: function(a) {
	//         var st = (document.documentElement.scrollTop || document.body.scrollTop),
	//             ot = $(a).offset().top,
	//             wh = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();
	//         return ot > st && ($(a).height() + ot) < (st + wh);
	//     }
	// });

}();




















;
(function( APP, window, document, _, $, _gaq ){


// ==============================================================================================================
// CONFIG
// ==============================================================================================================

if($.isIphone()){
	// Force view type for touch devices
	GRID_TYPE = GRID_TYPE_BIG;
}


//
var MONITORING_ENABLED = GRID_TYPE === GRID_TYPE_BIG;



var GRID_NEWS = $("#ycm-news-banner").length;




$.win = $(window);
$.doc = $(document);
$.body = $(document.body);




var Popup = APP.Popup;

var $overlay = $("#overlay"),
		$popup = $("#popup"),
		$popupContent = $("#popupcontent");



var Grid = APP.Grid;


Grid.set('columnWidth', window.APP_Grid_columnWidth || 230);


Grid.columns = [];
Grid.heights = [];


var Items = Grid.Items = APP.globals.Items = new APP.collections.Items;

// Для страницы подписок переопределяем первичный ключ итемов
// Так как там показываются корневые ИТЕМЫ, а не репосты  и тд
if( window.__APP_Grid_Items_UNIQ_FIELD )
	Items.UNIQ_FIELD = window.__APP_Grid_Items_UNIQ_FIELD;


// Используем разные вьюхи для итемов
if( GRID_TYPE == GRID_TYPE_SMALL )
	Items.view = APP.views.ItemGridMain;
else
	Items.view = APP.views.ItemMobile;


// Не используем период
if( window.items_page !== "search" )
	Items.query("period", $.cookie("RATING_ITEMS_PERIOD"));

Items.on('successLoad', function(){

	GRID_TYPE == GRID_TYPE_SMALL
		? _gaq.push(['_trackPageview', '/gridPreload'])
		: _gaq.push(['_trackPageview', '/feedPreload']);


	Grid.insertNewsBlock( true );

	Items.cloud && Grid.renderCloud();

});

// ==============================================================================================================
// EVENTS
// ==============================================================================================================

Items.on("add", function( item ){
	item.set("followed", APP.User.isFollowing(item.get("user_id")));
});



Items.onItemsMissed  = function(){
	$("#items-missed").show();
};

Items.on("maxItems", function(){
	$("#items-missed").show();
});


Items.on("renderSuccess", function(){
	// window.__starttime
	console.log("rendered", (+new Date - window.__starttime))
});


// Переопределяем urlRoot для разных разделов
window.items_url_root && (Items.urlRoot = window.items_url_root);

// Ставим переменную с тегам
if(window.items_page === "search") {
	if(window.start_tags) {
		Items.query("q", window.start_tags);
	} else {
		Items._enableLoading = false;
	}
}


// ==============================================================================================================
// INITIALIZE, CACHE, RESET
// ==============================================================================================================


Items.grid = GRID_TYPE == GRID_TYPE_SMALL;


Grid.resetGrid = function(){

	$("#items-missed").hide();

	var el = $("#container").children();
	var w = el.width();
	var colsCount = 1;

	// reset arr
	Grid.heights = [];
	Grid.columns = [];


	if( GRID_TYPE == GRID_TYPE_SMALL ) {
		el.children().remove();
		for( var i = 0; i < colsCount; i++ ) {
			Grid.heights[i] = 0;
			var column = $("<div class='b-grid-column' id='b-grid-column"+i+"'></div>");

			//IE && column.width( 230 );

			Grid.columns[i] = column.appendTo( el );
		}
	} else {
		el.remove();
	}

	// Reset collection
	Items.resetAll();

	// Close popup
	APP.Popup.close();
}


Grid.reset = Grid.hardReset = function(){
	APP.go("/");
	Grid.resetGrid();
	Grid.resetMonitoring();
	Items.loadNext();
}



/**
 *
 */
Grid.toPage = function( page_num ) {
	var link = $(this);
	link.makeActive();
	Items.currentPage = link.attr("href").replace(/[^\d]/g, "");
	Items.loadNext();
}





Grid.setTags = function(){

	if(Items.isBusy()) return false;

	var tags = Grid.getTagList();

	if(tags.join(",") == Items.query("q")) return false;

	Items.query("q", tags.join(","));

	Grid.resetGrid();
	// Items.tags = tags && tags !== undefined ? tags : "";
	// Items.search = search && search !== undefined ? search : "";
	Items.loadNext();
	APP.go("/search?q=" + tags);

}

// ==============================================================================================================
// TAGS CLOUD
// ==============================================================================================================



Grid.renderCloud = function(){
	// if( window._defa)
	var cloud = Items.cloud,
		maxFont = 30,
		minFont = 15,
		maxVal  = _.max(cloud, function(t){return t.weight}).weight,
		minVal  = _.min(cloud, function(t){return t.weight}).weight,
		colors  = ['', '_yellow', '_red'],
		html = [];

	cloud = _.shuffle(cloud);

	$$("#tagsCloud").empty();
	_.each(cloud, function(tag){
		var wdiff = maxVal - minVal;
		wdiff = wdiff ? wdiff : 1;
		var font = (tag.weight - minVal) / wdiff * (maxFont-minFont) + minFont,
			color = _.shuffle(colors)[0];
		font = font > maxFont ? maxFont : font;
		var tmp = '<a role="button" data-owner="Grid" data-action="cloudInsertTag" data-param="'+tag.title+'" style="font-size: '+font+'px;" class="tagsCloud__tag '+color+'" href="#">'+tag.title+'</a> ';
		html.push(tmp);
	});

	$$("#tagsCloud").html(html.join(" "));
}



Grid.getTagList = function(){
	var tags = [];
	$$("#tagsList").find("input[type=hidden]").each(function(){
		this.value && tags.push(this.value);
	});
	return tags;
}

Grid.cloudInsertTag = function( tag_id ) {
	var val = $(this).text();
	if(_.contains(Grid.getTagList(), val)){
		return;
	}
	$$("#tagedit-input")
		.val(val).trigger("forceTransformToTag", [tag_id]);
}


// ==============================================================================================================
// SEARCH HELPERS
// ==============================================================================================================



Grid.sortBy = function( by ) {
	$(this).makeActive( true );
	Grid.resetGrid();
	Items.sort = by || "";
	Items.loadNext();
	wincache("grid-sort", by);
}


Grid.setPeriod = function( period ){
	var btn = $(this);
	if(Items.isBusy()) {

		// var _callback =  _.once(function (){
		// 	btn.unblockButton();
		// 	btn.makeActive(true);
		// 	Items.off("successLoad"  , _callback);
		// });

		// Items.on("successLoad", _callback);
		return false;
	} else {
		// btn.blockButton();
	}

	btn.makeActive(true);

	Grid.resetGrid();
	Items.query("period", period);
	$.cookie("RATING_ITEMS_PERIOD", period);
	Items.loadNext();

}


Grid.setType = function( type ){
	if(Items._loadingState) return;

	if( Items.type == type ) {
		Items.type = [0,1,2,3];
		$(this).siblings().addClass("active");
	} else {
		$(this).makeActive( true );
		Items.type = type || "";
	}
	//Items.type[type] = !!el.hasClass('active') && type;

	Grid.resetGrid();
	Items.loadNext();
}


Grid.insertNewsBlock = function( show ){
	/* Если с бекэнда пришла весточка о том что надо показать баннер*/
	if(!GRID_NEWS)
		return false

	if($("#news-block-grid").length ) {
		show && !$("#news-block-grid").data("hidden") && $("#news-block-grid").show().css("visibility", "visible");
		return false;
	}

	var block = $("<div id='news-block-grid' class='news-block-grid _clear'></div>");
	block.css("visibility", "hidden").show();
	block.html($("#ycm-news-banner").html());

	if( GRID_TYPE == GRID_TYPE_SMALL ) {
		Grid.columns[0].parent().prepend(block);
	} else {
		$("#container").prepend( block );
	}

	if( show )
		block.show().css("visibility", "visible");
}



if(GRID_TYPE == GRID_TYPE_SMALL) {
	Grid.insertItem = function( item, items ){

		var minheight = _.min( Grid.heights );
		var minindex = _.indexOf( Grid.heights, minheight );
		var view = (new Items.view({model : item}));

		view.renderTo(Grid.columns[minindex]);
		item._rendered = true;

		Grid.heights[minindex] += $(view.el).height();
	}
} else {
	Grid.insertItem = function( item ) {

		var view = (new Items.view({model : item}));
		view.render();
		item._rendered = true;

		// #hack
		// if(view.model.get("type") < 3) {
		// 	console.log("render", view.model.id)
		// 	Grid.updatePosition( view );
		// }
	}
}


Grid.insertItems = function( items ){
	_.each(items.models || items, function( item, index ){
		!item._index && (item._index = index);
		Grid.insertItem( item, items );
	});

}





Grid.onResize = function(){
	var filters = $$('#filters');
	var el = $("#container").children();
	var w = el.width();
	var colsCount = 1;

	if( colsCount == Grid.columns.length ) return;

	Items.removeRenders();

	//alert(colsCount)

	// reset arr
	Grid.heights = [];
	Grid.columns = [];
	el.children().remove();

	for( var i = 0; i < colsCount; i++ ) {
		Grid.heights[i] = 0;
		Grid.columns[i] = $("<div class='b-grid-column' id='b-grid-column"+i+"'></div>").appendTo( el );
	}

	Grid.insertItems( Items );
}










Grid.init = function(){

	if(GRID_TYPE == GRID_TYPE_SMALL) {
		Grid.onResize();
		$(window).resize(Grid.onResize);
	} else {
		Grid.insertNewsBlock();
	}

	APP.active("Grid");

	//$(function(){
		// var sort = wincache( "grid-sort" ) || "";
		// var period = wincache( "grid-period" ) || "";
		// Items.sort = sort;
		// Items.period = period;
		// $("#sort div.items-sorters a[data-param='"+sort+"']").makeActive( true );
		// $("#sort div.items-periods a[data-param='"+period+"']").makeActive( true );

		// Items.loadNext();
		// Grid.reset();
	//});
}();


Grid.on("change:enabled", function(){

	Items.loadNext();
	
})





// ==============================================================================================================
// NEWS BANNER CONTROL
// ==============================================================================================================



/*
 * Авто индексирование высоты каждой колонки с итемами
 */
if( Grid.columns.length && GRID_TYPE == GRID_TYPE_SMALL ) {
	setInterval(function(){
		_.each(Grid.columns, function( column, index ){
			Grid.heights[ index ] = column.height();
		});
	}, 100);
}




Grid.closeNewsBanner = function() {
	$.get("/closeNewsBanner");
	$("#news-block-grid").fadeOut(function(){
		$("#grid").removeClass("grid-with-banner");
		$$("#news-block-grid").remove();
	}).data("hidden", true);
}




/**
 *
 */
Grid.autoloading = function(){
	$$("#body").scroll(function(){
		if(!Grid.get("enabled")) return;
		($$("#body").scrollTop() > $$("#body").children(".test-content-inner").height() - $$("#body").height() - 500)
			&& Items.loadNext();
	});
}();


})(window.APP, window, document, window._, window.jQuery, window._gaq || []);
