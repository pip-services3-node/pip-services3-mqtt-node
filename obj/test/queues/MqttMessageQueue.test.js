"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('process');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MessageQueueFixture_1 = require("./MessageQueueFixture");
const MqttMessageQueue_1 = require("../../src/queues/MqttMessageQueue");
suite('MqttMessageQueue', () => {
    let queue;
    let fixture;
    let brokerHost = process.env['MQTT_SERVICE_HOST'] || 'localhost';
    let brokerPort = process.env['MQTT_SERVICE_PORT'] || 1883;
    let brokerTopic = process.env['MQTT_TOPIC'] || 'test';
    if (brokerHost == '' && brokerPort == '')
        return;
    let queueConfig = pip_services3_commons_node_1.ConfigParams.fromTuples('topic', brokerTopic, 'connection.protocol', 'mqtt', 'connection.host', brokerHost, 'connection.port', brokerPort, 'options.autosubscribe', true);
    setup((done) => {
        queue = new MqttMessageQueue_1.MqttMessageQueue();
        queue.configure(queueConfig);
        fixture = new MessageQueueFixture_1.MessageQueueFixture(queue);
        queue.open(null, (err) => {
            queue.clear(null, (err) => {
                done(err);
            });
        });
    });
    teardown((done) => {
        queue.close(null, done);
    });
    test('Send and Receive Message', (done) => {
        fixture.testSendReceiveMessage(done);
    });
    test('Receive and Send Message', (done) => {
        fixture.testReceiveSendMessage(done);
    });
    test('Send Peek Message', (done) => {
        fixture.testSendPeekMessage(done);
    });
    test('Peek No Message', (done) => {
        fixture.testPeekNoMessage(done);
    });
    test('On Message', (done) => {
        fixture.testOnMessage(done);
    });
});
//# sourceMappingURL=MqttMessageQueue.test.js.map