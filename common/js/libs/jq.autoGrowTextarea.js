


// @todo спиздить и адаптировать функцию autosizeSetup() с vk.com

$.fn.autoGrowTextarea = function( opts ) {
	
	opts = opts || {};

	return this.each(function() {

		var $textarea = $(this)

		var createMirror = function(textarea) {
			$textarea.after('<div class="autogrow-textarea-mirror"></div>');
			return $textarea.next('.autogrow-textarea-mirror')[0];
		}

		var sendContentToMirror = function (textarea) {
			mirror.innerHTML = textarea.value.split("\n").join('<br/>') + '.<br/>.';
			var curheight = $textarea.height(),
				needheight = $(mirror).height();

			opts.minHeight && (needheight = needheight > opts.minHeight ? needheight : opts.minHeight);

			if (curheight != needheight)
				$textarea.height(needheight);
		}

		var growTextarea = function () {
			sendContentToMirror(this);
		}

		// Create a mirror
		var mirror = createMirror(this);
		
		// Style the mirror
		mirror.style.display = 'none';
		mirror.style.wordWrap = 'break-word';
		mirror.style.padding = opts.padding || $(this).css('padding');
		mirror.style.width = $(this).innerWidth();
		mirror.style.fontFamily = $(this).css('font-family');
		mirror.style.fontSize = $(this).css('font-size');
		mirror.style.lineHeight = $(this).css('line-height');

		// Style the textarea
		// this.style.overflow = "hidden";
		// this.style.minHeight = this.rows+"em";

		// Bind the textarea's event
		$(this).on('keyup', growTextarea);

		// Fire the event for text already present
		sendContentToMirror(this);

	});
};