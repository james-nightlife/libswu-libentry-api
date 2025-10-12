import { app } from './app/index.js';

const port = process.env.API_PORT || 3001;

app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
    //console.log(`MySQL connection config: ${JSON.stringify(mysql_con_config)}`);
})

