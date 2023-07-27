var margin = {top: 10, right: 50, bottom: 50, left: 80}
var width = 1000 - margin.left - margin.right
var height = 600 - margin.top - margin.bottom;

var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("./data/ontario-home-price.csv",
  function(d){
    return { date : d3.timeParse("%Y-%m")(d.period), value : Number(d.price_sold) }
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
      .domain([200000, 1400000])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format("$,d")));

    svg.append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .style("text-anchor", "middle")
      .text("Median Property Value");

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2db83d")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
      )
    
    var Tooltip = d3.select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute")

    var mouseover = function(d) {
      Tooltip
        .style("opacity", 1)
        .html(`Median Property Value: $${d.value.toLocaleString()}<br>Year: ${d.date.toLocaleString("default", { month: "long", year: "numeric" })}`)
        .style("left", (d3.mouse(this)[0] + 100) + "px")
        .style("top", (d3.mouse(this)[1] + - 50) + "px")
      
      d3.select(this)
        .attr("r", 6)
        .attr("fill", "#238f2f"); 
    }
    var mouseout = function(d) {
      Tooltip
        .style("opacity", 0)
        .transition()
        .duration(100)

      d3.select(this)
        .attr("r", 5)
        .attr("fill", "#2db83d")
    }

    svg.append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return x(d.date) } )
      .attr("cy", function(d) { return y(d.value) } )
      .attr("r", 5)
      .attr("fill", "#2db83d")
      .on("mouseover", mouseover)
      .on("mouseleave", mouseout)

    const annotations = d3.annotation()
      .type(d3.annotationLabel)
      .annotations([
        {
          type: d3.annotationLabel,
          note: {
            label: '$' + data[0].value.toLocaleString(),
            wrap: 100,
          },
          connector: {
            end: "arrow"
          },
          x: x(data[0].date),
          y: y(data[0].value),
          dx: 50,
          dy: -40,
        },
        {
          type: d3.annotationLabel,
          note: {
            label: '$' + data[data.length - 1].value.toLocaleString(),
            wrap: 100,
          },
          connector: {
            end: "arrow"
          },
          x: x(data[data.length - 1].date),
          y: y(data[data.length - 1].value),
          dx: -10,
          dy: -50,
        },
        {
            type: d3.annotationCallout,
            note: {
              label: '2017 Housing Bubble',
              wrap: 200,
            },
            x: x(data[104].date) - 5,
            y: y(data[104].value) - 20,
            dx: -10,
            dy: -50,
          },
          {
            type: d3.annotationCallout,
            note: {
              label: 'Pandemic Housing Bubble',
              wrap: 200,
            },
            x: x(data[162].date) - 5,
            y: y(data[162].value) - 20,
            dx: -10,
            dy: -50,
          },
      ])

    svg.append('g')
      .call(annotations);
})