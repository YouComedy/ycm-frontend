
;
(function( $, window, document, APP ){


	// Quick refs
	var Profile = APP.Profile;


	var NewsModule = new APP.Module({
		'inited' : true,
		'name' : 'News',
		'autoload' : true
	});


	var lastSeen = window.__APP_Profile_News_lastSeen,
		classNamesMap = {
			'item_like': '_like',
	        // 'content_post': '_',
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

	var PopoversCache = {};

	var NewsView = Backbone.View.extend({
		'tagName' : 'li',
		'className' : 'newslist__item row-fluid',
		'template' : _.template($("#profile-news-tpl").html() || ""),
		'events' : {},

		'initialize' : function(){
			// this.model.off("change", this.update, this);
			// this.model.on("change", this.update, this);
			this.$el.attr('id', 'news' + this.model.id);
			if(this.model.get("moderator")){
				this.$el.addClass("_moderator");
			}

			this.$el.html(this.model.get("html"));

			if (!this.$("a[data-owner=Popup]").find('img').attr("src")
					&& !(this.model.get("action") == "user_follow" || this.model.get("action") == "user_registered")) {
						this.$el.addClass("_deleted")
			}
		},

		'setAttach' : function(){
			var elem = this.$el,
				attachContainer = elem.find("div[data-attach-imagesmall]");

			if( attachContainer.length && attachContainer.is(":empty") && this.options.attachTPL ) {

				var attachData = {
					small_image : attachContainer.data("attach-imagesmall"),
					id : attachContainer.data("attach-itemid"),
					big_image : attachContainer.data("attach-imagebig")
				}


				attachContainer.html(APP.Template(this.options.attachTPL, attachData));
			}
		},

		'render' : function(){
			this.setAttach();
			this.$el.addClass(classNamesMap[this.model.get("action")])
			$$("#profile-newslist").append(this.$el);

			var self = this;
			var item = this.model;
			var $el = this.$el;

			function regPopovers(){
				if ($.isIphone()) return;

				$el.find('[data-uidinfo]').each(function(){
					var link = $(this);
					var uid = link.attr('data-uidinfo');
					link.removeAttr('data-uidinfo').wrap('<span class="_relate" data-uidinfo="' + uid + '"></span>');
					if (link.hasClass('news_avatar-icon')) link.parent().addClass(link.attr('class'));
				});

				self.registerPopover("[data-uidinfo]", {
					// hideOnClick : true,
					placement : "in bottom",
					tpl : "#user-info-popover",
					item: item,
					hover : true,
					leave : true,
					click: false,
					hide : 333,
					url : function( btn ){
						return "/userpopover/" + $(btn).attr("data-uidinfo")
					}
				});
			}

			$el.find('.feed-multiple-show-all').on('click', function(e){
				var content = $(this);
				e.preventDefault();
				e.stopPropagation();

				$.get(content.attr('href'), function(resp){
					resp = $.exec(resp) || {};
					if (resp.users) {
						var span = $el.find('.feed-multiple-span');
						span.html(resp.users);
						regPopovers();
					}
				});
			}).on('touchstart', function(e){
				var content = $(this);
				e.preventDefault();
				e.stopPropagation();

				$.get(content.attr('href'), function(resp){
					resp = $.exec(resp) || {};
					if (resp.users) {
						var span = $el.find('.feed-multiple-span');
						span.html(resp.users);
						regPopovers();
					}
				});
			});

			regPopovers();

			if(lastSeen && lastSeen < +new Date(this.model.get("timestamp").replace(/-/g, '/').split('.')[0])) {
				this.$el.addClass('_new')
			}

			if (this.model.get("action") == 'badge_received') {
				var id = this.model.get('object_id');
				var title = this.$el.find('a.news_badge').html();
				var reward = this.$el.find('._hide.news_reward').html();
				var description = this.$el.find('._hide.news_description').html();

				this.$el.addClass('news_badge-' + id);
				this.$el.find('a').click(function(){
					!$.isIphone() && APP.NewBadges.safecall('showBadge', {
						id: id,
						title: title,
						description: description,
						reward: reward
					});
					return false;
				});
			}
		},

		'prepend' : function(highlight){
			this.setAttach();
			this.$el.addClass(classNamesMap[this.model.get("action")])
			$$("#profile-newslist").prepend(this.$el);

			if(highlight === true || (lastSeen && lastSeen < +new Date(this.model.get("timestamp").replace(/-/g, '/').split('.')[0]))) {
				this.$el.addClass('_new');
			}
		},


		'update' : function(){
			this.$el.html(this.template(this.model.toJSON()))
		},

		'registerPopover' : function(btn, o, undefined){
			var item = o.item || this.model, view = this,
				tpl = PopoversCache[o.tpl] || (PopoversCache[o.tpl] = _.template($(o.tpl).html()));

			return this.$( btn ).smartPopover({
				after : o.after,
				item : o.item,
				view : this,
				events : o.events,
				prevent : o.prevent !== undefined ? o.prevent : true,
				hideOnClick : o.hideOnClick !== undefined ? o.hideOnClick : false,
				url : o.url,
				hover: o.hover,
				hide: o.hide,
				leave : o.leave,
				placement :  o.placement || ("in " +  (this.ItemBig ? "top" : "bottom")),
				click  : o.click,
				content : function( data ){
					var tmp = item.toJSON();
					if( data ) {
						tmp.data = $.extend({}, data);
					}
					return tpl( tmp );
				},
				modify : o.modifyContent
			});
		}
	});


	var News = NewsModule.Records = new (APP.collections.Items.extend({

		'uid' : APP.User.id,

		'url' : function(){
			return '/feed?page=' + this.currentPage
                + "&limiter=" + (this.limiter || '' ) + "&filter=" + (this.filterBy || '' );
		},

		emptyElement : '#emptyItems',

		'model' : Backbone.BaseModel.extend({
			'initialize' : function(){
				//resp.object && (resp.object = new APP.models[resp.object_type]( resp.object ));
				var _this = this;
				_this.set("moderator", _this.get("action") === "sitemessage_sent");

				// if(this.get("object_type") == "Item") {
				// 	this.set("object", new APP.models.Item(this.get("object")));
				// 	this.view = function(){
				// 		return new NewsView({model : _this});
				// 	};
				// }

				// this.set("action_msg", actions_msgs_map[this.get("action")]);

				this.view = function(){
					return new NewsView({model : _this, attachTPL : "#comment-attach-tpl"});
				};
			}

		})
	}));

	News.on("itemsMissed", function(){
		$(this.emptyElement).show();
	})
	// .on("maxItems", function(){
	// 	$(this.emptyElement).show();
	// });


	News.filterBy = window.__APP_Profile_News_filterBy || "";


	NewsModule.setFilter = function( filter, evt ) {

		if( News.filterBy == filter || News.isBusy() )
			return false;

		evt && $(evt.currentTarget).parent().makeActive( true );
		News.resetAll();
		$$("#profile-newslist").empty();
		News.filterBy = filter;
		// News.limiter = false;
		// News.limiterClosed = false;
		// News.stop = false;
		// News._enableLoading = true;
		News.loadNext();
		setTimeout(function(){
			$("#panel-News .newslist-filter:has(a[data-param='"+News.filterBy+"'])").makeActive(true);
		}, 200);

		APP.go("/news/" + filter );
	}


	News.on("maxItems", function(){
		News.stop = true;
		News._enableLoading = false;
	});


	News.on("successLoad", function(){
		_.each(this.filter(function( record ){
			return !record._rendered;
		}), function( record ){
			var view = record.view();
			view.render();
			record._rendered = true;
		});
	});

	NewsModule.onPanelEnter = function(){
		!News.length && News.loadNext();
	}


	NewsModule
		.on("change:enabled", function(){
			News.loadNext();
		})
		.on("loadNext", function(){
			News.loadNext();
		});


	if(window.__APP_News_active) {
		NewsModule.active();
	}

})( this.jQuery, this, document, this.APP );
