require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const amqp = require('amqplib');

const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/taskmanager';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

const app = express();
app.use(bodyParser.json());

mongoose.connect(MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

const TaskSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    userId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', TaskSchema);

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            connection = await amqp.connect(RABBITMQ_URL);
            channel = await connection.createChannel();
            await channel.assertQueue('task_created');
            console.log('Connected to RabbitMQ');
            return;
        } catch (err) {
            console.log(`Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}), retrying in ${delay / 1000} seconds...`, err.message);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    console.error('Failed to connect to RabbitMQ after multiple attempts.');
}

app.post("/tasks", async (req, res) => {
    const { title, description, userId } = req.body;

    try {
        const newTask = new Task({ title, description, userId });
        await newTask.save();
        const message = {
            taskId: newTask._id,
            userId,
            title: newTask.title,
        };

        if (channel) {
            channel.sendToQueue('task_created', Buffer.from(JSON.stringify(message)));
        } else {
            console.error('Message broker not connected, task created but notification not sent');
        }

        res.status(201).json({ message: "Task created successfully", data: newTask.toObject() });
    }
    catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).json({ data: tasks });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Task service API');
});

app.listen(PORT, () => {
    console.log(`task service is running on PORT ${PORT}`);
    connectRabbitMQWithRetry();
});