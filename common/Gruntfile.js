
// http://nano.sapegin.ru/all/grunt-0-4

module.exports = function(grunt) {



    function path(e){}


    var conf = {

        // sftp : grunt.file.readJSON('_grunt.personal.json'),
        // concat: grunt.file.readJSON("_jspacks.json"),

        // .ftpass file
        auth : {
            host: "dev.youcomedy.me",
            authKey: "key1"
        },

        scssDir :  "./scss",
        cssDir : "./css",
        dev : {
            commands : [
                "concat",
                "compass:dev",
                // "sftp"
            ]
        },
         production : {
            commands : [
                "concat",
                "uglify",
                "replace",
                "compass:production",
                // "ftpush:jsall",
                // "ftpush:views"
                // "git_deploy"
            ]
        }
    };




    // @todo
    // Вынести все это в отдельный файл
    // ООООООчень желательно иметь возможность комментирования в файле
    // так как "правильный" жсон ломается при комментариях
    conf.concat  = {
        "options" : {"separator" : ";"},

        "appcore" : {
            "src": [
                "./js/libs/modernizr.js",
                "./js/app/app.touch.js",
                "./js/libs/store.js",
                "./js/libs/underscore.js",
                "./js/libs/whack.js",
                "./js/libs/backbone.js",
                "./js/libs/backbone.essentials.js",
                "./js/app/app.core.js",
                "./js/app/app.modules.js",
                "./js/models/user.js",
                "./js/app/appinit.js",
            ],
            "dest": "./js/~packs/app.core.js"
        },

        "items" : {
            "src": [
                "./js/models/vote.js",
                "./js/models/item.js",
                "./js/models/item.collection.js",
                "./js/views/*.js",
            ],
            "dest": "./js/~packs/items.js"
        },

        "autocomplete" : {
            "src" : [
                "./js/libs/ui.autocomplete.js",
                "./js/libs/ui/autocomplete.js"
            ],
            "dest" : "./js/~packs/autocomplete.js"
        },

        "mobile.profile" : {
            "src" : [
                "./js/profile/profile.js",
                "./js/profile/_news.js",
                "./js/models/user.collection.js",
                "./js/profile/_followers.js",
                "./js/profile/_allitems.js"
            ],
            "dest" :"./js/~packs/mobile.profile.js"
        }
    }



    grunt.initConfig({

        // https://github.com/gruntjs/grunt-contrib-concat
        concat: conf.concat,

        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            options : {
                beautify : {
                    indent_start : 0,
                    indent_level : 0,
                    semicolons: false,
                    beautify : true
                },
                compress: {
                    global_defs: {
                        "DEBUG": false
                    },
                    dead_code: false
                }
            },

            allJS : {
                files : [{
                      expand: true,
                      src: ["./js/**/*.js"],
                      dest: "./jsmin"
                }]
            }
        },


        // https://github.com/gruntjs/grunt-contrib-watch
        watch : {
            js : {
                options: {spawn: false}, files : ["_jspacks.json", "./js/**/*.js"], tasks : ["concat", "sftp:js"]
            },
            scss : {
                options: {spawn: false}, files : "./scss/**/*.scss", tasks : ["compass:dev", "sftp:css"]
            },
            css : {
                options: {spawn: false}, files : "./css/**/*.css", tasks : ["sftp:css"]
            },
            tpl : {
                options: {spawn: false}, files : "./tpl/**/*.html", tasks : [/*"concat",*/ "sftp:tpl"]
            }
        },


        // https://github.com/outaTiME/grunt-replace
        // Increment static version
        replace : {
            dist: {
                options: {
                    patterns: [{
                        match: /(\d+)/,
                        replacement: function(n){return Number(n) + 1;}
                    }]
                },
                files: [{expand: true, flatten: true, src: ["./sv.txt"], dest: "./"}]
            }
        },


        // https://github.com/gruntjs/grunt-contrib-compass
        compass: {
            production: {
                options: {
                    sassDir: conf.scssDir,
                    cssDir: conf.cssDir,
                    outputStyle : "compact",
                    noLineComments : true,
                    force : true
                }
            },
            dev: {
                options: {
                    sassDir: conf.scssDir,
                    cssDir: conf.cssDir,
                    outputStyle : "compact",
                    noLineComments : true,
                }
            }
        },


        // dev upload, because of chmod
        //sftp : {
        //    css : {options:conf.sftp, files: {"/css": "./css/**/*.css"}},
        //    js  : {options:conf.sftp, files: {"/js/~packs": "./js/~packs/*.js"}},
        //    tpl : {options:conf.sftp, files: {"/tpl": "./tpl/**/*.html"}}
        //},

        // https://github.com/inossidabile/grunt-ftpush
        //ftpush : {
        //    jsall : {auth: conf.auth, src: "./js", dest: conf.sftp.path + "/js"},
        //    img : {auth: conf.auth, src: "./img", dest: conf.sftp.path + "/img"},
        //    views : {auth: conf.auth, src: "../protected/views", dest: conf.sftp.path + "../protected/views"}
        //},


        qunit: {
            // files: ['test/**/*.html']
            urls : ["http://e.youcomedy.me/top"]
        }


    });


    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-replace");
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks("grunt-ftpush");
    grunt.loadNpmTasks("grunt-ssh");



    grunt.loadNpmTasks('grunt-contrib-qunit');


    // https://github.com/gruntjs/grunt-contrib-imagemin
    // https://github.com/jharding/grunt-exec
    // https://github.com/gruntjs/grunt-contrib-htmlmin


    // grunt.loadNpmTasks('grunt-exec');
    // exec: {
    //   open_spec_runner: {
    //     cmd: 'open _SpecRunner.html'
    //   },
    //   git_is_clean: {
    //     cmd: 'test -z "$(git status --porcelain)"'
    //   },
    //   git_on_master: {
    //     cmd: 'test $(git symbolic-ref --short -q HEAD) = master'
    //   },
    //   git_add: {
    //     cmd: 'git add .'
    //   },
    //   git_commit: {
    //     cmd: function(m) { return f('git commit -m "%s"', m); }
    //   },
    //   git_tag: {
    //     cmd: function(v) { return f('git tag v%s -am "%s"', v, v); }
    //   },
    //   git_push: {
    //     cmd: 'git push && git push --tags'
    //   },
    //   publish_assets: {
    //     cmd: [
    //       'cp -r <%= buildDir %> typeahead.js',
    //       'zip -r typeahead.js/typeahead.js.zip typeahead.js',
    //       'git checkout gh-pages',
    //       'rm -rf releases/latest',
    //       'cp -r typeahead.js releases/<%= version %>',
    //       'cp -r typeahead.js releases/latest',
    //       'git add releases/<%= version %> releases/latest',
    //       'sed -E -i "" \'s/v[0-9]+\\.[0-9]+\\.[0-9]+/v<%= version %>/\' index.html',
    //       'git add index.html',
    //       'git commit -m "Add assets for <%= version %>."',
    //       'git push',
    //       'git checkout -',
    //       'rm -rf typeahead.js'
    //     ].join(' && ')
    //   }
    // }


    // grunt.registerTask("default", ["concat", "sftp:js"] );
    grunt.registerTask("default", conf.dev.commands );
    grunt.registerTask("deploy", conf.production.commands);
};