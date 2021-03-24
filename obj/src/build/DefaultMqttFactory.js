"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMqttFactory = void 0;
/** @module build */
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MqttMessageQueue_1 = require("../queues/MqttMessageQueue");
const MqttConnection_1 = require("../connect/MqttConnection");
const MqttMessageQueueFactory_1 = require("./MqttMessageQueueFactory");
/**
 * Creates [[MqttMessageQueue]] components by their descriptors.
 *
 * @see [[MqttMessageQueue]]
 */
class DefaultMqttFactory extends pip_services3_components_node_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.register(DefaultMqttFactory.MqttQueueDescriptor, (locator) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null;
            return new MqttMessageQueue_1.MqttMessageQueue(name);
        });
        this.registerAsType(DefaultMqttFactory.MqttConnectionDescriptor, MqttConnection_1.MqttConnection);
        this.registerAsType(DefaultMqttFactory.MqttQueueFactoryDescriptor, MqttMessageQueueFactory_1.MqttMessageQueueFactory);
    }
}
exports.DefaultMqttFactory = DefaultMqttFactory;
DefaultMqttFactory.MqttQueueDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "message-queue", "mqtt", "*", "1.0");
DefaultMqttFactory.MqttConnectionDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "connection", "mqtt", "*", "1.0");
DefaultMqttFactory.MqttQueueFactoryDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "queue-factory", "mqtt", "*", "1.0");
//# sourceMappingURL=DefaultMqttFactory.js.map