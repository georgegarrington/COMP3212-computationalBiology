var FWGraph = {
    P:100,
    s:1.01,
    mu:0.01,
    nu:0.01
};

var paramFormOld = [100,1.01,0.01,0.01];

// Set the dimensions of the canvas / graph
FWGraph.margin = {top: 30, right: 20, bottom: 30, left: 50},
FWGraph.width = 600 - FWGraph.margin.left - FWGraph.margin.right,
FWGraph.height = 270 - FWGraph.margin.top - FWGraph.margin.bottom;


// Set the ranges
FWGraph.xScale = d3.scale.linear().range([0, FWGraph.width]);
FWGraph.yScale = d3.scale.linear().range([FWGraph.height, 0]);

// Define the axes
FWGraph.xAxis = d3.svg.axis().scale(FWGraph.xScale)
    .orient("bottom").ticks(5);

FWGraph.yAxis = d3.svg.axis().scale(FWGraph.yScale)
    .orient("left").ticks(5);

// Define the line
FWGraph.valueline = d3.svg.line()
    .x(function(d) { return FWGraph.xScale(d.t); })
    .y(function(d) { return FWGraph.yScale(d.n); });
    
// Adds the svg canvas
FWGraph.svg = d3.select("#Graph")
    .append("svg")
    .attr("width", FWGraph.width + FWGraph.margin.left + FWGraph.margin.right)
    .attr("height", FWGraph.height + FWGraph.margin.top + FWGraph.margin.bottom)
    .append("g")
    .attr("transform", 
          "translate(" + FWGraph.margin.left + "," + FWGraph.margin.top + ")");

var colourScheme = d3.scaleOrdinal(d3.schemeCategory10);

function runSimulation() {
    FWGraph.current++;
    var parameterForm = document.getElementById("paramForm");
    for (var i=0; i<4; i++) {
	if (parameterForm.elements[i].value != paramFormOld[i]) {
	    console.log(i, paramFormOld[i], parameterForm.elements[i].value);
	    paramFormOld[i] = parameterForm.elements[i].value;
	    FWGraph.svg.selectAll("*").remove();
	}
    }	
    FWGraph.P = parameterForm.elements[0].value;
    FWGraph.s = parameterForm.elements[1].value;
    FWGraph.mu = parameterForm.elements[2].value;
    FWGraph.nu = parameterForm.elements[3].value;
    var t;
    var n = 0;
    var d1 = [{t:0,n:0}];
    for(t=1; t<10*FWGraph.P; ++t) {
	var ps = 1.0*(FWGraph.s*n)/(FWGraph.s*n + 1.0*(FWGraph.P-n));
	var psm = (1.0-FWGraph.nu)*ps + FWGraph.mu*(1.0-ps);
	var delta = -n;
	n = FWGraph.P*psm;
	delta += n;
	d1.push({"t":t,"n":n});
	if (t>10 && delta < 0.001)
	    break;
    }
    var T = t;
    n=0;
    var d2 = [{t:0,n:0}];
    var r = new Rands();
    for(t=1; t<T; ++t) {
	var ps = 1.0*(FWGraph.s*n)/(FWGraph.s*n + 1.0*(FWGraph.P-n));
	var psm = (1.0-FWGraph.nu)*ps + FWGraph.mu*(1.0-ps);
	n = r.binomial(FWGraph.P, psm)
	d2.push({"t":t,"n":n});
    }
    // Scale the range of the data
    FWGraph.xScale.domain([0, T]);
    FWGraph.yScale.domain([0, FWGraph.P]);

    // Add the valueline path.

    // Data
    var pop = FWGraph.svg.selectAll(".pop")
	.data([{values:d1, id:"inf"},{values:d2, id:"finite"}])
	.enter()
	.append("g")
	.attr("class", "pop");


    var path = FWGraph.svg.selectAll(".pop")
	.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
	    return FWGraph.valueline(d.values);})
	.style("stroke", function(d) {if (d.id=="inf") return "blue";
				      else return "green" });


    
    // Add the X Axis
    FWGraph.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + FWGraph.height + ")")
        .call(FWGraph.xAxis);

    // Add the Y Axis
    FWGraph.svg.append("g")
        .attr("class", "y axis")
        .call(FWGraph.yAxis);

    FWGraph.svg.select(".x.axis")
	.transition()
	.call(FWGraph.xAxis);
    
    FWGraph.svg.select(".y.axis")
	.transition()
	.call(FWGraph.yAxis);

};

