

;
(function( $, APP, _ ){


	// Views / Module vars
	var POPUP_CONTENT_TPL = "#item-big-new-tpl";

	// Легко может получиться так что вьха будет загружена в тот момент когда
	// на странице не будет необходимого шаблона
	// if( !$(POPUP_CONTENT_TPL).length ) {
	// 	var fn = arguments.callee;
	// 	window.setTimeout( fn, 33);
	// 	return ;
	// }

	// APP.Popup.on("change:inited", function(){
	// 	APP.views.ItemPopup_content.prototype.template = _.template($(POPUP_CONTENT_TPL).html())
	// });


	var MARK_AS_VIEW_TIMER = null;


	// ------------------------------------------------------------------------------
	// Вьюха заголовка попапа


	// ------------------------------------------------------------------------------
	// Вьюха контентной части попапа, на базе вьюхи ленты
	APP.views.ItemPopup_content = APP.views.ItemBig.extend({
		className : 'item',
		template : _.template($(POPUP_CONTENT_TPL).html() || ""),
		'template_likes' : _.template($("#item-big-likes-new-tpl").html() || ""),
		inPopup : true
	});


	// ------------------------------------------------------------------------------
	// Общая вьюха


	APP.views.ItemPopup = Backbone.View.extend({

		// Шаблон заголовка попапа
		template_title: _.template($( "#item-popup-title-tpl" ).html() || ""),
		// Шаблон

		// Events
		'events' : {
			'hover #popup-buttons' : 'showControls',
			'mouseleave #popup-buttons' : 'hideControls'
		},

		'initialize' : function(){
			// if(this.options.moderation){
			// }
		},

		'hideControls' : function(){
			$("#popup-buttons").removeClass('popup__buttons_visible');
		},


		'showControls' : function(){
			$("#popup-buttons").addClass('popup__buttons_visible')
		},


		'render': function() {



			clearTimeout(MARK_AS_VIEW_TIMER);

			var item = this.model;

			$("#popup").removeAttr('class');

			if( this.model.get("type") == APP.globals.TYPE_TXT )
				$("#popup").addClass('popup_type_txt');


			var container = $("#popup")
			// .find(".popup-content-holder");//.empty();

			// container.attr("id", "p" + this.model.id);


			APP.globals.lastActiveItem = this.model;


			// Пользователь открыл попап в первый раз, и в нем еще нет никакого контента
			// if(container.is(":empty")){

			// HACK: модель в попапе отдает false для своих итемов, поэтому делаем
			// доп. проверку перед рендеригом итема
			if(this.model.get("content_user_id") == APP.User.id)
				this.model.set("editable", true);

			this.renderItem( container );
			// } else {
				// this.replaceItem();
			// }


			var img_size = this.model.get('image_size');
			var item_max_width = 600;
			var gif_max_height = 500;

			if (this.model.get('type') == '4' && !$.isIphone() && (item_max_width / img_size[0] * img_size[1] > gif_max_height)){
				this.$el.addClass('_long');
			}


			// APP.Popup.set("itemID", this.model.id);
			this._rendered = true;

			var t = this.model.get('type');
			this.checkLongpost(t);

			// Show comments
			// this.$('.comments-toggler').trigger('click');

			// if(APP.User.isModerator()) {
			// 	var mtpl = APP.Template("#item-big-moderate-tpl", {});
			// 	this.$(".item__top").prepend(mtpl);
			// }


			try {
				// console.log(item.collection)
				if(item.collection) {
					item.collection.setCurrent(item);
					// После отрисовки попапа, делаем предзакгрузку следующего итема
					var nextItem = item.collection.getNext();
					nextItem && ((new Image).src = nextItem.get("big_image"));
				}
			} catch(e) {
				// console.log(e )
			}

			var _thisView = this;

			APP.go(_thisView.model.get("share_url").replace(/^.+youcomedy.me/, ''));


			//
			MARK_AS_VIEW_TIMER = setTimeout(function(){
				APP.Stat.pushItemView(item.get("item_id"), '/popupView/' + item.id);
				// item.markAsViewed({
				// 	context : "popup"
				// });
			}, 400);




			this.model.set("viewed", 1);

		},

		'replaceItem' : function(){

		},



		'renderItem' : function( container ){
			// this.$el.html(this.template(this.model.toJSON()));

			var self = this,
				testview;

			testview = new (self.options.view  || APP.views.ItemPopup_content)({
				model: self.model
			});

			// Be sure that view know where it is
			testview.inPopup = true;

			var itemElement = testview.createEl();
			container[this.options.renderType || "html"]( itemElement );

			this.$el = itemElement;

			// this.el.html( "ыыыы" );
			itemElement.makeActive( true, "_active");
		},


		'renderComments' : function(){
			var comments = this.model.get("comments");
			comments && !_.isEmpty(comments) && comments.each(function(comment){
				//console.log( comment.id )
				//console.log($('#popup div.comments > ul')[0])
				(new CommentPopupView({model: comment}));
				var view = (new CommentPopupView({model: comment}));
				view.container = $(".basecomments ul", this.el);
				view.render( "append" );
				//$("#comments-list").append(tpl(comment.attributes));
			});
		},


		'renderTitle' : function(){
			APP.Popup.$.title.html( this.template_title(this.model.toJSON()) );
		},



		'updateRender': function(){

			$(this.el).html(this.template(this.model.toJSON()));

			// Render title with like buttons
			this.renderTitle();

			// Render item's comments
			this.renderComments();

			// Render item's comments
			this.renderRemixes();
		},


		'like': function( e ){
			var item = this.model, tpl = this.template;
			this.model.get("vote").like(function( data, err ){
				if( err ) {

					$(e.currentTarget).errorTip({
						title : data.error_text,
						hide: 1000
					});
				}
			});
			return false;
		},



		'dislike': function( e ){
			var item = this.model, tpl = this.template;
			this.model.get("vote").dislike(function(data, err){
				if( err ) {
					$(e.currentTarget).errorTip({
						title : data.error_text,
						hide: 1000
					});
				}
			});
			return false;
		},


		'renderFollowState' : function(){

			var f = this.model.get("followed");
			var btn = $("#if" + this.model.id);

			if( !f ) {
				btn.attr("href", btn.attr("href").replace("unfollow", "follow")).children().text("Подписаться");
			} else {
				btn.attr("href", btn.attr("href").replace("follow", "unfollow")).children().text("Отписаться");
			}
		},

		'checkLongpost': function(t){

			var frame;
			var item_max_width = 700;
			var gif_max_height = 500;
			var longpost = this.$('.item__longpost');
			var content_h = 0;
			var img_size = this.model.get('image_size') || [1,1];

			switch(t){
				case '1':
					frame = this.$('.item__content');
					content_h = item_max_width / img_size[0] * img_size[1];
					break;
				case '3':
					frame = this.$('.item__content');
					content_h = this.$('.item__content').text().length / 2;
					break;
				case '4':
					if (!$.isIphone() && (item_max_width / img_size[0] * img_size[1] > gif_max_height)){
						this.$el.addClass('_long');
					}
			}

			if (content_h > 800){
				content_h = 400;
				frame.height(content_h);
				this.$el.addClass('_longpost');
				longpost.show();
			}
		},

		'showLongpost': function(){
			var t = this.model.get('type');
			var frame;
			var longpost = this.$('.item__longpost');

			switch(t){
				case '1':
				case '3':
					frame = this.$('.item__content');
					break;
			}

			longpost.hide();
			this.$el.removeClass('_longpost');
			frame.css({height: 'auto'});

			return false;
		}

	});


})( this.jQuery, this.APP, this._ );
