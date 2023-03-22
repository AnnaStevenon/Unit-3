//execute script when window is loaded

var w = 900, h = 500;

window.onload = function(){
    var container = d3.select("body") //get the <body> element from the DOM
        .append("svg") // put a new svg in the body
        .attr("width", w)
        .attr("height", h)
        .attr("class", "container") // always assign a class (as the block name) for styling an future selection
        .style("background-color", "rgba(0,0,0,0.3)"); // only put a semicolon at the end of the block!!
    var innerRect = container.append("rect") //put a new rectangle in the svg - should only have one new element per block
        .datum(400)
        .attr("width", function(d){
            return d * 2;
        })
        .attr("height", function(d) {
            return d;

        })
        
};



