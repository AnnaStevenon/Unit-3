//execute script when window is loaded

window.onload = setMap();

//set up map
function setMap(){
    var width = 460,
        height = 460;
    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
    //create projection centered on Wisconsin
   var projection = d3.geoAlbers()
        .center([-89, 44]) //long, lat
        .rotate([1,0,0.75]) //long, lat, angle
        .parallels([43,45]) //specficic to coninc projection, two latitudes define top and bottom
        .scale(5500) //pixel scale or zoom level
        .angle(62) //trying to make it look normal
        .translate([width/2, height/2]) //how big map is in the frame

    //define path. Path is a way to convert projection into a usable object
    var path = d3.geoPath()
        .projection(projection);

    var promises = [
        d3.csv("data/countiesData.csv"),
        d3.json("data/Counties.topojson"),
        d3.json("data/Midwest_states.topojson")
    ];

    Promise.all(promises).then(callback);

    function callback(data){
        var csvData = data[0],
            counties = data[1],
            states = data[2];
        //soft convert to use topojson format
        var Counties = topojson.feature(counties, counties.objects.Counties).features; //the .features part puts it in array format for loading each county one by one
        var midStates = topojson.feature(states, states.objects.Midwest_states)

    //add States to the map all at once - would remove the .features 
        var Midwest = map.append("path")
            .datum(midStates) //drawing all counties together
            .attr("class", "states")
            .attr("d", path); //setting "d" to the path variable, "d" defines the coordinates of the path - has nothing to do with d used in a function
    
        var WICounties = map.selectAll(".counties")
            .data(Counties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "counties " + d.properties.County;
            })
            .attr("d", path);

    }

}
