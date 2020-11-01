pathx=[[0]];
pathx1=[[0,0]];
svg_from="";


function test(){

	
	
	//#####find and extract second path patnew from all paths costyx and rotate and concantenate with first path pathx#############################################################################################
    //********************************************************************************************************************************************

	  
	let minDiff = Number.MAX_VALUE;
	let num0=0;
	let num1=0;
	let num2=0;
	let num3 = 0;
	let num4 = 0;
	let num5 = 0;
	
	let num6 = 0;
	let num7 = 0;
	let num8 = 0;



//pathx contain all paths with sum finds
//pathx1 contain all paths with coord finds
//costyx contain all paths remainder with diff
//costyx1 contain all paths remainder with coord
//find most closest element of pathx and one element of rest of paths costyx
  for(let i = 0; i < pathx.length; i++){
	  //console.log("pathx["+i+"]="+pathx);
    for(let m =0; m< costyx.length; m++){
      for(let n = 0; n < costyx[m].length; n++){
		x=pathx1[i][0];
		y=pathx1[i][1];
		x1=costyx1[m][n][0];
		y1=costyx1[m][n][1];
		//a=x*x+y*y;
        //console.log(costyx1[m][n]+" "+costyx1[m][n][0]+" "+costyx1[m][n][1]+" "+a);
		x=x-x1;
		y=y-y1;
		let currDiff = x*x+y*y;
		
        if(currDiff < minDiff){
          minDiff = currDiff;
		  //console.log("costyx[m][n]="+costyx[m][n]+" pathx[i]="+pathx[i]+" diff="+minDiff);
          num1 = costyx[m][n];
          num2 = pathx[i];
          num3 = i;
          num4 = m;
          num5 = n;
		  //console.log("costyx1[m][n]="+costyx1[m][n]+" pathx1[i]="+pathx[i]+" i="+i+" m="+m+" n="+n);
        }
      }
    }
  }
  patnew=[];
  patnew1=[];
  
  
  //console.log("final   costyx1[m][n]="+costyx1[num4][num5]+" pathx1[i]="+pathx1[num3]+" i="+num3+" m="+num4+" n="+num5);

//extract pathnew from all paths costyx		  
patnew=costyx.splice(num4,1);
patnew=patnew[0];


//rotate patnew
patnew = patnew.splice(num5).concat(patnew);		
pathx=pathx.slice(0,num3).concat( patnew, pathx.slice(num3));	
//........................

patnew1=costyx1.splice(num4,1);
patnew1=patnew1[0];

//rotate patnew
patnew1 = patnew1.splice(num5).concat(patnew1);		
pathx1=pathx1.slice(0,num3).concat( patnew1, pathx1.slice(num3));	

  }
	//####################################################################################################
		
function finalx(){
	

		  

     for(i = 0; i < pathx1.length; i++){
		 
	x=pathx1[i][0];
	y=pathx1[i][1];	 
	svg_from +=" L "+x+","+y;
    x=pathx1[i][0]*.2646;
	y=pathx1[i][1]*.2646;

	fgcode1 +="G01 X"+x+" Y"+y+"\n";

	
			 	

	g=x*x+y*y;
	//console.log(pathx[i]+"="+g);
		 
	}	  
	 //console.log(fgcode);
	   }

