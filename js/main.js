//execute script when window is loaded

var w = 900, h = 500;

window.onload = function(){
    var container = d3.select("body") //get the <body> element from the DOM
        .append("svg") // put a new svg in the body
        .attr("width", w)
        .attr("height", h)
        .attr("class", "container") // always assign a class (as the block name) for styling an future selection
        .style("background-color", "rgba(0,0,0,0.2)"); // only put a semicolon at the end of the block!!
    var innerRect = container.append("rect") //put a new rectangle in the svg - should only have one new element per block
        .datum(400)
        .attr("width", function(d){
            return d * 2;
        })
        .attr("height", function(d) {
            return d;

        })
        .attr("class", "innerRect") //class name
        .attr("x", 50) // position from left on the horizontal axis
        .attr("y", 50) // position from the top on the vertical axis
        .style("fill", "#FFFFFF"); // fill color
    var dataArray = [10, 20, 30, 40, 50];
    var circles = container.selectAll(".circles") //no circles yet, acts as a placeholder - creating an empty selection
        .data(dataArray)// feed in an array
        .enter() // joins the data to the selection; everything after .enter acts as a loop and is applied to each datum in the array
        .append("circle") //add a circle for each datum - always creates the same number of new HTML elements as data values in the dataset
        .attr("class", "circles") //apply a class name to all circles
        .attr("r", function(d, i){
            console.log("d:", d, "i:", i) //d is the datum value, i is the index for the array
            return d;
        })
        .attr("cx", function(d, i){
            return 70 + (i*180);
        })
        .attr("cy", function(d){
            return 450 - (d*5);
        })
};



