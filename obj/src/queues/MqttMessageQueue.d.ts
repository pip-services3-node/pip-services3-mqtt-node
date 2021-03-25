import { IReferenceable } from 'pip-services3-commons-node';
import { IUnreferenceable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ICleanable } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { IMessageReceiver, MessageQueue } from 'pip-services3-messaging-node';
import { MessageEnvelope } from 'pip-services3-messaging-node';
import { ConnectionParams } from 'pip-services3-components-node';
import { CredentialParams } from 'pip-services3-components-node';
import { MqttConnection } from '../connect/MqttConnection';
/**
 * Message queue that sends and receives messages via MQTT message broker.
 *
 * MQTT is a popular light-weight protocol to communicate IoT devices.
 *
 * ### Configuration parameters ###
 *
 * - topic:                         name of MQTT topic to subscribe
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
 *   - qos:                  (optional) quality of service level aka QOS (default: 0)
 *   - retain:               (optional) retention flag for published messages (default: false)
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
 * - <code>\*:connection:nats:\*:1.0</code>       (optional) Shared connection to MQTT service
 *
 * @see [[MessageQueue]]
 * @see [[MessagingCapabilities]]
 *
 * ### Example ###
 *
 *     let queue = new MqttMessageQueue("myqueue");
 *     queue.configure(ConfigParams.fromTuples(
 *       "topic", "mytopic",
 *       "connection.protocol", "mqtt"
 *       "connection.host", "localhost"
 *       "connection.port", 1883
 *     ));
 *
 *     queue.open("123", (err) => {
 *         ...
 *     });
 *
 *     queue.send("123", new MessageEnvelope(null, "mymessage", "ABC"));
 *
 *     queue.receive("123", (err, message) => {
 *         if (message != null) {
 *            ...
 *            queue.complete("123", message);
 *         }
 *     });
 */
export declare class MqttMessageQueue extends MessageQueue implements IReferenceable, IUnreferenceable, IConfigurable, IOpenable, ICleanable {
    private static _defaultConfig;
    private _config;
    private _references;
    private _opened;
    private _localConnection;
    /**
     * The dependency resolver.
     */
    protected _dependencyResolver: DependencyResolver;
    /**
     * The logger.
     */
    protected _logger: CompositeLogger;
    /**
     * The MQTT connection component.
     */
    protected _connection: MqttConnection;
    protected _serializeEnvelop: boolean;
    protected _topic: string;
    protected _qos: number;
    protected _retain: boolean;
    protected _messages: MessageEnvelope[];
    protected _receiver: IMessageReceiver;
    /**
     * Creates a new instance of the persistence component.
     *
     * @param name    (optional) a queue name.
     */
    constructor(name?: string);
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
     * Unsets (clears) previously set references to dependent components.
     */
    unsetReferences(): void;
    private createConnection;
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
     * Opens the component with given connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connection        connection parameters
     * @param credential        credential parameters
     * @param callback 			callback function that receives error or null no errors occured.
     */
    protected openWithParams(correlationId: string, connections: ConnectionParams[], credential: CredentialParams, callback: (err: any) => void): void;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    close(correlationId: string, callback?: (err: any) => void): void;
    protected getTopic(): string;
    protected fromMessage(message: MessageEnvelope): any;
    protected toMessage(topic: string, data: any, packet: any): MessageEnvelope;
    onMessage(topic: string, data: any, packet: any): void;
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    clear(correlationId: string, callback: (err?: any) => void): void;
    /**
     * Reads the current number of messages in the queue to be delivered.
     *
     * @param callback      callback function that receives number of messages or error.
     */
    readMessageCount(callback: (err: any, count: number) => void): void;
    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param callback          callback function that receives a message or error.
     */
    peek(correlationId: string, callback: (err: any, result: MessageEnvelope) => void): void;
    /**
     * Peeks multiple incoming messages from the queue without removing them.
     * If there are no messages available in the queue it returns an empty list.
     *
     * Important: This method is not supported by MQTT.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageCount      a maximum number of messages to peek.
     * @param callback          callback function that receives a list with messages or error.
     */
    peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelope[]) => void): void;
    /**
     * Receives an incoming message and removes it from the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @param callback          callback function that receives a message or error.
     */
    receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelope) => void): void;
    /**
     * Sends a message into the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param message           a message envelop to be sent.
     * @param callback          (optional) callback function that receives error or null for success.
     */
    send(correlationId: string, message: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Renews a lock on a message that makes it invisible from other receivers in the queue.
     * This method is usually used to extend the message processing time.
     *
     * Important: This method is not supported by MQTT.
     *
     * @param message       a message to extend its lock.
     * @param lockTimeout   a locking timeout in milliseconds.
     * @param callback      (optional) callback function that receives an error or null for success.
     */
    renewLock(message: MessageEnvelope, lockTimeout: number, callback?: (err: any) => void): void;
    /**
     * Permanently removes a message from the queue.
     * This method is usually used to remove the message after successful processing.
     *
     * Important: This method is not supported by MQTT.
     *
     * @param message   a message to remove.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    complete(message: MessageEnvelope, callback: (err: any) => void): void;
    /**
     * Returnes message into the queue and makes it available for all subscribers to receive it again.
     * This method is usually used to return a message which could not be processed at the moment
     * to repeat the attempt. Messages that cause unrecoverable errors shall be removed permanently
     * or/and send to dead letter queue.
     *
     * Important: This method is not supported by MQTT.
     *
     * @param message   a message to return.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    abandon(message: MessageEnvelope, callback: (err: any) => void): void;
    /**
     * Permanently removes a message from the queue and sends it to dead letter queue.
     *
     * Important: This method is not supported by MQTT.
     *
     * @param message   a message to be removed.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    moveToDeadLetter(message: MessageEnvelope, callback: (err: any) => void): void;
    private sendMessageToReceiver;
    /**
    * Listens for incoming messages and blocks the current thread until queue is closed.
    *
    * @param correlationId     (optional) transaction id to trace execution through call chain.
    * @param receiver          a receiver to receive incoming messages.
    *
    * @see [[IMessageReceiver]]
    * @see [[receive]]
    */
    listen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    endListen(correlationId: string): void;
}
