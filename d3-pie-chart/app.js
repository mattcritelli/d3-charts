var height = 600;
var width = 600;
var minYear = d3.min(birthData, d => d.year);
var yearData = getYearData(birthData, minYear)
var months = getMonths(yearData);
var svg = d3.select("svg")

svg
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`)
    .classed("outer-chart", true);

svg
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`)
    .classed("inner-chart", true);

svg
  .append("text")
    .classed("title", true)
    .attr("x", width / 2)
    .attr("y", 20)
    .style("text-anchor", "middle")
    .style("font-size", "1.3em")

d3.select("input")
  .property("min", minYear)
  .property("max", d3.max(birthData, d => d.year))
  .property("value", minYear)
  .on("input", function(){
    makePieChart(+d3.event.target.value)
  })

const tooltip = d3.select("body")
    .append("div")
      .classed("tooltip", true)

function quarterlyChart(inputYear) {
  var quarterlyBirths = getBirthsByQuarter(getYearData(birthData, inputYear))

  var qtrColorScale = d3.scaleOrdinal()
                        .domain(quarterlyBirths.map(item => item.quarter))
                        .range(["#f0ece9", "#d65279", "#72707c", "#d3d1e3"]);

  var qtrArcs = d3.pie()
                  .value(d => d.births)
                  .sort((a, b) => a.quarter - b.quarter)
                  (quarterlyBirths);

  var qtrPath = d3.arc()
                  .outerRadius(width / 4)
                  .innerRadius(0);

  var qtrUpdate = d3.select(".inner-chart")
                    .selectAll(".arc")
                    .data(qtrArcs);

  qtrUpdate
    .exit()
    .remove();

  qtrUpdate
    .enter()
    .append("path")
      .classed("arc", true)
    .merge(qtrUpdate)
      .attr("fill", d => qtrColorScale(d.data.quarter))
      .attr("stroke", "black")
      .attr("d", qtrPath)
      .on("mousemove", showTooltip)
      .on("mouseout", hideTooltip);
}

function monthlyChart(inputYear) {
  var monthColorScale = d3.scaleOrdinal()
                          .domain(months)
                          .range(d3.schemeCategory20);

  var monthArcs = d3.pie()
                    .value(d => d.births)
                    .sort((a, b) => {
                      return months.indexOf(a.month) - months.indexOf(b.month);
                    })
                    (getYearData(birthData, inputYear));

  var monthPath = d3.arc()
                    .outerRadius(width / 2 - 50)
                    .innerRadius(width / 4);

  var monthUpdate = d3.select(".outer-chart")
                      .selectAll(".arc")
                      .data(monthArcs);

  monthUpdate
    .exit()
    .remove();

  monthUpdate
    .enter()
    .append("path")
      .classed("arc", true)
    .merge(monthUpdate)
      .attr("fill", d => monthColorScale(d.data.month))
      .attr("stroke", "black")
      .attr("d", monthPath)
      .on("mousemove", showTooltip)
      .on("mouseout", hideTooltip);
}

function makePieChart(inputYear) {
  updateTitle(inputYear);
  monthlyChart(inputYear);
  quarterlyChart(inputYear);
}

makePieChart(minYear);

///// Helper Functions /////

// Returns an array of unique months contained in a data set
function getMonths(array) {
  var monthSet = new Set()
  array.forEach(item => monthSet.add(item.month))
  return Array.from(monthSet)
}


// Returns an array of objects with quarterly birth totals for a given year
function getBirthsByQuarter(data) {
  var quarterlyTotal = [
    { quarter: 1, births: 0},
    { quarter: 2, births: 0},
    { quarter: 3, births: 0},
    { quarter: 4, births: 0}
  ]

  for(let monthData of data){
    var { month, births } = monthData
    quarterlyTotal[Math.floor(months.indexOf(month) / 3)].births += births
  }
  return quarterlyTotal
}


// Filters a data set and returns an array with data for a specific year.
function getYearData(data, findYear) {
  return data.filter(d => d.year === findYear);
}

function updateTitle(year) {
  d3.select(".title")
    .text(`Birth by Month and Quarter for ${year}`)
}

function showTooltip(d) {
  const timePeriod = showTimePeriod(d)
  tooltip
    .style("opacity", 1)
    .style("left",`${d3.event.x - tooltip.node().offsetWidth / 2}px`)
    .style("top", `${d3.event.y + 15}px`)
    .html(`
      <p>${timePeriod}: ${d.data.quarter || d.data.month}</p>
      <p>Births: ${d.data.births.toLocaleString()}</p>
    `);
}

function showTimePeriod(d) {
  return d.data.quarter ? "Quarter" : "Month"
}

function hideTooltip() {
  tooltip.style("opacity", 0);
}
