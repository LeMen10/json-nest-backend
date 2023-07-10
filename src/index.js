const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const app = express();
const port = process.env.PORT || 9000;
const formidable = require('express-formidable');
const urlencoded = require('urlencode');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const cors = require('cors');


app.use(cookieParser());
app.use(express.json());

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const route = require('./routes');
const db = require('./config/db');

db.connect();

app.use(morgan('combined'));
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
        },
    }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

app.use(
    express.urlencoded({
        extended: true,
    }),
);

app.use(methodOverride('_method'));

route(app);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}/shop`);
});
