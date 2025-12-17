// Generate Random Salaries
const getRandomSalary = (salary) => {
    if (salary === `$240,000 or more`) return 240000;
    const lowerLimit = +salary.slice(1, salary.indexOf(` -`)).replace(/,/g, ``);
    const upperLimit = +salary.slice(salary.indexOf(`$`, salary.indexOf(` -`)) + 1).replace(/,/g, ``);
    return Math.floor(Math.random() * (upperLimit - lowerLimit + 1) + lowerLimit);
};

// Load CSV and format data
d3.csv(`/data/data.csv`, d => {
    if (d.pay_annual_USD) {
        return {
            role: d.role,
            gender: d.gender,
            salary: getRandomSalary(d.pay_annual_USD)
        };
    }
}).then(data => {
    // Bin salaries in $20k ranges
    const bins = d3.bin()
        .value(d => d.salary)
        .thresholds(d3.range(0, 260000, 20000))(data);

    const margin = { top: 30, right: 30, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(`#salaryBins`)
        .append(`svg`)
        .attr(`width`, width + margin.left + margin.right)
        .attr(`height`, height + margin.top + margin.bottom)
        .append(`g`)
        .attr(`transform`, `translate(${margin.left},${margin.top})`);

    // X scale: bin ranges
    const xScale = d3.scaleLinear()
        .domain([0, 240000])
        .range([0, width]);

    svg.append(`g`)
        .attr(`transform`, `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(12).tickFormat(d => `$${d/1000}k`));

    // Y scale: number of points in bin
    const maxCount = d3.max(bins, d => d.length);
    const yScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range([height, 0]);

    svg.append(`g`)
        .call(d3.axisLeft(yScale).ticks(5));

    bins.forEach(bin => {
        bin.forEach((d, i) => {
            svg.append(`circle`)
                .attr(`cx`, xScale((bin.x0 + bin.x1) / 2))
                .attr(`cy`, yScale(i + 1))
                .attr(`r`, 5)
                .attr(`fill`, `steelblue`)
                .attr(`opacity`, 0.7);
        });
    });
});
