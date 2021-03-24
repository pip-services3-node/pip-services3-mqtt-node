"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttConnection = void 0;
/** @module queues */
/** @hidden */
const mqtt = require('mqtt');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const MqttConnectionResolver_1 = require("../connect/MqttConnectionResolver");
/**
 * Connection to MQTT message broker.
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
        "options.retry_connect", true, "options.connect_timeout", 30000, "options.reconnect_timeout", 1000, "options.keepalive_timeout", 60000);
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
         * Message listeners
         */
        this._messageListeners = [];
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
                for (let listener of this._messageListeners) {
                    listener.onMessage(topic, data, packet);
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
        this._logger.debug(correlationId, "Disconnected from MQTT broker");
        if (callback)
            callback(null);
    }
    getConnection() {
        return this._connection;
    }
    /**
     * Gets a list of registered queue names.
     * If connection doesn't support this function returnes an empty list.
     * @returns a list with registered queue names.
     */
    getQueueNames() {
        return [];
    }
    addMessageListener(listener) {
        this._messageListeners = this._messageListeners.filter(l => l != listener);
        this._messageListeners.push(listener);
    }
    removeMessageListener(listener) {
        this._messageListeners = this._messageListeners.filter(l => l != listener);
    }
}
exports.MqttConnection = MqttConnection;
//# sourceMappingURL=MqttConnection.js.map