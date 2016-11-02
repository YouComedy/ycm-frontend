;
(function( window, $, app, _ ){


	var sv = window.STATIC_VERSION,
		 b = "/common", include = function( type, file, opts ){
		 	var src = "/common/", o = opts,
		 		mobile = !!window.IS_MOBILE, only, path;

		 	if(!o){o = "D", mobile = false;}

		 	// Автоматический инклюд
		 	// На дексктопе загружаются десктопные скрипты
		 	// На мобиле - мобильные
		 	if(o === "A")
		 		return src + type + (mobile ? '/_mobile/' : '/') + file + '?' + sv;

		 	// Дексктопный инклюд - загрузка файла только для десктопа
		 	if(o === "D")
		 		return mobile ? "-" : src + type + '/' + file + '?' + sv;

		 	// Мобильный  - только для мобильных
		 	if(o === "M")
		 		return !mobile? "-" : src + type + '/_mobile/' + file + '?' + sv;
		 },

		js = function(p,m){return include("js", p, m)},
		css = function(p,m){return include("css", p, m)},
		tpl = function(p,m){return include("tpl", p, m)}

	_.each([




		// Показ ломаной сетки
		{
			'name' : 'ItemsViewer',
			'inited' : false,
			files : [
				js("adminka/grid.js")
			]
		},


		// Показ ломаной сетки
		{
			'name' : 'Moderator',
			'inited' : false,
			files : [
				// js("adminka/grid.js"),
				tpl("moderator.item.html"),
				js("modules/moderator.js"),

				// Такая тема.
				// Изза невозможности использовать safecall внутри safecall
				// Добавляем в этот модуль файлы из попапа и автокомплита
				// Хуево конечно, но по-другому пока никак
				js("~packs/autocomplete.js"),
				css("!/pack.ui.autocomplete.css")
			]
		},




		// Просмотр итемов в попапе
		{
			"name" : "Popup",
			"inited" : false,
			files : [
				css("!/pack.ui.misc.css"),
				js("adminka/popup.js")
			]
		},



		// Работа с коллекциями
		{
			"name" : "Albums",
			"inited" : false,
			"files" : [
				js("widgets/dialog.js")
				// , js("profile/collections.js")
				, css("profile.css", "D")
			],
			"deps" : "Dialog"
		},



		// Виджет функциональных попапов
		{
			"name" : "Dialog",
			"inited" : false,
			"files" : [js("widgets/dialog.js")]
		},



		// Виджет уведомлений
		{
			"name" : "Notify",
			"inited" : false,
			"files" : [
				js("libs/ui/notifications.js"),
				css("!/pack.ui.misc.css")
			]
		},

		// Виджет автокомплита
		{
			"name" : "Autocomplete",
			"inited" : false,
			"files" : [
				js("~packs/autocomplete.js"),
				css("!/pack.ui.autocomplete.css")
			]
		},


		//
		{
			"name": "Utils",
			"inited" : false,
			"files": [
				js("utils.js")
			]
		},


		//
		{
			"name": "Recommend",
			"inited" : false,
			"files": [
				js("profile/recommend.js")
			]
		},


		{
			"name" : "Social",
			"inited" : false,
			"files" : [
				"http://connect.facebook.net/en_US/all.js",
				js("modules/social.js")
			]
		},


		{
			"name" : "localShare",
			"inited" : false,
			"files" : [
				js("widgets/dialog.js"),
				js("widgets/localshare.js"),
				js("~packs/autocomplete.js"),
				css("!/pack.ui.misc.css"),
				css("!/pack.ui.autocomplete.css"),
			]
		},


		{
			'name' : 'EditRepost',
			'inited' : false,
			'files' : [
				tpl("albums/add-edit-dialog.html", "A"),
				js("modules/editrepost.js"),
				js("~packs/autocomplete.js"),
				css("!/pack.ui.misc.css"),
				css("!/pack.ui.autocomplete.css"),
			]
		},

		// {
		// 	name : "Popover",
		// 	inited : false,
		// 	files : [
		// 		css("!/pack.ui.misc.css"),
		// 		js("widgets/popover.js"),
		// 	]
		// },


		{
			'name' : 'Tester',
			'inited' : false,
			'files'  : [
				js("__V2/~tests/_core/core.js"),
				js("__V2/~tests/_core/jq.simulate.js"),
				js("__V2/~tests/_core/bililiterange.js"),
				js("__V2/~tests/_core/sendkeys.js")
			]
		},


		{
			'name' : "Subscriptions",
			'inited' : false,
			'autoload' : true,
			'files' : [
				js('profile/_followers.js')
			]
		},


		{
			"name" : "NewBadges",
			"inited" : false,
			'autoload' : true,
			"files" : [
				js("modules/newbadges.js"),
				css("!/widgets/profile/newbadges.css")
			]
		},




	// Convert them to modules
	], function( module ){
		new APP.Module( module );
	});

})(window, window.jQuery, window.APP, window._ );