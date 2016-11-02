	
;(function(){
	var alph = "abcdefghijklmnopqrstuvwxyz", kb = {};
	
	var codes = {}, keys = {};
	
	
	// big letters
	alph += alph.toUpperCase() + '0123456789'
	
	var i = alph.length;
	
	// filling up with letters and digits
	while(i--) {
		kb[alph.charAt(i)] = alph.charCodeAt(i);
		keys[ codes[alph.charCodeAt(i)] = alph.charAt(i) ] = alph.charCodeAt(i);
	}
	
	// f1-f12 keys
	for( i = 0; ++i < 13; ) {
		kb['f' + i] = 111 + i;
		keys['f' + i] = 111 + i;
		codes[111 + i] = 'f' + i;
	}
	
	// transform it to regexp
	var specCodes = "8|9|13|16|17|18|27|33|34|35|36|39|37|38|40|47".split('|'),
		specNames = "backspace|tab|enter|shift|ctrl|alt|esc|pup|pdown|end|home|right|left|up|down|space".split('|');
	var cache = {};
	
	// filling up kb{} with special buttons
	for( i = specCodes.length; --i > -1; ) {
		kb[specNames[i]] = Number(specCodes[i]);
		keys[specNames[i]] = Number(specCodes[i]);
		codes[Number(specCodes[i])] = specNames[i]; 
	}
	
	//console.log(kb)
	

	 // if (charCode == 19) textBox.value = "pause/break"; //  pause/break
	 // if (charCode == 20) textBox.value = "caps lock"; //  caps lock|

	 // if (charCode == 45) textBox.value = "insert"; // insert
	 // if (charCode == 46) textBox.value = "delete"; // delete
// 
// 	 
	 // if (charCode == 186) textBox.value = ";"; // semi-colon
	 // if (charCode == 187) textBox.value = "="; // equal-sign
	 // if (charCode == 188) textBox.value = ","; // comma
	 // if (charCode == 189) textBox.value = "-"; // dash
	 // if (charCode == 190) textBox.value = "."; // period
	 // if (charCode == 191) textBox.value = "/"; // forward slash
	 // if (charCode == 192) textBox.value = "`"; // grave accent
	 // if (charCode == 219) textBox.value = "["; // open bracket
	 // if (charCode == 220) textBox.value = "\\"; // back slash
	 // if (charCode == 221) textBox.value = "]"; // close bracket
	 // if (charCode == 222) textBox.value = "'"; // single quote

	function convert(expr){
		for( var ret = {}, keys = expr.split("+"), i = -1, len = keys.length; ++i < len; ){
			ret[keys[i]] = kb[keys[i]];
		}
		return (cache[expr] = ret);
	}
	
	
	kb.toString = function( e ){
		
		if(!e) return true;
		
		var enter = e.enterKey,
			shift = e.shiftKey,
			ctrl = e.ctrlKey,
			alt = e.altKey,
			cmd = e.metaKey;
			
		return _.compact(_.uniq([
			shift && "shift",
			ctrl && "ctrl",
			alt && "alt",
			cmd && "cmd",
			enter && "enter",
			codes[e.keyCode]
		])).join("+");
		
	}
	
	
	
	kb.is = function(expr, e){
		expr = cache[expr] || convert(expr);
		e = e || {};
		var enter = e.enterKey,
			shift = e.shiftKey,
			ctrl = e.ctrlKey;
		for( var i in expr ) {
			if( kb[i] !=  e.keyCode )
				return false;
		}
		return true;
	}
	
	
	var _words = {}, _callbacks = {}, _timers = {};
	
	kb.defineWord = function( word, callback ){
		_words[word] = "";
		_callbacks[word] = callback;
		$(document).on("keydown." + word, function(e){
			clearTimeout( _timers[word] );
			_words[word] += kb.toString(e);
			// console.log(_words[word] );
			if( _words[word] == word ) {
				_callbacks[word] && _callbacks[word]();
				_words[word] = "";
			}
			_timers[word] = setTimeout(function(){
				_words[word] = "";
			}, 400);
		});
	}
	
	
	//$(document).on("keydown", kb.toString);
	
	window.keyboard = kb;
})();


