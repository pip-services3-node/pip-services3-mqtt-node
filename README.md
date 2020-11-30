# <img src="https://uploads-ssl.webflow.com/5ea5d3315186cf5ec60c3ee4/5edf1c94ce4c859f2b188094_logo.svg" alt="Pip.Services Logo" width="200"> <br/> MQTT Messaging for Node.js

This module is a part of the [Pip.Services](http://pipservices.org) polyglot microservices toolkit.

The MQTT module contains a set of components for messaging using the Mqtt protocol. Contains the implementation of the components for working with messages: MqttMessageQueue, MqttConnectionResolver.

The module contains the following packages:
- **Build** - factory default implementation
- **Connect** - components for setting up the connection to the MQTT broker
- **Queues** - components of working with a message queue via the MQTT protocol

<a name="links"></a> Quick links:

* [Configuration](https://www.pipservices.org/recipies/configuration)
* [API Reference](https://pip-services3-node.github.io/pip-services3-mqtt-node/globals.html)
* [Change Log](CHANGELOG.md)
* [Get Help](https://www.pipservices.org/community/help)
* [Contribute](https://www.pipservices.org/community/contribute)

## Use

Install the NPM package as
```bash
npm install pip-services3-mqtt-node --save
```

## Develop

For development you shall install the following prerequisites:
* Node.js 8+
* Visual Studio Code or another IDE of your choice
* Docker
* Typescript

Install dependencies:
```bash
npm install
```

Compile the code:
```bash
tsc
```

Run automated tests:
```bash
npm test
```

Generate API documentation:
```bash
./docgen.ps1
```

Before committing changes run dockerized build and test as:
```bash
./build.ps1
./test.ps1
./clear.ps1
```

## Contacts

The Node.js version of Pip.Services is created and maintained by **Sergey Seroukhov**
