import { IMessageQueue } from 'pip-services3-messaging-node';
export declare class MessageQueueFixture {
    private _queue;
    constructor(queue: IMessageQueue);
    testSendReceiveMessage(done: any): void;
    testReceiveSendMessage(done: any): void;
    testReceiveCompleteMessage(done: any): void;
    testReceiveAbandonMessage(done: any): void;
    testSendPeekMessage(done: any): void;
    testPeekNoMessage(done: any): void;
    testMoveToDeadMessage(done: any): void;
    testOnMessage(done: any): void;
}
