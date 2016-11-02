
$(function(){


	var $div = $("#yobushki_vorobushki");
	
	if( !$div.length ) {
		$div = $("<div id='yobushki_vorobushki' style='position:fixed;z-index:999999;top:-900px;left:50%;margin-left:-410px;width:825px;height:680px;background:url(/common/img/egg/yobushki_vorobushki.png) 0 0 no-repeat;'></div>");
		$div.appendTo( 'body' );
	}
	
	window.EGG = window.EGG || {};
	
	var enable = false;
	
	$("<img src='/common/img/egg/yobushki_vorobushki.png' />").load(function(){
		enable = true;
	});
	
	
	window.EGG.yobushki_vorobushki = function(){
		if( !enable ) {
			setTimeout( arguments.callee, 100 );
			return;
		}
		$("#yobushki_vorobushki").animate({
			'top': 0 
		}, 300, function(){
			setTimeout(function(){
				$("#yobushki_vorobushki").animate({
					'top': -1000
				}, 300)
			}, 5000);
		});
	}

});
