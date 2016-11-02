$(function(){



	$("#teser__btns").tooltip({
		'trigger' : 'manual',
		'title' : [
			"<p style='margin:10px;font-weight:bold;'>Пожалуйста, авторизуйтесь, чтобы поставить оценку.</p>",
			"<p style='height:20px;margin:10px'><a href='/' style='float:left'>Авторизация</a><a href='#' style='float:right'  data-invite='popup'>Хочу приглашение</a> </p>"
		].join(""),
		'classname' : 'tooltip__white tooltip__noarrow'
	}).click(function(){
		$(this).tooltip('show');
		return false;
	});



	$("#whereiam").tooltip({
		'trigger' : 'manual',
		'title' : "<p style='margin:20px;'>YouComedy.Me - это место, где люди коллекционируют свои любимые шутки и делятся ими с друзьями.</p>",
		'classname' : 'tooltip__white'
	}).click(function(){
		if( $(this).data('__tip')  ) {
			$(this).data('__tip', false) ;
			$(this).tooltip('hide');
		} else {
			$(this).data('__tip', true) ;
			$(this).tooltip('show');
		}
		
		return false;
	});





	function openDialog(){
		$.blockBody();
		$("#overlay").fadeIn(function(){
			$("#dialog_wrapper").fadeIn().find("input").focus();
		});
		return false;
	}





	function closeDialog(){
		$.unblockBody();
		$("#dialog_wrapper").fadeOut(function(){
			$("#overlay").fadeOut();
		});
	}


	$(document).on("click", "[data-invite]", openDialog );
	$(".dialog_overlay,.dialog__close").click( closeDialog );


	$("#inviteForm").submit(function(){
		var f = $(this);
		f.blockForm({
			'wtype' : 'outerWidth'
		});

		$.post(f.attr('action'), {
			'Subscribers' : {
				'email' : f.find("input").val()
			}
		}, function( data ){
			f.unblockForm();
			data = $.exec ( data );
			if( data && data.state ) {
				f.find("input").replaceWith('<span>Вы успешно добавлены в список ожидания</span>');
				setTimeout( closeDialog, 2000 );
			} else {
				f.find("input").errorTip({
					title : (((data || {}).errors || {}).Subscribers || {}).email || "Не правильно заполнено поле",
					hide : 2000,
					place: 'right'
				});
			}
		})

		return false;
	});



});