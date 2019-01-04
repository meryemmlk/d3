// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis, width) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) *0.9,
      d3.max(healthData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis, height) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis])*0.9 ,
      d3.max(healthData, d => d[chosenYAxis])*1.1 
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(textGroup, circles, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circles.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circles;
}
function renderText(textGroup, circles, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-8)
    .attr("y", d => newYScale(d[chosenYAxis])+5);

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circles, textGroup, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty(%):";
  }
  else if ((chosenXAxis === "age")){
    var label = "Age(Median):";
  }else {
         var label = "Household Income(Median):";   
           };
  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare(%):";
  }
  else if ((chosenYAxis === "smokes")){
    var ylabel = "Smokes(%):";
  }else {
         var ylabel = "Obesity(%):";   
           };
    
  console.log(label,ylabel);
  
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
       // console.log(d);
        console.log(d[chosenXAxis]);
      return (`${d.state} ${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circles.call(toolTip);
  textGroup.call(toolTip);
    
  circles.on("mouseover", function(data, index) {
    //console.log(data);
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  textGroup.on("mouseover", function(data, index) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    }); 
    
  var groups = [circles, textGroup]    

  return groups;
}







// make the chart responsive
function makeResponsive(){
    
       // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
  // var svgArea = d3.select("#scatter");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

    // svg params
  var svgHeight = window.innerHeight - 60;
  //var svgWidth = window.innerWidth;  
  var element = d3.select('.container').node();    
  var svgWidth = element.getBoundingClientRect().width;

    console.log(svgWidth)

    var margin = {
      top: 20,
      right: 20,
      bottom: 120,
      left: 100
    };

// chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    
// Initial Params
var chosenXAxis = "poverty"; 
var chosenYAxis = "healthcare";   

// Import Data
d3.csv("../data/data.csv")
  .then(function(healthData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    //console.log(healthData)
    // Step 2: Create scale functions
    // ==============================
   /* var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d.poverty)-1, d3.max(healthData, d => d.poverty)+1])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d.healthcare)])
      .range([height, 0]);*/
     var xLinearScale = xScale(healthData, chosenXAxis, width);
     var yLinearScale = yScale(healthData, chosenYAxis, height);

    // Step 3: Create axis functions - initial axes
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    

    // Step 4: Append Axes to the chart
    // ==============================
  
     // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
                    .data(healthData)
                    .enter()
    var circles = circlesGroup.append("circle")
                    .attr("cx", d => xLinearScale(d.poverty))
                    .attr("cy", d => yLinearScale(d.healthcare))
                    .attr("r", "14")
                    .attr("fill", "blue")
                    .attr("opacity", ".5");
    
    // Step 5: Create Texts inside circles
    // ==============================
    //Add the SVG Text Element to the svgContainer
    var text = chartGroup.selectAll("text")
                         .data(healthData)
                         .enter()
     var textGroup = circlesGroup.append("text")
                         .attr("x", d => xLinearScale(d.poverty)-8)
                         .attr("y", d => yLinearScale(d.healthcare)+5)
                         .text( function (d) { return d.abbr; })
                         .attr("font-family", "sans-serif")
                         .attr("font-size", "10px")
                         .attr("fill", "white");



    // Step 6: Initialize tool tip
    // ==============================
    /*groups = updateToolTip(chosenXAxis, chosenYAxis, circles, textGroup, circlesGroup);
          circles = groups[0]; 
          textGroups = groups[1];*/
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state} ${d.abbr}<br>Poverty: ${d[chosenXAxis]}<br>lack healthcare: ${d[chosenYAxis]}`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    circles.call(toolTip);
    textGroup.call(toolTip);
    
    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circles.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    
    textGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
     
    // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .attr("class", "axisText")
    .text("Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
    
  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // // Create group for  3 y- axis labels
  var yLabelsGroup = chartGroup.append("g");
    
  var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare") // value to grab for event listener
    .attr("dy", "1em")
    .classed("active", true)
    .attr("class", "axisText")
    //.classed("axis-text", true)
    .text("Lacks Healthcare (%)");
   
  var smokesLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes") // value to grab for event listener
      .attr("dy", "1em")
      //.attr("class", "axisText")
      .classed("inactive", true)
      .text("Smokes (%)");
    
  var obeseLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 0)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity") // value to grab for event listener
      .attr("dy", "1em")
      //.attr("class", "axisText")
      .classed("inactive", true)
      .text("Obese (%)");
    
    
  
  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis, width);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circles = renderCircles(textGroup, circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textGroup = renderText(textGroup, circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        //circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        
          //==============================
         /*var groups = updateToolTip(chosenXAxis, chosenYAxis, circles, textGroup, circlesGroup);
         circles = groups[0]; 
         textGroups = groups[1];*/
         
          //================================
          if (chosenXAxis === "poverty") {
            var label = "Poverty(%):";
          }
          else if ((chosenXAxis === "age")){
            var label = "Age(Median):";
          }else {
                 var label = "Household Income(Median):";   
                   };
          if (chosenYAxis === "healthcare") {
            var ylabel = "Lacks Healthcare(%):";
          }
          else if ((chosenYAxis === "smokes")){
            var ylabel = "Smokes(%):";
          }else {
                 var ylabel = "Obesity(%):";   
                   };
          
          var toolTip = d3.tip()
          .attr("class", "tooltip")
          .offset([80, -60])
          .html(function(d) {
            return (`${d.state} ${d.abbr}<br>${label}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
          });

        // Step 7: Create tooltip in the chart
        // ==============================
        circles.call(toolTip);
        textGroup.call(toolTip);

        // Step 8: Create event listeners to display and hide the tooltip
        // ==============================
        circles.on("mouseover", function(data) {
          toolTip.show(data, this);
        })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });

        textGroup.on("mouseover", function(data) {
          toolTip.show(data, this);
        })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });
          //==================================*/
          
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          }
      }
    });
    
    yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var yvalue = d3.select(this).attr("value");
      if (yvalue !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = yvalue;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(healthData, chosenYAxis, height);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(textGroup, circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textGroup = renderText(textGroup, circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        //circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
          // updateToolTip function above csv import
          /*var groups = updateToolTip(chosenXAxis, chosenYAxis, circles, textGroup, circlesGroup);
          circles = groups[0]; 
          textGroups = groups[1];*/
        
           //================================
          if (chosenXAxis === "poverty") {
            var label = "Poverty(%):";
          }
          else if ((chosenXAxis === "age")){
            var label = "Age(Median):";
          }else {
                 var label = "Household Income(Median):";   
                   };
          if (chosenYAxis === "healthcare") {
            var ylabel = "Lacks Healthcare(%):";
          }
          else if ((chosenYAxis === "smokes")){
            var ylabel = "Smokes(%):";
          }else {
                 var ylabel = "Obesity(%):";   
                   };
          
          var toolTip = d3.tip()
          .attr("class", "tooltip")
          .offset([80, -60])
          .html(function(d) {
            return (`${d.state} ${d.abbr}<br>${label}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
          });
        // Step 7: Create tooltip in the chart
        // ==============================
        circles.call(toolTip);
        textGroup.call(toolTip);

        // Step 8: Create event listeners to display and hide the tooltip
        // ==============================
        circles.on("mouseover", function(data) {
          toolTip.show(data, this);
        })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });

        textGroup.on("mouseover", function(data) {
          toolTip.show(data, this);
        })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });
          //==================================*/  
          
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes"){
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          }
      }
    });
   
    
  });
    
}

makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
