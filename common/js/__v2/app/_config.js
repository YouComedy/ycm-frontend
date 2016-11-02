+function( window, Backbone, undefined ){


	var app = new Backbone.Model;


	app._DEBUG = window._DEBUGJS;
	app._AUTO_MODULE = true;

	app.STATIC_VERSION = window.STATIC_VERSION;

	app._MODULES = {

		"localShare" : {
			"files" : [],
			"depend": []
		}

	}


	window.app = window.APP = app;
}(this, this.Backbone);