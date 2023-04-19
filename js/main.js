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
    var attrArray = ["Cows", "Cows and Calves" ,"Bushels of Corn Grain per Acre" ,"Tons of Corn Silage per Acre" ,"Bushels of Oats per Acre", "Bushels of Soybeans per Acre" ,"Bushels of Wheat per Acre"];
    var expressed = attrArray[0]; //variable selected for intial viewing on the map

    var yScale

    //chart fram dimensions
    var chartWidth = window.innerWidth * 0.50,
    chartHeight = 500,
    leftPadding = 50,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
    
// should define the yscale variable here so it is psuedo global................

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
                .attr("d", path) //setting "d" to the path variable, "d" defines the coordinates of the path - has nothing to do with d used in a function
                .style("fill", "#d1e0d1");

            Counties = joinData(Counties, csvData);

            var colorScale = makeColorScale(csvData);

            setEnumerationUnits(Counties, map, path, colorScale);

            yScale = makeYScale(csvData); // call yscale function

            setChart(csvData, colorScale);

            createDropdown(csvData);


        };

    };

//function to create coordinated bar chart
function setChart(csvData, colorScale){

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight + 5)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([66000, 0]); 

    //set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.County;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function(d, i){
            return chartHeight - yScale(parseFloat(d[expressed]));         
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        })
        .on("mouseover", function(event, d){
            highlight(d);
        })
        .on("mouseout", function(event, d){ 
            dehighlight(d);
        })
        .on("mousemove", moveLabel);

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 110)
        .attr("y", 30)
        .attr("class", "chartTitle")

    updateChart(bars, csvData.length, colorScale)

    //create vertical axis generator
    var yAxis = d3.axisLeft() 
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight + 5)
        .attr("transform", translate); 

    var desc = bars.append("desc").text('{"stroke": "none", "stroke-width": "0px"}');
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
       // console.log(Counties);

        return Counties;
    };

//function to create color scale generator 
// using natural breaks
    function makeColorScale(data){
        var colorClasses = [
            "#FEE5D9",
            "#FCAE91",
            "#FB6A4A",
            "#DE2D26",
            "#A50F15"
        ];

    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
};
    // make a y scale that changes with attribute data
    function makeYScale(data) {
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };
        var max = d3.max(domainArray);

        var yScale = d3.scaleLinear()
            .range([0, chartHeight])
            .domain([max, 0]); 

        return yScale;
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
                else { return "#ccc"} // data with a zero means that data was not publishable/available for that county, there are no "zero" values that mean the yield or number of cows was zero.
            })
            .on("mouseover", function(event, d){
                highlight(d.properties);
            })
            .on("mouseout", function (event, d){
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel)

        var desc = WICounties.append("desc").text('{"stroke": "#000", "stroke-width": "0.5px"}');
    };


    
    //function to create a drop down menu and change listener and handler function
    function createDropdown(csvData) {
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });

        //add intial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d})
            .text(function(d) { return d});
    };

    //dropdown change event handler
    function changeAttribute(attribute, csvData){
        //change the expressed attribute
        expressed = attribute;
        //recreate the color scale
        var colorScale = makeColorScale(csvData);
        //recolor enumeration units
        var counties = d3.selectAll(".counties")
        .transition() //create a transition between attribute selections for the user to notice
        .duration(1000)
        .style("fill", function (d) {
            var value = d.properties[expressed];
            if (value) {
                return colorScale(d.properties[expressed]);
            } else {
                return "#ccc";
            }
        });

        // recreate the yScale
        yScale = makeYScale(csvData);
        // create the axis
        var yAxis = d3.axisLeft()
            .scale(yScale);
        //sort, resize, and recolor bars
        var bars = d3.selectAll(".bar")
        //sort bars
            .sort(function(a, b){
                return b[expressed] - a[expressed];
            })
            .transition() //add animated transition
            .delay(function(d, i){
                return i * 5
            })
            .duration(500);
            
        //update the axis
        var axis = d3.select(".axis")
            .call(yAxis);

        updateChart(bars, csvData.length, colorScale);
    };

    function updateChart(bars, n, colorScale) {
        //position bars
        bars.attr("x", function (d, i) {
            return i * (chartInnerWidth / n) + leftPadding;
        })
            //size/resize bars
            .attr("height", function (d, i) {
                return chartHeight - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function (d, i) {
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //color/recolor bars
            .style("fill", function (d) {
                var value = d[expressed];
                if (value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            });

        //text for chart title
        var chartTitle = d3
            .select(".chartTitle")
            .text(expressed + " in Each County");
    }


    //function to highlight enumeration units and bars
    function highlight(props) {
        //change stroke
        var selected = d3
            .selectAll("." + props.County)
            .style("stroke", "#64FFDA")
            .style("stroke-width", "4");
        setLabel(props);
    }

     //function to reset the element style on mouseout
    function dehighlight(props) {
        var selected = d3
            .selectAll("." + props.County)
            .style("stroke", function () {
                return getStyle(this, "stroke");
            })
            .style("stroke-width", function () {
                return getStyle(this, "stroke-width");
            });

        function getStyle(element, styleName) {
            var styleText = d3.select(element).select("desc").text();

            var styleObject = JSON.parse(styleText);

            return styleObject[styleName];
        }
        //remove info label
        d3.select(".infolabel").remove();
    }

    //function to create dynamic label
    function setLabel(props) {
        console.log("here!");
        //label content
        var labelAttribute = "<h1>" + props[expressed] + "</h1><br><b>" + expressed + "</b>";

        //create info label div
        var infolabel = d3
            .select("body")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", props.County + "_label")
            .html(labelAttribute);

        var regionName = infolabel.append("div").attr("class", "labelname").html(props.name);
    }

    //function to move info label with mouse
    function moveLabel() {
        //get width of label
        var labelWidth = d3.select(".infolabel").node().getBoundingClientRect().width;

        //use coordinates of mousemove event to set label coordinates
        var x1 = event.clientX + 10,
            y1 = event.clientY - 75,
            x2 = event.clientX - labelWidth - 10,
            y2 = event.clientY + 25;

        //horizontal label coordinate, testing for overflow
        var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
        //vertical label coordinate, testing for overflow
        var y = event.clientY < 75 ? y2 : y1;

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    }

})(); // the end of the anonymous function at the begining of this code

