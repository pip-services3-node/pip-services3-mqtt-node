/** @module build */
import { Factory } from 'pip-services3-components-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IMessageQueue } from 'pip-services3-messaging-node';
import { IMessageQueueFactory } from 'pip-services3-messaging-node';
/**
 * Creates [[MqttMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 *
 * @see [[https://pip-services3-node.github.io/pip-services3-components-node/classes/build.factory.html Factory]]
 * @see [[MqttMessageQueue]]
 */
export declare class MqttMessageQueueFactory extends Factory implements IMessageQueueFactory, IConfigurable, IReferenceable {
    private static readonly MqttQueueDescriptor;
    private _config;
    private _references;
    /**
     * Create a new instance of the factory.
     */
    constructor();
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references: IReferences): void;
    /**
     * Creates a message queue component and assigns its name.
     * @param name a name of the created message queue.
     */
    createQueue(name: string): IMessageQueue;
}
