/* =========================================================
 * bootstrap-modal.js v2.0.0
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * edited by E. Korzun
 * ========================================================= */


!function( $ ){

  "use strict"

 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function ( content, options ) {
    this.options = $.extend({}, $.fn.modal.defaults, options)
    this.$element = $(content)
      .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
  }

  Modal.prototype = {

      constructor: Modal

    , toggle: function () {
        return this[!this.isShown ? 'show' : 'hide']()
      }

    , show: function () {
        var that = this

        if (this.isShown) return

        $('body').addClass('modal-open')

        this.isShown = true
        this.$element.trigger('show')

        escape.call(this)
        backdrop.call(this, function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          !that.$element.parent().length && that.$element.appendTo(document.body) //don't move modals dom position

          that.$element
            .show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element.addClass('in')

          transition ?
            that.$element.one($.support.transition.end, function () { that.$element.trigger('shown') }) :
            that.$element.trigger('shown')

        });
        
        this.$element.trigger( 'dialog.' + this.$element.attr('id')  + '.open' );
        
      }

    , hide: function ( e ) {
        e && e.preventDefault()

        if (!this.isShown) return

        var that = this
        this.isShown = false

        $('body').removeClass('modal-open')

        escape.call(this)
        
        YCM && YCM.goPrev();

        this.$element
          .trigger('hide')
          .removeClass('in')

        $.support.transition && this.$element.hasClass('fade') ?
          hideWithTransition.call(this) :
          hideModal.call(this)
      }
      
      , buttons: function( buttons ) {
      	 this.$element.data('buttons', buttons);
      	 renderButtons( this.$element , true );
      },
      
      
      vibro: function(){
      	for( var t = 14, i = 5, k = 5; --i; )
	      	this.$element
	      		.animate({'marginLeft': '-=' + (i*k)}, t * i)
	      		.animate({'marginLeft': '+=' + (i*k)}, t * i);
      }
      
  }


 /* MODAL PRIVATE METHODS
  * ===================== */

  function hideWithTransition() {
    var that = this
      , timeout = setTimeout(function () {
          that.$element.off($.support.transition.end)
          hideModal.call(that)
        }, 500)

    this.$element.one($.support.transition.end, function () {
      clearTimeout(timeout)
      hideModal.call(that)
    })
  }

  function hideModal( that ) {
    this.$element
      .animate({
			top: 0,
			opacity: 0
		}, 200, function(){
			$(this).hide();
			//.find("div.modal-body > *").remove()
			//.end().find('div.modal-footer > a').remove();
		})
      .trigger('hidden')

    backdrop.call(this)
  }

  function backdrop( callback ) {
    var that = this
      , animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').css('zIndex', 1040)
        .appendTo(document.body)

      if (this.options.backdrop != 'static') {
        this.$backdrop.click($.proxy(this.hide, this))
      }

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      doAnimate ?
        this.$backdrop.one($.support.transition.end, callback) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        this.$backdrop.one($.support.transition.end, $.proxy(removeBackdrop, this)) :
        removeBackdrop.call(this)

    } else if (callback) {
      callback()
    }
  }

  function removeBackdrop() {
    this.$backdrop.remove()
    this.$backdrop = null
  }

  function escape() {
    var that = this
    if (this.isShown && this.options.keyboard) {
      $(document).on('keyup.dismiss.modal', function ( e ) {
        e.which == 27 && that.hide()
      })
    } else if (!this.isShown) {
      $(document).off('keyup.dismiss.modal')
    }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  
	$.fn.modal = function(option, param) {
		return this.each(function() {
			var $this = $(this), data = $this.data('modal'), options = typeof option == 'object' && option;
			
			if(!data)
				$this.data('modal', ( data = new Modal(this, options)))
			if( typeof option == 'string')
				data[option](param);
			else
				data.show()
		})
	}


  
	$.fn.modal.defaults = {
		backdrop : true,
		keyboard : false,
		form: false
	}


  $.fn.modal.Constructor = Modal;
  
  function renderButtons( target, force ) {
  	var buttons = target.data('buttons');
  	if(!buttons || (target.data('has-buttons') && !force)) return false; 
  	 var footer = target.find('div.modal-footer').empty();
  	 for( var k in buttons ) {
  	 	var btn = buttons[k];
  	 	$('<a class="btn" />')
  	 		.attr( 'href',  btn.href || '#')
  	 		.text( btn.label || k )
  	 		.click(
  	 			(function(fn){
	  	 			return fn ? function(){
		  	 			fn.call( this, target.find('.modal-body'), target );
		  	 			return false;
	  	 			} : null;
  	 			})(btn.click || btn)
  	 		)
  	 		.attr('title', btn.title || '')
  	 		.addClass( btn.className || '')
  	 		.data('submit', btn.submit || null )
  	 		.appendTo( footer );
  	 }
  	 target.data('has-buttons', true);
  }
  
  
  
 /* MODAL DATA-API
  * ============== */

 
	$(function() {

		$('body').on('click.modal.data-api', 'a[data-toggle="modal"]', function(e) {
			var $this = $(this),
				href,
				$target = $($this.attr('data-target') || ( href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')),
				option = $target.data('modal') ? 'toggle' : $.extend({}, $target.data(), $this.data()),
				url = this.href,
				isajax = $target.data('url'),
				title = $this.attr('title');

			//console.log( isajax, url )

			if(isajax ) {
				if(title)
					$target.find('h3').text(title);
				e.preventDefault();
				$target.modal(option).animate({
					top : 300,
					opacity : 1
				}, 200);
				$target.find('div.modal-body')
					.text('loading...')
					.load(isajax, function(html) {
						
						var block = $(this).html(html);
						renderButtons($target, $this.data('buttons'));
						
						$target.find("input:text").filter(":first").focus();
				})
			} else {
				e.preventDefault();
				renderButtons($target, $this.data('buttons'));
				$target.modal(option).animate({
					top : 300,
					opacity : 1
				});
				$target.find("input:text").filter(":first").focus();
			}

		});
	});

}( window.jQuery );