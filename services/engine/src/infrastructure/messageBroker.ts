import amqp from 'amqplib';
import { env } from '../env.js';

const { MESSAGE_BROKER_URL } = env;

const connection = await amqp.connect(MESSAGE_BROKER_URL);
const channel = await connection.createChannel();

export { channel, connection };