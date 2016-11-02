+function(APP){

	


	var Moderator = APP.Moderator;


	var ItemModerateModel = APP.models.Item.extend({
		all_tags : [],

		'fetchFullModel' : function( opts ){
			var self = this, onSuccess, onError, callback = opts || {};

			if(_.isFunction(callback)) {
				onSuccess = onError = function( resp, item, err_state ){
					callback(resp, item, err_state);
				}
			} else  {
				onSuccess = callback.success,
				onError = callback.error;
			}

			$.get("/moderator/load/" + this.id, function( resp ){
				if( resp && resp.state ) {
					var new_model = resp.items[0];
					new_model && (new_model.comments = new APP.collections.Comments(new_model.comments));
					new_model && self.set(new_model);
					onSuccess && onSuccess( resp, self, true);
				} else {
					onError && onError( resp, self, false);
				}
			});
		}

	});

	var ItemModerateView  = APP.views.ItemModerator = APP.views.ItemBig.extend({
		template: _.template("#item-big-moderator-tpl"),
		createEl : function(){
			var elem = $(this.el);//.attr("id", "i" + this.model.id );
			var self = this, item = self.model;
			var __item = self.model.toJSON();
			var content_id = self.model.id;
			elem.addClass("_moder")
			elem.html(self.template( __item ));
			elem.find(".js-tag").applyPlugin( "tagedit", {
				allowAdd : false,
                autocompleteURL : "/tags/suggest",
                placeholder : "введите тег",
                autocompleteOptions : {
                    appendTo : "#i" + content_id + "-ac",
                    // open: function( e, ui){
                    //     var ul = elem.find("ul.ui-autocomplete:visible");
                    //     ul.find("li:first a").addClass("ui-state-hover").trigger("mouseenter");
                    // }
                },
                onAdd : function( val, id, input ) {
                	$.post("/tags/addMetaTags", {
                		"tags[]" : val,
                		"content_id" : content_id
                	}, function(data){
                		if( data && data.items ) {
                			var tag = data.items[0];
                			if(!tag) return;
                			input.attr("data-id", tag.link);
                			input.val( tag.value );
                			input.data("_silent", true);
                			input.trigger("forceTransformToTag");
                		}
                	});

                	return false;
                },

                onRemove : function( val, id ) {
                	// Hack. In ID param remove URL passed
                	var removeLink = id;
                	$.get(removeLink);
                }
            });
			return elem;
		},

		goNext : function(){return false;}
	});


	Moderator.openPopup = function( itemID ) {
		// alert("Moderator.openPopup " + itemID)
		var item = new ItemModerateModel({id: itemID});
		// Тестовые поля, чтоб с ошибками не падало
		_.each(["complaint", "complaint_username", "suspects"], function(k){item.set(k, [Math.random()])});
		item.set("all_tags", item.get("tags"));

		
		item.fetchFullModel({
			success : function( resp, item, err_state ){
				// alert("Moderator.openPopup fetch success")
				APP.Popup.open( item, true, {
					view : ItemModerateView
				});
			}
		});
	}


	Moderator.removeBefore = function( arr, form ){
		form.block();
	}

	Moderator.removeSuccess = function(data, u1, u2, form){
		if( data && data.state ) {
			$.alertOk("Шутка удалена");
			$("#i" + form.data("contentid")).remove();
			APP.Dialog.close();
		} else {
			$.alertError("Что-то пошло не так :(");
		}
	}


	Moderator.init = function(){
		APP.ItemsViewer.init();
	}



	Moderator.reasons = [
		"контент содержит эротику.",
		"контент не является шуткой.",
		"шутка была добавлена на сайт ранее.",
		"качество шутки не соответствует стандартам YouComedy."
	]


}(this.APP);