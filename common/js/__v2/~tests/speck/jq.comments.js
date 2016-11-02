
F.speed = 100;
// QUnit.config.autostart = false;
module('comments', {
	setup: function() {
	    // F.open('/top');
	    // F.open('/user/korzhik');
	  }
});


test( "comments input", function() {

	var textarea = F(".item:first textarea")
	var oldHeight = textarea.height();

	textarea
		.click()
		.height(function( current ){
			return current > oldHeight;
		}, "Фокус");

	textarea
		.type("[enter]")
		.wait(function(){
			return $(this).css("background-color") !== "rgb(255, 255, 255)"
		}, 5000)
		.visible(function(){
			ok($(this).css("background-color") !== "rgb(255, 255, 255)", "Пустой камент")
		});


});



test( "cmts ac", function() {
	
	F(".item:first textarea")
		.type("@ko")
		.hasClass("ui-autocomplete-input", true, 5000)
		.visible(function(){
			ok($(this).hasClass("ui-autocomplete-input"), "ac")
		});

	F(".item:first .ui-autocomplete")
		.visible(function(){
			ok($(this).hasClass("ui-autocomplete"), "ac !!!")
		}, 5000)

});