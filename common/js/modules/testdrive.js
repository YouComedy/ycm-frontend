(function( $, window, document, APP ){


	var Testdrive = new APP.Module({
		'inited' : true,
		'name' : 'Testdrive',
		autoload : true
	});

	var ItemContainer = $('#items');
	var ItemView = APP.views.ItemGridMain;

	var ItemCollection = window.items = new (APP.collections.Items.extend({
		urlRoot : '/top/load',
		view: ItemView,
		viewContainer: ItemContainer
	}));

	ItemCollection.on('successLoad', function(){

		// ItemCollection.renderAll();

		var _this = this;


		_.each(_this.filter(function( item, i ){
			return i < 3;
		}), function( item ){
			if( _this.view ){
				var view = new _this.view({model : item});
				view.render(ItemContainer);
				item._rendered = true;
			}
		});
	})

	var CommentContainer = $('#comments');

	var CommentView = Backbone.View.extend({
		className: 'panel subscribePanel',
		template: _.template([
			'<div class="_cell">',
				'<a class="thumb" href="{{= url }}"><img class="thumb__img" src="{{= avatar }}"></a>',
				'<a class="title" href="#comment{{= index }}" data-prop="fullname">{{= fullname }}</a>',
				'<div class="remark">{{= time }}</div>',
			'</div>',
			'<div class="subscribePanel__stat _cell">',
				'<div class="title">{{= item_count }}</div>',
				'<div class="subscribePanel__statLabel">{{= plural(item_count, "шутка,шутки,шуток") }}</div>',
			'</div>',
			'<div class="subscribePanel__stat _cell">',
				'<div class="title">{{= follow_count }}</div>',
				'<div class="subscribePanel__statLabel">{{= plural(follow_count, "подписчик,подписчика,подписчиков") }}</div>',
			'</div>',
			'<div class="subscribePanel__buttonWrap _cell">',
				'{{= APP.User.renderFollowBtn(null, uid) }}',
			'</div>'
		].join('')),

		'render' : function(){
			this.$el.html(this.template(this.model.toJSON()));
			CommentContainer.append(this.$el);
		},

		myprops : ["fullname"],

		'initialize' : function(){
			var thisview = this;
			this.model.on("change", function( model ){
				console.log(model.changed)
				model.changed && _.each(model.changed, function( val, prop ){
					if(_.indexOf(thisview.myprops, prop) > -1) {
						thisview.$("[data-prop='"+prop+"']").text(val)
					}
				});
			})
		}
	});

	var CommentModel = Backbone.BaseModel.extend({
		defaults : {
			index: 0,
			uid: 0,
			avatar: '/common/img/profile/avatar_small.png',
			fullname: '',
			time: prettyDate(+new Date),
			item_count: 0,
			follow_count: 0,
			url: '#'
		},
		initialize: function(){
			this.set("uid", this.id);
		}
	});

	var CommentCollection = Testdrive.Records = new (window.Collection.extend({

		dataField : "data",
		autoRender: true,
		viewContainer : CommentContainer,
		model : CommentModel,
		view: CommentView,
		index : 1,

		//url : '/user/' + APP.User.get('username') + '/getFollowingBy',

		initialize : function(){
			this.on("add", function(item, collection){
				item.set("index", this.index++);
			})
			.on("reset", function(){
				this.index = 1;
			})
			.on('beforeLoad', function(){
				$$('#items-loader').show();
			})
			.on('completeLoad', function(){
				$$('#items-loader').hide();
			})
			.on('maxItems', function(){
				console.warn("konets")
			})
		}

	}));

	Testdrive.init = function(){

		Testdrive.set("url", "getFollowingBy");

		Testdrive.on("loadNext", function(){
			Testdrive.Records.loadNext();
		});

		Testdrive.Records.loadNext();
		ItemCollection.loadNext();
		Testdrive.active();
	};


	Testdrive.on("change:url", function(m, url){
		Testdrive.Records.resetAll();
		Testdrive.Records.url = '/user/' + APP.User.get('username') + '/' + url;
		CommentContainer.empty();
		Testdrive.Records.loadNext();

		$("a").filter("[data-param='"+url+"']").makeActive(true, "title");
	});


	Testdrive.setFilter = function( val, evt ){
		if(Testdrive.Records.isBusy()) return false;
		Testdrive.set("url", val);
	}


	$(Testdrive.init);

}(jQuery, window, document, APP));