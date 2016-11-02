/**
* app.js
* The main app object, contains app config and struct
*
* @author E. Korzun
*/

var IE = window.IE = eval("/*@cc_on!@*/0");

window.GRID_TYPE_SMALL = 1;
window.GRID_TYPE_BIG = 2;
window.GRID_TYPE = window.use_big_grid ? GRID_TYPE_BIG : GRID_TYPE_SMALL;
;
(function($, doc, win, Backbone) {


	$.doc = $(doc), $.body = $(doc.body), $.win = $(win);;
	!IE || $.body.addClass('IE');

	var

		// Content type
		Types = {
			"Video" : 2,
			"Photo" : 1,
			"Text" :  3
		},


		// Errors description
		Errors = {

			'AUTH_WRONG_USER' : 301,
			'AUTH_WRONG_PASS' : 302

		},

		// Router controller
		Router = Backbone.Router.extend({}),


		// Define Module class as BB model
		Module = Backbone.Model.extend({

			'cache' : {},

			'defaults' : {

				// Module init state
				'inited' : false,

				// Module's name
				'name' : "",

				// Active state. The active module handles global window / document
				// events, such clicks, keyboarads etc.
				'active' : false,

				//
				'shortcuts' : {},

				///
				'router' : null

			},


			'setWindowDefaults' : function(){
				var key = "__APP_" + this.get("name") + "_defaults";
				window[key] && this.set(window[key]);
			},

			'setActive' : function(){
				var module = APP.active(),
					name = module && module.get("name");
				app.set("prevModule", name);
				this.collection.setActive( this.get("name") );
				app.set("activeModule", this.get("name"));
			},

			'takeControl' : function(){
				var module = APP.active(),
					name = module && module.get("name");
				app.set("prevModule", name);
				this.collection.setActive( this.get("name") );
				app.set("activeModule", this.get("name"));
			},


			'restoreControl' : function(){
				app.set("activeModule", app.get("prevModule"));
				this.collection.setActive(app.get("prevModule"));
			},


			'dropControl' : function(){
				app.set("activeModule", "");
			},


			'isActive' : function(){
				return this.get("active") === true;
			},


			'disActive' : function(){
				this.restoreControl();
				return this.set("active", false);
			},


			'active' : function( m ){
				this.takeControl();
				return this.set("active", m === true || m === undefined ? true : m );
			},


			'reset' : function(){
				var _this = this;
				_.each(this.attributes, function( val, name ){
					!/active|router|name|inited|cache/.test(name) && _this.unset( name );
				});
			},


			'safecall' : function( method, param, evt, context, btn ){

				// module is inited, all files loaded etc.
				if(this.get('inited')){
					if( this[method] && this[method].files ) {
						if( this[method]._inited ) {
							return this[method].call(context || this, param, evt, btn);
						} else {
							// loading all the files
							context && context.blockButton();
							app.load(this[method].files, this.get("name") + method, this[method], btn);
							// Push to stack
							this.queuecalls.push({
								method: method,
								param: param,
								evt: evt,
								context: context || this
							});
						}
					} else {
						return this[method].call(context || this, param, evt, btn);
					}
				}
				// Module needs to be inited
				else {

					// btn && !btn.attr('data-noblock') && btn.blockButton();
					var async = (btn && btn.attr('data-async') !== undefined) ? !!Number(btn.attr('data-async')) : true;

					// loading all the files
					app.load(this.get('files'), this.cid, undefined, undefined, async);

					if( async === false ) {
						this[method].call(context || this, param, evt, btn);
						// btn && btn.unblockButton();
					} else {
						// Push to stack
						this.queuecalls.push({
							method: method,
							param: param,
							evt: evt,
							context: context || this,
							btn : btn
						});
					}
				}

			},


			'callqueue' : function(){
				var fn, _this = this;
				setTimeout(function(){
					while(fn = _this.queuecalls.pop()) {
						_this[fn.method].call(fn.context || _this, fn.param, fn.evt);
						fn.btn && fn.btn.unblockButton();
					}
				}, 10);
			},


			'addRoute' : function( r ){
				var name = this.get("name");
				app.router.route(r.url, name + '_' + r.action, (function(name, action){
					return function( data ){
						//console.log( data )
						// alert([name, action])
						//app[name][action] && app[name][action].apply(app[name], arguments);
						app[name].safecall(action, data);
					}
				})(name, r.action));
			},


			'initialize' : function(){

				this.queuecalls = [];
				this.on("change:inited", this.callqueue, this);

				// Checkout defined routes for module
				var routes = this.get("routes");

				if( routes ) {
					var temp_rout = {'module': this, 'routes': routes}, name = this.get("name");

					_.each( routes, function( r ){

						app.router.route(r.url, name + '_' + r.action, (function(name, action){
							return function( data ){
								//console.log( data )
								// alert([name, action])
								//app[name][action] && app[name][action].apply(app[name], arguments);
								app[name].safecall(action, data, arguments);
							}
						})(name, r.action));

					});
				}

				app.add( this );
			}
		}),


		// Define modules list as BB collection
		ModulesList = Backbone.Collection.extend({

			// Set up the model class reference
			'model' : Module,

			// Simple cache object
			'modules' : {},

			// Set up some callbacks
			'initialize' : function(){
				// this.on("add", function(module){
					// this.cache[ module.name ] = module;
				// });
			},


			'setActive' : function( name ){
				this.each(function( module ){
					module.set("active", false);
				});
				var module = this.find(function( module ){
					return module.get("name") === name
				});

				if( module ) {
					module.set("active", true);
					app.set("prevModule", app.get("activeModule"));
					app.set("activeModule", module.get("name"));
				}
			},

			'getActive' : function(){
				return this.find(function( module ){
					return module.get("active") === true;
				});
			},


			'disActive' : function(name){
				var module = this.find(function( module ){
					return module.get("name") === name
				});
				module && module.set("active", false);
			}

		}),


		// Modules list
		modules = new ModulesList;


	// Main App object, creating as BB model
	var MainApp = Backbone.Model.extend({

		'modules' : modules,

		'globals' : {},

		'router' : new Router,

		'defaults' : {

			// Application title
			// Title is used in TITLE tag, description/sharing title
			'title' : "YouComedy.Me",

			'small_avatar' : '/common/img/profile/avatar_small.png',
			'big_avatar' : '/common/img/profile/avatar_big.png',

			'url' : 'http://youcomedy.me',

			// Application init state
			'inited' : true,

			// Name or ID of active module
			'activeModule' : null,
			// prev value
			'prevModule' : null,

			// Shortcuts and callbacks
			'shortcuts' : {}

		},


		/**
		 * Add new module
		 */
		'add' : function( obj ){
			this.modules.add((obj = obj.cid ? obj : new Module( obj )));
			this[obj.get("name")] = obj;
			return obj;
		},


		/**
		 * Getting module by name
		 */
		'getModuleByName' : function( name ) {
			return this.modules.find(function( module ){
				return module.get("name") === name
			});
		},


		'fn' : function( owner, action ){
			if( owner ) {
				return (this.getModuleByName( owner ) || {})[ action ];
			} else {
				if( window[action] ) {
					return window[action];
				} else {
					for( var k in this.modules.models ) {
						for( var j in this.modules.models[k] ) {
							if( j == action )
								return this.modules.models[k][j];
						}
					}
				}
			}
		},

		// YepNope alias
		//'load' : win.Modernizr.load,


		// Simple cache storage
		//'cache' : new Cache();


		'active': function( module_name ){
			if( !module_name ) {
				return this.modules.getActive();
			} else {
				this.modules.setActive( module_name );
			}
		},

		'disActive' : function( module_name ){
			return this.modules.disActive( module_name );
		},


		'exists' : function( module_name ){
			var m = this.getModuleByName( module_name );
			return m && m.get('inited');
		}

	});


	// Creating an MainAPP object
	var app = APP = window['YCM'] = window['APP'] = new MainApp;


	app.on('change:title', function(){
		$("title").text(app.get("title"));
	});


	// Simple storage objects & quick reffs
	app.Module = Module;
	app.Globals = app.globals = {};
	app.views = {};
	app.models = {};
	app.collections = {};
	app.url_root = window.location.pathname;


	app._load = {};

	// All external files
	app._files = {};




	function normalizeUrl(url){
		return url.replace(/.+((?:css|js|tpl)\/[\w\!\.\/\_]+)\??.*/i, "$1");
	}



	// dom must be ready
	$(function(){
		// filling up
		var files = $("script,link");
		_.each( files, function( file ){
			// todo correct parsing filename
			var file = $(file),
				name = file.attr('data-path') || file.attr('src') || file.attr('href') || '-';
			name = normalizeUrl(name);
			app._files[ name ] =  1;
		});

		app._filesready = true;
	});

	app.loadtimer = 0;


	// todo remove btn
	app.load = function( files, id, method, btn, async ){

		clearTimeout(app.loadtimer);

		if(!app._filesready){
			// if(DEBUG)alert("No files ready")
			app.loadtimer = setTimeout(function(){
				app.load(files, id, method, btn, async);
			},0);
			return false;
		}

		// if( app._load[id] || (method && method._inited)) {
		// 	//btn && btn.unblockButton();
		// 	return;
		// }

		(function(stack, files, cid, method, btn ){

			// return;

			var callback = function( file, normalized ){
				file = normalized ? file : normalizeUrl(file);
				stack.push( file );
				app._load[file] = app._files[file] = 1;
				// if( method ) {
					// method._inited = true;
					//btn && btn.unblockButton();
				// } else

				// console.warn(stack.length + " / " + files.length, stack, files)

				if( stack.length === files.length ){
					// if(DEBUG) alert(app.modules.getByCid( cid ).get("name") + " ready");
					var m = app.modules.get( cid );
					app.modules.get( cid ).trigger("ready");
					app.modules.get( cid ).set('inited', true);
					app.trigger(m.get("name") + ":ready");
					//btn && btn.unblockButton();
				}
			}

			_.each( files, function( file ){

				var chkfile = normalizeUrl(file);

				// file.replace(/[\d|\?]/g, "").replace("/common/", "");
				// alert([file, chkfile])
				// alert(chkfile)

				if( app._files[chkfile] || app._load[chkfile] ) {
					callback(chkfile, true);
					return;
				}


				// /path/to/file.html|js|cs?STATIC_VERSION
				var ext = (file.match(/\.(\w+)(?:\?\d+)?$/) || [])[1] || file.match(/T=(css|js|html)/)[1];

				//console.log( ext, file );

				switch( ext ) {
					case 'js':
						$.ajax({
							'url': file,
							'dataType' : 'script',
							'success': function(contents){
								callback( file );
							},
							'cache' : true,
							'async' : async !== undefined ? !!async : true
						});
					break;

					case 'css':
						$.ajax({
							url: file,
							dataType : 'text',
							success: function(contents){
								$("<style type='text/css'>" + contents + "</style>").appendTo(document.head);
								callback( file );
							}
						});
					break;

					case 'html':
						$.ajax({
							url: file,
							dataType : 'html',
							success: function( content ){
								$(document.body).append( content )
								callback( file );
							}
						});
					break;
				}
			});
		})((app._load[id] = []), files, id, method, btn);
	}


	app.issetFile = function(file){
		return !!(app._files[file] || app._load[file]);
	}

	app.defineFile = function(file){
		return (app._files[file] = app._load[file] = true);
	}






	///\/$/.test((app.url_root = window.location.href.replace(/[\#\?].*$/, "")))
		//? app.url_root : app.url_root + "/";

	window['APP']['ERR'] = Errors;
	window['APP']['Type'] = Types;


	var _history = app._history = [(app.url = window.location.href)];

	app.location = function(){
		return window.location.protocol + '//' + window.location.host
               + Backbone.history.options.root
	}


	app.go = function( url, disable_trigger ){
		if( _.last(_history) != url ) {
			app.url = url;
			_history.push( url );
			// app.router.navigate( url.charAt(0) == "/" ? url : APP.url_root + url, disable_trigger ? {
				// trigger : false
			// } : {});
			 app.router.navigate( url, disable_trigger === false ? {silent: true, trigger: false, replace : true} : {trigger: true, replace : true});
		}
	}

	app.goBack = function(){
		var len = _history.length;
		return app.go(_history[ len > 1 ? len - 2 : len - 1], true);
	}


	app.routes = [
		{url: "", owner: "", action: ""}
	];




	($.doc = $(document))

	// ------------------------------------------------------------------------------
	// bind Document with click event:
	// convert links to buttons
	// ------------------------------------------------------------------------------

	.on('click', '[role=button]', function( evt, owner ){
		// cache the object
		var link = $(this), fn,
			owner = (this.owner || (this.owner = link.data('owner'))),
			// data-action - fn name
			action = (this.action || (this.action = link.data('action'))),
			// data-param - param for fn fn(param)
			param = (this.param || (this.param = link.data('param')));

		if(param && _.isString(param) && param.charAt(0) == "{")
			param = $.exec(param);

		// Global module files not included
		if(owner && APP[owner] && !APP[owner].get('inited')){
			APP[owner]['safecall'](action, param, evt, this, link);
			evt.preventDefault();
			return false;
		}

		var fn = APP.fn( owner, action );

		// check the function and call it
		if(fn && $.isFunction( fn )) {
			// Local method files not included
			if( fn.files ) {
				APP[owner].safecall(action, param, evt, this, fn.files);
			}
			// don't need include anything
			else {
				//console.log('unsafe call');
				return fn.call( this, param, evt ) === true;
			}
		} else {
			return true;
		}

		// prevent default event action
		return false;
	});



	// ------------------------------------------------------------------------------
	// bind Document with keydown event:
	// Try to fire callback in active module


	window.keyboard || (window.keyboard = {});

	$.doc

	.on("keydown", function( evt ){
		var module = APP.active(),
			shortcut = keyboard.toString( evt );
		//console.log( shortcut )
		if( shortcut && !$(evt.target).is("textarea") && module && module.shortcuts &&  module.shortcuts[ shortcut ] ) {
			return module[module.shortcuts[ shortcut ]]( evt ) === true;
		}
	})


	.on("keydown", "[data-owner]", function( evt ){
		var target = $(evt.target);
		if( target.is("textarea") && keyboard.is(target.data('param') || "", evt)) {
			var fn = APP.fn(target.data('owner'), target.data('action'));
			fn && fn.call( this, null, evt );
			return false;
		}
	});


	// ------------------------------------------------------------------------------
	// bind Document with click event:
	// convert links to buttons

	$.doc

	.on( 'submit', 'form[data-owner]', ($.fn.ajaxSubmitCustom = function(evt, opts){



		opts = opts || {};

		evt.preventDefault();

		// cache the object
		var form = opts.form || (evt.currentTarget ? $(evt.currentTarget) : $(this)),
			// data-before - before submit fn name
			before = opts.before || form.data('before'),
			owner = form.data('owner'),
			//
			check = form.data('check'),
			// data-success - after submit fn name
			success = opts.success || form.data('success'),
			// data-noreset - no reset form after submit
			noreset = opts.noreset || form.data('noreset'),
			noblock =  form.data('noblock') || opts.noblock,
			prefix = opts.prefix,
			iframe = opts.iframe || !!form.data('iframe');


		// make sure that YCM[owner] exists
		//if( YCM[owner] ) {

			//if( !check || (check && YCM[owner][check]( form )) ) {
				// form ajax submit
				form.ajaxSubmit({

					iframe : iframe,

					// reset form after submit
					resetForm: !noreset,


					// before submit callback
					beforeSubmit: function( arr, form ){
						// remove tooltips
						$.hideTips();

						//btn.text( "..." );
						// before callback
						if( before ) {


							before = _.isFunction(before) ? before : (APP[before] || APP[owner][before]);

							if(before(arr, form) === false){
								return false;
							}
						}

						if(!noblock) {

							// disable form
							form.find('input').prop("disabled", true);
							form.find('textarea').prop("disabled", true);
							form.find('button').prop("disabled", true);
							form.find('button[type=submit]:visible').filter(':last').blockButton();

						}
					},

					complete: function( data ){


						// console.log( arguments );

						data = $.exec(data) || {};

						//console.log( arguments );
						!noblock && setTimeout(function(){
							form.find('input,textarea,button').prop('disabled', false)
								.filter('[data-old-text]').each(function(){
									$(this).html($(this).attr('data-old-text'));
								});
						}, 250);
					},

					// after submit callback
					success: function( data, status, xhr, form ){

						// Fill up form inputs with server response
						for( var k in data ) {
							if( prefix ) {
								form.find("input[name='"+prefix+'['+k+']'+"'],textarea[name="+prefix+'['+k+']'+"]").val( data[k] );
							} else {
								form.find("input[name='"+k+"'],textarea[name="+k+"]").val( data[k] );
							}
						}

						// after callback
						if( success ) {
							// @todo Обязательно унифицировать вызовы safecall
							// Привести их к единому параметру, + переделавать любое число аргументов
							if(_.isFunction( success )){
								success( data, status, xhr, form  )
							} else {
								if(APP[owner][success]) {
									APP[owner][success](data, status, xhr, form);
								} else {
									APP[owner].safecall(success, {
										data: data,
										status: status,
										xhr: xhr,
										form : form
									});
								}
							}
						}

					}
				});
			//}
		//}

		// block default browser submitting
		return false;
	}))

	.on( "change", "select[data-action]", function( evt ){

		// cache the object
		var link = $(this), fn,
			owner = (this.owner || (this.owner = link.data('owner'))),
			// data-action - fn name
			action = (this.action || (this.action = link.data('action')));

		var fn = APP.fn( owner, action );

		// check the function and call it
		if(fn && $.isFunction( fn )) {
			return fn.call( this, $(this).val(), evt ) === true;
		}

		// prevent default event action
		return false;

	})


	.on( "change", "input[data-action]", function( evt ){

		// cache the object
		var link = $(this), fn,
			owner = (this.owner || (this.owner = link.data('owner'))),
			// data-action - fn name
			action = (this.action || (this.action = link.data('action')));

		var fn = APP.fn( owner, action );

		// check the function and call it
		if(fn && $.isFunction( fn )) {
			return fn.call( this, link.data('param'), evt ) === true;
		}

		// prevent default event action
		return false;

	})


	// ------------------------------------------------------------------------------
	// bind Document with click event:
	// convert links to buttons

	.on( "focus", "input", function(){
		var el = $(this);
		setTimeout(function(){
			var tip = el.removeClass( 'error' ).data("tooltip");
			tip && tip.hide();
		}, 10);
	});
	//
	//
	// .on( "blur", "input", function(){
		// var i = $(this);
		// i.val(i.attr("placeholder"));
	// });


	var lastScrollCall = +new Date;
	var isTouch = Modernizr.touch;
	// 'ontouchstart' in win ||  'onmsgesturechange' in win || win.IS_MOBILE;
	// var mainContainer = isTouch ? $("#body") : ($.win = $(window));
	 var mainContainer = $("#body");


	$.mainContainer = mainContainer;

	var scrollHandler = function(){
		$.winScrollTop = mainContainer.scrollTop();
		var module = app.modules.getActive();
		var curTime = +new Date;
		if(module && module.Records
			&& (curTime - lastScrollCall) > 100
		) {
			lastScrollCall = curTime;
			module.trigger("scroll", $.winScrollTop);

			if(module.get("autoload")
				&& ($.winScrollTop + $.winHeight) > (mainContainer.children().height() - 3000)
			) {
				module.trigger("loadNext");
			}
		}
	}

	mainContainer.on('scroll', scrollHandler);

	if( isTouch ) {
		mainContainer.on("touchmove", scrollHandler);
	}

	mainContainer.on('resize', function(){
		$.winHeight = mainContainer.height();
		$.winWidth = mainContainer.width();
	}).trigger('resize');




	/**
	 * APP.displayErrors
	 *
	 */
	app.displayErrors = function( options ){

		var o = $.extend({


			// Data response object
			'data': null,

			// default classname for the fields
			'classname': null,
			'getEl' : function( el ) {return el},

			// auto, popup, alert, form, callback
			'display_mode' : 'auto',

			'display_each' : null,
			'display_all' : null,

			'text' : '',
			'form' : null,

			'getSel' : function( k, j ){
				return "input[name='"+k + '[' + j + ']' +"'],[data-input='"+k + '.' + j +"']"
			}

		}, options);

		//

		var data = o.data;

		// Returning false cause of no data recieved
		if( !data ) return true;

		// data.errors format
		// Usage: data.errors[Array || POST][ field name ]
		if( data.errors && !data.error ) {

			var selectors = [];	// jquery selectors
			var names = [];		// names as JS objects
			var txts = [];		// error texts
			var elems = [];
			var errs = data.errors;

			for( var k in errs ) {
				for( var j in errs[k] ) {
					selectors.push( o.getSel(k, j) );
					names.push( k + '.' + j );
					txts.push( errs[k][j] + "" );
				}
			}

			// display can be "auto"
			if( o.display_mode === "auto" ) {

				_.each( selectors, function( selector, index ){
					var el = o.getEl($( selector, o.form ));
					elems.push( el );
					o.classname && el.addClass( o.classname );
					o.display_each && o.display_each(el, txts[ index ]);
				});

				// If each error displaying is not defined
				// try to use all-errors-displaying callback
				!o.display_each && o.display_all && o.display_all( elems, txts, names );

			}

			// good
			return true;

		}

		if( data.error_text ) {

			 o.display_all && o.display_all( data.error_text || o.text, data.error || data.error_code );

			return true;
		}

		return false;
	}



	app.on("change", function(model, changes){
		// console.log(changes); return;
		(changes = model.changed) && _.each(changes, function( bool, prop ){
			var name = prop + 'Changed';
			app[name] && app[name](model, prop);
		});
	});


	app.countersChanged = function(app, prop){
		var counters = app.get(prop);
		_.each(counters, function(val, id){
			val = Number(val);
			var counter = $$("[data-count="+id+"]");

			// console.warn("!!!!!!", id, val , "!!!!!!");

			if( val > 20 ) {
				counter.text('20+').show();
			} else if (val) {
				counter.text(val).show();
			} else {
				counter.hide();
			}
		});
	}



	app.empty = function(){};


	/**
	 * Setupping default AJAX settings
	 */
	$.ajaxSetup({
		// default datatype is JSON
		dataType: 'json',
		// cache : false,
		// default error callback (403, 404, 500, parseError etc.)
		error: function(jqXHR, textStatus, errorThrown){
			//alert( "something wrong :'( \n\n403/404/500/parseError" );
			// console.info("AJAX ERROR", jqXHR, textStatus, errorThrown);
		}
	});


	window.EGG = {force:function(name){try{window.EGG[name]()}catch(e){$.getScript("/common/js/egg/"+name+".js",function(){setTimeout(function(){window.EGG[name]()},100)})}}}


	APP.Grot = new function(){
		var PREFIX = 'YCM__';

		this.get = function(key){
			var result;
			try {
				result = JSON.parse(localStorage.getItem(PREFIX + key));
			} catch(e){
				result = null;
			}

			return result;
		};

		this.set = function(key, val){
			if (key === undefined || val === undefined) return;
			localStorage.setItem(PREFIX + key, JSON.stringify(val));
		};

		this.clear = function(){
			var ls = localStorage;
			for (var key in ls){
				key.match(PREFIX) && ls.removeItem(key);
			}
		};
	};

	if (window.user_id) window.Requester = new function(){
		var uid = window.user_id;
		var lid = APP.Grot.get('notify_lid');
		var is_active = false;

		$(doc)
		.on('server.active', function(){
			is_active = true;
		})
		.on('server.passive', function(){
			is_active = false;
		})
		.on('server.tick', function(){
			if (is_active){
				$.get('/notifylid?u=' + uid, function(data){
					data = $.exec(data) || {};

					if(lid !== data.lid){
						APP.Grot.set('notify_lid', (lid = data.lid));
						getData();
					}
				});
			} else {
				var counters = APP.Grot.get('counters');
				if (counters){
					APP.set('counters', counters);

					if (counters.feed_count) {
						APP.Notify.safecall('faviconAlert');
					} else {
						APP.Notify.safecall('clearFaviconAlert');
					}
				}
			}
		});

		function getData(){
			$.get('/notify?u=' + uid, function(data){
				data = $.exec(data) || {};
				var has_badges = false;
				var counters;

				if (data.news) {
					$.each(data.news, function(i, o){
						if (o.action == 'badge_received'){

							// Беджи
							APP.NewBadges.safecall('showBadge', {
								id: o.object_id,
								title: o.title,
								description: o.description,
								reward: o.reward
							});

							has_badges = true;
						}
					});

					// Новостные уведомления
					!has_badges && APP.Notify.safecall("showAll", data.news);

					// Каунтеры
					counters = data['counters'];
					if (counters){
						APP.Grot.set('counters', counters);
						APP.set('counters', counters);

						if (document.hidden && !counters.feed_count) {
							APP.Notify.safecall('faviconAlert');
						} else {
							APP.Notify.safecall('clearFaviconAlert');
						}
					}
				}
			});
		}
	};

	$(function(){
		window.Server = new function(){
			var doc = document;
			var interval = 0;
			var period = 5000;
			var pid = parseInt(Math.random() * 1000000000);

			function checkServer(){
				var server = APP.Grot.get('server') || {};

				$(doc).trigger('server.tick');
				if (!server.pid || !server.time || server.time + period * 3 < +new Date) {
					setServer();
				}
			}

			function setServer(){
				$(doc).trigger('server.active');
				clearInterval(interval);
				APP.Grot.set('server', {pid: pid, time: +new Date});
				interval = setInterval(function(){
					APP.Grot.set('server', {pid: pid, time: +new Date});
					$(doc).trigger('server.tick');
				}, period);
			}

			if (doc.hidden){
				$(doc).trigger('server.passive');
				checkServer();
			} else {
				setServer();
			}

			$(doc).on('visibilitychange', function(){
				if (doc.hidden){
					$(doc).trigger('server.passive');
					clearInterval(interval);
					interval = setInterval(checkServer, period);
				} else {
					setServer();
				}
			});
		};
	});


	app._ajaxDataDetect = function( data, evt, req, opts ) {
		data = $.exec(data) || {};

		// Одноразовые скрипты, приколы, звуки и тды
		data.egg && window.EGG.force( data.egg );

		// Саммари новостей
		// data.summary && APP.Notify.safecall("summary", data.summary);

		// Редирект через аякс
		data.redirect && !app.has("ignoreAjaxRedirect") && (window.location.href = data.redirect);

		data.popover && app.trigger("insertPopover", data.popover);
		data.block && app.trigger("insertBlock", data.block);
	}



	$(document).ajaxComplete(function( evt, req, opts ){
		if(app.has("disableAjaxComplete")) return;
		if( opts.dataType == "json" ) {
			app._ajaxDataDetect( req.responseText || {}, evt, req, opts );
		}
	});




	$.win
		.on('blur', function(){
			APP.set("focus", false);
		})
		.on('focus', function(){
			APP.set("focus", true);
		})
		.trigger('focus')
		.on('load', function(){
			app.router.route("*path", "app_global_route", function( url ){
				app.Stat.safecall( "pushPage", url );
			});
		});


	var tplcache = {};
	APP.Template = function( txt, data ){

		if(tplcache[txt])
			return tplcache[txt]( data );

		var tpl_content;
		if((txt = txt || "").charAt(0) === "#") {
			tpl_content = $$(txt).html();
		} else {
			tpl_content = txt;
		}

		var tplFN = _.template(tpl_content);
		tplcache[txt] = tplFN;
		return tplFN( data );
	}


	//
	// WORKAROUND
	//
	//



	app.on("insertPopover", function(opts){
		!$.isIphone() && app.Notify.safecall("insertPopover", opts);
	});


	app.on("insertBlock", function(opts){
		!$.isIphone() && app.Notify.safecall("insertBlock", opts);
	});


	// ХАк Для Вайна
	// var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
	$.win.on("message", function( evt ){
		var data = evt.originalEvent.data;
		// console.warn(arguments);
		if( data && "string" === typeof data ) {
			data = data.split("::");
			if( data[0] === "loaded" ) {
				$("iframe").filter("[src='" + data[1] + "']").trigger("ready");
			}
		}
	});



	var store = window.store,
	cache = {
		get : function(k){
			if(store.disabled) return undefined;
			return store.get(k);
		},
		set : function(k, v){
			if(store.disabled) return v;
			return store.set(k, v);
		}};

	win.cache = cache;


})(jQuery, document, this, Backbone );
