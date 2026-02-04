require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

let channel, connection;

async function start(retries = 5, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            connection = await amqp.connect(RABBITMQ_URL);
            channel = await connection.createChannel();

            await channel.assertQueue('task_created');
            console.log('notification-service listening to task_created queue');

            channel.consume('task_created', msg => {
                if (msg !== null) {
                    const message = JSON.parse(msg.content.toString());
                    console.log('Received task_created message:', message);
                    // Here you would typically send an email or push notification
                    channel.ack(msg);
                }
            });
            return;
        } catch (err) {
            console.log(`Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}), retrying in ${delay / 1000} seconds...`, err.message);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    console.error('Failed to connect to RabbitMQ after multiple attempts.');
}

start();

