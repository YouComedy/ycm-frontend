
;
(function( $, APP, _gaq ){

	var DEFAULT_GRID_WIDTH = 198;
	var ITEM_TYPES = [undefined, "pic", "vid", "txt", "gif"];


	var PRELOADED_IMGS = APP.globals.PRELOADED_IMGS = {};
	var MARK_VIEWED_GRID_ITEMS = APP.globals.MARK_VIEWED_GRID_ITEMS;



	APP.views.ItemGrid = Backbone.View.extend({

		// Item's row container
		'tagName': "li",

		// compiling the template
		'template': _.template($( "#item-grid-tpl" ).html() || ""),

		// adding handlers
		'events' : {
			"click [data-popup]" : "openPopup",
			"mouseenter" : "preloadBigImg",
		 	"mouseleave" : "preloadStop",
		 	'click [data-action]' : 'clickHandler'
		},

		'preloadBigImg' : function(){

			var self = this;
			
			if( self.model.get("type") == APP.globals.TYPE_TXT ) return;

			var src = self.model.get("big_image");

			if( PRELOADED_IMGS[src] ) return;

			self._prealoadTimer = setTimeout(function(){
				var i = new Image;
				i.src = src;
				PRELOADED_IMGS[src] = true;
				self.$el.off("mouseleave mouseenter");
			}, 200);
		},

		'preloadStop' : function() {
			clearTimeout(this._prealoadTimer);
		},

		'clickHandler' : function(evt){
			var el = $(evt.currentTarget), act = el.attr('data-action');
			if(this[act]) {
				this[act](evt, el)
				return false;
			}
			return true;
		},

		'initialize' : function(){
			this.model.off("change", this.updateRender, this);
			this.model.on("change", this.updateRender, this);

			var orig_size = this.model.get('original_image_size');

			if( orig_size ) {
				orig_size = typeof orig_size == 'string'
					? orig_size.replace(/[\[\]]/g, "").split(',')
					: orig_size;
				this.model.set('thumb_height', Number(orig_size[1]) * (DEFAULT_GRID_WIDTH / Number(orig_size[0])));
			}

			if(window.user_last_subscr_ts && window.user_last_subscr_ts < this.model.get("content_numeric_timestamp")){
				this.$el.addClass("b-grid-item-new");
			}

			(window.MY_PROFILE || APP.User.isME(this.model.get("user_id"))) && this.$el.addClass("b-item-big_my_item");

			this.viewedChanged();

		},

		// opening popup on image clicking
		'openPopup': function(){
			if($.isIphone()) {
				window.open("/" + this.model.id, '_blank');
			} else {
				var self = this;
				if( self.get("totalComments") !== self.get("comments").length )
					APP.Popup.safecall("openByID", this.model.id);
				else
					APP.Popup.safecall("open", this.model);
			}
			return false;
		},


		'render': function( container ){
			var elem = $(this.el).attr("id", "ig" + this.model.id );
			elem.html(this.template(this.model.toJSON()));

			var t = this.model.get('type');

			elem.addClass(
				'b-grid-item_type_' + ITEM_TYPES[t]
			);

			// console.log(container || this.container || this.options.container || "#grid")

			this.model._rendered = true;
			$( container || this.container || this.options.container || "#grid" ).append( elem );
		},



		
		'updateRender': function( model, changes ){
			changes = (changes || {}).changes;

			var view = this;
			
			// $(this.el).html(this.template(this.model.toJSON()));
			var t = this.model.get('type');
			// this.checkLongpost(t);

			changes && _.each(changes, function( bool, prop ){
				var name = prop + 'Changed';
				view[name] && view[name](model, prop);
			});
		},
		
		'get' : function(){
			var elem = $(this.el).attr("id", "i" + this.model.id );
			elem.html(this.template(this.model.toJSON()));
			return elem;
		},

		// MODEL CHANGE HANDLERS


		'viewedChanged' : function(){
			if (MARK_VIEWED_GRID_ITEMS){
				if (this.model.get("viewed") || this.model.get("user_id") == APP.User.id){
					this.$el.removeClass('b-grid-item-new');
				}
			}
		},

		'userVoteChanged' : function(){
			var item = this.model,
				vote = item.get("userVote"),
				btns = this.$('[data-vote]');

			if( vote == 1 ) {
				btns.filter('[data-vote="like"]').parent().makeActive( true );
			} else if( vote == -1 ) {
				this.$('[data-vote="dislike"]').parent().makeActive( true );
			} else {
				btns.parent().removeClass( "active" );
			}

			btns.filter('[data-vote="like"]').trigger("userVoteChanged");
		}






	});


	APP.views.ItemGridMain = APP.views.ItemGrid.extend({
		'tagName' : 'div',
		'className' : 'b-grid-item',
		'template': _.template($("#item-grid-new-tpl").html() || "")
	});


})(this.jQuery, this.APP, window._gaq || []);
