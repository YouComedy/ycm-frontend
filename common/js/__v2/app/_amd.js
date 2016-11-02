// http://jsperf.com/jsperformance
+function( window, app, _, $, undefined ){

	// 
	// 
	// 
	var sv = window.STATIC_VERSION,
		basePath = "/common/";

	// 
	// 
	// 
	var files = app.files = {},
		tempfiles = {},
		fid = 0;


	// 
	// 
	// 
	var urlHelper = app.urlHelper = function( url ) {
		return basePath + url + "?" + sv;
	}


	// 
	// 
	// 	
	var normalizeUrl = function( url ) {

	}

	// 
	// 
	// 
	var registerFile = app.registerFile = function( fileurl ) {
		!files[ fileurl ] && (files[ fileurl ] = true);
	}



	var loadFiles = app.loadFiles = function( fileslist, onload ) {

		return +function  (fileslist, onload) {

			var counter = 0, needlength = fileslist.length;

			var callback = function( file ){
				files[ file ] = true;
				if(++counter === needlength) {
					onload && onload();
				}
			}

			$.each(fileslist, function(index, filename){
				filename = urlHelper( filename );
				if(files[filename]) {
					callback( filename );
					return;
				}
				var ext = (filename.match(/\.(\w+)(?:\?\d+)?$/) || [])[1];
				switch (ext ) {
					case 'js':
						$.ajax({
							'url': filename,
							'dataType' : 'script',
							'success': function(contents){
								callback( filename );
							},
							'cache' : true,
							'async' : true
						});
					break;
					case 'css':
						$.ajax({
							url: filename,
							dataType : 'text',
							success: function(contents){
								$(document.createElement("style"))
									.attr("type", "text/css")
									.text(contents)
									.appendTo("head");
								callback( filename );
							}
						});
					break;
					case 'html':
						$.ajax({
							url: filename,
							dataType : 'html',
							success: function( content ){
								$(document.body).append( content )
								callback( filename );
							}
						});
					break;
				}
			});
		}( fileslist, onload);
	}
	

	
	// 
	// Инициализация файлов
	// Собираем уже встроенные в DOM файлы
	$(function(){
		var files = $("script").add("link");
		$.each( files, function( i, file ){
			var file = $(file),
				name = file.attr('data-path') || file.attr('src') || file.attr('href') || '-';
			registerFile( name );
		});
	});



	
}(this, this.app, this._, this.jQuery );