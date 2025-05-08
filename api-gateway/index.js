const express = require('express');
const Docker = require('dockerode');
const docker = new Docker(); // Uses socket: /var/run/docker.sock

const app = express();
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ service: 'api-gateway' });
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

app.listen(3000, () => console.log('api-gateway running on port 3000'));
