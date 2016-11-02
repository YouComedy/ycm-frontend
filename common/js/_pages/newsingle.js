
!function(){




$.win = $(window);

var cache = {
	score : 0,
	progress : 0,
	max  : 5,
	title : ""
},
app = window.app = $({}),
items = [],
basediv;


app.likeTitles = [
	"Тоже нравится?",
	"Начинаем тебя понимать",
	"Лайк или дислайк?"
];


app.dislikeTitles = [
	"Отстой или уже лучше?",
	"В мусорку или оставляем?",
	"Ваш приговор, судья"
];

var lastTitle = "До финиша всего одна шутка!";


app.set = function( key, value ) {
	var oldval = cache[key];
	if(oldval != value){
		cache[key] = value;
		app.trigger("change:" + key, [value]);
	}
}


app.get = function( key ) {
	return cache[key];
}


app.vote = function( evt, vote ) {
	var link = $(evt.currentTarget);
	if(link.is("._active")) return false;
	link.addClass("_active");
	var arr = app[vote + "Titles"];

	app.set("progress", app.get("progress") + 1);

	if(app.get("progress") < app.get("max")){
		if(app.get("progress") === app.get("max") - 1) {
			app.set("title", lastTitle);
		} else {
			app.set("title", arr.pop());
		}
	}

	app.set("score", app.get("score") + (vote === "like" ? 1 : -1));

	setTimeout(function(){
		link.removeClass("_active");
	}, 500)
	// var itemID = $(evt.currentTarget).data("item-id");
	// $.get("/" + vote, function(resp){
	// });
}



app.nextItem = function( custom ){
	var item = items[app.get("progress")];
	// $("html:not(:animated),body:not(:animated)").animate({scrollTop: 0});
	$("#item").fadeOut(333,function(){
		$.win.scrollTop(0);
		var div = basediv.clone();
		div[0].className = div[0].className.replace(/type\d+/, "");
		div.addClass("type" + item.type);

		div.find(".video").empty();
		div.find(".txt").empty();
		div.find(".gif").empty().removeClass("_long");

		if( item.type == 1 ) {
			div.find(".img img").attr("src", item.big_image);
		} else if(item.type == 2) {
			div.find(".video").html(item.content);
		} else if(item.type == 3) {
			div.find(".txt").html(item.content);
		} else {
			div.find(".gif").html('<img src="'+item.content+'" alt="" />');
		}


		div.find("a.item_thumb")
			.attr("href", "/user/" + item.content_username)
			.css("backgroundImage", "url(" + item.content_user_avatar  + ")")
			.text(item.content_user_fullname);

		div.find(".remark").text(item.content_timestamp);

		var item_max_width = 600;
		var gif_max_height = 500;

		$(this).replaceWith(div);
		if( item.type == 4 && (item_max_width / item.image_size[0] * item.image_size[1] > gif_max_height) ) {
			div.find(".gif").addClass("_long")
		}
		div.fadeIn(333);
	});

}


app.showQuest = function(){
	$.win.scrollTop(0);
	app.set("screen", "quest");
	app.set("title", "Отлично! Теперь выберите темы");
	pushPageView( "?step=quest" );

	setTimeout(function(){
		$("#items").empty().html("&nbsp;");
	}, 1000);
	var $form = $("#quest").find("form").on("submit", function(evt){
		app.showRegister();
		$.post($form.attr("action"), $form.serialize(), function( resp ){
		});
		return false;
	});
}



app.showRegister = function(o){

	o = o || {};

	$('.placeholder').find('input').each(function(){
		var self = $(this);
		function check(){!self.val() ? self.parent().removeClass('value') : self.parent().addClass('value')}

		check();

		self.focus(function(){
			check();
		}).blur(function(){
			check();
		}).keydown(function(){
			self.parent().addClass('value');
		});
	});

	$("#brain").show();

	$("#screen-reg").add("#slider").find("form").each(function(){
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
					// _gaq.push(['_trackEvent','Guests','Register','REGISTER']);
					return false;
				}

				if(form.is("#email_form") && data.state === true) {
					$slider.slider("next");
					window.yaCounter18150868.reachGoal('userSubscribed');
					// _gaq.push(['_trackEvent','Guests','Subscribe','SUBSCRIBE']);
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
						// console.log(data.errors)
						var errs = data.errors;
						for(var k in errs ) {
							for(var j in errs[k] ) {
								var input = $("input[name='" + k + '[' + j + ']' + "']:visible", form);
								//input.is(":visible") &&
								input.errorTip({
									place : 'left',
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
	});

	
	if(!o.doNotChangeScreen) {
		$.win.scrollTop(0);
		app.set("screen", "reg");
		app.set("title", "Войдите, чтобы посмотреть шутки!");
	}

	pushPageView( "?step=reg" );

	setTimeout(function(){
		$("#screen-quest").empty().html("&nbsp;");
	}, 1000);
}


app.on("change:score", function(e, score){
	$("#banana").removeAttr("class").addClass("face" + score);
});



app.one("change:ready", function(){
	app._btimer = setTimeout(function(){
		$("#baloon").addClass("_fadeIn");
	}, 777);
});


app.one("change:progress", function(){
	clearTimeout(app._btimer);
	$("#baloon").removeClass("_fadeIn").addClass("_fadeOut");
});


app.on("change:progress", function(e, progress){
	var percent =  100 / app.get("max") * progress;
	$("#progress").css("width", percent + "%");
	if( progress < app.get("max") ) {
		if(app.get("ready")) {
			app.nextItem();
			pushPageView( "?step=" + progress );
		} else {
			app.one("change:ready", app.nextItem);
		}
	} else {
		app.showQuest();
	}

	if(!app._questloaded)
		(app._questloaded = 1) && $("#quest").load("/register/preQuest?isnaked=1");
});


app.on("change:title", function(e, title){
	$("#title").text( title )
});

app.on("change:screen", function(e, scr){
	switch (scr){
		case "quest":
			$('#auth_links').addClass('_fadeOut');
			break;
		case "reg":
			setTimeout(function(){
				$('#baloon_reg').addClass('_fadeIn');
			}, 1000);
			break;
	}

	$("#wrapper").css("marginLeft", ($("#screen-" + scr ).index() * -100) + "%");
});


$(document).on("click", "a[data-action]", function( evt ){
	var link = $(evt.currentTarget);
	try {
		app[link.data("action")](evt, link.data("param"));
		return false;
	} catch(e) {
		console.error( e );
	}
});


$.preloadImages = function () {
	var callback, images , n;
    if (typeof arguments[arguments.length - 1] == 'function') {
        callback = arguments[arguments.length - 1];
    } else {
        callback = false;
    }
    if (typeof arguments[0] == 'object') {
        images = arguments[0], n;
        if( images ) n = images.length;
    } else {
        images = arguments;
        n = images.length - 1;
    }
    var not_loaded = n || 0;
    for (var i = 0; i < n; i++) {
    	var src = typeof images[i] === 'string' ? images[i] : $(images[i]).attr('src');
    	src && /(?:jpe?g|gif|png)/i.test( src ) &&
	        $(new Image()).attr('src', src ).load(function() {
	            if (--not_loaded < 1 && typeof callback == 'function') {
	                callback();
	            }
	        }).on("error", function(){
	        	if (--not_loaded < 1 && typeof callback == 'function') {
	                callback();
	            }
	        });
    }
}


app.initRegForm = function(){
	app.showRegister({
		doNotChangeScreen : true
	});
}


$(function(){

	$.get(window.itemsURL, function(data){
		var imgs = [];
		$.each(data.items, function(i, item){
			if(i === 5 ) return false;
			// if( item.big_image ) {
				items.push( item );
				imgs.push(item.big_image);
			// }
		});
		$.preloadImages(imgs);
		basediv = $("#item").clone().hide();
		app.set("ready", true);
	});

})


// var lastshowstate = false, showstate = false;
// $.win.scroll(function(){
// 	(showstate = $.win.scrollTop() >= 160) !== lastshowstate
// 		&& $("#side").toggleClass("_fixed",  (lastshowstate = showstate));
// });

$.ajaxSetup({
	dataType: 'json'
});

$(document).ajaxComplete(function( evt, req, opts ){
	try {
		var data = $.exec(req.responseText) || {};
		data.redirect && (window.location.href = data.redirect);
	} catch(e){}
});



window.pushPageView = function(pageUrl){
	window.singleNum = (window.singleNum || 2);
	// console.info( pageUrl );
	// pushPageView( "?step=quest" );
	window._gaq.push(['_trackPageview', "/single-" + window.singleNum + pageUrl]);
}



}();