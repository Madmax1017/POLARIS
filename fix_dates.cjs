const fs = require('fs');
const path = require('path');

const files = [
    'src/data/mockData.ts',
    'src/data/missionData.ts',
    'src/data/routeSimulationData.ts',
    'src/data/commanderData.ts'
];

for (const fp of files) {
    const fullPath = path.join(__dirname, fp);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace single quotes with 2026- with backticks: '2026-11-15' -> `${new Date().getFullYear()}-11-15`
    content = content.replace(/'2026-(.*?)'/g, '`${new Date().getFullYear()}-$1`');

    // Replace '10 Sep 2026' with `${new Date().getFullYear()}`
    content = content.replace(/'(.*?)2026(.*?)'/g, '`$1${new Date().getFullYear()}$2`');

    fs.writeFileSync(fullPath, content);
}
console.log('Done');
