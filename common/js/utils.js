// http://demo.sofcase.net/jnotifier-codecanyon/
(function ($, APP, _) {
    
    var Utils = APP.Utils;


    // --------------------------------------------------------------------------------------------------
    // Плашка регистрации
    // --------------------------------------------------------------------------------------------------
	
	Utils.showInviteEmail = function(){
		var invite_slide = $('#enter-invite-email');
		
		$('#info-panel').slider('next');
		setTimeout(function(){
			invite_slide.find('input[type=text]').keypress(function(e){
				var KEY_RETURN = 13;
				if (e.which == KEY_RETURN){
					invite_slide.find('a').trigger('click');
				}
			}).trigger("focus");
		}, 100);
	}
	
	Utils.submitInviteEmail = function(){
		var url = '/subscribers';
		var slide = $('#enter-invite-email');
		var email = slide.find('input[type="text"]').val();
		var data = {
			'Subscribers[email]': email
		};
		
		slide.block();
		$.post(url, data, function(data){
			slide.unblock();
			data = $.exec(data);
			if (data && data.state){
				$('#info-panel').slider('next');
				$.cookie('ycm_invite', '1', {expires: 365});
				APP.Stat.pushTarget('Guests', 'Register', 'TOP_PANEL_EMAIL_SUBMIT');
			} else {
				$.alertError(data.errors.Subscribers.email[0]);
			}
		});
	};


	
})(this.jQuery, this.APP, this._);