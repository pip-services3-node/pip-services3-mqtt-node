"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttConnectionResolver = void 0;
/** @module connect */
/** @hidden */
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
/**
 * Helper class that resolves MQTT connection and credential parameters,
 * validates them and generates connection options.
 *
 *  ### Configuration parameters ###
 *
 * - connection(s):
 *   - discovery_key:               (optional) a key to retrieve the connection from [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/connect.idiscovery.html IDiscovery]]
 *   - host:                        host name or IP address
 *   - port:                        port number
 *   - uri:                         resource URI or connection string with all parameters in it
 * - credential(s):
 *   - store_key:                   (optional) a key to retrieve the credentials from [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/auth.icredentialstore.html ICredentialStore]]
 *   - username:                    user name
 *   - password:                    user password
 *
 * ### References ###
 *
 * - <code>\*:discovery:\*:\*:1.0</code>          (optional) [[https://pip-services3-node.github.io/pip-services3-components-node/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connections
 * - <code>\*:credential-store:\*:\*:1.0</code>   (optional) Credential stores to resolve credentials
 */
class MqttConnectionResolver {
    constructor() {
        /**
         * The connections resolver.
         */
        this._connectionResolver = new pip_services3_components_node_1.ConnectionResolver();
        /**
         * The credentials resolver.
         */
        this._credentialResolver = new pip_services3_components_node_2.CredentialResolver();
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }
    validateConnection(correlationId, connection) {
        if (connection == null)
            return new pip_services3_commons_node_1.ConfigException(correlationId, "NO_CONNECTION", "MQTT connection is not set");
        let uri = connection.getUri();
        if (uri != null)
            return null;
        let protocol = connection.getAsNullableString("protocol");
        if (protocol == null)
            return new pip_services3_commons_node_1.ConfigException(correlationId, "NO_PROTOCOL", "Connection protocol is not set");
        let host = connection.getHost();
        if (host == null)
            return new pip_services3_commons_node_1.ConfigException(correlationId, "NO_HOST", "Connection host is not set");
        let port = connection.getPort();
        if (port == 0)
            return new pip_services3_commons_node_1.ConfigException(correlationId, "NO_PORT", "Connection port is not set");
        return null;
    }
    composeOptions(connection, credential) {
        // Define additional parameters parameters
        let options = connection.override(credential).getAsObject();
        // Compose uri
        if (options.uri == null) {
            options.uri = options.protocol + "://" + options.host;
            if (options.port)
                options.uri += ':' + options.port;
        }
        return options;
    }
    /**
     * Resolves MQTT connection options from connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives resolved options or error.
     */
    resolve(correlationId, callback) {
        let connection;
        let credential;
        async.parallel([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err, result) => {
                    connection = result;
                    // Validate connections
                    if (err == null)
                        err = this.validateConnection(correlationId, connection);
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err, result) => {
                    credential = result;
                    // Credentials are not validated right now
                    callback(err);
                });
            }
        ], (err) => {
            if (err)
                callback(err, null);
            else {
                let options = this.composeOptions(connection, credential);
                callback(null, options);
            }
        });
    }
    /**
     * Composes MQTT connection options from connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connection        connection parameters
     * @param credential        credential parameters
     * @param callback 			callback function that receives resolved options or error.
     */
    compose(correlationId, connection, credential, callback) {
        // Validate connections
        let err = this.validateConnection(correlationId, connection);
        if (err)
            callback(err, null);
        else {
            let options = this.composeOptions(connection, credential);
            callback(null, options);
        }
    }
}
exports.MqttConnectionResolver = MqttConnectionResolver;
//# sourceMappingURL=MqttConnectionResolver.js.map