;
(function( $, APP, _gaq ){


	var ITEM_TYPES = [undefined, "pic", "vid", "txt", "gif"];

	document.domain = document.domain;

	window.__APP_Attach_onComplete = function( resp ) {
		resp = $.exec(resp) || {};

		var view = VIEWS_INDEX[resp.content_id];

		if( resp.state && view ) {
			view.setAttachment( resp.attachment );
		} else {
			$.alertError( resp.error_text );
		}
	}

	var VIEWS_INDEX = {};
	var ITEM_VISIBLE_COMMENTS = 3;


	var lastActiveItem = APP.globals.lastActiveItem,
		lastActiveElement = APP.globals.lastActiveElement;


	var offsets_map = window.offsets_map = {},
		ids_map = window.ids_map = {},
		ids_index = window.ids_index = [],
		offsets_index = window.offsets_index =  [],
		views_index = [],
		heights_index = [],
		VIEW_SCORES = window.__VIEW_SCORE || 8,

		GA_index = APP.globals.GA_INDEX,
		HistoryViews = APP.globals.VIEWS_HISTORY;




	var ViewItemBig = APP.views.ItemBig = APP.views.ItemWithPopovers.extend({
		// @todo fix this workaround
		'className': "item",
		'template' : _.template("#item-big-new-tpl"),
		'ItemBig' : true,

		'events' : {
			'click [data-action]' : 'clickHandler',
			'click [data-vote]' : 'vote',
			'click [data-share]' : 'share',

			'keydown textarea' : 'addComment',

			"click [data-replyto]" : 'setReply',

			'click :submit' : 'addCommentFromBtn',
			'click [data-play]' : 'toggleVideoPlayer',

			'submit form[data-type=newcmt]' : "addCommentHandler",
			'submit form[data-type=attach]'  : "attachHandler",

			'click [data-next]' : 'goNext',
			'click [data-remove]' : 'removeItem',
			'click span[id$="-share"]' : 'GA__share',
			'click a.comments-toggler' : 'toggleComments',
			'click [data-addto]' : 'repost',

			'click .item__longpost' : 'showLongpost',
			"click [data-edit]" : "editItem"
		},


		"complainItem" : function( evt, btn ){

			if(!APP.User.id ) {
				window.authDialog(); //Необходима авторизация!
				return false;
			}

			APP.EditRepost.safecall("complainOpen", this.model);
			evt.preventDefault();


			// var self = this;
			// self.model.complain($(btn || evt.currentTarget).data("param"), function(){
			// 	$.alertOk("Жалоба отправлена!");
			// 	// self.itemMenuClose();
			// });



			// var tpl = _.template( "#dialog-user-reason-tpl" );
			// APP.Dialog.safecall("open2", {
			// 	title : "На что жалуемся?",
			// 	content : tpl(self.model.toJSON()),
			// 	class : "dialogMedium"
			// });

			return false;
		},


		"itemMenuClose" : function( evt ){
			var key = "_itemMenu", self = this;
			self.$el.removeClass('_itemMenu');
			self[key + "-t"] = setTimeout(function(){
				self[key] && self[key].empty();
				self[key] = null;
				delete self[key];
			}, 2E3);
			return false;
		},



		"itemMenu" : function( evt ){

			if( this.model.get("removable") && evt ) {
				return this.removeItem( evt );
			}

			var key = "_itemMenu", tpl = key + "-tpl", self = this;

			// self.$(".item__menuContent").height(self.$(".item__content").height());


			clearTimeout(self[key + "-t"]);

			if(!ViewItemBig[tpl])
				ViewItemBig[tpl] = _.template($("#item-big-menu-tpl").html());

			if(!self[key]) {
				self[key] = self.$(".item__menuContent").html(ViewItemBig[tpl](self.model.attributes));
				// self[key].on("click." + key)
			}

			self.$el.addClass('_itemMenu');

			return false;
		},




		"editDescription" : function( evt, targetElement ){

			// tag click protection
			if($(evt.target).is("a")) return true;

			var contentUserID = targetElement.attr('data-param');
			if( contentUserID == APP.User.id ) {

				return false;
			}
		},




		'setReply' : function(e){
			var el = $(e.currentTarget);

			// console.log( el );
			// При клике на ссылку мы переходим по ней
			// if( el.is("a") ||  el.is("img") )
				// return true;



			var parent = el.is(".comment") ? el : el.parents(".comment"),
				commentID = el.data("replyto"),
				// parent.attr("data-id"),
				commentModel = this.model.get("comments").get(commentID);

			if(!commentModel) return false;

			var username = commentModel.get("username"),
				reply_text = "@" + username + " (" + commentModel.get("fullname") + ")",
				input = this.$("textarea");


			if((input.val() || "").split("@" + username).length > 1)
				return false;

			var txt = [input.val(), reply_text, ' '].join('');
			input.val(txt).focus().setCursorPosition(txt.length);

			return false;
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

			APP.ItemsViewer.trigger("itemsChanged");

			return false;
		},

		'initialize' : function(){

			var item = this.model;
			VIEWS_INDEX["i" + item.id] = this;

			var events = {
				"change:userVote" : "userVoteChanged",
				"change:description" : "descriptionChanged",
				"popupClosed" : "closeVideoPlayer",
				"change:tags" : "tagsChanged"
			}, model = this.model, _this = this;

			_.each( events, function( fn, evt ){
				model.off( evt, _this[fn], _this );
				model.on( evt, _this[fn], _this );
			});

			var elem = $(this.el).attr("id", "i" + this.model.id );
			var t = this.model.get('type');
			elem.addClass('b-item-big_type_' + ITEM_TYPES[t]);


			if(this.model.get("userVote") < 0 ){
				elem.addClass('_hidden');
				this.dislikeVisible("add");
			}

			// Фикс яндексовского шера для попопа
			// в ситуациях когда 2 одинаковых элемента на странице
			// и в ленте и в попапе
			if(this.inPopup || this.options.inPopup){
				this.model.set('_sharePrefix', "p-");
			} else {
				elem.addClass('_inited');
			}
		},



		'renderPopupComments' : function( evt ){

			var self = this,
				container = self.$("[data-container='comments']"),
				btn = self.$(".item__showAllComments");

			var temp = $(document.createElement('div'));


			self.model.get("comments").each(function( cmt ){
				// cmt = cmt.cid ? cmt : new APP.models.Comment(cmt);
				// console.log(cmt, cmt.id, "xxxxxx")
				var view = new APP.views.CommentBig({model: cmt, append: "append", attachTPL  : "#comment-attach-tpl"});
				view.render(temp);
			});
			btn.remove();
			container.html(temp).after(APP.Template("#item-big-newcomment-tpl", self.model));
			APP.ItemsViewer.trigger("itemsChanged");
			self.initNewComment();
			return false;
		},



		'createEl' : function(){
			var elem = $(this.el)//.attr("id", "i" + this.model.id );
			var self = this, item = self.model;

			var __item = self.model.toJSON();
				// __item.cid = item.id;

				//
			elem.html(this.template( __item ));
			self.$el || (self.$el = elem);
			self.renderShares(self);

			if((self.inPopup || self.options.inPopup) ){
				//&& item.get("totalComments") > 3 && item.get("totalComments") != item.get("comments").length) {

				$$("#popup").find("ul.ui-autocomplete").remove();
				var commentsContainer = self.$("[data-container='comments']");

				if( item.get("comments").length == item.get("totalComments")) {
					self.renderPopupComments();
				} else {
					commentsContainer.block();
					item.fetchFullModel({
						success : function( data ){
							item.trigger('change:type');
							self.renderPopupComments();
							commentsContainer.unblock();
						}
					});
				}



			} else {
				self.renderTopComments();
			}


			if( !item.get("userVote") && !!item.get("rating_hide")){
				self.$el.addClass("_norating")
			}


			if( item.get("userVote") > 0 ) {
				self.$el.addClass("_liked");
			} else if(item.get("userVote") < 0){
				self.$el.addClass("_disliked");
				self.$el.addClass("_hidden");
			}



			// #hack
			!$.isIphone() && this.initPopovers();

			if( item.isVine() ) {
				self.$el.addClass("_vine");
			}

			return elem;
		},

		'render' : function(){
			var elem = this.createEl(), _this = this;

			this.model._rendered = true;
			var t = this.model.get('type');
			this.checkLongpost(t);

			if(this.model.has("widgetAfter")){
				this.$el.after($("#liked_user_recommend_second").show())
			}

			// console.log(this.container || this.options.container || "#container")

			$(this.container || this.options.container || "#container")[this.append || "append"]( elem );



			setTimeout(function(){
				APP.ItemsViewer.trigger("itemsChanged");
			}, 333);

		},

		'markAsViewed' : function(){
			// this.$("*").css("background", "red");
			// this.$el.off("mouseenter.once");
			this.model.markAsViewed();
		},





		'renderFollowBtn' : function(){
			var new_btn = $(APP.User.renderFollowBtn(this.model.get("followed"), this.model.get('user_id'), null, "float:right", this.model.id));
			$("#i" + this.model.id + "-fbtn").replaceWith( new_btn );
		},


		'renderShares': function(_this){
			var containerID = this.model.get('_sharePrefix') + 'ib' + _this.model.id + '-share',
				is_ready = $('#' + containerID).length;

			if (!is_ready){
				setTimeout(function(){
					_this.renderShares(_this);
				}, 100);
				return;
			}

			var title = 'Шутка от ' + _this.model.get("content_username");
			var type = _this.model.get('type');
			var description = '';
			var image = _this.model.get("big_image");

			if (type == 3){
				description = _this.model.get('content');
				image = _this.model.get('content_user_avatar');
			}

			APP.initSharing(containerID, {
				image : image,
				link : _this.model.shareUrl(),
				title : title,
				descr : description
			});
		},


		'initNewComment' : function(){
			var self = this,
				$textarea = self.$("textarea"),
				itemid = self.model.get("item_id"),
				id = self.model.id;


			!$.isIphone() && $textarea.one("focus", function(){
				$textarea
					.on("focus", function(){
						APP.ItemsViewer.trigger("itemsChanged");
					})
					// .height($textarea.height() * 2)
					.on("blur", function(){
						$textarea.trigger("keyup");
						APP.ItemsViewer.trigger("itemsChanged");
					})
					.applyPlugin("autoGrowTextarea", {'padding':'4px','minHeight' : $textarea.height() + 30});

				APP.Autocomplete.safecall("applyTo", {
					'el' : $textarea,
					'itemid' : itemid,
					'parent' : (self.inPopup || self.options.inPopup) ? '#popup' : ('#i' + id + '-acholder')
				});
			});


			if(!$.isIphone()){
				self.$("input:file").change(function(){
					$(this).parents("form").submit();
				});
			}
		},



		'renderComments' : function( evt ){
			var self = this,
				container = self.$("[data-container='comments']"),
				btn = $((evt || {}).currentTarget || self.$(".item__showAllComments"));

			if( self.model.get("totalComments") > self.model.get("topComments").length ) {

				evt !== true && container.block();

				var temp = $(document.createElement('div'));

				self.model.getAllComments(function( comments, item, noerror ){
					btn.remove();
					item.get("comments").each(function( cmt ){
						var view = new APP.views.CommentBig({
							model: cmt, append: "append",
							attachTPL  : "#comment-attach-tpl"
						});
						view.render(temp);
					});

					container.html(temp);
					if(!self._newcmnt) {
						container.after(APP.Template("#item-big-newcomment-tpl", self.model))
						self._newcmnt = true;
					}
					container.unblock();
					self.initNewComment();
					APP.ItemsViewer.trigger("itemsChanged");
				});

			} else {
				btn.remove();
				container.after(APP.Template("#item-big-newcomment-tpl", self.model));
				self.initNewComment();
				APP.ItemsViewer.trigger("itemsChanged");
			}
			return false;
		},

		'renderTopComments' : function( evt ){
			var self = this,
				container = self.$("[data-container='comments']");

			_.each(self.model.get('topComments'), function( cmt ){
				cmt = new APP.models.Comment(cmt);
				var view = new APP.views.CommentBig({model: cmt, append: "append", attachTPL  : "#comment-attach-tpl"});
				view.render(container);
			});

			APP.ItemsViewer.trigger("itemsChanged");
		},


		'showContents' : function(){
			this.$el.removeClass("_hidden");
			return false;
		},

		'dislikeVisible' : function( act ) {
			var el = this.$el;

			if( act === "add" ) {
				if (el.hasClass('_inited')){
					var scrollContainer = $.isIphone() ? "#body" : "body";
					var topFN = $.isIphone() ? "position" : "offset";
					$$(scrollContainer).animate({
						scrollTop: el[topFN]().top - $$("#menu").height()
					}, function(){
						el[act + 'Class']("_hidden");
					});
				} else {
					//	не показывем анимацию при загрузке страницы и в попапе
					el[act + 'Class']("_hidden");
				}
			} else {
				el[act + 'Class']("_hidden");
			}
			// el.find(".item__showAllComments")[act + 'Class']("_hide");
			// el.find(".item__comments")[act + 'Class']("_hide");

			APP.ItemsViewer.trigger("itemsChanged");
		},


		'userVoteChanged' : function(){
			var item = this.model,
				vote = item.get("userVote"),
				btns = this.$('[data-container="likes"] [data-vote]').add(".item__topLike [data-vote]", this.$el);

			var likes = this.model.get('rating');
			// var rating = item.get("likes") - item.get("dislikes");

			// console.log(likes, item.get("likes"), item.get("dislikes"), item.get("userVote"));

			this.$el.removeClass("_norating");

			if( vote > 0 ) {
				btns.filter('[data-vote="like"]').addClass("_active");
				btns.filter('[data-vote="dislike"]').removeClass("_active");
				this.$el.removeClass("_disliked").addClass("_liked");
				this.shareSelect();

			} else if( vote < 0 ) {

				btns.filter('[data-vote="like"]').removeClass("_active");
				btns.filter('[data-vote="dislike"]').addClass("_active");
				this.$el.removeClass("_liked").addClass("_disliked");
				this.closeVideoPlayer();

			} else {
				btns.removeClass( "_active" );
				this.$el.removeClass("_liked").removeClass("_disliked");
			}

			// if(  ) {
			var el = this.$el;
			if( vote >= 0 ) {
				this.itemMenuClose();
				this.dislikeVisible("remove");
			} else {
				var scrollContainer =  "#body";
				var topFN = "position";
				var self = this;
				$$(scrollContainer).animate({
					scrollTop: self.$el[topFN]().top - 20
					// - $$("#menu").height()
				}, function(){
					self.itemMenu();
				});

				// this.dislikeVisible("add");
			}


			this.$("[data-container='likes'] [data-likes-counter], .item__topLike [data-likes-counter]").text( likes );
			btns.filter('[data-vote="like"]').trigger("userVoteChanged");
		},


		'descriptionChanged' : function(){
			this.$('[data-prop="description"]').html(this.model.get("description"));
		},


		'vote' : function( e ) {

			if (!APP.User.id && $.isIphone()) {
				alert("Необходима авторизация!");
				return false;
			}

			var _this = this;
			if( _this._voteInProgress ) return false;
			_this._voteInProgress = true;
			var vote =  $(e.currentTarget).attr('data-vote') ;

			_gaq.push(['_trackEvent','Activity', capitaliseFirstLetter(vote), vote.toUpperCase()]);

			this.model[ vote ](function(data, err){
				if( err ) {
					$(e.currentTarget).removeAttr("title").removeAttr("data-original-title").errorTip({
						'title' : data.error_text,
						'hide' : 3000
					});
				} else {
					// $(e.currentTarget).makeActive( true );
				}
				_this._voteInProgress = false;
			});

			return false;
		},


		'share' : function( evt ){
			var _this = this,
				container = $("#i"+_this.model.id+"-share-container");

			// if( !_this._sharingTemplate ) {
			// 	_this._sharingTemplate = _.template($("#item-big-sharing-popover").html());
			// }

			if( !_this._sharingReady ) {
				_this._sharingReady = 1;
				APP.initSharing( 'i' + _this.model.id + '-share', {
					link : _this.model.shareUrl(),
					// image : _this.model.get("big_image"),
					// title : _this.model.get("title"),
					// descr  : _this.model.get("description"),
					onready : function(){
						_this.share( evt );
						_this._sharingReady = true;
					}
				});
				return false;
			}

			var btn = $(evt.currentTarget);
			btn.makeActive();

			// container.children(".alt").show();

			// Be sure that everything is rendered
			setTimeout(function(){
				_this.$("input[data-select]").trigger("click");
			}, 20);


			if( !this._sharingEvt ) {
				this._sharingEvt = true;
				var timer, tip = btn.find(".tip-content");
				btn.on("mouseleave", function(){
					timer = setTimeout(function(){
						btn.removeClass("active")
					}, 1333);
				}).on("mouseenter", function(){
					clearTimeout(timer);
				});

			}

			return false;

		},


		'shareSelect' : function( evt ) {
			this.$("[data-container='shareUrl']").select(); return false;
		},


		"addComment" : function( evt, yeap ){

			if(!APP.User.id ) {
				window.authDialog(); //Необходима авторизация!
				return false;
			}

			if( evt.type == 'keydown' && keyboard.toString(evt) == "shift+enter" ) {
				return true;
			}

			var self = this;

			if(yeap || keyboard.is("enter", evt)) {

				var textarea = $(evt.currentTarget);

				// hack for edit in place description
				if(textarea.is(".item__input"))  {

					// dummy object for model validation
					var testcomment = new APP.models.Comment({
						'text' : textarea.val(),
						'attachment' : self.$("input[name='attachment']").val()
					});

					// Display client-side validation errors
					testcomment.on('error', function(err){
						textarea.highlight('#E33E62', '#FFF', 300);
					});

					// Check the model
					return (testcomment.isValid()
						// Submitting form if ok
						? textarea.parents('form').submit()
						// Display err if not ok
						: testcomment.trigger("error")) && false;

				} else {
					return textarea.parents('form').submit();
				}
			}
		},


		"addCommentFromBtn" : function( evt ){
			evt.currentTarget = $(evt.currentTarget).parents("form").find("textarea");
			return this.addComment( evt, true );
		},


		"unsetAttachment" : function( attach ){
			var self = this,
				attachForm = self.$("form[data-type='attach']");

			attachForm.unblock().show();
			self.$("form[data-type='newcmt']").find("input[name=attachment]").val("");
			self.$("[data-container='attach-preview']").empty();

			attachForm.find("input[name='FileUpload[file]']").val("");
			attachForm.clearFields();
		},


		"setAttachment" : function( attach ){
			this._commentFormProgress = false;
			var attachHTML = APP.Template("#comment-attach-preview-tpl", attach);
			this.$("[data-container='attach-preview']").html( attachHTML );
			this.$("form[data-type='attach']").hide();
			this.$("form[data-type='newcmt']")
				.find("textarea").trigger("focus")
				.end()
				.find("input[name=attachment]").val( attach.id );
		},


		"attachHandler" : function( evt ){
			evt.preventDefault();
			var _this = this;
			// be sure that form is not in progress
			if( _this._commentFormProgress ) return false;
			_this._commentFormProgress = true;
			var $form = $( evt.currentTarget );
			$form.block().ajaxSubmitCustom( evt );
		},


		'addCommentHandler' : function( evt ){
			evt.preventDefault();

			var _this = this;

			// be sure that form is not in progress
			if( _this._commentFormProgress ) return false;

			// enable submit blocking
			_this._commentFormProgress = true;

			var $form = $( evt.currentTarget ),
				item_id = _this.model.id,
				item = _this.model;

			$form.block().ajaxSubmitCustom( evt, {

				'noreset' : true,

				'success' : function( data ){

					$form.unblock();
					$form.find("textarea").trigger("keyup").blur();

					_gaq.push(['_trackEvent','Activity','Comment','COMMENT']);

					data = $.exec( data ) || {};
					// Check if responseData is valid
					if( data && data.state === true ){
						var is_popup = _this.$el.parent('.popup-content-holder').length;

						$form.resetForm();

						// Try to create new object
						var new_comment = new Comment( data.comment );

						// Push it to the current item
						item.get("comments").add( new_comment );

						var view = (new window.CommentPopupView({
							model:  new_comment,
							attachTPL  : "#comment-attach-tpl"
						}));

						view.$el.addClass("comment");
						view.container = $("#i" + item_id + "-cmts");
						view.render("append");

						//$(view.el).highlight( null, '#fff', 2000);
						var totalComments = _this.model.get('totalComments') + 1;
						_this.model.set('totalComments', totalComments);

						if (!is_popup) {
							_this.$el.find('.comments-toggler').show().find('.toggler').text(totalComments);
							_this.$el.find('.full-comments').slideDown('slow');
						}

					} else {
						$form.find(":submit").errorTip({
							title : data.error_text,
							hide  : 2500
						});
					}
					// disable submit blocking
					_this._commentFormProgress = false;
				}
			});

			this.unsetAttachment();
		},


		'toggleGIFVideo': function(evt){
			var self = this;
			var video = self.$el.find('video')[0];

			if (!video.src){
				if (video.canPlayType('video/webm')){
					ext = '.webm';
					type = 'video/webm';
				} else if (video.canPlayType('video/mp4')){
					ext = '.mp4';
					type = 'video/mp4';
				}

				var source = self.model.get('gif_video');
				$(video).css('height', self.$(".item__contentImage").height());
				video.src = source + ext;
				video.play();

				setTimeout(function(){
					self.$el.addClass("b-item-big_type_vid_active");
				}, 100);
			} else if (!video.paused){
				video.pause();
				video.currentTime = 0;

				setTimeout(function(){
					self.$el.removeClass("b-item-big_type_vid_active");
				}, 100);
			} else {
				video.play();

				setTimeout(function(){
					self.$el.addClass("b-item-big_type_vid_active");
				}, 100);
			}

			return false;
		},

		"toggleVideoPlayer" : function( evt ){

			var self = this, item = self.model;

			evt.preventDefault();
			evt.stopPropagation();

			if (0 && self.model.get('gif_video') && APP.User.isModerator()) {
				self.toggleGIFVideo(evt);
				return false;
			}

			if(self._player_visible) {
				self.closeVideoPlayer();
				return false;
			}

			if( self.model.get("type") != APP.globals.TYPE_GIF && $.isIpad() ) {
				APP.views.ItemMobile.prototype.toggleVideoPlayer.call(self, evt);
				return false;
			}

			var btn = $( evt.currentTarget ),
				content = self.model.get("content"),
				container = self.$(".b-item-big__player");

			content = (content || "").replace(/[\&\?]hd(?:=\d+)?/, "");

			if(self.model.get("type") == APP.globals.TYPE_GIF) {
				var preview = self.$(".item__contentImage");
				self.$(".b-item-big__player")
					.css('min-height', preview.height());
			}

			container.html( content );
			self._player_rendered = true;

			if( !self._player_visible ) {
				self.$el.addClass("b-item-big_type_vid_active");
				self._player_visible = true;

				if(item.isVine()) {
					var ifr = container.find("iframe");
					ifr.one("ready", function(){
						var i = this;
						_.defer(function(){i.contentWindow.postMessage('unmute', '*');})
						// _.defer(function(){i.contentWindow.postMessage('play', '*');})
						// _.defer(function(){i.contentWindow.postMessage('pause', '*');})
						// _.defer(function(){i.contentWindow.postMessage('play', '*');})
						// this.setAttribute("frameborder", 0);
						this.className = "loaded unmuted";
					});
				}
			}

			return false;
		},

		"closeVideoPlayer" : function(){
			if( this._player_rendered && this._player_visible ) {
				this.$el.removeClass("b-item-big_type_vid_active");
				this._player_visible = false;
				this.$(".b-item-big__player").empty();
			}
		},

		'goNext' : function( evt ){

			evt && evt.preventDefault();

			var item = this.model;

			if( APP.ItemsViewer.IDS ) {
				var
					next_id = APP.ItemsViewer.IDS[_.indexOf(APP.ItemsViewer.IDS, item.id) + 1];
					// next_item = !!item.collection && item.collection.getNext( true ),
					// next_id =
					// (next_item || {}).id;

				if( next_id && (this.inPopup || this.options.inPopup)) {

					// try {
						var collection = item.collection || APP.globals.Items;
						var next_item = collection && collection.get(next_id);
						next_item && APP.Popup.open( next_item, true );
					// } catch(e) {}

				} else {

					var el = this.$el;
					var scrollContainer = "#body";
					var topFN = "position";

					// Можно в принципе сделать эти виличины высчитываемы, но пока в этом нет смысла.
					// Для десктопа  ёто 20 пикс из-за вернхнего паддинга контейнера + верхнего
					// отступа сайдбара
					var DESKTOP_MARGIN = 20;
					// Для мобилки, тк нет сайдбара это -20 пикс
					var MOBILE_MARGIN  = -40;

					item.markAsViewed();

					try {

						$( scrollContainer ).animate({
							scrollTop: $("#i" + next_id)[topFN]().top + ($.isIphone() ? MOBILE_MARGIN : DESKTOP_MARGIN)
							// - $$("#menu").height()
						});


					} catch( e ) {
						(this.inPopup || this.options.inPopup) && APP.Popup.close();
					};
				}
			}
			return false;
		},

		'removeItem' : function( evt ){
			// todo replace all the urls in links to url-generators in models
			var btn = $(evt.currentTarget), self = this;

			if(window.confirm("Вы уверены, что хотите удалить шутку?")){
				self.$el.block();

				this.model.remove(function(resp, item, state){
					self.remove();
					if( self.inPopup || self.options.inPopup ) {
						APP.Popup && APP.Popup.next();
						$("#i" + self.model.id).remove();
					}
				});
			}

			return false;
		},


		'GA__share' : function(){_gaq.push(['_trackEvent','Activity','Share','SHARE'])},


		'toggleComments' : function( evt ){
			this.$el.find('.full-comments').slideToggle();
			return false;
		},


		"_checkAuth" : function(){
			if( !APP.User.id ) {
				if($.isIphone())
					alert("Необходима авторизация!");
				else
					window.authDialog(); //Необходима авторизация!
				return false;
			}
			return  true;
		},


		'repost' : function( evt ){
			evt.preventDefault();
			if(this._checkAuth()){
				// APP.EditRepost.safecall("openRepost", this.model);

				if (this.$el.find('.item__add .item__buttonWrap').hasClass('_active')){
					if (confirm('Удалить репост шутки из вашей ленты?')){
						this.$el.find('.item__add .item__buttonWrap').removeClass('_active');
						$.get('/content/' + this.model.id + '/delete', function( data ){
							if( data.state ) {
								$.alertOk("Репост шутки удален!");
							} else {
								$.alertError(data.error_text);
							}
						});
					}
				} else {
					this.model.repost(function( data ){
						if( data.state ) {
							$.alertOk("Шутка добавлена к вам в ленту, ура!");
							$(evt.currentTarget).toggleClass("_active");
						} else {
							$.alertError(data.error_text);
						}
					});
				}
			}
		},


		"editItem" : function(){
			APP.EditRepost.safecall("openEdit", this.model);
			return false;
		},



		'localShare' : function( evt, element ){

			if (!APP.User.id) {
				if(!$.isIphone()){
					window.authDialog();
				} else {
					alert("Необходима авторизация!");
				}
				return false;
			}

			APP.localShare.safecall("open", {
				el : element,
				content_id : this.model.get("id")
			});
		},

		'clickHandler' : function(evt){
			var el = $(evt.currentTarget), act = el.attr('data-action');
			if(this[act]) {
				this[act](evt, el)
				return false;
			}
			return true;
		},


		'tagsChanged' : function(){
			var container = this.$(".item__tags").empty(),
				tags = this.model.get("tags");
			tags && tags.length && _.each(tags, function( tag ){
				container.append("<a class='item__tag' href='/tag/" + tag + "'>"+tag+"</a>");
			});
		}

	});


	// @todo вынести эту хрень в отдельный фйл
	if(APP.User.isModerator()) {
		_.extend(APP.views.ItemBig.prototype, {
			'moderateDemoteItem' : function(){
				if(!window.confirm("Забанить шутку?")) return false;
				var self = this;
				return APP.User.moderateDemoteItem(this.model.get("item_id"), function(){
					if(window._PAGE !== "moderator") return;
					self.model.collection.remove(self.model);
				});
			},

			'moderateRemoveItem' : function(){
				// if( window._PAGE === "moderator" ) {
				// 	return this.moderateRemoveItem2();
				// }
				var self =this;
				if(!window.confirm("Удаляем?")) return false;
				this.$el.block();
				var self = this;
				return APP.User.moderateRemoveItem(this.model.get("item_id"), function(){
					(self.options.inPopup || self.inPopup) && APP.Popup.close();
					$("#i" + self.model.id).remove();
				});
			},

			'moderateEditTags' : function(){
				//вызов диалога
				APP.EditRepost.safecall("moderateEditTags", this.model);
				return false;
			},

			'moderateRemoveItem2' : function(){
				var self = this;
				var elemid = "#dialog-moderate-reason-tpl";
				// if(!$(elemid).length) {
				// 	var self = this;;
				// 	$.ajax({
				// 		url : "/common/tpl/moderator.item.html",
				// 		dataType : 'text',
				// 		success : function( content ){
				// 			var div = $(document.createElement("div"));
				// 			div.html(content);
				// 			$$("body").append( div );
				// 			self.moderateRemoveItem2();
				// 		}
				// 	});
				// 	return false;
				// }
				var tpl = _.template( elemid );
				APP.Dialog.safecall("open2", {
					title : "Удалить шутку?",
					content : tpl(this.model.toJSON()),
					class : "moderatorDialog"
				});
				return false;
			},


			'moderateConfirm' : function(){
				var self = this;
				self.$el.block();
				$.get("/moderator/confirm/" + self.model.get("item_id"), function( data ){
					(self.options.inPopup || self.inPopup) && APP.Popup.close();
					self.model.collection && self.model.collection.remove(self.model);
				});
				return false;
			},


			'moderatePromoteItem' : function(){
				var self = this;
				self.$el.block();
				$.get("/moderator/promote/" + self.model.id, function( data ){
					(self.options.inPopup || self.inPopup) && APP.Popup.close();
					self.model.collection && self.model.collection.remove(self.model);
				});
				return false;
			}
		});
	}


	// --------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------
	// MOBILE VIEW
	// --------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------


	APP.views.ItemMobile = APP.views.ItemBig.extend({

		// 'tagName' : 'li',
		// 'className': 'item',
		// 'template' : _.template($("#item-mobile-tpl").html() || ""),

		'events' : {
			'click [data-action]' : 'clickHandler',
			'click [data-share]' : 'share',
			"click [data-replyTo]" : 'setReply',
			"click input[data-select]" : 'shareSelect',
			"click [data-addto]" : "repost",

			// 'click a[data-follow]' : 'follow',
			'click :submit' : 'addCommentFromBtn',
			'keydown textarea' : 'addComment',

			'click [data-play]' : 'toggleVideoPlayer',
			'submit form' : "addCommentHandler",
			'click span[id$="-share"]' : 'GA__share',
			'click a.comments-toggler' : 'toggleComments',
			"click .item__longpost" : "showLongpost",
		},

		// 'repost' : function( evt ){
		// 	APP.EditRepost.safecall("openRepost", this.model);
		// 	return false;
		// },

		// 'repost' : function( evt ){
		// 	evt.preventDefault();
		// 	if(this._checkAuth()){
		// 		APP.EditRepost.safecall("openRepost", this.model);
		// 		evt.preventDefault();
		// 	}
		// },



		'render' : function(){
			// console.log(this.container || this.options.container || "#container");
			var elem = this.createEl(), _this = this;
			$(this.options.container || this.container || "#container")[this.append || "append"]( elem );
			this.model._rendered = true;
			var t = this.model.get('type');
			this.checkLongpost(t);

			elem.one("mouseenter.once", function(){
				_this.markAsViewed();
			});
		},


		'updateCounter' : function( evt ){
			var textarea = $(evt.currentTarget);
			var count = 300 - textarea.val().length;
			var txtlen = count + ' ' + plural(count, ["символ","символа","символов"]);
			this.$('.comment-char-count').text(txtlen);
		},

		'clickHandler' : function(evt){
			var act = $(evt.currentTarget).attr('data-action');
			this[act] && this[act](evt);
			return false;
		},

		'toggleVideoPlayer' : function (evt) {
			var content = this.model.get("content") || "";

			if( this.model.get("type") == APP.globals.TYPE_GIF ) {
				APP.views.ItemBig.prototype.toggleVideoPlayer.call(this, evt);
				return false;
			} else {
				content = content.replace('c-cdn.coub.com/fb-player.swf?coubID=', 'coub.com/embed/');
			}

			var w = window.open(content.match(/src=["'](https?\:\/\/[^"']+)/)[1], "_fullvid");
			// var w = window.open("http://www.youtube.com/watch?v=" + this.model.get("content").match(/embed\/([^"']+)/)[1], "_fullvid");
			window.focus && w.focus();
			return false;
		},

		'openImgNewTab' : function(){
			var type = this.model.get("type"), url;
			if( type == APP.globals.TYPE_TXT ) return false;
			if( type == APP.globals.TYPE_VID ) url = this.model.get("content").match(/src=["'](http\:\/\/[^"']+)/)[1];
			else url = this.model.get("big_image");

			var w = window.open(url, "_fullimg");
			window.focus && w.focus();
			return false;
		},

		'openMobileBtns' : function(){
			var Btns = $$("#mobile-btns");

			Btns.html(stringTpl([
						'<a href="#" data-addto="{id}" class="mobile-button">Репостнуть шутку</a>',
						'<a href="{vkurl}" target="_blank" class="mobile-button">Поделиться Vk</a>'
						,'<a href="{fburl}" target="_blank" class="mobile-button">Поделиться Fb</a>'
						,'<a href="{eurl}" class="mobile-button">Поделиться Email</a>'
					].join(""), {
						'id' : this.model.id,
						'vkurl':  $.Share.urlVK(APP.get("url") + '/' + this.model.id),
						'fburl' : "http://www.facebook.com/sharer/sharer.php?src=sp&u=" + (APP.get("url") + '/' + this.model.id) + "&d=" + this.model.get("plain_description") + "&p=" + (this.model.get("small_image") || ""),
						'eurl': 'mailto:?subject=' +
							encodeURIComponent('Зацени шутку') + '&body=' +
							encodeURIComponent('Посмотри шутку, тебе понравится:\r\n\r\n' +
								(this.model.get('type') == APP.globals.TYPE_TXT ?
								this.model.get("content").replace(/<br \/>/g, '') + '\r\n\r\n' : '') +
								this.model.get('share_url'))
						// $.Share.urlFB(APP.get("url") + '/' + this.model.id)
					}));


			$.blockBody();

			Btns.show().children().attr('data-id', this.model.id);

			var self = this;
			Btns.one("click", "[data-addto]", function(evt){
				self.repost( evt );
				// APP.EditRepost.safecall("openRepost", self.model);
				closeBtns();
				return false;
			});

			var overlay = $(document.createElement('div')).css({
				'position' : 'fixed',
				'width' : '100%',
				'height' : '100%',
				'top' : '0', 'left' : '0',
				'z-index' : 9999
			}).insertBefore(Btns),

			closeBtns = function(){
			  	Btns.css("bottom", Btns.outerHeight( true ) * -1);
			  	$.win.off("scroll.removebtns");
		  		$.unblockBody();
		  		overlay.remove();
			  	setTimeout(function(){
			  		Btns.hide().empty();
			  	}, 400);
			}

			overlay.on("click", closeBtns);
			$("#body").on("scroll.removebtns", closeBtns);

			setTimeout(function(){
				$$("#mobile-btns").css("bottom", 0);
			}, 50);

			return false;
		},



		'toggleComments' : function( evt ){
			this.$el.find('.comments-wrap').slideToggle();
			var btn = $( evt.currentTarget );
			var toggler = btn.find('.comments-toggle').toggleClass('active');
			return false;
		}

	});





})(this.jQuery, this.APP, window._gaq || []);
