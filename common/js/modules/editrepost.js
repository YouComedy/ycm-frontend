
;
(function( $, window, document, APP ){

	var Repost = APP.EditRepost, curItem;


	var MIN_TAGS_ERROR_MSG = "Необходимо добавить не менее двух тегов!";


	//
	//
	//
	Repost.init = function(){

	}


	//
	//
	//
	function openDialog( opts ) {
		var item = opts.item;
		curItem = item,
		content = (this[opts.tpl] || (this[opts.tpl] = _.template(opts.tpl)))($.extend(item.attributes, {
            	action : opts.action || ""
            }, opts.data || {}));


		console.log($.extend(item.attributes, {
            	action : opts.action || ""
            }, opts.data || {}));

		APP.Dialog.safecall("open2", {
            class : opts.class,
            title : opts.title,
            content : content,
            open    : function( $content ){
            	// alert($.isIphone());

            	if($.isIphone()) {
            		// alert(2)
            	} else {

            		if(!opts.noAutoComplete){
		            	$content.find(".js-tag").applyPlugin( "tagedit", $.extend({
			                autocompleteURL : "/tags/suggest",
			                placeholder : "Теги (минимум 2)",
			                // minLength : 2,
			                // submitCallback : function( el ) {el.parents("form").submit()},
			                // onMinLengthError : function(){$.alertError(MIN_TAGS_ERROR_MSG)},
			                autocompleteOptions : {appendTo : "#dialog-ac"}
			            }, opts.tagedit));
		            }

	            }

	            opts.open && opts.open($content);
            }
        });
	}

	//
	//
	//
	Repost.openEdit = function( item ) {
		openDialog({
			item : item,
			title : "Редактировать шутку",
			action : "/content/" + item.id + "/description",
			class: "dialogRepost",
			tpl : "#item-edit-repost-dialog-tpl",
			open: function($content){
				$content.find("textarea").on("keyup keydown", function(e){
					$(this).next().text(400 - $(this).val().length);
				}).trigger("keyup");
			},

			tagedit : {
				minLength : 2,
                submitCallback : function( el ) {el.parents("form").submit()},
                onMinLengthError : function(){$.alertError(MIN_TAGS_ERROR_MSG)}}
		});
	}


	//
	//
	//
	// Repost.openRepost = function( item ) {
	// 	openDialog({
	// 		item : item,
	// 		title : "Поделиться шуткой",
	// 		action : item.repostUrl(),
	// 		class: "dialogRepost",
	// 		tpl : "#item-edit-repost-dialog-tpl",
	// 		open: function($content){
	// 			$content.find("textarea").on("keyup keydown", function(e){
	// 				$(this).next().text(400 - $(this).val().length);
	// 			}).trigger("keyup");
	// 		},
	// 		tagedit : {
	// 			minLength : 2,
 //                submitCallback : function( el ) {el.parents("form").submit()},
 //                onMinLengthError : function(){$.alertError(MIN_TAGS_ERROR_MSG)}}
	// 	});
	// }


	//
	//
	//
	Repost.moderateEditTags = function( item ) {
		item.getAllTags(function( data ){
			openDialog({
				item : item,
				title : "Все теги",
				class: "dialogTags",
				tpl : "#item-moderateTags-dialog-tpl",
				action : "/tags/addMetaTags",
				data : data
			});
		});
	}


	Repost.before = function(arr, form){
		// iphone validation
		if($.isIphone()){
			if(form.find("[name='tags']").val().split(",").length < 2){
				$.alertError(MIN_TAGS_ERROR_MSG);
				return false;
			}
			form.block();
		} else {
			form.block();
		}
	}



	Repost.after = function( data, u, d, form ){
		form.unblock();
		data = data || {};
		if( data.state ) {
			var OK_MSG = "Все получилось";
			
			if($.isIphone()){
				alert(OK_MSG);
				APP.Dialog.close();
				return false;
			}
			
			$.alertOk( OK_MSG );

			if( data.content ) {
				if(form.attr("action").indexOf("description") > -1) {
					curItem.set({
						tags : data.content.tags || [],
						description: data.content.description || ""
					});
				}
			}
			APP.Dialog.close();
		} else {
			if($.isIphone()){
				alert(data.error_text || "Что-то пошло не так :(");
				return false;
			}
			
			$.alertError(data.error_text || "Что-то пошло не так :(");
		}

		curItem = null;
	}



	Repost.complainOpen = function( item ){
		openDialog({
			tpl : "#dialog-user-reason-tpl",
			class : "dialogMedium",
			item : item,
			title : "На что жалуемся?",
			noAutoComplete : true
		});
	}


	Repost.complainBefore = function(){
		if(!confirm("Точно отправить?")) return false;
	}

	Repost.complainSuccess = function(){
		$.alertOk("Жалоба успешно отправлена!");
		APP.Dialog.close();
	}



	Repost.on("change:inited", function(u,state){
		state && Repost.init();
	});


})( this.jQuery, this, document, this.APP );
