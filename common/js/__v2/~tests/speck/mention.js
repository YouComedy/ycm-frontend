+function(Tester){

	Tester.runTest( __testid, function(test){

		// первый итем на странице
		var itemEl = $(".item:first");

		// Проверка диалога упоминания
		// ------------------------------------------------------------------------------------------------
		test
			.exec(function(){
				itemEl.find("[data-action=localShare]").simulate("click");
			})
			// .ajaxWait(/mentions\/suggest/)
			.waitUntil(function(){
				return $("[data-action=selectFriend]:first").length
			})
			.wait(1500)
			.equal("Валидация вызова диалога упоминания", true, function(){
				return !!$(".dialog.localShare:visible").size();
 			});

		test
			.exec(function(){
				$("[data-action=selectFriend]:first").simulate("click");
			})
			.waitUntil(function(){
				return $("[data-action=selectFriend]:first").hasClass('_checked')
			})
			.equal("Валидация выбора пользователя для упоминания по клику", true, function(){
				return $("[data-action=selectFriend]:first").hasClass('_checked') &&
					($(".tagedit-listelement-old span").text() == $("[data-action=selectFriend]:first").find('.link').text());
			})
			.wait(1500);

		test
			.exec(function(){
				$(".tagedit-listelement-old:first").find('a').simulate("click");
			})
			.wait(1000)
			.equal("Валидация удаления выбранного пользователя", true, function(){
				return !$(".tagedit-listelement-old").find('a').size() &&
					!$("[data-action=selectFriend]:first").hasClass('_checked');
			})
			.wait(1000)

		// Проверка автокомплита
		// ------------------------------------------------------------------------------------------------
			.exec(function(){
				$('.ui-autocomplete-input').simulate('click').simulate("focus").val("");
			})
			.wait(500)
			.exec(function(){
				var username = $("[data-action=selectFriend]:first").find('.link').text();
				$('.ui-autocomplete-input').simulate("focus").val(username.slice(0, - 2))
					.simulate("keydown").autocomplete("search")
			})
			.wait(1000)
			// .ajaxWait(/suggest.+/)
			.waitUntil(function(){
				$(".ui-autocomplete-input").simulate("keydown").autocomplete("search");
				return $(".ui-autocomplete:visible").length
			})
			.wait(500)
			.equal("Появился автокомплит", true, function(){
				return $(".ui-autocomplete:visible").length  > 0
			})
			

			test.run();
	});

}(parent.APP.Tester);