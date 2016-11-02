+function( window, app, Backbone, _, undefined ){


	// 
	// 
	// 	
	var ModuleModel = Backbone.Model.extend({
		"defaults" : {
			"name" : "",
			"live" : 120
		},

		"initalize" : function(){
		}
	});






	// var ModuleCollection = Backbone.Collection.extend({});

	// // .....

	// var _modules = app._modules = new ModuleCollection;





	// 
	// 
	// 
	// app.registerFile = function(){}



	// 
	// 
	// 	
	// function debugWrapper( module ) {
	// 	_.each(module, function(fn, key){
	// 		if(_.isFunction(fn)){
	// 			var oldFN = module[key];
	// 			module[key] = function(){
	// 				var logmsg = "call: ", module.get("name") + "." + key + "(", arguments , ")";
	// 				try {
	// 					var res = oldFN.apply(module, arguments);
	// 					console.info( logmsg );
	// 					return res;
	// 				} catch (e) {
	// 					console.error(logmsg, e);
	// 				}
	// 			}
	// 		}
	// 	});
	// }



	// 
	// 
	// 	
	// app.createModule = function( props, name ) {
	// 	props.name = name;
	// 	var module = new Module(props);
	// 	app._DEBUG && debugWrapper( module );
	// 	_modules.add( module );
	// }
	
}(this, this.app, this.Backbone, this._);