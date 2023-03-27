//execute script when window is loaded

var w = 900, h = 500;

var cityPop = [
    {
        city: 'Madison',
        population: 233209
    },
    {
        city: 'Milwaukee',
        population: 594833
    },
    {
        city: 'Green Bay',
        population: 104057
    },
    {
        city: 'Superior',
        population: 27244
    }
];

var format = d3.format(",");


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
    var x = d3.scaleLinear() //creates the scale for circles center x coordinate
        .range([90,750]) // output min and max
        .domain([0,3]); //input min and max
    var minPop = d3.min(cityPop, function(d){ //find minimum value of the array
        return d.population;
    });
    var maxPop = d3.max(cityPop, function(d){ //min and max take the array and then an accessor functiion that tells each method where to look for values to compare
        return d.population;
    });
    var y = d3.scaleLinear() //scale for circles center y coordinate
        .range([450,50])
        .domain([0, 700000]);
    var color = d3.scaleLinear()
        .range(['#FDBE85', '#D94701'])
        .domain([minPop, maxPop]);
    var circles = container.selectAll(".circles") //no circles yet, acts as a placeholder - creating an empty selection
        .data(cityPop)// feed in an array
        .enter() // joins the data to the selection; everything after .enter acts as a loop and is applied to each datum in the array
        .append("circle") //add a circle for each datum - always creates the same number of new HTML elements as data values in the dataset
        .attr("class", "circles") //apply a class name to all circles
        .attr("id", function(d){
            return d.city; //give the ID as the name of each city
        })
        .attr("r", function(d){ //radius sized based on population
            var area = d.population *0.01;
            return Math.sqrt(area/Math.PI)
        })
        .attr("cx", function(d,i){ //position based on array index value i
            return x(i); // use the scale generator with the index to place each circle horizontally
        })
        .attr("cy", function(d){ //position based on population d
            return y(d.population);
        })
        .style("fill", function(d, i){
            return color(d.population);
        })
        .style("stroke", "#000"); //black outline
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
            //vertical position centered on each circle
            return y(d.population) - 2;
        })
        //first line of the label
        var nameLine = labels.append("tspan")
            .attr("class", "nameLine")
            .attr("x", function(d,i){
                //horizontal position to the upper right of each circle
                return x(i) + Math.sqrt(d.population *0.01 / Math.PI) + 5;
            })
            .text(function(d){
                return d.city;
            })
        // second line of the label
        var popLine = labels.append("tspan")
            .attr("class", "popLine")
            .attr("x", function(d,i){
                //horizontal position to the upper right of each circle
                return x(i) + Math.sqrt(d.population *0.01 / Math.PI) + 5;
            })
            .attr("dy", "15") //vertical offset
            .text(function(d){
                return "Pop. " + format(d.population);
            });
    var yAxis = d3.axisLeft(y); //creating y axis generator
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50,0)")
        .call(yAxis);
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");
};



