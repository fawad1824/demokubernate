const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.json({ service: 'Aws services' });
});

app.listen(3001, () => console.log('Aws Services running on port 3001'));
