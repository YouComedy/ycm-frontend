$("#cover-file-input").change(function(){
	$('#cover-edit-container').block();
	$(this).parents("form").submit();
});

$(document).data('cover', $('#cover-file-input').clone(true));

$("#avatar-file-input").change(function(){
	$('#avatar-edit-container').block();
	$(this).parents("form").submit();
});

$('.badgesTable__badge').click(function(){
	var self = $(this);
	var id = self.data('badge');
	var title = self.find('.badgesTable__title').html();
	var description = self.find('.badge__hoverDescription').html();
	var reward = self.find('.badge__hoverReward').html();

	APP.NewBadges.safecall('showBadge', {
		id: id,
		title: title,
		description: description,
		reward: reward
	});
});

$(document).data('avatar', $('#avatar-file-input').clone(true));

$('#edit_profile').click(function(){
	var self = $(this);
	var about = $('.userDescription').text();
	var username = $('.onlineStatus').text();
	var profile = $('.panelProfile');

	if (self.hasClass('inactive')){
		editProfile();
	} else {
		saveProfile();
	}

	function editProfile(){
		profile.addClass('_editing');
		self.removeClass('inactive');
		self.text('Сохранить');
		$$('.backpack__item').draggable('enable');
		APP.Profile.Hovers.disableBackpack();


	}

	function saveProfile(){
		$$('.backpack__item').draggable('disable');
		self.parent().block();
		APP.Profile.Hovers.init();

		if ($('[name="User[about_me]"]').val() !== about || $('[name="User[name]"]').val() !== username){
			if($$('.backpack').hasClass('_changed')){

				var ids = [];
				$.each(APP.Profile._backpack, function(){
					ids.push($(this).data('badge'));
				});

				$.ajax({
					method: 'POST',
					url: '/moveBadges',
					data: {
						'badges': ids.join(',')
					},
					success: function(){
						$('.panelProfile__userInfoForm').submit();
					},
					error: function(){
						$.alertError('Не получилось отредактировать профиль');
						$$('.backpack__item').draggable('enable');
						self.parent().unblock();
					}
				});
			} else {
				$('.panelProfile__userInfoForm').submit();
			}
		} else {
			if($$('.backpack').hasClass('_changed')){

				var ids = [];
				$.each(APP.Profile._backpack, function(){
					ids.push($(this).data('badge'));
				});

				$.ajax({
					method: 'POST',
					url: '/moveBadges',
					data: {
						'badges': ids.join(',')
					},
					success: function(){
						profile.removeClass('_editing');
						self.addClass('inactive');
						self.text('Редактировать');
						self.parent().unblock();
					},
					error: function(){
						$.alertError('Не получилось отредактировать профиль');
						$$('.backpack__item').draggable('enable');
						self.parent().unblock();
					}
				});
			} else {
				profile.removeClass('_editing');
				self.addClass('inactive');
				self.text('Редактировать');
				self.parent().unblock();
			}
		}
	}

	return false;
});

APP.Profile.coverSuccess = function( data, u1, u2, form ){
	$('#cover-edit-container').unblock();
	data = $.exec( data );

	if( data && data.state === true ) {
		$(document).data('cover').clone(true).replaceAll('#cover-file-input');

		APP.Dialog.open('', [

			'<img width="728" id="cropCover" src="' + data.uncut_image + '">',
			'<div class="dialog__btns">',
				'<a href="#" class="button ybtn _big _red" onclick="APP.Dialog.close();return !1">Отмена</a>',
				'<a href="#" class="button ybtn _big" style="margin-left:20px" onclick="APP.Profile.saveCutCover();return !1">Сохранить</a>',
			'</div>'

		].join(''),
		'cropDialog');

		var ratio = 728 / 287;
		var min_width = 728;
		var min_height = 287;

		$('#cropCover').Jcrop({
			aspectRatio: ratio,
			minSize: [min_width * min_width / data.width, min_height * min_height / data.height],
			setSelect: [0, 0, 1, 1],
			onChange: function(offset){
				$('#cover-offset-input').val([offset.x, offset.y, offset.x2, offset.y2].join(','));
			}
		});
	} else {
		$.alertError((data && data['error_text']) || 'Не получилось отредактировать профиль');
	}
}


APP.Profile.saveCutCover = function(){
	APP.Dialog.close();
	$('#cover-offset-input').parents("form").submit();
	$('#cover-edit-container').block();
}

APP.Profile.coverCutSuccess = function(data, u1, u2, form){
	data = $.exec( data );

	$('#cover-edit-container').unblock();

	if( data && data.state === true ) {
		APP.User.set("cover", data.cover_big_image);
	} else {
		$.alertError((data && data['error_text']) || 'Не получилось отредактировать профиль');
	}
}

APP.User.on("change:cover", function(){
	var img = this.get("cover");
	$.preloadImages(img, function(){
		$("#cover-image").attr("src", img);
	});
});

APP.User.on("change:small_image change:big_image", function(){
	var img = this.get("big_image");
	$.preloadImages(img, function(){
		$("img[data-uid="+APP.User.id+"]").attr("src", img);
	});
});


APP.Profile.avatarSuccess = function( data, u1, u2, form ){
	data = $.exec( data );
	$('#avatar-edit-container').unblock();

	$(document).data('avatar').clone(true).replaceAll('#avatar-file-input');

	if( data && data.state === true ) {
		APP.User.set("small_image", data.small_image);
		APP.User.set("big_image", data.big_image);
	} else {
		$.alertError((data && data['error_text']) || 'Не получилось отредактировать профиль');
	}
}

APP.Profile.profileEditSuccess = function( data, u1, u2, form ){
	$('.panelProfile__action').unblock();
	data = $.exec( data ) || {};

	if( data && data.state === true ) {
		$.alertOk("Профиль успешно обновлен!");

		switch (window._PAGE){
			case 'userProfile':
				window.location.reload(true);
				break;
		}
	} else {
		$$('.backpack__item').draggable('enable');
		$.alertError((data && data['error_text']) || 'Не получилось отредактировать профиль');
	}
}


// Инвентарь с беджами
$(function(){
	var items = $$('.backpack__item');
	var backpack = APP.Profile._backpack = $.map(items, function(el){return $(el)});

	var cols = 11;
	var size = 52;
	var margin = 10;

	function getItemCoords(i){
		xy = indexToCoords(i);
		return {
			left: margin + (margin + size) * xy[0],
			top: margin + (margin + size) * xy[1]
		}
	}

	function indexToCoords(i){
		return [i % cols, (i / cols)|0];
	}

	items
	.each(function(i){
		$(this).data('index', i).css(getItemCoords(i));
	})
	.draggable({
		containment: '.backpack',
		refreshPositions: true,

		stop: function(){
			var item = $(this);
			item.css(getItemCoords(item.data('index')|0));
		}
	})
	.droppable({
		over: function(e, item_new){
			$$('.backpack').addClass('_changed');

			item_new = item_new.draggable;
			var item_old = $(this);
			var index_old = item_old.data('index')|0;
			var index_new = item_new.data('index')|0;
			var xy_new = indexToCoords(index_new);
			var xy_old = indexToCoords(index_old);

			if (item_old.hasClass('is_animated')) return;

			if (xy_new[1] == xy_old[1]){
				item_new.data('index', index_old);
				item_old.data('index', index_new);
				backpack[index_old] = item_new;
				backpack[index_new] = item_old;
				item_old.css(getItemCoords(index_new));
			} else {
				var from_index, to_index, index_offset;

				if (xy_new[1] < xy_old[1]){
					from_index = index_new + 1;
					to_index = index_old + 1;
					index_offset = index_new;
				} else {
					from_index = index_old;
					to_index = index_new;
					index_offset = index_old + 1;
				}

				backpack_slice = backpack.slice(from_index, to_index);
				$.each(backpack_slice, function(i){
					var backpack_index = index_offset + i;
					backpack[backpack_index] = backpack_slice[i].data('index', backpack_index)
						.css(getItemCoords(backpack_index)).addClass('is_animated');

					setTimeout(function(){
						backpack[backpack_index].removeClass('is_animated');
					}, 200);
				});

				backpack[index_old] = item_new
					.data('index', index_old).css(getItemCoords(index_old));
			}
		}
	}).draggable('disable');
});