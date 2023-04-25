import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import env from './config';
import connectDB from './db';
import usersRoute from './routes/user.routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/api/users', usersRoute);
connectDB();

app.get('/', (req, res) => {
  return res.send('hello');
});

app.listen(env.PORT, () => {
  console.log(`server running at: http://localhost:${env.PORT}/`);
});
