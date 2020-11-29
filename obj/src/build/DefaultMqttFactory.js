"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMqttFactory = void 0;
/** @module build */
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MqttMessageQueue_1 = require("../queues/MqttMessageQueue");
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
            return new MqttMessageQueue_1.MqttMessageQueue(locator.getName());
        });
    }
}
exports.DefaultMqttFactory = DefaultMqttFactory;
DefaultMqttFactory.Descriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "factory", "mqtt", "default", "1.0");
DefaultMqttFactory.MqttQueueDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "message-queue", "mqtt", "*", "1.0");
//# sourceMappingURL=DefaultMqttFactory.js.map