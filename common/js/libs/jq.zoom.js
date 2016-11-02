/*
	Smooth Zoom Pan - jQuery Image Viewer
 	Copyright (c) 2012 Ramesh Kumar
	http://codecanyon.net/user/VF
	
	Version: 1.3 
	10 FEB 2012
	
	Built using:

	jQuery 		version:1.6.2	http://jquery.com/
	Modernizr 	version:2.0.6	http://www.modernizr.com/
	MouseWheel	version:3.0.6	http://brandonaaron.net/code/mousewheel/docs
	
*/
var zoomer_;
(function (d, c, a) {
    var e = {
        width: "",
        height: "",
        initial_ZOOM: "",
        initial_POSITION: "",
        animation_SMOOTHNESS: 5.5,
        animation_SPEED: 5.5,
        zoom_MAX: 800,
        zoom_MIN: "",
        zoom_OUT_TO_FIT: "YES",
        zoom_BUTTONS_SHOW: "YES",
        pan_BUTTONS_SHOW: "YES",
        pan_LIMIT_BOUNDARY: "YES",
        button_SIZE: 18,
        button_COLOR: "#FFFFFF",
        button_BG_COLOR: "#000000",
        button_BG_TRANSPARENCY: 55,
        button_ICON_IMAGE: "zoom_assets/icons.png",
        button_AUTO_HIDE: "NO",
        button_AUTO_HIDE_DELAY: 1,
        button_ALIGN: "bottom right",
        button_MARGIN: 10,
        button_ROUND_CORNERS: "YES",
        mouse_DRAG: "YES",
        mouse_WHEEL: "YES",
        mouse_WHEEL_CURSOR_POS: "YES",
        mouse_DOUBLE_CLICK: "YES",
        background_COLOR: "#FFFFFF",
        border_SIZE: 1,
        border_COLOR: "#000000",
        border_TRANSPARENCY: 10,
        image_url: "",
        container: "",
        max_WIDTH: "",
        max_HEIGHT: "",
        full_BROWSER_SIZE: "NO",
        full_BROWSER_WIDTH_OFF: 0,
        full_BROWSER_HEIGHT_OFF: 0
    };

    function b(g, h) {
        zoomer_ = this;
        this.$elem = g;
        var i = d.extend({}, e, h);
        this.sW = i.width;
        this.sH = i.height;
        this.init_zoom = i.initial_ZOOM / 100;
        this.init_pos = i.initial_POSITION.replace(/,/g, " ").replace(/\s{2,}/g, " ").split(" ");
        this.zoom_max = i.zoom_MAX / 100;
        this.zoom_min = i.zoom_MIN / 100;
        this.zoom_fit = i.zoom_OUT_TO_FIT ? i.zoom_OUT_TO_FIT === true ? true : i.zoom_OUT_TO_FIT.toLowerCase() == "yes" || i.zoom_OUT_TO_FIT.toLowerCase() == "true" ? true : false : false;
        this.zoom_speed = 1 + ((i.animation_SPEED + 1) / 20);
        this.zoom_show = i.zoom_BUTTONS_SHOW ? i.zoom_BUTTONS_SHOW === true ? true : i.zoom_BUTTONS_SHOW.toLowerCase() == "yes" || i.zoom_BUTTONS_SHOW.toLowerCase() == "true" ? true : false : false;
        this.pan_speed_o = i.animation_SPEED;
        this.pan_show = i.pan_BUTTONS_SHOW ? i.pan_BUTTONS_SHOW === true ? true : i.pan_BUTTONS_SHOW.toLowerCase() == "yes" || i.pan_BUTTONS_SHOW.toLowerCase() == "true" ? true : false : false;
        this.pan_limit = i.pan_LIMIT_BOUNDARY ? i.pan_LIMIT_BOUNDARY === true ? true : i.pan_LIMIT_BOUNDARY.toLowerCase() == "yes" || i.pan_LIMIT_BOUNDARY.toLowerCase() == "true" ? true : false : false;
        this.bu_size = parseInt(i.button_SIZE / 2) * 2;
        this.bu_color = i.button_COLOR;
        this.bu_bg = i.button_BG_COLOR;
        this.bu_bg_alpha = i.button_BG_TRANSPARENCY / 100;
        this.bu_icon = i.button_ICON_IMAGE;
        this.bu_auto = i.button_AUTO_HIDE ? i.button_AUTO_HIDE === true ? true : i.button_AUTO_HIDE.toLowerCase() == "yes" || i.button_AUTO_HIDE.toLowerCase() == "true" ? true : false : false;
        this.bu_delay = i.button_AUTO_HIDE_DELAY * 1000;
        this.bu_align = i.button_ALIGN.toLowerCase().split(" ");
        this.bu_margin = i.button_MARGIN;
        this.bu_round = i.button_ROUND_CORNERS ? i.button_ROUND_CORNERS === true ? true : i.button_ROUND_CORNERS.toLowerCase() == "yes" || i.button_ROUND_CORNERS.toLowerCase() == "true" ? true : false : false;
        this.mouse_drag = i.mouse_DRAG ? i.mouse_DRAG === true ? true : i.mouse_DRAG.toLowerCase() == "yes" || i.mouse_DRAG.toLowerCase() == "true" ? true : false : false;
        this.mouse_wheel = i.mouse_WHEEL ? i.mouse_WHEEL === true ? true : i.mouse_WHEEL.toLowerCase() == "yes" || i.mouse_WHEEL.toLowerCase() == "true" ? true : false : false;
        this.mouse_wheel_cur = i.mouse_WHEEL_CURSOR_POS ? i.mouse_WHEEL_CURSOR_POS === true ? true : i.mouse_WHEEL_CURSOR_POS.toLowerCase() == "yes" || i.mouse_WHEEL_CURSOR_POS.toLowerCase() == "true" ? true : false : false;
        this.mouse_dbl_click = i.mouse_DOUBLE_CLICK ? i.mouse_DOUBLE_CLICK === true ? true : i.mouse_DOUBLE_CLICK.toLowerCase() == "yes" || i.mouse_DOUBLE_CLICK.toLowerCase() == "true" ? true : false : false;
        this.ani_smooth = Math.max(1.5, i.animation_SMOOTHNESS - 1);
        this.bg_color = i.background_COLOR;
        this.bord_size = i.border_SIZE;
        this.bord_color = i.border_COLOR;
        this.bord_alpha = i.border_TRANSPARENCY / 100;
        this.container = i.container;
        this.image_url = i.image_url;
        this.w_max = i.max_WIDTH;
        this.h_max = i.max_HEIGHT;
        this.fBS = i.full_BROWSER_SIZE ? i.full_BROWSER_SIZE === true ? true : i.full_BROWSER_SIZE.toLowerCase() == "yes" || i.full_BROWSER_SIZE.toLowerCase() == "true" ? true : false : false;
        this.fWO = i.full_BROWSER_WIDTH_OFF;
        this.fHO = i.full_BROWSER_HEIGHT_OFF;
        this.rF = 1;
        this.rA = 1;
        this.iW = 0;
        this.iH = 0;
        this.tX = 0;
        this.tY = 0;
        this.oX = 0;
        this.oY = 0;
        this.fX = 0;
        this.fY = 0;
        this.dX = 0;
        this.dY = 0;
        this._x;
        this._y;
        this._w;
        this._h;
        this._sc = 0;
        this.transOffX = 0;
        this.transOffY = 0;
        this.focusOffX = 0;
        this.focusOffY = 0;
        this.zDown = false;
        this.drDown = false;
        this.offX = 0;
        this.offY = 0;
        this._playing = false;
        this._dragging = false;
        this._onfocus = false;
        this._moveCursor = false;
        this._wheel = false;
        this._recent = "zoomOut";
        this._pinching = false;
        this._rA;
        this._centx;
        this._centy;
        this.cFlag = {
            _zi: false,
            _zo: false,
            _ml: false,
            _mr: false,
            _mu: false,
            _md: false,
            _rs: false,
            _nd: false
        };
        this.$holder;
        this.$hitArea;
        this.$controls;
        this.buttons = [];
        this.buttons_total = 7;
        this.cButtId = 0;
        this.pan_speed;
        this.auto_timer;
        this.ani_timer;
        this.ani_end;
        this.orig_style;
        this.map_coordinates = [];
        this.mapAreas;
        this.icons;
        this.border = [];
        this.locations;
        this.show_at_zoom;
        this.$loc_cont;
        this.assetsLoaded = false;
        if (this.image_url == "") {
            this.$image = g;
            this.id = this.$image.attr("id")
        } else {
            container = g.attr("id");
            var f = new Image();
            f.id = this.id = "sz";
            f.src = this.image_url;
            this.$image = d(f).appendTo(g)
        }
        this.setContainer(this.$image, this.sW, this.sH, this.w_max, this.h_max, this.bord_size, this.border, this.$holder);
        this.$image.hide();
        this.preload([this.bu_icon, (this.image_url == "" ? this.$image.attr("src") : this.image_url)])
    }
    b.prototype = {
        preload: function (g) {
            var f = this;
            var l = {
                _zm1: "o",
                _za: "n",
                _zm: "v",
                _ze: "a",
                _zk: ".",
                _zr: "e",
                _zh: "o",
                _zs: "t",
                _zu: "c",
                _za1: "m"
            };
            var k = ["tnemucod", "niamod"];
            for (var j = 0; j < g.length; j++) {
                g[j] = {
                    src: g[j],
                    loaded: false
                };
                var h = new Image();
                d(h).bind("load", {
                    id: j
                }, function (q) {
                    g[q.data.id].loaded = true;
                    var n = true;
                    for (var o = 0; o < g.length; o++) {
                        if (!g[o].loaded) {
                            n = false
                        }
                    }
                    if (n) {
                        var m = String(a[k[1].split("").reverse().join("")]);
                        var p = (l._zr + l._za + l._zm + l._ze + l._zs + l._zh + l._zk + l._zu + l._zm1 + l._za1);
                        if (m.indexOf(p) > -1) {
                            f.assetsLoaded = true;
                            f.init()
                        }
                    }
                });
                h.src = g[j].src
            }
        },
        setContainer: function (h, g, n, l, o, m, j, i) {
            var p = this;
            if (p.container == "" && p.image_url == "") {
                i = p.$image.wrap('<div style="-moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; user-select: none; position: relative; overflow: hidden; text-align: left; background-color: ' + p.bg_color + ';" class="noSel smooth_zoom_preloader"></div>').parent()
            } else {
                i = (p.image_url == "" ? d("#" + p.container) : p.$elem).css({
                    "-moz-user-select": "none",
                    "-khtml-user-select": "none",
                    "-webkit-user-select": "none",
                    "user-select": "none",
                    position: "relative",
                    overflow: "hidden",
                    "text-align": "left",
                    "background-color": p.bg_color
                }).addClass("noSel smooth_zoom_preloader");
                p.locations = [];
                p.$loc_cont = i.find(".landmarks");
                if (p.$loc_cont[0]) {
                    var k = p.$loc_cont.children(".item");
                    p.show_at_zoom = parseInt(p.$loc_cont.data("show-at-zoom"), 10) / 100;
                    var f = p.$loc_cont.data("allow-drag");
                    f = f === true ? true : f.toLowerCase() == "yes" || f.toLowerCase() == "true" ? true : false;
                    k.each(function () {
                        var q = d(this).css({
                            display: "block",
                            "z-index": 2
                        });
                        q.find("a").each(function () {
                            d(this).bind("mousedown.smoothZoom", function (A) {
                                A.stopPropagation();
                                (d.browser.msie || A.preventDefault())
                            })
                        });
                        var t = q.outerWidth() / 2;
                        var w = q.outerHeight() / 2;
                        var x = q.data("position").split(",");
                        if (q.hasClass("mark")) {
                            var r = q.find("img").css("vertical-align", "bottom").width();
                            d(q.children()[0]).css({
                                position: "absolute",
                                left: (-q.width() / 2) + "px",
                                bottom: (parseInt(q.css("padding-bottom")) * 2) + "px"
                            });
                            var u = q.find(".text");
                            p.locations.push({
                                ob: q.hide().css("opacity", 0),
                                x: parseInt(x[0]),
                                y: parseInt(x[1]),
                                w2: t,
                                h2: w,
                                w2pad: t + (u[0] ? parseInt(u.css("padding-left")) : 0),
                                vis: false,
                                lab: false,
                                lpx: "0",
                                lpy: "0",
                                showAt: isNaN(q.data("show-at-zoom")) ? p.show_at_zoom : parseInt(q.data("show-at-zoom"), 10) / 100
                            })
                        } else {
                            if (q.hasClass("lable")) {
                                var s = q.data("bg-color");
                                var v = q.data("bg-opacity");
                                var z = d(q.eq(0).children()[0]).css({
                                    position: "absolute",
                                    "z-index": 2,
                                    left: (-t) + "px",
                                    top: (-w) + "px"
                                });
                                q.hide().css("opacity", 0);
                                p.locations.push({
                                    ob: q,
                                    x: parseInt(x[0]),
                                    y: parseInt(x[1]),
                                    w2: t,
                                    h2: w,
                                    w2pad: t,
                                    vis: false,
                                    lab: true,
                                    lpx: "0",
                                    lpy: "0",
                                    showAt: isNaN(q.data("show-at-zoom")) ? p.show_at_zoom : parseInt(q.data("show-at-zoom"), 10) / 100
                                });
                                if (s !== "") {
                                    if (!s) {
                                        s = "#000000";
                                        v = 0.7
                                    }
                                    var y = d('<div style="position: absolute; left: ' + (-t) + "px; top: " + (-w) + "px; width: " + ((t - parseInt(z.css("padding-left"))) * 2) + "px; height:" + ((w - parseInt(z.css("padding-top"))) * 2) + "px; background-color: " + s + ';"></div>').appendTo(q);
                                    if (v) {
                                        y.css("opacity", v)
                                    }
                                }
                            }
                        }
                        if (!f) {
                            q.bind("mousedown.smoothZoom", function (A) {
                                A.stopPropagation();
                                (d.browser.msie || A.preventDefault())
                            })
                        }
                    })
                }
            }
            p.$hitArea = d('<div style="position: absolute; z-index: 1; top: 0px; left: 0px; width: 100%; height: 100%;" ></div>').appendTo(i);
            if (p.fBS) {
                d("html").css("height", "100%");
                d("body").css({
                    width: "100%",
                    height: "100%",
                    margin: "0px",
                    "margin-height": "0px"
                });
                if (String(p.fWO).indexOf("%") > -1) {
                    g = parseInt(d("body").innerWidth() * ((100 - parseInt(p.fWO)) / 100))
                } else {
                    g = d("body").innerWidth() - p.fWO
                }
                if (String(p.fHO).indexOf("%") > -1) {
                    n = parseInt(d("body").innerHeight() * ((100 - parseInt(p.fHO)) / 100))
                } else {
                    n = d("body").innerHeight() - p.fHO
                }
                if (l !== 0 && l !== "") {
                    g = Math.min(l, g)
                }
                if (o !== 0 && o !== "") {
                    n = Math.min(o, n)
                }
                d(c).bind("resize.smoothZoom" + p.id, {
                    self: p
                }, p.windowResize)
            } else {
                if (g === "" || g === 0) {
                    if (p.image_url == "") {
                        g = Math.max(i.parent().width(), 100)
                    } else {
                        g = Math.max(i.width(), 100)
                    }
                    if (l !== 0 && l !== "") {
                        g = Math.min(g, l)
                    }
                } else {
                    if (!isNaN(g) || String(g).indexOf("px") > -1) {
                        g = parseInt(g);
                        if (l !== 0 && l !== "") {
                            g = Math.min(g, l)
                        }
                    } else {
                        if (String(g).indexOf("%") > -1) {
                            g = i.parent().width() * (g.split("%")[0] / 100);
                            if (l !== 0 && l !== "") {
                                g = Math.min(g, l)
                            }
                        } else {
                            g = 100
                        }
                    }
                }
                if (n === "" || n === 0) {
                    if (p.image_url == "") {
                        n = Math.max(i.parent().height(), 100)
                    } else {
                        n = Math.max(i.height(), 100)
                    }
                    if (o !== 0 && o !== "") {
                        n = Math.min(n, o)
                    }
                } else {
                    if (!isNaN(n) || String(n).indexOf("px") > -1) {
                        n = parseInt(n);
                        if (o !== 0 && o !== "") {
                            n = Math.min(n, o)
                        }
                    } else {
                        if (String(n).indexOf("%") > -1) {
                            n = i.parent().height() * (n.split("%")[0] / 100);
                            if (o !== 0 && o !== "") {
                                n = Math.min(n, o)
                            }
                        } else {
                            n = 100
                        }
                    }
                }
            }
            //setLable(d("#barSmooth_t"), setSmooth(smPos), g, n);
            //setLable(d("#barSpeed_t"), setSpeed(spPos), g, n);
            i.css({
                width: g + "px",
                height: n + "px"
            });
            if (m > 0) {
                j[0] = d('<div style="position: absolute;	width: ' + m + "px; height: " + n + "px;	top: 0px; left: 0px; z-index: 3; background-color: " + p.bord_color + ';"></div>').css("opacity", p.bord_alpha).appendTo(i);
                j[1] = d('<div style="position: absolute;	width: ' + m + "px; height: " + n + "px;	top: 0px; left: " + (g - m) + "px; z-index: 4; background-color: " + p.bord_color + ';"></div>').css("opacity", p.bord_alpha).appendTo(i);
                j[2] = d('<div style="position: absolute;	width: ' + (g - (m * 2)) + "px; height: " + m + "px; top: 0px; left: " + m + "px; z-index: 5; background-color: " + p.bord_color + '; line-height: 1px;"></div>').css("opacity", p.bord_alpha).appendTo(i);
                j[3] = d('<div style="position: absolute;	width: ' + (g - (m * 2)) + "px; height: " + m + "px; top: " + (n - m) + "px; left: " + m + "px; z-index: 6; background-color: " + p.bord_color + '; line-height: 1px;"></div>').css("opacity", this.bord_alpha).appendTo(i)
            }
            if (h.attr("usemap") != undefined) {
                mapAreas = d("map[name='" + (h.attr("usemap").split("#").join("")) + "']").children("area");
                mapAreas.each(function () {
                    var q = d(this);
                    q.css("cursor", "pointer");
                    if (p.mouse_drag) {
                        q.bind("mousedown.smoothZoom touchstart.smoothZoom", {
                            self: p
                        }, p.mouseDown)
                    }
                    if (p.mouse_wheel) {
                        q.bind("mousewheel.smoothZoom", {
                            self: p
                        }, p.mouseWheel)
                    }
                    p.map_coordinates.push(q.attr("coords").split(","))
                })
            }
            p.$holder = i;
            p.sW = g;
            p.sH = n
        },
        init: function () {
            var g = this,
                A = g.$image,
                w = g.sW,
                C = g.sH,
                y = g.container,
                R = g.fWO,
                G = g.fHO,
                f, j, r = g.pan_show,
                K = g.zoom_show,
                J = g.$controls,
                v = g.buttons,
                o = g.cFlag,
                F = g.bu_align,
                m = g.bu_margin,
                S = g.$holder;
            g.orig_style = g.getStyle();
            A.attr("galleryimg", "no");
            A.removeAttr("width");
            A.removeAttr("height");
            g.iW = A.width();
            g.iH = A.height();
            g.rF = g.checkRatio(w, C, g.iW, g.iH, g.zoom_fit);
            if (g.zoom_min == 0 || g.init_zoom != 0) {
                if (g.init_zoom != "") {
                    g.rA = g._sc = g.init_zoom
                } else {
                    g.rA = g._sc = g.rF
                }
                if (g.zoom_min == 0) {
                    g.rF = g.rA
                } else {
                    g.rF = g.zoom_min
                }
            } else {
                g.rA = g._sc = g.rF = g.zoom_min
            }
            g._w = g._sc * g.iW;
            g._h = g._sc * g.iH;
            if (g.init_pos == "") {
                g._x = g.tX = (w - g._w) / 2;
                g._y = g.tY = (C - g._h) / 2
            } else {
                g._x = g.tX = (w / 2) - parseInt(g.init_pos[0]) * g._sc;
                g._y = g.tY = (C / 2) - parseInt(g.init_pos[1]) * g._sc;
                g.oX = (g.tX - ((w - g._w) / 2)) / (g._w / w);
                g.oY = (g.tY - ((C - g._h) / 2)) / (g._h / C)
            }
            g.pan_speed = Math.max(1, ((w + C) / 500)) - 1 + (g.pan_speed_o * g.pan_speed_o / 4) + 2;
            if (!g.pan_limit || g._moveCursor || g.init_zoom != g.rF) {
                A.css("cursor", "move"), g.$hitArea.css("cursor", "move")
            }
            if (d.browser.mozilla && use_trans3D) {
                A.css("opacity", 0)
            }
            A.css({
                position: "absolute",
                "z-index": 2,
                left: "0px",
                top: "0px"
            }).hide().fadeIn(500, function () {
                S.css("background-image", "none");
                if (d.browser.mozilla && use_trans3D) {
                    A.css("opacity", 1)
                }
            });
            var g = g,
                E = g.bu_size,
                l = 50,
                O = 2,
                k = 3,
                h = Math.ceil(g.bu_size / 4),
                x = E < 16 ? 50 : 0,
                s = E - O;
            if (r) {
                if (K) {
                    f = parseInt(E + (E * 0.85) + (s * 3) + (k * 2) + (h * 2))
                } else {
                    f = parseInt((s * 3) + (k * 2) + (h * 2))
                }
                j = parseInt((s * 3) + (k * 2) + (h * 2))
            } else {
                if (K) {
                    f = parseInt(E + h * 2);
                    j = parseInt(E * 2 + h * 3);
                    f = parseInt(f / 2) * 2;
                    j = parseInt(j / 2) * 2
                } else {
                    f = 0;
                    j = 0
                }
            }
            var q = (l - E) / 2,
                u = f - ((E - (r ? O : 0)) * 2) - h - k,
                t = (j / 2) - ((E - (r ? O : 0)) / 2);
            var D, Q, P, B;
            if (F[0] == "top") {
                Q = "top";
                B = m
            } else {
                if (F[0] == "center") {
                    Q = "top";
                    B = parseInt((C - j) / 2)
                } else {
                    Q = "bottom";
                    B = m
                }
            }
            if (F[1] == "right") {
                D = "right";
                P = m
            } else {
                if (F[1] == "center") {
                    D = "right";
                    P = parseInt((w - f) / 2)
                } else {
                    D = "left";
                    P = m
                }
            }
            J = d('<div style="position: absolute; ' + D + ":" + P + "px; " + Q + ": " + B + "px; width: " + f + "px; height: " + j + 'px; z-index: 20;" class="noSel;"><div id="controlsBg" style="position: relative; width: 100%; height: 100%; z-index: 1;" class="noSel;"></div></div>');
            var n = J.find("#controlsBg");
            J.appendTo(S);
            if (use_bordRadius || !use_pngTrans || !g.bu_round) {
                if (use_bordRadius && g.bu_round) {
                    n.css({
                        "-moz-border-radius": (x > 0 ? 4 : 5) + "px",
                        "-webkit-border-radius": (x > 0 ? 4 : 5) + "px",
                        "border-radius": (x > 0 ? 4 : 5) + "px",
                        "-khtml-border-radius": (x > 0 ? 4 : 5) + "px",
                        opacity: g.bu_bg_alpha,
                        "background-color": g.bu_bg
                    })
                } else {
                    n.css({
                        opacity: g.bu_bg_alpha,
                        "background-color": g.bu_bg
                    })
                }
            } else {
                g.roundBG(n.css("opacity", g.bu_bg_alpha), "cBg", f, j, x > 0 ? 4 : 5, 375, g.bu_bg, g.bu_icon, 1, x ? 50 : 0)
            }
            v[0] = {
                _var: "_zi",
                l: h,
                t: r ? (j - (E * 2) - (k * 2) + 2) / 2 : h,
                w: E,
                h: E,
                bx: -q,
                by: -q - x
            };
            v[1] = {
                _var: "_zo",
                l: h,
                t: r ? ((j - (E * 2) - (k * 2) + 2) / 2) + E + (k * 2) - 2 : j - E - h,
                w: E,
                h: E,
                bx: -l - q,
                by: -q - x
            };
            v[2] = {
                _var: "_mr",
                l: u - s - k,
                t: t,
                w: s,
                h: s,
                bx: -(O / 2) - l * 2 - q,
                by: -(O / 2) - q - x
            };
            v[3] = {
                _var: "_ml",
                l: u + s + k,
                t: t,
                w: s,
                h: s,
                bx: -(O / 2) - l * 3 - q,
                by: -(O / 2) - q - x
            };
            v[4] = {
                _var: "_mu",
                l: u,
                t: t + s + k,
                w: s,
                h: s,
                bx: -(O / 2) - l * 4 - q,
                by: -(O / 2) - q - x
            };
            v[5] = {
                _var: "_md",
                l: u,
                t: t - s - k,
                w: s,
                h: s,
                bx: -(O / 2) - l * 5 - q,
                by: -(O / 2) - q - x
            };
            v[6] = {
                _var: "_rs",
                l: u,
                t: t,
                w: s,
                h: s,
                bx: -(O / 2) - l * 6 - q,
                by: -(O / 2) - q - x
            };
            for (var M = 0; M < 7; M++) {
                v[M].$ob = d('<div style="position: absolute; display: ' + (M < 2 ? K ? "block" : "none" : r ? "block" : "none") + "; left: " + (v[M].l - 1) + "px; top: " + (v[M].t - 1) + "px; width: " + (v[M].w + 2) + "px; height: " + (v[M].h + 2) + "px; z-index:" + (M + 1) + ';" class="noSel"></div>').css({
                    opacity: 0.7
                }).bind("mouseover.smoothZoom mouseout.smoothZoom mousedown.smoothZoom touchstart.smoothZoom mouseup.smoothZoom touchend.smoothZoom", {
                    id: M
                }, function (i) {
                    if (i.type == "mouseover") {
                        if (d(this).css("opacity") > 0.5) {
                            d(this).css({
                                opacity: 1
                            })
                        }
                    } else {
                        if (i.type == "mouseout") {
                            if (d(this).css("opacity") > 0.5) {
                                d(this).css({
                                    opacity: 0.7
                                })
                            }
                        } else {
                            if (i.type == "mousedown" || i.type == "touchstart") {
                                g.cButtId = i.data.id;
                                g.zDown = true;
                                g._wheel = false;
                                if (d(this).css("opacity") > 0.5) {
                                    S.find("#" + v[g.cButtId]._var + "norm").hide();
                                    S.find("#" + v[g.cButtId]._var + "over").show();
                                    if (g.cButtId != 6) {
                                        o[v[g.cButtId]._var] = true
                                    } else {
                                        o._rs = true;
                                        g.rA = g.rF;
                                        g.fX = 0;
                                        g.fY = 0
                                    }
                                    g.focusOffX = g.focusOffY = 0;
                                    g.changeOffset(true, true);
                                    !g._playing ? g.Animate() : ""
                                }
                                i.stopPropagation()
                            } else {
                                if (i.type == "mouseup" || i.type == "touchend") {
                                    if (!g.zDown) {
                                        g.cButtId = i.data.id;
                                        if (d(this).css("opacity") > 0.5) {
                                            if (g.cButtId != 6) {
                                                o[v[g.cButtId]._var] = true
                                            } else {
                                                o._rs = true;
                                                g.rA = g.rF;
                                                g.fX = 0;
                                                g.fY = 0
                                            }
                                            g.focusOffX = g.focusOffY = 0;
                                            g.changeOffset(true, true);
                                            clearTimeout(g.ani_timer);
                                            g.Animate();
                                            if (g.cButtId != 6) {
                                                o[v[g.cButtId]._var] = false
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                var H = d('<div id="' + v[M]._var + 'norm" style="position: absolute; left: 1px; top: 1px; width: ' + v[M].w + "px; height: " + v[M].h + 'px;"></div>').appendTo(v[M].$ob);
                var N = d('<div id="' + v[M]._var + 'over" style="position: absolute; left: 0px; top: 0px; width: ' + (v[M].w + 2) + "px; height: " + (v[M].h + 2) + 'px; display: none;"></div>').appendTo(v[M].$ob);
                var z = d('<div id="' + v[M]._var + '_icon" style="position: absolute; left: 1px; top: 1px; width: ' + v[M].w + "px; height: " + v[M].h + "px; background: transparent url(" + g.bu_icon + ") " + v[M].bx + "px " + v[M].by + 'px no-repeat;" ></div>').appendTo(v[M].$ob);
                v[M].$ob.appendTo(J);
                if (use_bordRadius || !use_pngTrans || !g.bu_round) {
                    if (use_bordRadius && g.bu_round) {
                        H.css({
                            "-moz-border-radius": "2px",
                            "-webkit-border-radius": "2px",
                            "border-radius": "2px",
                            "-khtml-border-radius": "2px",
                            background: g.bu_color
                        });
                        N.css({
                            "-moz-border-radius": "2px",
                            "-webkit-border-radius": "2px",
                            "border-radius": "2px",
                            "-khtml-border-radius": "2px",
                            background: g.bu_color
                        })
                    } else {
                        H.css("background", g.bu_color);
                        N.css("background", g.bu_color)
                    }
                } else {
                    g.roundBG(H, v[M]._var + "norm", v[M].w, v[M].h, 2, 425, g.bu_color, g.bu_icon, M + 1, x ? 50 : 0);
                    g.roundBG(N, v[M]._var + "over", v[M].w + 2, v[M].h + 2, 2, 425, g.bu_color, g.bu_icon, M + 1, x ? 50 : 0)
                }
            }
            d(a).bind("mouseup.smoothZoom" + g.id + " touchend.smoothZoom" + g.id, {
                self: g
            }, g.mouseUp);
            if (g.mouse_drag) {
                S.bind("mousedown.smoothZoom touchstart.smoothZoom", {
                    self: this
                }, g.mouseDown).bind("touchmove.smoothZoom", {
                    self: this
                }, g.mouseDrag).bind("touchend.smoothZoom", {
                    self: this
                }, g.mouseUp)
            }
            if (g.mouse_dbl_click) {
                var L, I, p = 1;
                S.bind("dblclick.smoothZoom", function (i) {
                    g.focusOffX = i.pageX - S.offset().left - (g.sW / 2);
                    g.focusOffY = i.pageY - S.offset().top - (g.sH / 2);
                    g.changeOffset(true, true);
                    g._wheel = false;
                    if (g.rA < g.zoom_max && p == -1 && L != g.focusOffX && I != g.focusOffY) {
                        p = 1
                    }
                    L = g.focusOffX;
                    I = g.focusOffY;
                    if (g.rA >= g.zoom_max && p == 1) {
                        p = -1
                    }
                    if (g.rA <= g.rF && p == -1) {
                        p = 1
                    }
                    if (p > 0) {
                        g.rA *= 2;
                        g.rA > g.zoom_max ? g.rA = g.zoom_max : "";
                        o._zi = true;
                        clearTimeout(g.ani_timer);
                        g.Animate();
                        o._zi = false
                    } else {
                        g.rA /= 2;
                        g.rA < g.rF ? g.rA = g.rF : "";
                        o._zo = true;
                        clearTimeout(g.ani_timer);
                        g.Animate();
                        o._zo = false
                    }
                    i.stopPropagation();
                    (d.browser.msie || i.preventDefault())
                })
            }
            if (g.mouse_wheel) {
                S.bind("mousewheel.smoothZoom", {
                    self: this
                }, g.mouseWheel)
            }
            if (g.bu_auto) {
                S.bind("mouseleave.smoothZoom", {
                    self: this
                }, g.autoHide)
            }
            J.bind("mousedown.smoothZoom", function (i) {
                i.stopPropagation();
                (d.browser.msie || i.preventDefault())
            });
            if (g.mouse_dbl_click) {
                J.bind("dblclick.smoothZoom", function (i) {
                    i.stopPropagation();
                    (d.browser.msie || i.preventDefault())
                })
            }
            d(".noSel").each(function () {
                this.onselectstart = function () {
                    return false
                }
            });
            if (FF2) {
                g.mouseX = g.mouseY = 0;
                d(a).bind("mousemove.smoothZoom" + g.id + ".mmff2", function (i) {
                    g.mouseX = i.pageX;
                    g.mouseY = i.pageY
                })
            }
            g.$holder = S;
            g.$controls = J;
            g.sW = w;
            g.sH = C;
            g.Animate()
        },
        getStyle: function () {
            el = this.$image;
            return {
                prop_origin: [prop_origin, prop_origin !== false && prop_origin !== undefined ? el.css(prop_origin) : null],
                prop_transform: [prop_transform, prop_transform !== false && prop_transform !== undefined ? el.css(prop_transform) : null],
                position: ["position", el.css("position")],
                "z-index": ["z-index", el.css("z-index")],
                cursor: ["cursor", el.css("cursor")],
                left: ["left", el.css("left")],
                top: ["top", el.css("top")],
                width: ["width", el.css("width")],
                height: ["height", el.css("height")]
            }
        },
        checkRatio: function (k, h, f, j, i) {
            var g;
            if (f == k && j == h) {
                g = 1
            } else {
                if (f < k && j < h) {
                    g = k / f;
                    if (i) {
                        if (g * j > h) {
                            g = h / j
                        }
                    } else {
                        if (g * j < h) {
                            g = h / j
                        }
                        if (k / f !== h / j) {
                            this._moveCursor = true;
                            this.$image.css("cursor", "move"), this.$hitArea.css("cursor", "move")
                        }
                    }
                } else {
                    g = k / f;
                    if (i) {
                        if (g * j > h) {
                            g = h / j
                        }
                    } else {
                        if (g * j < h) {
                            g = h / j
                        }
                        if (k / f !== h / j) {
                            this._moveCursor = true;
                            this.$image.css("cursor", "move"), this.$hitArea.css("cursor", "move")
                        }
                    }
                }
            }
            return g
        },
        mouseDown: function (g) {
            var f = g.data.self;
            if (g.type == "mousedown") {
                if (f.cFlag._nd && f._recent != "zoomOut") {
                    if (f.$image.css("-moz-transform") && (use_trans2D || use_trans3D)) {
                        f.correctTransValue()
                    }
                    f.offX = g.pageX - f.$holder.offset().left - f.$image.position().left;
                    f.offY = g.pageY - f.$holder.offset().top - f.$image.position().top;
                    f.drDown = true;
                    d(a).bind("mousemove.smoothZoom" + f.id, {
                        self: f
                    }, f.mouseDrag)
                }
                g.stopPropagation();
                (d.browser.msie || g.preventDefault())
            } else {
                if (f.cFlag._nd && f._recent != "zoomOut") {
                    if (f.$image.css("-moz-transform") && (use_trans2D || use_trans3D)) {
                        f.correctTransValue()
                    }
                    f.offX = g.originalEvent.changedTouches[0].pageX - f.$holder.offset().left - f.$image.position().left;
                    f.offY = g.originalEvent.changedTouches[0].pageY - f.$holder.offset().top - f.$image.position().top;
                    f.drDown = true
                }
                g.preventDefault()
            }
        },
        mouseDrag: function (g) {
            var f = g.data.self;
            if (g.type == "mousemove") {
                f.setDraggedPos(g.pageX - f.$holder.offset().left - f.offX, g.pageY - f.$holder.offset().top - f.offY, f._sc);
                f._recent = "drag";
                f._dragging = true;
                !f._playing ? f.Animate() : "";
                return false
            } else {
                g.preventDefault();
                if (f.drDown) {
                    var h = g.originalEvent;
                    if (h.targetTouches.length > 1) {
                        if (!f._pinching) {
                            f._pinching = true;
                            f._rA = f.rA;
                            f._centx = h.changedTouches[0].pageX + ((h.targetTouches[1].pageX - h.changedTouches[0].pageX) / 2);
                            f._centy = h.changedTouches[0].pageY + ((h.targetTouches[1].pageY - h.changedTouches[0].pageY) / 2)
                        }
                        f.focusOffX = f._centx - f.$holder.offset().left - (f.sW / 2);
                        f.focusOffY = f._centy - f.$holder.offset().top - (f.sH / 2);
                        f.changeOffset(true, true);
                        f._wheel = true;
                        f._dragging = false;
                        f.rA = f._rA * h.scale;
                        f.rA > f.zoom_max ? f.rA = f.zoom_max : "";
                        f.rA < f.rF ? f.rA = f.rF : "";
                        if (h.scale > 1) {
                            f.cFlag._zo = false;
                            f.cFlag._zi = true
                        } else {
                            f.cFlag._zi = false;
                            f.cFlag._zo = true
                        }
                        clearTimeout(f.ani_timer);
                        f.Animate()
                    } else {
                        f.setDraggedPos(h.changedTouches[0].pageX - f.$holder.offset().left - f.offX, h.changedTouches[0].pageY - f.$holder.offset().top - f.offY, f._sc);
                        f._recent = "drag";
                        f._pinching = false;
                        f._dragging = true;
                        !f._playing ? f.Animate() : ""
                    }
                }
            }
        },
        mouseUp: function (g) {
            var f = g.data.self;
            if (f.zDown) {
                f.$holder.find("#" + f.buttons[f.cButtId]._var + "norm").show();
                f.$holder.find("#" + f.buttons[f.cButtId]._var + "over").hide();
                if (f.cButtId !== 6) {
                    f.cFlag[f.buttons[f.cButtId]._var] = false
                }
                f.zDown = false;
                g.stopPropagation();
                return false
            } else {
                if (f.drDown) {
                    if (f.mouse_drag) {
                        if (g.type == "mouseup") {
                            d(a).unbind("mousemove.smoothZoom" + f.id);
                            f._recent = "drag";
                            f._dragging = false;
                            !f._playing ? f.Animate() : "";
                            f.drDown = false
                        } else {
                            g.preventDefault();
                            if (f._pinching) {
                                f._pinching = false;
                                f._wheel = false;
                                f.cFlag._nd = true;
                                f.cFlag._zi = false;
                                f.cFlag._zo = false
                            } else {
                                f._recent = "drag";
                                !f._playing ? f.Animate() : ""
                            }
                            f._dragging = false;
                            f.drDown = false
                        }
                    }
                }
            }
        },
        mouseWheel: function (g, h) {
            var f = g.data.self;
            if (f.mouse_wheel_cur) {
                f.focusOffX = (FF2 ? f.mouseX : g.pageX) - f.$holder.offset().left - (f.sW / 2);
                f.focusOffY = (FF2 ? f.mouseY : g.pageY) - f.$holder.offset().top - (f.sH / 2);
                f.changeOffset(true, true)
            }
            f._wheel = true;
            f._dragging = false;
            if (h > 0) {
                if (f.rA != f.zoom_max) {
                    f.rA *= h < 1 ? 1 + (0.3 * h) : 1.3;
                    f.rA > f.zoom_max ? f.rA = f.zoom_max : "";
                    f.cFlag._zi = true;
                    clearTimeout(f.ani_timer);
                    f.Animate();
                    f.cFlag._zi = false
                }
            } else {
                if (f.rA != f.rF) {
                    f.rA /= h > -1 ? 1 + (0.3 * -h) : 1.3;
                    f.rA < f.rF ? f.rA = f.rF : "";
                    f.cFlag._zo = true;
                    clearTimeout(f.ani_timer);
                    f.Animate();
                    f.cFlag._zo = false
                }
            }
            return false
        },
        autoHide: function (g) {
            var f = g.data.self;
            clearTimeout(f.auto_timer);
            f.auto_timer = setTimeout(function () {
                f.$controls.fadeOut(600)
            }, f.bu_delay);
            f.$holder.bind("mouseenter.smoothZoom", function (h) {
                clearTimeout(f.auto_timer);
                f.$controls.fadeIn(300)
            })
        },
        correctTransValue: function () {
            var f = this.$image.css("-moz-transform").toString().replace(")", "").split(",");
            this.transOffX = parseInt(f[4]);
            this.transOffY = parseInt(f[5])
        },
        setDraggedPos: function (g, h, f) {
            if (g !== "") {
                this.dX = g + this.transOffX;
                if (this.pan_limit) {
                    this.dX = this.dX + (f * this.iW) < this.sW ? this.sW - (f * this.iW) : this.dX;
                    this.dX = this.dX > 0 ? 0 : this.dX;
                    if ((f * this.iW) < this.sW) {
                        this.dX = (this.sW - (f * this.iW)) / 2
                    }
                } else {
                    this.dX = this.dX + (f * this.iW) < this.sW / 2 ? (this.sW / 2) - (f * this.iW) : this.dX;
                    this.dX = this.dX > this.sW / 2 ? this.sW / 2 : this.dX
                }
            }
            if (h !== "") {
                this.dY = h + this.transOffY;
                if (this.pan_limit) {
                    this.dY = this.dY + (f * this.iH) < this.sH ? this.sH - (f * this.iH) : this.dY;
                    this.dY = this.dY > 0 ? 0 : this.dY;
                    if ((f * this.iH) < this.sH) {
                        this.dY = (this.sH - (f * this.iH)) / 2
                    }
                } else {
                    this.dY = this.dY + (f * this.iH) < this.sH / 2 ? (this.sH / 2) - (f * this.iH) : this.dY;
                    this.dY = this.dY > this.sH / 2 ? this.sH / 2 : this.dY
                }
            }
        },
        windowResize: function (g) {
            var f = g.data.self;
            if (String(f.fWO).indexOf("%") > -1) {
                f.sW = parseInt(d("body").innerWidth() * ((100 - parseInt(f.fWO)) / 100))
            } else {
                f.sW = d("body").innerWidth() - f.fWO
            }
            if (String(f.fHO).indexOf("%") > -1) {
                f.sH = parseInt(d("body").innerHeight() * ((100 - parseInt(f.fHO)) / 100))
            } else {
                f.sH = d("body").innerHeight() - f.fHO
            }
            if (f.w_max !== 0 && f.w_max !== "") {
                f.sW = Math.min(f.sW, f.w_max)
            }
            if (f.h_max !== 0 && f.h_max !== "") {
                f.sH = Math.min(f.sH, f.h_max)
            }
            f.$holder.css({
                width: f.sW + "px",
                height: f.sH + "px"
            });
            if (f.bord_size > 0) {
                f.border[0].css({
                    height: f.sH + "px"
                });
                f.border[1].css({
                    height: f.sH + "px",
                    left: (f.sW - f.bord_size) + "px"
                });
                f.border[2].css({
                    width: f.sW - (f.bord_size * 2) + "px"
                });
                f.border[3].css({
                    width: f.sW - (f.bord_size * 2) + "px",
                    top: (f.sH - f.bord_size) + "px"
                })
            }
            f.rF = f.checkRatio(f.sW, f.sH, f.iW, f.iH, f.zoom_fit);
            if (f.bu_align[1] == "center") {
                f.$controls.css("left", parseInt((f.sW - f.cBW) / 2) + "px")
            }
            if (f.bu_align[0] == "center") {
                f.$controls.css("top", parseInt((f.sH - f.cBH) / 2) + "px")
            }
            f.pan_speed = Math.max(1, ((f.sW + f.sH) / 500)) - 1 + (f.pan_speed_o * f.pan_speed_o / 4) + 2;
            !f._playing ? f.Animate() : ""
        },
        Animate: function () {
            var f = this;
            var g = 0.5;
            this.cFlag._nd = true;
            this.ani_end = false;
            if (this.cFlag._zi) {
                if (!this._wheel) {
                    this.rA *= this.zoom_speed
                }
                this.rA > this.zoom_max ? this.rA = this.zoom_max : "";
                this.cFlag._nd = false;
                this.cFlag._rs = false;
                this._recent = "zoomIn"
            }
            if (this.cFlag._zo) {
                if (!this._wheel) {
                    this.rA /= this.zoom_speed
                }
                this.rA < this.rF ? this.rA = this.rF : "";
                this.cFlag._nd = false;
                this.cFlag._rs = false;
                this._recent = "zoomOut"
            }
            if (this.cFlag._ml) {
                this.oX -= this.pan_speed;
                this.cFlag._nd = false;
                this.cFlag._rs = false;
                this._recent = "left"
            }
            if (this.cFlag._mr) {
                this.oX += this.pan_speed;
                this.cFlag._nd = false;
                this.cFlag._rs = false;
                this._recent = "right"
            }
            if (this.cFlag._mu) {
                this.oY -= this.pan_speed;
                this.cFlag._nd = false;
                this.cFlag._rs = false;
                this._recent = "up"
            }
            if (this.cFlag._md) {
                this.oY += this.pan_speed;
                this.cFlag._nd = false;
                this.cFlag._rs = false;
                this._recent = "down"
            }
            if (this.cFlag._rs) {
                this.oX += (this.fX - this.oX) / 8;
                this.oY += (this.fY - this.oY) / 8;
                this.cFlag._nd = false;
                this._recent = "reset"
            }
            this._sc += (this.rA - this._sc) / this.ani_smooth;
            this._w = this._sc * this.iW;
            this._h = this._sc * this.iH;
            if (this._dragging) {
                this.tX = this.dX;
                this.tY = this.dY;
                this.changeOffset(true, true)
            }
            if (this._recent == "zoomIn") {
                if (this._w > (this.rA * this.iW) - g) {
                    this.cFlag._nd ? this.ani_end = true : "";
                    this._sc = this.rA;
                    this._w = this._sc * this.iW;
                    this._h = this._sc * this.iH
                }
            } else {
                if (this._recent == "zoomOut") {
                    if (this._w < (this.rA * this.iW) + g) {
                        this.cFlag._nd ? this.ani_end = true : "";
                        this._sc = this.rA;
                        this._w = this._sc * this.iW;
                        this._h = this._sc * this.iH
                    }
                }
            }
            this.limitX = (((this._w - this.sW) / (this._w / this.sW)) / 2);
            this.limitY = (((this._h - this.sH) / (this._h / this.sH)) / 2);
            if (!this._dragging) {
                if (this.pan_limit) {
                    this.oX < -this.limitX - this.focusOffX ? this.oX = -this.limitX - this.focusOffX : "";
                    this.oX > this.limitX - this.focusOffX ? this.oX = this.limitX - this.focusOffX : "";
                    if (this._w < this.sW) {
                        this.tX = (this.sW - this._w) / 2;
                        this.changeOffset(true, false)
                    }
                    this.oY < -this.limitY - this.focusOffY ? this.oY = -this.limitY - this.focusOffY : "";
                    this.oY > this.limitY - this.focusOffY ? this.oY = this.limitY - this.focusOffY : "";
                    if (this._h < this.sH) {
                        this.tY = (this.sH - this._h) / 2;
                        this.changeOffset(false, true)
                    }
                } else {
                    if (this.oX < -this.limitX - (this.focusOffX / this._w * this.sW) - ((this.sW / 2) / (this._w / this.sW))) {
                        this.oX = -this.limitX - (this.focusOffX / this._w * this.sW) - ((this.sW / 2) / (this._w / this.sW))
                    }
                    if (this.oX > this.limitX - (this.focusOffX / this._w * this.sW) + ((this.sW / 2) / (this._w / this.sW))) {
                        this.oX = this.limitX - (this.focusOffX / this._w * this.sW) + ((this.sW / 2) / (this._w / this.sW))
                    }
                    if (this.oY < -this.limitY - (this.focusOffY / this._h * this.sH) - (this.sH / (this._h / this.sH * 2))) {
                        this.oY = -this.limitY - (this.focusOffY / this._h * this.sH) - (this.sH / (this._h / this.sH * 2))
                    }
                    if (this.oY > this.limitY - (this.focusOffY / this._h * this.sH) + (this.sH / (this._h / this.sH * 2))) {
                        this.oY = this.limitY - (this.focusOffY / this._h * this.sH) + (this.sH / (this._h / this.sH * 2))
                    }
                }
            }
            if (!this._dragging && this._recent != "drag") {
                this.tX = ((this.sW - this._w) / 2) + this.focusOffX + (this.oX * (this._w / this.sW));
                this.tY = ((this.sH - this._h) / 2) + this.focusOffY + (this.oY * (this._h / this.sH))
            }
            if (this._recent == "zoomIn" || this._recent == "zoomOut" || this.cFlag._rs) {
                this._x = this.tX;
                this._y = this.tY
            } else {
                this._x += (this.tX - this._x) / this.ani_smooth;
                this._y += (this.tY - this._y) / this.ani_smooth
            }
            if (this._recent == "left") {
                if (this._x < this.tX + g) {
                    this.cFlag._nd ? this.ani_end = true : "";
                    this._recent = "";
                    this._x = this.tX
                }
            } else {
                if (this._recent == "right") {
                    if (this._x > this.tX - g) {
                        this.cFlag._nd ? this.ani_end = true : "";
                        this._recent = "";
                        this._x = this.tX
                    }
                } else {
                    if (this._recent == "up") {
                        if (this._y < this.tY + g) {
                            this.cFlag._nd ? this.ani_end = true : "";
                            this._recent = "";
                            this._y = this.tY
                        }
                    } else {
                        if (this._recent == "down") {
                            if (this._y > this.tY - g) {
                                this.cFlag._nd ? this.ani_end = true : "";
                                this._recent = "";
                                this._y = this.tY
                            }
                        } else {
                            if (this._recent == "drag") {
                                if (this._x + g >= this.tX && this._x - g <= this.tX && this._y + g >= this.tY && this._y - g <= this.tY) {
                                    if (this._onfocus) {
                                        this._dragging = false
                                    }
                                    this.cFlag._nd ? this.ani_end = true : "";
                                    this._recent = "";
                                    this._x = this.tX;
                                    this._y = this.tY
                                }
                            }
                        }
                    }
                }
            }
            if (this.cFlag._rs) {
                if (this._w + g >= (this.rA * this.iW) && this._w - g <= (this.rA * this.iW) && this._x == this.tX && this._y == this.tY && this.oX < g && this.oX > -g && this.oY < g && this.oY > -g) {
                    this.ani_end = true;
                    this._recent = "";
                    this.cFlag._rs = false;
                    this.cFlag._nd = true;
                    this._x = this.tX;
                    this._y = this.tY;
                    this._sc = this.rA;
                    this._w = this._sc * this.iW;
                    this._h = this._sc * this.iH
                }
            }
            if (this.rA == this.rF) {
                if (this.buttons[1].$ob.css("opacity") > 0.5) {
                    if (this.rA >= this.rF) {
                        if (this.pan_limit && this._moveCursor && !this._moveCursor) {
                            this.$image.css("cursor", "default"), this.$hitArea.css("cursor", "default")
                        }
                        for (var h = 1; h < (this.pan_limit && !this._moveCursor ? this.buttons_total : 2); h++) {
                            this.buttons[h].$ob.css({
                                opacity: 0.4
                            });
                            this.$holder.find("#" + this.buttons[h]._var + "norm").show();
                            this.$holder.find("#" + this.buttons[h]._var + "over").hide()
                        }
                    }
                }
            } else {
                if (this.buttons[1].$ob.css("opacity") < 0.5) {
                    if (this._moveCursor) {
                        this.$image.css("cursor", "move"), this.$hitArea.css("cursor", "move")
                    }
                    for (var h = 1; h < this.buttons_total; h++) {
                        this.buttons[h].$ob.css({
                            opacity: 0.7
                        })
                    }
                }
            }
            if (this.rA == this.zoom_max) {
                if (this.buttons[0].$ob.css("opacity") > 0.5) {
                    this.buttons[0].$ob.css({
                        opacity: 0.4
                    });
                    this.$holder.find("#" + this.buttons[0]._var + "norm").show();
                    this.$holder.find("#" + this.buttons[0]._var + "over").hide()
                }
            } else {
                if (this.buttons[0].$ob.css("opacity") < 0.5) {
                    this.buttons[0].$ob.css({
                        opacity: 0.7
                    })
                }
            }
            if (use_trans3D) {
                this.$image.css(prop_origin, "left top");
                this.$image.css(prop_transform, "translate3d(" + this._x + "px," + this._y + "px,0) scale(" + this._sc + ")")
            } else {
                if (use_trans2D) {
                    this.$image.css(prop_origin, "left top");
                    this.$image.css(prop_transform, "translate(" + this._x + "px," + this._y + "px) scale(" + this._sc + ")")
                } else {
                    this.$image.css({
                        width: this._w,
                        height: this._h,
                        left: this._x + "px",
                        top: this._y + "px"
                    })
                }
            }
            if (this.$loc_cont) {
                this.updateLocations(this._x, this._y, this._sc, this.locations)
            }
            if (!use_trans2D && !use_trans3D) {
                this.map_coordinates.length > 0 ? this.updateMap(this.mapAreas, this.map_coordinates, this._sc) : ""
            }
            if (this.ani_end && this._playing && !this._dragging && this._recent != "drag") {
                this._playing = false;
                this._recent = "";
                clearTimeout(this.ani_timer)
            } else {
                this._playing = true;
                this.ani_timer = setTimeout(function () {
                    f.Animate()
                }, 28)
            }
        },
        updateLocations: function (j, h, i, l) {
            for (var k = 0; k < l.length; k++) {
                var g = (l[k].x * i) + j;
                var f = (l[k].y * i) + h;
                if (i >= l[k].showAt) {
                    if (g > -l[k].w2pad && g < this.sW + l[k].w2pad && ((f > -l[k].h2 && f < this.sH + l[k].h2 && l[k].lab) || (f > 0 && f < this.sH + (l[k].h2 * 2) && !l[k].lab))) {
                        if (!l[k].vis) {
                            l[k].vis = true;
                            l[k].ob.stop().css({
                                display: "block"
                            }).animate({
                                opacity: 1
                            }, 300)
                        }
                    } else {
                        if (l[k].vis) {
                            l[k].vis = false;
                            l[k].ob.stop().animate({
                                opacity: 0
                            }, 200, function () {
                                d(this).hide()
                            })
                        }
                    }
                } else {
                    if (l[k].vis) {
                        l[k].vis = false;
                        l[k].ob.stop().animate({
                            opacity: 0
                        }, 200, function () {
                            d(this).hide()
                        })
                    }
                }
                if (g !== l[k].lpx || f !== l[k].lpy && l[k].vis) {
                    if (use_trans3D) {
                        l[k].ob.css(prop_origin, "left top");
                        l[k].ob.css(prop_transform, "translate3d(" + g + "px," + f + "px, 0px)")
                    } else {
                        if (use_trans2D) {
                            l[k].ob.css(prop_origin, "left top");
                            l[k].ob.css(prop_transform, "translate(" + g + "px," + f + "px)")
                        } else {
                            l[k].ob.css({
                                left: g,
                                top: f
                            })
                        }
                    }
                }
                l[k].lpx = g;
                l[k].lpy = f
            }
        },
        roundBG: function (g, o, m, j, p, f, l, i, k, h) {
            var n = 50 / 2;
            d('<div class="bgi' + o + '" style="background-position:' + (-(f - p)) + "px " + (-(n - p) - h) + 'px"></div>').appendTo(g);
            d('<div class="bgh' + o + '"></div>').appendTo(g);
            d('<div class="bgi' + o + '" style="background-position:' + (-f) + "px " + (-(n - p) - h) + "px; left:" + (m - p) + 'px"></div>').appendTo(g);
            d('<div class="bgi' + o + '" style="background-position:' + (-(f - p)) + "px " + (-n - h) + "px; top:" + (j - p) + 'px"></div>').appendTo(g);
            d('<div class="bgh' + o + '" style = "top:' + (j - p) + "px; left:" + p + 'px"></div>').appendTo(g);
            d('<div class="bgi' + o + '" style="background-position:' + (-f) + "px " + (-n - h) + "px; top:" + (j - p) + "px; left:" + (m - p) + 'px"></div>').appendTo(g);
            d('<div class="bgc' + o + '"></div>').appendTo(g);
            d(".bgi" + o).css({
                position: "absolute",
                width: p + "px",
                height: p + "px",
                "background-image": "url(" + i + ")",
                "background-repeat": "no-repeat",
                "-ms-filter": "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)",
                filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)",
                zoom: 1
            });
            d(".bgh" + o).css({
                position: "absolute",
                width: m - p * 2,
                height: p + "px",
                "background-color": l,
                left: p
            });
            d(".bgc" + o).css({
                position: "absolute",
                width: m,
                height: j - p * 2,
                "background-color": l,
                top: p,
                left: 0
            })
        },
        changeOffset: function (f, g) {
            if (f) {
                this.oX = (this.tX - ((this.sW - this._w) / 2) - this.focusOffX) / (this._w / this.sW)
            }
            if (g) {
                this.oY = (this.tY - ((this.sH - this._h) / 2) - this.focusOffY) / (this._h / this.sH)
            }
        },
        updateMap: function (f, g, h) {
            var i = 0;
            f.each(function () {
                var j = [];
                for (var k = 0; k < g[i].length; k++) {
                    j[k] = g[i][k] * h
                }
                j = j.join(",");
                d(this).attr("coords", j);
                i++
            })
        },
        haltAnimation: function () {
            clearTimeout(this.ani_timer);
            this._playing = false;
            this._recent = ""
        },
        destroy: function () {
            if (this.assetsLoaded) {
                this.haltAnimation();
                for (prop in this.orig_style) {
                    if (this.orig_style[prop][0] !== false && this.orig_style[prop][0] !== undefined) {
                        if (this.orig_style[prop][0] === "width" || this.orig_style[prop][0] === "height") {
                            if (parseInt(this.orig_style[prop][1]) !== 0) {
                                this.$image.css(this.orig_style[prop][0], this.orig_style[prop][1])
                            }
                        } else {
                            this.$image.css(this.orig_style[prop][0], this.orig_style[prop][1])
                        }
                    }
                }
                clearTimeout(this.auto_timer);
                d(a).unbind(".smoothZoom" + this.id);
                d(c).unbind(".smoothZoom" + this.id);
                this.$holder.unbind(".smoothZoom");
                this.$controls = undefined
            } else {
                this.$image.show()
            }
            if (this.container == "") {
                if (this.image_url == "") {
                    this.$image.insertBefore(this.$holder);
                    if (this.$holder !== undefined) {
                        this.$holder.remove()
                    }
                } else {
                    this.$elem.empty()
                }
            } else {
                this.$image.insertBefore(this.$holder);
                this.$holder.empty();
                this.$image.wrap(this.$holder)
            }
            this.$elem.removeData("smoothZoom");
            this.$holder = undefined;
            this.Buttons = undefined;
            this.op = undefined;
            this.$image = undefined
        },
        focusTo: function (f) {
            if (this.assetsLoaded) {
                if (f.zoom === undefined || f.zoom === "" || f.zoom == 0) {
                    f.zoom = this.rA
                } else {
                    f.zoom /= 100
                }
                this._onfocus = true;
                if (f.zoom > this.rA && this.rA != this.zoom_max) {
                    this.rA = f.zoom;
                    this.rA > this.zoom_max ? this.rA = this.zoom_max : ""
                } else {
                    if (f.zoom < this.rA && this.rA != this.rF) {
                        this.rA = f.zoom;
                        this.rA < this.rF ? this.rA = this.rF : ""
                    }
                }
                this.transOffX = this.transOffY = 0;
                this.setDraggedPos(f.x === undefined || f.x === "" ? "" : (-f.x * this.rA) + (this.sW / 2), f.y === undefined || f.y === "" ? "" : (-f.y * this.rA) + (this.sH / 2), this.rA);
                this._recent = "drag";
                this._dragging = true;
                clearTimeout(this.ani_timer);
                this.Animate()
            }
        },
        zoomIn: function (f) {
            this.buttons[0].$ob.trigger("mousedown.smoothZoom", {
                id: 0
            })
        },
        zoomOut: function (f) {
            this.buttons[1].$ob.trigger("mousedown.smoothZoom", {
                id: 1
            })
        },
        moveRight: function (f) {
            this.buttons[2].$ob.trigger("mousedown.smoothZoom", {
                id: 2
            })
        },
        moveLeft: function (f) {
            this.buttons[3].$ob.trigger("mousedown.smoothZoom", {
                id: 3
            })
        },
        moveUp: function (f) {
            this.buttons[4].$ob.trigger("mousedown.smoothZoom", {
                id: 4
            })
        },
        moveDown: function (f) {
            this.buttons[5].$ob.trigger("mousedown.smoothZoom", {
                id: 5
            })
        },
        Reset: function (f) {
            this.buttons[6].$ob.trigger("mousedown.smoothZoom", {
                id: 6
            })
        },
        getZoomData: function (f) {
            return {
                normX: -this._x / this.rA,
                normY: -this._y / this.rA,
                normWidth: this.iW,
                normHeight: this.iH,
                scaledX: -this._x,
                scaledY: -this._y,
                scaledWidth: this._w,
                scaledHeight: this._h,
                centerX: (-parseInt(this._x) + (this.sW / 2)) / this.rA,
                centerY: (-parseInt(this._y) + (this.sH / 2)) / this.rA,
                ratio: this.rA
            }
        }
    };
    d.fn.z = function (m) {
        var j = this;
        var g = j.length;
        for (var k = 0; k < g; k++) {
            var h = d(j[k]);
            var f = h.data("smoothZoom");
            if (!f) {
                if (typeof m === "object" || !m) {
                    h.data("smoothZoom", new b(h, m))
                }
            } else {
                if (m == "getZoomData") {
                    return f[m].apply(f, Array.prototype.slice.call(arguments, 1))
                } else {
                    if (f[m]) {
                        f[m].apply(f, Array.prototype.slice.call(arguments, 1))
                    }
                }
            }
        }
        if (m !== "getZoomData") {
            return this
        }
    }
})(jQuery, window, document);
var Modernizr = function (aj, ai, ah) {
        function Q(f, e) {
            var h = f.charAt(0).toUpperCase() + f.substr(1),
                g = (f + " " + W.join(h + " ") + h).split(" ");
            return S(g, e)
        }
        function S(e, c) {
            for (var f in e) {
                if (aa[e[f]] !== ah) {
                    return c == "pfx" ? e[f] : !0
                }
            }
            return !1
        }
        function U(d, c) {
            return !!~ ("" + d).indexOf(c)
        }
        function F(d, c) {
            return typeof d === c
        }
        function G(d, c) {
            return H(X.join(d + ";") + (c || ""))
        }
        function H(b) {
            aa.cssText = b
        }
        var ag = "2.0.6",
            af = {},
            ae = ai.documentElement,
            ad = ai.head || ai.getElementsByTagName("head")[0],
            ac = "modernizr",
            ab = ai.createElement(ac),
            aa = ab.style,
            Z, Y = Object.prototype.toString,
            X = " -webkit- -moz- -o- -ms- -khtml- ".split(" "),
            W = "Webkit Moz O ms Khtml".split(" "),
            V = {},
            T = {},
            R = {},
            P = [],
            O = function (b, p, o, n) {
                var m, l, h, f = ai.createElement("div");
                if (parseInt(o, 10)) {
                    while (o--) {
                        h = ai.createElement("div"), h.id = n ? n[o] : ac + (o + 1), f.appendChild(h)
                    }
                }
                m = ["&shy;", "<style>", b, "</style>"].join(""), f.id = ac, f.innerHTML += m, ae.appendChild(f), l = p(f, b), f.parentNode.removeChild(f);
                return !!l
            },
            M = function () {
                function c(h, g) {
                    g = g || ai.createElement(b[h] || "div"), h = "on" + h;
                    var a = h in g;
                    a || (g.setAttribute || (g = ai.createElement("div")), g.setAttribute && g.removeAttribute && (g.setAttribute(h, ""), a = F(g[h], "function"), F(g[h], ah) || (g[h] = ah), g.removeAttribute(h))), g = null;
                    return a
                }
                var b = {
                    select: "input",
                    change: "input",
                    submit: "form",
                    reset: "form",
                    error: "img",
                    load: "img",
                    abort: "img"
                };
                return c
            }(),
            K, J = {}.hasOwnProperty,
            I;
        !F(J, ah) && !F(J.call, ah) ? I = function (d, c) {
            return J.call(d, c)
        } : I = function (d, c) {
            return c in d && F(d.constructor.prototype[c], ah)
        };
        var N = function (h, e) {
                var b = h.join(""),
                    a = e.length;
                O(b, function (o, n) {
                    var m = ai.styleSheets[ai.styleSheets.length - 1],
                        l = m.cssRules && m.cssRules[0] ? m.cssRules[0].cssText : m.cssText || "",
                        k = o.childNodes,
                        g = {};
                    while (a--) {
                        g[k[a].id] = k[a]
                    }
                    af.touch = "ontouchstart" in aj || g.touch.offsetTop === 9, af.csstransforms3d = g.csstransforms3d.offsetLeft === 9
                }, a, e)
            }([, ["@media (", X.join("touch-enabled),("), ac, ")", "{#touch{top:9px;position:absolute}}"].join(""), ["@media (", X.join("transform-3d),("), ac, ")", "{#csstransforms3d{left:9px;position:absolute}}"].join("")], [, "touch", "csstransforms3d"]);
        V.touch = function () {
            return af.touch
        }, V.borderradius = function () {
            return Q("borderRadius")
        }, V.csstransforms = function () {
            return !!S(["transformProperty", "WebkitTransform", "MozTransform", "OTransform", "msTransform"])
        }, V.csstransforms3d = function () {
            var b = !! S(["perspectiveProperty", "WebkitPerspective", "MozPerspective", "OPerspective", "msPerspective"]);
            b && "webkitPerspective" in ae.style && (b = af.csstransforms3d);
            return b
        };
        for (var L in V) {
            I(V, L) && (K = L.toLowerCase(), af[K] = V[L](), P.push((af[K] ? "" : "no-") + K))
        }
        H(""), ab = Z = null, af._version = ag, af._prefixes = X, af._domPrefixes = W, af.hasEvent = M, af.testProp = function (b) {
            return S([b])
        }, af.testAllProps = Q, af.testStyles = O, af.prefixed = function (b) {
            return Q(b, "pfx")
        };
        return af
    }(this, this.document);
var FF2 = $.browser.mozilla && (parseFloat($.browser.version) < 1.9) ? true : false;
var IE6 = $.browser.msie && parseInt($.browser.version, 10) <= 6 ? true : false;
var prop_transform = Modernizr.prefixed("transform");
var prop_origin = Modernizr.prefixed("transformOrigin");
var use_trans2D = Modernizr.csstransforms && prop_transform !== false && prop_origin !== false ? true : false;
var use_trans3D = Modernizr.csstransforms3d && prop_transform !== false && prop_origin !== false ? true : false;
var use_bordRadius = $.browser.mozilla && FF2 ? false : Modernizr.borderradius;
var use_pngTrans = IE6 ? false : true;
(function (f) {
    function g(a) {
        var n = a || window.event,
            m = [].slice.call(arguments, 1),
            l = 0,
            k = !0,
            j = 0,
            i = 0;
        return a = f.event.fix(n), a.type = "mousewheel", n.wheelDelta && (l = n.wheelDelta / 120), n.detail && (l = -n.detail / 3), i = l, n.axis !== undefined && n.axis === n.HORIZONTAL_AXIS && (i = 0, j = -1 * l), n.wheelDeltaY !== undefined && (i = n.wheelDeltaY / 120), n.wheelDeltaX !== undefined && (j = -1 * n.wheelDeltaX / 120), m.unshift(a, l, j, i), (f.event.dispatch || f.event.handle).apply(this, m)
    }
    var e = ["DOMMouseScroll", "mousewheel"];
    if (f.event.fixHooks) {
        for (var h = e.length; h;) {
            f.event.fixHooks[e[--h]] = f.event.mouseHooks
        }
    }
    f.event.special.mousewheel = {
        setup: function () {
            if (this.addEventListener) {
                for (var b = e.length; b;) {
                    this.addEventListener(e[--b], g, !1)
                }
            } else {
                this.onmousewheel = g
            }
        },
        teardown: function () {
            if (this.removeEventListener) {
                for (var b = e.length; b;) {
                    this.removeEventListener(e[--b], g, !1)
                }
            } else {
                this.onmousewheel = null
            }
        }
    }, f.fn.extend({
        mousewheel: function (b) {
            return b ? this.bind("mousewheel", b) : this.trigger("mousewheel")
        },
        unmousewheel: function (b) {
            return this.unbind("mousewheel", b)
        }
    })
})(jQuery);
var ani_smooth;
var zoom_speed;
var pan_speed;
var sample = 1;
function setSmooth(a) {
    a = (((a - 108) / 100) * 10) + 1;
    a > 10 ? a = 10 : "";
    a < 1 ? a = 1 : "";
    zoomer_.ani_smooth = Math.max(1.5, a - 1);
    return a
}
function setSpeed(a) {
    a = (((a - 108) / 100) * 10) + 1;
    a > 10 ? a = 10 : "";
    a < 1 ? a = 1 : "";
    zoomer_.zoom_speed = 1 + ((a + 1) / 20);
    zoomer_.pan_speed = ((sW + sH) / 500) - 1 + (a * a / 4) + 2;
    return a
}
function setLable(c, b, a, e) {
    sW = a;
    sH = e;
    var d = String(parseInt(b * 10) / 10);
    d.length < 2 ? d = d + ".0" : "";
    c.html(d)
}
jQuery(function (c) {
    var h = c(document);
    var j = c("#cont");
    var f = c("#settings");
    f.addClass("noSel");
    var a = c("#barSmooth").css({
        //left: smPos + "px"
    });
    var e = c("#barSmooth_t").css({
        //left: smPos - 3 + "px",
        "-moz-user-select": "none",
        "-khtml-user-select": "none",
        "-webkit-user-select": "none",
        "user-select": "none",
        cursor: "default"
    }).addClass("noSel").hide();
    var i = false;
    a.bind("mouseover", function (k) {
        a.css("background-position", "-1025px 0px");
        if (!g) {
            e.show()
        }
    }).bind("mouseout", function (k) {
        if (!i) {
            a.css("background-position", "-1011px 0px"), e.hide()
        }
    }).bind("mousedown", function (l) {
        i = true;
        e.show();
        a.css("background-position", "-1025px 0px");
        offX = l.pageX - f.offset().left - a.position().left;
        h.bind("mousemove.preview", function (o) {
            var m = o.pageX - f.offset().left - offX;
            m < 112 ? m = 108 : "";
            m > 194 ? m = 198 : "";
            m > 148 && m < 158 ? m = 153 : "";
            a.css({
                left: m + "px"
            });
            e.css({
                left: m - 3 + "px"
            });
            var n = setSmooth(a.position().left);
            setLable(e, n);
            return false
        });
        var k = setSmooth(a.position().left);
        setLable(e, k);
        l.stopPropagation();
        (c.browser.msie || l.preventDefault())
    }).addClass("noSel");
    a.bind("touchstart.preview", function (l) {
        l.preventDefault();
        offX = l.originalEvent.changedTouches[0].pageX - f.offset().left - a.position().left;
        i = true;
        var k = setSmooth(a.position().left);
        setLable(e, k);
        a.css("background-position", "-1025px 0px");
        e.show()
    });
    var d = c("#barSpeed").css({
        //left: spPos + "px"
    });
    var b = c("#barSpeed_t").css({
        //left: spPos - 3 + "px",
        "-moz-user-select": "none",
        "-khtml-user-select": "none",
        "-webkit-user-select": "none",
        "user-select": "none",
        cursor: "default"
    }).addClass("noSel").hide();
    var g = false;
    d.bind("mouseover", function (k) {
        d.css("background-position", "-1025px 0px");
        if (!i) {
            b.show()
        }
    }).bind("mouseout", function (k) {
        if (!g) {
            d.css("background-position", "-1011px 0px"), b.hide()
        }
    }).bind("mousedown", function (l) {
        g = true;
        b.show();
        d.css("background-position", "-1025px 0px");
        offX = l.pageX - f.offset().left - d.position().left;
        h.bind("mousemove.preview", function (o) {
            var m = o.pageX - f.offset().left - offX;
            m < 112 ? m = 108 : "";
            m > 194 ? m = 198 : "";
            m > 148 && m < 158 ? m = 153 : "";
            d.css({
                left: m + "px"
            });
            b.css({
                left: m - 3 + "px"
            });
            var n = setSpeed(d.position().left);
            setLable(b, n);
            return false
        });
        var k = setSpeed(d.position().left);
        setLable(b, k);
        l.stopPropagation();
        (c.browser.msie || l.preventDefault())
    }).addClass("noSel");
    d.bind("touchstart.preview", function (l) {
        l.preventDefault();
        offX = l.originalEvent.changedTouches[0].pageX - f.offset().left - d.position().left;
        g = true;
        var k = setSmooth(d.position().left);
        setLable(b, k);
        d.css("background-position", "-1011px 0px");
        b.show()
    });
    h.bind("mouseup.preview", function (m) {
        if (i) {
            i = false;
            e.hide();
            h.unbind("mousemove.preview");
            var k = m.pageX - f.offset().left - offX;
            k < 112 ? k = 108 : "";
            k > 194 ? k = 198 : "";
            k > 148 && k < 158 ? k = 153 : "";
            a.css({
                left: k + "px"
            });
            e.css({
                left: k - 3 + "px"
            });
            l = setSmooth(a.position().left);
            setLable(e, l);
            a.css("background-position", "-1011px 0px")
        }
        if (g) {
            g = false;
            b.hide();
            h.unbind("mousemove.preview");
            var k = m.pageX - f.offset().left - offX;
            k < 112 ? k = 108 : "";
            k > 194 ? k = 198 : "";
            k > 148 && k < 158 ? k = 153 : "";
            d.css({
                left: k + "px"
            });
            b.css({
                left: k - 3 + "px"
            });
            var l = setSpeed(d.position().left);
            setLable(b, l);
            d.css("background-position", "-1011px 0px")
        }
    });
    j.bind("touchmove.preview", function (m) {
        m.preventDefault();
        if (i) {
            var k = m.originalEvent.changedTouches[0].pageX - f.offset().left - offX;
            k < 112 ? k = 108 : "";
            k > 194 ? k = 198 : "";
            k > 148 && k < 158 ? k = 153 : "";
            a.css({
                left: k + "px"
            });
            e.css({
                left: k - 3 + "px"
            });
            var l = setSmooth(a.position().left);
            setLable(e, l)
        }
        if (g) {
            var k = m.originalEvent.changedTouches[0].pageX - f.offset().left - offX;
            k < 112 ? k = 108 : "";
            k > 194 ? k = 198 : "";
            k > 148 && k < 158 ? k = 153 : "";
            d.css({
                left: k + "px"
            });
            b.css({
                left: k - 3 + "px"
            });
            var l = setSpeed(d.position().left);
            setLable(b, l)
        }
    });
    j.bind("touchend.preview", function (k) {
        k.preventDefault();
        if (i) {
            i = false;
            e.hide();
            setSmooth(((a.position().left - 108) / 100) * 10);
            a.css("background-position", "-1011px 0px")
        }
        if (g) {
            g = false;
            b.hide();
            setSpeed(((d.position().left - 108) / 100) * 10);
            d.css("background-position", "-1011px 0px")
        }
    });
    c("#cont").addClass("noSel");
    c(".noSel").each(function () {
        this.onselectstart = function () {
            return false
        }
    });
    c("#s" + sample).css({
        "background-position": ((sample - 1) * -111) + "px -44px",
        cursor: "pointer"
    });
    c("#s1").bind("mouseover", function (k) {
        if (sample !== 1) {
            c(this).css({
                "background-position": "0px -22px",
                cursor: "pointer"
            })
        }
    }).bind("mouseout", function (k) {
        if (sample !== 1) {
            c(this).css({
                "background-position": "0px 0px",
                cursor: "default"
            })
        }
    }).bind("click", function (k) {
        if (sample !== 1) {
            c(this).css("background-position", "0px -44px"), c("#s2").css("background-position", "-111px 0px"), c("#s3").css("background-position", "-222px 0px"), c("#s4").css("background-position", "-333px 0px"), c("#s5").css("background-position", "-444px 0px"), c("#s6").css("background-position", "-555px 0px"), c("#s7").css("background-position", "-666px 0px"), sample = 1
        }
    });
    c("#s2").bind("mouseover", function (k) {
        if (sample !== 2) {
            c(this).css({
                "background-position": "-111px -22px",
                cursor: "pointer"
            })
        }
    }).bind("mouseout", function (k) {
        if (sample !== 2) {
            c(this).css({
                "background-position": "-111px 0px",
                cursor: "default"
            })
        }
    }).bind("click", function (k) {
        if (sample !== 2) {
            c(this).css("background-position", "-111px -44px"), c("#s1").css("background-position", "0px 0px"), c("#s3").css("background-position", "-222px 0px"), c("#s4").css("background-position", "-333px 0px"), c("#s5").css("background-position", "-444px 0px"), c("#s6").css("background-position", "-555px 0px"), c("#s7").css("background-position", "-666px 0px"), sample = 2
        }
    });
    c("#s3").bind("mouseover", function (k) {
        if (sample !== 3) {
            c(this).css({
                "background-position": "-222px -22px",
                cursor: "pointer"
            })
        }
    }).bind("mouseout", function (k) {
        if (sample !== 3) {
            c(this).css({
                "background-position": "-222px 0px",
                cursor: "default"
            })
        }
    }).bind("click", function (k) {
        if (sample !== 3) {
            c(this).css("background-position", "-222px -44px"), c("#s1").css("background-position", "0px 0px"), c("#s2").css("background-position", "-111px 0px"), c("#s4").css("background-position", "-333px 0px"), c("#s5").css("background-position", "-444px 0px"), c("#s6").css("background-position", "-555px 0px"), c("#s7").css("background-position", "-666px 0px"), sample = 3
        }
    });
    c("#s4").bind("mouseover", function (k) {
        if (sample !== 4) {
            c(this).css({
                "background-position": "-333px -22px",
                cursor: "pointer"
            })
        }
    }).bind("mouseout", function (k) {
        if (sample !== 4) {
            c(this).css({
                "background-position": "-333px 0px",
                cursor: "default"
            })
        }
    }).bind("click", function (k) {
        if (sample !== 4) {
            c(this).css("background-position", "-333px -44px"), c("#s1").css("background-position", "0px 0px"), c("#s2").css("background-position", "-111px 0px"), c("#s3").css("background-position", "-222px 0px"), c("#s5").css("background-position", "-444px 0px"), c("#s6").css("background-position", "-555px 0px"), c("#s7").css("background-position", "-666px 0px"), sample = 4
        }
    });
    c("#s5").bind("mouseover", function (k) {
        if (sample !== 5) {
            c(this).css({
                "background-position": "-444px -22px",
                cursor: "pointer"
            })
        }
    }).bind("mouseout", function (k) {
        if (sample !== 5) {
            c(this).css({
                "background-position": "-444px 0px",
                cursor: "default"
            })
        }
    }).bind("click", function (k) {
        if (sample !== 5) {
            c(this).css("background-position", "-444px -44px"), c("#s1").css("background-position", "0px 0px"), c("#s2").css("background-position", "-111px 0px"), c("#s3").css("background-position", "-222px 0px"), c("#s4").css("background-position", "-333px 0px"), c("#s6").css("background-position", "-555px 0px"), c("#s7").css("background-position", "-666px 0px"), sample = 5
        }
    });
    c("#s6").bind("mouseover", function (k) {
        if (sample !== 6) {
            c(this).css({
                "background-position": "-555px -22px",
                cursor: "pointer"
            })
        }
    }).bind("mouseout", function (k) {
        if (sample !== 6) {
            c(this).css({
                "background-position": "-555px 0px",
                cursor: "default"
            })
        }
    }).bind("click", function (k) {
        if (sample !== 6) {
            c(this).css("background-position", "-555px -44px"), c("#s1").css("background-position", "0px 0px"), c("#s2").css("background-position", "-111px 0px"), c("#s3").css("background-position", "-222px 0px"), c("#s4").css("background-position", "-333px 0px"), c("#s5").css("background-position", "-444px 0px"), c("#s7").css("background-position", "-666px 0px"), sample = 6
        }
    });
    c("#s7").bind("mouseover", function (k) {
        if (sample !== 7) {
            c(this).css({
                "background-position": "-666px -22px",
                cursor: "pointer"
            })
        }
    }).bind("mouseout", function (k) {
        if (sample !== 7) {
            c(this).css({
                "background-position": "-666px 0px",
                cursor: "default"
            })
        }
    }).bind("click", function (k) {
        if (sample !== 7) {
            c(this).css("background-position", "-666px -44px"), c("#s1").css("background-position", "0px 0px"), c("#s2").css("background-position", "-111px 0px"), c("#s3").css("background-position", "-222px 0px"), c("#s4").css("background-position", "-333px 0px"), c("#s5").css("background-position", "-444px 0px"), c("#s6").css("background-position", "-555px 0px"), sample = 7
        }
    })
});