const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ service: 'GCP-gateway' });
});

app.listen(3003, () => console.log('GCP-gateway running on port 3003'));
