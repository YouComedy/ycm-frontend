
$(function(){
	var enable = false;
	var css_file = '/common/css/utils/info_layer.css';
	var images = [
		'/common/img/tour/add.png',
		'/common/img/tour/save.png',
		'/common/img/tour/close.png',
		'/common/img/tour/collections.png',
		'/common/img/tour/rate.png',
		'/common/img/tour/comments.png'
	];

	window.EGG = window.EGG || {};

	$.ajax({
		url: css_file,
		dataType : 'text',
		success: function(contents){
			$("<style type='text/css'>" + contents + "</style>").appendTo(document.head);

			$.preloadImages(
				images,
				function(){
					enable = true;
				}
			);
		}
	});

	window.EGG.info_layer = function(){
		var block = $('.b-grid-column:eq(0) .b-grid-item:first');

		if (!(enable && block.size())){
			setTimeout(arguments.callee, 100);
			return;
		}

		var overlay = $("#overlay");
		var upload = $('#uploadbutton');
		var user = $('#header-user-link');
		var div = $('<div id="info-layer"></div>');
		var block_id = block.attr('id');
		var clone = $('#' + block_id + '_clone');
		var block_height = block.find('.b-grid-item__link').height();
		var like, comment;
		var img_add, img_save, img_close, img_collections, img_rate, img_comments;

		img_add = $('<img style="top:5px" src="' + images[0] + '" />');
		img_save = $('<img src="' + images[1] + '" />');
		img_close = $('<img style="top:60px;right:30px" src="' + images[2] + '" />');
		img_collections = $('<img style="top:17px" src="' + images[3] + '" />');
		img_rate = $('<img src="' + images[4] + '" />');
		img_comments = $('<img src="' + images[5] + '" />');

		div.append(
			img_add,
			img_save,
			img_close,
			img_rate,
			img_comments,
			img_collections
		);
		div.appendTo('body');

		function onResize(){
			block = $('#' + block_id);

			if (!block.hasClass('b-grid-item-btns-visible')){
				block.addClass('b-grid-item-btns-visible');
				block.find('.b-grid-item__button_addto').addClass('active');
				block.find('.b-grid-item__link').height(150);
				block.find('.b-grid-item__comment:not(:last)').hide();

				if (!clone.size()){
					clone = block.clone();
					clone.append('<div id="clone_overlay"></div>');
					clone.attr('id', block_id + '_clone').appendTo(div);
					clone.offset({top: block.offset().top});

					like = clone.find('.b-grid-item__likebar');
					comment = clone.find('.b-grid-item__comment:last');
					buttons = clone.find('.b-grid-item__buttons');
					img_rate.offset({top: like.offset().top + 20});
					img_comments.offset({top: comment.offset().top - 100});
					img_save.offset({top: buttons.offset().top - 34});
				}

				block.animate({'opacity': 0}, 0);
			}

			clone.offset({left: block.offset().left});
			img_rate.offset({left: clone.offset().left + 230});
			img_comments.offset({left: clone.offset().left - 200});
			img_collections.offset({left: user.offset().left - 70});
			img_add.offset({left: upload.offset().left + 90});
			img_save.offset({left: clone.offset().left + 140});
		}

		$.blockBody();
		overlay.add(div).fadeIn();

		div.click(function(){
			overlay.add(div).fadeOut();
			block.removeClass('b-grid-item-btns-visible');
			block.find('.b-grid-item__button_addto').removeClass('active');
			block.find('.b-grid-item__link').height(block_height);
			block.find('.b-grid-item__comment').show();
			block.animate({'opacity': 1}, 0);
			$(window).off('resize', onResize);
			$.unblockBody();
			div.remove();
		});

		clone.click(function(){
			div.trigger('click');
			return false;
		});

		$(window).on('resize', onResize).scrollTop(0).trigger('resize');
	}
});
