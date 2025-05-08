const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.json({ service: 'Azure-gateway' });
});

app.listen(3002, () => console.log('Azure-gateway running on port 3002'));
