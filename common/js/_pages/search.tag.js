

;
(function( $, window, document, APP ){


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Vars definition
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	/**
	 * Defining new module
	 * @module Tagsistrator
	 */
	var Tags = new APP.Module({
		'name' : "SearchTags",
		'inited' : true,

		// Extra data

		'urlRoot' : '/tag/{tid}/load'
	}),

	Tags_counter = 0,

	TagsModel = Backbone.Model.extend({
		defaults : {
			medium_image : null,
			tid : "",
			tstr : "",
			last_updated : "",
			cnt : 0,
			followersCount : 0
		}
	}),

	TagsList = Tags.Records = new (Backbone.BaseCollection.extend({
		urlRoot : "/search/load",
		model : TagsModel,
		dataField: "data",
		url : function(){
			return this.urlRoot
		}
	}));


	// Define Items collection
	// Users.dataField = "data";



	// Set the default view
	TagsList.view = Backbone.View.extend({
		'tagName' : 'div',
		'className' : 'panel subscribePanel',
		'template' : _.template([
				'<div class="_cell">',
					'<a href="#" class="thumb"><img class="thumb__img" src="{{= medium_image || \"/common/img/tags/sharp.png\" }}"></a>',
					'<a href="/tag/{{= tstr }}" class="title">#{{= tstr }}</a>',
					'<div class="remark">последнее добавление: {{= last_updated }}</div>',
				'</div>',
				'<div class="subscribePanel__stat _cell">',
					'<div class="title">{{= (cnt || 0) }}</div>',
					'<div class="subscribePanel__statLabel">{{= plural(cnt, ["шутка","шутки","шуток"]) }}</div>',
				'</div>',
				// '<div class="subscribePanel__stat _cell">',
				// 	'<div class="title">{{= (followersCount || 0) }}</div>',
				// 	'<div class="subscribePanel__statLabel">{{= plural(followersCount, ["подписчик","подписчика","подписчиков"]) }}</div>',
				// '</div>',
				// '<div class="subscribePanel__buttonWrap _cell">',
					// '{{=APP.User.renderFollowBtn(0, id)}}',
				// '</div>'
		].join("")),
		'render' : function(){
			this.$el.html(this.template(this.model.toJSON()));
			$$("#TagsList").append(this.$el);
		}
	});


	// Auto render
	TagsList
		// .on("add", function( model ){
			// 	user.isFollowed();
			// 	user.set( 'index', ++Tags_counter);
			// });
		.on('successLoad', function(){
			// if( $$("#TagsList").height() < $(window).height() )
			// 	TagsList.loadNext();
			TagsList.each(function( tag ) {
	 			!tag._rendered && (new TagsList.view({model: tag})).render();
	 		});
		})
		.on("beforeLoad", function(){
			$$("#searchBlock").block();
		})
		.on("completeLoad", function(){
			$$("#searchBlock").unblock();;
		})
		.on("reset", function(){
			$$("#TagsList").empty();;
		})
		// .on("itemsMissed", function(){
		// 	// alert("itemsMissed");
		// 	// $$(TagsList.emptyElement).show();
		// })
		// .on("maxItems", function() {
		// 	if(DEBUG) alert("maxItems");
		// 	$$(TagsList.seenElement).show();
		// });




	var oldVal = "";

	Tags.go = function(){
		var val = $.trim($$("#searchBlock__input").val());
		if( val == oldVal ) return;
		oldVal = val;
		TagsList.resetAll();
		TagsList.query("q", val);
		TagsList.loadNext();
		APP.go(window.__APP_goBack_URL + "?q=" + val);
	}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Workarounds
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	// $(window).scroll(function(){
	// 	($.win.scrollTop() > $(document).height() - $.win.height() - 500)
	// 			&& TagsList.loadNext();
	// });


	$$("#searchBlock__input").on("keydown", function(evt){
		if(evt.keyCode == 13) {
			return !!Tags.go();
		}
	});


	TagsList.query("q", $.trim($$("#searchBlock__input").val()));
	TagsList.loadNext();


})( this.jQuery, this, document, this.APP );