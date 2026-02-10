import { app } from './app/index.js';

const port = process.env.API_PORT || 3000;

app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
})

