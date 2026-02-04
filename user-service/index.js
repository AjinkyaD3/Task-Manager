const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { log, error } = require('console');


const PORT = 3001;

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/taskmanager').then(() => {
    log('Connected to MongoDB');
}).catch((err) => {
    error('Failed to connect to MongoDB', err);
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    email: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);


app.get('/', (req, res) => {
    res.send('Welcome to the Task Manager API');
});


app.post("/user", async (req, res) => {
    const { name, email } = req.body;

    try {
        const newUser = new User({ name: name, email: email });
        await newUser.save();
        res.status(201).send({ message: "User created successfully", data: newUser.toObject() });
    }
    catch (err) {
        error('Error creating user:', err);
        res.status(500).send({ message: "Internal Server Error" });
    }

});

app.get("/users", async (req, res) => {

    const users = await User.find({});
    res.status(200).send({ data: users });
})

app.listen(PORT, () => {
    log(`Server is running on PORT ${PORT}`);
}
);