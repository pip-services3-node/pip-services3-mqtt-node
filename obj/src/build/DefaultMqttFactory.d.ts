/** @module build */
import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';
/**
 * Creates [[MqttMessageQueue]] components by their descriptors.
 *
 * @see [[MqttMessageQueue]]
 */
export declare class DefaultMqttFactory extends Factory {
    static readonly Descriptor: Descriptor;
    static readonly MqttQueueDescriptor: Descriptor;
    /**
     * Create a new instance of the factory.
     */
    constructor();
}
