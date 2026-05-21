'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('consent_text_versions', [
      {
        id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
        version: 'v1.0',
        consent_care: 'I hereby consent to the use of my health information by the healthcare provider for direct care, treatment planning, and continuity of care.',
        consent_training: 'I additionally consent to the use of my de-identified health information for training, research, and improvement of healthcare services.',
        is_active: true,
        effective_from: new Date('2026-01-01'),
        effective_until: null,
        created_by: null,
        change_reason: 'Initial consent framework',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
        version: 'v1.1',
        consent_care: 'I hereby consent to the use of my health information by the healthcare provider for direct care, treatment planning, continuity of care, and emergency situations.',
        consent_training: 'I additionally consent to the use of my de-identified health information for training, research, quality improvement, and advancement of healthcare services.',
        is_active: false,
        effective_from: new Date('2026-06-01'),
        effective_until: new Date('2026-12-31'),
        created_by: null,
        change_reason: 'Updated with emergency care clause',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('consent_text_versions', null, {});
  }
};
