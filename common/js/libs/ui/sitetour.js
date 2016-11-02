/*
 * ************************************************************* *
 * Name       : Power Tour                                       *
 * Date       : June 2012                                        *
 * Owner      : CreativeMilk                                     *
 * Url        : www.creativemilk.net                             *
 * Version    : 1.2                                              *
 * Updated    : 15/11/2012                                       *
 * Developer  : Mark                                             *
 * Dependency :                                                  *
 * Lib        : jQuery 1.7+                                      *
 * Licence    : NOT free                                         *
 * http://codecanyon.net/item/power-tour-powerfull-creative-jquery-tour-plugin/3246071
 * ************************************************************* *
 */

;(function($, window, document, APP, undefined){
    $.fn.powerTour = function(options) { 
	
		options = $.extend({}, $.fn.powerTour.options, options); 
	 
			return this.each(function() {  
				
				/**
				* Variables.
				**/
				var obj                  = $(this);
				var mainId               = Math.floor(Math.random()*1111);
				var arrowSize            = 8;
				var px50p                = '50%';
				var px20                 = '20';
				var timeouts             = [];
				var totalSteps           = options.step.length;
                var customClass          = '';
				var cur                  = 0;
        		var tid                  = '';
				var o_step               = options.step;
				var o_tourType           = options.tourType;
				var o_easingEffect       = options.easingEffect;
				var o_timeButtonOrder    = options.timeButtonOrder;
				var o_stepButtonOrder    = options.stepButtonOrder;
				var o_showTimeControls   = options.showTimeControls;
				var o_effectSpeed        = options.effectSpeed;
				var o_overlayOpacity     = options.overlayOpacity;
				var o_travelSpeed        = options.travelSpeed;
				var o_animated           = options.animated;
				var o_timerLabel         = options.timerLabel;
				var o_keyboardNavigation = options.keyboardNavigation;
				var o_runOnLoad          = options.runOnLoad;
				var o_runOnLoadDelay     = options.runOnLoadDelay;
				var o_exitUrl            = options.exitUrl;
				var o_showTimer          = options.showTimer;
				var o_easyCancel         = options.easyCancel;
				var o_onCancel           = options.onCancel;
				var o_onStop             = options.onStop;
				var o_onStart            = options.onStart;
				var o_onFinish           = options.onFinish;
				var screenPos            = new Array('sc','stl','stm','str','srm','sbr','sbm','sbl','slm');
		
				//*****************************************************************//
				//////////////////////// MOBILE ENHANCEMENT /////////////////////////
				//*****************************************************************//	
							
					/**
					* Check for touch support and set right click events.
					**/
					if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
						var clickEvent = 'click tap';
					}else{
						    clickEvent = 'click';
					}
			
				//*****************************************************************//
				/////////////////////// CREATE ALL STEPS LOOP ///////////////////////
				//*****************************************************************//
				 
					/**
					* Create all steps with a loop.
					**/	
					$.each(o_step, function(i, value){										

						/**
						* Check for screen postions, they should 
						* not use an hook, so append to body instead.
						**/					
						if($.inArray(value.arrowPosition, screenPos) == -1){
							
							var theHook = $(value.hookTo);
							
							/**
							* Add a relitive class for the highlight function.
							**/	
							theHook.addClass('powertour-hook-relative');
							
						}else{
						    var theHook = $('body');								
						}

						/**
						* Set the styling class.
						**/	
						if($.trim(value.customClassStep)){
							var stylingClass = value.customClassStep;		
						}else{
							var stylingClass = '';
						}
						
						/**
						* savety width.
						**/	
						if(value.width){
							var sWidht = value.width;
						}else{
							var sWidht = 300;
						}
						
						/**
						* Build the powerTour template.
						* We need to build it inside the loop
						* this because of the dataset step.
						**/
						var tourTemp = '<div class="powertour powertour-style-basic '+stylingClass+'" style="display:none;" data-tour-id="'+mainId+'" data-tour-step="'+i+'">'+
										'<span></span>'+
										'<div class="powertour-inner">'+
										'<div class="powertour-content">No content found, check your settings!</div>'+
										'<footer class="powertour-footer"></footer>'+
										'</div>'+
										'</div>';
							
						/**
						* Create the single step of the tour.
						**/	
						theHook
						.append(tourTemp)
						.children('[data-tour-step="'+i+'"]')
						.css({width: sWidht})
						.find('.powertour-content')
						.html($(value.content))
						.children()
						.css({width: sWidht - 30})
						.show();
						
						/**
						* Set the main variable.
						**/	
						var step = $('[data-tour-id="'+mainId+'"][data-tour-step="'+i+'"]');
							
						/**
						* Append the prev/stop/next buttons to the footer.
						* If the tour type is 'showAll' remove the footer and dont use the buttons.
						**/	
						if(o_tourType != 'tooltip'){

							/**
							* Allow only buttons with text.
							**/
							if(value.prevLabel && o_tourType != 'showAll' && i != 0){
								var pBtn =  '<a href="javascript:void(0);" class="powertour-btn-prev ybtn follow-btn">'+value.prevLabel+'</a>';
							}else{
								var pBtn = '';
							}
							if(value.nextLabel && o_tourType != 'showAll' && totalSteps != (i+1)){
								var nBtn = '<a href="javascript:void(0);" class="powertour-btn-next ybtn follow-btn">'+value.nextLabel+'</a>';	
							}else{
								var nBtn = '';
							}
							if(value.stopLabel){
								var sBtn = '<a href="javascript:void(0);" class="powertour-btn-stop">'+value.stopLabel+'</a>';	
								// var sBtn = '<a href="javascript:void(0);"><span>'+value.stopLabel+'</span></a>';	
							}else{
								var sBtn = '';
							}
							
							/**
							* Set the buttons order.
							**/
							var formatButtons = o_stepButtonOrder
												.replace(/%prev%/g, pBtn)
												.replace(/%next%/g, nBtn)
												.replace(/%stop%/g, sBtn);

							/**
							* Add the buttons to the footer, if present.
							**/
							if($.trim(formatButtons)){
								step.find('.powertour-footer').append('<div>'+formatButtons+'</div>');	
							}else{
								step.find('.powertour-footer').remove();	
							}
						
						}else{
							
							/**
							* The type 'all' doesn't need a footer, so lets remove it.
							**/
							step.find('.powertour-footer').remove();	
						}
						
						/**
						* Getting width and height from the hook and step.
						**/	
						var hookWidth  = theHook.outerWidth();
						var hookHeight = theHook.outerHeight();	
						var stepWidth  = step.outerWidth();
						var stepHeight = step.outerHeight();
						
						/**
						* Remove the arrow, let the step float(if the option is set to false). 
						* Add the right arrow class.
						**/	
						if(value.showArrow != true || $.inArray(value.arrowPosition, screenPos) != -1){
							step.children('span').remove();	
							var newArrowSize = 0;	
						}else{
							step.children('span').addClass('powertour-arrow-'+value.arrowPosition);
							    newArrowSize = arrowSize;							
						}
							
						/**
						* Setting the offset top.
						**/	
						if(value.offsetY){
							var offsetY = value.offsetY;
						}else{
							    offsetY = 0;
						}
										
						/**
						* Setting the offset left.
						**/	
						if(value.offsetX){
							var offsetX = value.offsetX;
						}else{
							    offsetX = 0;
						}
												
						/**
						* Settings per arrow position.
						**/	
						switch(value.arrowPosition){
							// top left
							case 'tl':
								step.css({left: offsetX , top: -stepHeight - newArrowSize - offsetY});					
							break;
							// top middle
							case 'tm':
								step.css({left: px50p, marginLeft: -((stepWidth/2) - offsetX), top: -stepHeight - newArrowSize - offsetY});					
							break;
							// top right
							case 'tr':
								step.css({right: offsetX , top: -stepHeight - newArrowSize - offsetY});					
							break;
	
							// right top
							case 'rt':
								step.css({left: (hookWidth + offsetX + newArrowSize), top: offsetY});
							break;
							// right middle
							case 'rm':
								step.css({left: (hookWidth + offsetX + newArrowSize), top: px50p, marginTop: -((stepHeight/2) - offsetY)});						
							break;						
							// right bottom
							case 'rb':
								step.css({left: (hookWidth + offsetX + newArrowSize), bottom: offsetY});						
							break;
							
							// bottom left
							case 'bl':
								step.css({left: offsetX , bottom: -stepHeight - newArrowSize - offsetY});					
							break;
							// bottom middle
							case 'bm':
								step.css({left: px50p, marginLeft: -((stepWidth/2) - offsetX), bottom: -stepHeight - newArrowSize - offsetY});					
							break;
							// bottom right
							case 'br':
								step.css({right: offsetX , bottom: -stepHeight - newArrowSize - offsetY});					
							break;
	
							// left top
							case 'lt':
								step.css({right: (hookWidth + offsetX + newArrowSize), top: offsetY});
							break;
							// left middle
							case 'lm':
								step.css({right: (hookWidth + offsetX + newArrowSize), top: px50p, marginTop: -((stepHeight/2) - offsetY)});						
							break;						
							// left bottom
							case 'lb':
								step.css({right: (hookWidth + offsetX + newArrowSize), bottom: offsetY});						
							break;

							// screen center
							case 'sc':
								step.css({left: px50p, top: px50p, marginLeft: -((sWidht/2) - offsetX), marginTop: -((stepHeight/2) - offsetY), position: 'fixed'});						
							break;						
									
							// screen top left
							case 'stl':
								step.css({left: (px20 - offsetX), top: (px20 - offsetY), position: 'fixed'});						
							break;
							// screen top middle
							case 'stm':
								step.css({left: px50p, marginLeft: -((sWidht/2) - offsetX), top: (px20 - offsetY), position: 'fixed'});						
							break;							
							// screen top right
							case 'str':
								step.css({right: (px20 - offsetX), top: (px20 - offsetY), position: 'fixed'});						
							break;
							// screen right mid
							case 'srm':
								step.css({right: (px20 - offsetX), top: px50p, marginTop: -((stepHeight/2) - offsetY), position: 'fixed'});						
							break;							
							// screen bottom right
							case 'sbr':
								step.css({right: (px20 - offsetX), bottom: (px20 - offsetY), position: 'fixed'});						
							break;
							// screen top middle
							case 'sbm':
								step.css({left: px50p, bottom: (px20 - offsetY), marginLeft: -((sWidht/2) - offsetX), position: 'fixed'});						
							break;
							// screen bottom left
							case 'sbl':
								step.css({left: (px20 - offsetX), bottom: (px20 - offsetY), position: 'fixed'});						
							break;																
							// screen left mid
							case 'slm':
								step.css({left: (px20 - offsetX), top: px50p, marginTop: -((stepHeight/2) - offsetY), position: 'fixed'});						
							break;								

							// right top
							default:
								step.css({right: (hookWidth + offsetX + newArrowSize), top: offsetY});
							break;																																				
						};
						
						/**
						* Clone the step.
						**/	
						if(value.cloneTo && $.inArray(value.arrowPosition, screenPos) == -1){							
							$(value.cloneTo)
							.addClass('powertour-hook-relative')
							.append( $('[data-tour-id="'+mainId+'"][data-tour-step="'+i+'"]').clone() )
							.children('[data-tour-id="'+mainId+'"][data-tour-step="'+i+'"]')
							.attr('data-tour-step-clone', i)	
						}
						
						/**
						* Add a tooltip class.
						**/	
						if(o_tourType == 'tooltip'){
							theHook.addClass('powertour-tooltip');
						}
						
					});

				//*****************************************************************//
				/////////////////////// SHOW AUTO CONTROLS //////////////////////////
				//*****************************************************************//

					if(o_tourType == 'auto'){
						if(o_showTimeControls === true){
	
							/**
							* Set the buttons order.
							**/
							var formatButtons = o_timeButtonOrder
												.replace(/%prev%/g, '<a href="#" id="powertour-time-prev"></a>')
												.replace(/%stop%/g, '<a href="#" id="powertour-time-stop"></a>')
												.replace(/%pause%/g,'<a href="#" id="powertour-time-pause"></a>')
												.replace(/%play%/g, '<a href="#" id="powertour-time-play"></a>')
												.replace(/%next%/g, '<a href="#" id="powertour-time-next"></a>');
															
							/**
							* Append the time controls.
							**/	
							$('body').append('<div id="powertour-time-ctrls">'+formatButtons+'</div>');
						}

						/**
						* Add a time placeholder to the body.
						**/	
						if(o_showTimer === true){					
							 $('body').append('<div id="powertour-time-timer">'+o_timerLabel+'<b>'+o_step[0].time+'</b></div>');
						}
					}

				//*****************************************************************//
				/////////////////////// PAUSE TIMER FUNCTION ////////////////////////
				//*****************************************************************//
				
					/**
					* Used as an savety check, once the tour runs it will 
					* add a indicator class to the body, or removed it.
					*
					* @param: active | boolean | Add/remove class, which tells if 
					                             the tour runs or stops.
					**/
					function tourActive(active){
						if(active === true){
							$('body').addClass('powertour-runs');
						}else{
							$('body').removeClass('powertour-runs');
						}
					}
					
				//*****************************************************************//
				////////////////////// HIGHTLIGHT TOUR FUNCTION /////////////////////
				//*****************************************************************//
				
					/**	
					* Append the overlay to the body. 
					**/	
					$('body').append('<div id="powertour-overlay"></div>');
					
					/**	
					* Highlight tour function. 
					* 
					* @param: i   | integer | Number of the step.
					* @param: end | boolean | Ends the tour(remove overlay).
					**/	
					function highlightTour(i, end){
						
						/**
						* Set the main variable(s).
						**/	
						var value = o_step[i];
						var set   = value.highlight;
						var elm   = value.highlightElements;
						
						if(set === true && end != true){
							
							/**	
							* Reset all zindex classes.
							**/							
							$('.powertour-hook-zindex').removeClass('powertour-hook-zindex');
							
							/**	
							* Set zindex class.
							**/	
							if($.inArray(value.arrowPosition, screenPos) == -1){
								$('[data-tour-id="'+mainId+'"][data-tour-step="'+i+'"]').parent().addClass('powertour-hook-zindex');
							}
							
							/**	
							* Set zindex class for extra elemnets.
							**/	
							if($.trim(elm) && $(elm).length){
								$(elm).addClass('powertour-hook-zindex powertour-hook-relative');
							}
						
							/**	 
							* Show overlay.
							**/	
							$('#powertour-overlay').fadeTo(o_effectSpeed, o_overlayOpacity);

						}
						if(end === true || set === false){
							
							/**	
							* Hide the overlay.
							**/	
							$('#powertour-overlay').fadeOut(o_effectSpeed);	
							
							/**	
							* Reset all zindex classes.
							**/							
							$('.powertour-hook-zindex').removeClass('powertour-hook-zindex');					
							
						}
					}
					
				//*****************************************************************//
				//////////////////// SCROLL TO TARGET FUNCTION //////////////////////
				//*****************************************************************//
				
					/**
					* Scroll to the target(hook or step) or reset and 
					* go back to the top. Notice that if the hook is bigger
					* than the window it will use the step as center.
					*
					* @param: i   | integer | The number of the step.
					* @param: end | boolean | Go to the top at the end of the tour.
					**/	
					function scrollToTarget(i, end){
						
						if(o_animated == true){

							/**
							* Set the main variable(s).
							**/	
							var value  = o_step[i];
							var hook   = $(value.hookTo);
							var center = value.center;
							var ap     = value.arrowPosition
							
							/**
							* Check and set the type of center.
							**/	
							if($.inArray(ap, screenPos) == -1){							
								var step = hook.find('[data-tour-id="'+mainId+'"][data-tour-step="'+i+'"]')
								if(center == 'step' || hook.outerHeight() >= $(window).height()){ 
								    // notice the show(), this is because position does not work on hidden elements
									var centerTo = step.show().offset().top - ($(window).height()/2) + (step.outerHeight()/2);
								}else{
										centerTo = hook.offset().top - ($(window).height()/2) + (hook.outerHeight()/2); 
										
								}
								/**
								* Animate me baby....
								**/	
								$('html, body').animate({scrollTop:centerTo}, o_travelSpeed, o_easingEffect);
							}
							
							/**
							* At the end we go to the top.
							**/	
							if(end === true){
								$('html, body').animate({scrollTop:0}, o_travelSpeed, o_easingEffect);
							}
						}
					}	
					
				//*****************************************************************//
				////////////////////////// CONVERT TIME /////////////////////////////
				//*****************************************************************//
				
					/**
					* Convert the time 
					*
					* @param: t | time | The time value.
					**/	
					function convertTime(t){
						
						/**
						* Prevent an empty time value.
						**/	
						if($.trim(t)){
							
							/**
							* Check for the right time format and convert time 
							* in to millieseconds.
							**/	
							if(t.indexOf(':') == -1){
								alert('Please use the right time format (mm:ss)')
							}
							var nTime    = t.split(":").reverse();
							    endTime  = parseInt(((nTime[0]) * 1000 ) + (nTime[1] * 60000));
						}else{
							    endTime = 60000;
						}
						
						return endTime;
					}
					
				//*****************************************************************//
				///////////////////////////// TIMER /////////////////////////////////
				//*****************************************************************//
				
					/**
					* Simple countdown function used for the 'auto' type.
					* The interval will reset if a new step will run.
					*
					* @param: t     | integer | Time until end.
					* @param: place | boolean | Put the time in the right place.
					**/	
					function countdownTimer(t, place){
					   
						/**	
						* Converting to milliseconds. 
						**/						   
					    convertTime(t);
						
						function timer(){
														
							//day = calc(t,216000000,24);
							//hours = calc(t,3600000,60);
							mins = calc(endTime,60000,60);
							secs = calc(endTime,1000,60);
							
							/**
							* Always display 2 numbers.
							**/	
							function calc(secs, num1, num2) {
								var s = ((Math.floor(secs/num1))%num2).toString();
								if (s.length < 2){
									var s = "0" + s;
								}
								return s;
							}	
														
							/**
							* Show the timer.
							**/
							$('#powertour-time-timer b').html(mins+':'+secs);
							
						}
						window.cInter = setInterval(function(){
							if(endTime != 0){
								endTime -= 1000;
								timer();
							}
						},1000);
					}
					
				//*****************************************************************//

				/////////////////////// PAUSE TIMER FUNCTION ////////////////////////
				//*****************************************************************//
				
					/**
					* Pause or play timer.
					* Reset the timer.
					*
					* @param: pause | boolean | Pause button.
					* @param: rst   | boolean | Play button.
					**/
					function pauseTimer(pause, rst){
						if(pause === true){
							$('body').addClass('powertour-pause');
							var secsLeft = $('#powertour-time-timer b').text();	
							$('#powertour-time-timer b').replaceWith('<span>'+secsLeft+'</span>');
						}else{
							$('body').removeClass('powertour-pause');
							var secsLeft = $('#powertour-time-timer span').text();	
							$('#powertour-time-timer span').replaceWith('<b>'+secsLeft+'</b>');	
						}
						if(rst === true){
							$('#powertour-time-timer span').replaceWith('<b>'+o_step[0].time+'</b>');	
						}
					}
				
				//*****************************************************************//
				//////////////////// CUSTOM CLASS HOOK FUNCTION /////////////////////
				//*****************************************************************//

					/**
					* Add a custom class to the hook.
					*
					* @param: i | integer | Index.
					**/
					function customClassHook(i){

						/**
						* Set the main variable(s).
						**/	
						var value     = o_step[i];
						var hook      = value.hookTo;
						var cloneTo   = value.cloneTo;
						var classHook = value.customClassHook;
						var ap        = value.arrowPosition;
	
						/**	
						* Remove all custom classes. 
						**/
						$.each(o_step,function(i,value){
							var customClass = value.customClassHook;
							if($.trim(customClass)){
								$('.'+customClass).removeClass(customClass);	
							}
						});
	
						/**	
						* Add the custom class to the hook. 
						**/
						if($.trim(classHook) && $.inArray(ap, screenPos) == -1 && $.trim(hook)){
							$(hook).addClass(classHook);
						}
						
						/**	
						* Add the custom class to the cloned hook(id). 
						**/
						if($.trim(classHook) && $.trim(cloneTo) && $.inArray(ap, screenPos) == -1){
							$(cloneTo).addClass(classHook);
						}
					}

				//*****************************************************************//
				////////////////////////// EXITURL FUNCTION /////////////////////////
				//*****************************************************************//

					/**	
					* This function runs after the last step if there 
					* is an exit url present
					**/
					function exitUrl(){
						if($.trim(o_exitUrl).length > 1){
							if (o_exitUrl.indexOf("?") != -1) {
								top.location.href = o_exitUrl+'&tour=true';		
							}else{
								top.location.href = o_exitUrl+'?tour=true';	
							}
						}
					}
												
				//*****************************************************************//
				///////////////////////// END TOUR FUNCTION /////////////////////////
				//*****************************************************************//

					/**	
					* This function runs when a tour gets canceled, stop button gets pressed
					* or on tour completion.
					**/
					function endTour(){
								
						if(o_tourType == 'auto'){	
							
							/**	
							* Reset all timeouts. 
							**/	
							clearTimeout(tid);
															
							/**	
							* Hide the time controls + timer. 
							**/	
							$('#powertour-time-ctrls, #powertour-time-timer').hide();
	
							/**	
							* Reset timeouts. 
							**/	
							cur = 0;
							
						}
						
						/**	
						* Hide all steps. 
						**/	
						$('[data-tour-id="'+mainId+'"]').fadeOut(o_effectSpeed);
													
						/**	
						* Custom class hook function.
						**/	
						customClassHook(0);
					
						/**	
						* Scroll to target function. 
						**/	
						scrollToTarget(0, true);
					
						/**	
						* Focus on tour function. 
						**/		
						highlightTour(0, true);

					}
				
				//*****************************************************************//
				///////////////////////// AUTO TOUR FUNCTION ////////////////////////
				//*****************************************************************//
				
					/**
					* The type 'auto' function.
					**/							
					function autoTour(){
												
						/**	
						* if:   reset and go back to the beginning.
						* else: run the auto type code.
						**/	
						if (cur >= o_step.length){
							
							/**	
							* Exit url function.
							**/	
							exitUrl();

							/**	
							* End tour function.
							**/	
							endTour();

							/**	
							* Run the callback function.
							**/	
							if(typeof o_onFinish == 'function'){
								o_onFinish.call(this);
							}	
							
						}else{

							/**
							* Set the main variable(s).
							**/	
							var value = o_step[cur];
							var step  = $('[data-tour-id="'+mainId+'"][data-tour-step="'+cur+'"]');						
						
							/**	
							* Show time controls + timer. 
							**/	
							$('#powertour-time-ctrls, #powertour-time-timer').fadeIn(o_effectSpeed);

							/**
							* Scroll to target function. 
							**/	
							scrollToTarget(cur, false);
							
							/**	
							* Converting to milliseconds. 
							**/	
							convertTime(value.time);
							
							/**	
							* Focus on tour function. 
							**/		
							highlightTour(cur, false);
							
							/**
							* Show countdown time.
							* Reset the countdown timer.
							**/	
							if(o_showTimer === true){
								clearInterval(window.cInter);
								countdownTimer(value.time);
							}
							
							/**
							* Remove all open steps.
							**/	
							$('[data-tour-id="'+mainId+'"]').not(step).fadeOut(o_effectSpeed);
							
							/**
							* Show the active step.
							**/	
							step.fadeIn(o_effectSpeed);
														
							/**	
							* Run the callback function.
							**/	
							if(typeof value.onShowStep == 'function'){
						    	value.onShowStep.call(this, step);
							}

							/**	
							* Custom class hook function.
							**/	
                            customClassHook(cur);

							cur++;

							/**	
							* Loop with the delays.
							**/	
							tid = setTimeout(autoTour, endTime);

						}
					}
					
				//*****************************************************************//
				////////////////////// GO TO STEP FUNCTION //////////////////////////
				//*****************************************************************//

					/**
					* Tour type 'step' next function.
					*
					* @param: i | integer | Index.
					**/
					function goToStep(i){

						/**
						* Set the main variable(s).
						**/	
						var value = o_step[i];
	
						/**
						* Scroll to target function.
						**/	
						scrollToTarget(i, false);
												
						/**	
						* Focus on tour function. 
						**/		
						highlightTour(i, false);

						/**	
						* Custom class hook function.
						**/	
						customClassHook(i);

						/**
						* Hide all open steps.
						**/	
						$('[data-tour-id="'+mainId+'"]:not([data-tour-step="'+i+'"])').fadeOut(o_effectSpeed)
						
						/**
						* Show the next step.
						**/	
						$('[data-tour-id="'+mainId+'"][data-tour-step="'+i+'"]').fadeIn(o_effectSpeed);
						
						/**	
						* Run the callback function.
						**/	
						if(typeof value.onShowStep == 'function'){
							value.onShowStep.call(this, i);
						}
							
					}

				//*****************************************************************//
				///////////////////////// GET URL PARAMETER /////////////////////////
				//*****************************************************************//
				
					/**
					* Used to start a tour but only if a paramet is present,
					* this way a tour wont start just upon page load.
					**/	
					var param = decodeURIComponent((location.search.match(RegExp("[?|&]tour=(.+?)(&|$)"))||[,null])[1]); 
				
				//*****************************************************************//
				/////////////////////////// START THE TOUR //////////////////////////
				//*****************************************************************//

					/**
					* Start the tour with a click.
					**/	
					obj.on(clickEvent, this, function(e){
						
						/**	
						* Tour active function. 
						**/
						tourActive(true);
							
						/**	
						* Run the callback function.
						**/	
						if(typeof o_onStart == 'function'){
							o_onStart.call(this);
						}
							
						/**
						* If the option type is set to "auto" it will
						* loop on it self, once done it will close.
						**/	
						if(o_tourType == 'auto'){
							
							/**
							* The auto tour function.
							**/	
							autoTour();
									
						}else if(o_tourType == 'showAll'){

							/**	
							* Show all steps at once if the type is set to 'all'.
							**/	
							$('[data-tour-id="'+mainId+'"]').fadeIn(o_effectSpeed);	
							
						}else if(o_tourType == 'step'){
							
							/**	
							* Go to step function.
							**/					
							goToStep(0);
								
						}
						
						e.preventDefault();
					});

					/**	
					* Run on load or if parameter is present.
					**/	
					if(o_runOnLoad=== true || param == 'true'){
						setTimeout(function(){
							
							/**	
							* Tour active function. 
							**/
							tourActive(true);
								
							/**	
							* Run the callback function.
							**/	
							if(typeof o_onStart == 'function'){
								o_onStart.call(this);
							}
								
							/**
							* If the option type is set to "auto" it will
							* loop on it self, once done it will close.
							**/	
							if(o_tourType == 'auto'){
								
								/**
								* The auto tour function.
								**/	
								autoTour();
										
							}else if(o_tourType == 'showAll'){
	
								/**	
								* Show all steps at once if the type is set to 'all'.
								**/	
								$('[data-tour-id="'+mainId+'"]').fadeIn(o_effectSpeed);	
								
							}else if(o_tourType == 'step'){
								
								/**	
								* Go to step function.
								**/					
								goToStep(0);
									
							}
						},o_runOnLoadDelay);
					}
					
				//*****************************************************************//
				/////////////////////////// TYPE TOOLTIP ////////////////////////////
				//*****************************************************************//
				
					if(o_tourType == 'tooltip'){
						
						/**	
						* Fade in and out.
						**/					
						$('.powertour-tooltip').hover(function(){					
	
							/**
							* Get the number of the open step.
							**/	
							var i = $(this).children('[data-tour-id="'+mainId+'"]').data('tour-step');
							
							/**
							* Show the tooltip.
							**/	
							$(this).children('[data-tour-id="'+mainId+'"]').stop(true, true).fadeIn(o_effectSpeed);
							
							/**
							* Show the tooltip clone.
							**/	
							$('[data-tour-id="'+mainId+'"][data-tour-step-clone="'+i+'"]').stop(true, true).fadeIn(o_effectSpeed);	
								
						},function(){
							$('[data-tour-id="'+mainId+'"]').stop(true, true).fadeOut(o_effectSpeed);
						});
												
					}
						
				//*****************************************************************//
				///////////////////////// PREV/NEXT BUTTONS /////////////////////////
				//*****************************************************************//

					/**	
					* Run prev/next.
					**/
					$('body').on(clickEvent, '.powertour-btn-prev, .powertour-btn-next', function(e){
						
						/**
						* Get the number of the open step.
						**/	
						var thisStep = $(this).parents('[data-tour-id="'+mainId+'"]').data('tour-step');		
						

						if(o_tourType == 'step'){
							
							/**
							* Prev button.
							**/	
							if($(e.currentTarget).hasClass('powertour-btn-prev')){
								
								/**	
								* Go to step function.
								**/	
								goToStep(thisStep -1);	
							}
							
							/**
							* Prev button.
							**/	
							if($(e.currentTarget).hasClass('powertour-btn-next')){
								
								/**	
								* Go to step function.
								**/	
								goToStep(thisStep +1);	
								
							}
							
						}else if(o_tourType == 'auto'){
							
							/**
							* Prev button.
							**/	
							if($(e.target).parents().hasClass('powertour-btn-prev') && cur > 1){
								
								/**	
								* Ste the prev step. 
								**/	
								cur = cur - 2;
								
								/**	
								* Reset all timeouts. 
								**/	
								clearTimeout(tid);	
								
								/**
								* The auto tour function.
								**/	
								autoTour();
							}
							
							/**
							* Next button.
							**/	
							if($(e.target).parents().hasClass('powertour-btn-next')){
								
								/**	
								* Reset all timeouts. 
								**/	
								clearTimeout(tid);	
								
								/**
								* The auto tour function.
								**/	
								autoTour();
							}

						}

						e.preventDefault();	
						
					});	

				//*****************************************************************//
				////////////////////// TIME CONTROL BUTTONS /////////////////////////
				//*****************************************************************//
				
					$('body').on(clickEvent, '#powertour-time-stop, #powertour-time-next, #powertour-time-prev, #powertour-time-play, #powertour-time-pause', function(e){
						
						/**	
						* Stop button.
						**/
						if($(e.target).is($('#powertour-time-stop'))){
							
							/**	
							* Tour active function. 
							**/
							tourActive(false);
						
							/**	
							* End tour function.
							**/	
							endTour();
	
	                        if(o_tourType == 'auto'){
								
								/**	
								* Pause timer function. 
								**/	
								pauseTimer(false, true);
							}
										
							/**	
							* Run the callback function.
							**/	
							if(typeof o_onStop == 'function'){
								o_onStop.call(this);
		
							}
							
						}
						
						/**	
						* Next button.
						**/
						if($(e.target).is($('#powertour-time-next')) && $('.powertour-pause').length < 1){
							
							if(o_tourType == 'auto'){
								
								/**	
								* Reset all timeouts. 
								**/	
								clearTimeout(tid);	
								
								/**
								* The auto tour function.
								**/	
								autoTour();
								
							}
						}
							
						/**	
						* Prev button.
						**/
						if($(e.target).is($('#powertour-time-prev')) && $('.powertour-pause').length < 1){

							if(cur > 1 && o_tourType == 'auto'){
								
								/**	
								* Ste the prev step. 
								**/	
								cur = cur - 2;
								
								/**	
								* Reset all timeouts. 
								**/	
								clearTimeout(tid);	
								
								/**
								* The auto tour function.
								**/	
								autoTour();
							}
						
						}
						
						/**	
						* Pause button.
						**/
						if($(e.target).is($('#powertour-time-pause')) && $('.powertour-pause').length < 1){
							
							/**	
							* Pause timer function. 
							**/	
							pauseTimer(true, false);
							
							/**	
							* Reset all timeouts. 
							**/	
							clearTimeout(tid);
							
						}
						
						/**	
						* Play button.
						**/
						if($(e.target).is($('#powertour-time-play')) && $('.powertour-pause').length){
							
							/**	
							* Get the remaining time. 
							**/	
							var secsLeft = $('#powertour-time-timer span').text();	
							
							/**	
							* Pause timer function. 
							**/	
							pauseTimer(false, false);
	
							/**	
							* Convert to milliseconds function. 
							**/	
							convertTime(secsLeft)
														
							/**	
							* Start the loop again.
							**/	
							tid = setTimeout(autoTour, endTime);

						}
						
						e.preventDefault();
					});


				//*****************************************************************//
				/////////////////////////// EASY CANCEL /////////////////////////////
				//*****************************************************************//
					
					/**	
					* Cancel the type 'step' if a user clicks outside the 
					* step or hook, but only with the type 'step'.
					**/
					if(o_easyCancel === true){
						$(document).on(clickEvent, this, function(e){
							if($('.powertour-runs').length &&
							   !$(e.target).is($(' *', '[data-tour-id="'+mainId+'"]')) && 
							   !$(e.target).is($(' *', obj)) && 
							   !$(e.target).is($(obj)) &&
							   !$(e.target).is($('#powertour-time-timer, #powertour-time-timer *')) &&
							   !$(e.target).is($('#powertour-time-ctrls, #powertour-time-ctrls *')) &&    
							   !$(e.target).is($('.powertour-hook-relative, .powertour-hook-relative *'))){

							   /**	
							   * Tour active function. 
							   **/
							   tourActive(false);

							   /**	
							   * End tour function.
							   **/	
							   endTour();
									
							   if(o_tourType == 'auto'){

									/**	
									* Pause timer function. 
									**/	
									pauseTimer(false, true);
						
								}
								
								/**	
								* Run the callback function.
								**/	
								if(typeof o_onCancel == 'function'){
									o_onCancel.call(this);
								}
																										
							}
						});
					}
					
				//*****************************************************************//
				//////////////////////// TYPE STEP END BUTTON ///////////////////////
				//*****************************************************************//
				
					$('body').on(clickEvent, '.powertour-btn-stop',function(e){

						/**	
						* Tour active function. 
						**/
						tourActive(false);

						/**	
						* End tour function.
						**/	
						endTour();
						
						/**	
						* Run on the last step. 
						**/
						var curStep = $(this).parents('.powertour').data('tour-step');
						if((curStep +1) == totalSteps){

							/**	
							* Run the callback function.
							**/	
							if(typeof o_onFinish == 'function'){
								o_onFinish.call(this);
							}	
							
							/**	
							* Exit url function.
							**/	
							exitUrl();
							
						}else{
							
							/**	
							* Run the callback function.
							**/	
							if(typeof o_onStop == 'function'){
								o_onStop.call(this);
							}
							
						}
																						
						e.preventDefault();
					});
					
				//*****************************************************************//
				//////////////////////// KEYBOARD NAVIGATION ////////////////////////
				//*****************************************************************//
				
					/**	
					* ESC key needs to be keyup. 
					**/
					if(o_keyboardNavigation === true){
						$(document).keyup(function(e){

							/**	
							* ESC key.
							**/								
							if(e.keyCode == 27 && $('.powertour-runs').length){

								/**	
								* Tour active function. 
								**/
								tourActive(false);
								
								/**	
								* End tour function.
								**/	
								endTour();

								/**	
								* Pause timer function. 
								**/	
								pauseTimer(true, true);
									
								/**	
								* Run the callback function.
								**/	
								if(typeof o_onCancel == 'function'){
									o_onCancel.call(this);
								}
								
							}
						});
						
						/**	
						* Space key needs to be keydown. 
						**/
                        $(document).keydown(function(e){

							/**
							* Get the number of the open step(used for step type).
							**/	
							var thisStep = $('body').find('[data-tour-id="'+mainId+'"]:visible').data('tour-step');	
							
							/**	
							* Space key.
							**/	
							if(e.keyCode == 32 && $('.powertour-runs').length && o_tourType == 'auto'){ 
								e.preventDefault();
								
								/**	
								* Use the space key as play and pause function. 
								**/	
								if($('.powertour-pause').length){ 
								
									/**	
									* Get the remaining time. 
									**/	
									var secsLeft = $('#powertour-time-timer span').text();	
									
									/**	
									* Pause timer function. 
									**/	
									pauseTimer(false, false);
			
									/**	
									* Convert to milliseconds function. 
									**/	
									convertTime(secsLeft)
																
									/**	
									* Start the loop again.
									**/	
									tid = setTimeout(autoTour, endTime);
							
								}else{
									
									/**	
									* Pause timer function. 
									**/	
									pauseTimer(true, false);
									
									/**	
									* Reset all timeouts. 
									**/	
									clearTimeout(tid);
										
								}						
						    }

							/**	
							* Arrow left key.
							**/								
							if(e.keyCode == 37 && $('.powertour-pause').length < 1 && $('.powertour-runs').length){

								if(o_tourType == 'auto' &&  cur > 1){
									
									/**	
									* Ste the prev step. 
									**/	
									cur = cur - 2;
									
									/**	
									* Reset all timeouts. 
									**/	
									clearTimeout(tid);	
									
									/**
									* The auto tour function.
									**/	
									autoTour();	
									
								}
								
								if(o_tourType == 'step' && thisStep > 0){
								
									var i = thisStep - 1; 
									 
									/**	
									* Go to step function.
									**/					
									goToStep(i);
								
								}
							}

							/**	
							* Arrow right key.
							**/								
							if(e.keyCode == 39 && $('.powertour-pause').length < 1 && $('.powertour-runs').length){
								
								if(o_tourType == 'auto'){
									
									/**	
									* Reset all timeouts. 
									**/	
									clearTimeout(tid);	
									
									/**
									* The auto tour function.
									**/	
									autoTour();
									
								}
								
								if(o_tourType == 'step' && (thisStep + 1) < totalSteps){	

									var i = thisStep + 1; 
									
									/**	
									* Go to step function.
									**/					
									goToStep(i);	
									
								}
							}				
						});
					}	
								
			});		
		};
		
		/**
		* Default settings(dont change).
		* You can globally override these options
		* by using $.fn.pluginName.key = 'value';
		**/
		$.fn.powerTour.options = {
			tourType: 'step',
			overlayOpacity: 0.5,
			showTimeControls: true,
			showTimer: true,
			timeButtonOrder: '%prev% %stop% %pause% %play% %next%',
			stepButtonOrder: '%prev% %next% %stop%',
			timerLabel: 'Next step in: ',			                    
			effectSpeed: 200,
			travelSpeed: 400,
			easingEffect: 'linear',
			easyCancel: true,
			animated: true,
			keyboardNavigation: true,
			runOnLoad: false,
			runOnLoadDelay: 2000,
			exitUrl: '',
			onStart: function(){},
			onFinish: function(){},
			onStop: function(){},	
			onCancel: function(){},
			step:[
				{
					hookTo: '',
					content: '',
					cloneTo: '',
					width: 350,
					arrowPosition: 'rt',
					showArrow: true,
					offsetY: 0,
					offsetX: 0,
					prevLabel: 'Назад',
					nextLabel: 'Далее',
					stopLabel: 'закончить тур',
					center: 'hook',
					customClassStep: "powertour-style-black",
					customClassHook: '',
					highlight: true,
					highlightElements: '',
					time: '01:00',
					onShowStep: function(){}
				}
			]
		};




		var Tour = APP.SiteTour;


		Tour.start = function(){

			var stepmap = {};

			function step(i){
				// APP.Stat.safecall("pushPage", "/tour/" + (typeof i === 'string' ? i : ("step_" + i)) + ".html");
				if(stepmap[i]) return;
				stepmap[i] = true;
				APP.Stat.safecall("pushPage", "/tour/" +  ("step_" + i) + ".html");
			}


			function restoreSidebar(){
				$("#sidebar-top-link").makeActive(true);
			}


			function end( how ){
				$("#menu").css({"position": "fixed", "zIndex" : "1111"});
		    	$.fn.smartPopover.disabled = false;
		    	$.cookie("siteTour", 0);
		    	$.unblockBody();
		    	restoreSidebar();
		    	document.onclick = undefined;
		    	step( how );
		    	// window.location.reload();
			}

			var timer = setInterval(function(){
				if($("[class*=item-]").length){
					clearInterval(timer);
					$("#sitetour-start").powerTour({
					    tourType:"step",
					    overlayOpacity:0.6,
					    showTimeControls:false,
					    showTimer:false,
					    timeButtonOrder:"%prev% %stop% %pause% %play% %next%",
					    stepButtonOrder:"%stop% %prev% %next%",
					    effectSpeed:200,
					    travelSpeed:200,
					    easyCancel:false,
					    animated:true,
					    keyboardNavigation:true,
					    runOnLoad:false,
					    runOnDelay:2000,
					    onStart:function(){
					    	$(window).scrollTop(0);
					    	$.fn.smartPopover.disabled = true;
					    	$.blockBody();
					    	$("#menu").css({"position": "absolute", "zIndex" : "auto"});
					    	document.onclick =  function(e){
					    		(e = e || window.event) && e.preventDefault();
					    		return false;
					    	}
					    },
					    onStop: function(){
					    	end("exit");
					    },
					    onFinish: function(){
					    	end("complete");

					    },
					    onCancel : function(){
					    	end("exit");
					    },
					    step:[


					    	{
						        hookTo:"#logo",
						        content:"#sitetour-logo",
						        width:350,
						        arrowPosition:"bl",
						        showArrow: true,
						        highlight:true,
						        highlightElements: '#logo',
						        // customClassStep: "powertour-style-black",
						        prevLabel: 'Назад',
								nextLabel: 'Далее',
								stopLabel: 'закончить тур',
								center: 'hook',
						        onShowStep:function(i){
						        	step(i+1);
						        }
					        },



					        {
						        hookTo:"#sidebar-profile-header",
						        content:"#sitetour-profileheader",
						        width:350,
						        arrowPosition:"rt",
						        showArrow: true,
						        offsetY:0,
						        prevLabel:"Назад",
						        nextLabel:"Далее",
						        stopLabel:"закончить тур",
						        offsetX:0,
						        center: "hook",
						        highlight:true,
						        highlightElements: ".widgetMenu",
						        // customClassStep: "powertour-style-black",
						        onShowStep:function(i){
						        	var b = $("#sidebar-profile-header");
						        	b.css("overflow", "initial");
						        	step(i+1);
						        	// $("#vk_groups").parent().parent().css("zIndex", 9999);
						        }
					        },



					        {
						        hookTo:"#sidebar-feed-link",
						        content:"#sitetour-subscr",
						        width:350,
						        arrowPosition:"rt",
						        showArrow: true,
						        highlight:true,
						        highlightElements: '.widgetMenu',
						        // customClassStep: "powertour-style-black",
						        prevLabel: 'Назад',
								nextLabel: 'Далее',
								stopLabel: 'закончить тур',
								center: 'hook',
						        onShowStep:function(i){
						        	step(i+1);
						        	$("#sidebar-feed-link").makeActive( true );
						        }
					        },


					        {
						        hookTo:"#sidebar-recommend-link",
						        content:"#sitetour-rcmnd",
						        width:350,
						        arrowPosition:"rt",
						        showArrow: true,
						        highlight:true,
						        highlightElements: '.widgetMenu',
						        // customClassStep: "powertour-style-black",
						        prevLabel: 'Назад',
								nextLabel: 'Далее',
								stopLabel: 'закончить тур',
								center: 'hook',
						        onShowStep:function(i){
						        	step(i+1);
						        	$("#sidebar-recommend-link").makeActive( true );
						        }
					        },


					        {
						        hookTo:"#sidebar-friends-link",
						        content:"#sitetour-friends",
						        width:350,
						        arrowPosition:"rt",
						        showArrow: true,
						        highlight:true,
						        highlightElements: '.widgetMenu',
						        // customClassStep: "powertour-style-black",
						        prevLabel: 'Назад',
								nextLabel: 'Далее',
								stopLabel: 'закончить тур',
								center: 'hook',
						        onShowStep:function(i){
						        	step(i+1);
						        	$("#sidebar-friends-link").makeActive( true );
						        	$(".item__controls:first").css("background", "white");
						        }
					        },


					        {
						        hookTo:"#uploadbutton",
						        content:"#sitetour-uploadbutton",
						        width:350,
						        arrowPosition:"bl",
						        showArrow: true,
						        highlight:true,
						        highlightElements: '#uploadbutton',
						        // customClassStep: "powertour-style-black",
						        prevLabel: 'Назад',
								nextLabel: 'Далее',
								stopLabel: 'закончить тур',
								center: 'hook',
						        onShowStep:function(i){
						        	step(i+1);
						        }
					        },


					        {
						        hookTo:".item__controls:first",
						        content:"#sitetour-share",
						        width:350,
						        arrowPosition:"tm",
						        showArrow: true,
						        highlight:true,
						        highlightElements: '.b-grid-item__info:first',
						        customClassStep: "powertour-slide-last",
						        prevLabel: 'Назад',
								nextLabel: 'Далее',
								stopLabel: 'спасибо, я все понял!',
								center: 'hook',
						        onShowStep:function(i){
						        	step("complete");
						        	// var b = $(".powertour .powertour-btn-stop").css("float", "right").addClass("powertour-thanks");
						        	restoreSidebar();
						        }},



					    ]
					}).trigger("click");
				}
			}, 333);

// alert(1)

		}


		
})(jQuery, window, document, this.APP);
