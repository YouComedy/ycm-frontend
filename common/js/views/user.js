



;
(function( $, APP ){
	
	
	
	
	APP.views.UserRow = Backbone.View.extend({
		
		'tagName' : 'tr',
		
		'events' : {
			'click a[data-follow]' : 'setFollow'
		},
		
		'initialize' : function(){
			if(!this.model) return;
			this.model.off('change:followed', this.update);
			this.model.on ('change:followed', this.update, this);
		},
		'render' : function(){
			this.update();
			$("#people-table-body").append( this.el );
			// this.$el.onAJAX({
				// el : $(this.el).find(".ycmbtn b"),
				// id : this.model.id,
				// before : function(){alert(1);$(this.el).find(".ycmbtn b").blockButton('loading...');},
				// success : function(){alert(2);$(this.el).find(".ycmbtn b").unblockButton();}
			// });
		},
		
		'update' : function(){
			!this.template &&
				(this.template = _.template($("#people-row-tpl").html()));
			(this.$el = $(this.el)).html(this.template(this.model.toJSON()));
		},
		
		
		'setFollow' : function( evt ){
			// var link = $(evt.currentTarget), user = this.model;
// 			
			// var btn = link.children();
			// btn.blockButton( "..." );
// 
			// APP.User.setFollow(link.attr('href'), {
				// // onsuccess callback 
				// success : function( uid, following ){
					// user.set('followed', following);
				// }, 
				// // onerror callback
				// error : function( err, uid ){ 
					// $(link).errorTip({
						// title : err,
						// hide : 1500
					// });
				// }
			// });
			// return false;
			
			
			var link = $(evt.currentTarget);
			APP.User.setFollow(link, {
				model : this.model,
				error : function( err, uid ){
					$(link).errorTip({
						title : err,
						hide : 1500
					});
				}
			});
			return false
			
			
		}
	});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Any page. Item brick in grid.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	APP.views.UserAdminRow = Backbone.View.extend({
		'tagName' : 'tr',
		'template' : _.template($("#profile-row-tpl").html() || ""),
		'initialize' : function(){},
		'render' : function(){
			$(this.el).html(this.template(this.model.toJSON()));
			$$("#users-table tbody").append( this.el );
		}
	});
	
})(jQuery, APP);

