// http://demo.sofcase.net/jnotifier-codecanyon/
// https://github.com/diy/intercom.js



;
(function (a, APP, _, doc ) {
    var $ = a, Notify = APP.Notify;

    Notify.set({
        "timer" : 10E3,
        "lastfocus" : +new Date,
        "visible" : 0
    });


    Notify.visibleCounter = function(val){
        var current  = Notify.get("visible");
        if(!val) return current;
        Notify.set("visible", current + val);
    }



    $.win.on({
        'focus' : function(){
            if( +new Date > Notify.get("lastfocus") ) {
                $("#notifier-box .message-box").each(function(i, block){
                    setTimeout(function(){
                        $(block).fadeOut(function(){
                            $(block).remove();
                            Notify.onClose();
                        });
                    }, 4E3 * (i + 1));
                });

                Notify.set("lastfocus", +new Date);
            }

            Notify.set({
                "timer" : 10E3
            });

        },
        'blur' : function(){
            Notify.set('timer', 0);
        }
    });



    var NotifyStack = [];

    Notify.onClose = function(){
        Notify.visibleCounter( -1 );
        var notify = NotifyStack.shift();
        notify && Notify.show.apply(null, notify);
    }



    Notify.show = function( header, content, img, opts ){

        if($.isIphone()) return;

        var action = "";

        if( typeof header === 'object' ) {
            content = header.content || header.html;
            img = header.img;
            opts = header.opts;
            action = header.action;
            header = header.title;
        }

        if( header && !content ) {
            content = header;
            header = "";
        }


        !(opts = opts || {}).click && (opts.click = function(e){
            if(!$(e.target).is("a"))
                window.location.href = APP.User.url() + "/news";
        });

        var visible = Notify.visibleCounter();

        if(visible >= 3) {

            NotifyStack.push([header, content, img, opts]);


        } else {

            showNotification(header, content, img, opts);
            Notify.visibleCounter( 1 );

        }

        if( APP.News && APP.News.Records ) {

            var newsitem = new APP.News.Records.model({action : action, html : content, timestamp: new Date});
            // newsitem.$el.addClass("_new");

            if(APP.News.Records.filterBy ===  "comment") {
                if( content.indexOf("комментарий") > -1 ) {
                    newsitem.view().prepend( true );
                }
            } else {
                newsitem.view().prepend( true );
            }
        }
    }

    Notify.showAll = function( arr ){
        arr && arr.length && _.each( arr, function( msg ){
            Notify.show( msg );
        });
    }


    // Суперглобальная нотификация
    // Показывает огромную штуку над хедером
    Notify.global = function( msg ) {
        var tip = $(".notifyTop"),
            height = tip.innerHeight(),
            aprop = 'marginTop',
            anim = {}, body_anim = {},
            visibile = parseInt(tip.css(aprop)) >= 0;

		$('.notifyTop__content').text(msg)

        if( visibile ) {
            anim[aprop] = height * -1;
            body_anim['paddingTop'] = "-=" + height;
        } else {
            anim[aprop] = 0;
            body_anim['paddingTop'] = "+=" +height;
        }

        $('body').animate(body_anim, function(){
            tip.animate(anim);
        });

    }



    // Нотификация текущего пульзователя
    // Показывается около его ника в правом верхнем
    // углу, со списком новостей и их количеством.
    Notify.summary = function( data ){
        var title = [];

        data = data || {};
        // {
        //     'like' : rnd(0,100),
        //     'comment' : rnd(0, 100),
        //     'follow' : rnd(0, 100),
        //     'repost' : rnd(0, 100)
        // }

        var stats = {
            'like' : data.like || 0,
            'comment' : data.comment || 0,
            'follow' : data.follow || 0,
            'repost' : data.repost || 0
        }

        _.each( stats , function( num, key ){
            title.push("<a href='/news/"+key+"'><b><i class='icon-smallnews-"+key+"'></i>" + num + "</b></a>");
        });

        title.length &&
        //$("#header-user-link")
        $("#menu .navbar-inner .navbar__profile .dropdown").errorTip({

            // Контент
            title : title.join(""),

            // Класс в котором переопределны все свойства
            classname : 'summary-tooltip',

            // Сдвигаем ее на 60 пикселей
            offsetX: -60,

            place : 'in bottom',

            // Есть какой-то баг в бутстрепе при пересчете размеров тултипа
            // Поэтому выставляем ширину тултипа руками, благо она известна.
            // @todo найти и исправить эту ошибку
            actualWidth : 210,

            //Время через которое скрываем нотифайку
            hide: Notify.get('timer')

        })
        .attr("href", $("#header-user-link").attr("href") + "/news");
    }



    Notify.subscribtions = (function(){

        function createCounter(){
            var $c = $("#subscriptions-counter");
            if(!$c.length) {
                $c = $('<span id="subscriptions-counter" class="single-counter"></span>');
                $c.appendTo("#menu a.menu__counterwrapper");
            }
            return $c;
        }

        var $counter = createCounter(), counterVal = 0;


        counterVal = Number($counter.text()) || 0;

        if(counterVal == 0)
            $counter.hide();

        return function( count ){

            if($counter.is(":hidden"))
                counterVal = 0;

            if( count > counterVal ) {

                if(!$counter.length)
                    $counter = createCounter();

				var count_text;
				if (count > 99){
					count_text = '&infin;';
					$counter.css('font-size', 25);
				} else {
					count_text = count;
					$counter.css('font-size', 12);
				}

                $counter.html(count_text);
                counterVal = count;

                if($counter.is(":hidden"))
                    $counter.show().css('opacity', 0).width(0).animate({width: '22px', opacity: 1}, 500);
            }
        }
    })();



    var canvas;

    function apply (url) {
        var link = $('link[rel$=icon]');
        if(link.attr("href") == url) return;
        link.replaceWith('');
        $('head').append(
            $('<link rel="shortcut icon" type="image/x-icon"/>')
                .attr('href', url));
    }

    /**
     * jQuery.favicon
     *
     * @param {String} iconURL
     * @param {String} alternateURL
     * @param {Function} onDraw
     *
     * function (iconURL)
     * function (iconURL, onDraw)
     * function (iconURL, alternateURL, onDraw)
     */
    $.favicon = function(iconURL, alternateURL, onDraw) {

        if (arguments.length == 2) {
            // alternateURL is optional
            onDraw = alternateURL;
        }

        if (onDraw) {
            canvas = canvas || $('<canvas />')[0];
            if (canvas.getContext) {
                var img = $('<img />')[0];
                img.onload = function () {
                    canvas.height = canvas.width = this.width;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(this, 0, 0);
                    onDraw(ctx);
                    apply(canvas.toDataURL('image/png'));
                };
                img.src = iconURL;
            } else {
                apply(alternateURL || iconURL);
            }
        } else {
            apply(iconURL);
        }

        return this;
    };



    Notify.faviconAlert = function(){
        if(Notify._faviconTimer) return;
		var is_active = true;

        Notify._faviconTimer = setInterval(function(){
            Notify.setFavicon(is_active = !is_active)
        }, 1333);
    };

	Notify.clearFaviconAlert = function(){
		Notify.setFavicon(false);
		clearInterval(Notify._faviconTimer);
		Notify._faviconTimer = null;
	};


	Notify.setFavicon = function(is_blinking){
		var icons = ['/favicon.ico', '/favicon-new.ico'];
		$.favicon(icons[~~is_blinking]);
	};


    // mHeader, mContent, mImage, mOptions
    function showNotification(b, c, d, e) {
        var f, g, h, i, j, k, l;
        e = a.extend({
            lifeTime: Notify.get('timer') || 0,
            click: undefined,
            close: undefined,
            customClass: ""
        }, e);


        // Основной контейнер для списка увеломлений
        f = a("#notifier-box");
        if (!f.length) {
            f = a("<div>", {
                id: "notifier-box"
            }).appendTo(document.body)
        }


        // Блок одного уведомления
        g = a("<div>", {
            "class": "message-box",
            css: {
                display: "none"
            }
        });

        // Заголовок
        messageHeader = a("<div>", {
            "class": "message-header",
            html: b
        });

        // Контент
        h = a("<div>", {
            "class": "message-body",
            //html : c
            //html : "<i class='news_icon news_icon_like'></i><p>%actor% %action% %username%</p><span class='newslist__time'>{{= timestamp }}</span>"
        });

        //
        i = a("<div>", {
            html: c
             //html: "<i class='news_icon news_icon_like'></i><p>%actor% %action% %username%</p><span class='newslist__time'>{{= timestamp }}</span>"
        });


        j = a("<a>", {
            "class": "message-close",
            href: "#",
            title: "Закрыть"
            // click: function () {
            //     a(this).parent().fadeOut(500, function () {
            //         a(this).remove()
            //     })
            // }
        }).on("click", function(){
             a(this).parent().fadeOut(500, function () {
                a(this).remove()
            });
             return false;
         });

        if (typeof d != "undefined") {
            k = a("<div>", {
                "class": "thumb"
            });
            l = a("<img>", {
                src: d
            })
        }
        g.appendTo(f).fadeIn(500);
        j.appendTo(g);
        messageHeader.appendTo(g);
        h.appendTo(g);

        if (typeof k != "undefined") {
            k.appendTo(h);
            l.appendTo(k)
        }

        i.appendTo(h);
        if (e.lifeTime > 0) {
            setTimeout(function () {
                a(g).fadeOut(500, function () {
                    a(this).remove();
                    Notify.onClose();
                })
            }, e.lifeTime)
        }
        if (e.customClass != "") {
            g.addClass(e.customClass)
        }

        if (typeof e.click != "undefined") {
            g.click(function (a) {
                if (!$(a.target).is(".message-close")) {
                    e.click.call(this ,a);
                }
            })
        }

        if (typeof e.close != "undefined") {
            g.click(function (a) {
                if ($(a.target).is(".message-close")) {
                    e.close.call(this);
                    return false;
                }
            })
        }

        g.click(function (e) {
            var target = $(e.target);
            //if(!target.is(""))
            g.fadeOut(500, function(){
                g.remove();
                Notify.onClose();
            });
        })
        return this
    }



    var _popoverLikeBtn = '.item__buttonWrap[data-vote="like"]',
        // _popoverLikeBtn = '.item__button:has(.item__buttonWrap[data-vote="like"])',
        _popoverDislikeBtn = '.item__dislike';


    var _popoversList = {

        "like_fst" : {
            content  : "С первым лайком! Каждая оценка делает рекомендации точнее.",
            selector : _popoverLikeBtn,
            context  : "#i",
            place    : "in bottom"
        },


        "like_share" : {
            content  : "Понравилась шутка? Скинь ссылку другу!",
            selector : _popoverLikeBtn,
            context  : "#i",
            place    : "bottom"
        },

        "like_subscribe" : {
            content  : [
				"Подписывайтесь на пользователей, чтобы следить за их шутками!",
                "<a href='/user/{username}' data-href='/user/{user_id}/follow' data-follow='{user_id}' data-uid='{user_id}' onclick='APP.User.setFollow(this,{success:function(){$.alertInfo(\"Вы успешно подписались на {username}\")}});return false'>Подписаться!</a>"
			].join(""),
            selector : _popoverLikeBtn,
            context  : "#i",
            place    : "bottom"
        },

        "like_repost" : {
            content  : "Делайте репост, чтобы добавить шутку в свою ленту. Если у вас есть подписчики, то они увидят ее в своей ленте.",
            selector : _popoverLikeBtn,
            context  : "#i",
            place    : "bottom"
        },


        "like_upload" : {
            content  : "Загружайте шутки, чтобы тоже получать лайки! <br><a href='/add'>Добавить шутку</a>",
            selector : _popoverLikeBtn,
            context  : "#i",
            place    : "bottom"
        },

        "like_nodislike" : {
            content  : "Ставьте дислайки, чтобы больше не видеть плохие шутки в своих рекомендациях!",
            selector : _popoverLikeBtn,
            context  : "#i",
            place    : "bottom"
        },

        "like_repeat_share" : {
            content  : "Крутыми шутками надо делиться! Скиньте ссылку другу или поделитесь ею в социальной сети.",
            selector : ".b-share",
            context  : "#i"
        },


        "dislike_fst" : {
            content  : "Воу! Первый дислайк! Дислайки помогают нам убирать \"негодный\" контент из ваших рекомендаций.",
            selector : _popoverDislikeBtn,
            context  : "#i"
        },

        "repost_fst" : {
            content  : "Ае, ваш первый репост! Теперь ваши подписчики его увидят. Нет подписчиков? <a href='/friends/invite'>пригласите друзей</a>, с ними веселее.",
            selector : "#upload"
        },


        "repost_all" : {
            content : "Похоже, вам понравилась шутка :) Поделитесь ей с друзьями, чтобы поднять им настроение!",
            selector: "#upload",
        },

        // "" : {
        //     content  : "",
        //     selector : ""
        // }}

		"have_to_vote" : {
            content  : "Стой! Не забудь оставить оценку!",
            selector : _popoverLikeBtn,
            context  : "#i",
            place    : "in bottom"
        },
    }



    var _popoverTPL = [
        '<div class="popover _black _banana">',
            '<div class="popover-banana"></div>',
            '<a class="popover-close" onclick="try{event.stopPropagation();window.event&&(window.event.cancelBubble=!0);}catch(e){};$(this.parentNode).fadeOut(function(){$(this).remove()});return false;"></a>',
            '<div class="arrow"></div>',
            '<div class="popover-inner">',
                '<div class="popover-content"></div>',
            '</div>',
        '</div>'
    ].join("");







    Notify.insertPopover = function( opts ) {

        var popover = _popoversList[opts.type];

        if( popover ) {

            popover = $.extend({
                place : "in bottom",
                template : _popoverTPL
            }, popover);

            var selector = popover.selector, context;

            if( opts.id && popover.context ) {
                context = popover.context + opts.id;
            } else {
                context = document;
            }

            var element = $( context ).find( selector );

            popover.content = stringTpl(popover.content, opts);

            element.popover2( popover ).popover("show");
            return false;


        }

    }




	var _blockTPL = [
		'<div class="panel _clear bannerPanel {type}">',
			'<div class="bannerPanel__imageWrap {imgClass}">',
				'<img class="bannerPanel__image" src="/common/img/blocks/{img}" alt="">',
			'</div>',
			'<a href="#" onclick="$(this.parentNode).fadeOut(function(){$(this).remove()});$.post(\'/closeBlock?type={type}\');return !1;" class="btnClose"></a>',
			'<div class="bannerPanel__content">',
				'<h3 class="bannerPanel__title">{header}</h3>',
				'<div class="bannerPanel__text">{content}</div>',
			'</div>',
		'</div>'
	].join('');

	var _blocksList = {

		"block_first_popular" : {
            appear   : "prependTo",
            header : "Используйте фильтры времени",
            content  : "Находясь в популярном, вы можете использовать фильтры времени в правом верхнем углу, чтобы видеть больше шуток (“новое”) или только самые сливки (“24 часа”).",
            img : "1-9.png"
        },

		"block_first_comments" : {
            header : "Оставляйте комментарии",
            content  : "Не стесняйтесь оставлять комментарии, ведь это еще одна возможность заработать лайки на YouComedy. Кто знает, может именно ваш комментарий станет началом какого-нибудь интересного обсуждения ;)",
            img : "1-6.png"
        },

		"block_first_return" : {
            header : "Заходите ежедневно",
            content  : "1) Получить порцию свежих шуток<br>2) Проверить свои новости<br>3) Залить на сайт новую шутку и получить еще больше лайков",
            img : "1-1.png"
        },

		"block_first_add_mypage" : {
            // appear   : "prependTo",
            header : "Добавляйте больше шуток",
            content  : "Знаете много хороших шуток, а может создаете их сами? Добавляйте шутки на сайт, чтобы заработать лайки и стать популярным!",
            img : "1-4.png",
            btn : "<a href='/add' class='button _xlarge'>Добавить шутку</a>"
        },

		"block_first_hall" : {
            header : "На каком вы месте в рейтинге?",
            content  : "Узнать насколько вы круты можно в разделе Зал славы. Также в данном разделе вы найдете много интересных каналов и сможете посмотреть топ шуток за все время.",
            img : "1-5.png",
            btn : "<a href='/hall' class='button _xlarge'>В зал славы</a>"
        },

		/*"block_first_add" : {
            header : "Ваша лента",
            content  : "YouComedy - это отличное место для ваших шуток. Собирайте весь любимый юмор в своей ленте, делитесь с друзьями и все это не засоряя свои социальные ленты.",
            img : "feed.png",
            btn : "<a href='/subscriptions' class='button _xlarge'>В мою ленту</a>"
        },*/

		"block_first_recommend" : {
            header : "Улучшай свои рекомендации",
            content  : "Ставьте больше лайков и дислайков, так мы сможем точнее подбирать шутки именно для вас. Чем больше мы знаем о вашем вкусе, тем круче шутки в рекомендациях ;)",
            img : "1-8.png"
        },

		"block_first_be_active" : {
            header : "Как стать популярным?",
            content : "Проявляйте активность, чтобы вас заметили. Ставьте лайки, делайти репосты, подписывайтесь на пользователей и оставляйте комментарии. Не забывайте грузить шутки, главное, чтобы они были свежие и смешные ;)",
            img : "1-7.png"
        },

		"block_first_dislike" : {
            header : "Не понравилась шутка<br>или комментарий?",
            content  : "Специально для таких случаев мы сделали кнопку “дислайк”. Нажмите на нее, чтобы понизить шутку или комментарий в общем рейтинге и помочь нам лучше понять ваш вкус.",
            img : "1-3.png"
        },

		"block_first_my_feed" : {
			appear   : "prependTo",
			header : "Моя лента",
			content : "Это – ваша лента! Здесь будут шутки людей, на которых вы подписались. Мы уже позаботились о том, чтобы вы видели в своей ленте обновления ваших друзей из социальных сетей и популярных пользователей YouComedy.<br><br>P.S. Если чьи-то шутки перестали вам нравиться, вы всегда можете отписаться от них в профиле пользователя.",
			img : "1-2.png",
			imgClass: "_bottom"
		},


        "guest_block" : {
            header : "Мы будем тебя помнить!",
            content : "Создай аккаунт на YouComedy чтобы мы не забыли твои интересы и сохраняли твои отметки 'нравится'.<br><br>P.S. Ты также сможешь оставлять и оценивать комментарии, добавлять на сайт шутки, подписываться на пользователей и теги, и многое-многое другое!",
            img : "1-2.png",
            imgClass: "_bottom"
        },

		"block_calibration_1" : {
			custom: true,
            content :
				['<div class="calibrate_1 _clear">',
					'<div class="calibrateLamp"></div>',
				'</div>'].join('')
        },

		"block_calibration_2" : {
            custom: true,
            content:
			['<div class="calibrate_2 _clear">',
				'<img src="/common/img/quest/hi.png">',
				'<p style="font-size:30px">Не хотели бы вы поговорить об<br>алгоритме рекомендаций?</p>',
				'<img src="/common/img/quest/niger.png">',
				'<p>Каждый раз, ставя лайк или дислайк, вы помогаете<br>нашему Мега-Мозгу лучше понять ваше чувство юмора.</p>',
				'<img src="/common/img/quest/krang.png">',
				'<p>Так вы улучшаете не только свои рекомендации,<br>но и влияете на рейтинг авторов и их шуток.</p>',
				'<p style="font-size:72px">.<br>.<br>.</p>',
				'<p style="font-size:40px;margin-top:80px">',
					'ГИПНОЖАБА ПОВЕЛЕВАЕТ:</p>',
				'<p style="font-size:50px;margin:10px 0 -60px"><b>С</b><b>Т</b><b>А</b><b>В</b><b>Ь</b>&nbsp;<b>Л</b><b>А</b><b>Й</b><b>К</b><b>И</b><b>!</b></p>',
				'<img src="/common/img/quest/hypnofrog.gif">',
			'</div>'].join('')
        }
	};

    Notify.insertBlock = function( data ) {
		var items_count = APP.Globals.Items.items_count;
		var resp_count = APP.Globals.Items.resp_count;
		var offset = items_count - resp_count;

		$.each(data, function(i){
			var opts = data[i];

			var block = _blocksList[ opts.type ];
			if( block ) {

				block.img = block.img || "first_visit.png";
				opts = $.extend(block, opts);
				opts.btn = opts.btn || "";

				var $block = $(doc.createElement('div'));

				if (opts.custom){
					$block.html(opts.content);
				} else {
					$block.html(stringTpl(_blockTPL, opts));
					var textBlock = $block.find(".bannerPanel__text").html( block.content );
					var contentBlock = $block.find(".bannerPanel__content");

					if( opts.btn ) {
						contentBlock.append("<br/>" + opts.btn);
					}
				}

				if (opts.position){
					(opts.position > resp_count) && (opts.position = resp_count);
					$('#container').find('.item').eq(opts.position - 1 + offset).before($block[0].firstChild);
				} else {
					$($block[0].firstChild)[block.appear || "appendTo"]("#container");
				}
			}
		});
    }


})(this.jQuery, this.APP, this._, document);
