(function(){

	var Hall = new APP.Module({
		'inited' : true,
		'name' : "HallOfFame"
	})

	var MainContainer = $("#widgetRating"),
		// Big slider photos
		BigPics = [$("#widgetRating__big-1"), $("#widgetRating__big-2")],
		SliderInner = $("#widgetRating__sliderInner");


		// return;

	// Block before init
	MainContainer.block();


	// Images for slider
	var images = [], images_big = [], ihash = {};
	var SlideItems  = $("#widgetRating .widgetRating__slide");

	// filling up images
	SlideItems.each(function(){
		var url = $(this).attr("data-bigimage");
		ihash[url] = 1;
	});

	images = _.keys(ihash);
	// alert(images.length)


	var infoBoxTemplate = _.template([
    	'<a  href="/user/{{= username }}"  class="thumb _big">',
			'<img class="thumb__img" src="{{= small_image }}" alt="">',
		'</a>',
		'{{= APP.User.renderFollowBtn(null, id, "_right") }}',
		// fullname
		'<a href="/user/{{= username }}" class="title">{{= fullname }}</a>',
		'<p>',
			// followers_count
			'{{= (followers_count || 0) + " " + plural(followers_count || 0, "подписчик,подписчика,подписчиков") }}',
		'</p>'
    ].join(""));


	// Mini slide height
	var SlideHeight = 85,

		ImagesCount = images.length,
		TotalSlides = SlideItems.length,
		currentIndex = ImagesCount - 1,
		visibleItems = 3,
		timer = null;


	var	eff = ['fadeIn', 'fadeOut'], k = 1;

	function startTimer(){
		if(!timer) {
			timer = setTimeout(changeImage, 3777);
		}
	}
	
	function changeImage(){
		clearTimeout( timer );
		timer = null;

		var nextIndex = ImagesCount - currentIndex % ImagesCount - 1;
		// var nextIndex = currentIndex % ImagesCount - 1;

		if(BigPics[0].is(":animated")) return false;

		// console.log(currentIndex % ImagesCount , nextIndex)

		var nextSlide = $(SlideItems[nextIndex]),
			testIndex = ImagesCount - (currentIndex % ImagesCount) - 2;


		// alert( testIndex )

		testIndex = testIndex < 0 ? ImagesCount - 1 : testIndex;

		var u = window.__HallSlides[testIndex];
		// console.log( testIndex, u );

		BigPics[(m = currentIndex % 2)]
        	.css('backgroundImage', 'url(' + images[ testIndex  ] + ')')[ eff[k ^= 1] ](666)
        	.attr("href", "/user/" + u.username );

        u && $("#js-widgetRating__infoBox").html(infoBoxTemplate( u ));

		BigPics[m ^= 1][ eff[k ^= 1] ]( 666 );
		

		var top = -1 * TotalSlides * SlideHeight + (SlideHeight * (currentIndex - (1))); // visibleItems

		// alert(SliderInner.css("top") + " *** " + top )

		if( top > -100 * ImagesCount ) {
			top = -1 * TotalSlides * SlideHeight + SlideHeight * visibleItems;
			currentIndex = ImagesCount - 1;
		}

		SliderInner.animate({
    		top: top
    	});

    	++currentIndex;
    	// console.log(currentIndex);

    	startTimer();
    }


    





    SliderInner
		.height( TotalSlides * SlideHeight )
		.css("top", -1 * TotalSlides * SlideHeight + SlideHeight * visibleItems);


    Hall.scrollSlider = changeImage;

    $(".widgetRating__big").attr("href", "/user/" + window.__HallSlides[0].username );


	$.preloadImages(images, function(){
		$("#js-widgetRating__infoBox").html(infoBoxTemplate(window.__HallSlides[0]));

		MainContainer.unblock();
		startTimer();
	});

	MainContainer.hover(function(){
		clearTimeout( timer );
		timer = null;
	}, function(){
		startTimer();
	});


})();