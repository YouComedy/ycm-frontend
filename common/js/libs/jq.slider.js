


;
(function( $ ){

	var IE = (new Function("return 0 /*@cc_on || 1@*/")());
	
	"use strict";
	
	function auto(context, f1, f2, args){
		f1.call( context, args );
		setTimeout(function(){
			f2.call( context, args );
		}, context.opts.speed + 5 );
	}

	var Slider = function( element, options ) {
		this.el = $(element);
		this.opts = $.extend({}, $.fn.slider.defaults, options);
		this.$wrapper = this.el.children().children("ul");
		this.slides = this.$wrapper.children();
		this.length = this.slides.length;
		this.slide_width = this.opts.slide_width || this.$wrapper.children(":first").width();
		this.in_progress = false;
		this.current = this.opts.current || 0;
		this.opts.animation = this.opts.animation || this.el.hasClass('fx');
		
		this.opts.offsetY = this.el.outerHeight( true ) - this.el.height();
		
		this.recalc();
		
		this._ch = 0;

		this.js_anim = true;
		
		// if( this.opts.useCSS ) {
		// 	if(IE || !$.support.transition) {
		// 		this.el.removeClass('fx');
		// 		this.js_anim = true;
		// 	}
		// }
		
	}
	
	Slider.prototype = {
		
		'fixHeight' : function(){
			var h = $(this.slides[this.current]).height();
			if( this._ch != h ) {
				this.el.css('height', h + this.opts.offsetY + "px");
				this._ch = h;
			}
		},
		
		
		'slideIndex' : function(){
			return this.current
		},
		
		recalc : function(){
			
			// check the correct count slides
			var check = Math.ceil(100 / this.length) - 100 / this.length;
			//console.log( check )
			//if( check ) while( check-- ) this.add("" , true);
			
			if( this.opts.fluid ) {
	        	this.slide_width = 100 / this.length;
	        	this.slides.css('width', this.slide_width + "%");
	        	this.$wrapper.css("width", 100 * this.length + "%");
			}
		},
		
		'add' : function( slide, force ){
			if( force ) {
				var new_slide = this.slides.filter(":last").clone();
				new_slide.attr("id", "slide" + Math.round(Math.random() * 1000));
				this.slides.push(new_slide[0]);
				this.length++;
				return;
			}
			var empty = this.slides.filter(":empty");
			var new_slide;
			if( empty.length ) {
				new_slide = $(empty[0]);
			} else {
				new_slide = this.slides.filter(":last").clone();
				new_slide.empty().appendTo( this.$wrapper );
				new_slide.attr("id", "slide" + Math.round(Math.random() * 1000));
				this.slides.push(new_slide[0]);
				this.length++;
			}
			
			new_slide.html(slide);
			this.recalc();
		},
		
		'next' : function(){return this.moveTo(this.current + 1)},
		'prev' : function(){return this.moveTo(this.current - 1)},
		
		'start' : function( num ){
			var _this = this, o = _this.opts;
			var isfx = o.animation;
			
			// isfx &&
			// 	_this.el.removeClass("fx");
				
			var slide = _this.slides.removeClass("active").filter(":eq("+num+")").addClass("active");
			var offsetX = '-' + (o.fluid && (100 * num + '%')) || (_this.slide_width * num + 'px');
			this.$wrapper.css('marginLeft', offsetX);
			
			_this.current = num;
			
			if( o.autoHeight ) {
				_this.el.css("height", slide.height() + o.offsetY + "px");
			}
			
			// isfx && setTimeout(function(){
			// 	_this.el.addClass("fx");
			// }, Math.random() * 50 + 10);
		},
		
		'to' : function( to, num ) {
			return (Number(to) == to) ? this.moveTo( to )
					: this[to] ? this[to](num)
					: typeof to === 'string' ? this.moveTo($( to ).index())
					: false;
		},
		
		'moveTo' : function( index, no_anim, force, undefined ){
			if( !force && (this.current == index  || index === undefined || this.in_progress))
				return;
			
			var _this = this,
				old_index = this.current,
				new_index = index < this.length && index > -1 ? index : 0,
				cur_drop_class = old_index != new_index && old_index,
				curr_slide = $(this.slides[old_index]),
				next_slide = $(this.slides[(this.current = new_index)]),
				offsetX = '-' + (this.opts.fluid && (100 * new_index + '%')) || (this.slide_width * new_index + 'px');
			
			curr_slide.addClass("active");
			next_slide.addClass("active");
			
			//var diff = Math.abs(this.current - index);
			//console.log(diff , diff > 1 ? this.opts.speed * (1 - (diff / this.length)) : this.opts.speed )
			
			if( this.opts.animation && !no_anim ) {
				
				this.el.trigger( 'slideStart', [curr_slide, next_slide, old_index, new_index]);
				this.in_progress = true;
				
				if( !this.js_anim ) {
					
					
					if( this.opts.autoHeight ) {
						
						var ch = curr_slide.height(), nh = next_slide.height();  
						if( nh > ch ) {
							
							this.el.css('height', nh + _this.opts.offsetY + "px");
							
							setTimeout(function(){
								_this.$wrapper.css('marginLeft', offsetX);
								setTimeout(function(){
									_this.in_progress = false;
									cur_drop_class && curr_slide.removeClass("active");
									_this.el.trigger( 'slideEnd', [curr_slide, next_slide, old_index, new_index]);
								}, _this.opts.speed + 5);
							}, _this.opts.speed + 5);
							
							
						} else {
							
							_this.$wrapper.css('marginLeft', offsetX);
							setTimeout(function(){
								_this.el.css('height', nh + _this.opts.offsetY + "px");
								setTimeout(function(){
									_this.in_progress = false;
									cur_drop_class && curr_slide.removeClass("active");
									_this.el.trigger( 'slideEnd', [curr_slide, next_slide, old_index, new_index]);
								}, _this.opts.speed + 5);
							}, _this.opts.speed + 5);
							
						}
					} else {
						_this.$wrapper.css('marginLeft', offsetX);
							setTimeout(function(){
								_this.in_progress = false;
									cur_drop_class && curr_slide.removeClass("active");
									_this.el.trigger( 'slideEnd', [curr_slide, next_slide, old_index, new_index]);
							}, _this.opts.speed + 5);
					}
					
				} else {
					
					
					if( this.opts.autoHeight ) { 
						
						var ch = curr_slide.height(), nh = next_slide.height();
						
						if( nh > ch ) {
							
							_this.el.animate({
								'height' : nh + _this.opts.offsetY
							}, function(){
								_this.$wrapper.animate({
									'marginLeft': offsetX
								}, function(){
									_this.in_progress = false;
									cur_drop_class && curr_slide.removeClass("active");
									_this.el.trigger( 'slideEnd', [curr_slide, next_slide, old_index, new_index]);
								});
							});
							
						} else {
							
							_this.$wrapper.animate({
								'marginLeft': offsetX
							}, function(){
								_this.el.animate({
									'height' : nh + _this.opts.offsetY
								}, function(){
									_this.in_progress = false;
									cur_drop_class && curr_slide.removeClass("active");
									_this.el.trigger( 'slideEnd', [curr_slide, next_slide, old_index, new_index]);
								});
							});
														
						}
						
						
					} else {
						_this.$wrapper.animate({
							'marginLeft' : offsetX
						}, _this.opts.speed, null, function(){
							_this.in_progress = false;
							cur_drop_class && curr_slide.removeClass("active");
							_this.el.trigger( 'slideEnd', [curr_slide, next_slide, old_index, new_index]);
		            	});
					}
	            		
				}
				
				return true;
            	
			}
			
			this.$wrapper.css('marginLeft', offsetX);
			
		},


		initAutoplay : function(){
			var self = this;
			self.opts.autoPlay = true;
			function next(){
				// alert([self.current, self.length ]);
				if( self.current == self.length - 1) {
					self.opts.autoPlay = false;
				}
				self.opts.autoPlay && !self._aptimer && (self._aptimer = setTimeout(function(){
					self.next();
				}, 3333));
			}

			self.el

			.on("slideEnd", next)
			.on("slideStart", function(){
				clearTimeout(self._aptimer);
				self._aptimer = false;
			})
			.on("mouseenter", function(){
				clearTimeout(self._aptimer);
				self._aptimer = false;
			})
			.on("mouseleave", next);
			next();
		}
		
	}
	
	
	$.fn.slider = function( option, num ) {
		//console.log( option, $( option ).index() )
		return option  == "slideIndex" ? $(this).data('slider-api')[option]() : this.each(function() {
			var $this = $(this),
				data = $this.data('slider-api'),
				options = typeof option == 'object' && option;
			
			!data && 
				$this.data('slider-api', (data = new Slider(this, options)))
			
			data.to(option, num);

			if( option.autoPlay ) {
				data.initAutoplay();
			}
		});
	}

	
	$.fn.slider.defaults = {
		fluid : true,
		speed : 500,
		start : 0,
		useCSS : true,
		animation: true,
		autoHeight : false,
		offsetY : 0,
		autoPlay : false
	}
	
	
	$.fn.slider.Constructor = Slider;
	

	$(function() {
		$('body').on('click.slider-api', 'a[data-slider]', function(e) {
			var $this = $(this), $target = $($this.attr('data-slider'));
			$target.slider(($this.attr('data-move') || $this.attr('href')).replace(/.*(?=#[^\s]+$)/, ''));
			e.preventDefault();
			return false;
		});
	});


})( window.jQuery );