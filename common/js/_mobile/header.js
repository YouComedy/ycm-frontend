(function (APP) {
	var Header = new APP.Module({
		'inited' : true,
		'name' : 'Header'
	});

	var menus = $('.menu');
	var dropdowns = $('.dropdown');

	Header.slideMenu = function(){
		var menu = $(this);
		var menu_id = '#' + menu.attr('id');
		var dropdown = $(this).parent().find('.dropdown');
		var id = '#' + dropdown.attr('id');
		
		menus.not(menu_id).removeClass('active');
		dropdowns.not(id).slideUp('fast', function(){
			menu.toggleClass('active');
			dropdown.slideToggle('fast');
		});
	};


})(this.APP);