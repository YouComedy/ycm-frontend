/**
 * Основной функционал панели администратора
 * 	- Регистрация новых пользователей
 * 	- Просмотр статистики пользователей
 */
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
		'name' : "People",  
		'inited' : true,
		'autoload' : true,
		// Extra data
		'urlRoot' : '/rating/people/load'
	}),
	
	people_counter = 0;
	
	
	// Define Items collection
	var Users = People.Records = new APP.collections.Users;
	
	// Set the different url root
	Users.urlRoot = People.get("urlRoot");
	
	// Set the default view
	Users.view = APP.views.UserRow;
	
	// Be sure that its "followed" is correct
	Users.on('add', function( user ){
		user.isFollowed();
		user.set( 'index', ++people_counter);
	});
	
	// Auto render
	Users.on('successLoad', function(){
		if( $("#people-table-body").height() < $(window).height() )
			Users.loadNext();
	});


	

	

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Users view
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Initialize 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	People.init = function(){
		People.takeControl();
		var defaultPeriod = ($._GET() || {}).p;
		defaultPeriod && People.setPeriod( defaultPeriod, true );
		Users.loadNext();
	}
	
	
	// Initialize module
	//!People.get("inited") && 
	






	People.setPeriod = function ( period, useSelector ) {

		if(Users.isBusy()) return false;

		people_counter = 0;
 		
 		var selector = useSelector === true,
 			btn = $(selector ? 'li[data-action="setPeriod"]' : this);

 		selector &&  (btn = btn.filter('[data-param="'+period+'"]'));
 		btn.makeActive( true );

 		$$("#people-table-body").empty();
 		Users.resetAll();
 		Users.query("period", period);
 		Users.loadNext();
 		$.cookie("RATING_PEOPLE_PERIOD", period);
 		APP.go(window.__APP_goBack_URL + "?p=" + period);
 	}


 	People.on("loadNext", function(){
 		Users.loadNext();
 	});




 	// try {
		
	// } catch(e) {
		// Users.query('period', $.cookie("RATING_PEOPLE_PERIOD"));
	// }
	



 	$( People.init );




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Workarounds
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	// $(window).scroll(function(){
	// 	($.win.scrollTop() > $(document).height() - $.win.height() - 500)
	// 			&& Users.loadNext();
	// });
	

})( this.jQuery, this, document, this.APP );