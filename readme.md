# Fapiverse DB

## Usage

``` js
const setupDatabase = require('fapiverse-db');

setupDatabase(config).then(db => {
  const { Agent, Metric } = db;
  
}).catch(err => console.error(err));
```
