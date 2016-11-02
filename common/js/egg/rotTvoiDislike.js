
$(function(){


	var $div = $("#rottvoidislike");
	
	if( !$div.length ) {
		$div = $("<div id='rottvoidislike' style='position:fixed;z-index:999999;bottom:-400px;right:-400px;width:400px;height:396px;background:url(/common/img/egg/rottvoidislike.png) 0 0 no-repeat;'></div>");
		$div.appendTo( 'body' );
	}
	
	window.EGG = window.EGG || {};
	
	var enable = false;
	
	$("<img src='/common/img/egg/rottvoidislike.png' />").load(function(){
		enable = true;
	});
	
	
	window.EGG.rotTvoiDislike = function(){
		if( !enable ) {
			setTimeout( arguments.callee, 100 );
			return;
		}
		$("#rottvoidislike").animate({
			'bottom':0,
			'right': 0 
		}, 300, function(){
			setTimeout(function(){
				$("#rottvoidislike").animate({
					'bottom': -400,
					'right': -400
				}, 300)
			}, 1000);
		});
	}

});
