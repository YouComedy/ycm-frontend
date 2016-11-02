(function( $, window, document, APP ){

	var BigComments = new APP.Module({
		'inited' : true,
		'name' : 'BigComments',
		autoload : true
	});


	var Container = $$('#comments');

	var View = APP.views.CommentBig.extend({
		className: 'panel comment-big',
		template : _.template('#big-comment-tpl'),
		attachTPL: '#comment-attach-tpl',
		container: Container,

		render : function(){
			APP.views.CommentBig.prototype.render.call(this, 'append')
		}
	});

	var Collection = BigComments.Records = new (APP.collections.Comments.extend({
		dataField : 'ids',
		autoRender: true,
		url: window.comments_url || '/top/loadComments',
		view: View,

		'onCompleteLoad' : function(){
			$(this.loadElement || "#items-loader").hide()
			if (!Collection.length) $(this.emptyElement).show();
		}
	}));

	BigComments.setPeriod = function(period){
		BigComments.set('period', period);
		$(this).makeActive(true);
	};

	BigComments.on('change:period', function(m, period){
		Container.empty();
		$.cookie(items_cookie, period);
		BigComments.Records.resetAll();
		BigComments.Records.query('period', period);
		BigComments.Records.loadNext();
	});

	BigComments.init = function(){
		BigComments.on('loadNext', function(){
			BigComments.Records.loadNext();
		});

		/*if (window.bigcommentsJSON && window.bigcommentsJSON['ids']){
			BigComments.Records.reset(window.bigcommentsJSON['ids']);
			BigComments.Records.renderAll();
		} else {*/
			BigComments.Records.loadNext();
		//}

		BigComments.active();
	};

	$(BigComments.init);

}(jQuery, window, document, APP));