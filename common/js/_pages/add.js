// https://github.com/blueimp/jQuery-File-Upload/wiki/Cross-domain-uploads
;
(function ($, APP) {





    var DEFAULT_BTN = "Добавить шутку",
        Upload = new APP.Module({
            // defaults : {
                'name' : "Add",
                'title'  : "Добавление шутки",
                'inited' : true,
                'state'  : "new",
                'defaultBtn' : DEFAULT_BTN,
                'btn' : DEFAULT_BTN
            // }
        });


    var ItemAddView  = APP.views.ItemGridMain.extend({
        'template': _.template("#item-grid-add-tpl"),
        'repost' : function( evt, element ){
            evt.preventDefault();
            // APP.EditRepost.safecall("openRepost", this.model);
            this.model.repost(function( data ){
                if( data.state ) {
                    $.alertOk("Шутка добавлена к вам в ленту, ура!");
                    element.toggleClass("_active");
                } else {
                    $.alertError(data.error_text);
                }
            });
        }
    });


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Base UI Events
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


     Upload.on('change:tab', function( module, newtabID ){
        $(newtabID).makeActive(true, "_active");
        if(!Upload.has("ac" + newtabID)) {
            Upload.set("ac" + newtabID, true);
            $(newtabID).find(".js-tag").applyPlugin( "tagedit", {
                autocompleteURL : "/tags/suggest",
                placeholder : "Теги (минимум 2)",
                // minLength : 2,
                // onMinLengthError : function(){
                //     $.alertError("Необходимо добавить не менее двух тегов!")
                // },
                autocompleteOptions : {
                    appendTo : newtabID + "-ac",
                    open: function( e, ui){
                        // var ul = $("ul.ui-autocomplete:visible");
                        // ul.find("li:first a").addClass("ui-state-hover").trigger("mouseenter");
                    }
                }
            });
        }
     });

     Upload.set("tab", "#upload-tab-media");

     Upload

         .on('change:loading', function(module, loading, undefined){

            // Default blocker
            if( _.isBoolean(loading) ) {
                var input = $$(Upload.get("tab"))[ loading ? "block" : "unblock" ]().find(".js-block");
                !loading && input.unblock();
                if(!loading) {
                    $$("#upload-submit-btn").unblockButton();
                }
            } else {
                $$(Upload.get("tab")).find(".js-block")[ loading ? "block" : "unblock" ]( loading );
            }


            if( loading && loading.btn ) {
                $$("#upload-submit-btn")[ loading ? "blockButton" : "unblockButton" ]();
            }

         })


         .on('change:state', function(module, state){
            $$("#upload-state-" + state ).makeActive( true, "_active");
            // $$("#upload-reject-btn")[
            //         /true|false/.test(state) ? "removeClass" : "addClass"]( "_hide");
         })


         .on('change:btn', function(module, newtext ){

            $("#upload-submit-btn").css("width", "auto").text( newtext );

         })



         ;



    function validateTags( $form ) {
        if($form.find(".tagedit-listelement-old").length < 2){
            $.alertError("Необходимо добавить не менее двух тегов!")
            return false;
        }

        return true;
    }




    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * UI Shortcuts
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

     Upload.switchTab = function( tabID, event ){
        if(Upload.get("loading") || Upload.get("itemID")) return false;
        $((event || {}).currentTarget).makeActive(true, "_active");
        Upload.set("tab", tabID);
        return false;
     }

     Upload.getTab = function(){

     }


     Upload.submitForm = function(){
        if(Upload.get("loading")) return false;


        var $form = $(Upload.get("tab")).find("form");

        // На кнопку сабмита нажимают второй раз, когда уже есть айди итема для работы
        if(Upload.has("itemID")){


            if(!validateTags($form))
                return false;

            Upload.set("loading", {btn: true});

            $.post("/upload/accept?id=" + Upload.get("itemID"), $form.serialize(), function( data ){
                if( data && data.error_text ) {
                    $.alertError( data.error_text );
                }
            });

        } else {

            // var submitedFromMedia = $form.data("type") === "media";
            // if( submitedFromMedia === false ) {
            //     if(!validateTags($form))
            //         return false;
            // }

            // На кнопку нажали первый раз
            $form.submit();
        }
        return false;
     }


     Upload.setPreview = function( itemObj ) {
        var block = $$(Upload.get("tab")).find(".js-block").removeClass("_video"),
            img = new Image;

        img.src = itemObj.big_image;

        img.src && $.preloadImages( img.src, function(){
            var maxWidth = 332, realWidth = img.width,
                testscale = maxWidth / realWidth,
                scale = testscale > 1 ? 1  : testscale,
                realHeight = img.height,
                needHeight = realHeight * scale;

            block
                .empty()
                .append( img )
                .animate({
                    'height' : needHeight + 20// 30 h3 height, 20 top + bottom paddings, 18 - watermark
                }, function(){
                    if( itemObj.type == 2 ) {
                        block.append('<a class="play-btn-overlay _disabled" style="display:block" data-play="1"></a>');
                    }
                });

        });
     }




     Upload.beforeUpload = function(data, form){
        if(Upload.has("itemID")) return false;

        if(!Upload.has("fieldHTML")){
            Upload.set("fieldHTML", $$(".upload__tab:visible").find(".js-block").html());
        }

        Upload.set({
            "loading"   : {"ignoreIfBlocked" : true, "message"  : '<img width="24" height="24" src="/common/img/loader-mini.gif">'},
            "state"   : "loading"
        });

     }


     Upload.afterUpload = function( data, u1, u2, form ){

        form = form || $(Upload.get("tab")).find("form");

        var submitedFromMedia = true;
        // $(form).data("type") === "media";
        
        !form.find(":focus").length && form.find("textarea:last").trigger("focus");

        data = data || {};

        // alert("Upload.afterUpload " + JSON.stringify(data));

        if( data.state ) {

            var item = data.item || {},
                itemID = item.id;

            itemID && Upload.set("itemID", itemID);

            if(itemID && submitedFromMedia) {

                if( form.data("type") === "text"){
                    form.find("textarea:first").prop("disabled", true);
                }

                item.big_image && Upload.setPreview( item );

                Upload.checkDuplicates( itemID );
                return;
            }

            Upload.set("loading", false);

        } else {

            Upload.set({
                "loading" : false,
                "state"   : "new"
            });

            $.alertError( (data || {}).error_text || "Что-то пошло не так :(");

            form.resetForm();
        }
     }



     Upload.checkDuplicates = function( itemID ){


        Upload.set({
            "loading"   : {"ignoreIfBlocked" : true, "btn" : true},
            "state"     : "dups_search"
        });

        if( itemID ) {

            $.get("/upload/check", {"id": itemID}, function(data){
                data = $.exec(data) || {};

                Upload.set("loading", false);

                if( data.state ) {

                    var items = data.items || [],
                        dups_state = items.length > 0;

                    if( dups_state ) {


                        if( data.block ) {
                            Upload.set("btn", "Вы не можете добавить эту шутку");
                            $("#upload-submit-btn").hide();
                        } else {
                            Upload.set("btn", "Это не баян! Добавить шутку");
                        }

                        // Далее показываем дубликаты ....
                        var HelperText = {
                                // ""
                            },
                            itemsPlaceholders = $(".upload__griditem");


                        _.each(items, function( item, index ){
                            (new ItemAddView({
                                model : new APP.models.Item(item)
                            }))
                            .render(itemsPlaceholders[index]);
                        });

                    } else {

                        // Пишем что все ок, баянов нет


                    }

                    Upload.set({
                        "state" : "dups_" + dups_state
                    });


                } else {
                    ;
                }

            });

        } else {
            ;
        }
     }





    Upload.rejectUpload = function( undefined,  event ){
        Upload.get("itemID") && $.get("/upload/reject", {"id" : Upload.get("itemID")});
        return false;
    }


    Upload.reset = function(){
        Upload
            .unset("itemID")
            .set({
                "state"  : "new",
                "loading": false,
                "btn"  : DEFAULT_BTN
            });

        $$(Upload.get("tab")).find(".js-block").html(Upload.get("fieldHTML"));

    }



    var Debug = true;
    Debug && _.each(Upload, function(fn, k){
        if(k.charAt(0) == "_" || !_.isFunction(fn)) return;
        Upload[k] = function(){
            fn.apply(this, arguments);
            console.log("Upload:", k);
        }
    });



    // Init
    $(function(){

        $("#upload-input-link").on("keyup", function(){
            /^(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png)?$/i.test(this.value)
                && $(this).trigger("blur").parents("form").submit();
        });


        $("#upload-input-file").on("change", function(){
            $(this).trigger("blur").parents("form").submit();
        });


        $("textarea.upload__description").on("keydown", function (e) {
            if (keyboard.is("tab", e)) {
                $(this).parents("form").find("ul.tagedit-list").trigger('click');
                return false;
            }

            $(this).parent().find('.upload__descCount').text(400 - $(this).val().replace(/(\r\n|\n|\r)/g, '\r\n').length);
        }).on('keyup', function(){
			$(this).parent().find('.upload__descCount').text(400 - $(this).val().replace(/(\r\n|\n|\r)/g, '\r\n').length);
		});

    });

})(this.jQuery, this.APP);