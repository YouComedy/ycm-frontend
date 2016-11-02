;
(function( window, $, APP, _gaq ){
	;


	// var shareDict = {
	// 	smile: [
	// 		')', '))', ')))',
	// 		'=)', '=))', ':)',
	// 		':))', ':-)', 'XD',
	// 		'xD', ':D', ':P',
	// 		':DDD', ':]', ':3',
	// 		': D', ')))+))',
	// 		'))))))', '^_^', '=)))'
	// 	],

	// 	phrase: [
	// 		'made my day', 'аахахха', 'ахах',
	// 		'ахаха нормально', 'ахахахах', 'ахахахха супер',
	// 		'ахаххахаа', 'гениально', 'добро',
	// 		'идеально', 'лучшая', 'нормально',
	// 		'отлично', 'очень круто', 'прекрасно',
	// 		'прикольно', 'просто бомба', 'просто шик',
	// 		'просто шикарно', 'развеселило',
	// 		'сильно', 'смешно', 'супер',
	// 		'супер круто', 'уахахах', 'ха ха ха',
	// 		'хахахх', 'хорошо',
	// 		'шедеврально', 'шикарно', 'это пять'
	// 	]
	// };


	// Типы итемов
	APP.globals.TYPE_TXT = 3;
	APP.globals.TYPE_VID = 2;
	APP.globals.TYPE_IMG = 1;
	APP.globals.TYPE_GIF = 4;

	//
	APP.globals.VIEWS_HISTORY = [];
	APP.globals.VIEWS_INDEX = {};

	//
	APP.globals.GA_INDEX = {};


	APP.globals.MOBILE_DEBUG = false;
	APP.globals.TOUCH = window.Modernizr.touch;

	APP.globals.IS_MOBILE = window.IS_MOBILE;


	APP.initSharing = function( elem_id, o ){
		o = o || {};
		var tweet = '';
		o.descr = o.descr || '';

		tweet = o.descr;
		if (tweet.length > 134) {
			tweet = tweet.substring(0, 90).replace(/\s+\S*$/, '... продолжение: ') + o.link + ' #YCM';
		} else {
			tweet = (tweet.length ? tweet : o.link) + ' #YCM';
		}

		o.descr = o.descr ? o.descr.length > 80 ? o.descr.substring(0, 80).replace(/\s+\S*\s+\S*$/, '... [продолжение]') : o.descr : 'Нажми, чтобы посмотреть шутку';

		var title = o.title;
		/*var title = shareDict.phrase[(Math.random() * shareDict.phrase.length)|0] + ' ' +
			shareDict.smile[(Math.random() * shareDict.smile.length)|0];*/

		new Ya.share({
		        element: elem_id,
	            elementStyle: {
	                'type': 'none',
	                'border': false,
	                'quickServices': ['vkontakte', 'facebook', 'twitter', /* 'lj', 'gplus', 'blogger', 'odnoklassniki' */ ]
	            },

				image: o.image,
	            link: o.link || window.location.href,
	            title: title,
	            description: o.descr || 'YouComedy.Me - это место, где люди выкладывают свои любимые шутки и делятся ими с друзьями.',
	            serviceSpecific: {
	                twitter: {
						description: '',
						title: '',
						link: tweet
	               }
		        },
		        onready : o.onready,
		        onshare: function(){
		        	// alert("SHARED");
		        	APP.Stat.pushTarget('Activity', 'Share', 'SHARE');
		        }
		});
	}


	// Be sure that User model is exist
	if( APP.models.User ) {

		// Defining new Application user
		APP.User = new APP.models.User(window.__userJSON || {
			'id' : window.user_id,
			'username' : window.user_name,
			'role' : window.app_user_role,
			'following' : window.user_following,
			'small_image' : window.user_small_image || ("/common/img/profile/avatar_small.png?" + window.STATIC_VERSION),

			'following' : window.app_user_follow_users || [],
			'isModerator' : window.app_user_isModerator,
			'token' : window.app_user_token || "",

			'followingTags' : window.app_user_follow_tags || [],
			'ignoredTags' : window.app_user_ignored_tags || [],
			'ignoredUsers' : window.app_user_ignored_users || []
		});


		APP.User.updateIgnored = function( callback ){
			if(APP.User._ignored) {
				callback && callback();
				return;
			}
			$.get("/ignoreList", function(data){
				if( data && data.state ) {
					APP.User.set({
						ignoredUsers : data.users,
						ignoredTags : data.tags
					});

					APP.User._ignored = true;
					callback && callback();
				}
			})
		}


		/**
		 * Personal method isFollowing
		 * Checks following state of app user with another user
		 * @param int uid - user id
		 */
		APP.User.isFollowing = function( uid ){
			for(var uids = APP.User.get("following") || window.user_following || [], l = uids.length, i = -1; ++i < l;)
				if(uids[i] == uid)
					return true;
			return false;
		}


		APP.User.isIgnoredUser = function( uid ) {
			for(var uids = APP.User.get("ignoredUsers") || [], l = uids.length, i = -1; ++i < l;)
				if(uids[i] == uid)
					return true;
			return false;
		}


		APP.User.isIgnoredTag = function( tag ) {
			for(var uids = APP.User.get("ignoredTags") || [], l = uids.length, i = -1; ++i < l;)
				if(uids[i] == tag)
					return true;
			return false;
		}


		APP.User.isFollowingTag = function( tag ) {
			for(var uids = APP.User.get("ignoredUsers") || [], l = uids.length, i = -1; ++i < l;)
				if(uids[i] == tag)
					return true;
			return false;
		}



		/**
		 * Personal method setFollow
		 * App User followers controller. Allows to follow or unfollow any user.
		 *
		 * After success action triggers APP.User with followerRemoved/followerAdded event.
		 *
		 * @param user could be
		 * 		- model created with backbone
		 * 		- int user id
		 * 		- html element with data-attributes
		 * @param cb - object, contains success and error callbacks
		 * 		- success : function( uid, new_following_state )
		 * 		- error :  function( uid, error_text )
		 */
		APP.User.setFollow = function( user, o, model ) {

			if (!APP.User.id && $.isIphone()) {
				alert("Необходима авторизация!");
				return false;
			}


			// if(!APP.User.id) {
				// window.authDialog();
				// return false;
			// }

			var o = o || {}, url, btn, uid = o.uid, aid = o.aid, model, type = o.type;

			// User is a html element
			if( user.jquery || user.nodeType ) {
				// get its href attr as url, proceeded with template or widjet
				url = (user = $(user)).attr("data-href") || user.attr('href');
				// set it as "work" btn
				btn = user;

				// try to check uid
				if( !type )
					uid = btn.data('follow') || btn.data('uid') || url.replace(/[^\d]+/g, "");
				else if( type === 'album' )
					aid = btn.data('follow') || btn.data('aid') || url.replace(/[^\d]+/g, "")

			} else if( user.cid ) {

				url = user.followURL();
				uid = user.id;
				model = user;

			} else  if( typeof user === 'string' && user.indexOf("user/") > -1){

				url = user;
				uid = url.replace(/[^\d]+/g, "");

			}

			if( !url || !(uid || aid)) return false;

			// be sure that btn exists
			btn || o.btn && (btn = $(btn));

			!model && (model = o.model);

			// Block the button
			// if(!o.btn_disabled)
			btn && btn.blockButton();

			// sending ajax request
			$.get( url, function( data ){

				data = $.exec( data );

				if( data && data.state === true ) {

					if( data.unfollowed === undefined && data.following === undefined ) {
						data.unfollowed = data.followed == 0;
						data.following = data.followed == 1;
					}


					var query;

					// Backend says that we are successfully unfollowed @user
					if( data.unfollowed ) {

						// Removing unfollowed user from APP.User.following users list
						APP.User.set("following", _.without(APP.User.get("following"), data.unfollowed));
						APP.User.trigger( "followerRemoved", data.unfollowed );
						model && model.set('followed', false);

						query = "a[data-follow='" + uid + "']";

						if(!o.btn_disabled) {
							$( query ).each(function(){
								$(this).removeClass(o.classname || "inactive")
									.attr("href", url.replace("/unfollow", "/follow")).text(data.action_word || "Подписаться");
							});
						}

						_gaq.push(['_trackEvent','Community','Unollow','UNFOLLOW']);

						o.unfollowed && o.unfollowed();

					} else {

						// Pushing new followed user
						APP.User.get("following").push(Number(data.following) + "");
						APP.User.trigger( "followerAdded", data.following );
						model && model.set('followed', true);

						query = "a[data-follow='" + uid + "']";

						if(!o.btn_disabled)
							$( query ).each(function(){
								$(this).addClass( o.classname || "inactive").attr("href", url.replace("/follow", "/unfollow")).text(data.action_word || "Отписаться");
							});


						_gaq.push(['_trackEvent','Community','Follow','FOLLOW']);

						o.followed && o.followed();

					}

					// Call success func with uid param
					o.success && o.success( uid, !!data.following, data );

				} else {
					(o.error || $.alertError)( data.error_text || "Error call APP.User.setFollow");
					if(!o.btn_disabled)
						btn && btn.unblockButton();
				}

			});

		}



		APP.User.setFollowTag = function( btn, evt ) {

			if (!APP.User.id && $.isIphone()) {
				alert("Необходима авторизация!");
				return false;
			}

			var btn = $(btn), url = btn.attr("href");
			if( evt && evt.tag ) {
				url = url.replace(/\/(\w+)\/((?:un)?fol)/, "/" + evt.tag + "/$2");
			}

			var tag = url.match(/\/([а-яa-z0-9ё\_]+)\/(?:un)?fol/i)[1];

			// alert([url, tag]);

			// sending ajax request
			$.get( url, function( data ){
				data = $.exec( data );

				if( data && data.state === true ) {

					var text = "", newurl;

					newurl = url.replace(/((?:un)?follow)/, function(a, b){
						return data.followed ? "unfollow" : "follow";
					});

					if( data.followed ) {
						APP.User.get("followingTags").push( data.following );
					} else {
						APP.User.set("followingTags", _.without(APP.User.get("followingTags"), data.following));
					}

					// alert([data.ignored, newurl])


					btn.attr("href", newurl).text(data.action_word)[(data.followed ? "add" : "remove") + "Class"]("_grey")[(data.followed ? "add" : "remove") + "Class"]("inactive");

					$.alertOk(data.followed ? ("Вы подписались на тег " + tag ) :( "Вы отписались от тега " + tag));

				} else {
					($.alertError || alert)( data.error_text || "Error call APP.User.setIgnoreTag");
				}

			});

			return false

		}



		APP.User.setIgnoreTag = function( btn, evt ) {


			if (!APP.User.id) {
				if(!$.isIphone()){
					window.authDialog();
				} else {
					alert("Необходима авторизация!");
				}
				return false;
			}

			var btn = $(btn), url = btn.attr("href"), o = {};
			if( evt && evt.tag ) {
				url = url.replace(/\/(\w+)\/((?:un)?ig)/, "/" + evt.tag + "/$2");
			}

			var tag = url.match(/\/([а-яa-z0-9ё\_]+)\/(?:un)?ig/i)[1];

			// alert([url, tag]);

			// sending ajax request
			$.get( url, function( data ){
				data = $.exec( data );

				if( data && data.state === true ) {

					var text = "", newurl;

					newurl = url.replace(/((?:un)?ignore)/, function(a, b){
						return data.ignored ? "unignore" : "ignore";
					});

					if( data.ignored ) {
						APP.User.get("ignoredTags").push( data.ignoring );
					} else {
						APP.User.set("ignoredTags", _.without(APP.User.get("ignoredTags"), data.ignoring));
					}

					// alert([data.ignored, newurl])


					btn.attr("href", newurl).text(data.action_word);

					$.alertOk(data.ignored ? ("Вы больше не увидете шуток с тегом " + tag ) :( "Вы будете видеть шутки с тегом " + tag));

				} else {
					(o.error || $.alertError)( data.error_text || "Error call APP.User.setIgnoreTag");
				}

			});

			return false

		}



		APP.User.setIgnoreUser = function( btn, evt ) {

			if (!APP.User.id) {
				if(!$.isIphone()){
					window.authDialog();
				} else {
					alert("Необходима авторизация!");
				}
				return false;
			}

			var btn = $(btn), url = btn.attr("href"), o = {};

			// sending ajax request
			$.get( url, function( data ){
				data = $.exec( data );

				if( data && data.state === true ) {

					var text = "", newurl;

					newurl = url.replace(/((?:un)?ignore)/, function(a, b){
						return data.ignored ? "unignore" : "ignore";
					});

					// alert([data.ignored, newurl])

					data.ignoring = Number(data.ignoring);

					if( data.ignored ) {
						APP.User.get("ignoredUsers").push(data.ignoring);
					} else {
						APP.User.set("ignoredUsers", _.without(APP.User.get("ignoredUsers"), data.ignoring));
					}


					btn.attr("href", newurl).text(data.action_word);

				} else {
					(o.error || $.alertError)( data.error_text || "Error call APP.User.setIgnoreUser");
				}

			});

			return false

		}




		/**
		 *
		 */
		APP.User.renderFollowBtn = function( followed, uid, classname, style, iid, undefined ){
			if( APP.User.id == uid ) return "";
			// var followed = followed !== null ? followed : APP.User.isFollowing( uid );
			var followed = APP.User.isFollowing( uid );

			return [
				"<a", style ? " style='"+style+"' " : "",
					iid ? " id='i" +iid+ "-fbtn' " : "", " data-follow='"+uid+"'",
					" onclick='APP.User.setFollow(this);return false;'",
					" href='/user/", uid, '/', followed ? "unfollow" : "follow", "'",
					" class='button ", classname || "", followed ? " inactive" : "", "'>",
						followed?"Отписаться":"Подписаться", "</a>"
			].join("");
		}


		APP.User.renderIgnoreBtn = function( opts ){
			if( APP.User.id == opts.uid ) return "";
			var id = opts.id, type = opts.type || "User";
			var ignored = APP.User['isIgnored' + type]( id );


			console.log(opts);
			type = type.toLowerCase();
			opts.url = opts.url || ((ignored ? "un" : "") + "ignore");
			opts.word = opts.word || "";

			ignored ?
				opts.word = 'Убрать'.concat(' ', opts.word, ' из игнора'):
				opts.word = 'Игнорировать'.concat(' ', opts.word);

			return stringTpl('<a onclick="APP.User.setIgnore{type}(this);return !1;" href="/'+type+'/{name}/{url}" class="button {class}">{word}</a>', opts);
		}


		/**
		 *
		 */
		APP.User.isME = function( uid ) {
			return uid == APP.User.id //|| /moderator|administrator/.test(APP.User.get("role")) ;
		}


		APP.User.isModerator = function() {
			return this.get("isModerator");
			// /moderator|administrator/.test(APP.User.get("role"));
		}


		APP.User.moderateRemoveItem = function( item_id, success, error ){
			// if(!this.mode)
			$.get("/moderator/delete/" + item_id, function(data){
				if(data && data.state) {
					$.alertOk("Итем уничтожен!!");
					success && success();
				} else {
					$.alertError("Не получилось :(");
				}
			});
		}


		APP.User.moderateDemoteItem = function( item_id, callback ){
			// if(!this.mode)
			$.get("/moderator/banItem/" + item_id, function(data){
				if(data && data.state) {
					$.alertOk("Итем унижен!");
					_.isFunction(callback) && callback();
				} else {
					$.alertError("Не получилось :(");
				}
			});
		}


		APP.User.uploadURL = function( action ){
			return window.location.protocol + "//upload." + window.location.host + "/" + (action || "") + "?uid="  + APP.User.id + "&token=" + APP.User.get("token")
		}



		// APP.User.moderateRemoveComment = function( comment_id, success, error ){
		// 	// if(!this.mode)
		// 	$.get("/moderator/deleteComment/" + comment_id, function(data){
		// 		if(data && data.state) {
		// 			$.alertOk("Камент уничтожен!!");
		// 			success && success();
		// 		} else {
		// 			$.alertError("Не получилось :(");
		// 		}
		// 	});
		// }


		$(window).on("load.appuser", function(){
			$(this).off("load.appuser");
			//APP.User.updateIgnored();
		});



	}


	// Statistics mini module
	(function(){
		var Stat = new APP.Module({"inited" : true, "name" : "Stat"});

		var VIEWS_HISTORY_KEY = "VIEWS_HISTORY::" + APP.User.id,
			VIEWS_HISTORY_INDEX_KEY = "VIEWS_HISTORY_INDEX::"  + APP.User.id;

		// var HistoryPushIndex = 0;

		var
			// История просмотров итемов, отправляемая в бэкенд
			viewsHistory = new function(){

				var items = {};
				// cache.get(VIEWS_HISTORY_KEY) || [];
				// @todo переделать с массива на объект
				// var index = cache.get(VIEWS_HISTORY_INDEX_KEY) || [];

				this.add = function(id){
					items[id] = 1;
					// if(_.contains(index, id)) return;
					// items.push(id);
					// index.push(id);
					// cache.set(VIEWS_HISTORY_KEY, items);
				}
				this.reset = function( ids ){
					console.log( items );
					// cache.set(VIEWS_HISTORY_KEY, items);
					// var indexlen = index.length;
					// if( indexlen > 100 ) {
					// 	index = index.slice(-50);
					// }
					// cache.set(VIEWS_HISTORY_INDEX_KEY, index);
				}

				this.get = function(){
					var tmp = _.clone(_.keys( items ));
					_.each(tmp, function(id){
						delete items[id];
					});
					//console.warn( tmp, items )
					return tmp;
				}

			},

			// Индекс истории просмотров
			viewsGAIndex = {},

			// Гугл аналитикс
			viewsGA = [];


		Stat.pushTarget = function( cat, type, act ){
			(window._gaq || viewsGA).push(['_trackEvent', cat, type, act]);
		}

		Stat.pushPage = function(  pageUrl  ){
			// console.info( pageUrl );
			(window._gaq || viewsGA).push(['_trackPageview', pageUrl]);
		}

		Stat.pushItemView = function( opts ){
			var opts = opts || {}, id = opts.id, url = opts.url;

			if( id && !viewsGAIndex[id] ) {
				viewsGAIndex[id] = 1;
				viewsHistory.add(id);
				url && Stat.pushPage(url || ("/" + id));


				if( DEBUG ) {
					var item = APP.ItemsViewer.Records.find(function(i){
						return i.get("item_id") == id;
					});
					var el = $("#i" + item.id);
					if( !el.data("__marked") ) {
						el.find(".item__showAllComments").css("background", "#005");
						el.data("__marked", true)
					}
				}

				// console.log( "Stat.pushItemView", opts );
			}
		}

		Stat.init = function(){
			if(!window._gaq){
				return setTimeout(Stat.init, 1);
			} else {
				_.each(viewsGA, function(data){
					window._gaq.push(data);
				});
			}
		}


		var PushHistoryBusy = false;
		var PushHistory = setInterval(function(){

			if(PushHistoryBusy) return;

			var ids = viewsHistory.get();

			if( ids.length ) {

				PushHistoryBusy = true;

				(function(ids){

					// clearTimeout(PingTimer);
					// PingTimer = null;

					// console.log(ids)

					$.post("/pushHistory", {
						'ids' : ids
					}, function(){

						if( DEBUG ) {

							_.each(ids, function(id){
								try {

									var item = APP.ItemsViewer.Records.find(function(i){
										return i.get("item_id") == id;
									});

									// if( item )
									// 	$("#i" + item.id).find(".item__container").css("background", "#a00")
								} catch(e){}
							})
						}

						// viewsHistory.reset();
						PushHistoryBusy = false;
					});

				})(ids);

			}
		}, 3333);


		Stat.init();
	})();


	if(!DEBUG) {
		window.console = {};
		_.each(['log', 'info', 'warn', 'error'], function(f){
			window.console[f] = function(){}
		})
	}


})( window, window.jQuery, window.APP, window._gaq || [] );
