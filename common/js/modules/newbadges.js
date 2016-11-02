(function( $, window, document, APP ){

	var Badges = APP.NewBadges;
	Badges.set("inited", true);


	var badges_bg = function(id){
		var bg = '/common/img/profile/badges/';
		switch(id) {
			case 702:
				bg += 'badge-back-stone.jpg';
				break;
			case 703:
				bg += 'badge-back-lava.jpg';
				break;
			case 4500:
				bg += 'badge-back-steel.jpg';
				break;
			case 8000:
				bg += 'badge-back-musya.jpg';
				break;
			default:
				bg += 'badge-back.jpg';
		}
		return bg;
	}

	Badges.FancyDialog = new function(){
		$$('body').prepend([
			'<div class="fancy-dialog-overlay">',
				'<div class="fancy-dialog">',
					'<div class="fancy-dialog-close btnClose _big"></div>',
					'<div class="fancy-dialog-content _clear"></div>',
				'</div>',
			'</div>'
		].join(''));

		var dialog = $$('.fancy-dialog');
		var content = dialog.find('.fancy-dialog-content');

		$$('.fancy-dialog-overlay').click(function(e){
			if (e.target !== e.currentTarget) return;
			Badges.FancyDialog.close();
		});

		$$('.fancy-dialog-close').click(function(){
			Badges.FancyDialog.close();
		});

		this.open = function(o){
			o = o || {};

			dialog[0].removeAttribute('style');
			dialog[0].className = 'fancy-dialog';
			o.content && content.empty().append(o.content);
			o.className && dialog.addClass(o.className);

			setTimeout(function(){
				$$('body').addClass('fancy-dialog-show');
			}, 99);

			return dialog;
		};

		this.close = function(){
			setTimeout(function(){
				$$('body').removeClass('fancy-dialog-show');
			}, 99);
		};
	};

	Badges.showBadge = function(o){
		var id = o.id;
		var title = o.title || '';
		var description = o.description || '';
		var reward = o.reward;
		var link = o.link || window.location.protocol + '//' + window.location.host
			+ '/user/' + APP.User.get('username') + '?badge=' + id;

		var img = new Image();
		var bg_img = badges_bg(id);


		img.onload = function(){
			Badges.FancyDialog.open({
				className: 'dialogBadge dialogBadge-' + id,
				content:
					[
						'<div onclick="APP.NewBadges.FancyDialog.close()">',
							'<div class="dialogBadge__head">Достижение</div>',
							'<div class="dialogBadge__title">' + title + '</div>',
							'<div class="dialogBadge__image" data-badge-image="' + id + '"></div>',

							reward ? '<div class="dialogBadge__reward">' + reward + '</div>' : '' ,

							'<div class="dialogBadge__text">' + description + '</div>',
							'<div class="dialogBadge__share">',
								'<div id="badge-share"></div>',
								'рассказать друзьям',
							'</div>',
						'</div>'
					].join('')
			}).css('background-image', 'url(' + bg_img + ')');

			new Ya.share({
				element: 'badge-share',
				elementStyle: {
					'type': 'none',
					'border': false,
					'quickServices': ['vkontakte', 'facebook']
				},
				title: o.link ? '' : 'У меня новое достижение "' + title + '"!',
				image: '/common/img/profile/badges/big/' + id + '.png',
				link: link
			});
		};
		img.src = bg_img;
	};

}(jQuery, window, document, APP));