// http://jsperf.com/jsperformance
+function( window, app, _, $, undefined ){

	




	var safecall = app.safecall = function ( modulename, method, param, event ) {
		var module = app[modulename];
		if( module === undefined ) {
			module = createModule({name : modulename});
		}
		if(module.has("_inited")) {
			return module[method]( param, event );
		} else {
			if(module.has("_files")) {
				app.loadFiles(module.get("_files"), function(){
					module.set("_inited", {silent: true});
					module.trigger("init");
					return module[method]( param, event );
				});
			} else {
				module.set("_inited", {silent: true});
				module.trigger("init");
				return module[method]( param, event );
			}
		}
	}


	alert(5)



	
}(this, this.app, this._, this.jQuery );