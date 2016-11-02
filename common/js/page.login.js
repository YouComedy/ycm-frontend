
var _gaq = window._gaq || [];

// Be sure that JS is enabled
var body = document.body, c = body.className;
body.className = c ? c + " js" : "js";

var hash = window.location.href.split("#")[1];
var $slider = $('.slider').slider({'autoHeight':false});

setTimeout(function(){
	$("input:first").trigger("focus");
}, 200);

// Start hash monitoring
setInterval(function() {
	if(window.location.href.split("#")[1] != hash) {
		$slider.slider('#screen-' + ( hash = window.location.href.split("#")[1]));
		_gaq.push(['_trackPageview', window.location.href]);
	}
}, 50);


$slider
// remove bubbles before slide
.on("slideStart", function(evt, old_slide, new_slide) {
	$.removeTips();
});

$("form").each(function(){
	var form = $(this);

	!form.is("#social_form") && !form.is("[data-noajax]") && form.ajaxForm({

	beforeSerialize : $.removeTips,
	beforeSubmit : function(data, form, opts) {
		opts.data = $._GET(opts.data);
		$.each(data, function(n, field) {
			if(field.value == $("[name='"+field.name+"']")[0].mask) {
				opts.data[field.name] = "";
			}
		});
		opts.data = $._2GET(opts.data);
		$(form).blockForm();
	},
	success : function(data, u1, u2, form) {


		$(form).unblockForm();

		// Refresh page if auth is successful
		if(form.is("#auth_form") && data.state === true) {
			// $slider.slider("#screen-auth-success");
			return false;
		}

		// Submitting invite code
		if(form.is("#invite_form") && data.state === true) {
			$("#invitecode2").val($("#invitecode1").val());
			return false;
		}

		if(form.is("#reg_form") && data.state === true) {
			// $slider.slider("next");
			_gaq.push(['_trackEvent','Guests','Register','REGISTER']);
			return false;
		}

		if(form.is("#email_form") && data.state === true) {
			$slider.slider("next");
			window.yaCounter18150868.reachGoal('userSubscribed');
			_gaq.push(['_trackEvent','Guests','Subscribe','SUBSCRIBE']);
			updateCounter( --_counter );
			return false;
		}

		// Refresh page if auth is successful
		if(form.is("#reset_form") && data.state === true) {
			$slider.slider("next");
			return false;
		}


 		if( form.is("#passwordReset_form") && data && data.state === true ) {
			return false
		}

		if(!data.state) {
			var input;

			if(data.error_code) {

				$( "[data-errcode="+data.error_code+"]:visible" ).errorTip({
					place : 'right',
					title : data.error_text,
					hide : 3000
				});
			}

			if(data.errors) {
				console.log(data.errors)
				var errs = data.errors;
				for(var k in errs ) {
					for(var j in errs[k] ) {
						var input = $("input[name='" + k + '[' + j + ']' + "']:visible", form);
						//input.is(":visible") &&
						input.errorTip({
							place : 'right',
							title : errs[k][j] + "",
							hide : 3000
						});
					}
				}
				return;
			}

		}
	}
});
})

!window.console && (window.console = {log : function(){}});

$(document).ajaxComplete(function( evt, req, opts ){
	try {
		var data = $.exec( req.responseText ) || {};
		data.redirect && (window.location.href = data.redirect);
	} catch(e){}
});
