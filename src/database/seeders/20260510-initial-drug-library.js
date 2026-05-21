'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('drug_library', [
      {
        id: '44444444-4444-4444-4444-444444444444',
        drug_name: 'Paracetamol',
        generic_name: 'Acetaminophen',
        drug_type: 'Analgesic, Antipyretic',
        description: 'Pain reliever and fever reducer',
        dosage_form: 'Tablet',
        strength: '500mg',
        brand_names: JSON.stringify(['Dolo-650', 'Crocin', 'Calpol', 'Tylenol']),
        brand_metadata: JSON.stringify([
          { brand_name: 'Dolo-650', manufacturer: 'Micro Labs', country: 'India', strength: '650mg', dosage_form: 'tablet' },
          { brand_name: 'Crocin', manufacturer: 'GSK', country: 'India', strength: '500mg', dosage_form: 'tablet' },
        ]),
        extra_info: JSON.stringify({
          contraindications: ['Liver disease', 'Alcoholism'],
          side_effects: ['Nausea', 'Rash'],
          interactions: ['Alcohol increases hepatotoxicity'],
        }),
        is_prescription_required: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '55555555-5555-4555-5555-555555555555',
        drug_name: 'Ibuprofen',
        generic_name: 'Ibuprofen',
        drug_type: 'NSAID',
        description: 'Anti-inflammatory pain reliever',
        dosage_form: 'Tablet',
        strength: '400mg',
        brand_names: JSON.stringify(['Brufen', 'Combiflam']),
        brand_metadata: JSON.stringify([
          { brand_name: 'Brufen', manufacturer: 'Abbott', country: 'India', strength: '400mg', dosage_form: 'tablet' },
        ]),
        extra_info: JSON.stringify({
          contraindications: ['GI ulcers', 'Kidney disease'],
          side_effects: ['Gastritis', 'Dizziness'],
          interactions: ['May reduce blood pressure medication effectiveness'],
        }),
        is_prescription_required: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '66666666-6666-4666-6666-666666666666',
        drug_name: 'Amoxicillin',
        generic_name: 'Amoxicillin',
        drug_type: 'Beta-lactam Antibiotic',
        description: 'Antibiotic for bacterial infections',
        dosage_form: 'Capsule',
        strength: '500mg',
        brand_names: JSON.stringify(['Amoxycillin', 'Augmentin (with clavulanic acid)']),
        brand_metadata: JSON.stringify([]),
        extra_info: JSON.stringify({
          contraindications: ['Penicillin allergy', 'Infectious mononucleosis'],
          side_effects: ['Allergic reactions', 'Diarrhea'],
          interactions: ['May reduce oral contraceptive effectiveness'],
        }),
        is_prescription_required: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '77777777-7777-4777-7777-777777777777',
        drug_name: 'Metformin',
        generic_name: 'Metformin',
        drug_type: 'Antidiabetic',
        description: 'First-line treatment for type 2 diabetes',
        dosage_form: 'Tablet',
        strength: '500mg',
        brand_names: JSON.stringify(['Glucophage', 'Diabeta']),
        brand_metadata: JSON.stringify([]),
        extra_info: JSON.stringify({
          contraindications: ['Kidney impairment', 'Heart failure', 'Liver disease'],
          side_effects: ['Nausea', 'Metallic taste', 'Diarrhea'],
          interactions: ['Alcohol increases risk of lactic acidosis'],
        }),
        is_prescription_required: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '88888888-8888-4888-8888-888888888888',
        drug_name: 'Aspirin',
        generic_name: 'Acetylsalicylic Acid',
        drug_type: 'Antiplatelet, Analgesic',
        description: 'Pain reliever and blood thinner',
        dosage_form: 'Tablet',
        strength: '75mg',
        brand_names: JSON.stringify(['Aspirin', 'Ecotrin']),
        brand_metadata: JSON.stringify([]),
        extra_info: JSON.stringify({
          contraindications: ['GI bleeding', 'Asthma', 'Bleeding disorders'],
          side_effects: ['GI bleeding', 'Rash'],
          interactions: ['Increases bleeding risk with anticoagulants'],
        }),
        is_prescription_required: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('drug_library', null, {});
  }
};
