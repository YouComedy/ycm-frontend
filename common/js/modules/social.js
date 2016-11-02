
;
(function( $, window, document, APP ){

	var Social = APP.Social, fbinit = false;

	Social.messagePopupFB = function( to, evt ){
		Social.proxyFB(function(){
			FB.ui({
				method: 'send',
		      	name: APP.get("title"),
		      	link: APP.get("url"),
		      	to : to,
		      	picture : $('meta[property="og:image"]').attr("content")
		    });
		});
	}

	Social.proxyFB = function( fn ){
		if(fbinit === false) {
			setTimeout(function(){
				Social.proxyFB( fn );
			}, 33);
		} else {
			fn();
		}
	}

	Social.on("change:inited", function(){
		FB.init({appId: window.__APP_Social_FBID, cookie: true});
		FB.getLoginStatus(function(response){
	        fbinit = true;
	    });
	});


	Social.inviteByEmail = function( params ) {
		var data = params.data || params || {};

		if(data && data.state) {
			$.alertOk("Приглашение успешно отправлено!");
			$("#slider").slider(1);
		} else {
			$.alertError(data.error_text || "Что-то пошло не так :(");
		}
	}

})( this.jQuery, this, document, this.APP );
