const drawSalaryPyramid = (dataset) => {

    const spacing = { top: 40, right: 30, bottom: 40, left: 80 };
    const svgWidth = 560;
    const svgHeight = 500;

    const chartWidth = svgWidth - spacing.left - spacing.right;
    const chartHeight = svgHeight - spacing.top - spacing.bottom;

    /* ===================== */
    /*   SVG + CHART GROUP   */
    /* ===================== */
    const svg = d3.select(`#pyramid`)
        .append(`svg`)
        .attr(`viewBox`, `0 0 ${svgWidth} ${svgHeight}`);

    const chart = svg.append(`g`)
        .attr(`transform`, `translate(${spacing.left}, ${spacing.top})`);

    /* ===================== */
    /*      DATA SPLIT       */
    /* ===================== */
    const femaleData = dataset.filter(d => d.gender === `Female`);
    const maleData = dataset.filter(d => d.gender === `Male`);

    /* ===================== */
    /*        BINNING        */
    /* ===================== */
    const binGenerator = d3.bin()
        .value(d => d.salary)
        .domain([0, 240000])
        .thresholds(d3.range(0, 240001, 20000));

    const femaleBins = binGenerator(femaleData);
    const maleBins = binGenerator(maleData);

    /* ===================== */
    /*        SCALES         */
    /* ===================== */
    const maxPercent = 15;

    const leftScale = d3.scaleLinear()
        .domain([maxPercent, 0])
        .range([0, chartWidth / 2]);

    const rightScale = d3.scaleLinear()
        .domain([0, maxPercent])
        .range([chartWidth / 2, chartWidth]);

    const yScale = d3.scaleBand()
        .domain(femaleBins.map(d => d.x0))
        .range([chartHeight, 0])
        .padding(0.1);

    /* ===================== */
    /*         BARS          */
    /* ===================== */
    const barGroup = chart.append(`g`);

    // FEMALE (LEFT)
    barGroup.selectAll(`.female-bar`)
        .data(femaleBins)
        .join(`rect`)
        .attr(`class`, `female-bar`)
        .attr(`x`, d =>
            leftScale((d.length / femaleData.length) * 100)
        )
        .attr(`y`, d => yScale(d.x0))
        .attr(`width`, d =>
            chartWidth / 2 -
            leftScale((d.length / femaleData.length) * 100)
        )
        .attr(`height`, yScale.bandwidth());

    // MALE (RIGHT)
    barGroup.selectAll(`.male-bar`)
        .data(maleBins)
        .join(`rect`)
        .attr(`class`, `male-bar`)
        .attr(`x`, chartWidth / 2)
        .attr(`y`, d => yScale(d.x0))
        .attr(`width`, d =>
            rightScale((d.length / maleData.length) * 100) -
            chartWidth / 2
        )
        .attr(`height`, yScale.bandwidth());

    /* ===================== */
    /*         AXES          */
    /* ===================== */

    // LEFT X AXIS
    chart.append(`g`)
        .attr(`transform`, `translate(0, ${chartHeight})`)
        .call(
            d3.axisBottom(leftScale)
                .tickValues([15, 10, 5, 0])
                .tickFormat(d => `${d}%`)
                .tickSizeOuter(0)
        );

    // RIGHT X AXIS
    chart.append(`g`)
        .attr(`transform`, `translate(0, ${chartHeight})`)
        .call(
            d3.axisBottom(rightScale)
                .tickValues([5, 10, 15])
                .tickFormat(d => `${d}%`)
                .tickSizeOuter(0)
        );

    // Y AXIS
    chart.append(`g`)
        .call(
            d3.axisLeft(yScale)
                .tickFormat(d => `$${d / 1000}k`)
        );

    /* ===================== */
    /*        LABELS         */
    /* ===================== */
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

/* ===================== */
/*     LOAD THE DATA     */
/* ===================== */
d3.csv(`/data/data.csv`, d => ({
    gender: d.gender,
    salary: +d.salary
}))
    .then(data => {
        drawSalaryPyramid(data);
    });
