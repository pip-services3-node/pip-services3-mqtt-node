const process = require('process');

import { ConfigParams } from 'pip-services3-commons-node';

import { MessageQueueFixture } from './MessageQueueFixture';
import { MqttMessageQueue } from '../../src/queues/MqttMessageQueue';

suite('MqttMessageQueue', ()=> {
    let queue: MqttMessageQueue;
    let fixture: MessageQueueFixture;

    let brokerHost = process.env['MQTT_SERVICE_HOST'] || 'localhost';
    let brokerPort = process.env['MQTT_SERVICE_PORT'] || 1883;
    let brokerTopic = process.env['MQTT_TOPIC'] || 'test';
    if (brokerHost == '' && brokerPort == '')
        return;
    
    let queueConfig = ConfigParams.fromTuples(
        'topic', brokerTopic,
        'connection.protocol', 'mqtt',
        'connection.host', brokerHost,
        'connection.port', brokerPort
    );

    setup((done) => {
        queue = new MqttMessageQueue();
        queue.configure(queueConfig);

        fixture = new MessageQueueFixture(queue);

        queue.open(null, (err: any) => {
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