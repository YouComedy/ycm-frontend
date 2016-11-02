// Be sure that JS is enabled
var body = document.body, c = body.className, Win = this;

// body.className = c ? c + " js" : "js";

// var hash = window.location.href.split("#")[1];
// var $slider = $('#slider-register').slider( hash ? '#screen-' + hash : 0);


// $slider
// // remove bubbles before slide
// .on("slideStart", function(evt, old_slide, new_slide) {
// 	$("a[href='#"+old_slide.attr('id')+"']").removeClass("step_list__link_active");
// 	$.removeTips();
// })
// // Update hash on slide
// .on("slideEnd", function(evt, old_slide, new_slide) {
// 	$("a[href='#"+new_slide.attr('id')+"']").addClass("step_list__link_active");
// 	if(new_slide.is("#screen-auth-success")) {
// 		window.location.href = "/";
// 	} else {
// 		window.location.hash = "#" + (new_slide.attr('id') || "").split("screen-")[1];
// 	}
// });




// $("#slider-tour").slider({
// 	autoHeight : false
// }).find("li").each(function(){
// 	$(this).children(":not([data-ignore])").each(function(){
// 		$( this ).plaxify({"xRange": rnd( 10, 100),"yRange": (10, 100) ,"invert":true});
// 	});
// 	$.plax.enable($(this));
// });


if( window._currentStep == "subscr" ) {

	var FooterBar = $(".section_thumb_list");

	var FancyBox = new window.APP.Module({
		'name' : 'FancyBox',
		'inited' : false,
		'files'  : [
			'/common/js/libs/ui/fancybox.js',
			'/common/css/libs/ui/fancybox.css'
		]
	});


	FancyBox.on("change:inited", function(){
		FooterBar.animate({bottom: 0});
	});


	FancyBox.open = FancyBox.openImage = function(  img  ) {
		$.fancybox.open( img );
	}


	FancyBox.parseVideooUrl = function( url ) {
		return url.match(/(https?:\/\/[\w\-\_\.\/]+)/)[1]
	}

	FancyBox.openVideo = function( o ) {
		o = $.extend({
			type : 'iframe'
		}, o);

		o.href = FancyBox.parseVideooUrl( o.href );

		$.fancybox.open( o );
	}


	window.selectedCollectionCounter = 0;
	window._selectedCollections = {};
	var _isloading = false;
	$("#subscr_submit_btn").click(function(){
		if( _isloading ) return false;
		var btn = $(this);
		btn.text("...");
		$.post( window.location.href, {'collections' : _.keys(window._selectedCollections).join(",")}, function( data ){
			data = $.exec( data );
			_isloading = false;
			btn.text("Следующий шаг");
			if( data && data.state ) {
				// window.location.href=data.redirect
			} else {
				//throw new Error("xxx");
				alert(data.error_text);
			}
		});
		return false;
	});



	$(window).scroll(function(){
		if($(this).scrollTop() > 400){
			FooterBar.animate({bottom: 0});
			$(this).off("scroll")
		}
	});

}



if( Win._currentStep === "collections" ) {

	window.selectedCollectionCounter = 0;

	function checkCompleteBtnVisisibility(){
		if( $("#collectionsList").children().length ) {
			$("#completereg-btn").show();
		} else {
			$("#completereg-btn").hide();
		}
	}

	Win.addCollection = function( data ){
		var li = $(document.createElement("li")).attr({
			'class' : 'collection-box__item',
			'id' : "col" + data.id
		}).html("<a class='collection-box__item-title'>"+data.title+"</a><a class='collection-box__remove-btn' data-id='"+data.id+"' href='#'>&times;</a>");
		$("#collectionsList").append( li );

		checkCompleteBtnVisisibility();
	}

	Win.removeCollection = function(id){
		$.get("/collection/"+id+"/delete", function( data ){
			if( data && data.state ) {
				$("#col" + id).fadeOut(function(){
					$(this).remove();
					checkCompleteBtnVisisibility();
				})
			}
		});
	}

	$(document).on('click', '.collection-box__remove-btn', function( evt ){
		Win.removeCollection( $(this).data('id'));
		return false;
	});

	// $("#addcollection").click(function(){Win.addCollection({id:1, title:"Еще одна коллекция"});return !1;})

	$(document).on('click', '.collection-box__itemchk', function(evt){
		var block = $(this);
		block.slideUp('fast', function(){
			block.remove();
		});
		$("#addcollection").val(block.data('title')).parent().submit();
		return false;
	});

}


if( Win._currentStep === "profile" ) {
	$("input.registration__inputfile").change(function(){
		$(this).parent().submit();
	});
}



$("form").ajaxForm({

	beforeSerialize : $.removeTips,

	beforeSubmit : function(data, form, opts) {
		// opts.data = $._GET(opts.data);
		// $.each(data, function(n, field) {
		// 	if(field.value == $("[name='"+field.name+"']")[0].mask) {
		// 		opts.data[field.name] = "";
		// 	}
		// });
		// opts.data = $._2GET(opts.data);
		// $(form).blockForm();
		$(form).is("#avatarForm") && $(form).block();
	},
	success : function(data, u1, u2, form) {

		form.is("#avatarForm") && $(form).unblock();

		// $(form).unblockForm();

		// Форма добавления новой коллекции
		if(form.is("#addcollectionForm") && data.state === true) {
			form.clearForm();
			Win.addCollection( data );
			return false;
		}

		// Пользователь добавлит аватарку
		if(form.is("#avatarForm")){
			var avatar = $(".registration__avatar");
			if(!avatar.data("old_bg"))
				avatar.data("old_bg", avatar.css("backgroundImage"));
			if( data && data.big_image ) {
				avatar.css('background-image', 'url(' + data.big_image + ')');
			} else {
				avatar.css('background-image', 'url(' + avatar.data("old_bg") + ')');
			}
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


$(document).ajaxComplete(function( evt, req, opts ){
	try {
		var data = $.exec( req.responseText ) || {};
		data.redirect && (window.location.href = data.redirect);
	} catch(e){}
});








!window.console && (window.console = {log : function(){}});
