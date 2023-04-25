import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import formidable from 'formidable';
import jwt from 'jsonwebtoken';
import fs from 'fs';
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

const registerUser = async (req: Request, res: Response) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, password, email, phone } = fields;
    const { image } = files;
    if (!name || !email || !phone || !password) {
      return res.status(404).json({
        message: 'name, email, phone or password is missing'
      });
    }
    if (password.length < 8) {
      return res.status(404).json({
        message: 'minimum length for password is 8 characters'
      });
    }
    const isUserFound = await User.findOne({ email });
    if (isUserFound) {
      return res.status(400).json({ message: 'there is a user with same email' });
    }
    if (image && (image as formidable.File).size > 1000000) {
      return res.status(400).json({ message: 'image bigger than 1mb' });
    }

    const hashedPass = await hashPass(password);
    jwt.sign(
      { name, hashedPass, email, phone, image },
      env.JWT_PRIVATE,
      { expiresIn: '10min' },
      function (err, token) {
        if (err) {
          return res.status(400).json({ message: 'something went wrong' });
        }
        const emailInfo = {
          email,
          subject: 'hello',
          html: `<h2>Hello ${name}</h2>
            <p>Please click the link bellow to verify your email</p>
            <a style="color:white;text-decoration:none;padding:1rem;line-height:2rem;background:dodgerblue;" href="${env.CLIENT_URL}/api/users/auth/verify/${token}" target="_blank">ACTIVATE</a>
            `
        };

        sendEmail(emailInfo);
        return res.status(200).json({
          message: 'A verification link has been sent to your email.',
          token: token
        });
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
  // return res.status(201).json({ message: 'user created' });
};
const verifyUser = async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) {
    return res.status(404).json({
      message: 'token is missing'
    });
  }
  jwt.verify(token, env.JWT_PRIVATE, async function (err, decoded) {
    if (err) {
      return res.status(401).json({
        message: 'token is expired'
      });
    }
    interface JwtPayload {
      name: string;
      email: string;
      hashedPass: string;
      phone: number;
      image: { type: Buffer; mimetype: string; filepath: string };
    }

    const { name, email, hashedPass, phone, image } = decoded as JwtPayload;
    console.log('image:', image);
    const isUserFound = await User.findOne({ email: email });
    if (isUserFound) {
      res.status(400).json({
        message: 'user with this email is already there'
      });
    }
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPass,
      phone: phone,
      is_verified: 1,
      image: undefined
    });
    // if (image) {
    //   const userImag = {
    //     data: fs.readFileSync(image.filepath),
    //     contentType: image.mimetype
    //   };
    //   (newUser.image as any) = userImag;
    // }

    const user = await newUser.save();
    if (!user) {
      res.status(400).json({
        message: 'user was not created'
      });
    }
    res.status(200).json({
      message: 'user was created, ready to sign in'
    });
  });
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        message: 'email or password is missing'
      });
    }
    if (password.length < 8) {
      return res.status(404).json({
        message: 'minimum length for password is 8 characters'
      });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: 'user with this email does not exist, please register first'
      });
    }

    const isPasswordMatch = await comparePass(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: 'email/password does not match'
      });
    }
    (req.session as any).userId  = user._id

    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image
      },
      message: 'login successful'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const userProfile = (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: 'Profile returned'
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
const admin = (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: 'Admin returned'
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
const logoutUser = (req: Request, res: Response) => {
  try {
    req.session.destroy(()=>{})
    res.clearCookie('user_session')
    res.status(200).json({
      message: 'logout successful'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
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

export {
  fetchUsers,
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  userProfile,
  admin,
  fetchOneUser,
  deleteOneUser,
  updateOneUser
};
