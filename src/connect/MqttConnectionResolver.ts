/** @module connect */
/** @hidden */
const async = require('async');

import { IReferenceable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { ConfigException } from 'pip-services3-commons-node';
import { ConnectionResolver } from 'pip-services3-components-node';
import { CredentialResolver } from 'pip-services3-components-node';
import { ConnectionParams } from 'pip-services3-components-node';
import { CredentialParams } from 'pip-services3-components-node';

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
export class MqttConnectionResolver implements IReferenceable, IConfigurable {
    /** 
     * The connections resolver.
     */
    protected _connectionResolver: ConnectionResolver = new ConnectionResolver();
    /** 
     * The credentials resolver.
     */
    protected _credentialResolver: CredentialResolver = new CredentialResolver();

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
    }

    /**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
     */
    public setReferences(references: IReferences): void {
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }

    private validateConnection(correlationId: string, connection: ConnectionParams): any {
        if (connection == null)
            return new ConfigException(correlationId, "NO_CONNECTION", "MQTT connection is not set");

        let uri = connection.getUri();
        if (uri != null) return null;

        let protocol = connection.getAsStringWithDefault("protocol", "mqtt");
        if (protocol == null)
            return new ConfigException(correlationId, "NO_PROTOCOL", "Connection protocol is not set");

        let host = connection.getHost();
        if (host == null)
            return new ConfigException(correlationId, "NO_HOST", "Connection host is not set");

        let port = connection.getAsIntegerWithDefault("port", 1883);
        if (port == 0)
            return new ConfigException(correlationId, "NO_PORT", "Connection port is not set");

        return null;
    }

    private composeOptions(connection: ConnectionParams, credential: CredentialParams): any {
        // Define additional parameters parameters
        let options = connection.override(credential);

        // Compose uri
        if (options.getAsString("uri") == null) {
            let protocol = connection.getAsStringWithDefault("protocol", "mqtt");
            let host = connection.getHost();
            let port = connection.getAsIntegerWithDefault("port", 1883);
            let uri = protocol + "://" + host + ":" + port;
            options.setAsObject("uri", uri);
        }

        return options.getAsObject();
    }

    /**
     * Resolves MQTT connection options from connection and credential parameters.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives resolved options or error.
     */
    public resolve(correlationId: string, callback: (err: any, options: any) => void): void {
        let connection: ConnectionParams;
        let credential: CredentialParams;

        async.parallel([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err: any, result: ConnectionParams) => {
                    connection = result;

                    // Validate connections
                    if (err == null)
                        err = this.validateConnection(correlationId, connection);

                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err: any, result: CredentialParams) => {
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
    public compose(correlationId: string, connection: ConnectionParams, credential: CredentialParams,
        callback: (err: any, options: any) => void): void {

        // Validate connections
        let err = this.validateConnection(correlationId, connection);
        if (err) callback(err, null);
        else {
            let options = this.composeOptions(connection, credential);
            callback(null, options);
        }
    }
}
