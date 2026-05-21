# Seeders

This folder contains Sequelize seeder files.

## Creating a Seeder

```bash
npm run seed:create --name <seeder-name>
```

## Example Seeder

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        email: 'admin@example.com',
        password: 'hashed_password_here',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@example.com',
    });
  },
};
```

