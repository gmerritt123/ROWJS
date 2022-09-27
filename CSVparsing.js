function get_cds_data_from_csv(cb_obj,i=0){
    if (cb_obj.multiple == true){
        var v = cb_obj.value[i]}
    else {var v = cb_obj.value}
    //returns {'c':[array_of_cs], ..} from a FileInput widget
    var p = Papa.parse(atob(v),{encoding: "UTF-8"})
    var data=p.data
    var header=data[0]
    data = data.slice(1)
    var d = {}
    for (var c=0; c < header.length;c++){
         d[header[c]] = data.map(x=>x[c])}
    return d
    }

function cds_to_csv(cds_data,filename){
    var d = {'fields':[],'data':[]}
    for (const [k,v] of Object.entries(cds_data)){
        d['fields'].push(k)
        d['data'].push(v)
        }
    //need to transpose data for Papa
     d['data'] = d['data'][0].map((_, colIndex) => d['data'].map(row => row[colIndex]))
	 //d3 alternative
	 // d['data'] = d3.transpose(d['data')
    var csv = Papa.unparse(d)
    var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(csvData);
    elem.download = filename+'.csv';
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem)
    }