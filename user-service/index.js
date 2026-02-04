require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/taskmanager';

const app = express();
app.use(bodyParser.json());

mongoose.connect(MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

app.get('/', (req, res) => {
    res.send('Welcome to the Task Manager API');
});

app.post("/user", async (req, res) => {
    const { name, email } = req.body;

    try {
        const newUser = new User({ name, email });
        await newUser.save();
        res.status(201).send({ message: "User created successfully", data: newUser.toObject() });
    }
    catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send({ data: users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});