import { app } from './app/index.js';

app.listen(3001, () => {
    console.log(`Application is running on port 3010`);
    //console.log(`MySQL connection config: ${JSON.stringify(mysql_con_config)}`);
})

