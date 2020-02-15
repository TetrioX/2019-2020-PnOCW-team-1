# Node.js Server for PenO CW

## installation

This server is written in [Node.js](https://nodejs.org/) which is required to run the server.

Make sure you are in the `server` folder and install the dependencies:

`npm install`

make a copy of the config file `example.config.json` and call it `config.json` and
edit the configuration:

`cp example.config.json config.json`

`nano config.json` (or with the editor you prefer)

## starting the server.

To start the server you can run the following command:

`node app.js`

It will then start a webserver on the port specified in the `config.json` file. By default this will be port 8001 so you can access the server locally on `https://localhost:8001`.
