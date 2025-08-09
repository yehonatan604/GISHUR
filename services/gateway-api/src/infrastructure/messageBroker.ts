import amqp from 'amqplib';
import { RpcClient } from './RpcClient.js';
import { env } from '../env.js';

const { MESSAGE_BROKER_URL } = env;

const connection = await amqp.connect(MESSAGE_BROKER_URL);
const channel = await connection.createChannel();
const rpc = new RpcClient(channel);

export { channel, connection, rpc };