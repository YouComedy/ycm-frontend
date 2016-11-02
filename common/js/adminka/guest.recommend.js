;
(function( APP, window, document, _, $, _gaq ){


this.__guestTimer && clearTimeout(this.__guestTimer);

if(!APP || !APP.ItemsViewer ) {
	return (this.__guestTimer = setTimeout(arguments.callee, 100));
}


var Grid = APP.ItemsViewer,
	Items = Grid.Records;


var STEP_KEY = "reg-step";

var div;

Grid._prequestForm = function(data){
	window.location.href = "/my";
}

Grid._beforeSubmit = function( form ){
	$("#regreg").block();
}

Grid._regFormSuccess = function(data,u1, u2, form){

	if(!data.state) {
		$("#regreg").unblock();

		var input;

		if(data.error_code) {

			$( "[data-errcode="+data.error_code+"]:visible" ).errorTip({
				place : 'right',
				title : data.error_text,
				hide : 3000
			});
		}

		if(data.errors) {
			// console.log(data.errors)
			var errs = data.errors;
			for(var k in errs ) {
				for(var j in errs[k] ) {
					var input = $("input[name='" + k + '[' + j + ']' + "']:visible", form);
					//input.is(":visible") &&
					input.errorTip({
						place : 'right',
						title : errs[k][j] + "",
						hide : 3000
					});
				}
			}
			return;
		}

	} else {
		;
	}
}



window.socialLoginCallback = function( data ){
	data = data.user;
	$("#slide2,#slidereg2")
		.find("img").attr("src", data.avatar).end()
		.find("span.name").text(data.name).end()
		.find("input[name=email]").val(data.email).end();

	if(!Grid._dataFromRegForm) {
		$("#slider").slider(1);
	} else {
		Grid._dataFromRegForm = false;
		$("#regreg").slider(2);
	}
}



		var styles = '<link rel="stylesheet" type="text/css" href="http://static.youcomedy.me/' + window.STATIC_VERSION + '/css/!/pages/prequest.css" media="screen, projection">' +
		'<style>.category__title{padding:5px !important} .category__img{width:100% !important} #reg_form .input_box__input{display: block; border: 1px solid #B0E5F8 !important;border-radius: 3px; !important}#regreg{position: relative;height: 100%;}#regreg:after{position: absolute;display: block;content: "";background: red;width: 360px;height: 390px;top: -140px;left: 590px;background: url("/common/img/pages/single/angel.png") top left no-repeat;z-index: -1;}</style>';
		$("head").append( styles );

		div = $(document.createElement("div"));
		div.addClass("item panel").css({height: "520px", boxShadow: "0 0 15px rgba(0,0,0,0.2)"});

		div.html([
			'<h2 id="regtitle" class="title" style="text-align: center;margin: 25px 0;font-size: 25px;">Получайте персональные рекомендации</h2>',
			'<div id="regreg" class="slider" style="height:420px"><div style="height:100%" class="slider-inner"><ul style="width:400%">',
			'<li style="height:100%;width:25%" class="slider-item active">',

			'<form data-noreset="1" data-before="_beforeSubmit" data-owner="ItemsViewer" data-success="_prequestForm" style="margin:0" action="/register/submitTags" class="regform" method="post">',
				'<input type="hidden" name="async" value="1" />',
				'<div style="margin:0" class="categories">',
					'<div class="row">',
						'<div class="cell">',
							'<input id="c_geek" type="checkbox" name="c_geek">',
							'<label class="category" for="c_geek">',
								'<div class="category__title">Geek</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/geek.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_auto" type="checkbox" name="c_auto">',
							'<label class="category" for="c_auto">',
								'<div class="category__title">Авто</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/auto.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_politic" type="checkbox" name="c_politic">',
							'<label class="category" for="c_politic">',
								'<div class="category__title">Политика</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/politic.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_tv" type="checkbox" name="c_tv">',
							'<label class="category" for="c_tv">',
								'<div class="category__title">Кино и сериалы</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/tv.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_music" type="checkbox" name="c_music">',
							'<label class="category" for="c_music">',
								'<div class="category__title">Музыка</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/music.jpg">',
							'</label>',
						'</div>',
					'</div>',
					'<div class="row">',
						'<div class="cell">',
							'<input id="c_gif" type="checkbox" name="c_gif" checked="">',
							'<label class="category" for="c_gif">',
								'<div class="category__title">GIF</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/gif.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_animal" type="checkbox" name="c_animal" checked="">',
							'<label class="category" for="c_animal">',
								'<div class="category__title">Животные</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/animal.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_sport" type="checkbox" name="c_sport">',
							'<label class="category" for="c_sport">',
								'<div class="category__title">Спорт</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/sport.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_women" type="checkbox" name="c_women">',
							'<label class="category" for="c_women">',
								'<div class="category__title">Женщины</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/women.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_black" type="checkbox" name="c_black">',
							'<label class="category" for="c_black">',
								'<div class="category__title">Черный юмор</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/black.jpg">',
							'</label>',
						'</div>',
					'</div>',

					'<div class="row">',
						'<div class="cell">',
							'<input id="c_comics" type="checkbox" name="c_comics">',
							'<label class="category" for="c_comics">',
								'<div class="category__title">Комиксы</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/comics.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_text" type="checkbox" name="c_text">',
							'<label class="category" for="c_text">',
								'<div class="category__title">Тексты и анекдоты</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/text.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_art" type="checkbox" name="c_art">',
							'<label class="category" for="c_art">',
								'<div class="category__title">Арт</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/art.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_message" type="checkbox" name="c_message" checked="">',
							'<label class="category" for="c_message">',
								'<div class="category__title">Диалоги и переписки</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/message.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_smart" type="checkbox" name="c_smart">',
							'<label class="category" for="c_smart">',
								'<div class="category__title">Интеллектуальный</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/smart.jpg">',
							'</label>',
						'</div>',
					'</div>',

					'<div class="row">',
						'<div class="cell">',
							'<input id="c_love" type="checkbox" name="c_love">',
							'<label class="category" for="c_love">',
								'<div class="category__title">Любовь и отношения</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/love.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_school" type="checkbox" name="c_school">',
							'<label class="category" for="c_school">',
								'<div class="category__title">Школа</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/school.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_fail" type="checkbox" name="c_fail">',
							'<label class="category" for="c_fail">',
								'<div class="category__title">Fail</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/fail.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_it" type="checkbox" name="c_it">',
							'<label class="category" for="c_it">',
								'<div class="category__title">IT</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/it.jpg">',
							'</label>',
						'</div>',
						'<div class="cell">',
							'<input id="c_video" type="checkbox" name="c_video">',
							'<label class="category" for="c_video">',
								'<div class="category__title">Видео</div>',
								'<div class="category__filter"></div>',
								'<img class="category__img" style="height:80px" src="/common/img/pages/quest/big_tags/video.jpg">',
							'</label>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="" style="text-align: center;width: 100% !important;"><button class="button _xlarge">Запустить рекомендации</button></div>',
			'</form>',

			'</li>',

			'<li style="height:100%;width:25%;" class="slider-item">',
				'<div style="width:480px;margin:auto;">',
				'<p style="text-align:center;">Чтобы иметь доступ ко всем возможностям сайта и получать более качественную подборку юмора.</p>',
				'<div style="overflow:hidden;margin:auto;">',
					'<hr class="line" style="margin:25px auto">',
					'<div class="services" style="display:inline-block;width:100%">',
					  '<ul class="auth-services" style="margin:auto 0">',
					          '<li class="auth-service vkontakte">',
					            '<a class="auth-link vkontakte" href="/socialLogin?service=vkontakte"><span class="auth-icon vkontakte"><i></i></span><span class="auth-title ">VK</span></a>		</li>',
					          '<li class="auth-service facebook">',
					            '<a class="auth-link facebook" href="/socialLogin?service=facebook"><span class="auth-icon facebook"><i></i></span><span class="auth-title ">Facebook</span></a>		</li>',
					    '</ul>',
					'</div>',
					'<hr class="line" style="margin:25px auto">',
				'</div>',
				'<form data-noreset="1" style="text-align:center;" data-owner="ItemsViewer" data-before="_beforeSubmit" data-success="_regFormSuccess" id="reg_form" method="post" class="form_login" action="/register/profile">',
					'<input type="text" name="User[username]" placeholder="Логин" id="first-input" class="input_box__input" tabindex="1">',
					'<input type="password" name="User[password]" placeholder="Пароль" class="input_box__input" tabindex="2">',
					'<input type="text" name="User[email]" placeholder="Email" id="first-input" class="input_box__input" tabindex="3">',
					'<button type="submit" tabindex="4" class="button _big" data-errcode="2001">Создать аккаунт</button>',
				'</form>',
				'</div>',
			'</li>',
			'<li class="slider-item slider-item-upload" id="slidereg2" style="width: 25%; padding-top: 80px;">',
				'<p class="_small _textCenter">Введите свой email, чтобы завершить регистрацию.</p>',
				'<div class="account-panel _small">',
					'<img>',
					'<span class="name"></span>',
				'</div>',
				'<form style="text-align: center;" action="/register/social" class="form_login" method="post">',
					'<input style="display: block;" type="text" tabindex="1" class="input_box__input" id="first-input" placeholder="Email" name="email">',
					'<input type="submit" value="Готово" class="button button_red _red _big">',
				'</form>',
			'</li>',
			'<li style="width:25%" class="slider-item"></li>',

			'</ul></div></div>',
		].join(""));

		// Debug
		// $(".item:first").before( div );
		$("#container").append( div );






})(window.APP, window, document, window._, window.jQuery, window._gaq || []);
