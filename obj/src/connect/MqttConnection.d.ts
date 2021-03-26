/// <reference types="node" />
import { IReferenceable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { IMessageQueueConnection } from 'pip-services3-messaging-node';
import { MqttConnectionResolver } from '../connect/MqttConnectionResolver';
import { IMqttMessageListener } from './IMqttMessageListener';
import { MqttSubscription } from './MqttSubscription';
/**
 * Connection to MQTT message broker.
 *
 * MQTT is a popular light-weight protocol to communicate IoT devices.
 *
 * ### Configuration parameters ###
 *
 * - client_id:               (optional) name of the client id
 * - connection(s):
 *   - discovery_key:               (optional) a key to retrieve the connection from [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/connect.idiscovery.html IDiscovery]]
 *   - host:                        host name or IP address
 *   - port:                        port number
 *   - uri:                         resource URI or connection string with all parameters in it
 * - credential(s):
 *   - store_key:                   (optional) a key to retrieve the credentials from [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/auth.icredentialstore.html ICredentialStore]]
 *   - username:                    user name
 *   - password:                    user password
 * - options:
 *   - retry_connect:        (optional) turns on/off automated reconnect when connection is log (default: true)
 *   - connect_timeout:      (optional) number of milliseconds to wait for connection (default: 30000)
 *   - reconnect_timeout:    (optional) number of milliseconds to wait on each reconnection attempt (default: 1000)
 *   - keepalive_timeout:    (optional) number of milliseconds to ping broker while inactive (default: 3000)
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>             (optional) [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>           (optional) [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>\*:discovery:\*:\*:1.0</code>          (optional) [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connections
 * - <code>\*:credential-store:\*:\*:1.0</code>   (optional) Credential stores to resolve credentials
 *
 * @see [[MessageQueue]]
 * @see [[MessagingCapabilities]]
 */
export declare class MqttConnection implements IMessageQueueConnection, IReferenceable, IConfigurable, IOpenable {
    private _defaultConfig;
    /**
     * The logger.
     */
    protected _logger: CompositeLogger;
    /**
     * The connection resolver.
     */
    protected _connectionResolver: MqttConnectionResolver;
    /**
     * The configuration options.
     */
    protected _options: ConfigParams;
    /**
     * The NATS connection pool object.
     */
    protected _connection: any;
    /**
     * Topic subscriptions
     */
    protected _subscriptions: MqttSubscription[];
    protected _clientId: string;
    protected _retryConnect: boolean;
    protected _connectTimeout: number;
    protected _keepAliveTimeout: number;
    protected _reconnectTimeout: number;
    /**
     * Creates a new instance of the connection component.
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
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen(): boolean;
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    open(correlationId: string, callback?: (err: any) => void): void;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    close(correlationId: string, callback?: (err: any) => void): void;
    getConnection(): any;
    /**
     * Reads a list of registered queue names.
     * If connection doesn't support this function returnes an empty list.
     * @callback to receive a list with registered queue names or an error.
     */
    readQueueNames(callback: (err: any, queueNames: string[]) => void): void;
    /**
     * Creates a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be created.
     * @param callback notifies about completion with error or null for success.
     */
    createQueue(name: string, callback: (err: any) => void): void;
    /**
     * Deletes a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be deleted.
     * @param callback notifies about completion with error or null for success.
     */
    deleteQueue(name: string, callback: (err: any) => void): void;
    /**
     * Checks if connection is open
     * @returns an error is connection is closed or <code>null<code> otherwise.
     */
    protected checkOpen(): any;
    /**
     * Publish a message to a specified topic
     * @param topic a topic name
     * @param data a message to be published
     * @param options publishing options
     * @param callback (optional) callback to receive notification on operation result
     */
    publish(topic: string, data: Buffer, options: any, callback?: (err: any) => void): void;
    /**
     * Subscribe to a topic
     * @param topic a topic name
     * @param options subscription options
     * @param listener a message listener
     * @param callback (optional) callback to receive notification on operation result
     */
    subscribe(topic: string, options: any, listener: IMqttMessageListener, callback?: (err: any) => void): void;
    /**
     * Unsubscribe from a previously subscribed topic
     * @param topic a topic name
     * @param listener a message listener
     * @param callback (optional) callback to receive notification on operation result
     */
    unsubscribe(topic: string, listener: IMqttMessageListener, callback?: (err: any) => void): void;
}
