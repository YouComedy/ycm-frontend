;(function ($, APP, _) {


    //

    // APP.User.set("following", []);

    var NO_FRIENDS_MSG = [
        '<div class="_textCenter" style="background:url(/common/img/oops.png) top center no-repeat;padding-top: 30px;width: 300px;margin: 20px auto;">',
            '<p class="_small" style="margin: 20px 20px 0;">',
                'Упс! Друзей на сайте не обнаружено. Делиться шуткой можно только с друзьями, пригласите парочку.',
            '</p>',
            '<a href="/friends/invite" class="button _xlarge">Пригласить друзей</a>',
            '<br><a href="/friends" class="link _underline">найти друзей</a>',
        '</div>'
    ].join("");

    var localShare =  APP.localShare;

    localShare.data = [];
    localShare._maxChecked = 10;


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Base UI Events
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */



     localShare

         .on('change:loading', function(module, loading, undefined){
            $("#dialog-base").find(".dialog__content")[ loading ? "block" : "unblock" ]();
         })

         .on("maxChecked", function(){
            $("#localShare__input").errorTip({title:"Все, больше никого добавлять нельзя", hide: 3000})
        });


    ;



    var FRIEND_TPL  = [
        '<div class="localShare__user" data-uid="{id}" data-name="{fullname}" role="button" data-owner="localShare" data-action="selectFriend">',
            '<div class="localShare__userImage"><img src="{small_image}" alt="{label}" /></div>',
            '<div class="_clear _right" style="overflow:hidden;width:100px">',
                '<b class="link">{fullname}</b><br />',
                '<i class="remark">{followers_count} подписчиков</i>',
            '</div>',
        '</div>'
    ].join("");


    localShare.initBlock = function(){
        var div  = $(document.createElement("div"));
        div.html([
            '<div class="tagsPanel _clear">',
                '<p class="_small dialog__section">Добавьте одного или нескольких пользователей, с которыми вы бы хотели поделиться шуткой.</p>',
                // '<div id="localShare__input" class="tagsPanel__input" onclick="$(this).find(\'.tagedit-list\').click();$(\'#tagedit-input\').focus().autocomplete(\'search\',\'\')">',
                '<div id="localShare__input" class="dialog__section">',
                    '<input name="tags[]" class="tag" type="hidden" value="">',
                '</div>',
                '<div id="localShare__ac" style="position:relative;height:1px;width:100%;"></div>',
                '<div id="localShare__friends" class="_clear"></div>',
                '<div class="localShare__footer">',
                    '<a href="#" class="button _big _right localShare__submitButton" role="button" data-owner="localShare" data-action="submit">Отправить</a>',
                '</div>',
            '</div>'
            ].join(""));

        localShare._block = div;
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * UI Shortcuts
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


     function _disableCheck(){return localShare.data.length >= localShare._maxChecked;}

     localShare.renderBestFriends = function( div ) {
        var friends = APP.User.get("bestFriends"),
            container = $("#localShare__friends", div);
        if( friends && friends.length ) {
            _.each(friends, function(friend){
                friend.small_image = friend.small_image || ("/common/img/profile/avatar_small.png?" + window.STATIC_VERSION);
                container.append(stringTpl(FRIEND_TPL, friend));
            });
        } else {
            // alert("empty friends")
            container.html(NO_FRIENDS_MSG);
        }
     }


     localShare.open = function( opts ){

        if( !localShare._block ) {
            localShare.initBlock();
        }

        var div =  localShare._block.clone();

        if(!APP.User.has("bestFriends")){
            if((APP.User.get("following") || []).length){
                $.get("/mentions/suggest",function(resp){
                    if( resp && resp.data ) {
                        APP.User.set("bestFriends", resp.data);
                    } else {
                        APP.User.set("bestFriends", []);
                    }
                    localShare.renderBestFriends( div );
                    localShare.set("loading", false);
                });
            } else {
                APP.User.set("bestFriends", []);
                localShare.renderBestFriends( div );
            }
        } else {
            localShare.renderBestFriends( div );
        }

        opts.content_id && localShare.set("id", opts.content_id)

        // Drop array
        localShare.data = [];

        APP.Dialog.safecall("open2", {
            class : "localShare",
            title : "Поделиться шуткой",
            content : div,
            open : function(){

                if(!APP.User.has("bestFriends")){
                    localShare.set("loading", true);
                }


                div.find(".tag").applyPlugin("tagedit", {
                    idsOnly : true,
                    // openOnFocus : true,
                    autocompleteURL : "/mentions/suggest",
                    placeholder : "Введите имя пользователя...",
                    disableOn : _disableCheck,
                    onDisabled : function(){
                        localShare.trigger("maxChecked")
                    },
                    autocompleteOptions : {
                        cache : true,
                        appendTo : "#localShare__ac",
                        minLength : 1,
                        render : function(ul, item){
                            var li = $("<li></li>");
                            // item.label = item.name;
                            item.label = item.value = item.fullname;
                            li.html([
                                "<a class='row-fluid'>",
                                    "<div class='autocomplete__thumb'>",
                                        "<img src='" + (item.small_image || ("/common/img/profile/avatar_small.png?" + window.STATIC_VERSION)) + "'>",
                                    "</div>",
                                    "<div class='autocomplete__text'>",
                                        (
                                            item.name
                                                ? "<b>" + item.name + "</b>" + " " + "<i>@" + item.username + "</i>"
                                                : "<b>" + item.username + "</b>"
                                        ),
                                        "<br />",
                                        "<i style='font-size:11px'>" + item.followers_count + " " + plural(item.followers_count, "подписчик,подписчика,подписчиков") + "</i>",
                                    "</div>",
                                "</a>"
                            ].join(""));
                            li.data("ui-autocomplete-item", item);
                            return li.appendTo(ul);
                        }
                    },
                    onAdd : function( value, id ){
                        id =  Number(id || 0);
                        if(id && _.indexOf(localShare.data, id) < 0){
                            localShare.data.push(id);
                            $("[data-uid="+id+"]", div).addClass("_checked");
                        }
                    },
                    onRemove : function( value, id ) {
                        id =  Number(id || 0);
                        if( id ) {
                            localShare.data = _.without(localShare.data, id);
                            $("[data-uid="+id+"]", div).removeClass("_checked");
                        }
                    },
                    submitCallback : function(){
                        localShare.submit();
                    }
                });
            }
        });
     }


     localShare.submit = function(){

        if(_disableCheck()){
            localShare.trigger("maxChecked");
            return false;
        }


        localShare.set("loading", true);
        $.post("/content/" + localShare.get("id") + "/send", {
            users : localShare.data
        }, function(resp){
            localShare.set("loading", false);
            resp = $.exec(resp);
            if(resp && resp.state){
                $.alertOk("Вы успешно поделились шуткой с друзьями!");
                APP.Dialog.close();
            } else {
                $.alertError((resp || {}).error_text || "Что-то пошло не так :(");
            }
        });
     }



     localShare.selectFriend = function( friendname , e) {
        var btn = $(e.currentTarget),
            uid = Number(btn.data("uid")),
            name = btn.data("name");

		function uncheck(){
			localShare.data = _.without(localShare.data, uid);
			$("#tagedit-input").val("").trigger("removeTag", [uid]);
			btn.removeClass("_checked");
		}

		if (localShare.data.length >= localShare._maxChecked - 1) {
			localShare.trigger("maxChecked");
			uncheck();
			return;
		}

        if(_.contains(localShare.data, uid)){
            uncheck();
			return;
        }

        btn.addClass("_checked");

        $("#tagedit-input")
            .val(name).trigger("forceTransformToTag", [uid]);
     }



    // Init
    $(function(){


    });

})(this.jQuery, this.APP, this._);