const assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-node';

import { MqttMessageQueueFactory } from '../../src/build/MqttMessageQueueFactory';

suite('MqttMessageQueueFactory', ()=> {

    test('CreateMessageQueue', () => {
        let factory = new MqttMessageQueueFactory();
        let descriptor = new Descriptor("pip-services", "message-queue", "mqtt", "test", "1.0");
    
        let canResult = factory.canCreate(descriptor);
        assert.isNotNull(canResult);
    
        let queue = factory.create(descriptor);
        assert.isNotNull(queue);
        assert.equal("test", queue.getName());
    });

});