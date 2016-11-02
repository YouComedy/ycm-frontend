/**
 *
 */

(function( $, Backbone, window, _, undefined ){


	// Const for Item content types
	var TYPE_IMAGE 	= 1,
		TYPE_VIDEO 	= 2,
		TYPE_TEXT 	= 3,
		TYPE_GIF	= 4;


	// Название поля для поповера, которые появляется
	// на какое-то действие с бэкэнда
	var popoverFieldName = "popover";




	var Comment = window['Comment'] = APP.models.Comment = APP.models.Votable.extend({

		'urlRoot' : '/comments',

		'url' : function(){
			return this.urlRoot + "/" + this.id
		},

		'deleteUrl' : function(){
			return this.url() + '/delete'
		},

		'defaults' : _.extend({}, APP.models.Votable.prototype.defaults, {
			'text' : "",
			'userAvatar' : "",
			'name' : "",
			'item_id' : 0,
			'points' : 0,
			'username' : "",
			'timestamp' : '',
			'fullname' : "",
			'attachment' : 0
		}),


		'validate' : function( attrs ){
			attrs = attrs || this.toJSON(), text = attrs.text;

			if(/^\s*$/.test(text) && !attrs.attachment)
				return "empty msg";

			// Текст комментария не может быть менее одного слова, отсутствовать или состоять только из пробелов
			// if(!text || text.split(/\s+/).length < 1 || /^\s+$/.test(text))
			// 	return "empty msg";
		},

		'initialize': function(){
			var self = this;
			self.set("voteUrl", self.url());
			self.set("moderator", self.get("username") === "Moderator");

			// #timestamp
			// Если очень припрет, можно (а мб и нужно) вынести
			// преттидейт в шаблон, в качестве фильтра. Пока не мешает.
			// Припереть может, например, при реалтайм апдейте даты во вьюхе или типа того
			var timestampProp;
			if( (timestampProp = self.get("numeric_timestamp") || $.isNumeric(self.get("timestamp")) && self.get("timestamp")) ) {
				self.set("timestamp", prettyDate(timestampProp, true));
			}
		},

		'render' : function(){
			return (new CommentPopupView({model:this})).render();
		}

	});


	var CommentsCollection = APP.collections.Comments =  Collection.extend({
		'model': Comment,
		/*'initialize' : function( undefined, item ){
			this.on("add", function( comment, comments ){
				//comment.set("item_id", comments.item_id );
				// comment.collection = comments;
				// autorender === true && (new CommentPopupView({model: comment})).render();
			});
		},*/
		'onSuccessLoad' : function(){
			var _this = this;
			setTimeout(function(){
				_.each(_this.filter(function( comment ){
					return !comment._rendered;
				}), function( comment ){
					(new CommentPopupView({model : comment})).render("append");
				});
			}, 250);
		},
		'update' : function(){
			//.set("totalComments", Number(this.item.get("totalComments")) + 1 );
		}
	});


	var CommentPopupView = window.CommentPopupView = APP.views.CommentBig = Backbone.View.extend({

		'tagName' :  'div',
		'className' :'comment',

		'events' : {
			'click [data-vote]' : 'vote',
			'click a[data-remove]' : 'remove',
			'click a[data-fuck]' : 'toggleFuck',
			'click .comment-content' : 'mobile_CommentLikes',
			// 'click [data-replyTo]' : 'setReply'
		},


		'template' : _.template($("#comment-popup-tpl").html() || ""),

		'initialize': function(){


			var events = {
				"change:userVote" : "userVoteChanged",
				"change:error" : "onError",
				// "change" : "updateRender"
			}, model = this.model, _this = this;

			_.each( events, function( fn, evt ){
				model.off( evt, _this[fn] );
				model.on( evt, _this[fn], _this );
			});

			// this.model.off("error", this.onError, this);
			// this.model.on("error", this.onError, this);
			// this.model.off("change", this.updateRender, this);
			// this.model.on("change", this.updateRender, this);

			if(APP.User.isME(this.model.get("user_id")) || APP.User.isModerator()) {
				this.$el.addClass("my_comment")
			}

			this.$el.attr('data-id', this.model.id);


			if(this.model.get("moderator")){
				this.$el.addClass("_moderator");
			}

		},



		'userVoteChanged' : function(){
			var comment = this.model,
				vote = comment.get("userVote"),
				btns = this.$('[data-vote]');

			var likes = this.model.get('likes') - this.model.get('dislikes');

			// alert(likes)

			if( vote > 0 ) {
				btns.filter('[data-vote="like"]').addClass("_active");
				btns.filter('[data-vote="dislike"]').removeClass("_active");
				// likes++;
				// this.$("[data-likes-counter]")
			} else if( vote < 0 ) {
				btns.filter('[data-vote="like"]').removeClass("_active");
				btns.filter('[data-vote="dislike"]').addClass("_active");
				// likes--;
			} else {
				btns.removeClass( "_active" );
			}

			// alert(likes + Number(vote))

			this.$("[data-likes-counter]").text(likes || "")[ likes != 0 ? 'show' : 'hide' ]()
				.removeClass("_plus").removeClass("_minus")
				.addClass( likes > 0 ? '_plus' : '_minus' );
		},



		'render' : function( container, isnew ){
			//console.log( $('#popup div.comments > ul')  )

			var scroll = false;

			if( container === true ) {
				container = null;
				scroll = true;
			}

			var append = container === "append";
			if( append ) container = null;

			container = $( container || this.container );

			var elem = this.updateRender();


			var attachContainer = elem.find("div[data-attach-imagesmall]");
			var attachTPL = this.options.attachTPL || this.attachTPL;

			if( attachContainer.length && attachContainer.is(":empty") && attachTPL ) {

				var attachData = {
					small_image : attachContainer.data("attach-imagesmall"),
					id : attachContainer.data("attach-itemid"),
					big_image : attachContainer.data("attach-imagebig")
				}


				attachContainer.html(APP.Template(attachTPL, attachData));
			}

			container[ this.options.append || (append ? 'append' : 'prepend') ]( elem );


			if($.isIphone()) {
				elem
					.find("a[role=button]")
					.removeAttr("data-owner")
					.removeAttr("data-action")
					.removeAttr("role")
					.attr("target", "_blank")
			}

		},


		'prepend' : function(){
			var container = $( this.container );
			var elem = this.updateRender();
			container.prepend( elem );
		},

		'updateRender' : function(){
			//console.log(this.model)
			var elem = $( this.el );

			// this.model.set("dislikes", 140);

			if( !elem.is(":empty") && $.isIphone() ) {

				elem.html(this.template(this.model.toJSON()));

			} else {

				elem.attr("id", "cmt" + this.model.id );
				//console.log(this.model.toJSON())
				elem.html(this.template(this.model.toJSON()));

			}



			if(this.model.get("likes") - this.model.get("dislikes") <= -3) {
				var badhtml = '<a href="#" data-fuck="1" class="remark comment__fucktoggle">Этот комментарий набрал слишком много дислайков. <span class="link">Все равно прочитать</span></a>';
				elem.addClass("_fucked");
				if($.isIphone()) {
					elem.append( badhtml );
				} else
					elem.find(".comment__likes").append( badhtml )
			}

			return elem;
		},

		'toggleFuck' : function(){
			this.$el.removeClass("_fucked");
			return false;
		},


		'like' : function( e ){
			if (!APP.User.id) {
				if(!$.isIphone()){
					window.authDialog();
				} else {
					alert("Необходима авторизация!");
				}
				return false;
			}

			var _this = this;
			if( _this._voteInProgress ) return false;
			_this._voteInProgress = true;
			this.model.like(function(data, err){

				// data[popoverFieldName] && APP.trigger("itemPopover", {
				// 	item : _this,
				// 	popover: data[popoverFieldName]
				// });


				if( err ) {
					$(e.currentTarget).errorTip({
						title : data.error_text,
						hide: 1000
					});
				}
				_this._voteInProgress = false;
			});
		},

		'dislike' : function( e ){
			if (!APP.User.id) {
				if(!$.isIphone()){
					window.authDialog();
				} else {
					alert("Необходима авторизация!");
				}
				return false;
			}

			var _this = this;
			if( _this._voteInProgress ) return false;
			_this._voteInProgress = true;
			this.model.dislike(function( data, err ){

				// data[popoverFieldName] && APP.trigger("itemPopover", {
				// 	item : _this,
				// 	popover: data[popoverFieldName]
				// });

				if( err ) {
					$(e.currentTarget).errorTip({
						title : data.error_text,
						hide: 1000
					});
				}
				_this._voteInProgress = false;
			});
		},

		vote: function( e ){
			e.preventDefault();
			this[$(e.currentTarget).attr('data-vote')]();
			return false;
		},


		'remove' : function(){
			if(!confirm("Вы уверены, что хотите удалить комментарий?")) return false;

			var id = this.model.id;

			// #hack
			// if(APP.User.isModerator()){
			// 	APP.User.moderateRemoveComment(id, function(){
			// 		$("#cmt" + id + ",#c" + id).remove();
			// 	});
			// 	return false;
			// }

			var el = this.el, model = this.model;
			var item = this.$el.parents('.b-item-big');

			$("#cmt" + id + ",#c" + id).remove();

			$.get(this.model.deleteUrl(), function( data ){
				data = $.exec( data );
				if( data && data.state === true ) {
					$( el ).remove();
					model.collection.remove( model );
					$.alert("Комментарий удален");

					if (item.size()){
						var comments_toggler = item.find('.comments-toggler');
						var counter = comments_toggler.find('.toggler');
						var totalComments = parseInt(counter.text(), 10) - 1;

						counter.text((totalComments || 0));
						if (!totalComments){
							item.find('.b-item-big__comments').hide();
							comments_toggler.hide();
						}
					}
				} else {
					$.alertError("Невозможно удалить комментарий");
				}
			});

			return false;
		},



		'mobile_CommentLikes' : function(){
			var self = this;
			if( $.isIphone() ) {

				if( !self._cmt_likes )
					self._cmt_likes = self.$(".comment-likes");

				var right;

				if( self._cmt_likes_visible ) {
					right = -120;
				} else {
					right = 0;
				}

				self._cmt_likes.animate({
					'right' : right
				}, function(){
					self._cmt_likes_visible = right == 0;
				});

				return false;
			}
		},


		'attachToggle' : function( evt, src1, src2, btn ){
			evt.stopPropagation();
			btn = btn || this.find("a[data-action]");
			$(btn).find('img').switchSrc(src1, src2, function( isnew ){
				$(btn).find("div")[ isnew ? "hide" : "show"]();
				$(btn).find('img')[(isnew ? "remove" : "add") + "Class"]("_preview");
			});
			return false;
		}


	});





	/**
	 * Item base Model
	 */
	var Item = window['Item'] = APP.models.Item = APP.models.Votable.extend({


		// /[urlRoot]/[Item.id]
		'urlRoot': "/items",

		'defaults' : _.extend({}, APP.models.Votable.prototype.defaults, {

				// Item.type is the type of its content (video, photo, text)
				// Type 1  - picture
				// Type 2 - video
				// Type 3 - text
				// Type 4 - gif
				'type': 0,

				// Item description with && without html tags
				'description': "",
				'plain_description' : '',

				//
				'tags' : null,

				// Embedded code with flash or iframe for videos
				// Also content is the text for text item
				'content': "",

				'totalComments' : 0,


				// Screen name is Item's author's name displaying on page
				// Item's author's user id
				// useravatar is user image
				'username': "no name", 'userAvatar' : "", 'user_id': 0,

				// Rly, it isn't a timestamp. It's pretty date for Item.date_add prop
				// E.g. "2 days ago"
				'timestamp': "",

				// Images
				'small_image': "", 'medium_image': "", 'big_image': "",
				'small_image_size':"",'medium_image_size':"",'big_image_size':"",

				"item_small_image" : "",

				'content_user_avatar': "",
				'content_username':"",
				'via_username':"",


				'content_user_fullname' : '',
				'content_timestamp' : '',

				'_popup': false,

				'followed' : null,
				'editable' : false,
				'removable' : false,


				// Фикс яндексовского шера для попопа
				// в ситуациях когда 2 одинаковых элемента на странице
				// и в ленте и в попапе
				'_sharePrefix' : ""
		}),


		'_ignoreJSON' : ['view'],



		isVine : function(){
			var self = this;
			return _.isUndefined(self._isVine) ? (self._isVine = (self.get("content") || "").indexOf("vine.co") > -1) : self._isVine;
		},




		// ==================================================================================================================
		// URL Generators
		// ==================================================================================================================


		'viewUrl' : function () {return '/' + this.id},

		'shareUrl' : function( service ){
			if(!service)
				return this.get('share_url');
			return [
				"http://share.yandex.ru/go.xml?service=", service,
				"&title=", this.get("title") || "",
				"&description=", this.get("comment") || "",
				"&image=", this.get("small_image"),
				"&url=", this.shareUrl()
			].join("");
		},

		'repostUrl' : function(){return "/content/" + this.id + '/repost'},

		'likedPeopleUrl' : function(){return this.url() + '/likedMini'},


		// ==================================================================================================================
		// Fetch & update methods
		// ==================================================================================================================



		'updateDescription' : function( data, callback ){
			var self = this;
			$.post("/content/" + this.id + "/description", {
				"description" : data.newdescr,
				"tags" : data.tags
			}, function(resp){
				if( resp && resp.state && resp.content ) {
					self.set("description" , (resp.content || {}).description);
					self.set("tags" , (resp.content || {}).tags);
					callback && callback(resp, self, true);
				} else {
					callback && callback(resp, self, false);
				}
			});
		},

		'getAllComments' : function( callback ){
			var self = this, onSuccess, onError, callback = callback || {}, data = callback.data || {};

			if(_.isFunction(callback)) {
				onSuccess = onError = function( resp, item, err_state ){
					callback(resp, item, err_state);
				}
			} else  {
				onSuccess = callback.success,
				onError = callback.error;
			}

			$.get("/items/" + this.id + "/allComments", data, function( resp ){
				resp = $.exec(resp) || {};
				if( resp.comments /* && resp.state */ )  {
					var cmtsCollection = self.get("comments");
					cmtsCollection.reset( resp.comments );
					onSuccess && onSuccess( resp.comments, self, true);
				} else {
					onError && onError( resp, self, false);
				}
			});
		},



		'repost' : function( callback ){
			var self = this, onSuccess, onError, callback = callback || {}, data = callback.data || {};

			if(_.isFunction(callback)) {
				onSuccess = onError = function( resp, item, err_state ){
					callback(resp, item, err_state);
				}
			} else  {
				onSuccess = callback.success,
				onError = callback.error;
			}

			$.post("/content/" + this.id + "/repost", data, function( resp ){
				if( resp && resp.state && resp.content ) {
					onSuccess && onSuccess( resp, self, true);
				} else {
					onError && onError( resp, self, false);
				}

				// resp[popoverFieldName] && APP.trigger("itemPopover", {
				// 	item : self,
				// 	popover: resp[popoverFieldName]
				// });
			});
		},



		// 'complain' : function( reason, callback ){
		// 	if($.isFunction(reason)) {
		// 		callback = reason;
		// 		reason =  undefined;
		// 	}

		// 	var self = this, onSuccess, onError;

		// 	callback = callback || {};

		// 	if(_.isFunction(callback)) {
		// 		onSuccess = onError = function( resp, item, err_state ){
		// 			callback(resp, item, err_state);
		// 		}
		// 	} else  {
		// 		onSuccess = callback.success,
		// 		onError = callback.error;
		// 	}

		// 	$.get("/content/" + this.id + "/complain", {reason : reason}, function( resp ){
		// 		if( resp && resp.state && resp.content ) {
		// 			onSuccess && onSuccess( resp, self, true);
		// 		} else {
		// 			onError && onError( resp, self, false);
		// 		}
		// 	});
		// },


		'remove' : function(callback) {
			var self = this, onSuccess, onError, callback = callback || {};

			if(_.isFunction(callback)) {
				onSuccess = onError = function( resp, item, err_state ){
					callback(resp, item, err_state);
				}
			} else  {
				onSuccess = callback.success,
				onError = callback.error;
			}

			$.get("/content/" + this.id + "/delete", function( resp ){
				if( resp && resp.state && resp.content ) {
					onSuccess && onSuccess( resp, self, true);
				} else {
					onError && onError( resp, self, false);
				}
			});
		},


		'getAllTags' : function( callback ){
			var self = this, onSuccess, onError, callback = callback || {};

			if(_.isFunction(callback)) {
				onSuccess = onError = function( resp, item, err_state ){
					callback(resp, item, err_state);
				}
			} else  {
				onSuccess = callback.success,
				onError = callback.error;
			}

			$.get("/tags/getAllItemTags?item_id=" + this.get("item_id"), function( resp ){
				if( resp && resp.state ) {
					onSuccess && onSuccess( resp, self, true);
				} else {
					onError && onError( resp, self, false);
				}
			});
		},


		'fetchModel' : function( opts ){
			var opts = opts || {}, self = this;
			this._sendQuery("load", function( data, model, err_state, new_model ){
				new_model && self.set(new_model);
				opts.success  && opts.success(data, model, err_state, new_model);
			}, function(){

			});
		},


		'fetchFullModel' : function( opts ){
			var opts = opts || {}, self = this;
			this._sendQuery("full", function( data, model, err_state, new_model ){
				new_model && self.set(new_model);
				opts.success  && opts.success(data, model, err_state, new_model);
			}, function(){

			});
		},


		'markAsViewed' : function( context ){
			var url = [], self = this,
				marker = false;

			this.trigger("change:markViewed", this);

			// Получаем урл рут
			if( self.collection && self.collection.urlRoot ) {
				url.push(self.collection.urlRoot.replace(/\/(?:load|ajax)\/?/,"") + "/");

			} else {
				url.push("/");
			}

			url.push(this.id);

			url = url.join("");

			APP.Stat.safecall("pushItemView", {
				id : this.get("item_id"),
				url: url
			});
		},



		'_sendQuery' : function( method, onSuccess, onError, field ){
			var self = this;
			$.get("/content/" + this.id + "/" + method, function( resp ){
				if( resp && resp.state && resp.content ) {
					var parsedData = self.parse(resp.content);
					onSuccess && onSuccess( resp, self, true, parsedData);
				} else {
					onError && onError( resp, self, false);
				}
			});
		},




		/**
		 * Callback for constructor
		 */
		'initialize': function( obj ) {

			var item = this;

			item.on("change:type", function(){
				if( this.get("type") == APP.globals.TYPE_GIF ) {
					this.set("content", "<img data-play='2' src='" + this.get("content") + "'>");
				}
			});



			// Setting "comments" prop as a new collection of
			// of comments, linked with this item
			var comments = new CommentsCollection(obj.comments);
			comments.item_id = item.id;
			item.set( "comments", comments);

			if( item.get("type") == APP.globals.TYPE_GIF || (item.get("content") || "").indexOf("gif_") > -1 ) {
				item.set("content", "<img data-play='2' src='" + item.get("content") + "'>");
			}

			item.set("voteUrl", "/items/" + item.id);


			// Caching Item type
			var type = item.get("type");


			// В своем профиле можно удалять свои итемы
			if(window.MY_PROFILE && !window.__APP_Profile_liked)
				item.set("removable", true);

			if(item.get("content_user_id") == APP.User.id)
				item.set("editable", true);


			_.each(['view','share'], function( param ){
				item.set("_" + param + 'Url', item[param + "Url"]());
			});


			// #timestamp
			// Если очень припрет, можно (а мб и нужно) вынести
			// преттидейт в шаблон, в качестве фильтра. Пока не мешает.
			// Припереть может, например, при реалтайм апдейте даты во вьюхе или типа того
			item.set("content_timestamp", prettyDate(item.get("content_numeric_timestamp"), true));


			item.set('mail_url', 'mailto:?subject=' +
					encodeURIComponent('Зацени шутку') + '&body=' +
					encodeURIComponent('Посмотри шутку, тебе понравится:\r\n\r\n' +
					(item.get('type') == APP.globals.TYPE_TXT ?
					item.get("content").replace(/<br \/>/g, '') + '\r\n\r\n' : '') +
					item.get('share_url')))
		},


		'getLikedPeople' : function( callback ){
			var model = this;
			$.get(this.likedPeopleUrl(), function( data ){
				callback( data, model );
			});
		},



		/**
		 * On switch callback
		 */
		'onSwitch': function(){
			this.set({"_popup": true});
			if( this.get("type") == TYPE_VIDEO && this.get("activeVideo") === true ) {
				//this.hideVideoPlayer();
			}
		},


		'updateComments': function( item ){
			if( (this.get("comments").length > this.get("totalComments"))
				|| (item && (item = $.exec(item)) && item.totalComments > this.get("totalComments"))) {
				this.set("totalComments", (item && item.totalComments) ? item.totalComments : (this.get("totalComments") + 1) );
				this.trigger("change");
			}
		},


		'parse' : function( item ){

			if( item.error ) {
				$.alertError( item.error_text );
				return null;
			}

			item.user_id = Number(item.user_id);

			item.comments = new CommentsCollection( item.comments );
			item.comments.item_id = item.id;

			return item;
		},

		// 'likesCalc' : function(){
		// 	var likes = Number(this.get('likes')),
		// 		hates = Number(this.get('dislikes'));
		// 	this.set('likes_percent', (likes * 100 / (likes + hates)) + '%');
		// },


		preloadNext : function (argument) {
			var c = this.collection;
		}

	});































var POPOVER_TPL = APP.globals.POPOVER_TPL = [
		'<div class="popover">',
			'<div class="arrow"></div>',
			'<div class="popover-inner">',
				// '<h3 class="popover-title"><span></span><a style="float:right" onclick="jQuery(this.parentNode.parentNode.parentNode).hide()">&times;</a></h3>',
				'<div class="popover-content"></div>',
			'</div>',
		'</div>'
	].join("");


	$.fn.smartPopover = function( opts ){
		return this.each(function(){
			var btn = $(this);
			btn.one("mouseenter.init-popover", function(){
				// delete this.onmouseover;

				var showTimer, hideTimer, popover, visible, busy;
				opts.item = opts.item || {};

				popover = btn.data("popover");

				function initButton(){

					// btn.on("click", "label", function( evt ){
					// 	var test = $(this);
					// 	if(test.is("label"))
					// 		test = test.find(":checkbox");

					// 	if(test.is("input:checkbox")) {
					//         test.prop("checked", !test.prop("checked"));
					//         // test.attr("checked", "checked");
					//         // alert(test[0].checked)
					//         return true;
					//     }
					// });

					btn.on("click", "[data-popover-action]", function(evt){
						var test = $(evt.currentTarget);
						opts.view["popover-" + test.attr("data-popover-action")] &&
									opts.view["popover-" + test.attr("data-popover-action")](evt, $(popover.$tip));
					})

					.on({

						'mouseenter' : function(evt){
							if($.fn.smartPopover.disabled) return;
							clearTimeout( hideTimer );
							if(popover.$tip && popover.$tip.is(":visible")) return;
							var self = this;

							showTimer = setTimeout(function(){
								// console.log(opts.content());
								// popover.setContent();
								opts.item.id &&
									$(popover.$tip).attr("id", "i" + opts.item.id + "-popover").find(".popover-content")
								// .html(content)
								// console.log(popover)
								popover.show();
								opts.after && opts.after(btn, popover);
							}, 777);
						},


						'mouseleave' : function(evt){
							// return
							clearTimeout( showTimer );
							// if(!visible) return;
							hideTimer = setTimeout(function(){
								popover.hide();
							}, opts.hide || 444);
						},


						'click' : function( evt ){
							if($.fn.smartPopover.disabled || opts.click === false) return;

							clearTimeout( showTimer );
							clearTimeout( hideTimer );

							var target = $(evt.target);

							if(popover.$tip && popover.$tip.is(":visible")){
								if(target.parents(".popover").length) {
									if(target.is("a") || target.parent().is("a"))
										return true;
									return false;
								}

								opts.hideOnClick && popover.hide();

							} else {
								popover.show();
								opts.after && opts.after(btn, popover);
							}

							evt && evt.preventDefault();

							// if(opts.prevent === true)
							// 	return false;
						}
					});

					if( opts.leave && !opts.hover){
						// console.log(btn);
						btn.off("mouseenter");
					}
					else if(!opts.leave && !opts.hover)
						btn.off("hover");



					// opts.view && opts.events && _.each(opts.events, function( e ){
					// 	btn.on(e[0], e[1], function(evt){

					// 		// return false;
					// 	});
					// });
				}

				if( opts.url ) {

					var xhr = null;

					btn.on("mouseenter.popover.url", function(){

						var url = _.isFunction(opts.url)
						 	? opts.url( btn )
						 	: opts.url;

						xhr = $.get(url, function(data){
							btn
								.off("mouseenter.popover.url")
								.off("mouseleave.popover.url");

							xhr = null;

							if(!popover){
								popover = btn.popover({
									trigger : 'manual',
									content : function(){
										return opts.content(data, btn);
									},
									template: opts.tpl || APP.globals.POPOVER_TPL,
									placement : opts.placement,
									animate : true
								}).data("popover");
							}
							initButton();
							showTimer = setTimeout(function(){
								btn.off("mouseenter.popover.url");
								popover.show();
							}, 333);
						}).error(function(){});

					}).on("mouseleave.popover.url", function(){
						clearTimeout(showTimer);
						xhr && xhr.abort();
						xhr = null;
					});
				} else {
					if(!popover){
						popover = btn.popover({
							trigger : 'manual',
							content : opts.content,
							template: opts.tpl || APP.globals.POPOVER_TPL,
							placement : opts.placement,
							animate : true
						}).data("popover");
					}
					initButton();
				}

				if( popover ){
					popover._show = popover.show;
					popover.show = function() {
						opts.after && opts.after(btn, popover);
						popover._show();
					}
				}

				// #hack
				btn.data('popover-after-callback', opts.after);

				btn.off("mouseenter.init-popover").trigger("mouseenter");

			});
		});

	}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Any page. Item brick in grid.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */



 	var PopoversCache = {};

 	var TPL_SHARE = "#item-sharing-popover";

 	// Кароч хуйня какая-то
 	APP.views.ItemWithPopovers = Backbone.View.extend({

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
		},


		// "popover"


		"popover-openAddTo" : function( evt, popover ){
			var item = this.model,
				addtoTemplate = TPL_SHARE,
				tpl = PopoversCache[addtoTemplate] || (PopoversCache[addtoTemplate] = _.template($(addtoTemplate).html()));


			// popover.block();
			item.repost(function(resp, item, state){
				// popover.unblock();
				if( state ) {
					$.alertOk("Шутка добавлена!");
				} else {
					$.alertError(resp.error_text);
				}
			});

			popover.find(".popover-content").html(tpl(item.toJSON()));

			var title = 'Шутка от ' + item.get("content_username");
			var type = item.get('type');
			var description = '';
			var image = item.get("big_image");

			if (type == APP.globals.TYPE_TXT){
				description = item.get('content');
				image = window.location.protocol + '//' + window.location.host + '/common/img/logos/logo__medium.png';
			}

			APP.initSharing('i' + item.id + '-share-grid', {
				image : image,
				link  : item.shareUrl(),
				title : title,
				descr : description
			});
		},

		"popover-addToAlbum" : function( evt, popover ){
			var sendToVK = popover.find("input:checkbox").attr("checked") == "checked",
				readyToShare = false;

			// alert(sendToVK);
			// return

			if(!APP.User.id){

				$(evt.currentTarget).errorTip({
					'hide' : 3000,
					'title': 'Необходима авторизация'
				});

			} else {


				// @todo
				// Заменить всю эту хрень на код типа:
				// this.model.toAlbum({
				// 		before : function(){},
				// 		success: function(){}
				// })

 				popover.block();

 				var opt = popover.find("option:selected"),
					id = opt.attr("data-id"),
					title = opt.text(),
					item = this.model,
					successTemplate = "#item-addto-success-popover",
					tpl = PopoversCache[successTemplate] || (PopoversCache[successTemplate] = _.template($(successTemplate).html()));

				if(!id) $.alertError("Вы не выбрали коллекцию");

				$.ajax({
					async : false,
					url : "/content/" + this.model.id + "/repost/" + id,
					success : function( data ){
						popover.unblock();
						data = $.exec( data );
						if( data && data.state ) {

							// Обновляем контент поповера, с уведомлением о том, что все хорошо
							// и рендерим в него шеринг кнопки.
							$.alertOk("Шутка добавлена в коллекцию " +  title + "!");
							popover.find(".popover-content").html(tpl(item.toJSON()));

							var type = item.get('type');
							var description = '';
							var image = item.get("big_image");

							if (type == 3){
								description = item.get('content');
								image = window.location.protocol + '//' + window.location.host + '/common/img/logos/logo__medium.png';
							}

							APP.initSharing('i' + item.id + '-share-grid', {
								image : image,
								link : item.shareUrl(),
								title : 'Шутка от ' + item.get("content_username"),
								descr : description
							});


							popover.unblock();
							readyToShare = true;

							setTimeout(function(){
								popover.find("input").select();
							}, 333);

						} else {
							$.alertError((data || {}).error_text || "Не получилось добавить шутку в коллекцию");
						}
					}
				});

				if(sendToVK) {
					if( readyToShare ) {
						var link = this.model.shareUrl("vkontakte");
						var a = 500, c = 300;
						window.open(link, "yashare_popup", "scrollbars=1,resizable=1,menubar=0,toolbar=0,status=0,left=" + ((screen.width - a) / 2) + ",top=" + ((screen.height - c) / 2) + ",width=" + a + ",height=" + c).focus()
					}
				}

			}

			return false;
		},


		'initPopovers' : function(){
			var item = this.model;


			function renderSharing(){
				var title = 'Шутка от ' + item.get("content_username");
				var type = item.get('type');
				var description = '';
				var image = item.get("big_image");

				if (type == APP.globals.TYPE_TXT){
					description = item.get('content');
					image = window.location.protocol + '//' + window.location.host + '/common/img/logos/logo__medium.png';
				}

				APP.initSharing('i' + item.id + '-share-grid', {
					image : image,
					link  : item.shareUrl(),
					title : title,
					descr : description
				});
			}

			this.registerPopover("[data-show-popover=share]", {
				tpl : "#item-sharing-popover",
				item: item,
				// hideOnClick : true,
				hover : true,
				hide  : 777,
				after: renderSharing
			});

			this.registerPopover("[data-show-popover=addTo]", {
				// tpl : "#item-addto-popover",
				// hideOnClick : true,
				tpl : "#item-sharing-popover",
				item: item,
				hover : false,
				leave : true,
				hide  : 777,
				click: false,
				after : renderSharing
				// events: [
				// 	["click", "[data-action=addToAlbum]", "addToAlbum"]
				// ]
			});

			this.registerPopover("[data-show-popover=likes]", {
				tpl : "#item-people-popover",
				item: item,
				prevent : false,
				url : "/item/" + item.get("item_id") + "/liked",
				hover : true,
				placement: "in top",
				// hide :332421
			})
			.on("userVoteChanged", function(){
				if(item.get("userVote") == 1){
					$(this).find(".popover-people").prepend([
						'<a data-userid="'+APP.User.id+'" href="/user/'+APP.User.get("username")+'" class="people-profile">',
							'<img src="'+APP.User.get("small_image")+'" alt="" />',
						'</a>'
					].join(""))
				} else {
					$(this).find(".popover-people").find("a[data-userid='"+APP.User.id+"']").remove();
				}

				if(!$(this).find(".popover-people a").length) {
					$(this).find("p").show();
				} else {
					$(this).find("p").hide();
				}

				$(this).find(".popover-people-count b").text(item.get("likes") + " " + plural(item.get("likes"), "человеку,людям,людям"));
			});

			// #hack
			var icon = this.$(".icon-root");
			if(!icon.length) icon = this.$(".icon__repost__small");
			if(icon.length){
				icon.tooltip({
					html : true,
					title : this.model.get("content_user_fullname") + ' в <b>' + this.model.get("collection_title") + '</b>',
					placement : "bottom"
				});
			}

			this.registerPopover("[data-uidinfo]", {
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

 	});
})( jQuery, Backbone, this, _ );