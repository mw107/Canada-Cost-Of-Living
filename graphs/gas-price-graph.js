const loadGasPricesGraph = () => {
  const dataNode = document.getElementById("dataviz");
  dataNode.innerHTML = "";

  const textNode = document.getElementById("datatext");
  textNode.innerHTML = `
    <span style="display: flex; justify-content: center; font-family: Nunito; font-size: 30px; font-style: bold; font-variant: normal; font-weight: 700; line-height: 50px;">
      Average Gas Prices
    </span>
    <span style="display: flex; justify-content: center; font-family: PT Sans; font-size: 16px; font-style: normal; font-variant: normal; font-weight: 700; line-height: 24px;">
      The average price for a liter of gas in Ontario was $1.02 in 2008 and has increased to $1.59 by the middle of 2023.
    </span>
    <span style="display: flex; justify-content: center; font-family: PT Sans; font-size: 16px; font-style: normal; font-variant: normal; font-weight: 700; line-height: 24px;">
      This represents a growth of 55% over this period.
    </span>
  `

  var margin = {top: 10, right: 50, bottom: 50, left: 80}
  var width = 1000 - margin.left - margin.right
  var height = 600 - margin.top - margin.bottom;

  var svg = d3.select("#dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var animatedPath = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "#ffca3a")
    .attr("stroke-width", 1.5)

  var animatedAnnotations = svg.append("g")
    .style("opacity", 0);

  d3.csv("./data/gas-prices.csv",
    function(d){
      return { date : d3.timeParse("%B %Y")(d.date), value : d.price / 100 }
    },
    function(data) {
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      svg.append("text")
        .attr("class", "axis-title")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 25)
        .style("text-anchor", "middle")
        .text("Year");

      var y = d3.scaleLinear()
        .domain([0, 3])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format("$,.2f")));

      svg.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 25)
        .style("text-anchor", "middle")
        .text("Average Retail Gas Prices ($/Liter)");

      var line = d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })

      animatedPath.datum(data)
        .attr("d", line)

      var pathLength = animatedPath.node().getTotalLength();  

      var animatedDots = svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.date) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 5)
        .attr("fill", "#ffca3a")
        .style("opacity", 0);
      
      animatedPath
        .attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", function() {
          animatedAnnotations.transition()
            .duration(500)
            .style("opacity", 1);

          animatedAnnotations.call(annotations);

          animatedDots.transition()
            .duration(500)
            .style("opacity", 1);

          animatedDots.on("mouseover", function(d) {
            Tooltip
              .style("opacity", 1)
              .html(`Average New Car Price: $${d.value.toLocaleString()}<br>Date: ${d.date.toLocaleString("default", { month: "long", year: "numeric" })}`)
              .style("left", (d3.mouse(this)[0] + 100) + "px")
              .style("top", (d3.mouse(this)[1] + 100) + "px")
            
            d3.select(this)
              .attr("r", 6)
              .attr("fill", "#ffca3a"); 
          })
          .on("mouseleave", function(d) {
            Tooltip
              .style("opacity", 0)
              .transition()
              .duration(100)
      
            d3.select(this)
              .attr("r", 5)
              .attr("fill", "#ffca3a")
          });
        });
      
      var Tooltip = d3.select("#dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute")

      const annotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations([
          {
            type: d3.annotationLabel,
            note: {
              label: "$" + data[0].value.toLocaleString(),
              wrap: 100,
            },
            connector: {
              end: "arrow"
            },
            x: x(data[0].date),
            y: y(data[0].value),
            dx: 50,
            dy: 80,
          },
          {
            type: d3.annotationLabel,
            note: {
              label: "$" + data[data.length - 1].value.toLocaleString(),
              wrap: 100,
            },
            connector: {
              end: "arrow"
            },
            x: x(data[data.length - 1].date),
            y: y(data[data.length - 1].value),
            dx: -10,
            dy: 60,
          },
          {
            type: d3.annotationCallout,
            note: {
              label: "Pandemic Demand Collapse",
              wrap: 200,
            },
            x: x(data[147].date),
            y: y(data[147].value) + 20,
            dx: -10,
            dy: 50,
          },
          {
            type: d3.annotationCallout,
            note: {
              label: "Post Pandemic Surge",
              wrap: 200,
            },
            x: x(data[160].date) - 5,
            y: y(data[160].value) - 20,
            dx: -10,
            dy: -50,
          },
          {
            type: d3.annotationCallout,
            note: {
              label: "Ukraine Invasion",
              wrap: 200,
            },
            x: x(data[169].date) - 5,
            y: y(data[169].value) - 20,
            dx: -10,
            dy: -50,
          },
        ])
  })
}