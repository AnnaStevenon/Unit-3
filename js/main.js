// 1. Join attribute data with geospatial data
// 2. Code reorganization or why global variables are no good
// 3. fun with color scaling
// 4. a taste of responsive design

// some sort of anonymous function to avoid global variables - end brackets at the end of the code
(function (){

    //execute script when window is loaded

    window.onload = setMap();

    // "psuedo" global variables that multiple functions will use
    // global variables can cause problems when there are linked libraries
        // global variables in the libraries might have the same name and they could overwrite eachother - oh no!

    // variables for data join
    var attrArray = ["Cows", "CowsAndCalves" ,"CornGrain" ,"CornSilage" ,"Oats", "Soybean" ,"Wheat"];
    var expressed = attrArray[0]; //variable selected for intial viewing on the map


    //set up map
    function setMap(){
        var width = window.innerWidth * 0.45,
            height = 500;
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
            .scale(6100) //pixel scale or zoom level
            .angle(62) //trying to make it look normal
            .translate([width/2, height/2]) //how big map is in the frame

        //define path. Path is a way to convert projection into a usable object
        var path = d3.geoPath()
            .projection(projection);
        //loading the data as promises
        var promises = [
            d3.csv("data/countiesData.csv"),
            d3.json("data/Counties.topojson"),
            d3.json("data/Midwest_states.topojson")
        ];

        //apply callback to all promised data
        Promise.all(promises).then(callback);

        function callback(data){
            var csvData = data[0],
                counties = data[1],
                states = data[2];
            //soft convert to use topojson format
            var Counties = topojson.feature(counties, counties.objects.Counties).features; //the .features part puts it in array format for loading each county one by one
            var midStates = topojson.feature(states, states.objects.Midwest_states);


        //add States to the map all at once - would remove the .features 
            var Midwest = map.append("path")
                .datum(midStates) //drawing all counties together
                .attr("class", "states")
                .attr("d", path); //setting "d" to the path variable, "d" defines the coordinates of the path - has nothing to do with d used in a function


            Counties = joinData(Counties, csvData);

            var colorScale = makeColorScale(csvData);

            setEnumerationUnits(Counties, map, path, colorScale);

            setChart(csvData, colorScale);

        };

    };

    //function to create coordinated bar chart
    function setChart(csvData, colorScale){
        //chart frame dimensions
        var chartWidth = window.innerWidth * 0.45,
            chartHeight = 500;

        //create a second svg element to hold to bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart")
            .style("background-color", "grey");
    };

    function joinData(Counties, csvData) {
          // loop through csv to assign each set of csv attribute values to geojson county
          for (var i = 0; i < csvData.length; i ++) {
            var csvRegion = csvData[i]; //the current region
            var csvKey = csvRegion.County // the CSV primary key

            //loop through geojson counties to find correct county
            for (var a=0; a < Counties.length; a++) {
                var geojsonProps = Counties[a].properties; //the current county geojson properties
                var geojsonKey = geojsonProps.County; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey) {
                    //assign all attributes and values
                    attrArray.forEach(function (attr) {
                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign aatribute and value to geojson properties
                    });
                };
            };
        };
        console.log(Counties);

        return Counties;
    };

//function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [
            "#FEE5D9",
            "#FCAE91",
            "#FB6A4A",
            "#DE2D26",
            "#A50F15"
        ];

        //create color scale generator
        var colorScale = d3.scaleQuantile()
            .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };

        //assign array of expressed values as scale domain
        colorScale.domain(domainArray);

        return colorScale;
    };

    function setEnumerationUnits(Counties, map, path, colorScale) {
        
        var WICounties = map
        .selectAll(".counties")
        .data(Counties)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "counties " + d.properties.County;
        })
        .attr("d", path)
        .style("fill", function(d) {
            if (d.properties[expressed] > 0) {
            return colorScale(d.properties[expressed])}
            else { return "gray"} // data with a zero means that data was not publishable/available for that county, there are no "zero" values that mean the yield or number of cows was zero.
        });
    };

})(); // the end of the anonymous function at the begining of this code