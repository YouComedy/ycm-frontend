/**
 * Стартовая страница профиля;
 * На ней выводятся все итемы добавленные пользователем
 */
;
(function( $, window, document, APP ){

	if($.isIphone()) return;


	var AllItemsModule = new APP.Module({
		'inited' : true,
		'name' : "AllItems",
		'autoload' : true
	}),

	AllItems = AllItemsModule.Records = new (APP.collections.Items.extend({
		'urlRoot' : "/user/" +  window.profile_user_name + (window.__APP_Profile_liked ? "/liked/list" : "/all")
	}));


	AllItems
		.on('itemsMissed', function(){
			$$(AllItems.emptyElement).show();
		})
		.on("maxItems", function() {
			$$("#seenItems").show();
		});

	AllItems.renderAll = function(){

		var INDEX = 0,
			COLUMNS_COUNT = 3;

		AllItems.each(function( item ){
			if( !item._rendered ) {
				item._index = INDEX++;

				if($.isIphone()){
					var view = new APP.views.ItemMobile({model: item});
					view.render();
				} else {
					if( window.use_big_grid ) {
						(new APP.views.ItemBig({
							model: item
						})).render();
					} else {
						(new APP.views.ItemGridMain({model: item})).renderTo(
							"#container"
							// "#panel-AllItems"
							// "#panel-aitems-" + (item._index % COLUMNS_COUNT)
						);
					}
				}
			}
		});

	}

	AllItems.on("successLoad", function(){
		AllItems.renderAll();
	});

})( this.jQuery, this, document, this.APP );