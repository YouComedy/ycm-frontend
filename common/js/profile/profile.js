/**
 * Основной функционал страницы профиля пользователя.
 * 	- Просмотр профиля и его рендер
 * 	- Редактирование профиля
 * 	- Пагинация итемов загруженных пользователем
 * 	- Чат?
 */
;
(function( $, window, document, APP ){





/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Vars definition
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	/**
	 * Defining new module
	 * @module Profile
	 */
	var Profile = new APP.Module({
		'inited' : true,
		'name' : "Profile",
		'username' : window.profile_user_name || APP.User.get("username"),
		'uid' : window.profile_user_id || APP.User.id,
		'albums' : window.profile_collections,
		'autoload' : true
	});

	Profile.url = function(){
		return "/user/" + this.get("username")
	}


	Profile.isME = function(){
		return APP.User.id == Profile.get("uid");
	}



	Profile.getCurrentPanel = function(){
		var cur_panel = $$("#panels").children(":visible"),
			id = cur_panel.attr("id");
		return (id || "").split("-")[1];
	}



	Profile.currentPanel_init = function(){
		// Активная панель, генерится на беккенде
		var panel = $.isIphone()
			? $("#panels > div[data-owner]")
			: $("#main-page-content > div[data-owner]");

		// #hack form mobile
		if( panel.length > 1 ) {
			panel = panel.filter("[data-owner]");
		}

		var current = panel.attr('data-owner'),
			module = APP[ current ];

		// alert(current)
		if( module ) {
			Profile.activePanel  = current;
			if( module.onPanelEnter ) {
				module.onPanelEnter();
			} else if( module.Records ) {
				module.Records.loadNext();
			} else {
				setTimeout(Profile.currentPanel_init, 30)
			}
		} else {
			setTimeout(Profile.currentPanel_init, 30)
		}
	}



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Sidebar menu functionality
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	Profile.showFollow = function(param){
		if (Profile.isME){
			Profile.switchPanel.call( this, 'Subscriptions', param);
		}
	};


	Profile.toggleSetting = function(param, evt){
		if (param !== undefined){
			$.ajax({
				cache: false,
				url: '/toggleSubscription/' + param,
				success: function(data){
					data = $.exec( data );
					if(!(data && data.state === true)) {
						$.alertError( data.error_text || "err" );
					}
				}
			});
		}
	};






	APP.User.on("followerRemoved followerAdded", function( uid ){

	});

	Profile.setFollow = function(){

		var link = this;

		$(link).children().blockButton( "loading..." );

		APP.User.setFollow(link, {

			btn : $(link),

			success: function( uid, following ){

				$(link).children().unblockButton( false );

				link = $(link);

				//console.log( uid, following, link )

				if( following ) {
					link.addClass( 'ycmbtn-grey')
						//todo replace this to something like
						// (new User({id: uid})).followURL();
						.attr('href', '/user/' + uid + '/unfollow')
						.children().text('Отписаться');
				} else {
					link.removeClass( 'ycmbtn-grey')
						//todo replace this to something like
						// (new User({id: uid})).followURL();
						.attr('href', '/user/' + uid + '/follow')
						.children().text('Подписаться');
				}

				// window.location.href = window.location.href;
			},

			error: function( err ){
				$(link).errorTip({
					title : err,
					hide : 1500
				});
				$(link).children().unblockButton( false );
			}
		});
	}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Initialize
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Profile.init = function(){
		// Autoloading items
		// Init profile panel state
		Profile.currentPanel_init();
	}


	// Initialize module
	//!Profile.get("inited") &&
	$( Profile.init );



	Profile.Hovers = new function(){
		var Hover = this;

		Hover.init = function(){
			var t1 = 320,
				t2 = 160;
			var default_wrap = $$('#main-page-content');

			$('[data-hover]')
			.each(function(){
				var i = 0;
				var target = $(this);
				var hover = null, wrap = $(target.data('hover') || default_wrap);

				function setPos(){
					var xy = target.offset();
					var wrap_xy = wrap.offset();
					var arrow, offset;

					xy.top += target.height();
					xy.left += (target.width() - hover.width()) / 2;

					if (xy.left < wrap_xy.left) {
						xy.left = wrap_xy.left;
						arrow = hover.find('.hover-content-arrow');
						offset = target.offset().left - xy.left + (target.width() - 10) / 2;
						arrow.css('margin-left', offset|0);

					} else if (xy.left + hover.width() > wrap_xy.left + wrap.width()) {
						xy.left = wrap_xy.left + wrap.width() - hover.width();
						arrow = hover.find('.hover-content-arrow');
						offset = wrap_xy.left + wrap.width() - target.offset().left - (target.width() + 10) / 2;
						arrow.css('margin-right', offset|0);
					}


					xy.top -= wrap_xy.top;
					xy.left -= wrap_xy.left;

					hover.css(xy);
				}

				target.hover(function(){
					clearTimeout(i);
					i = setTimeout(function(){
						hover && hover.remove() && (hover = null);
						hover = target.find('.hover-content').clone();
						wrap.append(hover);
						setPos();
						setTimeout(function(){
							hover && hover.addClass('show-hover');
						}, t2);
					}, t1);
				}, function(){
					clearTimeout(i);
					i = setTimeout(function(){
						hover && hover.removeClass('show-hover');
						setTimeout(function(){
							hover && hover.remove() && (hover = null);
						}, t2);
					}, t1);
				});
			});
		};

		Hover.disableBackpack = function(){
			$('.backpack__item[data-hover]').unbind('mouseenter mouseleave');
		};

		Hover.init();
	};

})( this.jQuery, this, document, this.APP );
