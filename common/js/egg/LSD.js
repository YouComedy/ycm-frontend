

(function(jQuery,window,document,Math,undefined){var div=document.createElement("div"),divStyle=div.style,suffix="Transform",testProperties=["O"+suffix,"ms"+suffix,"Webkit"+suffix,"Moz"+suffix],i=testProperties.length,supportProperty,supportMatrixFilter,supportFloat32Array="Float32Array"in window,propertyHook,propertyGet,rMatrix=/Matrix([^)]*)/,rAffine=/^\s*matrix\(\s*1\s*,\s*0\s*,\s*0\s*,\s*1\s*(?:,\s*0(?:px)?\s*){2}\)\s*$/,_transform="transform",_transformOrigin="transformOrigin",_translate="translate",_rotate="rotate",_scale="scale",_skew="skew",_matrix="matrix";while(i--){if(testProperties[i]in divStyle){jQuery.support[_transform]=supportProperty=testProperties[i];jQuery.support[_transformOrigin]=supportProperty+"Origin";continue}}if(!supportProperty){jQuery.support.matrixFilter=supportMatrixFilter=divStyle.filter===""}jQuery.cssNumber[_transform]=jQuery.cssNumber[_transformOrigin]=true;if(supportProperty&&supportProperty!=_transform){jQuery.cssProps[_transform]=supportProperty;jQuery.cssProps[_transformOrigin]=supportProperty+"Origin";if(supportProperty=="Moz"+suffix){propertyHook={get:function(elem,computed){return(computed?jQuery.css(elem,supportProperty).split("px").join(""):elem.style[supportProperty])},set:function(elem,value){elem.style[supportProperty]=/matrix\([^)p]*\)/.test(value)?value.replace(/matrix((?:[^,]*,){4})([^,]*),([^)]*)/,_matrix+"$1$2px,$3px"):value}}}else if(/^1\.[0-5](?:\.|$)/.test(jQuery.fn.jquery)){propertyHook={get:function(elem,computed){return(computed?jQuery.css(elem,supportProperty.replace(/^ms/,"Ms")):elem.style[supportProperty])}}}}else if(supportMatrixFilter){propertyHook={get:function(elem,computed,asArray){var elemStyle=(computed&&elem.currentStyle?elem.currentStyle:elem.style),matrix,data;if(elemStyle&&rMatrix.test(elemStyle.filter)){matrix=RegExp.$1.split(",");matrix=[matrix[0].split("=")[1],matrix[2].split("=")[1],matrix[1].split("=")[1],matrix[3].split("=")[1]]}else{matrix=[1,0,0,1]}if(!jQuery.cssHooks[_transformOrigin]){matrix[4]=elemStyle?parseInt(elemStyle.left,10)||0:0;matrix[5]=elemStyle?parseInt(elemStyle.top,10)||0:0}else{data=jQuery._data(elem,"transformTranslate",undefined);matrix[4]=data?data[0]:0;matrix[5]=data?data[1]:0}return asArray?matrix:_matrix+"("+matrix+")"},set:function(elem,value,animate){var elemStyle=elem.style,currentStyle,Matrix,filter,centerOrigin;if(!animate){elemStyle.zoom=1}value=matrix(value);Matrix=["Matrix("+"M11="+value[0],"M12="+value[2],"M21="+value[1],"M22="+value[3],"SizingMethod='auto expand'"].join();filter=(currentStyle=elem.currentStyle)&&currentStyle.filter||elemStyle.filter||"";elemStyle.filter=rMatrix.test(filter)?filter.replace(rMatrix,Matrix):filter+" progid:DXImageTransform.Microsoft."+Matrix+")";if(!jQuery.cssHooks[_transformOrigin]){if((centerOrigin=jQuery.transform.centerOrigin)){elemStyle[centerOrigin=="margin"?"marginLeft":"left"]=-(elem.offsetWidth/2)+(elem.clientWidth/2)+"px";elemStyle[centerOrigin=="margin"?"marginTop":"top"]=-(elem.offsetHeight/2)+(elem.clientHeight/2)+"px"}elemStyle.left=value[4]+"px";elemStyle.top=value[5]+"px"}else{jQuery.cssHooks[_transformOrigin].set(elem,value)}}}}if(propertyHook){jQuery.cssHooks[_transform]=propertyHook}propertyGet=propertyHook&&propertyHook.get||jQuery.css;jQuery.fx.step.transform=function(fx){var elem=fx.elem,start=fx.start,end=fx.end,pos=fx.pos,transform="",precision=1E5,i,startVal,endVal,unit;if(!start||typeof start==="string"){if(!start){start=propertyGet(elem,supportProperty)}if(supportMatrixFilter){elem.style.zoom=1}end=end.split("+=").join(start);return jQuery.extend(fx,interpolationList(start,end))}i=start.length;while(i--){startVal=start[i];endVal=end[i];unit=+false;switch(startVal[0]){case _translate:unit="px";case _scale:unit||(unit=" ");transform=startVal[0]+"("+Math.round((startVal[1][0]+(endVal[1][0]-startVal[1][0])*pos)*precision)/precision+unit+","+Math.round((startVal[1][1]+(endVal[1][1]-startVal[1][1])*pos)*precision)/precision+unit+")"+transform;break;case _skew+"X":case _skew+"Y":case _rotate:transform=startVal[0]+"("+Math.round((startVal[1]+(endVal[1]-startVal[1])*pos)*precision)/precision+"rad)"+transform;break}}fx.origin&&(transform=fx.origin+transform);propertyHook&&propertyHook.set?propertyHook.set(elem,transform,+true):elem.style[supportProperty]=transform};function matrix(transform){transform=transform.split(")");var trim=jQuery.trim,i=-1,l=transform.length-1,split,prop,val,prev=supportFloat32Array?new Float32Array(6):[],curr=supportFloat32Array?new Float32Array(6):[],rslt=supportFloat32Array?new Float32Array(6):[1,0,0,1,0,0];prev[0]=prev[3]=rslt[0]=rslt[3]=1;prev[1]=prev[2]=prev[4]=prev[5]=0;while(++i<l){split=transform[i].split("(");prop=trim(split[0]);val=split[1];curr[0]=curr[3]=1;curr[1]=curr[2]=curr[4]=curr[5]=0;switch(prop){case _translate+"X":curr[4]=parseInt(val,10);break;case _translate+"Y":curr[5]=parseInt(val,10);break;case _translate:val=val.split(",");curr[4]=parseInt(val[0],10);curr[5]=parseInt(val[1]||0,10);break;case _rotate:val=toRadian(val);curr[0]=Math.cos(val);curr[1]=Math.sin(val);curr[2]=-Math.sin(val);curr[3]=Math.cos(val);break;case _scale+"X":curr[0]=+val;break;case _scale+"Y":curr[3]=val;break;case _scale:val=val.split(",");curr[0]=val[0];curr[3]=val.length>1?val[1]:val[0];break;case _skew+"X":curr[2]=Math.tan(toRadian(val));break;case _skew+"Y":curr[1]=Math.tan(toRadian(val));break;case _matrix:val=val.split(",");curr[0]=val[0];curr[1]=val[1];curr[2]=val[2];curr[3]=val[3];curr[4]=parseInt(val[4],10);curr[5]=parseInt(val[5],10);break}rslt[0]=prev[0]*curr[0]+prev[2]*curr[1];rslt[1]=prev[1]*curr[0]+prev[3]*curr[1];rslt[2]=prev[0]*curr[2]+prev[2]*curr[3];rslt[3]=prev[1]*curr[2]+prev[3]*curr[3];rslt[4]=prev[0]*curr[4]+prev[2]*curr[5]+prev[4];rslt[5]=prev[1]*curr[4]+prev[3]*curr[5]+prev[5];prev=[rslt[0],rslt[1],rslt[2],rslt[3],rslt[4],rslt[5]]}return rslt}function unmatrix(matrix){var scaleX,scaleY,skew,A=matrix[0],B=matrix[1],C=matrix[2],D=matrix[3];if(A*D-B*C){scaleX=Math.sqrt(A*A+B*B);A/=scaleX;B/=scaleX;skew=A*C+B*D;C-=A*skew;D-=B*skew;scaleY=Math.sqrt(C*C+D*D);C/=scaleY;D/=scaleY;skew/=scaleY;if(A*D<B*C){A=-A;B=-B;skew=-skew;scaleX=-scaleX}}else{scaleX=scaleY=skew=0}return[[_translate,[+matrix[4],+matrix[5]]],[_rotate,Math.atan2(B,A)],[_skew+"X",Math.atan(skew)],[_scale,[scaleX,scaleY]]]}function interpolationList(start,end){var list={start:[],end:[]},i=-1,l,currStart,currEnd,currType;(start=="none"||isAffine(start))&&(start="");(end=="none"||isAffine(end))&&(end="");if(start&&end&&!end.indexOf("matrix")&&toArray(start).join()==toArray(end.split(")")[0]).join()){list.origin=start;start="";end=end.slice(end.indexOf(")")+1)}if(!start&&!end){return}if(!start||!end||functionList(start)==functionList(end)){start&&(start=start.split(")"))&&(l=start.length);end&&(end=end.split(")"))&&(l=end.length);while(++i<l-1){start[i]&&(currStart=start[i].split("("));end[i]&&(currEnd=end[i].split("("));currType=jQuery.trim((currStart||currEnd)[0]);append(list.start,parseFunction(currType,currStart?currStart[1]:0));append(list.end,parseFunction(currType,currEnd?currEnd[1]:0))}}else{list.start=unmatrix(matrix(start));list.end=unmatrix(matrix(end))}return list}function parseFunction(type,value){var defaultValue=+(!type.indexOf(_scale)),scaleX,cat=type.replace(/e[XY]/,"e");switch(type){case _translate+"Y":case _scale+"Y":value=[defaultValue,value?parseFloat(value):defaultValue];break;case _translate+"X":case _translate:case _scale+"X":scaleX=1;case _scale:value=value?(value=value.split(","))&&[parseFloat(value[0]),parseFloat(value.length>1?value[1]:type==_scale?scaleX||value[0]:defaultValue+"")]:[defaultValue,defaultValue];break;case _skew+"X":case _skew+"Y":case _rotate:value=value?toRadian(value):0;break;case _matrix:return unmatrix(value?toArray(value):[1,0,0,1,0,0]);break}return[[cat,value]]}function isAffine(matrix){return rAffine.test(matrix)}function functionList(transform){return transform.replace(/(?:\([^)]*\))|\s/g,"")}function append(arr1,arr2,value){while(value=arr2.shift()){arr1.push(value)}}function toRadian(value){return~value.indexOf("deg")?parseInt(value,10)*(Math.PI*2/360):~value.indexOf("grad")?parseInt(value,10)*(Math.PI/200):parseFloat(value)}function toArray(matrix){matrix=/([^,]*),([^,]*),([^,]*),([^,]*),([^,p]*)(?:px)?,([^)p]*)(?:px)?/.exec(matrix);return[matrix[1],matrix[2],matrix[3],matrix[4],matrix[5],matrix[6]]}jQuery.transform={centerOrigin:"margin"}})(jQuery,window,document,Math);

(function(jQuery){jQuery.each(['backgroundColor','borderBottomColor','borderLeftColor','borderRightColor','borderTopColor','color','outlineColor'],function(i,attr){jQuery.fx.step[attr]=function(fx){if(fx.state==0){fx.start=getColor(fx.elem,attr);fx.end=getRGB(fx.end)}fx.elem.style[attr]="rgb("+[Math.max(Math.min(parseInt((fx.pos*(fx.end[0]-fx.start[0]))+fx.start[0]),255),0),Math.max(Math.min(parseInt((fx.pos*(fx.end[1]-fx.start[1]))+fx.start[1]),255),0),Math.max(Math.min(parseInt((fx.pos*(fx.end[2]-fx.start[2]))+fx.start[2]),255),0)].join(",")+")"}});function getRGB(color){var result;if(color&&color.constructor==Array&&color.length==3)return color;if(result=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))return[parseInt(result[1]),parseInt(result[2]),parseInt(result[3])];if(result=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))return[parseFloat(result[1])*2.55,parseFloat(result[2])*2.55,parseFloat(result[3])*2.55];if(result=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))return[parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)];if(result=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))return[parseInt(result[1]+result[1],16),parseInt(result[2]+result[2],16),parseInt(result[3]+result[3],16)];return colors[jQuery.trim(color).toLowerCase()]}function getColor(elem,attr){var color;do{color=jQuery.curCSS(elem,attr);if(color!=''&&color!='transparent'||jQuery.nodeName(elem,"body"))break;attr="backgroundColor"}while(elem=elem.parentNode);return getRGB(color)};var colors={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);

jQuery(document).ready(function(){


function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitary(min, max)
{
  return Math.random() * (max - min) + min;
}


jQuery('a').click(function(e){
	e.preventDefault();
});

jQuery(document).keyup(function(e) {
  if (e.keyCode == 27) {
	window.location.href = window.location.href;
  }
});

var lsd_body = jQuery('body');

var lsd_anim = function(elem){
	if (elem.hasClass('lsd_tripping_in_progress')) return;
	var animations = [
		[
				'skewX('+getRandomInt(5, 15)+'deg) skewY('+getRandomInt(5, 15)+'deg)',
				'skewX('+getRandomInt(5, 15)+'deg) rotate('+getRandomInt(2, 5)+'deg)',
				'skewY('+getRandomInt(5, 15)+'deg) rotate('+getRandomInt(2, 5)+'deg)',
				'scale('+getRandomArbitary(0.7, 1.3)+', '+getRandomArbitary(0.7, 1.3)+') rotate('+getRandomInt(2, 5)+'deg)',
				'skewY('+getRandomInt(5, 15)+'deg) scale('+getRandomArbitary(0.7, 1.3)+', '+getRandomArbitary(0.7, 1.3)+')',
				'skewX('+getRandomInt(5, 15)+'deg) scale('+getRandomArbitary(0.7, 1.3)+', '+getRandomArbitary(0.7, 1.3)+')'
		],
		[
				'skewX(-'+getRandomInt(5, 15)+'deg) skewY(-'+getRandomInt(5, 15)+'deg)',
				'skewX(-'+getRandomInt(5, 15)+'deg) rotate(-'+getRandomInt(2, 5)+'deg)',
				'skewY(-'+getRandomInt(5, 15)+'deg) rotate(-'+getRandomInt(2, 5)+'deg)',
				'scale(-'+getRandomArbitary(0.7, 1.3)+', '+getRandomArbitary(0.7, 1.3)+') rotate(-'+getRandomInt(2, 5)+'deg)',
				'skewY(-'+getRandomInt(5, 15)+'deg) scale(-'+getRandomArbitary(0.7, 1.3)+', '+getRandomArbitary(0.7, 1.3)+')',
				'skewX(-'+getRandomInt(5, 15)+'deg) scale(-'+getRandomArbitary(0.7, 1.3)+', '+getRandomArbitary(0.7, 1.3)+')'
		]
	];
	var firstAnim = getRandomInt(0, 1);

	var animIn = {transform: animations[firstAnim][getRandomInt(0, 5)]+''};
	var animOut = {transform: animations[1-firstAnim][getRandomInt(0, 5)]+''};

	if (getRandomInt(0, 1) == 0) {
		var current_bg = elem.css('background-color');
		var elem_check = elem;
		while (current_bg == 'transparent' || current_bg.indexOf('rgba') != -1) {
			elem_check = elem_check.parent();
			current_bg = elem_check.css('background-color');
			if (elem_check.is(lsd_body) && (current_bg == 'transparent' || current_bg.indexOf('rgba') != -1)) current_bg = '#fff';
		}
		elem.css('background-color', current_bg);
		animIn['background-color'] = '#'+Math.round(0xffffff * Math.random()).toString(16);
		animOut['background-color'] = current_bg;
	}

	var bg = elem.css('background-color');
	elem.css('background-color', bg);
	elem.animate(animIn, getRandomInt(1000, 3000)).animate(animOut, getRandomInt(1000, 3000), function(){
		lsd_anim(elem);
	});

};

var lsd_elems = jQuery('p, a, span').closest('div,section,article')/*.add('td, th').not(jQuery('td, th').closest('div'))*/;

//lsd_body.prepend('<div style="position:fixed; position:*absolute; bottom:20px; right:20px; z-index:99"><iframe allowtransparency="true" frameborder="0" scrolling="no" src="http://platform.twitter.com/widgets/tweet_button.1334389481.html#_=1334843356485&amp;count=horizontal&amp;hashtags=bd&amp;id=twitter-widget-0&amp;lang=ru&amp;original_referer=http%3A%2F%2Fyoucomedy.me%2F&amp;related=&amp;size=m&amp;text=Site%20on%20LSD.%20Turn%20on%2C%20tune%20in%2C%20drop%20out&amp;url=http%3A%2F%2Flsd.bicycle-day.com%2F&amp;via=bicycleday_ua" class="twitter-share-button twitter-count-horizontal" style="width: 152px; height: 20px; " title="Twitter Tweet Button"></iframe><iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fyoucomedy.me%2F&amp;send=false&amp;layout=button_count&amp;width=150&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21&amp" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:150px; height:21px;" allowTransparency="true"></iframe></div>');
lsd_body.prepend('<div style=" position:absolute; top:10px; left:10px; z-index:99999; font-weight:bold; color:#fff; background:#8b2387; padding:10px;">Press ESC to end trip</div>');


var enabled = false;

window.EGG.LSD = function(){
	!enabled && (enabled = true) && $.post('/logLSD') && lsd_elems.each(function(){
		lsd_anim(jQuery(this));
	});
}

});