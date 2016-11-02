

;
(function( $, window, document, APP ){


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Vars definition
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	/**
	 * Defining new module
	 * @module Peopleistrator
	 */
	var People = new APP.Module({
		'name' : "SearchPeople",  
		'inited' : true,
		
		// Extra data
		
		'urlRoot' : '/search/peopleLoad'
	}),
	
	people_counter = 0;
	
	// Define Items collection
	Users = new APP.collections.Users;
	Users.dataField = "data";

	
	// Set the different url root
	Users.urlRoot = People.get("urlRoot");
	
	// Set the default view
	Users.view = Backbone.View.extend({

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

		'render' : function(){
			this.$el.html(this.template(this.model.toJSON()));
			$("#peopleList").append(this.$el);
		}
	});
	
	// Be sure that its "followed" is correct
	Users.on('add', function( user ){
		user.isFollowed();
		user.set( 'index', ++people_counter);
	});
	
	// Auto render
	Users.on('successLoad', function(){
		if( $("#peopleList").height() < $(window).height() )
			Users.loadNext();
		Users.each(function(user) {
 			!user._rendered && (new Users.view({model: user})).render();
 		});
	});


	Users.on("beforeLoad", function(){
		$$("#searchBlock").block();
	});


	Users.on("completeLoad", function(){
		$$("#searchBlock").unblock();;
	});


	Users.on("reset", function(){
		$$("#peopleList").empty();;
	});



	var oldVal = "";

	People.go = function(){
		var val = $.trim($$("#searchBlock__input").val());
		if( val == oldVal ) return;
		oldVal = val;
		Users.resetAll();
		Users.query("q", val);
		Users.loadNext();
		APP.go(window.__APP_goBack_URL + "?q=" + val);
	}
	


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Workarounds
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	$(window).scroll(function(){
		($.win.scrollTop() > $(document).height() - $.win.height() - 500)
				&& Users.loadNext();
	});


	$$("#searchBlock__input").on("keydown", function(evt){
		if(evt.keyCode == 13) {
			return !!People.go();
		}
	});


	Users.query("q", $.trim($$("#searchBlock__input").val()));
	Users.loadNext();
	

})( this.jQuery, this, document, this.APP );