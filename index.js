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




app.get('/', (req, res) => {
    res.send('Welcome to the Task Manager API');
});

app.listen(PORT, () => {
    log(`Server is running on PORT ${PORT}`);
}
);