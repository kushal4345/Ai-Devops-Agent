// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Basic health check route
// app.get('/health', (req, res) => {
//     res.status(200).json({ status: 'OK', message: 'AI DevOps Agent Server is healthy' });
// });

// // Global error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Internal Server Error' });
// });

// module.exports = app;
const crypto = require("crypto")
const val = crypto.randomUUID()  // generate random id 
console.log(val);
// console.log(process.cwd());
// console.log(__dirname);