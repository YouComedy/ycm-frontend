

;
(function( $, Backbone, window, _ ){


	APP.models.Votable = Backbone.BaseModel.extend({
		
		defaults : {
			score : 0,
			userVote : 0,
			likes : 0,
			dislikes : 0,
			rating : 0
		},

		_vote : function(){

		},

		vote : function( score, callback ){
			var self = this,
				userVote = self.get("userVote"),
				action = score > 0 ? "like" : "dislike";

			// Юзер уже голосовал так же
			// То есть снимает лайк или дислайк
			if( score * userVote > 0 ) {
				//  Снял лайк
				if(userVote > 0) {
					self.set("likes", Number(self.get("likes") - 1));
					self.set("rating", self.get("rating") - 1);
				} 
				// Снял дислайк
				else {
					self.set("dislikes", Number(self.get("dislikes") - 1));
					self.set("rating", self.get("rating") + 1);
				}

				self.set('userVote', 0);
			}
			//  Новый голос
			else {
				// Ставим лайк
				if( score > 0 ) {
					self.set("rating", self.get("rating") + 1);
					self.set("likes", Number(self.get("likes") + 1));
					// стоял дислайк
					if( userVote < 0 ) {
						self.set("rating", self.get("rating")  + 1);
						self.set("dislikes", Number(self.get("dislikes") - 1));
					}
				}
				// Дислайк 
				else {
					self.set("rating", self.get("rating")  - 1);
					self.set("dislikes", Number(self.get("dislikes") + 1));
					// Стоял лайк
					if( userVote > 0 ) {
						self.set("rating", self.get("rating")  - 1);
						self.set("likes", Number(self.get("likes") - 1));
					}
				}

				self.set('userVote', score);
			}


			$.get(self.get("voteUrl") + "/" + action, function( data ){
				if( data.state === true ) {

					callback && callback( data, false ); 
					return;

					// model.set({
					// 	'userVote' : data.userVote,
					// 	"likes" :  data['likes'],
					// 	"dislikes" :  data['dislikes']
					// });
					
					
					// if( data['likes'] !== undefined && data['likes'] != model.get("likes") ) {
					// 	model.set({
					// 		'userVote' : data.userVote,
					// 		"likes" :  data['likes']  
					// 	});
					// 	callback && callback( data, false ); 
					// 	return;
					// } 
					
					// if( data['dislikes'] !== undefined && data['dislikes'] != model.get("dislikes") ){
					// 	model.set({
					// 		'userVote' : data.userVote,
					// 		"dislikes" :  data['dislikes']  
					// 	});
					// 	callback && callback( data, false ); 
					// 	return;
					// } else {
					// 	model.set('userVote', 0);
					// }
						
					// callback && callback( data, false );

				} else {

					if( callback )
						callback( data, true );
					else
						 $.alertError( data.error_text );
				}
			});
		},


		like : function( callback ){this.vote(1, callback)},
		dislike : function( callback ){this.vote(-1, callback)}

	});
	
})( jQuery, Backbone, this, _ );
