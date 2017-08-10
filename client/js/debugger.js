var debug = {
  sourcemap:  '',
  cache:      null,
  sourceMeta: null,
  realOutput: '',
  files:      [],
  filenames:  [],
  fileColors: ['black', 'green', 'blue', 'purple', ],


  init: function(json) {
  },
  process: function(str){
    var json = JSON.parse(str);
    debug.filenames = json.sources;
    debug.sourcemap = json.mappings;
    //app.dom.targetname.innerHTML = ' ('+json.file+')';
    app.cacheMap();
    app.showTargetFile(json.sourceCompiled);
    app.sourceMeta = [];
    app.dom.source.value = '';
    app.files = [];
    json.sources.forEach(function(source, i){
        var str = json.modules[i];
        // files can arrive in any order, but we dont really care about that.
        // last one stays on screen until user clicks on a segment in the source.
        app.files[i] = str;
        app.dom.sourcename.innerHTML = ' ('+source+')';
        app.dom.source.innerHTML = str.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'\n\n';
      
    });
            
  },
  /**
   * @param {string} segment
   * @return {number[]} One, four, or five fields
  */
  decodeSegment: function(segment){
    // decode the VLQ encoded segment. 1, 3, or 4 fields
    var bytes = this.decodeBase64(segment);
    var fields = [];
    while (bytes.length) fields.push(app.decodeOneNumberVQL(bytes));
    fields[5] = segment; // debug
    return fields;
  },
  /**
   * Very straightforward base64 decoder.
   *
   * @param {string} str
   * @return {number[]}
   */
  decodeBase64: function(str){
    return str.split('').map(function(b){
      // each byte is base64 encoded
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(b);
    });
  },
  /**
   * Decode one signed number in a VQL. Will remove used items from
   * the input array.
   *
   * @param {number[]} bytes
   * @return {number}
   */
  decodeOneNumberVQL: function(bytes){
    var num = 0;
    var n = 0;
    do {
      var b = bytes.shift();
      num += (b & 31) << (5*n++);
    } while (b>>5);
    var sign = num & 1;
    num >>= 1;
    if (sign) num = -num;
    return num;
  }
}
var app = {
        dom: {
          fileSelect: document.getElementById('fileSelect'),
          segmentIn: document.getElementById('segment'),
          segmentOut: document.getElementById('segout'),
          source: document.getElementById('inp'),
          target: document.getElementById('out'),
          map: document.getElementById('map'),
          sourcename: document.getElementById('sourcename'),
          targetname: document.getElementById('targetname'),
        },
        sourcemap: '',
        cache: null,
        sourceMeta: null,
        realOutput: '',
        files: [],
        filenames: [],
        fileColors: ['black', 'green', 'blue', 'purple', ],
        /**
         * Init
         */
        run: function(json){
          app.registerAll();
          app.dom.map.value = json;
          app.process(json)
        },
        /**
         * Wire up the UI
         */
        registerAll: function(){
          app.registerSegmentEvents();
          //app.registerMapEvents();
          app.registerOutputEvents();
        },
        /**
         * The top segment input allows you to translate one segment (only shows delta's, not totals)
         */
        registerSegmentEvents: function(){
          app.dom.segmentIn.onkeyup = function(e){
            var data = app.decodeSegment(app.dom.segmentIn.value);
            app.dom.segmentOut.innerHTML =
              data+' :: ' +
                '\u0394 target col: '+data[0]+', ' +
                '\u0394 file index: '+data[1]+', ' +
                '\u0394 source line: '+data[2]+', ' +
                '\u0394 source col: '+data[3]+', ' +
                '\u0394 name index: '+data[4];
          };
        },
        /**
         * The sourcemap textarea. Will try to process the sourcemap as you type. Loads
         * any found sources through ajax. Parses the mappings.
         */
        process: function(str){
            var json = JSON.parse(str);
            app.filenames = json.sources;
            app.sourcemap = json.mappings;
            app.dom.targetname.innerHTML = ' ('+json.file+')';
            app.cacheMap();
            app.showTargetFile(json.sourceCompiled);
            app.sourceMeta = [];
            app.dom.source.value = '';
            app.files = [];
            json.sources.forEach(function(source, i){
                var str = json.modules[i];
                // files can arrive in any order, but we dont really care about that.
                // last one stays on screen until user clicks on a segment in the source.
                app.files[i] = str;
                app.dom.sourcename.innerHTML = ' ('+source+')';
                app.dom.source.innerHTML = str.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'\n\n';
              
            });
            
        },
        /**
         * Registers a delegate to listen for clicks on "segments".
         * When you click on one, the proper file is loaded and
         * the first character of that range is highlighted, after
         * which the ui jumps to that element.
         * Might not be super efficient, but it doesn't need to be.
         */
        registerOutputEvents: function(){
          app.dom.target.onclick = function(e){
            if (e.target.className.substring(0,7) == 'segment') {
              var data = e.target.getAttribute('data-source');
              var _ = data.split(',');
              var file = parseInt(_[0],10);
              var col = parseInt(_[1],10);
              var row = parseInt(_[2],10);
              var lines = app.files[file].split('\n');
              var sourceLines = app.files[file].replace(/&/g,'&amp;').replace(/</g,'&lt;').split('\n');
              var line = lines[row];
              sourceLines[row] =
                line.slice(0, col).replace(/&/g,'&amp;').replace(/</g,'&lt;')+
                '<span style="background-color:red; color:white;">'+
                line.slice(col,col+1).replace(/&/g,'&amp;').replace(/</g,'&lt;')+
                '</span>'+
                line.slice(col+1).replace(/&/g,'&amp;').replace(/</g,'&lt;');
              app.dom.source.innerHTML = sourceLines.join('\n');
              app.dom.source.querySelector('span').scrollIntoView();
              app.dom.sourcename.innerHTML = ' ('+app.filenames[file]+')';
            }
          };
        },
        /**
         * Compute the absolute positions of each segment. This eases the lookup times
         * at runtime because all segments are relative. That means in order to know the
         * position of the very last segment, you need to run through all the previous
         * segments first.
         * (While this could be delegated to run on-demand, and only up to the point where
         * you need it, I chose not to do that for simplicity.)
         *
         * The data is cached and when the generated source UI is built, the absolute
         * values are set as an attribute. After that, the cache is no longer used as
         * it will immediately use just that absolute file/col/row value and act accordingly.
         */
        cacheMap: function(){
          var cache = app.cache = [];
          var tcol = 0;
          var trow = 0;
          var scol = 0;
          var srow = 0;
          var file = 0;
          app.sourcemap.split(';').forEach(function(line,i){
            tcol = 0;
            line.split(',').forEach(function(str){
              var segment = app.decodeSegment(str);
              // 0: target col delta, 1: file index, 2: source row delta, 3: source col delta, 4: name index, 5: chunk string
              cache.push({
                segment: segment,
                tcol: tcol+=segment[0]|0,
                trow: i,
                scol: scol+=segment[3]|0,
                srow: srow+=segment[2]|0,
                file: file+=segment[1]|0,
              });
            });
          });
        },
        /**
         * Shows the "compiled source", that's the result of processing one or
         * more source files into that single file. This function will process
         * the already computed absolute values of each segment, back to front,
         * and inject span tags to wrap around a single character, for each
         * segment. We wrap around just one character because frankly, we don't
         * really know the actual length (a shortcoming of source maps, imo).
         * The user will then be able to click this span, and a delegate will
         * load the proper source file and jump to the proper position in that
         * file.
         *
         * @param {string} str The contents of the target file to load (so the actual script)
         */
        showTargetFile: function(str){
          app.realOutput = str;
          var lines = str.split('\n');
          var output = [];
          var i=0;
          for (var i=app.cache.length; i--;) {
            var segment = app.cache[i];
            while (lines.length > segment.trow+1) output.unshift('\n'+lines.pop().replace(/&/g,'&amp;').replace(/</g,'&lt;'));
            var line = lines[segment.trow];
            var at = segment.tcol;
            if (at+1<line.length) {
              output.unshift(line.slice(at+1).replace(/&/g,'&amp;').replace(/</g,'&lt;'));
              lines[segment.trow] = line.slice(0,at+1);
            }
            output.unshift('</span>');
            output.unshift(line.slice(at, at+1).replace(/&/g,'&amp;').replace(/</g,'&lt;'));
            output.unshift('<span ' +
              'class="segment '+(app.fileColors[segment.file]||'other')+'" ' +
              'data-source="'+segment.file+","+segment.scol+","+segment.srow+'" ' +
              'title="'+('file:'+segment.file+' scol:'+segment.scol+' srow:'+segment.srow+' tcol:'+segment.tcol+' trow:'+segment.trow)+'"' +
            '>');
            lines[segment.trow] = line.slice(0,at);
          }
          while (lines.length) output.unshift('\n'+lines.pop().replace(/&/g,'&amp;').replace(/</g,'&lt;'));
          app.dom.target.innerHTML = output.join('');
        },
        /**
         * Decode given string, which should be a segment in a sourcemap.
         * A segment consists of one, four, or five Base64 VLQ encoded
         * numbers, which are all delta's, and which are fields of the
         * source map.
         *
         * Base64 is a simple mapping of 0-63 to: A-Za-z0-9+/
         *
         * VLQ is "variable length quantifier" and deemed an efficient way
         * to encode small numbers.
         *
         * This function will return an array with each field that was
         * encountered. The fields are: [target pos, source file index,
         * target row, target col, name index]. All fields are delta,
         * relative to the previous field (first field offsets at zero).
         *
         * @param {string} segment
         * @return {number[]} One, four, or five fields
         */
        decodeSegment: function(segment){
          // decode the VLQ encoded segment. 1, 3, or 4 fields
          var bytes = this.decodeBase64(segment);
          var fields = [];
          while (bytes.length) fields.push(app.decodeOneNumberVQL(bytes));
          fields[5] = segment; // debug
          return fields;
        },
        /**
         * Very straightforward base64 decoder.
         *
         * @param {string} str
         * @return {number[]}
         */
        decodeBase64: function(str){
          return str.split('').map(function(b){
            // each byte is base64 encoded
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(b);
          });
        },
        /**
         * Decode one signed number in a VQL. Will remove used items from
         * the input array.
         *
         * @param {number[]} bytes
         * @return {number}
         */
        decodeOneNumberVQL: function(bytes){
          var num = 0;
          var n = 0;
          do {
            var b = bytes.shift();
            num += (b & 31) << (5*n++);
          } while (b>>5);
          var sign = num & 1;
          num >>= 1;
          if (sign) num = -num;
          return num;
        }
      };
      //app.run();