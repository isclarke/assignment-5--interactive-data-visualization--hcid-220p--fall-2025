function parseSalary(s) {
  if (!s) return 0;
  const cleaned = s.replace(/\$/g, "").replace(/,/g, "");
  const parts = cleaned.split("-");
  if (parts.length === 2) {
    return (+parts[0].trim() + +parts[1].trim()) / 2;
  } else {
    return +cleaned.trim();
  }
}

d3.csv("/data/data.csv", d => ({
  role: d.role,
  salary: parseSalary(d.pay_annual_USD)
})).then(dataset => drawViolinCharts(dataset));

const drawViolinCharts = (data) => {
  const margin = {top: 40, right: 20, bottom: 55, left: 60};
  const width = 1000;
  const height = 400;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const roles = ["Designer", "Scientist", "Developer", "Analyst", "Leadership"];
  const binCount = 20;
  const slateGray = "#305252";
  const gray = "#606464";
  const white = "#faffff";

  const svg = d3.select("#violin")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scalePoint()
    .domain(roles)
    .range([0, innerWidth])
    .padding(0.5);

  const yScale = d3.scaleLinear()
    .domain([0, 240000])
    .range([innerHeight, 0]);

  innerChart.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale));

  innerChart.append("g")
    .call(d3.axisLeft(yScale)
      .tickValues(d3.range(0, 260000, 20000))
      .tickFormat(d3.format("$,.0f"))
    );

  const binsPerRole = roles.map(role => {
    const salaries = data.filter(d => d.role === role).map(d => d.salary);
    const bins = d3.bin()
      .domain([0, 240000])
      .thresholds(binCount)(salaries);
    const mean = d3.mean(salaries);
    const sorted = salaries.sort(d3.ascending);
    const q1 = d3.quantile(sorted, 0.25);
    const median = d3.quantile(sorted, 0.5);
    const q3 = d3.quantile(sorted, 0.75);
    return {role, bins, salaries, mean, q1, median, q3};
  });

  const maxBinLength = d3.max(binsPerRole.flatMap(r => r.bins.map(b => b.length)));
  const violinsScale = d3.scaleLinear()
    .domain([0, maxBinLength])
    .range([0, xScale.step() / 2 * 0.9]);

  // Draw full violins
  binsPerRole.forEach(dRole => {
    const centerX = xScale(dRole.role);
    const roleContainer = innerChart.append("g");

    const areaGenerator = d3.area()
      .x0(d => centerX - violinsScale(d.length)) // left
      .x1(d => centerX + violinsScale(d.length)) // right
      .y(d => yScale(d.x1) + (yScale(d.x0) - yScale(d.x1)) / 2)
      .curve(d3.curveCatmullRom); // smooth curve

    roleContainer.append("path")
      .attr("d", areaGenerator(dRole.bins))
      .attr("fill", slateGray)
      .attr("fill-opacity", 0.3)
      .attr("stroke", "none");

    // Interquartile range
    roleContainer.append("rect")
      .attr("x", centerX - 4)
      .attr("y", yScale(dRole.q3))
      .attr("width", 8)
      .attr("height", yScale(dRole.q1) - yScale(dRole.q3))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", gray);

    // Mean
    roleContainer.append("circle")
      .attr("cx", centerX)
      .attr("cy", yScale(dRole.mean))
      .attr("r", 3)
      .attr("fill", white);

    // Median
    roleContainer.append("line")
      .attr("x1", centerX - 6)
      .attr("x2", centerX + 6)
      .attr("y1", yScale(dRole.median))
      .attr("y2", yScale(dRole.median))
      .attr("stroke", gray)
      .attr("stroke-width", 2);
  });
};
