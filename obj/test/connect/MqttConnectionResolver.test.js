"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('chai').assert;
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MqttConnectionResolver_1 = require("../../src/connect/MqttConnectionResolver");
suite('MqttConnectionResolver', () => {
    test('Single Connection', (done) => {
        let resolver = new MqttConnectionResolver_1.MqttConnectionResolver();
        resolver.configure(pip_services3_commons_node_1.ConfigParams.fromTuples("connection.protocol", "mqtt", "connection.host", "localhost", "connection.port", 1883));
        resolver.resolve(null, (err, connection) => {
            assert.isNull(err);
            assert.equal("mqtt://localhost:1883", connection.uri);
            assert.isUndefined(connection.username);
            assert.isUndefined(connection.password);
            done();
        });
    });
    // test('Cluster Connection', (done) => {
    //     let resolver = new MqttConnectionResolver();
    //     resolver.configure(ConfigParams.fromTuples(
    //         "connections.0.protocol", "mqtt",
    //         "connections.0.host", "server1",
    //         "connections.0.port", 1883,
    //         "connections.1.protocol", "mqtt",
    //         "connections.1.host", "server2",
    //         "connections.1.port", 1883,
    //         "connections.2.protocol", "mqtt",
    //         "connections.2.host", "server3",
    //         "connections.2.port", 1883,
    //     ));
    //     resolver.resolve(null, (err, connection) => {
    //         assert.isNull(err);
    //         assert.isNotNull(connection.uri);
    //         assert.isUndefined(connection.username);
    //         assert.isUndefined(connection.password);
    //         done();
    //     });
    // });
    // test('Cluster Connection with Auth', (done) => {
    //     let resolver = new MqttConnectionResolver();
    //     resolver.configure(ConfigParams.fromTuples(
    //         "connections.0.protocol", "mqtt",
    //         "connections.0.host", "server1",
    //         "connections.0.port", 1883,
    //         "connections.1.protocol", "mqtt",
    //         "connections.1.host", "server2",
    //         "connections.1.port", 1883,
    //         "connections.2.protocol", "mqtt",
    //         "connections.2.host", "server3",
    //         "connections.2.port", 1883,
    //         "credential.username", "test",
    //         "credential.password", "pass123",
    //     ));
    //     resolver.resolve(null, (err, connection) => {
    //         assert.isNull(err);
    //         assert.isNotNull(connection.uri);
    //         assert.equal("test", connection.username);
    //         assert.equal("pass123", connection.password);
    //         done();
    //     });
    // });
    test('Cluster URI', (done) => {
        let resolver = new MqttConnectionResolver_1.MqttConnectionResolver();
        resolver.configure(pip_services3_commons_node_1.ConfigParams.fromTuples("connection.uri", "mqtt://server1:1883", "credential.username", "test", "credential.password", "pass123"));
        resolver.resolve(null, (err, connection) => {
            assert.isNull(err);
            assert.isNotNull(connection.uri);
            assert.equal("test", connection.username);
            assert.equal("pass123", connection.password);
            done();
        });
    });
});
//# sourceMappingURL=MqttConnectionResolver.test.js.map