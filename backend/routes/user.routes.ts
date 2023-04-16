import {Router} from 'express';
import {
  fetchUsers,
  addUser,
  verifyUser,
  fetchOneUser,
  deleteOneUser,
  updateOneUser,
} from '../controllers/user.controllers';

const usersRoute = Router();

usersRoute.get('/', fetchUsers);
usersRoute.post('/register', addUser);
usersRoute.get('/verify/:token', verifyUser);
usersRoute.get('/:id', fetchOneUser);
usersRoute.delete('/:id', deleteOneUser);
usersRoute.put('/:id', updateOneUser);

export default usersRoute;
