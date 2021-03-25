/** @module queues */
/** @hidden */
const _ = require('lodash');
/** @hidden */
const async = require('async');

import { IReferenceable } from 'pip-services3-commons-node';
import { IUnreferenceable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ICleanable } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { ConnectionException } from 'pip-services3-commons-node';
import { InvalidStateException } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { IMessageReceiver, MessageQueue } from 'pip-services3-messaging-node';
import { MessagingCapabilities } from 'pip-services3-messaging-node';
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
export class MqttMessageQueue extends MessageQueue
    implements IReferenceable, IUnreferenceable, IConfigurable, IOpenable, ICleanable {

    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "topic", null,
        "options.serialize_envelop", true,
        "options.retry_connect", true,
        "options.connect_timeout", 30000,
        "options.reconnect_timeout", 1000,
        "options.keepalive_timeout", 60000,
        "options.qos", 0,
        "options.retain", false
    );

    private _config: ConfigParams;
    private _references: IReferences;
    private _opened: boolean;
    private _localConnection: boolean;

    /**
     * The dependency resolver.
     */
    protected _dependencyResolver: DependencyResolver = new DependencyResolver(MqttMessageQueue._defaultConfig);
    /** 
     * The logger.
     */
    protected _logger: CompositeLogger = new CompositeLogger();
    
    /**
     * The MQTT connection component.
     */
    protected _connection: MqttConnection;

    protected _serializeEnvelop: boolean;
    protected _topic: string;
    protected _qos: number;
    protected _retain: boolean;
    protected _messages: MessageEnvelope[] = [];
    protected _receiver: IMessageReceiver;

    /**
     * Creates a new instance of the persistence component.
     * 
     * @param name    (optional) a queue name.
     */
    public constructor(name?: string) {
        super(name, new MessagingCapabilities(false, true, true, true, true, false, false, false, true));
    }

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
        config = config.setDefaults(MqttMessageQueue._defaultConfig);
        this._config = config;

        this._dependencyResolver.configure(config);

        this._topic = config.getAsStringWithDefault("topic", this._topic);
        this._serializeEnvelop = config.getAsBooleanWithDefault("options.serialize_envelop", this._serializeEnvelop);
        this._qos = config.getAsIntegerWithDefault("options.qos", this._qos);
        this._retain = config.getAsBooleanWithDefault("options.retain", this._retain);
    }

    /**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
     */
    public setReferences(references: IReferences): void {
        this._references = references;
        this._logger.setReferences(references);

        // Get connection
        this._dependencyResolver.setReferences(references);
        this._connection = this._dependencyResolver.getOneOptional('connection');
        // Or create a local one
        if (this._connection == null) {
            this._connection = this.createConnection();
            this._localConnection = true;
        } else {
            this._localConnection = false;
        }
    }

    /**
	 * Unsets (clears) previously set references to dependent components. 
     */
    public unsetReferences(): void {
        this._connection = null;
    }

    private createConnection(): MqttConnection {
        let connection = new MqttConnection();
        
        if (this._config)
            connection.configure(this._config);
        
        if (this._references)
            connection.setReferences(this._references);
            
        return connection;
    }

    /**
	 * Checks if the component is opened.
	 * 
	 * @returns true if the component has been opened and false otherwise.
     */
    public isOpen(): boolean {
        return this._opened;
    }

    /**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    public open(correlationId: string, callback?: (err: any) => void): void {
    	if (this._opened) {
            callback(null);
            return;
        }
        
        if (this._connection == null) {
            this._connection = this.createConnection();
            this._localConnection = true;
        }

        let openCurl = (err) => {
            if (err == null && this._connection == null) {
                err = new InvalidStateException(correlationId, 'NO_CONNECTION', 'MQTT connection is missing');
            }

            if (err == null && !this._connection.isOpen()) {
                err = new ConnectionException(correlationId, "CONNECT_FAILED", "MQTT connection is not opened");
            }

            if (err != null) {
                if (callback) callback(err);
                return;
            }

            // Subscribe right away
            let topic = this.getTopic();
            this._connection.subscribe(topic, { qos: this._qos }, this, (err) => {
                if (err != null) {
                    this._logger.error(null, err, "Failed to subscribe to topic " + this.getTopic());
                    if (callback) callback(err);
                    return;
                }

                this._opened = true;        

                if (callback) callback(null);
            });    
        };

        if (this._localConnection) {
            this._connection.open(correlationId, openCurl);
        } else {
            openCurl(null);
        }
    }

    /**
     * Opens the component with given connection and credential parameters.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connection        connection parameters
     * @param credential        credential parameters
     * @param callback 			callback function that receives error or null no errors occured.
     */
    protected openWithParams(correlationId: string,
        connections: ConnectionParams[], credential: CredentialParams,
        callback: (err: any) => void): void {
        throw new Error("Not supported");
    }    

    /**
	 * Closes component and frees used resources.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    public close(correlationId: string, callback?: (err: any) => void): void {
    	if (!this._opened) {
            callback(null);
            return;
        }

        if (this._connection == null) {
            callback(new InvalidStateException(correlationId, 'NO_CONNECTION', 'Mqtt connection is missing'));
            return;
        }
        
        let closeCurl = (err) => {
            // Unsubscribe from the topic
            let topic = this.getTopic();
            this._connection.unsubscribe(topic, this);

            this._messages = [];
            this._opened = false;
            this._receiver = null;

            if (callback) callback(err);
        }

        if (this._localConnection) {
            this._connection.close(correlationId, closeCurl);
        } else {
            closeCurl(null);
        }
    }

    protected getTopic(): string {
        return this._topic != null && this._topic != "" ? this._topic : this.getName();
    }

    protected fromMessage(message: MessageEnvelope): any {
        if (message == null) return null;

        let data = message.message;
        if (this._serializeEnvelop) {
            let json = JSON.stringify(message);
            data = Buffer.from(json, 'utf-8');
        }

        return {
            topic: this.getName() || this._topic,
            data: data
        };
    }

    protected toMessage(topic: string, data: any, packet: any): MessageEnvelope {
        if (data == null) return null;

        let message: MessageEnvelope;
        if (this._serializeEnvelop) {
            let json = Buffer.from(data).toString('utf-8');
            message = MessageEnvelope.fromJSON(json);
        } else {
            message = new MessageEnvelope(null, topic, data);
            message.message_id = packet.messageId;
            // message.message_type = topic;
            // message.message = Buffer.from(data);
        }

        return message;
    }

    public onMessage(topic: string, data: any, packet: any): void {
        // Skip if it came from a wrong topic
        let expectedTopic = this.getTopic();
        if (expectedTopic.indexOf("*") < 0 && expectedTopic != topic) {
            return;
        }

        // Deserialize message
        let message = this.toMessage(topic, data, packet);
        if (message == null) {
            this._logger.error(null, null, "Failed to read received message");
            return;
        }

        this._counters.incrementOne("queue." + this.getName() + ".received_messages");
        this._logger.debug(message.correlation_id, "Received message %s via %s", message, this.getName());

        // Send message to receiver if its set or put it into the queue
        if (this._receiver != null) {
            this.sendMessageToReceiver(this._receiver, message);
        } else {
            this._messages.push(message);
        }
    }

    /**
	 * Clears component state.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
     public clear(correlationId: string, callback: (err?: any) => void): void {
        this._messages = [];
        callback();
    }

    /**
     * Reads the current number of messages in the queue to be delivered.
     * 
     * @param callback      callback function that receives number of messages or error.
     */
     public readMessageCount(callback: (err: any, count: number) => void): void {
        callback(null, this._messages.length);
    }

    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param callback          callback function that receives a message or error.
     */
     public peek(correlationId: string, callback: (err: any, result: MessageEnvelope) => void): void {
        let err = this.checkOpen(correlationId);
        if (err != null) {
            callback(err, null);
            return;
        }

        let message: MessageEnvelope = null;
        if (this._messages.length > 0) {
            message = this._messages[0];
        }

        if (message != null) {
    		this._logger.trace(message.correlation_id, "Peeked message %s on %s", message, this.getName());
        }

        callback(null, message);
    }

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
    public peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelope[]) => void): void {
        let err = this.checkOpen(correlationId);
        if (err != null) {
            callback(err, null);
            return;
        }

        let messages = this._messages.slice(0, messageCount);

        this._logger.trace(correlationId, "Peeked %d messages on %s", messages.length, this.getName());

        callback(null, messages);
    }

    /**
     * Receives an incoming message and removes it from the queue.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @param callback          callback function that receives a message or error.
     */
    public receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelope) => void): void {
        let message: MessageEnvelope = null;

        // Return message immediately if it exist
        if (this._messages.length > 0) {
            message = this._messages.shift();
            callback(null, message);
            return;
        }

        // Otherwise wait and return
        let checkInterval = 100;
        let elapsedTime = 0;
        async.whilst(
            () => {
                return this.isOpen() && elapsedTime < waitTimeout && message == null;
            },
            (whilstCallback) => {
                elapsedTime += checkInterval;

                setTimeout(() => {
                    message = this._messages.shift();
                    whilstCallback();
                }, checkInterval);
            },
            (err) => {
                callback(err, message);
            }
        );
    }

    /**
     * Sends a message into the queue.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param message           a message envelop to be sent.
     * @param callback          (optional) callback function that receives error or null for success.
     */
    public send(correlationId: string, message: MessageEnvelope, callback?: (err: any) => void): void {
        let err = this.checkOpen(correlationId);
        if (err != null) {
            if (callback) callback(err);
            return;
        }

        this._counters.incrementOne("queue." + this.getName() + ".sent_messages");
        this._logger.debug(message.correlation_id, "Sent message %s via %s", message.toString(), this.toString());

        let msg = this.fromMessage(message);
        let options = { qos: this._qos, retain: this._retain };
        this._connection.publish(msg.topic, msg.data, options, callback);
    }

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
     public renewLock(message: MessageEnvelope, lockTimeout: number, callback?: (err: any) => void): void {
        // Not supported
        if (callback) callback(null);
    }

    /**
     * Permanently removes a message from the queue.
     * This method is usually used to remove the message after successful processing.
     * 
     * Important: This method is not supported by MQTT.
     * 
     * @param message   a message to remove.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    public complete(message: MessageEnvelope, callback: (err: any) => void): void {
        // Not supported
        if (callback) callback(null);
    }

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
    public abandon(message: MessageEnvelope, callback: (err: any) => void): void {
        // Not supported
        if (callback) callback(null);
    }

    /**
     * Permanently removes a message from the queue and sends it to dead letter queue.
     * 
     * Important: This method is not supported by MQTT.
     * 
     * @param message   a message to be removed.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    public moveToDeadLetter(message: MessageEnvelope, callback: (err: any) => void): void {
        // Not supported
        if (callback) callback(null);
    }

    private sendMessageToReceiver(receiver: IMessageReceiver, message: MessageEnvelope): void {
        let correlationId = message != null ? message.correlation_id : null;
        if (message == null || receiver == null) {
            this._logger.warn(correlationId, "MQTT message was skipped.");
            return;
        }

        try {
            this._receiver.receiveMessage(message, this, (err) => {
                if (err != null) {
                    this._logger.error(correlationId, err, "Failed to process the message");
                }
            });
        } catch (err) {
            this._logger.error(correlationId, err, "Failed to process the message");
        }
    }

     /**
     * Listens for incoming messages and blocks the current thread until queue is closed.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     * 
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
      public listen(correlationId: string, receiver: IMessageReceiver): void {
        this._logger.trace(null, "Started listening messages at %s", this.getName());

        // Resend collected messages to receiver
        async.whilst(
            () => {
                return this.isOpen() && this._messages.length > 0;
            },
            (whilstCallback) => {
                let message = this._messages.shift();
                if (message != null) {
                    this.sendMessageToReceiver(receiver, message);
                }
                whilstCallback();
            },
            (err) => {
                // Set the receiver
                if (this.isOpen()) {
                    this._receiver = receiver;
                }
            }
        );

    }

    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    public endListen(correlationId: string): void {
        this._receiver = null;
    }   
}