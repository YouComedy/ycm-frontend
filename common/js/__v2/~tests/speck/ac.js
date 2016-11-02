

+function(Tester){

	Tester.runTest(__testid, function( test ){

		var itemEl = $(".item:first"),
			textarea = itemEl.find("textarea:last").val("").simulate("blur"),
			lastCommentEl;


		// Автокомплит в комментарии
		// ------------------------------------------------------------------------------------------------
		test
			.exec(function(){textarea.simulate("focus")})
			.moduleWait("Autocomplete")
			.wait(300)
			.exec(function(){
				textarea.sendkeys("@ko").simulate("keydown")
			})
			.ajaxWait(/suggest.+/)
			.wait(300)

			.equal("Комментарий. Появился автокомплит", true, function(){
				textarea.autocomplete("search");
				return $(".ui-autocomplete:visible").length  === 1
			})
			.wait(300)
			.equal("Комментарий. Первый юзер выделен", true, function(){
				return $(".ui-autocomplete:visible li:first a").hasClass("ui-state-hover")
			})
			.wait(300)
			.exec(function(){
				textarea.simulate('keydown', {keyCode: $.simulate.keyCode.ENTER});
			})
			.wait(300)
			.equal("Комментарий. Упоминание есть", true, function(){
				return textarea.val().indexOf("@korzhik (Коржик)") > -1
			});



		// Автокомплит в хедере
		// ------------------------------------------------------------------------------------------------
		var input = $("#menu__search").val("").simulate("blur");

		test
			.exec(function(){input.simulate("focus")})
			.moduleWait("Autocomplete")
			.wait(500)
			.exec(function(){
				input.sendkeys("ko").simulate("keydown").autocomplete("search");
			})
			.ajaxWait(/suggest.+/)
			.wait(500)

			.equal("Хедер. Появился автокомплит", true, function(){
				input.simulate("keydown", {keyCode: $.simulate.keyCode.DOWN});
				return $(".ui-autocomplete:visible").length  === 1
			})
			.equal("Хедер. Есть тег кошки", true, function(){
				return $(".ui-autocomplete:visible li:contains('кошки')").length  > 0
			})
			.equal("Хедер. Есть korzhik", true, function(){
				return $(".ui-autocomplete:visible li:contains('korzhik')").length  > 0
			})
			.wait(500);

		test.run();

	});

}(parent.APP.Tester);