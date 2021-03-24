/** @module build */
import { Factory } from 'pip-services3-components-node';
/**
 * Creates [[MqttMessageQueue]] components by their descriptors.
 *
 * @see [[MqttMessageQueue]]
 */
export declare class DefaultMqttFactory extends Factory {
    private static readonly MqttQueueDescriptor;
    private static readonly MqttConnectionDescriptor;
    private static readonly MqttQueueFactoryDescriptor;
    /**
     * Create a new instance of the factory.
     */
    constructor();
}
