import { sequelize } from '@auth/database';
import { IAuthDocument } from '@auth/types/authTypes';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';
import bcrypt, { compare } from 'bcrypt';
import { config } from '@auth/config';

interface AuthModelInstanceMethods extends Model {
  prototype: {
    comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
    hashPassword: (password: string) => Promise<string>;
  };
}

type AuthUserCreatingAttributes = Optional<IAuthDocument, 'id' | 'passwordResetToken' | 'passwordResetExpires' | 'createdAt'>;

export const AuthModel: ModelDefined<IAuthDocument, AuthUserCreatingAttributes> & AuthModelInstanceMethods = sequelize.define(
  'auth',
  {
    username: {
      type: new DataTypes.STRING(),
      allowNull: false
    },
    email: {
      type: new DataTypes.STRING(),
      allowNull: false
    },
    profilePublicId: {
      type: new DataTypes.STRING(),
      allowNull: false
    },
    password: {
      type: new DataTypes.STRING(),
      allowNull: false
    },
    country: {
      type: new DataTypes.STRING(),
      allowNull: false
    },
    profilePicture: {
      type: new DataTypes.STRING(),
      allowNull: true
    },
    emailVerified: {
      type: new DataTypes.BOOLEAN(),
      allowNull: false,
      defaultValue: 0
    },
    emailVerificationToken: {
      type: new DataTypes.STRING(),
      allowNull: true
    },
    browserName: {
      type: new DataTypes.STRING(),
      allowNull: false
    },
    deviceType: {
      type: new DataTypes.STRING(),
      allowNull: false
    },
    otp: {
      type: new DataTypes.STRING(),
      allowNull: true
    },
    otpExpirationDate: {
      type: new DataTypes.DATE(),
      allowNull: true
    },
    createdAt: {
      type: new DataTypes.DATE(),
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    passwordResetToken: {
      type: new DataTypes.STRING(),
      allowNull: true
    },
    passwordResetExpires: {
      type: new DataTypes.DATE(),
      allowNull: true
    }
  },
  {
    indexes: [
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['emailVerificationToken'] }
    ]
  }
) as ModelDefined<IAuthDocument, AuthUserCreatingAttributes> & AuthModelInstanceMethods;

AuthModel.addHook('beforeCreate', async (auth: Model) => {
  try {
    const hashedPassword = await bcrypt.hash(auth.dataValues.password, Number(config.SALT_HASH));
    auth.dataValues.password = hashedPassword;
  } catch (error) {
    return Promise.reject(error);
  }
});

//add a method to model
AuthModel.prototype.comparePassword = async function comparePassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
};
AuthModel.prototype.hashPassword = async function hashPassword(password: string) {
  const hashPassword = await bcrypt.hash(password, Number(config.SALT_HASH));

  return hashPassword;
};
// force: true always deletes the table when there is a server restart
//AuthModel.sync({ force: true });
AuthModel.sync();
