// models/message.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Define association here
      Message.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Message.init({
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Name of the target table
        key: 'id',      // Key in the target table
      },
    },
  }, {
    sequelize,
    modelName: 'Message',
  });

  return Message;
};
