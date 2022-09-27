//transforms columndatasource data to array of objects
function cds_to_objarray(cds_data){
  var keys = Object.keys(cds_data)
  var z = d3.transpose(Object.values(cds_data))
  var o = z.map(x=>Object.assign(...keys.map((k, i) => ({[k]: x[i]}))))
  return o}
  
//transforms array of objects to columndatasource "dictionary"/object 
function objarray_to_cds(objarray){
  var a = d3.transpose(objarray.map(x=>Object.values(x)))
  if (a.length>0){
    var d = Object.assign(...Object.keys(objarray[0]).map((k, i) => ({[k]: a[i]})))
    }
  return d
  }
//copies cds_data (or anything of that form) to clipboard, comma separated
function cds_data_to_clipboard(cds_data){
    var s = Object.keys(cds_data).join(',')
    var a = [s]
    var f = Object.keys(cds_data)[0]
    for (var i=0;i<cds_data[f].length;i++){
            var ss = ''
            for (var fi=0;fi<Object.keys(cds_data).length;fi++){
                    var append = cds_data[Object.keys(cds_data)[fi]][i].toString()
                    if (fi != Object.keys(cds_data).length-1){
                            append=append+','}
                    ss = ss+append
                    }
            a.push(ss)                                
            }                       
    a = a.join("\n")
    navigator.clipboard.writeText(a)
	// const copyToClipboard = (text) => {
	  // const textarea = document.createElement('textarea');
	  // document.body.appendChild(textarea);
	  // textarea.value = text;
	  // textarea.select();
	  // textarea.setSelectionRange(0, 99999);
	  // document.execCommand('copy');
	  // document.body.removeChild(textarea);
	  // };
	// copyToClipboard(a)
    }
//multifilter
//given array of objects (x), and a dict containing field names for keys and arrays of the values to filter for as values
//e.g. x = [{'fruit':'banana','size'='small'},...]
//e.g. dict = {'fruit':['banana','orange'],'size':['small','medium']}
//returns array of indices that correspond to the dataset filtered according to dict
//e.g. above would return indices for small and medium bananas and oranges
//d3 can do this already?
function filtobj(x,dict){
    var filt_inds = []
    for (var i=0;i<x.length;i++){
      var cntr = 0
      for (var [k,v] of Object.entries(dict)){
        if (v.includes(x[i][k]))
          {cntr++}
        }
      if (cntr == Object.keys(dict).length){
        filt_inds.push(i)}                          
      }
    return filt_inds
    }

//innerFilter --> filters an array of objects by the keys and values present in another array of objects
//differs from filtobj --> where filter obj returns any combo given a dict, this cuts down to only the specific combos given in the filter array
function innerfilter(myArray,myFilter){return myArray.filter(function(i){
    return myFilter.some(function(j){
        return !Object.keys(j).some(function(prop){
            return i[prop] != j[prop];
        });
    });
    });}

//"smart" label callback
//figure = bokeh figure, srcdata = the datasource labels are to be generated on, x_,y_,lbl_field = field names in the src
//returns datasource for labelset
function smartlabel_zoom(figure,srcdata,x_field,y_field,lbl_field){
    // get ranges of current zoom level
    var xr = [figure.x_range.start,figure.x_range.end]
    var yr = [figure.y_range.start,figure.y_range.end]
    if (xr.length < 2){
        return}
    //thresh being a threshold value normalized to the zoom level
    var thresh = d3.min([yr[1]-yr[0],xr[1]-xr[0]])/10
    //convert src to array of objects
    var a_obj = cds_to_objarray(srcdata)
    //map an index
    a_obj.map((d,i)=>d['index']=i)
    //filter to only the current zoom box
    var filt = a_obj.filter(function(d){return d[x_field] >xr[0] && d[x_field] < xr[1] && d[y_field] >yr[0] && d[y_field] < yr[1]})

    //arbitrary but seems to work --> if there are less than 250 pts plotted, do the cross join work
    if (filt.length<250){
        //simplify data down
        var pts = filt.map(d=>{return{'index':d.index,'x':d[x_field],'y':d[y_field]}})
        //cross join, and remove the join to itself (i.e. where the two indices are the same
        var cross = d3.cross(pts,pts).map((d,i)=>{return {'i_1':d[0],'i_2':d[1]}}).filter(d=>{return d.i_1.index!=d.i_2.index})
        //calc distances for each pair
        cross.map(d=>d['distance'] = Math.pow(Math.pow(d.i_1.x-d.i_2.x,2)+Math.pow(d.i_1.y-d.i_2.y,2),0.5))
        // ID indices where the MINIMUM distance pair is greater than thresh, these are the ones we want labels for
        var keep_inds = d3.filter(d3.rollups(cross,v=>d3.min(v,d=>d.distance),d=>d.i_1.index),d=>{return d[1]>thresh}).map(d=>d[0])
        //generate labels for the source accordingly
        var lbls = d3.filter(a_obj,(d,i)=>{return keep_inds.includes(i)})
        if (lbls.length>0){
            var upd_src = objarray_to_cds(lbls)
            var result = {[x_field]:upd_src[x_field],[y_field]:upd_src[y_field],[lbl_field]:upd_src[lbl_field]}}
        }
    else {var result = {[x_field]:[],[y_field]:[],[lbl_field]:[]}}
    return result
    }
// makeArr is like np.linspace
function makeArr(startValue, stopValue, cardinality) {
      var arr = [];
      var step = (stopValue - startValue) / (cardinality - 1);
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
      }
      return arr;
    }

// getClosest: given start, stop, no. points (cardinality), AND a grid array (1D array)
// returns array of values for the closest array
function getClosest(startValue, stopValue, cardinality,grid_arr) {
      var arr = [];                 
     
      var step = (stopValue - startValue) / (cardinality - 1);
      for (var i = 0; i < cardinality; i++) {
        var x = startValue + (step * i)
        
        var closest = grid_arr.reduce(function(prev, curr) {
          return (Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
        });
        arr.push(closest);
      }
      return arr
    }
    
//reshape 1D array to 2D
function reshape(arr, rows, cols) {
  const result = new Array(rows);
  for (let row = 0; row < rows; row++) {
    result[row] = new Array(cols);
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      result[row][col] = arr[row * cols + col];
    }
  }
  return result;}
    
//project: orthognal projection of xp,yp to a line spanning x1,y1 to x2,y2
function project(xp, yp, x1, y1, x2, y2) {
      var atob = {
        x: x2 - x1,
        y: y2 - y1
      };
      var atop = {
        x: xp - x1,
        y: yp - y1
      };
      var len = atob.x * atob.x + atob.y * atob.y;
      var dot = atop.x * atob.x + atop.y * atob.y;
      var t = Math.min(1, Math.max(0, dot / len));
      //dot = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x );

      return {

        x: x1 + atob.x * t,
        y: y1 + atob.y * t
      }
    }
    
//check for intersection
//returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
  }
}

//calculate intersection
function calculateIntersection(p1, p2, p3, p4) {
        // down part of intersection point formula
    var d1 = (p1.x - p2.x) * (p3.y - p4.y); // (x1 - x2) * (y3 - y4)
    var d2 = (p1.y - p2.y) * (p3.x - p4.x); // (y1 - y2) * (x3 - x4)
    var d  = (d1) - (d2);
  
    if(d == 0) {
        throw new Error('Number of intersection points is zero or infinity.');
    }
  
    // upper part of intersection point formula
    var u1 = (p1.x * p2.y - p1.y * p2.x); // (x1 * y2 - y1 * x2)
    var u4 = (p3.x * p4.y - p3.y * p4.x); // (x3 * y4 - y3 * x4)
      
    var u2x = p3.x - p4.x; // (x3 - x4)
    var u3x = p1.x - p2.x; // (x1 - x2)
    var u2y = p3.y - p4.y; // (y3 - y4)
    var u3y = p1.y - p2.y; // (y1 - y2)
  
    // intersection point formula
    
    var px = (u1 * u2x - u3x * u4) / d;
    var py = (u1 * u2y - u3y * u4) / d;
    
    var p = { x: px, y: py };
  
    return p;
}

//needs to be tested --> but should be able to turn a multiline xs/ys arrays into a stackplot patch geom anchored at y=0
function stack_patches(xs,ys){
  xa = [Array.from(xs[0])].concat(xs)
  ya = [Array(ys[0].length).fill(0)].concat(ys)
  var csy = d3.transpose(d3.transpose(ya).map(x=>d3.cumsum(x)))
  var xg = []
  var yg = []
  for (var i = 0;i<xa.length-1;i++){
      xg.push(xa[i].concat(xa[i+1].reverse()))
    yg.push(csy[i].concat(csy[i+1].reverse()))
      }
    return {'xp':xg,'yp':yg}}
    
        
//IDW --> basic inverse distance weighting in 2D
// eval_points --> array of objects containing x and y keys to evaluate values on
// data_points --> array of objects containing x, y and val keys to provide data to interpolate with
// p --> exponent on inv distance weighting
// max_dist --> maximum distance to consider
// max_neighbours --> max number of points to consider
// var idw = IDW(...args)
// idw.calculateMatrix() -->will add val to each entry in eval_points
function IDW(eval_points,data_points,p,max_dist,max_neighbours) {
  this.eval_points = eval_points
  this.points = data_points;
  this.p = p;
    this.max_dist = max_dist
    this.max_neighbours = max_neighbours

  this.calculateMatrix = function () {
        for (var i = 0; i < this.eval_points.length; i++) {
                var val = calcVal(this.eval_points[i], this.points, this.p,this.max_dist,this.max_neighbours);
                this.eval_points[i].val = val
                ;
            }
        }
    function calcVal(v, points,p,md,mn) {
      var dists = []
      for (var i = 0; i < points.length; i++) {
                dists.push(calcDist(v, points[i]));
                }
            //get the indices of the sorted distances
      var sorted_inds = Array.from(Array(dists.length).keys()).sort((a, b) => dists[a] < dists[b] ? -1 : (dists[b] < dists[a]) | 0)
      //cut down to max number of neighbours, and only those less than max_dist
      sorted_inds = sorted_inds.slice(0,mn).filter(d=>{return dists[d]<md})
      //id any zero indices
      var zero_dist_chk = dists.filter(d=>{return d==0}).length

      if (zero_dist_chk > 0){
        var zero_dist_inds = sorted_inds.slice(0,zero_dist_chk)
        return d3.mean(zero_dist_inds.map(d=>points[d].val)) //take average of all zero dist values if there are any
        }
      else {
                //otherwise do the inverse distance weighted work
        var ru = d3.rollup(sorted_inds,d=>{return {wts:d3.sum(d,v=>(1/dists[v])**p),wtdvals:d3.sum(d,v=>points[v].val*(1/dists[v])**p)}})
        return ru['wtdvals']/ru['wts']
        }
          }
      function calcDist(p, q) {
            return (Math.sqrt( Math.pow((q.x-p.x),2) + Math.pow((p.y-q.y),2)));
        }
        }

//given bnds {xmin: , xmax: , ymin: , ymax: }, Xdim = number of columns, Ydim number of rows
// returns an array of coordinate objects in a grid  
function genGridPts(bnds,Xdim,Ydim){
  var xa = makeArr(bnds.xmin,bnds.xmax,Xdim)
  var ya = makeArr(bnds.ymin,bnds.ymax,Ydim)
  var cx = d3.cross(ya,xa).map(v=>{return {'x':v[1],'y':v[0]}})
  return cx
    }

//convert a cds driving polygons/patches to a geojson format
//does not support holes
//xf,yf,pf x,y field names, list of properties you want to retrieve with them
function cds_to_polygeojson(cds_data,xf,yf,pf){
  var ao = cds_to_objarray(cds_data)
  var features = []
  for (var i=0; i<ao.length; i++){
    //zip up coords
    var cs = d3.zip(ao[i][xf],ao[i][yf])
    //filter for desired features
    var props = Object.keys(ao[i]).filter(
                            x=>pf.includes(x)).reduce(
                    (obj, key) => {obj[key] = ao[i][key];return obj;}, {});
        var app = {'type':'Feature','id':i,'geometry': {'type': 'Polygon','coordinates': [cs]},'properties':props}
    features.push(app)
    }
    return {'type': 'FeatureCollection','features':features}
  }
  
function download_string(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    }

//trigger reset button on all figures/plots with a certain tag
//call reset_plot_views(Bokeh.index[Object.keys(Bokeh.index)[0]],'yourtag')
function reset_plot_views(el,tag) {
            for (let v of el.child_views) {
                if (v.__proto__.constructor.__name__ == 'PlotView') {
					if (v.model.tags.includes(tag)){
						//console.log(v)
						v.reset()
						}
                }
                else {                
                    if (v.child_views) {
                        reset_plot_views(v,tag)
                    }
                }
            }
        }
