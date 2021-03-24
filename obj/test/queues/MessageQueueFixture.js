"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueueFixture = void 0;
const assert = require('chai').assert;
const async = require('async');
const pip_services3_messaging_node_1 = require("pip-services3-messaging-node");
class MessageQueueFixture {
    constructor(queue) {
        this._queue = queue;
    }
    testSendReceiveMessage(done) {
        let envelop1 = new pip_services3_messaging_node_1.MessageEnvelope("123", "Test", "Test message");
        let envelop2;
        async.series([
            (callback) => {
                this._queue.send(null, envelop1, callback);
            },
            // (callback) => {
            //     var count = this._queue.readMessageCount((err, count) => {
            //         assert.isTrue(count > 0);
            //         callback(err);
            //     });
            // },
            (callback) => {
                this._queue.receive(null, 10000, (err, result) => {
                    envelop2 = result;
                    assert.isNotNull(envelop2);
                    assert.equal(envelop1.message_type, envelop2.message_type);
                    assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
                    assert.equal(envelop1.correlation_id, envelop2.correlation_id);
                    callback(err);
                });
            }
        ], done);
    }
    testReceiveSendMessage(done) {
        let envelop1 = new pip_services3_messaging_node_1.MessageEnvelope("123", "Test", "Test message");
        let envelop2;
        setTimeout(() => {
            this._queue.send(null, envelop1, () => { });
        }, 500);
        this._queue.receive(null, 10000, (err, result) => {
            envelop2 = result;
            assert.isNotNull(envelop2);
            assert.equal(envelop1.message_type, envelop2.message_type);
            assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
            assert.equal(envelop1.correlation_id, envelop2.correlation_id);
            done(err);
        });
    }
    testReceiveCompleteMessage(done) {
        let envelop1 = new pip_services3_messaging_node_1.MessageEnvelope("123", "Test", "Test message");
        let envelop2;
        async.series([
            (callback) => {
                this._queue.send(null, envelop1, callback);
            },
            (callback) => {
                var count = this._queue.readMessageCount((err, count) => {
                    assert.isTrue(count > 0);
                    callback(err);
                });
            },
            (callback) => {
                this._queue.receive(null, 10000, (err, result) => {
                    envelop2 = result;
                    assert.isNotNull(envelop2);
                    assert.equal(envelop1.message_type, envelop2.message_type);
                    assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
                    assert.equal(envelop1.correlation_id, envelop2.correlation_id);
                    callback(err);
                });
            },
            (callback) => {
                this._queue.complete(envelop2, (err) => {
                    assert.isNull(envelop2.getReference());
                    callback(err);
                });
            }
        ], done);
    }
    testReceiveAbandonMessage(done) {
        let envelop1 = new pip_services3_messaging_node_1.MessageEnvelope("123", "Test", "Test message");
        let envelop2;
        async.series([
            (callback) => {
                this._queue.send(null, envelop1, callback);
            },
            (callback) => {
                this._queue.receive(null, 10000, (err, result) => {
                    envelop2 = result;
                    assert.isNotNull(envelop2);
                    assert.equal(envelop1.message_type, envelop2.message_type);
                    assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
                    assert.equal(envelop1.correlation_id, envelop2.correlation_id);
                    callback(err);
                });
            },
            (callback) => {
                this._queue.abandon(envelop2, (err) => {
                    callback(err);
                });
            },
            (callback) => {
                this._queue.receive(null, 10000, (err, result) => {
                    envelop2 = result;
                    assert.isNotNull(envelop2);
                    assert.equal(envelop1.message_type, envelop2.message_type);
                    assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
                    assert.equal(envelop1.correlation_id, envelop2.correlation_id);
                    callback(err);
                });
            }
        ], done);
    }
    testSendPeekMessage(done) {
        let envelop1 = new pip_services3_messaging_node_1.MessageEnvelope("123", "Test", "Test message");
        let envelop2;
        async.series([
            (callback) => {
                this._queue.send(null, envelop1, callback);
            },
            (callback) => {
                setTimeout(() => {
                    callback();
                }, 1000);
            },
            (callback) => {
                this._queue.peek(null, (err, result) => {
                    envelop2 = result;
                    assert.isNotNull(envelop2);
                    assert.equal(envelop1.message_type, envelop2.message_type);
                    assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
                    assert.equal(envelop1.correlation_id, envelop2.correlation_id);
                    callback(err);
                });
            }
        ], done);
    }
    testPeekNoMessage(done) {
        this._queue.peek(null, (err, result) => {
            assert.isNull(result);
            done();
        });
    }
    testMoveToDeadMessage(done) {
        let envelop1 = new pip_services3_messaging_node_1.MessageEnvelope("123", "Test", "Test message");
        let envelop2;
        async.series([
            (callback) => {
                this._queue.send(null, envelop1, callback);
            },
            (callback) => {
                this._queue.receive(null, 10000, (err, result) => {
                    envelop2 = result;
                    assert.isNotNull(envelop2);
                    assert.equal(envelop1.message_type, envelop2.message_type);
                    assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
                    assert.equal(envelop1.correlation_id, envelop2.correlation_id);
                    callback(err);
                });
            },
            (callback) => {
                this._queue.moveToDeadLetter(envelop2, callback);
            }
        ], done);
    }
    testOnMessage(done) {
        let envelop1 = new pip_services3_messaging_node_1.MessageEnvelope("123", "Test", "Test message");
        let envelop2 = null;
        this._queue.beginListen(null, {
            receiveMessage: (envelop, queue, callback) => {
                envelop2 = envelop;
                callback(null);
            }
        });
        async.series([
            (callback) => {
                setTimeout(() => {
                    callback();
                }, 1000);
            },
            (callback) => {
                this._queue.send(null, envelop1, callback);
            },
            (callback) => {
                setTimeout(() => {
                    callback();
                }, 1000);
            },
            (callback) => {
                assert.isNotNull(envelop2);
                assert.equal(envelop1.message_type, envelop2.message_type);
                assert.equal(envelop1.getMessageAsString(), envelop2.getMessageAsString());
                assert.equal(envelop1.correlation_id, envelop2.correlation_id);
                callback();
            }
        ], (err) => {
            this._queue.endListen(null);
            done();
        });
    }
}
exports.MessageQueueFixture = MessageQueueFixture;
//# sourceMappingURL=MessageQueueFixture.js.map