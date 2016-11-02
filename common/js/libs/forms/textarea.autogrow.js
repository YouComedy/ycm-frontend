


// @todo спиздить и адаптировать функцию autosizeSetup() с vk.com

jQuery.fn.autoGrowTextarea = function( opts ) {
	
	opts = opts || {};

	return this.each(function() {

		var createMirror = function(textarea) {
			jQuery(textarea).after('<div class="autogrow-textarea-mirror"></div>');
			return jQuery(textarea).next('.autogrow-textarea-mirror')[0];
		}

		var sendContentToMirror = function (textarea) {
			mirror.innerHTML = textarea.value.split("\n").join('<br/>') + '.<br/>.';
			if (jQuery(textarea).height() != jQuery(mirror).height())
				jQuery(textarea).height(jQuery(mirror).height());
		}

		var growTextarea = function () {
			sendContentToMirror(this);
		}

		// Create a mirror
		var mirror = createMirror(this);
		
		// Style the mirror
		mirror.style.display = 'none';
		mirror.style.wordWrap = 'break-word';
		mirror.style.padding = opts.padding || jQuery(this).css('padding');
		mirror.style.width = jQuery(this).innerWidth();
		mirror.style.fontFamily = jQuery(this).css('font-family');
		mirror.style.fontSize = jQuery(this).css('font-size');
		mirror.style.lineHeight = jQuery(this).css('line-height');

		// Style the textarea
		// this.style.overflow = "hidden";
		// this.style.minHeight = this.rows+"em";

		// Bind the textarea's event
		$(this).on('keyup', growTextarea);

		// Fire the event for text already present
		sendContentToMirror(this);

	});
};