'use strict';

const notificationEvents = [
	{
		event_name: 'Report Uploaded',
		event_code: 'REPORT_UPLOADED',
		category: 'REPORT',
		version: 'v1',
		description: 'Triggered when a clinical report is uploaded.',
		configurations: {
			supported_channels: ['email', 'in_app'],
			email: {
				subject: 'Report uploaded',
				message: 'A new report has been uploaded.',
			},
			in_app: {
				message: 'A new report has been uploaded.',
			},
		},
		default_title_template: 'Report uploaded',
		default_body_template: 'A new report has been uploaded.',
		is_active: true,
		created_at: new Date(),
	},
	{
		event_name: 'Consent Request',
		event_code: 'CONSENT_REQUEST',
		category: 'CONSENT',
		version: 'v1',
		description: 'Triggered when a consent request is created.',
		configurations: {
			supported_channels: ['email', 'in_app'],
			email: {
				subject: 'Consent request received',
				message: 'You have a new consent request.',
			},
			in_app: {
				message: 'You have a new consent request.',
			},
		},
		default_title_template: 'Consent request received',
		default_body_template: 'You have a new consent request.',
		is_active: true,
		created_at: new Date(),
	},
	{
		event_name: 'Visit Reminder',
		event_code: 'VISIT_REMINDER',
		category: 'VISIT',
		version: 'v1',
		description: 'Triggered before an upcoming visit.',
		configurations: {
			supported_channels: ['email', 'in_app'],
			email: {
				subject: 'Upcoming visit reminder',
				message: 'You have an upcoming visit.',
			},
			in_app: {
				message: 'You have an upcoming visit.',
			},
		},
		default_title_template: 'Upcoming visit reminder',
		default_body_template: 'You have an upcoming visit.',
		is_active: true,
		created_at: new Date(),
	},
];

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('notification_events', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			event_name: {
				type: Sequelize.STRING(200),
				allowNull: false,
			},
			event_code: {
				type: Sequelize.STRING(100),
				allowNull: false,
				unique: true,
			},
			category: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			version: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			configurations: {
				type: Sequelize.JSONB,
				allowNull: false,
				defaultValue: {},
			},
			default_title_template: {
				type: Sequelize.STRING(500),
				allowNull: true,
			},
			default_body_template: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			is_active: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
		});

		await queryInterface.createTable('notifications', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			notification_event_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'notification_events',
					key: 'id',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			title: {
				type: Sequelize.STRING(500),
				allowNull: false,
			},
			body: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			type: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			priority: {
				type: Sequelize.STRING(20),
				allowNull: false,
				defaultValue: 'NORMAL',
			},
			is_read: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			read_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			action_url: {
				type: Sequelize.STRING(2000),
				allowNull: true,
			},
			action_label: {
				type: Sequelize.STRING(100),
				allowNull: true,
			},
			metadata: {
				type: Sequelize.JSONB,
				allowNull: true,
			},
			channel_type: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			sent_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
		});

		await queryInterface.createTable('notification_preferences', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			notification_event_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'notification_events',
					key: 'id',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			via_email: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			via_sms: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			via_in_app: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			is_enabled: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			is_editable: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			is_public: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
		}, {
			uniqueKeys: {
				notification_preferences_user_event_unique: {
					fields: ['user_id', 'notification_event_id'],
				},
			},
		});

		// Insert notification events with properly stringified JSONB configs
		const { v4: uuidv4 } = require('uuid');
		const eventsToInsert = notificationEvents.map(event => ({
			id: uuidv4(),
			...event,
			configurations: JSON.stringify(event.configurations),
			created_at: new Date(),
		}));
		await queryInterface.bulkInsert('notification_events', eventsToInsert);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('notification_preferences');
		await queryInterface.dropTable('notifications');
		await queryInterface.dropTable('notification_events');
	},
};
