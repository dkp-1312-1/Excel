import * as fs from 'fs';
import { firstNames, lastNames } from './src/data/data.js';
const dataRows = 50000;
const data = {};
data["0,1"] = "ID";
data["0,2"] = "First Name";
data["0,3"] = "Last Name";
data["0,4"] = "Age";
data["0,5"] = "Salary";
for (let row = 1; row <= dataRows; row++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const age = Math.floor(Math.random() * 40) + 20;
    const salary = Math.floor(Math.random() * 900000) + 100000;
    data[`${row},1`] = row;
    data[`${row},2`] = firstName;
    data[`${row},3`] = lastName;
    data[`${row},4`] = age;
    data[`${row},5`] = salary;
}
fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('data.json generated successfully');
//# sourceMappingURL=generate_data.js.map