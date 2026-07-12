const fs = require('fs');

const count = 50000;
const records = [];

for (let r = 1; r <= count; r++) {
    records.push({
        id: r,
        firstName: `Raj${r}`,
        lastName: `Solanki${r}`,
        age: Math.floor(Math.random() * 40) + 20,
        salary: Math.floor(Math.random() * 900000) + 100000
    });
}

fs.writeFileSync('data.json', JSON.stringify(records, null, 2));
console.log('Successfully generated data.json with 50,000 records.');
