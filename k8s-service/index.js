const express = require('express');
const Docker = require('dockerode');
const docker = new Docker(); // Uses socket: /var/run/docker.sock
const axios = require('axios');

const app = express();
app.use(express.json());
const port = 3005;


app.get('/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });
        res.json(containers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/dockerhub/images', async (req, res) => {
    try {
        const username = 'ecioptime1231';
        const password = 'eci321optime1231'; // or use token
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        const result = await axios.get(`https://hub.docker.com/v2/repositories/${username}/`, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/', (req, res) => {
    res.json({ service: 'api-gateway' });
});

app.get('/images', async (req, res) => {
    try {
        const images = await docker.listImages();
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/run-container', async (req, res) => {
    const { image, containerPort, hostPort } = req.body;

    try {
        // Pull image
        await docker.pull(image, (err, stream) => {
            if (err) return res.status(500).json({ error: err.message });

            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err, output) {
                if (err) return res.status(500).json({ error: err.message });

                // Create container
                docker.createContainer({
                    Image: image,
                    ExposedPorts: {
                        [`${containerPort}/tcp`]: {},
                    },
                    HostConfig: {
                        PortBindings: {
                            [`${containerPort}/tcp`]: [{ HostPort: hostPort.toString() }],
                        },
                    },
                }).then(container => {
                    container.start();
                    res.json({ message: `Container started on port ${hostPort}` });
                }).catch(e => res.status(500).json({ error: e.message }));
            }

            function onProgress(event) {
                console.log(event.status);
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});






app.listen(port, () => {
    console.log(`K8s service running on http://localhost:${port}`);
});
