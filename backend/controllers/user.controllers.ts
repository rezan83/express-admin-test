import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import formidable from 'formidable';
import jwt from 'jsonwebtoken';
import User, { IUser, IUserFiles } from '../models/user.model';
import { comparePass, hashPass } from '../helpers/bcryptPass';
import env from '../config';
import sendEmail from '../helpers/mailer';

const fetchUsers = async (req: Request, res: Response) => {
  const { limit = 0, page = 1, title } = req.query;
  const pages = !limit ? null : Math.ceil((await User.countDocuments({})) / +limit);
  const next = pages === null ? false : +page < pages;
  User.find()
    .limit(+limit)
    .skip((+page - 1) * +limit)
    .sort({ title: title } as { [key: string]: SortOrder })
    .then((users: IUser[]) => {
      pages
        ? res.json({
            page: +page,
            pages,
            next,
            users
          })
        : res.json(users);
    })
    .catch(err => res.status(404).json({ message: 'users not found', error: err.message }));
};

const addUser = async (req: Request, res: Response) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, password, email, phone } = fields;
    const { image } = files;

    const isUserFound = await User.findOne({ email });
    if (isUserFound) {
      return res.status(400).json({ message: 'there is a user with same email' });
    }
    if (image && (image as formidable.File).size > 1000000) {
      return res.status(400).json({ message: 'image bigger than 1mb' });
    }

    const hashedPass = await hashPass(password);
    const token = jwt.sign(
      { name, hashedPass, email, phone },
      env.JWT_PRIVATE,
      { expiresIn: '10min' },
      function (err, token) {
        if (!err) {
          
          const emailInfo = {
            email,
            subject: 'hello',
            html: `<h1>Hello ${name}</h1>
            <p>Please click the link bellow to verify your email</p>
            <p><a href="${env.CLIENT_URL}/api/users/verify/${token}" target="_blank">ACTIVATE</a></p>
            `
          };
      
          sendEmail(emailInfo)
        }
      }
    );

    
  });

  //   const newUser = new User(req.body);
  //   newUser
  //     .save()
  //     .then(data => {
  //       return res.status(201).json({message: 'success', data});
  //     })
  //     .catch(err =>
  //       res.status(400).json({message: 'Failed to add User', error: err.message})
  //     );
  return res.status(201).json({ message: 'user created' });
};
const verifyUser = (req: Request, res: Response) => {
  const {token} = req.params

  const veryfyed = jwt.verify(token, env.JWT_PRIVATE)

  console.log("veryfyed: ",veryfyed)
  return res.status(200).json({ message: veryfyed });

};

const fetchOneUser = (req: Request, res: Response) => {
  User.findById(req.params.id)
    .then(user => res.status(200).json(user))
    .catch(err => res.status(404).json({ message: 'user not found', error: err.message }));
};

const deleteOneUser = (req: Request, res: Response) => {
  User.findByIdAndRemove(req.params.id)
    .then(data =>
      res.status(200).json({ message: `user with id:${req.params.id} deleted successfully` })
    )
    .catch(err => res.status(404).json({ message: 'user not found', error: err.message }));
};
const updateOneUser = (req: Request, res: Response) => {
  User.findByIdAndUpdate(req.params.id, req.body)
    .then(data => res.status(200).json({ message: 'updated successfully', data }))
    .catch(err => res.status(404).json({ message: 'user not found', error: err.message }));
};

export { fetchUsers, addUser, verifyUser, fetchOneUser, deleteOneUser, updateOneUser };
