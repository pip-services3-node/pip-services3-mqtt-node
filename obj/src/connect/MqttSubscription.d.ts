import { IMqttMessageListener } from "./IMqttMessageListener";
export declare class MqttSubscription {
    topic: string;
    filter: boolean;
    options: any;
    listener: IMqttMessageListener;
}
