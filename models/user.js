'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    uid: DataTypes.STRING,
    token: DataTypes.STRING,
    authToken: DataTypes.STRING,
    starsURL: DataTypes.STRING,
    profileURL: DataTypes.STRING,
    books: {
      type: DataTypes.STRING,
      get: function() {
        return JSON.parse(this.getDataValue('books') || '[]');
      },
      set: function(value) {
        this.setDataValue('books', JSON.stringify(value || []));
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['token']
      }
    ]
  });
  return User;
};
