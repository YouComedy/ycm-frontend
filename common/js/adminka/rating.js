/**
 * Основной функционал панели администратора
 * 	- Регистрация новых пользователей
 * 	- Просмотр статистики пользователей
 */
;
(function( $, window, document, APP ){



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Workarounds
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


 	var Rating = new APP.Module({
		'name' : "Rating",  
		'inited' : false,
		'files' : [
			"/common/js/profile/collections.js"
		]
	});


 	var Albums = new (window.Collection.extend({
 		url: "/rating/collections/load",
 		model : APP.models.Album.extend({
 			'defaults' : {
 				'title' : '',
				'description' : '',
				'blank' : true,
				'collection_content_count' : 0,
				'followers_count' : 0,
				'public' : 1,
				'action_word' : "Подписаться",
				'followed' : false,
				'my' : false,
				'followURL' : "#",
				'username' : ""
 			}
 		}),
 		parse : function(resp){
 			this.limiter = resp.limiter || false;
 			return resp.collections;
 		}
 	}));


 	Albums.query("period", $.cookie("RATING_COLLECTIONS_PERIOD"));


 	// Albums.query({
 	// 	"period" : 0
 	// });


 	var $sidebar = $$("#rating-sidebar-list"),
 		$tiles   = $$("#rating-main-list");


 	var AlbumRow = Backbone.View.extend({
 		template: _.template($("#rating-row-tpl").html()),
 		tagName : "li",
 		className: "side-rate-item",
 		render:function(){this.$el.html(this.template(this.model.toJSON())).appendTo($sidebar);}
 	});


 	var AlbumTile = Backbone.View.extend({
 		template: _.template($("#rating-tile-tpl").html()),
 		tagName : "div",
 		className: "rate-block",
 		events : {'click [data-aid]' : "follow"},
 		render:function(){this.model._rendered=1;this.$el.html(this.template(this.model.toJSON())).appendTo($tiles);},
 		follow : function ( evt ) {
 			var model = this.model;
			APP.User.setFollow( evt.currentTarget, {
				model: this.model,
				btn : $(evt.currentTarget),
				btn_wtype : 'innerWidth',
				type: 'album',
				success : function( undefined, state, data ){
					$.alertOk && $.alertOk("Все получилось!");
					$$("#header-collections-empty").trigger("checkVisibility");
				}
			});
			return false
 		}
 	});


 	Albums.on('successLoad', function() {
 		// alert(Albums.currentPage)
 		Albums.each(function(albm) {
 			Albums.currentPage == 2 && (new AlbumRow({model: albm})).render();
 			!albm._rendered && (new AlbumTile({model: albm})).render();
 		});
 	});


 	Rating.setPeriod = function ( period ) {
 		if(Albums.isBusy()) return false;
 		$(this).makeActive( true );
 		$sidebar.empty();
 		$tiles.empty();
 		Albums.resetAll();
 		Albums.query("period", period);
 		Albums.loadNext();
 		$.cookie("RATING_COLLECTIONS_PERIOD", period);
 	}

 	Rating.init = function(){
 		Albums.loadNext();

 		($.win = $(window)).scroll(function(){
			($.win.scrollTop() > $.doc.height() - $.win.height() - 500)
					&& Albums.loadNext();
		});

 		$$("#header-collections-empty").on("checkVisibility", function(argument) {
 			var banner = $(this);
 			if(APP.User.get("followingAlbums").length >= 5){
 				banner.is(":visible") && banner.slideUp();
 			} else {
 				banner.is(":hidden") && banner.slideDown();
 			}
 		});

 	}
	
	


	// Initialize module
	//!People.get("inited") && 
	Rating.safecall("init");
	


})( jQuery, this, document, this.APP );