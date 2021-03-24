"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('chai').assert;
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MqttMessageQueueFactory_1 = require("../../src/build/MqttMessageQueueFactory");
suite('MqttMessageQueueFactory', () => {
    test('CreateMessageQueue', () => {
        let factory = new MqttMessageQueueFactory_1.MqttMessageQueueFactory();
        let descriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "message-queue", "mqtt", "test", "1.0");
        let canResult = factory.canCreate(descriptor);
        assert.isNotNull(canResult);
        let queue = factory.create(descriptor);
        assert.isNotNull(queue);
        assert.equal("test", queue.getName());
    });
});
//# sourceMappingURL=MqttMessageQueueFactory.test.js.map