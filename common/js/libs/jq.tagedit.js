/*
* Tagedit - jQuery Plugin
* Examples and documentation at: tagedit.webwork-albrecht.de
* Copyright (c) 2010 Oliver Albrecht info@webwork-albrecht.de
*
* edited by E. Korzun
*
*  options:
*
*  autocompleteURL: '', // url for a autocompletion
*  deleteEmptyItems: true, // Deletes items with empty value
*  deletedPostfix: '-d', // will be put to the Items that are marked as delete
*  addedPostfix: '-a', // will be put to the Items that are choosem from the database
*  additionalListClass: '', // put a classname here if the wrapper ul shoud receive a special class
*  allowEdit: true, // Switch on/off edit entries
*  allowDelete: true, // Switch on/off deletion of entries. Will be ignored if allowEdit = false
*  allowAdd: true, // switch on/off the creation of new entries
*  direction: 'ltr' // Sets the writing direction for Outputs and Inputs
*  animSpeed: 500 // Sets the animation speed for effects
*  autocompleteOptions: {}, // Setting Options for the jquery UI Autocomplete (http://jqueryui.com/demos/autocomplete/)
*  breakKeyCodes: [ 13, 44 ], // Sets the characters to break on to parse the tags (defaults: return, comma)
*  checkNewEntriesCaseSensitive: false, // If there is a new Entry, it is checked against the autocompletion list. This Flag controlls if the check is (in-)casesensitive
*  texts: { // some texts
*      removeLinkTitle: 'Remove from list.',
*      saveEditLinkTitle: 'Save changes.',
*      deleteLinkTitle: 'Delete this tag from database.',
*      deleteConfirmation: 'Are you sure to delete this entry?',
*      deletedElementTitle: 'This Element will be deleted.',
*      breakEditLinkTitle: 'Cancel'
*  }
*/

(function($) {

	$.fn.tagedit = function(options) {

		options = $.extend(true, {
			// default options here
			tabFrom: null,
			autocompleteURL: null,
			deletedPostfix: '-d',
			addedPostfix: '-a',
			additionalListClass: '',
			allowEdit: false,
			allowDelete: false,
			allowAdd: true,
			direction: 'ltr',
			animSpeed: 50,
			mindLength : 0,
			autocompleteOptions: {
				minLength : 0,

				select: function( event, ui ) {
					// /console.log( ui )
					var $input = $(this);
					/\d+/.test(ui.item.id) && $input.attr("data-id", ui.item.id);
					$input.val(ui.item.label).trigger('transformToTag', [ui.item.value]);
					return false;
				},
				focus: function( event, ui ) {
					$(this).val(ui.item.label).next().text(ui.item.label);
				}
			},
			breakKeyCodes: [ 13, 44, 32 ],
            checkNewEntriesCaseSensitive: false,
			texts: {
				removeLinkTitle: 'Удалить',
				saveEditLinkTitle: 'Сохранить',
				deleteLinkTitle: 'Удалить тег',
				deleteConfirmation: 'Точно удалить?',
				deletedElementTitle: 'Тег будет удален',
				breakEditLinkTitle: 'Отмена'
			}
		}, options || {});

		// no action if there are no elements
		if(this.length == 0) {
			return;
		}



		// tabindex
		if( options.tabFrom ) {
			$(options.tabFrom)
				.keydown(function(e) {
					var keyCode = e.keyCode || e.which;
					if(keyCode == 9) {
						e.preventDefault();
						$(this).parents('li').next()
							.find('#tagedit-input')
							.removeAttr('disabled')
							.removeClass('tagedit-input-disabled')
							.focus();
						return false;
					}
				});
		}

		// set the autocompleteOptions source
		if(options.autocompleteURL) {
			options.autocompleteOptions.source = options.autocompleteURL;
		}

		// Set the direction of the inputs
		var direction= this.attr('dir');
		if(direction && direction.length > 0) {
			options.direction = this.attr('dir');
		}

		var elements = this;

		var baseNameRegexp = new RegExp("^(.*)\\[([0-9]*?("+options.deletedPostfix+"|"+options.addedPostfix+")?)?\]$", "i");

		var baseName = elements.eq(0).attr('name').match(baseNameRegexp);
		if(baseName && baseName.length == 4) {
			baseName = baseName[1];
		}
		else {
			// Elementname does not match the expected format, exit
			alert('elementname dows not match the expected format (regexp: '+baseNameRegexp+')')
			return;
		}



		elements
			.parents("form")
			.on("submit", function(e){
				// alert($(this).find("li.tagedit-listelement").length);
				if( options.minLength 
					&& $(this).find("li.tagedit-listelement-old").length < options.minLength) {
						options.onMinLengthError && options.onMinLengthError();
						e.preventDefault();
						return false;
				}
			});


		// init elements
		inputsToList();

		/**
		* Creates the tageditinput from a list of textinputs
		*
		*/
		function inputsToList() {
			var html = '<ul class="tagedit-list '+options.additionalListClass+'">';

			// Инициализация тегов при загрузке страницы
			elements.each(function() {
				var element_name = $(this).attr('name').match(baseNameRegexp);
				if(element_name && element_name.length == 4 && (options.deleteEmptyItems == false || $(this).val().length > 0)) {
					if(element_name[1].length > 0) {
						var elementId = typeof element_name[2] != 'undefined'? element_name[2]: '';

						html += '<li class="tagedit-listelement tagedit-listelement-old">';
						html += '<span dir="'+options.direction+'">' + $(this).val() + '</span>';
						html += '<input type="hidden" name="'+baseName+'['+elementId+']" value="'+$(this).val()+'"  data-id="'+$(this).data('id')+'" />';
						html += '<a class="tagedit-close" title="'+options.texts.removeLinkTitle+'">&times;</a>';
						html += '</li>';
					}
				}
			});

			// replace Elements with the list and save the list in the local variable elements
			elements.last().after(html);
			var tabIndex = elements.attr('tabindex');
			var newList = elements.last().next();
			elements.remove();
			elements = newList;

			// Check if some of the elementshav to be marked as deleted
			if(options.deletedPostfix.length > 0) {
				elements.find('input[name$="'+options.deletedPostfix+'\]"]').each(function() {
					markAsDeleted($(this).parent());
				});
			}

			// put an input field at the End
			// Put an empty element at the end
			html = '<li class="tagedit-listelement tagedit-listelement-new">';
			html += '<input tabindex="'+tabIndex+'" type="text" name="'+baseName+'[]" value="" id="tagedit-input" disabled="disabled" class="tagedit-input-disabled" dir="'+options.direction+'"/><label for="tagedit-input">'+(options.placeholder || "введите тег для поиска")+'</label>';
			html += '</li>';
			html += '</ul>';



			function disableChecker( input ){
				if(options.disableOn) {
					if(options.disableOn()){
						$(input).autocomplete("disable").autocomplete( "close" );
						options.onDisabled && options.onDisabled(input);
						return true;
					} else {
						$(input).autocomplete("enable");
						return false;
					}
				}
			}

			elements

				.append(html)
				// Set function on the input
				.find('#tagedit-input')
					.each(function() {
						$(this).applyPlugin("autoGrowInput", {comfortZone: 15, minWidth: 15, maxWidth: 20000});

						// Event ist triggert in case of choosing an item from the autocomplete, or finish the input
						$(this).bind('transformToTag', function(event, id, img) {

							id = id || $(this).data('id');

							if( options.idsOnly && !/\d+/.test(id) ) {
								return false;
							}

							// alert( "Id is " + id )

							if(options.onAdd && options.onAdd($(this).val(), id, $(this)) === false){
								$(this).val("");
								return false;
							}

							var oldValue = (typeof id != 'undefined' && id.length > 0);

							var checkAutocomplete = oldValue == true? false : true;
							// check if the Value ist new
							var isNewResult = isNew($(this).val(), checkAutocomplete);

							//alert(isNewResult)

							if(isNewResult[0] === true || (isNewResult[0] === false && Number(isNewResult[1]) > 0)) {

								if(oldValue == false && typeof isNewResult[1] == 'string') {
									oldValue = true;
									id = isNewResult[1];
								}


								// Подстановка нового тега при вводе в инпуте
								if(options.allowAdd === true || oldValue) {

									// Make a new tag in front the input
									html = '<li class="tagedit-listelement tagedit-listelement-old">';
									html += '<span dir="'+options.direction+'">'
										+ $.trim( $(this).val() )
										+ '</span>';
									//html += '<span dir="'+options.direction+'">' + $(this).val() + '</span>';
									var name = oldValue? baseName + '['+id+options.addedPostfix+']' : baseName + '[]';
									html += '<input type="hidden" name="'+name+'" value="'+$.trim( $(this).val() )+'" data-id="'+(id ? id : '')+'" />';
									html += '<a class="tagedit-close" title="'+options.texts.removeLinkTitle+'">&times;</a>';
									html += '</li>';

									$(this).parent().before(html);
								}
							}

							$(this).val('');

							// close autocomplete
							if(options.autocompleteOptions.source) {
								$(this).autocomplete( "close" );
							}

							disableChecker(this);

						})


						// Вставка метки тега при клике на облако тегов
						.bind('forceTransformToTag', function(event, id, silent) {

							silent = silent || $(this).data("_silent");
							id = id || $(this).data('id');

							if( options.idsOnly && !/\d+/.test(id) ) {
								return false;
							}

							var html = '<li class="tagedit-listelement tagedit-listelement-old">';
							html += '<span dir="'+options.direction+'">'
								+ $.trim( $(this).val() )
								+ '</span>';
							html += '<input type="hidden" name="tags[]" value="'+$.trim( $(this).val() )+'" data-id="'+(id ? id : '')+'" />';
							html += '<a class="tagedit-close" title="'+options.texts.removeLinkTitle+'">&times;</a>';
							html += '</li>';

							$(this).parent().before(html);

							!silent && options.onAdd && options.onAdd($(this).val(), id, $(this));

							$(this).val('');
							$(this).data("_silent", false);
							var t = $(this).autocomplete( "close" );

							// firefox fix
							setTimeout(function(){
								t.autocomplete( "close" );
							}, 111);
						})

						.on("removeTag", function(event, id){
							$(this).parents("ul").find("li.tagedit-listelement:has([data-id="+id+"])").remove();
						})





						.keydown(function(event) {
							var code = event.keyCode > 0? event.keyCode : event.which;

							switch(code) {
								case 8: // BACKSPACE
									var elementToRemove = elements.find('li.tagedit-listelement-old').last();
									if($(this).val().length == 0) {

										if( $(this).data('confirm-delete') ) {
											// delete Last Tag
											elementToRemove.fadeOut(options.animSpeed, function() {elementToRemove.remove();});
											$(this).data('confirm-delete', false);
											var input = elementToRemove.find("input");

											options.onRemove && options.onRemove(input.val(), input.data("id"));
										} else {
											$(this).data('confirm-delete', true);
											var elementToRemove = elements.find('li.tagedit-listelement-old').last();
											elementToRemove.addClass("to-remove");
										}
										event.preventDefault();
										return false;
									} else {
										elementToRemove.removeClass("to-remove");
										$(this).data('confirm-delete', false);
									}
									break;
								case 9: // TAB
									if($(this).val().length > 0 && $('ul.ui-autocomplete #ui-active-menuitem').length == 0) {
										$(this).trigger('transformToTag');
										event.preventDefault();
										return false;
									}
								break;
								default:
									elements.find('li.tagedit-listelement-old').last().removeClass("to-remove");
									$(this).data('confirm-delete', false);

								break;
							}
							return true;
						})
						.keypress(function(event) {
							
							disableChecker(this);

							var code = event.keyCode > 0? event.keyCode : event.which;
							if($.inArray(code, options.breakKeyCodes) > -1) {
								if($(this).val().length > 0 && $('ul.ui-autocomplete #ui-active-menuitem').length == 0) {
									$(this).trigger('transformToTag');
								} else {
									options.submitCallback && options.submitCallback($(this));
								}
								event.preventDefault();
								return false;
							}
							return true;
						})
						.bind('paste', function(e){
							var that = $(this);
							if (e.type == 'paste'){
								setTimeout(function(){
									that.trigger('transformToTag');
								}, 1);
							}
						})
						.blur(function() {

							disableChecker(this);

							if($(this).val().length == 0) {
								// disable the field to prevent sending with the form
								$(this).attr('disabled', 'disabled').addClass('tagedit-input-disabled').parent().find('label').addClass('show');
							}
							else {
								// Delete entry after a timeout
								var input = $(this);
								$(this).data('blurtimer', window.setTimeout(function() {
									input.val('').addClass('tagedit-input-disabled').parent().find('label').addClass('show');
								}, 200));
							}
						})
						.focus(function() {

							if(disableChecker(this))
								return false;

							window.clearTimeout($(this).data('blurtimer'));

							if(options.openOnFocus) {
								$(this).trigger('keydown.autocomplete')
									.autocomplete('search', $(this).val());
							}
						});

						if(options.autocompleteOptions.source != false) {
							$(this)
								.autocomplete(options.autocompleteOptions)
								.data( "ui-autocomplete" )
								._renderItem = options.autocompleteOptions.render || function (ul, item) {
					                var li = $("<li></li>").data("item.autocomplete", item);
					                li.html([
					                    "<a class='row-fluid title'>",
											item.label,
											item.weight ?
											"<div class='remark _small'>" + item.weight + " " + plural(item.weight, "шутка,шутки,шуток") + "</div>" : '',
										"</a>"
					                ].join(""));
					                return li.appendTo(ul);
					            }
						}
					})
				.end()
				.click(function(event) {
					switch(event.target.tagName) {
						case 'A':
							$(event.target).parent().fadeOut(options.animSpeed, function() {
								var input = $(event.target).parent().find("input");
								options.onRemove && options.onRemove(input.val(), input.data("id"));
								$(event.target).parent().remove();
							});
							break;
						case 'INPUT':
						case 'SPAN':
						case 'LI':
							if($(event.target).hasClass('tagedit-listelement-deleted') == false &&
							$(event.target).parent('li').hasClass('tagedit-listelement-deleted') == false) {
								// Don't edit an deleted Items
								//return doEdit(event);
							}
						default:
							$(this).find('#tagedit-input')
								.removeAttr('disabled')
								.removeClass('tagedit-input-disabled')
								.focus();
					}
					return false;
				})
		}

		/**
		* Sets all Actions and events for editing an Existing Tag.
		*
		* @param event {object} The original Event that was given
		* return {boolean}
		*/
		function doEdit(event) {
			if(options.allowEdit == false) {
				// Do nothing
				return;
			}

			var element = event.target.tagName == 'SPAN'? $(event.target).parent() : $(event.target);

			var closeTimer = null;

			// Event that is fired if the User finishes the edit of a tag
			element.bind('finishEdit', function(event, doReset) {
				window.clearTimeout(closeTimer);

				var textfield = $(this).find(':text');
				var isNewResult = isNew(textfield.val(), true);
				if(textfield.val().length > 0 && (typeof doReset == 'undefined' || doReset === false) && (isNewResult[0] == true)) {
					// This is a new Value and we do not want to do a reset. Set the new value
					$(this).find(':hidden').val(textfield.val());
					$(this).find('span').html(textfield.val());
				}

				textfield.remove();
				$(this).find('a.tagedit-save, a.tagedit-break, a.tagedit-delete, tester').remove(); // Workaround. This normaly has to be done by autogrow Plugin
				$(this).removeClass('tagedit-listelement-edit').unbind('finishEdit');
				return false;
			});

			var hidden = element.find(':hidden');
			html = '<input type="text" name="tmpinput" autocomplete="off" value="'+hidden.val()+'" class="tagedit-edit-input" dir="'+options.direction+'"/>';
			//html += '<a class="tagedit-save" title="'+options.texts.saveEditLinkTitle+'">o</a>';
			//html += '<a class="tagedit-break" title="'+options.texts.breakEditLinkTitle+'">x</a>';

			// If the Element is one from the Database, it can be deleted
			if(options.allowDelete == true && element.find(':hidden').length > 0 &&
			typeof element.find(':hidden').attr('name').match(baseNameRegexp)[3] != 'undefined') {
				html += '<a class="tagedit-delete" title="'+options.texts.deleteLinkTitle+'">d</a>';
			}

			hidden.after(html);
			element
				.addClass('tagedit-listelement-edit')
				.find('a.tagedit-save')
					.click(function() {
						$(this).parent().trigger('finishEdit');
						return false;
					})
				.end()
				.find('a.tagedit-break')
					.click(function() {
						$(this).parent().trigger('finishEdit', [true]);
						return false;
					})
				.end()
				.find('a.tagedit-delete')
					.click(function() {
                        window.clearTimeout(closeTimer);
						if(confirm(options.texts.deleteConfirmation)) {
							markAsDeleted($(this).parent());
						}
                        else {
                            $(this).parent().find(':text').trigger('finishEdit', [true]);
                        }
						return false;
					})
				.end()
				.find(':text')
					.focus()
					.applyPlugin("autoGrowInput", {comfortZone: 10, minWidth: 15, maxWidth: 20000})
					.keypress(function(event) {
						switch(event.keyCode) {
							case 13: // RETURN
								event.preventDefault();
								$(this).parent().trigger('finishEdit');
								return false;
							case 27: // ESC
								event.preventDefault();
								$(this).parent().trigger('finishEdit', [true]);
								return false;
						}
						return true;
					})
					.blur(function() {
						var that = $(this);
						closeTimer = window.setTimeout(function() {that.parent().trigger('finishEdit', [true])}, 500);
					});
		}

		/**
		* Marks a single Tag as deleted.
		*
		* @param element {object}
		*/
		function markAsDeleted(element) {
			element
				.trigger('finishEdit', [true])
				.addClass('tagedit-listelement-deleted')
				.attr('title', options.deletedElementTitle);
				element.find(':hidden').each(function() {
					var nameEndRegexp = new RegExp('('+options.addedPostfix+'|'+options.deletedPostfix+')?\]');
					var name = $(this).attr('name').replace(nameEndRegexp, options.deletedPostfix+']');
					$(this).attr('name', name);
				});

		}

		/**
		* Checks if a tag is already choosen.
		*
		* @param value {string}
		* @param checkAutocomplete {boolean} optional Check also the autocomplet values
		* @returns {Array} First item is a boolean, telling if the item should be put to the list, second is optional the ID from autocomplete list
		*/
		function isNew(value, checkAutocomplete) {
            checkAutocomplete = typeof checkAutocomplete == 'undefined'? false : checkAutocomplete;
			var autoCompleteId = null;

            var compareValue = options.checkNewEntriesCaseSensitive == true? value : value.toLowerCase();

			var isNew = true;
			elements.find('li.tagedit-listelement-old input:hidden').each(function() {
                var elementValue = options.checkNewEntriesCaseSensitive == true? $(this).val() : $(this).val().toLowerCase();
				if(elementValue == compareValue) {
					isNew = false;
				}
			});

			if (isNew == true && checkAutocomplete == true && options.autocompleteOptions.source != false) {
				var result = [];
				if ($.isArray(options.autocompleteOptions.source)) {
					result = options.autocompleteOptions.source;
				}
                else if ($.isFunction(options.autocompleteOptions.source)) {

					options.autocompleteOptions.source({
						term: value
					}, function (data) {result = data});
				}


                else if (typeof options.autocompleteOptions.source === "string") {

					// Check also autocomplete values
					var autocompleteURL = options.autocompleteOptions.source;
					// if (autocompleteURL.match(/\?/)) {
						// autocompleteURL += '&';
					// } else {
						// autocompleteURL += '?';
					// }
					autocompleteURL += '?term=' + value;

					// autocompleteURL += value;

					$.ajax({
						async: false,
						url: autocompleteURL,
						dataType: 'json',
						complete: function (XMLHttpRequest, textStatus) {
							result = $.parseJSON(XMLHttpRequest.responseText);
						}
					});
				}

				// If there is an entry for that already in the autocomplete, don't use it (Check could be case sensitive or not)
				for (var i = 0; i < result.length; i++) {
                    var label = result[i].label.toLowerCase();
                    	//options.checkNewEntriesCaseSensitive == true
                    	//? result[i].label : result[i].label.toLowerCase();
					if (label == compareValue) {
						isNew = false;
						autoCompleteId = result[i].id;
						break;
					}
				}
			}

			return new Array(isNew, autoCompleteId);
		}
	}
})(jQuery);
