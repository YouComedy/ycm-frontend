/**
 *
 */


;
(function( $, Backbone, window, _ ){




	// Const for Item content types
	var TYPE_IMAGE 	= 1,
		TYPE_VIDEO 	= 2,
		TYPE_TEXT 	= 3;



	window.APP.collections.Items = window.Collection.extend({

		'pages': null,
		'pagesRendered': false,

		'sort' : "",
		'tags' : "",

		'type' : [undefined,1,2,3],

		'search' : "",

		'urlRoot' : '/items/json/',


		'cloud' : null,


		emptyElement : "#emptyItems",
		seenElement : "#seenItems",


		'resetAll' : function(){
			this.reset();
			this.currentPage = 1;
            this.limiter = false;
            this.limiterClosed = false;
			this._enableLoading = true;
			this.sort = "";
			this.search = "";
		},


		'removeRenders' : function(){
			return this.each(function(i){
				i._rendered = false;
			});
		},


		'parse': function( resp ) {

			var self = this;

			// if( self.currentPage == 1 && (!resp || resp.items === 0 || resp.items === null || resp.items === undefined || !resp.items.length)) {
			// 	self.trigger("itemsMissed");
			// 	return null;
			// }

			// if( resp.limiterClosed ) {
			// 	self.trigger("maxItems");
			// 	return null;
			// }

            // if (resp.limiter) {
            //     if( resp.limiterClosed) {

            //         // self.onMaxItems && self.onMaxItems();

            //     }
            // } else {
            //     // if(resp.pages == resp.currentPage || resp.totalPages == resp.currentPage) {
            //     //     // self.onMaxItems && self.onMaxItems();
            //     //     self.trigger("maxItems");
            //     // }
            // }

			self.cloud = resp.cloud;

            self.limiter = resp.limiter || false;
			!self.pages && (self.pages = resp.pages);
			!self.pageSize && (self.pageSize = resp.pageSize);
			!self.totalItems && (self.totalItems = resp.totalItems);

			!self.items_count && (self.items_count = 0);
			self.resp_count = resp.items.length;
			self.items_count += self.resp_count;

			return resp.items;
		},

		'url': function(){
			var self = this;
			return self.urlRoot + (self.urlRoot.indexOf("?") > -1 ? "&" : "?") + 'page=' + self.currentPage + "&tags=" + self.tags
                + "&limiter=" + (self.limiter || '')
				+ "&sort=" + self.sort + "&rand=" + Math.random()
				+ "&type=" + (self.type == Number(self.type) ? self.type : _.compact(self.type))
				+ "&search=" + self.search;
		},

		'onSuccessLoad': function(){

			var _this = this;


			// Специальный рендер коллекции для динамической сетки
			if( _this.grid ) {

				// Из-за бага в бэкэнде, нельзя использя lastloadedItems, так как там появляются повторы
				// Значит надо собрать новый массив из неотрендерреных итемов
				//console.log( this.models )
				APP.Grid.insertItems(_this.filter(function(i){
					return !i._rendered
				}));

				if( GRID_TYPE == GRID_TYPE_SMALL && $("#grid").height() < $(window).height() ) {
					setTimeout(function(){
						_this.loadNext();
					}, 250);
				}

				this.trigger("renderSuccess");
				return;
			}

			var len = this.length, index = -1;

			_.each(_this.filter(function( item ){
				++index;
				return !item._rendered;
			}), function( item, index ){
				if( _this.view ){
					var view = new _this.view({
						model : item,
						container: _this.container || undefined
					});

					//view._total = ++len;
					//view._index = ++index;
					// console.log( index )
					view.render();
					item._rendered = true;

					item.view = view;
				}
			});

			this.trigger("renderSuccess");

		},


		'model': Item,


		'showNext' : function( event ){
			event && event.stopPropagation();
			var nextItem = this.getNext();
			this.nextAllCount() < 5 && this.loadNext();

			if( !nextItem ){
				APP.Popup.close();
			} else {
				window.APP.views.ItemGrid.prototype.itemPopup.call({model: nextItem});
				this.onSwitchNext && this.onSwitchNext();
			}
		},


		'showPrev' : function( event ){
			event && event.stopPropagation();
			var prevItem = this.getPrev();
			prevItem && window.APP.views.ItemGrid.prototype.itemPopup.call({model: prevItem});
		},


		'onSwitch': function(){
			this.nextAllCount() < 5 && this.loadNext();
		},


		'detectViewed' : function(){
			var self = this;

			var resetTimer = null;

			this.on("renderSuccess", function(){

				// clearTimeout(resetTimer);
				// resetTimer = setTimeout(function(){
				// 	APP.Grid.resetMonitoring();
				// }, 100);



				// self.each(function(item){
				// 	item.view.prepareMonitoring();
				// });



				// _.each(items, function( item ){
				// 	var _imgs = item.view.$("img[data-role='content']");
				// 	_imgs.length && (imgs = imgs.concat(_imgs.get()));
				// });

				// if( imgs.length ) {
				// 	$.preloadImages( imgs, function(){
				// 		alert("Detect all imgs")
				// 		_.each(items, function( item ){
				// 			item.view.prepareMonitoring();
				// 		});
				// 	});
				// } else {
				// 	alert("Detect all text items")
				// 	_.each(items, function( item ){
				// 		item.view.prepareMonitoring();
				// 	});
				// }

			});
		}


	});

})( jQuery, Backbone, this, _);