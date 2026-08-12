const app = require('./app');
require('./workers/emailWorker'); // Start email background worker
require('./workers/jobWorker');   // Start job analysis background worker


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
