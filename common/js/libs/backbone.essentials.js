
;
(function( $, Backbone, window ){


	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Model essentials
	////////////////////////////////////////////////////////////////////////////////////////////////////////


	/*
	 * item = new Item
	 * item.addViews({
	 * 		name1: viewConstruct1,
	 * 		name2: viewConstruct2
	 * });
	 *
	 *
	 *
	 * item.set("view", name1) ===
	 * 		item.unbind("change", item._activeView.updateRender);
	 * 		item._activeView = new _views( name1 )({model: item});
	 * 		item.bind("change", item._activeView.updateRender, item._activeView);
	 *
	 *
	 * item.render() ===
	 * 		item._activeView.render();
	 *
	 *
	 * item.render( name2 ) ===
	 * 		item.views[ name2 ].render();
	 *
	 * item.switchView( name ) ===
	 * 		this._activeView.destroy();
	 * 		this.set( "view", name );
	 *
	 *
	 */




	Backbone.BaseModel = Backbone.Model.extend({

		//
		'view' : null,


		'opts' : {},

		//
		'views' : {},

		//
		'activeView' : null,

		//
		'_initviews': false,

		//
		'setView' : function( view_name ) {

			if( this.get( 'view' ) )
				this.get( 'view' ).remove();

			this.set( 'view', new this.views[view_name]({model: this}));
		},


		// Add some views to the model
		// Vews is object/hash width name as key
		// and View Constructor refferene as value
		// By default the first view sets to default/active
		'addViews' : function( views ){
			var _this = this, active = false;
			_.each(views, function( view, name ){
				_this.views[ name ] = view;
				if( active === false ) {
					_this.activeView = view;
					active = true;
				}
			});
		},

		// By default any model has default or active view
		//
		'switchView' : function( view_name ){
			this.activeView.destroy();
			this.setView( view_name );
		},


		'getView' : function( view_name ) {
			return this.views[ view_name ];
		},


		'setView2' : function(){

		},



		'addView' : function( name, viewConstructor ){
			if( viewConstructor ) {
				this.views[ name ] = viewConstructor;
				//this.views[ name ].model || (this.views[ name ].model = this);
			} else {
				var viewCount = 0;
				for( var k in name ) {
					_.isFunction( name[k] ) && ++viewCount &&
						this.addView( k, name[k] );
				}

				if( viewCount == 1 ) {
					this.setView( k );
				}


				if(_.keys(name).length > 1 && !this['_initviews']) {
					this.on("change:view", function( model ){
						this.get( 'view' ).render();
					});
					this['_initviews'] = true;
				}


			}

			return this;
		},


		'render' : function( view, no_render ){
			view && this.setView( view );
			return this.get( 'view' ).render( no_render );
		},



		'fromForm': function( form ){

			var data = {};

			jQuery( form ).find( "[name]" ).each(function(){
				var input = $(this);
				data[ input.attr("name") ] = input.val();
			});


			for( var k in data ) {
				this.set( k , data[k] );
			}

		},


		/**
		 * .fetch analog, but with a little fixes
		 */
		'refresh' : function(){

		}

	});


	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Collection essentials
	////////////////////////////////////////////////////////////////////////////////////////////////////////


	/**
	 *
	 */
	var Collection = window.Collection = Backbone.BaseCollection = Backbone.Collection.extend({

		emptyElement : "#emptyItems",
		seenElement : "#seenItems",

		// query data
		'_query' : {},
		'query' : function(key, value, undefined){

			if(_.isObject(key)){
				for(var k in key)
					this._query[k] = (this.key[k] === false ? "" : this.key[k]);
				return this;
			}

			if(key === undefined){
				var ret = [];
				for(var k in this._query)
					ret.push(k + "=" + (this._query[k] === false ? "" : this._query[k]));
				return ret.join("&");
			}

			if(value === undefined){
				return this._query[key];
			}

			return (this._query[key] = (value === false ? "" : value));
		},



		'_lastLoadedItems' : [],


		//
		'currentIndex' : 0,



		//
		'loadBeforeLast': undefined,


		//
		'errorMap': {},



		//
		'_loadingState': false,



		//
		'_enableLoading': true,




		//
		'limit': 10,


		'currentPage' : 1,

        'limiter' : false,
        'limiterClosed' : false,


		//
		'offset': 0,


		//
		'sort' : "",

		//
		'period' : '',


		//
		'_history' : [],



		//
		//'_re'


		/**
		 *
		 */
		'_search' : function() {

		},



		'resetAll' : function(){
			this.reset();
			this.currentPage = 1;
            this.limiter = false;
            this.limiterClosed = false;
			this._enableLoading = true;
		},



		/**
		 *
		 */
		'initialize': function(){

			// this.currentPage = this.length > 0 ? 1 : 0;

			this.on('add', this['onAdd'] )
				.on('remove', this['onRemove'] )
				.on('switch', this['onSwitch'] )
				.on('busy', this['onBusy'] )
				.on('beforeLoad', this['onBeforeLoad'] )
				.on('afterLoad', this['onAfterLoad'] )
				.on('completeLoad', this['onCompleteLoad'] )
				.on('successLoad', this['onSuccessLoad'] )

				//.on('nextError', this['onNextError'] )
				//.on('prevError', this['onPrevError'] )
		},




		/**
		 *
		 */
		'onAdd': function(){},




		/**
		 *
		 */
		'onRemove': function(){},


		// '_reset' : function(){
			// Backbone.Collection.prototype.reset.apply( this, arguments );
		// },

		// 'reset' : function(){
			// this._reset( arguments );
			// alert(1)
		// },


		/**
		 *
		 */
		'onBusy': function(){},




		/**
		 *
		 */
		'onSwitch': function(){
			this['getCurrent']()['onSwitch'] ? this['getCurrent']()['onSwitch']() : this['getCurrent']().trigger( "switch" );
		},




		/**
		 *
		 */
		'canPrev': function(){
			return this['currentIndex'] - 1 > -1;
		},



		/**
		 *
		 */
		'canNext': function(){
			return this['currentIndex'] + 1 < this.length;
		},




		/**
		 *
		 */
		'isFirst': function(){
			return this['currentIndex'] === 0;
		},




		/**
		 *
		 */
		'isLast': function(){
			return this['currentIndex'] === this.length - 1;
		},



		/**
		 *
		 */
		'getCurrent': function(){
			return this.at( this['currentIndex'] );
		},



		'setCurrent': function(o){
			return (this.currentIndex = this.indexOf(o));
		},





		/**
		 *
		 */
		'nextAllCount': function(){
			return this.length - this['currentIndex'];
		},




		/**
		 * Collection.prototype.getPrevOrNext
		 * Calls the @direction named methods
		 * @param {string} direction - "Prev" or "Next"
		 * @param {bool} real - if false using index, if true - using history
		 */
		'getPrevOrNext': function( direction, force, undefined ){

			// if( !real ) {
				// Check if we can use prev or next item
				if( this['can' + direction ]() ) {

					// Fire switch event for the current item
					this.trigger( "switch" );

					var cur = this['currentIndex'];

					// Calculate next item's index using direction
					var next = cur + (direction == "Next" ? 1 : -1);
					// alert([this.currentIndex, next, this.length])

					if( force ) {
						this.currentIndex = next;
						return this.at(next);
					} else {
						return this.at( next );
					}


				} else {
						// alert(33333)
					// There are no items :(
					// Index is outside of collection
					this['on' + direction + 'Error']();
				}
			// } else {

			// }

			// No item found, return undefined
			return undefined;

		},



		/**
		 *
		 */
		'getPrev': function( force ){
			return this['getPrevOrNext']("Prev", force);
		},



		/**
		 *
		 */
		'getNext': function( force ){
			return this['getPrevOrNext']("Next", force);
		},




		/**
		 *
		 */
		'onPrevError': function(){},



		/**
		 *
		 */
		'onNextError': function(){},

		'isNotCorrupted': function( response ){
			return true;
		},


		'parse': function( response ){
			// var prop = this.dataField || 'items';
			var self = this;
			self.limiter = response.limiter || false;
			!self.pages && (self.pages = response.pages);
			!self.pageSize && (self.pageSize = response.pageSize);
			!self.totalItems && (self.totalItems = response.totalItems);
			return  self.dataField ? (response || {})[ this.dataField ] : response;
		},


		'isBusy' : function(){
			return this._loadingState === true;
		},



		'onBeforeLoad': function(){
			var self = this;
			$( self.loadElement || "#items-loader").show();
			$(self.seenElement).add(self.emptyElement).hide();
		},

		'onCompleteLoad' : function(){$(this.loadElement || "#items-loader").hide()},




		'loadFromUrl': function( url, data ){

			// Non-conflict cache
			var list = this,
				afterCallback = null;



			// Check if List is currently in busy state and break if it is.
			if( list['_loadingState'] === true ) {
				// Try to call busyCallback function
				list.trigger( 'busy' );
				// Cansel submitting
				return false;
			}

			// AJAX loading is disabled ?
			if( list._enableLoading === false ) {
				return false;
			}

			// data can be a function. Check it out
			if(_.isFunction( data )) {
				// If it is, set afterCallback
				afterCallback = data;
				// And clean the data
				data = null;
			}

			// Try to call beforeRequest callback
			list.trigger( 'beforeLoad' );

			// Set busy state to true
			list._loadingState = true;


			$.extend((data = data || {}), {
				page : list.currentPage,
				offset: list.offset,
				limit: list.limit,
				limiter: list.limiter || ""
			});

			$.extend(data, list._query);


			// Make an AJAX request
			$.ajax({

				// Default method
				'type': 'get',

				// Parse url string
				'url': (_.isFunction( list.url ) ? list.url() : list.url),

				// data || list object converted to string
				// List object must have the correct method .toString!
				// 'data': data || ((list + "") + list.query()),
				'data': data || (list+""),

				'dataType' : 'json',


				// Every request callback
				'complete': function( response ){
					// Remove busy state from List
					list._loadingState = false;
					// Try to call onComplete callback
					list.trigger( 'completeLoad' );
				},


				// onError callback
				// Call when something goes wrong
				'error': function(a ,b, c ){

					// Try to call onError callback
					list.trigger( "errorLoad", a, b, c);

					// Debug info
					console.error( "There are some problems while loading List#" );
					console.log( a,b,c );

				},



				// onSuccess callback
				// Everything is going to be amazing
				'success': function( response ){




					// call request handler with after callback function
					//list._responseHandler( response, afterCallback, updateObject );

					// Check the response state with custom checker
					if( list.isNotCorrupted( response ) ) {

						list._lastLength = list.length - 1;

						// fix response (convert list of JSON objects to this.builder() objects)
						var newdata = _.map(list.parse( response ), function( obj ){
							var i = new list.model( obj );
							i.opts = list.model_options || {};
							return i;
						});

						// Pushing new recieved data to our collection
						list.add( newdata );

						// Pushing new data refference as last loaded obj
						list._lastLoadedItems.push( newdata );

						// after callback fires with new items
						afterCallback && afterCallback.call( list, list.models );

						// If autoRender property -> go and render all
						list.autoRender && list.renderAll();
					}

					// Check the condition to disable new ajax loadings
					if( list.stopLoadingOn(response) ) {
						list._enableLoading = false;
					}

					// Increasing offset by limit
					list.offset += list.limit;
					list.currentPage++;

					// Try to call onSuccess callback
					list.trigger( 'successLoad' );
				}

			});
		},





		/**
		 *
		 */
		'lastLoadedItems': function(){
			return _.last( this._lastLoadedItems );
		},



		'stopLoadingOn': function( resp ){

			resp = $.exec( resp ) || {};
			var prop = this.dataField || 'items', self = this, flag = false;

			if(
				self.currentPage == 1
				&& (
					!resp
					|| !resp[prop]
					|| resp[prop] === 0
					|| resp[prop] === null
					|| resp[prop] === undefined
					|| !resp[prop].length
				)
			) {
				self.trigger("itemsMissed");
				flag = true;
			}

            if ( resp.limiter || resp.limiterClosed ) {

            	if( resp.limiterClosed ) {
        			self.trigger("maxItems");
        		}

                return (resp || {}).limiterClosed;
            }

			if (flag) return true;

            if(!!resp.error_text)
            	return true;

			return ((resp || {}).currentPage >= resp.pages || resp[prop] === 0 || (resp[prop] && !resp[prop].length)) || (resp || {}).currentPage >= resp.totalPages;
		},




		/**
		 *
		 */
		'renderAll': function( from, to, view, undefined ){

			var _this = this, len = _this.length;
			//setTimeout(function(){
				_.each(_this.filter(function( item ){
					return !item._rendered;
				}), function( item ){
					if( _this.view ){
						var view = new _this.view({model : item, container : _this.viewContainer});
						_this.viewContainer && (view.container = _this.viewContainer);
						view.render();
						item._rendered = true;
					}
				});
			//}, 250);

		},




		/**
		 *
		 */
		'renderAllNext': function(){
			this['renderAll']( this.offset  )
		},


		'renderAllPrev': function(){

		},

		'pushAll': function(){

		},


		'loadNext': function( callback ){
			this['loadFromUrl']( callback )
		}


	});






	Backbone.BaseView = Backbone.View.extend({
		'initialize' : function( opts ){
			this.delegateEvents(_.extend({
				"click [data-action]" : "_actionHandler"
			}, opts.events));

			this.onInit && this.onInit( opts );
		},


		'_actionHandler' : function( evt ){
			var el = $(evt.currentTarget), act = el.attr('data-action');
			if( evt.type === "submit" ) {
				// el.ajaxSubmitCustom()
			} else if(evt.type === "click") {

			}
			if(this[act]) {
				evt.preventDefault();
				return this[act](evt, el);
			}
			return true;
		}
	});






})( jQuery, Backbone, this );
