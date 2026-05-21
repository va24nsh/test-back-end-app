/**
 * Initial users seeder - adds a single admin test user.
 */

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('users', [
      {
        id: '00000000-0000-0000-0000-000000000001',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone_number: '+10000000000',
        provider: ['phone'],
        is_active: true,
        is_verified: true,
        is_onboarded: true,
        is_profile_completed: true,
        is_admin: true,
        firebase_user_id: 'seed-firebase-user-1',
        failed_login_attempts: 0,
        email_verification_action_count: 0,
        is_terms_and_conditions_accepted: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', { email: 'test@example.com' }, {});
  }
};
