/** @module build */
import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { MqttMessageQueue } from '../queues/MqttMessageQueue';
import { MqttConnection } from '../connect/MqttConnection';
import { MqttMessageQueueFactory } from './MqttMessageQueueFactory';

/**
 * Creates [[MqttMessageQueue]] components by their descriptors.
 * 
 * @see [[MqttMessageQueue]]
 */
export class DefaultMqttFactory extends Factory {
    private static readonly MqttQueueDescriptor: Descriptor = new Descriptor("pip-services", "message-queue", "mqtt", "*", "1.0");
 	private static readonly MqttConnectionDescriptor: Descriptor = new Descriptor("pip-services", "connection", "mqtt", "*", "1.0");
	private static readonly MqttQueueFactoryDescriptor: Descriptor = new Descriptor("pip-services", "queue-factory", "mqtt", "*", "1.0");

	/**
	 * Create a new instance of the factory.
	 */
	public constructor() {
        super();
        this.register(DefaultMqttFactory.MqttQueueDescriptor, (locator: Descriptor) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null; 
            return new MqttMessageQueue(name);
        });
		this.registerAsType(DefaultMqttFactory.MqttConnectionDescriptor, MqttConnection);
		this.registerAsType(DefaultMqttFactory.MqttQueueFactoryDescriptor, MqttMessageQueueFactory);
	}
}