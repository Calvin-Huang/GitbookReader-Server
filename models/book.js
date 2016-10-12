'use strict';
module.exports = function(sequelize, DataTypes) {
  var Book = sequelize.define('Book', {
    bid: DataTypes.STRING,
    author: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Book;
};