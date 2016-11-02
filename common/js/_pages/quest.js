$(function(){


	function convertTagToKey( tag ) {
		return tag.replace(/[\s\,\-]/ig,'').toLowerCase();
	}


	var 
		TagsWeights = {},
		ViewIndex = [],
		TagsListTmp = window.TAGS_LIST_TMP,
		TagsImgMap = {
			"Животные":"animals",
			"Арт и Креатив":"art",
			"Авторское":"author",
			"Автомобили":"avto",
			"Матерные, пошлые":"censored",
			"Черный Юмор":"cherniiumor",
			"Комиксы":"comics",
			"Комментарии":"comments",
			"COUB":"coub",
			"Еда":"eda",
			"Эротика":"erotic",
			"Fail":"fail",
			"Женщины":"female",
			"Игры":"games",
			// "Сексуальные меньшинства":"gay",
			"Geek":"geek",
			"GIF":"gif",
			"Гопники, быдло":"gopota",
			"Грамматика":"grammatika",
			"Иностранный":"inostrannii",
			// "тв, сериалы, мультики, кино":"kino",
			"IT":"komp",
			"Мужчины":"male",
			"Мемы":"memes",
			"Музыка":"music",
			"Научный":"nauka",
			"Ностальгический":"nostalgie",
			"Новости":"novosti",
			"Политика":"politics",
			"Праздничный":"prazdnik",
			"Фотошоп, фейссвап":"ps",
			"Работа":"rabota",
			"Расистский":"rasizm",
			// "Реклама":"reklama",
			"Религия":"religia",
			"Родители, дети":"roditeli",
			"Россия":"russia",
			"Школьный":"school",
			// "Любовь, секс, отношения":"sex",
			"Спорт":"sport",
			"Стендап":"stendap",
			"Университет":"stud",
			// "Таблички, Надписи, Вывески":"tabli4ki",
			"Текст":"tekstovie",
			"Твиттер":"twitter",
			"Интеллектуальный":"umnii",
			"Видео":"video",
			"VINE":"vine",
			"Вредные привычки":"vrednie-privi4ki",
		};
	
	_.each(window.TAGS_WEIGHTS, function( weight, key ){
		key = convertTagToKey(key);
		TagsWeights[key] = weight;
	});

	_.each(TagsImgMap, function(val, key){
		TagsImgMap[convertTagToKey(key)] = val;
	});

	delete window.TAGS_WEIGHTS;
	delete window.TAGS_LIST_TMP;


	var Quest = new APP.Module({
		name : "Quest",
		inited : false,
		needScores : window.NEED_SCORES,
		curScores : 0,
		files : [
			"/common/js/libs/ui.autocomplete.js?" + window.STATIC_VERSION,
			"/common/js/libs/ui/autocomplete.js?" + window.STATIC_VERSION
		]
	});




	var TagView = Backbone.View.extend({
		TPL_FULL : _.template($("#tag-flip-tpl").html()),
		tagName : "div",
		className : "flip-container",
		events : {
			"click .panelFlip" : "switchTag"
		},

		initialize : function(){
			var self = this, model = self.model;
			this._state = "front";
			model._seen = true;
			self.$el.html(self.TPL_FULL(model.attributes));
		},

		renderBack : function(){
			var self = this, el = self.$el;

			if( self._state === "front" ) {
				self._state = "back";
			} else {
				self._state = "front";
			}

			var block = el.find("." + self._state).find("._cell");
			block.find("span").text(self.model.get("tstr"));
			
			block = block.find("div").toggleClass("_hide",!self.model.get("img"));
			!block.hasClass("_hide") && block.css("background-image", "url(" + self.model.get("img") + ")");

			el.toggleClass("hover", self._state === "back");

		},
		
		render : function(){
			$("#TagsContainter").append(this.$el);
		},

		switchTag : function(e){
			var self = this, el = self.$el;

			if( e && e.type === "click") {
				el.off("mouseleave");
				clearTimeout(self._timer);
				self._timer = null;
				
				if( el.hasClass("_active")) {
					selectedTags.remove(self.model);
				} else {
					selectedTags.add(self.model);
				}
				
				el.toggleClass("_active");

				console.log(el[0].className)

				if(el.hasClass("_active") === false)
					return false;

				console.log(el.hasClass("_active"))

				el.one("mouseleave", function(){
						console.log(1);
						el.off("mouseleave");
						clearTimeout(self._timer);
						self._timer = null;

						self._timer = setTimeout(function(){
							// if(el.hasClass("_active")) return;
							
							var tmpModel = getTempModel();

							el.removeClass("_active");

							self.model = tmpModel;
							self.model._seen = true;
							self.renderBack();


						}, 0);
					});

				return false;
			} else {

				var tmpModel = getTempModel();
				if(!tmpModel) return false;
				
				self.model = tmpModel;
				self.model._seen = true;
				self.renderBack();
			}

			return false;
		}
	});



	var TagsList = Quest.records = new Backbone.Collection;
	TagsList.on("add", function(tag){
		var key = convertTagToKey(tag.get("tstr"));
		tag.set({
			key : key,
			img : TagsImgMap[key] && "/common/img/pages/quest/tags/" + TagsImgMap[key] + ".png"
		})
	});

	_.each(TagsListTmp, function(val, key){
		TagsList.add({
			id: TagsList.length,
			tstr : key
		});
	});

	var selectedTags = Quest.selectedTags = new Backbone.Collection;

	

	function getTempModel(){
		var fn = function(m){return !m._rendered && !m._seen},
			tmpModel = TagsList.find(fn);
		TagsList.models = TagsList.shuffle();
		if(!tmpModel) {
			TagsList.each(function(m){m._seen = null});
			tmpModel = TagsList.find(fn);
		}

		return tmpModel;
	}


	function getTagWeight(tag){
		return TagsWeights[tag.get("key")] || 100;
	}
	
	selectedTags

		.on("add", function(tag, selectedTags, opts){

			!tag.has("key") && tag.set("key", convertTagToKey(tag.get("tstr")));
			Quest.set("curScores", Quest.get("curScores") + getTagWeight(tag));
			tag._rendered = true;
			
			// console.log(tag.get("tstr"), TagsListTmp[tag.get("tstr")]);

			_.each(TagsListTmp[tag.get("key")], function( _tag ){
				TagsList.add({
					id: TagsList.length,
					tstr : _tag
				});
				TagsList.models = TagsList.shuffle();
			});

			if( !(opts || {}).noTrigger )
				$$("#tagedit-input").val( tag.get("key") ).trigger("forceTransformToTag", [tag.id]);
		})

		.on("remove", function( tag, selectedTags, opts ){
			tag._rendered = false;
			Quest.set("curScores", Quest.get("curScores") - getTagWeight(tag));
			if( !(opts || {}).noTrigger )
				$$("#tags-autocomplete").find("input[value='"+tag.get("key")+"']").parent().remove();
		});

	Quest.on("change:curScores", function(Quest, scores){
		var val = scores /  Quest.get("needScores") * 100;
		Quest.updateProgress( val );
		if(scores >= Quest.get("needScores"))
			Quest.trigger("finished");
		else {
			Quest.set("canSubmit", false);
			
		}
			
	});

	Quest.on("finished", function(){
		Quest.set("canSubmit", true);
	});

	Quest.on("change:canSubmit", function(){
		$$("#submitBtn")[(Quest.get("canSubmit") ? "remove" : "add")+"Class"]("_grey")
	});


	Quest.on("change:refreshing", function(){
		// alert(Quest.get("refreshing"))
		$$("#btnReload")[(Quest.get("refreshing") ? "add" : "remove")+"Class"]("_active");
	});

	Quest.refreshAll = function( evt ){
		if(Quest.has("refreshing")) return;
		Quest.set("refreshing", true);
		for (var i = ViewIndex.length - 1, j = i; i >= 0; i--) {
			(function(i){
				setTimeout(function(){
					ViewIndex[i].switchTag();
					j-- === 0 && setTimeout(function(){
						Quest.unset("refreshing");
					}, 1000);
				}, i % 4 * 500 )
			})(i);
		};
	}


	Quest.updateProgress = function( val ) {
		val = val > 100 ? 100 : val;
		if( val == 0 || val >= 100 ){
			$("#progress").parent().addClass('noslider');
		} else {
			$("#progress").parent().removeClass('noslider');
		}
		var bar = $("#progress").css("width", val + "%");
		bar[(val >= 100 ? "add" : "remove")+"Class"]("bar-success");
	}


	Quest.firstRender = function(){

		// Debug
		// TagsList.each(function(tag, i){
		// 	_.each(TagsListTmp[tag.get("key")], function( _tag ){
		// 		TagsList.add({
		// 			id: TagsList.length,
		// 			tstr : _tag
		// 		});
		// 	});
		// })

		TagsList.each(function(tag, i){
			// Закоментил для дебага
			if( i >= 16 ) return false;
			var view = new TagView({model : tag});
			view.render();
			ViewIndex.push(view);
		});
		Quest.safecall("init");
		Quest.updateProgress(0);
	}


	Quest.submitForm = function(){
		if(Quest.get("canSubmit"))
			$("#tagsForm").submit();
		return false;
	}


	Quest.init = function(){
		$("#tags-autocomplete").find(".js-tag").applyPlugin( "tagedit", {
            autocompleteURL : "/tags/suggest",
            placeholder : "Выберете теги из списка или введите свои теги",
            onRemove : function( val, id ){
            	selectedTags.remove(selectedTags.find(function(t){return t.get("key") == val}), {noTrigger : true});
            },
            onAdd : function( val, id ){
            	var tmp = TagsList.find(function(t){return t.get("key") == val});
            	if(!tmp){
            		tmp = new Backbone.Model({
            			tstr : val
            		})
            	}
            	// console.log("onadd", val, )
            	selectedTags.add( tmp, {noTrigger : true});
            },
            // minLength : 2,
            // submitCallback : function( el ) {el.parents("form").submit()},
            // onMinLengthError : function(){$.alertError(MIN_TAGS_ERROR_MSG)},
            autocompleteOptions : {appendTo : "#tag-ac"}
        });
	}

	Quest.firstRender();

})