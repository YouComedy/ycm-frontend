;
(function( $, window, document, APP ){


	var Badges = new APP.Module({
		'name' : "Badges",  
		'inited' : true,

		// Module opts
		'editmode' : APP.Profile.isME && APP.Profile.isME()
	});
	
	
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Panel events handling
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

 	Badges.toSidebar = function(){

 	}


 	Badges.sidebarPut = function(){}

 	Badges.sidebarSwap = function(){}


 	Badges.updtSBIndex = function(){
 		var badges_data = {}, tmp;

 		$("#badges-list-sidebar").children().filter(":not([style])").each(function(i){
 			badges_data["cell" + (++i)] = (tmp = $(this)).attr('data-index', i).attr("data-id");
 		});

 		$.post("/user/" + APP.User.get("username") + "/setBadges", badges_data, function(data){
 			data = $.exec( data );
			if( data && data.state ) {
				$.alertOk("Все получилось!");
			} else {
				$.alertError("Не получилось :(");
			}
 		});

 	}


 	// Пользователь находится в своем профиле
 	// и может редактировать свои беджи
 	if(Badges.get("editmode")){

 		function draginit(evt, drag){
 			// Badges.get('dragenabled') ? drag.ghost().css('opacity', 0.5) : drag.cancel();
 			return drag.ghost().css('opacity', 0.5);
 		}

 		// Init drag functionality
		var LIs = $('#badges-list').children().each(function(){
			var li = $(this);
			li.hasClass('active') && li.on('draginit', draginit)
		});

		// Init drop functionality
		if(window.__badges_sidebar_editable === true) {
			$("#badges-list-sidebar").children().on({
				
				'draginit' : draginit,

			    'dropover' : function(ev, drop, drag) {
			        $(this).addClass('highlight');
			    },
			    
			    'dropout' : function(ev, drop, drag) {
			        $(this).removeClass('highlight');
			    },

			    'dropon' : function(ev, drop, drag) {
			    	
			    	// getting badge's id
			    	var badge = drag.element,
			    		id = badge.attr('data-pid'),
			    		real_id = badge.attr('data-id'),
			    		lvl = badge.attr('data-lvl'),
			    		classname = badge.attr("data-class");


			    	classname = classname || ('badge-small-'+id+' badge-small-'+id+'_'+lvl);

			    	var block = $(this);

			    	block.removeClass('highlight');
			    	// alert([real_id, id])

			    	if( block.attr('data-id') != id ) {

			    		
			    		// Такого беджа еще нет в сайдбаре
			    		if(!block.siblings('[data-pid=' + id + ']').length) {
			    			
			    			block.html('<div class="'+classname+'"></div>');
			    			block.attr({
			    				'data-id': real_id,
			    				'data-pid': id,
			    				'data-lvl' : lvl
			    			});
			    			
			    			// $.get("/user/"+APP.User.get("username")+"/setb/"+block.attr('data-index')+"/"+real_id, function( data ){
			    			// 	data = $.exec( data );
			    			// 	if( data && data.state ) {
			    			// 		$.alertOk("Бедж успешно добавлен");
			    			// 	} else {
			    			// 		$.alertError("Не получилось :(");
			    			// 	}
			    			// });
			    		

			    		// Такой бедж уже есть в сайдбаре
			    		} else {

			    			
			    			var existBadge = block.siblings('[data-id=' + real_id + ']:first');
			    			// if(!existBadge.length){
			    			// 	existBadge = 
			    			// }

			    			if( Number(existBadge.attr('data-index')) > Number(block.attr('data-index')) ){
			    				block.before(existBadge);
			    			} else {
			    				// alert([Number(existBadge.attr('data-index')), Number(block.attr('data-index'))])
			    				block.after(existBadge);
			    			}
			    		}

			    	} else {
			    		$.alertError("Тут и так этот бедж");
			    	}

			    	Badges.updtSBIndex();
			    }

			})
		}

		// Badges.set("draginit", true);
 	}


 	// #hack
 	// @todo заменить верстку беджей на ссылки
 	if(!window.__badges_sidebar_editable){
 		$("#badges-list-sidebar").click(function(){
 			window.location.href = "/user/" + APP.Profile.get("username") + "/badges";
 			return false
 		});
 	}

	/**
	 * On panel enter callback
	 */
	Badges.onPanelEnter = function(){
		return false;
	}



	// Badges.on('panelLeave', function(){
	// 	Badges.set('editmode', false);
	// });


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * AJAX handlers
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


	



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Initialize 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	Badges.init = function(){}
	
	
	// Initialize module
	!Badges.get("inited") && $( Badges.init );





/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Workarounds
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	
 	Badges.toggleEditMode = function( evt ) {
 		Badges.set('editmode', !Badges.get('editmode'));
 	}





})( this.jQuery, this, document, this.APP );