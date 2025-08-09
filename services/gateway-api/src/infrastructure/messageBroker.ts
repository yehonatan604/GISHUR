import amqp from 'amqplib';
import { envService } from '../services/env.service.js';
import { RpcClient } from './RpcClient.js';

const { MESSAGE_BROKER_URL } = envService.vars;

const connection = await amqp.connect(MESSAGE_BROKER_URL);
const channel = await connection.createChannel();
const rpc = new RpcClient(channel);

export { channel, connection, rpc };