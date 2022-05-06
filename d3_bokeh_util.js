function cds_to_objarray(cds_data){
  var keys = Object.keys(cds_data)
  var z = d3.transpose(Object.values(cds_data))
  var o = z.map(x=>Object.assign(...keys.map((k, i) => ({[k]: x[i]}))))
  return o}
  
function objarray_to_cds(objarray){
	var a = d3.transpose(objarray.map(x=>Object.values(x)))
  var d = Object.assign(...Object.keys(objarray[0]).map((k, i) => ({[k]: a[i]})))
  return d
	}
	
//multifilter
//given array of objects (x), and a dict containing field names for keys and arrays of the values to filter for as values
//e.g. x = [{'fruit':'banana','size'='small},...]
//e.g. dict = {'fruit':['banana','orange'],'size':['small','medium']}
//returns array of indices that correspond to the dataset filtered according to dict
//e.g. above would return indices for small and medium bananas and oranges
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