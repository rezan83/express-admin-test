import { Router } from 'express';
import session from 'express-session'
import {
  fetchUsers,
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  userProfile,
  fetchOneUser,
  deleteOneUser,
  updateOneUser
} from '../controllers/user.controllers';
import env from '../config';
const usersRoute = Router();

// app.set('trust proxy', 1) // trust first proxy
usersRoute.use(session({
  secret: env.SESSION_SEC,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false , maxAge: 10*60*1000}
}))

usersRoute.get('/', fetchUsers);
usersRoute.get('/:id', fetchOneUser);
usersRoute.delete('/:id', deleteOneUser);
usersRoute.put('/:id', updateOneUser);
usersRoute.post('/auth/register', registerUser);
usersRoute.post('/auth/login', loginUser);
usersRoute.post('/auth/logout', logoutUser);
usersRoute.post('/auth/profile', userProfile);
usersRoute.get('/auth/verify/:token', verifyUser);

export default usersRoute;
