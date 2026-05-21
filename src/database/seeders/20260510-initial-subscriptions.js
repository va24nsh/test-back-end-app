'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('subscriptions', [
      {
        id: '11111111-1111-4111-1111-111111111111',
        name: 'Basic',
        code: 'BASIC',
        description: 'Perfect for getting started',
        monthly_price: 0,
        yearly_price: 0,
        price_currency: 'USD',
        trial_period_days: 14,
        grace_period_days: 3,
        is_default_plan: true,
        is_active: true,
        is_public: true,
        extra_info: JSON.stringify({
          show_ads: true,
          report_upload_limit: { day: 2, month: 20 },
          clinical_analytics_support: false,
          priority_support: false,
          storage_gb: 0.5,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '22222222-2222-4222-2222-222222222222',
        name: 'Premium',
        code: 'PREMIUM',
        description: 'For serious health tracking',
        monthly_price: 9.99,
        yearly_price: 99.99,
        price_currency: 'USD',
        trial_period_days: 7,
        grace_period_days: 5,
        is_default_plan: false,
        is_active: true,
        is_public: true,
        extra_info: JSON.stringify({
          show_ads: false,
          report_upload_limit: { day: 10, month: 100 },
          clinical_analytics_support: true,
          priority_support: true,
          storage_gb: 5,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '33333333-3333-4333-3333-333333333333',
        name: 'Professional',
        code: 'PROFESSIONAL',
        description: 'For healthcare professionals',
        monthly_price: 29.99,
        yearly_price: 299.99,
        price_currency: 'USD',
        trial_period_days: 0,
        grace_period_days: 7,
        is_default_plan: false,
        is_active: true,
        is_public: true,
        extra_info: JSON.stringify({
          show_ads: false,
          report_upload_limit: { day: 50, month: 500 },
          clinical_analytics_support: true,
          priority_support: true,
          storage_gb: 50,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('subscriptions', null, {});
  }
};
