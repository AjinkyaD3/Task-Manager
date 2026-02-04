const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { log, error } = require('console');
const { title } = require('process');
const { create } = require('domain');


const PORT = 3002;

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://mongo:27017/taskmanager').then(() => {
    log('Connected to MongoDB');
}).catch((err) => {
    error('Failed to connect to MongoDB', err);
});

const TaskSchema = new mongoose.Schema({
    title: { type: String, },
    description: { type: String, },
    userId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', TaskSchema);

app.post("/tasks", async (req, res) => {
    const { title, description, userId } = req.body;

    try {
        const newTask = new Task({ title: title, description: description, userId: userId });
        await newTask.save();
        res.status(201).json({ message: "Task created successfully", data: newTask.toObject() });
    }
    catch (err) {
        error('Error creating task:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }

});

app.get("/tasks", async (req, res) => {

    const tasks = await Task.find({});
    res.status(200).json({ data: tasks });
})



app.get('/', (req, res) => {
    res.send('Welcome to the Task service API');
});




app.listen(PORT, () => {
    log(`task service is running on PORT ${PORT}`);
}
);