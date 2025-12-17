const drawSalaryPyramid = (dataset) => {

  const spacing = { top: 40, right: 30, bottom: 40, left: 60 };
  const svgWidth = 560;
  const svgHeight = 500;

  const chartWidth = svgWidth - spacing.left - spacing.right;
  const chartHeight = svgHeight - spacing.top - spacing.bottom;

  const svg = d3.select("#pyramid")
    .append("svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  const chart = svg.append("g")
    .attr("transform", `translate(${spacing.left}, ${spacing.top})`);

  const femaleData = dataset.filter(d => d.gender === "Female");
  const maleData = dataset.filter(d => d.gender === "Male");

  const binMaker = d3.bin()
    .value(d => d.salary);

  const femaleBins = binMaker(femaleData);
  const maleBins = binMaker(maleData);

  const maxPercent = 15;

  const leftScale = d3.scaleLinear()
    .domain([maxPercent, 0])
    .range([0, chartWidth / 2]);

  const rightScale = d3.scaleLinear()
    .domain([0, maxPercent])
    .range([chartWidth / 2, chartWidth]);

  const salaryMin = femaleBins[0].x0;
  const salaryMax = femaleBins[femaleBins.length - 1].x1;

  const verticalScale = d3.scaleLinear()
    .domain([salaryMin, salaryMax])
    .range([chartHeight, 0]);

  const bars = chart.append("g");

  bars.selectAll(".female-bar")
    .data(femaleBins)
    .join("rect")
    .attr("class", "female-bar")
    .attr("x", d => leftScale((d.length / dataset.length) * 100))
    .attr("y", d => verticalScale(d.x1))
    .attr("width", d =>
      chartWidth / 2 - leftScale((d.length / dataset.length) * 100)
    )
    .attr("height", d =>
      verticalScale(d.x0) - verticalScale(d.x1)
    );

  bars.selectAll(".male-bar")
    .data(maleBins)
    .join("rect")
    .attr("class", "male-bar")
    .attr("x", chartWidth / 2)
    .attr("y", d => verticalScale(d.x1))
    .attr("width", d =>
      rightScale((d.length / dataset.length) * 100) - chartWidth / 2
    )
    .attr("height", d =>
      verticalScale(d.x0) - verticalScale(d.x1)
    );

  chart.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(
      d3.axisBottom(leftScale)
        .tickValues([15, 10, 5, 0])
        .tickSizeOuter(0)
    );

  chart.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(
      d3.axisBottom(rightScale)
        .tickValues([5, 10, 15])
        .tickSizeOuter(0)
    );

  chart.append("g")
    .call(d3.axisLeft(verticalScale));

  svg.append("text")
    .attr("x", spacing.left + chartWidth / 2)
    .attr("y", svgHeight - 5)
    .attr("text-anchor", "middle")
    .text("Percentage of respondents");

  svg.append("text")
    .attr("x", 5)
    .attr("y", 20)
    .text("Annual Salary (USD)");
};
