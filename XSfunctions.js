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

	//reshape 1D array into 2D array
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
