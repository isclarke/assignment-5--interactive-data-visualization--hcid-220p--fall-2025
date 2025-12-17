// Helper to generate a random salary from a salary range string
const getRandomSalary = (salary) => {
    const lowerLimit = +salary.slice(1, salary.indexOf(` -`)).replace(`,`, ``);
    const upperLimit = +salary.slice(salary.indexOf(` $`) + 2).replace(`,`, ``);
    return Math.floor(Math.random() * (upperLimit - lowerLimit) + lowerLimit);
};

// Load CSV and format data
d3.csv(`data.csv`, d => {
    if (d.pay_annual_USD !== `$240,000 or more`) {
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
        .thresholds(d3.range(0, 250000, 20000))(data);

    console.log(`All binned data:`, bins);
});
