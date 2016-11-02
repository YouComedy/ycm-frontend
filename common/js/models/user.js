;(function($, Backbone, window, _, APP) {


	APP.models.User = Backbone.Model.extend({

		/**
		 * url generator
		 */
		'url' : function(){
			return '/user/' + this.get("username");
		},



		'followURL' : function(){
			return this.url() + '/' + this.get('followed') ? 'unfollow' : 'follow'
		},


		/**
		 * Default properties
		 */
		'defaults' : {

			// Activated profile
			'active' : 1,

			'username' : '',
			'name' : '',
			'fullname' :  '',
			'lastSeen' : '',

			contentCount : 0,
			followersCount : 0,

			// Big avatar
			'big_image' : '',

			// Small avatar
			'small_image' : '',

			// Date in human-friendly form
			'registered' : '',

			// List of badges
			// Collection
			'badges' : null,

			// List of uploaded items by user
			// Collection
			'items' : null,

			// List of uploaded remixes by user
			// Collection
			'remixes' : null,

			// Users role
			'role' : "user",

			// User statistics
			'stats' : {
				// Total Comments count for user's items
				'commentsGet': 0,
				// Total Comments count that user wrote
				'items_comments_made': 0,
				// Total dislikes count for user's items
				'dislikesGet': 0,
				// Total dislikes count that user made
				'items_dislikes_made': 0,
				// Total Items count that user uploaded
				'items_uploaded': 0,
				// Total likes count for user's items
				'likesGet': 0,
				// Total likes count that user made
				'items_likes_made': 0,
			},

			// Stats
			'items_uploaded' : 0,
			'likes_got_count' : 0,
			'dislikes_got_count' : 0,
			'comments_made_count' : 0,
			'collectionsCount' : 0

		},


		'isFollowed' : function(){
			var f = APP.User
				? APP.User.isFollowing( this.id )
			 	: _.indexOf(window.user_following || [], Number(this.id)) > -1;
			this.set( 'followed', f );
			return f;
		}

	});


})(window.jQuery, window.Backbone, window, window._, window.APP);
