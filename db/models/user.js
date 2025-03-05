'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const project = require('./project');
const user = sequelize.define('user', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userType: {
    type: DataTypes.ENUM('0', '1', '2'),
    allowNull:false,
    validate:{
      notNull:{msg:'user type can not  null'},
      notEmpty:{msg:'user can not empty'}
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{msg:'firstname  can not  null'},
      notEmpty:{msg:'firstname can not empty'}
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{msg:'lastname can not  null'},
      notEmpty:{msg:'lastname can not empty'}
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{msg:'email can not  null'},
      notEmpty:{msg:'email can not empty'},
      isEmail:{msg:'type a valid email '}
    }
  },
 password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
      notNull:{msg:'password  can not  null'},
      notEmpty:{msg:'password can not empty'}
    }
  },
  confirmPassword: {
    type: DataTypes.VIRTUAL,
    set(value) {
      if(this.password.length > 7){
        throw new AppError('Password must be at least 8 characters long', 400);
      }
      if (value === this.password) {
        const hashPassword = bcrypt.hashSync(value, 10);
        this.setDataValue('password', hashPassword);
      }
      else{
        throw new Error('Password does not match');
      }
    }
  
  },


  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    type: DataTypes.DATE
  },

},
  {
    paranoid: true,
    freezeTableName: true,
    modelName: 'user'
  }
)

user.hasMany(project, { foreignKey: 'createdBy' });
project.belongsTo(user, { foreignKey: 'createdBy' }); 

module.exports = user;
