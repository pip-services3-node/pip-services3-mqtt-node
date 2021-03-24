/** @module build */
import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';

import { MqttMessageQueue } from '../queues/MqttMessageQueue';

/**
 * Creates [[MqttMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 * 
 * @see [[https://pip-services3-node.github.io/pip-services3-components-node/classes/build.factory.html Factory]]
 * @see [[MqttMessageQueue]]
 */
export class MqttMessageQueueFactory extends Factory implements IConfigurable, IReferenceable {
    private static readonly MqttQueueDescriptor: Descriptor = new Descriptor("pip-services", "message-queue", "mqtt", "*", "1.0");
    private _config: ConfigParams;
    private _references: IReferences;

    /**
	 * Create a new instance of the factory.
	 */
    public constructor() {
        super();
        this.register(MqttMessageQueueFactory.MqttQueueDescriptor, (locator: Descriptor) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null; 
            let queue = new MqttMessageQueue(name);

            if (this._config != null) {
                queue.configure(this._config);
            }
            if (this._references != null) {
                queue.setReferences(this._references);
            }

            return queue;
        });
    }

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
     public configure(config: ConfigParams): void {
        this._config = config;
    }

    /**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
     */
     public setReferences(references: IReferences): void {
        this._references = references;
    }
}
