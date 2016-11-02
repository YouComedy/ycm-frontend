

+function(Tester){

	Tester.runTest(__testid, function( test ){




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
			.wait(5000)

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

	});



}(parent.APP.Tester);
