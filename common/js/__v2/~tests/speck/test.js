+function(Tester){

	Tester.runTest( __testid, function(test){

		test.on("finish", Tester.buildReport);
		try {




		var itemEl = $(".item:first"),
			textarea = itemEl.find("textarea:last"),
			lastCommentEl;



		// Проверка валидации
		// ------------------------------------------------------------------------------------------------
		test
			.exec(function(){
				textarea.simulate("focus").simulate('keydown', {keyCode: $.simulate.keyCode.ENTER});
			})
			.wait(100)
			.equal("Валидация пустых каментов", true, function(){
				return textarea.css("background-color") !== "rgb(255, 255, 255)";
			});


		// Проверка тянучести поля
		// ------------------------------------------------------------------------------------------------
		test
			.exec(function(){textarea.simulate("focus")})
			.equal("Высота поля < 80px", true, function(){
				return textarea.height() < 80
			})
			.exec(function(){
				// Немного хак, но из-за автокомплита надо
				textarea.val( + textarea.val() + " " + Tester.randomWord(150)).simulate("keyup");
			})
			.wait(500)
			.equal("Высота поля > 100px", true, function(){
				return textarea.height() > 100
			})
			.wait(500)
			.exec(function(){
				textarea.val(textarea.val().substr(0, 100)).simulate("keyup")
			})
			.wait(500)
			.equal("Высота поля < 80px", true, function(){
				return textarea.height() < 80
			});
		


		// Проверка добавление и аттача итема
		// ------------------------------------------------------------------------------------------------
		test
			.exec(function(){
				textarea
					.sendkeys("@korzhik(korzhik) " + itemEl.find('[data-container="shareUrl"]').val())
					.simulate('keydown', {keyCode: $.simulate.keyCode.ENTER});
			})
			
			.ajaxWait(/items\/\d+\/comments/)
			.wait(1000)

			.equal("Есть ссылка с упоминанием", true, function(){
				lastCommentEl = itemEl.find(".comment:last");
				return  lastCommentEl.find(".comment__text").find(".comment_user_link[href*=user]").length > 0
			})
			.wait(1000)
			.equal("Есть итем в аттаче", true, function(){
				return lastCommentEl.find(".comment__text").find("[data-attach-imagesmall]:not(:empty)").length > 0;
			})
			.wait(1000)
			.exec(function(){
				lastCommentEl
					.find("[data-attach-imagesmall]")
					.find('[data-action="openByID"]')
					.simulate("click");
			})
			
			// .moduleWait("Popup")
			// .ajaxWait(/content\/\d+/)
			.wait(4000)

			.equal("Попап с итемом открылся", true, function(){
				// while(!$("#popup:visible .item:visible").length);
				return $("#popup:visible .item:visible").length > 0
			})
			.wait(1000)
			.exec(function(){
				$(".popup__close:visible").simulate("click")
			})
			.wait(1000)
			.equal("Попап с итемом закрылся", true, function(){
				parent.console.log("!!!!")
				return $("#popup:visible .item:visible").length === 0
			})
			.wait(1000);

		
		test.run();
		return false;
		
		var itemEl = $(".item:first"),
			textarea,
			maxSymbols = 400;


		// Проверка диалога упоминания
		// ------------------------------------------------------------------------------------------------
		test
			.exec(function(){
				itemEl.find("[data-addto]").simulate("click");
			})
			// .ajaxWait(/mentions\/suggest/)
			.waitUntil(function(){
				return $(".dialogRepost:visible textarea").length
			})
			.wait(1500)

			.equal("Валидация вызова диалога репоста", true, function(){
				return !!$(".dialogRepost:visible").size();
 			})
 			.wait(1000);


 		test
 			.equal("Теги и дескрипшн в репосте", function(){
 				return([
 					$.trim(itemEl.find(".item__tags").text()),
 					$.trim(itemEl.find('[data-prop="description"]').text())
 				])
 			}, function(){
 				textarea = $(".dialog:visible textarea");
 				return([
 					$.trim($(".dialog:visible .tagedit-listelement-old span").text()),
 					$.trim(textarea.val())
 				])
 			})
 			.wait(1000);



 		

 		test
 			.exec(function(){
 				textarea.sendkeys(Tester.randomWord(4));
 			})
 			.wait(500)
 			.equal("Счетчик символов", true, function(){
 				return(Number(textarea.next().text()) == maxSymbols - textarea.val().length)
 			})
 			.wait(100);

		

		test
			.exec(function(){
				$(".tagedit-listelement-old:last").find('a')
					.data("tester-to-remove", true)
					.simulate("click");
			})
			.wait(1000)
			.equal("Валидация удаления тега", true, function(){
				return !$(".tagedit-listelement-old:last").find('a').data("tester-to-remove")
			})
			.wait(1000)

		// Проверка автокомплита
		// ------------------------------------------------------------------------------------------------
			// .exec(function(){
			// 	$('.ui-autocomplete-input').simulate('click').simulate("focus").val("");
			// })
			// .wait(500)
			// .exec(function(){
			// 	var username = $("[data-action=selectFriend]:first").find('.link').text();
			// 	$('.ui-autocomplete-input').simulate("focus").val(username.slice(0, - 2))
			// 		.simulate("keydown").autocomplete("search")
			// })
			// .wait(1000)
			// // .ajaxWait(/suggest.+/)
			// .waitUntil(function(){
			// 	$(".ui-autocomplete-input").simulate("keydown").autocomplete("search");
			// 	return $(".ui-autocomplete:visible").length
			// })
			// .wait(500)
			// .equal("Появился автокомплит", true, function(){
			// 	return $(".ui-autocomplete:visible").length  > 0
			// })
		
		test.run();

		} catch(e) {
			console.error(e)
		}

	});

}(APP.Tester);