function parseSalary(s) {
    if (!s) return 0;
    const cleaned = s.replace(/\$/g, ``).replace(/,/g, ``);
    const parts = cleaned.split(`-`);
    if (parts.length === 2) {
        return (+parts[0].trim() + +parts[1].trim()) / 2;
    } else {
        return +cleaned.trim();
    }
}

const drawSalaryPyramid = (dataset) => {
    const spacing = { top: 40, right: 30, bottom: 40, left: 80 };
    const svgWidth = 560;
    const svgHeight = 500;
    const chartWidth = svgWidth - spacing.left - spacing.right;
    const chartHeight = svgHeight - spacing.top - spacing.bottom;

    const svg = d3.select(`#pyramid`)
        .append(`svg`)
        .attr(`viewBox`, `0 0 ${svgWidth} ${svgHeight}`);

    const chart = svg.append(`g`)
        .attr(`transform`, `translate(${spacing.left}, ${spacing.top})`);

    const femaleData = dataset.filter(d => d.gender === `Female`);
    const maleData = dataset.filter(d => d.gender === `Male`);

    const thresholds = d3.range(0, 240002, 20000);

    const binGenerator = d3.bin()
        .value(d => d.salary)
        .domain([0, 240000])
        .thresholds(thresholds);

    const femaleBins = binGenerator(femaleData);
    const maleBins = binGenerator(maleData);

    femaleBins.forEach(d => d.percent = (d.length / femaleData.length) * 100);
    maleBins.forEach(d => d.percent = (d.length / maleData.length) * 100);

    const maxPercent = d3.max([...femaleBins, ...maleBins], d => d.percent);

    const xLeft = d3.scaleLinear()
        .domain([0, maxPercent])
        .range([chartWidth / 2, 0]);

    const xRight = d3.scaleLinear()
        .domain([0, maxPercent])
        .range([chartWidth / 2, chartWidth]);

    const yScale = d3.scaleBand()
        .domain(femaleBins.map(d => d.x0))
        .range([chartHeight, 0]);

    // Y axis ticks: show bin ranges including 240k
    chart.append(`g`)
        .call(
            d3.axisLeft(yScale)
                .tickFormat(d => `$${d / 1000}k`)
                .tickSizeOuter(0)
        );

    // Female bars (left)
    chart.selectAll(`.female-bar`)
        .data(femaleBins)
        .join(`rect`)
        .attr(`class`, `female-bar`)
        .attr(`x`, d => xLeft(d.percent))
        .attr(`y`, d => yScale(d.x0))
        .attr(`width`, d => xLeft(0) - xLeft(d.percent))
        .attr(`height`, yScale.bandwidth());

    // Male bars (right)
    chart.selectAll(`.male-bar`)
        .data(maleBins)
        .join(`rect`)
        .attr(`class`, `male-bar`)
        .attr(`x`, xRight(0))
        .attr(`y`, d => yScale(d.x0))
        .attr(`width`, d => xRight(d.percent) - xRight(0))
        .attr(`height`, yScale.bandwidth());

    // X axes
    chart.append(`g`)
        .attr(`transform`, `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xLeft)
            .ticks(5)
            .tickFormat(d => `${d}%`)
            .tickSizeOuter(0)
        );

    chart.append(`g`)
        .attr(`transform`, `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xRight)
            .ticks(5)
            .tickFormat(d => `${d}%`)
            .tickSizeOuter(0)
        );

    chart.append(`g`)
        .call(
            d3.axisLeft(yScale)
                .tickValues(12.5)
                .tickFormat(d => `$${d / 1000}k`)
        );

    // Labels
    svg.append(`text`)
        .attr(`x`, spacing.left + chartWidth / 2)
        .attr(`y`, svgHeight - 5)
        .attr(`text-anchor`, `middle`)
        .text(`Percent of respondents`);

    svg.append(`text`)
        .attr(`x`, 5)
        .attr(`y`, 20)
        .text(`Yearly Salary (USD)`);
};

// Load CSV and draw
d3.csv(`/data/data.csv`, d => ({
    gender: d.gender,
    salary: parseSalary(d.pay_annual_USD)
})).then(data => drawSalaryPyramid(data));
