"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttConnection = void 0;
/** @module queues */
/** @hidden */
const mqtt = require('mqtt');
/** @hidden */
const os = require('os');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const MqttConnectionResolver_1 = require("../connect/MqttConnectionResolver");
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
class MqttConnection {
    /**
     * Creates a new instance of the connection component.
     */
    constructor() {
        this._defaultConfig = pip_services3_commons_node_1.ConfigParams.fromTuples(
        // connections.*
        // credential.*
        "client_id", null, "options.retry_connect", true, "options.connect_timeout", 30000, "options.reconnect_timeout", 1000, "options.keepalive_timeout", 60000);
        /**
         * The logger.
         */
        this._logger = new pip_services3_components_node_1.CompositeLogger();
        /**
         * The connection resolver.
         */
        this._connectionResolver = new MqttConnectionResolver_1.MqttConnectionResolver();
        /**
         * The configuration options.
         */
        this._options = new pip_services3_commons_node_1.ConfigParams();
        /**
         * Topic subscriptions
         */
        this._subscriptions = [];
        this._clientId = os.hostname();
        this._retryConnect = true;
        this._connectTimeout = 30000;
        this._keepAliveTimeout = 60000;
        this._reconnectTimeout = 1000;
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        config = config.setDefaults(this._defaultConfig);
        this._connectionResolver.configure(config);
        this._options = this._options.override(config.getSection("options"));
        this._clientId = config.getAsStringWithDefault("client_id", this._clientId);
        this._retryConnect = config.getAsBooleanWithDefault("options.retry_connect", this._retryConnect);
        this._connectTimeout = config.getAsIntegerWithDefault("options.max_reconnect", this._connectTimeout);
        this._reconnectTimeout = config.getAsIntegerWithDefault("options.reconnect_timeout", this._reconnectTimeout);
        this._keepAliveTimeout = config.getAsIntegerWithDefault("options.keepalive_timeout", this._keepAliveTimeout);
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._connection != null;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    open(correlationId, callback) {
        if (this._connection != null) {
            if (callback)
                callback(null);
            return;
        }
        this._connectionResolver.resolve(correlationId, (err, options) => {
            if (err) {
                if (callback)
                    callback(err);
                else
                    this._logger.error(correlationId, err, 'Failed to resolve MQTT connection');
                return;
            }
            options.clientId = this._clientId;
            options.keepalive = this._keepAliveTimeout / 1000;
            options.connectTimeout = this._connectTimeout;
            options.reconnectPeriod = this._reconnectTimeout;
            options.resubscribe = this._retryConnect;
            let client = mqtt.connect(options.uri, options);
            client.on('connect', () => {
                this._connection = client;
                this._logger.debug(correlationId, "Connected to MQTT broker at " + options.uri);
                callback(null);
            });
            client.on('error', (err) => {
                this._logger.error(correlationId, err, "Failed to connect to MQTT broker at " + options.uri);
                err = new pip_services3_commons_node_2.ConnectionException(correlationId, "CONNECT_FAILED", "Connection to MQTT broker failed").withCause(err);
                callback(err);
            });
            client.on('message', (topic, data, packet) => {
                for (let subscription of this._subscriptions) {
                    // Todo: Implement proper filtering by wildcards?
                    if (subscription.filter && topic != subscription.topic) {
                        continue;
                    }
                    subscription.listener.onMessage(topic, data, packet);
                }
            });
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    close(correlationId, callback) {
        if (this._connection == null) {
            if (callback)
                callback(null);
            return;
        }
        this._connection.end();
        this._connection = null;
        this._subscriptions = [];
        this._logger.debug(correlationId, "Disconnected from MQTT broker");
        if (callback)
            callback(null);
    }
    getConnection() {
        return this._connection;
    }
    /**
     * Reads a list of registered queue names.
     * If connection doesn't support this function returnes an empty list.
     * @callback to receive a list with registered queue names or an error.
     */
    readQueueNames(callback) {
        callback(null, []);
    }
    /**
     * Creates a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be created.
     * @param callback notifies about completion with error or null for success.
     */
    createQueue(name, callback) {
        if (callback)
            callback(null);
    }
    /**
     * Deletes a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be deleted.
     * @param callback notifies about completion with error or null for success.
     */
    deleteQueue(name, callback) {
        if (callback)
            callback(null);
    }
    /**
     * Checks if connection is open
     * @returns an error is connection is closed or <code>null<code> otherwise.
     */
    checkOpen() {
        if (this.isOpen())
            return null;
        return new pip_services3_commons_node_3.InvalidStateException(null, "NOT_OPEN", "Connection was not opened");
    }
    /**
     * Publish a message to a specified topic
     * @param topic a topic name
     * @param data a message to be published
     * @param options publishing options
     * @param callback (optional) callback to receive notification on operation result
     */
    publish(topic, data, options, callback) {
        // Check for open connection
        let err = this.checkOpen();
        if (err) {
            if (callback)
                callback(err);
            return;
        }
        this._connection.publish(topic, data, options, callback);
    }
    /**
     * Subscribe to a topic
     * @param topic a topic name
     * @param options subscription options
     * @param listener a message listener
     * @param callback (optional) callback to receive notification on operation result
     */
    subscribe(topic, options, listener, callback) {
        // Check for open connection
        let err = this.checkOpen();
        if (err != null) {
            if (callback)
                callback(err);
            return;
        }
        // Subscribe to topic
        this._connection.subscribe(topic, options, (err) => {
            if (err != null) {
                if (callback)
                    callback(err);
                return;
            }
            // Determine if messages shall be filtered (topic without wildcarts)
            let filter = topic.indexOf("*") < 0;
            // Add the subscription
            let subscription = {
                topic: topic,
                options: options,
                filter: filter,
                listener: listener
            };
            this._subscriptions.push(subscription);
            if (callback)
                callback(null);
        });
    }
    /**
     * Unsubscribe from a previously subscribed topic
     * @param topic a topic name
     * @param listener a message listener
     * @param callback (optional) callback to receive notification on operation result
     */
    unsubscribe(topic, listener, callback) {
        // Find the subscription index
        let index = this._subscriptions.findIndex((s) => s.topic == topic && s.listener == listener);
        if (index < 0) {
            if (callback)
                callback(null);
            return;
        }
        // Remove the subscription
        this._subscriptions.splice(index, 1);
        // Check if there other subscriptions to the same topic
        index = this._subscriptions.findIndex((s) => s.topic == topic);
        // Unsubscribe from topic if connection is still open
        if (this._connection != null && index < 0) {
            this._connection.unsubscribe(topic, callback);
        }
        else {
            if (callback)
                callback(null);
        }
    }
}
exports.MqttConnection = MqttConnection;
//# sourceMappingURL=MqttConnection.js.map