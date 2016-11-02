+function(argument) {



	// Подумать как избавиться от ajaxwait
	// или вынести в глобальные триггеры 

	var TESTS_MAP = {
		"comments" : "comments.js"
	};


	
	// 
	// 
	// 
	// 	
	var Tester = window.APP.Tester;


	// 
	// 
	// 
	// 	
	Tester.dummy = function(){};


	// 
	// 
	// 
	var frameindex = -1;	
	Tester.createIframe = function(url, id){
		frameindex++;
		var ifrm = $(document.createElement("iframe"));
		ifrm
			// .attr("src", location.protocol + "//" + location.host +  url + "?test=" + id + "&r" + Math.random())
			.attr("src",  url + "?test=" + id + "&r" + Math.random())
			.attr("name", id + frameindex)
			.css("visibility", "hidden")
			.css("position", "absolute")
			.css("top", "-10000px")
			.attr("sandbox", "allow-same-origin allow-scripts")
			.appendTo(document.body);
		return ifrm[0];
		// return 
	}


	// 
	// 
	// 	
	Tester.on("ready", function(){
		// console.clear();
		// alert("Click ok to start test");
	});



	// 
	// 
	// 	
	Tester.on("finish", function(){
		Tester.createReport();
	});


	// APP.set("disableAjaxComplete", true);
	

	var report = {};
	var rep_index = 0;



	Tester.pushGroup = function( test ){
		report.push({
			id  : test.id,
			name : test.get("name")
		})
	}
	

	var Test = Tester.TestModel = Backbone.Model.extend({
		
		stack : [],
		ajaxstack : {},
		cur : -1,
		report : [],
		ajaxRules: [],
		calls : 0,

		initialize : function( opts ){
			this.rep_index = ++rep_index;
			report[this.rep_index] = {
				calls : [],
				results : [],
				name : this.get("name")
			}
		},

		registerScope : function(url, test_id) {

			if( url === window ) {
				var self = this;
				self.scope = window;
				self.APP = APP;
				window.__testid = self.get("uniq");
				self.scope.parent = window;

				$(self.scope.document).ajaxComplete(function( evt, req, opts ){
					_.each(self.ajaxRules, function(o){
						if(o.r.test(opts.url)){
							self.scope.setTimeout(function(){
								self.next();
								self.ajaxRules = _.without(self.ajaxRules, o);
							}, 33);
							return false;
						}
					});
				});

				$.getScript( "/common/js/__V2/~tests/speck/"+test_id+".js", function(){

				});
				return this;
			}

			+function(self, iframe, test_id){
				var loader = setInterval(function(){
					var scope = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument;
					if( scope  && scope.jQuery ) {
						scope = scope.window;
						clearInterval( loader );
						scope.onerror = function(){
							console.error(arguments);
							scope.onerror = undefined;
						}
						scope.jQuery(scope).load(function(){
						//scope.onload = function(){
							var _APP= scope.APP, _$	= scope.jQuery;
							_APP.set("window", "tester-" + test_id + Math.random());

							
							self.scope = scope;
							self.APP = _APP;

							scope.__testid = self.get("uniq");

							_$(scope.document).ajaxComplete(function( evt, req, opts ){
								_.each(self.ajaxRules, function(o){
									if(o.r.test(opts.url)){
										try {
											// scope.setTimeout(function(){
												self.ajaxRules = _.without(self.ajaxRules, o);
												self.next();
												// o.f(opts.url);
											// }, 33);
										} catch(e) {
											console.error("ajaxComplete", e);
										}
										return false;
									}
								});
							});

							_APP.Tester.on("ready", function(){
								_$.getScript( "/common/js/__V2/~tests/speck/"+test_id+".js", function(){

								});
							}).safecall("dummy");
						})
					}
				}, 33);
			}(this, (this.iframe = Tester.createIframe(url, test_id)), test_id);
		},

		exec : function( callback ){
			var self = this;
			this.stack.push(function(){
				try {
					callback();
				} catch (e) {
					console.error("exec", e, callback)
				}
				self.next();
			});
			return this
		},

		moduleWait : function( name ){
			var self = this;
			self.stack.push(function(){
				if(self.APP[name] && self.APP[name].get("inited")) {
					// self.scope.setTimeout(function(){
						try {
							self.next( name );
						} catch(e) {
							console.error("moduleWait", e, name);
						}
					// }, 33);
				} else {
					self.APP.on(name + ":ready", function(){
						// self.scope.setTimeout(function(){
							try {
								self.next( name );
							} catch(e) {
								console.error("moduleWait", e, name);
							}
						// }, 33);
					});
				}
			});
			return this;
		},
		ajaxWait : function(rgxp){
			var self = this;
			self.stack.push(function(){
				// try {
					self.ajaxRules.push({
						r : rgxp,
						f : function (url,data) {
							try {
								self.next();
							} catch(e){
								console.error("ajaxWait", e);
							}
						}
					});
				// } catch(e) {
				// 	console.error("ajaxWait", e);
				// }
			});
			return this.wait(300);
		},
		wait : function(n){
			var self = this;
			self.stack.push(function(){
				self.scope.setTimeout(function(){
					self.next();
				}, n);
			});
			return self;
		},
		
		waitUntil : function(check) {
			var self = this; 
			self.stack.push(function(){
				var counter = 50, timer;
				+function(){
					if(check()){
						self.scope.clearTimeout(timer);
						self.next();
					} else {
						if(!--counter) {
							throw "Ебаный мрак и ничего не работает \n" + check;
							return false;
						}

						timer = self.scope.setTimeout(arguments.callee, 100);
					}
				}();
			});
			return self.wait(1000);
		},

		equal : function( name , expr, eq ){
			var self = this, l = arguments.length;
			+function( name, expt, eq) {
				self.stack.push(function(){
					try {
						var r1, r2, r;
						r1 = _.isFunction(expr) ? expr() : expr;
						r2 = _.isFunction(eq) ? eq() : eq;
						r = _.isArray(r1) ? _.isEqual(r1,r2) : r1 == r2;

						report[self.rep_index].results.push({
							passed : !!r,
							name : name,
							expr : expr,
							eq : eq
						});
					} catch(e) {
						console.error("equal ", e);
					}

					self.next();
				})
			}( name , expr , eq )
			return this
		},
		next : function(){
			var f = this.stack.shift(), self = this;

			// console.clear();
			// console.log(self.get("name"));

			Tester.set("progress", (this.totalcalls - this.stack.length) + " / " + this.totalcalls)

			// +function(f){
				if( f && _.isFunction(f)) {

					// +function(uniqfn, f){
						// console.log(self.scope.__testid)
						// self.scope[uniqfn] = f;
						// self.scope.setTimeout(function(){
							// console.log(f)
							try {
								// self.scope[uniqfn]();
								// setTimeout(function(){
									self._lastcall = f + "";
									f.call(self.scope);
								// }, 500);
							} catch(e) {
								console.error("Ошибка в next ", e, f, self.scope);
							}
						// }, 500)
					// }("_tcall" + self.calls++, f);

				} else {
					setTimeout(function(){$(self.iframe).remove();},10);
					report[self.rep_index].time =  (+new Date - self.starttime) / 1000;
					// console.log(self.get("name"), "finished!!! ! ! ! ! !",);
					self.trigger("finish");
					// Tester.buildReport();
				}
			// }(f)
		},
		run : function(){
			this.starttime = +new Date;
			this.totalcalls = this.stack.length;
			this.next();
		}
	});



	var TESTS_STORAGE = {};


	Tester.create = function( name, id, url ){
		var test = new Test({name : name, testid : id, url : url, uniq : "t" + Math.random()});
		TESTS_STORAGE[test.get("uniq")] = test;
		test.registerScope( url, id );
		Tester.set("testname", name);
		// test.on("finish", function(){Tester.buildReport()})
		return test;
	}


	Tester.runTest = function( id, scenario ) {
		var t = TESTS_STORAGE[id];
		if(t && scenario) {
			var uniqfn = "__t" + Math.random();
			(t.scope[uniqfn] = scenario)(t);
		}
	}



	var ALLTESTS = Tester.ALLTESTS = [];

	Tester.registerTest = function(a,b,c){
		ALLTESTS.push(function(){
			Tester.create(a,b,c).on("finish", function(){
				Tester.runNext();
			});
		})
	}

	Tester.runNext = function( index ){
		var test = ALLTESTS.shift();
		if(test) {
			// alert('test.get("name")')
			test();
		} else {
			// alert("Конец")
			Tester.buildReport();
		}
	}

	Tester.runAll = function(){
		report = {};
		Tester.set("starttime", +new Date);

		$("#tester-report").remove();
		var div = $("<div />").attr("id", "tester-report").css({background: "white", position : "absolute", width: "100%", minHeight : "100%", zIndex : 191919, top: 0, left: 0}).appendTo("body");
		var h1 = $("<h1></h1>").appendTo(div);
		var h2 = $("<h2></h2>").css('tet-align', 'center').appendTo(div);

		Tester.on("change:testname", function(){
			h1.text(Tester.get("testname"));
		}).on("change:progress", function(){
			h2.text(Tester.get("progress"));
		});


		APP.Tester.registerTest("Комментарии. Топ", "comments" , "/top");
		// APP.Tester.registerTest("Комментарии. Сингл", "comments" , "/i123102179820");
		APP.Tester.registerTest("Упоминания. Топ", "mention" , "/top");
		// APP.Tester.registerTest("Упоминания. Топ", "mention" , "/i123102179820");
		APP.Tester.registerTest("Автокомплит. Топ", "ac" , "/top");
		// APP.Tester.registerTest("Автокомплит. Сингл", "ac" , "/i123102179820");
		Tester.runNext();
	}

	Tester.testAutocomplete = function(){
		APP.Tester.registerTest("Автокомплит. Топ", "ac" , "/top");
		APP.Tester.registerTest("Автокомплит. Сингл", "ac" , "/i123102179820");
		Tester.runNext();
	}


	Tester.test = function( r ){
		report = {};
		Tester.set("starttime", +new Date);
		if( r ) {
			$("#tester-report").remove();
			var div = $("<div />").attr("id", "tester-report").css({background: "white", position : "absolute", width: "100%", minHeight : "100%", zIndex : 191919, top: 0, left: 0}).appendTo("body");
			var h1 = $("<h1></h1>").appendTo(div);
			var h2 = $("<h2></h2>").css('tet-align', 'center').appendTo(div);

			Tester.on("change:testname", function(){
				h1.text(Tester.get("testname"));
			}).on("change:progress", function(){
				h2.text(Tester.get("progress"));
			});
		}
		APP.Tester.registerTest("Комментарии в топе", "test" , window);
		APP.Tester.runNext();
	}



















	Tester.randomWord = function( n ){
		var r = [], n = n || 1;
		while(n--) r.push(createRandomWord(3 + Math.random()*10))
		return  r.join(" ");
	}


	function createRandomWord(length) {
	    var consonants = 'bcdfghjklmnpqrstvwxyz',
	        vowels = 'aeiou',
	        rand = function(limit) {
	            return Math.floor(Math.random()*limit);
	        },
	        i, word='', length = parseInt(length,10),
	        consonants = consonants.split(''),
	        vowels = vowels.split('');
	    for (i=0;i<length/2;i++) {
	        var randConsonant = consonants[rand(consonants.length)],
	            randVowel = vowels[rand(vowels.length)];
	        word += (i===0) ? randConsonant.toUpperCase() : randConsonant;
	        word += i*2<length-1 ? randVowel : '';
	    }
	    return word;
	}








	Tester.buildReport = function(){
		var div = $("#tester-report").empty();
		// var div = $("<div />").attr("id", "tester-report").css({background: "white", position : "absolute", width: "100%", minHeight : "100%", zIndex : 191919, top: 0, left: 0});
		_.each(report, function(r, index){
			div.append("<h1>"+r.name+ " (" + r.time + "s)</h1>");
			var table = ["<table style='width:100%;height:100%;' cellpadding='10' cellspacing='5'>"];
			_.each(r.results, function(r){
				table.push("<tr style='color:white' bgcolor='"+ (r.passed ? "green" : "red") +"'>");
				table.push("<td>")
				table.push( r.name )
				table.push("</td>")
				table.push("</tr>")
			});
			table.push("</table>");
			$("<div />").html(table.join("")).appendTo(div);
		});

		// alert("Total time : " + ((+new Date - Tester.get("starttime")) / 1000  + "sec"));
	}




}();