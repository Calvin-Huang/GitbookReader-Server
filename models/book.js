'use strict';
module.exports = function(sequelize, DataTypes) {
  var Book = sequelize.define('Book', {
    bid: DataTypes.STRING,
    author: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        // User.hasMany(models.Task)
        Book.belongsTo(models.User, { foreignKey : 'userId' });
      }
    }
  });
  return Book;
};