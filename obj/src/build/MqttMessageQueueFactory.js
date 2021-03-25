"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttMessageQueueFactory = void 0;
/** @module build */
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MqttMessageQueue_1 = require("../queues/MqttMessageQueue");
/**
 * Creates [[MqttMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 *
 * @see [[https://pip-services3-node.github.io/pip-services3-components-node/classes/build.factory.html Factory]]
 * @see [[MqttMessageQueue]]
 */
class MqttMessageQueueFactory extends pip_services3_components_node_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.register(MqttMessageQueueFactory.MqttQueueDescriptor, (locator) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null;
            return this.createQueue(name);
        });
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        this._config = config;
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._references = references;
    }
    /**
     * Creates a message queue component and assigns its name.
     * @param name a name of the created message queue.
     */
    createQueue(name) {
        let queue = new MqttMessageQueue_1.MqttMessageQueue(name);
        if (this._config != null) {
            queue.configure(this._config);
        }
        if (this._references != null) {
            queue.setReferences(this._references);
        }
        return queue;
    }
}
exports.MqttMessageQueueFactory = MqttMessageQueueFactory;
MqttMessageQueueFactory.MqttQueueDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "message-queue", "mqtt", "*", "1.0");
//# sourceMappingURL=MqttMessageQueueFactory.js.map