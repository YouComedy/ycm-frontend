

;
(function( $, window, document, APP ){

	window._disablecmntatchmnt = 1;
	var colors = ["red", "blue", "green"], clrs = 0;
	var Grid = APP.ItemsViewer;
	var userScrolled = false;


	Grid.on("fullInit", function( historyLimiter ){

		var marker1 = cache.get("RECOMMEND_MARKER:" + APP.User.id);
		var marker2 = Grid.get("marker");

		if(!historyLimiter){
			Grid.off("fullInit");
			return false;
		}


		// console.log("#i" + Grid.Records.find(function(i){
		// 	return i.id == historyLimiter
		// }).id)

		Grid._bannerHeight = $("#recommend-banner").outerHeight(true);


		var Items = Grid.HistoryItems = new APP.collections.Items;
		Items.urlRoot = "/recommend/loadHistory";
		Items.limiter = historyLimiter;
		Items.view = Grid.Records.view;
		Items.off("successLoad");

		Items.on("successLoad", function(){

			Grid.IDS = _.union(Items.pluck("id"), Grid.IDS);

			var div = Items._div = $(document.createElement("div")).css({
				visibility : "hidden", position : "absolute",
				left : -3000,
				maxWidth : $.mainContainer.innerWidth()
				
			}).appendTo("body"), fragment = document.createDocumentFragment();


			_.each(Items.filter(function(i){return !i._rendered}),function(i){
				var view = (new Items.view({
					model : i,
					nocomments : true,
					recommendPage : true
				}));

				view.append = "prepend";
				view.container = fragment;
				// view.$el.css("borderLeft", "2px solid " + (colors[clrs%colors.length]));
				// view.render(Grid.get("itemsContainer"));
				view.render();
				fragment.appendChild(view.$el[0]);

				// var view = document.createElement("div");
				// view.style.height = "500px";
				// view.className = "panel item";
				// view.innerHTML = i.id + " " + i.get("content_username");
				// i._rendered = 1;
				// fragment.appendChild(view);

			});

			div.append(fragment);

			// console.log(div.children().length, $(fragment).children().length, $(div).height())
			var cur = $.win.scrollTop();

			var imgs = [];
			$.isIphone() && div.find("img").each(function(){
				imgs.push(this.src);
			});


			if( imgs.length ) {
				$.preloadImages(imgs, function(){
					Grid._prependItems(div)
				});
			} else {
				setTimeout(function(){
					Grid._prependItems(div);
				}, 333);
			}

			clrs++;
			// div.remove();

		});



		setTimeout(function(){

			var defaultScroll;

			if( marker1 || marker2 ) {

				var i = _.last(Grid.Records.filter(function(i){
					return i.get("item_id") == marker1 ||  i.get("item_id") == marker2;
				})) || {};

				// alert([marker2, marker1, i.id])

				if(i.id) {
					if( DEBUG ) { 
						alert([Grid.Records.lastIndexOf(i), Grid.Records.length])
					}
					// alert(i.id);
					var i2 = Grid.Records.at(Grid.Records.lastIndexOf(i) + 2) || {};

					if( i2.id ) {
						defaultScroll = $("#i" + i2.id).offset().top - 60; 
					} else {
						if( DEBUG ) {
							alert("no item")
						}
					}
				}
			} else {
				defaultScroll = 0;
				// defaultScroll = Grid._backOffset(2);
			}
			

			 

			$.mainContainer.scrollTop(defaultScroll);
			

			var scrolltimer;
		

			$.win.one("load.recommend", function(){
				
				$.mainContainer.on("scroll.recommend", function(){
					// clearTimeout(scrolltimer);
					// scrolltimer =  setTimeout(function(){
						userScrolled = true;
						$.mainContainer.off("scroll.recommend");
					// }, 55);
				});
				

				setTimeout(function(){

					if(!userScrolled) {
						$.mainContainer.scrollTop(defaultScroll);
					} else {
						if($.mainContainer.scrollTop() > defaultScroll)
							$.mainContainer.scrollTop(defaultScroll);
					}

				}, 55);
			});

			Grid.initBackScroll();

			userScrolled = $.isIphone(); //false;
		}, 120);





	});



	Grid._prependItems = function( div ) {
		var h = $(div).innerHeight();
		// $.blockBody("_block");
		var d = document.createElement("div");
		div.children().appendTo(d);
		d.style.minHeight = h + 'px';
		// d.style.overflow = 'hidden';
		if(DEBUG){
			d.style.background = colors[clrs%colors.length];
		}
		$(Grid.get("itemsContainer")).prepend(d);

		// div.children().each(function(){
		// 	$(Grid.get("itemsContainer")).prepend(this);
		// });

		// var c = $(Grid.get("itemsContainer"))[0];
		// c.insertBefore(fragment, c.firstChild);

		$.mainContainer.scrollTop($.mainContainer.scrollTop() + h - Grid._bannerHeight + 20); // 20 = margin top

		// $.unblockBody("_block");

		setTimeout(function(){
			div.remove();
			Grid.set("_historyBusy", false);
		}, 1000);

	}



	Grid._backOffset = function(i){
		return $$(Grid.get("itemsContainer")).children(":eq("+(i||2)+")").offset().top - 60
	}



	Grid.initBackScroll = function(){
		Grid.on("scroll", function( top ){
			if( userScrolled && top < 1500 ) {
				if(!Grid.HistoryItems.isBusy() && !Grid.get("_historyBusy")){
					Grid.set("_historyBusy", true);
					Grid.HistoryItems.loadNext();
				}
			}
		});

	}


})( this.jQuery, this, document, this.APP );
