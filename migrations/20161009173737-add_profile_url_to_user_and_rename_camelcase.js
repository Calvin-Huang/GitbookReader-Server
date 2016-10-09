'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Users', 
      'profileURL',
      Sequelize.STRING
    );

    queryInterface.renameColumn('Users', 'auth_token', 'authToken');
    queryInterface.renameColumn('Users', 'stars_url', 'starsURL');
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
