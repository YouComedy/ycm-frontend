


(function(window){
	
	
	window.APP.collections.Users = window.Collection.extend({
		'model' : window.APP.models.User,
		'sort' : '',
		'role' : '',

		emptyElement : "#emptyItems",
		seenElement : "#seenItems",
		
		'urlRoot' : '/users',
		
		'url': function(){
			return this.urlRoot + '?role='+this.role+'&sort='+(this.sort?this.sort+'.d':'') + '&page=' + this.currentPage;
		},

		'parse': function( response ){
			this.limiter = (response || {}).limiter;
			return (response || {})[ this.dataField || "items" ]; 
		},

		
		'sortBy' : function( by ){
			$$("#users-table tbody").empty();
			this.resetAll();
			this.sort = by;
			this.loadNext();
		},

		'setRole' : function( by ){
			$$("#users-table tbody").empty();
			this.resetAll();
			this.role = by;
			this.loadNext();
		},

		'onSuccessLoad' : function(){
			this.renderAll();
		}
	});
	
})( this );
