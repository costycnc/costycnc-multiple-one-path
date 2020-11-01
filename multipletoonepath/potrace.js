var maxx=0;
var maxy=0;
var xx=0;
var yy=0;
var maxx0=0;
var maxy0=0;
path_ptxy=[];
path_allptxy=[];
path_all=[];
path_ptxy1=[];
path_allptxy1=[];
path_all1=[];

var fgcode="";
var fgcode1="";


var Potrace = (function() {
	
 function Point(x, y) {
    this.x = x;
    this.y = y;
  }
  
  Point.prototype.copy = function(){
    return new Point(this.x, this.y);
  };

  function Bitmap(w, h) {
    this.w = w;
    this.h = h;
    this.size = w * h;
    this.arraybuffer = new ArrayBuffer(this.size);
    this.data = new Int8Array(this.arraybuffer);
  }

  Bitmap.prototype.at = function (x, y) {
    return (x >= 0 && x < this.w && y >=0 && y < this.h) && 
        this.data[this.w * y + x] === 1;
  };

  Bitmap.prototype.index = function(i) {
    var point = new Point();
    point.y = Math.floor(i / this.w);
    point.x = i - point.y * this.w;
    return point;
  };

  Bitmap.prototype.flip = function(x, y) {
    if (this.at(x, y)) {
      this.data[this.w * y + x] = 0;
    } else {
      this.data[this.w * y + x] = 1;
    }
  };
    
  Bitmap.prototype.copy = function() {
    var bm = new Bitmap(this.w, this.h), i;
    for (i = 0; i < this.size; i++) {
      bm.data[i] = this.data[i];
    }
    return bm;
  };

  function Path() {
    this.area = 0;
    this.len = 0;
    this.curve = {};
    this.pt = [];
    this.minX = 100000;
    this.minY = 100000;
    this.maxX= -1;
    this.maxY = -1;
  }

  function Curve(n) {
    this.n = n;
    this.tag = new Array(n);
    this.c = new Array(n * 3);
    this.alphaCurve = 0;
    this.vertex = new Array(n);
    this.alpha = new Array(n);
    this.alpha0 = new Array(n);
    this.beta = new Array(n);
  }

  var imgElement = document.createElement("img"),
      imgCanvas = document.createElement("canvas"),
      bm = null,
      pathlist = [],
      callback,
      info = {
        isReady: false,
        turnpolicy: "minority", 
        turdsize: 2,
        optcurve: true,
        alphamax: 1,
        opttolerance: 0.2
      };

  imgElement.onload = function() {
    loadCanvas();
    loadBm();
  };

  function loadImageFromFile(file) {
    if (info.isReady) {
      clear();
    }
    imgElement.file = file;
    var reader = new FileReader();
    reader.onload = (function(aImg) {
      return function(e) {
        aImg.src = e.target.result;
      };
    })(imgElement);
    reader.readAsDataURL(file);
  }
  
  function loadImageFromUrl(url) {
    if (info.isReady) {
      clear();
    }
    imgElement.src = url;
    
  }
  
  function setParameter(obj) {
   var key;
   for (key in obj) {
     if (obj.hasOwnProperty(key)) {
       info[key] = obj[key];
     }
    }
  }
  
  function loadCanvas() {
    imgCanvas.width = imgElement.width;
    imgCanvas.height = imgElement.height;
    var ctx = imgCanvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
  }
  
  function loadBm() {
    var ctx = imgCanvas.getContext('2d');
    bm = new Bitmap(imgCanvas.width, imgCanvas.height);
    var imgdataobj = ctx.getImageData(0, 0, bm.w, bm.h);
    var l = imgdataobj.data.length, i, j, color;
    for (i = 0, j = 0; i < l; i += 4, j++) {
      color = 0.2126 * imgdataobj.data[i] + 0.7153 * imgdataobj.data[i + 1] +
          0.0721 * imgdataobj.data[i + 2];
      bm.data[j] = (color < 128 ? 1 : 0);
    }
    info.isReady = true;
  }
   function bmToPathlist() {
  
    var bm1 = bm.copy(),
      currentPoint = new Point(0, 0),
      path;
    
    function findNext(point) {
      var i = bm1.w * point.y + point.x;
      while (i < bm1.size && bm1.data[i] !== 1) {
        i++;
      }
      return i < bm1.size && bm1.index(i);
    }
    
    function majority(x, y) {
      var i, a, ct;
      for (i = 2; i < 5; i++) {
        ct = 0;
        for (a = -i + 1; a <= i - 1; a++) {
          ct += bm1.at(x + a, y + i - 1) ? 1 : -1;
          ct += bm1.at(x + i - 1, y + a - 1) ? 1 : -1;
          ct += bm1.at(x + a - 1, y - i) ? 1 : -1;
          ct += bm1.at(x - i, y + a) ? 1 : -1;
        }
        if (ct > 0) {
          return 1;
        } else if (ct < 0) {
          return 0;
        }
      }
      return 0;
    }
    
    function findPath(point) {
      var path = new Path(),
        x = point.x, y = point.y,
        dirx = 0, diry = 1, tmp;
      
      path.sign = bm.at(point.x, point.y) ? "+" : "-";
      
      while (1) {
        path.pt.push(new Point(x, y));
        if (x > path.maxX)
          path.maxX = x;
        if (x < path.minX)
          path.minX = x;
        if (y > path.maxY)
          path.maxY = y;
        if (y < path.minY)
          path.minY = y;
        path.len++;
        
        x += dirx;
        y += diry;
        path.area -= x * diry;
        
        if (x === point.x && y === point.y)
          break;
        
        var l = bm1.at(x + (dirx + diry - 1 ) / 2, y + (diry - dirx - 1) / 2);
        var r = bm1.at(x + (dirx - diry - 1) / 2, y + (diry + dirx - 1) / 2);
        
        if (r && !l) {
          if (info.turnpolicy === "right" ||
          (info.turnpolicy === "black" && path.sign === '+') ||
          (info.turnpolicy === "white" && path.sign === '-') ||
          (info.turnpolicy === "majority" && majority(x, y)) ||
          (info.turnpolicy === "minority" && !majority(x, y))) {
            tmp = dirx;
            dirx = -diry;
            diry = tmp;
          } else {
            tmp = dirx;
            dirx = diry;
            diry = -tmp;
          }
        } else if (r) {
          tmp = dirx;
          dirx = -diry;
          diry = tmp;
        } else if (!l) {
          tmp = dirx;
          dirx = diry;
          diry = -tmp;
        }
      }
      return path;
    }
    
    function xorPath(path){
      var y1 = path.pt[0].y,
        len = path.len,
        x, y, maxX, minY, i, j;
      for (i = 1; i < len; i++) {
        x = path.pt[i].x;
        y = path.pt[i].y;
        
        if (y !== y1) {
          minY = y1 < y ? y1 : y;
          maxX = path.maxX;
          for (j = x; j < maxX; j++) {
            bm1.flip(j, minY);
          }
          y1 = y;
        }
      }
      
    }
    	costy=[];
	costyx=[];
	costy1=[];
	costyx1=[];
	path_all=[];
	path_all1=[];
	path_allptxy=[];
	path_allptxy1=[];
    while (currentPoint = findNext(currentPoint)) {  //303

      path = findPath(currentPoint);
      
      xorPath(path);
      
      if (path.area > info.turdsize) {
        pathlist.push(path);		
     		     for(i = 0; i < path.len; i++){ 
				 //for(i = 0; i < path.len; i+=50){ 
             //costy.push(path.pt[i]);
			 x=path.pt[i].x;
	         y=path.pt[i].y;
			 //costy1.push(x*x+y*y);
			 costy.push(x*x+y*y);
			 costy1.push([x,y]);
            } 	

        costyx.push(costy);	
        costyx1.push(costy1);	

costy=[];
costy1=[];
test();
      }
    }
    
  }
  
  
    function process(c) {
    if (c) {
      callback = c;
    }
    if (!info.isReady) {
      setTimeout(process, 100);
      return;
    }
    bmToPathlist();
	finalx();
    //processPath();
    callback();
    callback = null;
  }

  
  
  function getSVG(size, opt_type) {


    var w = bm.w * size, h = bm.h * size,
    c, i, strokec, fillc, fillrule;

    var svg = '<svg id="svg" version="1.1" width="' + w + '" height="' + h +
        '" xmlns="http://www.w3.org/2000/svg">';
		
		
    svg += '<path d="M 0,0 ';
    svg += svg_from;
	
	
	
    if (opt_type === "curve") {
      strokec = "black";
      fillc = "none";
      fillrule = '';
    } else {
      strokec = "none";
      fillc = "black";
      fillrule = ' fill-rule="evenodd"';
    }
    svg += '" stroke="' + strokec + '" fill="' + fillc + '"' + fillrule + '/></svg>';
	console.log(svg);
    return svg;
  }
  
    function fgcode() {
		return fgcode1;
 }
  return{
    loadImageFromFile: loadImageFromFile,
	process: process,
	img: imgElement,
    getSVG: getSVG,
	fgcode: fgcode
	/*
    loadImageFromUrl: loadImageFromUrl,
    setParameter: setParameter,
    process: process,
    getSVG: getSVG,
    img: imgElement
	*/
  };
})();