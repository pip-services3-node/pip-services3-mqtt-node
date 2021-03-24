export interface IMqttMessageListener {
    onMessage(topic: string, message: any, packet: any): void;
}