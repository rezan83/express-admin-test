import { Schema, model } from 'mongoose';

export interface IUserFiles {
  image?: Buffer | undefined;
}
export interface IUser extends IUserFiles {
  name: string;
  password: string;
  email: string;
  phone: number;
  is_verified: boolean;
  is_admin: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    min: 8,
    validate: {
      validator: v => /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(v),
      message: '8 char, 1 uppercase, 1 lowercase, 1 number'
    }
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: true,
    validate: {
      validator: v => /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/.test(v),
      message: 'not a valid email'
    }
  },
  phone: {
    type: Number,
    required: true,
    min: 6
  },
  is_verified: { type: Boolean, default: false },
  is_admin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  image: { type: Buffer, contentType: String }
});

const User = model<IUser>('User', userSchema);

export default User;
