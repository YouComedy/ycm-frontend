/**
 * Основной функционал страницы профиля пользователя.
 * 	- Просмотр профиля и его рендер
 * 	- Редактирование профиля
 * 	- Пагинация итемов загруженных пользователем
 * 	- Чат?
 */
;
(function( $, window, document, APP ){

	var Subscr = APP.Subscriptions;
	Subscr.set("inited", true);


	var follow_me, i_follow, 

	FollowerView = Backbone.View.extend({

		'tagName' : 'div',
		'className' : 'panel subscribePanel',
		'template' : _.template([
				'<div class="_cell">',
					'<a href="/user/{{= username }}" class="thumb">',
						'<img class="thumb__img" src="{{= small_image || APP.get(\"small_avatar\") }}">',
					'</a>',
					'<a href="/user/{{= username }}" class="title">{{= fullname }}</a>',
					'<div class="remark">{{= lastSeen || "" }}</div>',
				'</div>',
				'<div class="subscribePanel__stat _cell">',
					'<div class="title">{{= (contentCount || 0) }}</div>',
					'<div class="subscribePanel__statLabel">{{= plural(contentCount, ["шутка","шутки","шуток"]) }}</div>',
				'</div>',
				'<div class="subscribePanel__stat _cell">',
					'<div class="title">{{= (followersCount || 0) }}</div>',
					'<div class="subscribePanel__statLabel">{{= plural(followersCount, ["подписчик","подписчика","подписчиков"]) }}</div>',
				'</div>',
				'<div class="subscribePanel__buttonWrap _cell">',
					'{{=APP.User.renderFollowBtn(0, id)}}',
				'</div>'
		].join("")),

		'events' : {
			'click .follow-btn' : 'unfollow',
			// 'click .subscr__button' : 'unfollowMOBILE'
		},

		'render' : function(){
			this.$el.html(this.template(this.model.toJSON()));
			$(this.container).append(this.el);
		},

		'unfollow' : function(e){
			APP.User.setFollow(e.currentTarget);
			return false;
		},

		// 'unfollowMOBILE' : function(){
		// 	var elem = this.$el;
		// 	elem.block();
		// 	$.get('/user/' + this.model.id + '/unfollow', function( data ){
		// 		data = $.exec( data );
		// 		if( data && data.state === true ) {
		// 			$(elem).remove();
		// 		} else {
		// 			$.alertError( data.error_text || "err" );
		// 		}
		// 	});

		// 	return false
		// }
	});


	
	

	Subscr.init  = function(){
		var Followers  = Subscr.Records = new APP.collections.Users;

		var FollowersConfig = {
			// Конфиг для подписчиков
			"follow_me" : {
				container : "#subscriptions-followed",
				urlSuffix : "getFollow"
			},

			// Конфиг для моих подписок
			"i_follow"  : {
				container : "#subscriptions-following",
				urlSuffix : "getFollowingBy"
			}
		}


		var config = FollowersConfig[window.__followers_type];

		Followers.view = FollowerView;
		Followers.dataField = 'data';
		Followers.viewContainer = config.container;
		Followers.url = function(){
			return '/user/' + APP.Profile.get("username") + "/" + config.urlSuffix +
				'?page=' + this.currentPage  + "&q=" + (this.q || "")
		}

		Followers
			.on('itemsMissed', function (){
				$$(this.emptyElement).show();
			})
			.on('maxItems', function (){
				$$(this.seenElement).show();
			})
			.on('reset', function(){
				$$(config.container).empty();
			})
			.on('beforeLoad', function(){
				$$("#userFilter").parent().block().blur();
			})
			.on('completeLoad', function(){
				$$("#userFilter").parent().unblock().focus();
			});

		

		// Загрузка первой страницы
		Followers.loadNext();

		// Загрузка след. страниц
		Subscr.on("loadNext", function(){
			Followers.loadNext();
		});

		// Трекинг скролла
		Subscr.active();

		Subscr.initUI();

	}




	// 
	Subscr.initUI = function(){
		var filterTimer = null, oldVal = "",
			Followers =  Subscr.Records;

		$$("#userFilter").keyup(function(){
			clearTimeout(filterTimer);
			var val = $.trim(this.value);

			(oldVal != val) && !Followers.isBusy() && (filterTimer = setTimeout(function(){
				oldVal = val;
				Followers.resetAll();
				Followers.q = val;
				Followers.loadNext();
			}, 333));
		});
	}

	

})( this.jQuery, this, document, this.APP );