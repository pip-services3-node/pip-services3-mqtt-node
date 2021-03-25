import { IMqttMessageListener } from "./IMqttMessageListener";

export class MqttSubscription {
    public topic: string;
    public filter: boolean;
    public options: any;
    public listener: IMqttMessageListener;
}