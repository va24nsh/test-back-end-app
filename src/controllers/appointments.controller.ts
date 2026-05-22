import { LoggerFactory } from '@adapters';
import { Appointment, Doctor } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { AppointmentValidationSchemas } from '@validators';
import { ValidationError } from '@errors';
import { ErrorCodes } from '@errors/errorCodes';
import { GenericError } from '@errors/GenericError';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('AppointmentsController');

const ALL_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const SLOT_PERIODS: Record<string, string[]> = {
  morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  afternoon: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  evening: ['17:00', '17:30'],
};

export const appointmentsController = {
  create: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const body = AppointmentValidationSchemas.validate<{
        doctorId: string;
        date: string;
        timeSlot: string;
        patientName: string;
        patientPhone: string;
        patientGender: string;
        patientAge: string;
      }>(AppointmentValidationSchemas.createBody, req.body as Record<string, unknown>);

      const userId = req.userId || req.user?.id;

      // Verify doctor exists and is ACTIVE
      const doctor = await Doctor.findOne({
        where: { id: body.doctorId, status: 'ACTIVE' },
      });

      if (!doctor) {
        throw new ValidationError('Doctor not found or inactive', {
          doctorId: ['The specified doctor does not exist or is not active'],
        });
      }

      // Check for conflict: same userId + doctorId + date + timeSlot with UPCOMING status
      const existingAppointment = await Appointment.findOne({
        where: {
          userId,
          doctorId: body.doctorId,
          date: body.date,
          timeSlot: body.timeSlot,
          status: 'UPCOMING',
        },
      });

      if (existingAppointment) {
        throw new GenericError(
          'An appointment already exists for this doctor, date, and time slot',
          ErrorCodes.APPOINTMENT_CONFLICT,
          409,
          true
        );
      }

      // Denormalize doctor fields and create appointment
      const appointment = await Appointment.create({
        userId: userId!,
        doctorId: body.doctorId,
        doctorName: `${doctor.dataValues.firstName} ${doctor.dataValues.lastName}`,
        doctorSpecialization: doctor.dataValues.specialization || '',
        doctorHospital: doctor.dataValues.hospitalName || '',
        doctorFees: doctor.dataValues.fees ?? null,
        patientName: body.patientName,
        patientPhone: body.patientPhone,
        patientGender: body.patientGender,
        patientAge: body.patientAge,
        date: body.date,
        timeSlot: body.timeSlot,
        status: 'UPCOMING',
      });

      res.sendResponse(appointment, 'Appointment created successfully', 201);
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'create' });
    }
  },

  list: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const query = AppointmentValidationSchemas.validate<{
        status?: string;
        page: number;
        limit: number;
      }>(AppointmentValidationSchemas.listQuery, req.query as Record<string, unknown>);

      const userId = req.userId || req.user?.id;
      const { page, limit, status } = query;
      const offset = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = { userId };
      if (status) {
        where.status = status;
      }

      // Query with pagination
      const { count, rows } = await Appointment.findAndCountAll({
        where,
        order: [
          ['date', 'DESC'],
          ['timeSlot', 'DESC'],
        ],
        limit,
        offset,
      });

      const hasNextPage = offset + rows.length < count;

      // Map items to response shape
      const items = rows.map((appointment) => ({
        id: appointment.dataValues.id,
        doctorId: appointment.dataValues.doctorId,
        doctorName: appointment.dataValues.doctorName,
        doctorSpecialization: appointment.dataValues.doctorSpecialization,
        doctorHospital: appointment.dataValues.doctorHospital,
        patientName: appointment.dataValues.patientName,
        date: appointment.dataValues.date,
        timeSlot: appointment.dataValues.timeSlot,
        status: appointment.dataValues.status,
        fees: appointment.dataValues.doctorFees,
        createdAt: appointment.dataValues.createdAt,
      }));

      res.sendResponse({
        page,
        pageSize: limit,
        items,
        hasNextPage,
        nextPage: hasNextPage ? page + 1 : null,
      }, 'Appointments retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'list' });
    }
  },

  getSlots: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const query = AppointmentValidationSchemas.validate<{
        doctorId: string;
        date: string;
      }>(AppointmentValidationSchemas.slotsQuery, req.query as Record<string, unknown>);

      // Verify doctor exists and is ACTIVE
      const doctor = await Doctor.findOne({
        where: { id: query.doctorId, status: 'ACTIVE' },
      });

      if (!doctor) {
        throw new ValidationError('Doctor not found or inactive', {
          doctorId: ['The specified doctor does not exist or is not active'],
        });
      }

      // Query existing UPCOMING appointments for the doctor+date combination
      const existingAppointments = await Appointment.findAll({
        where: {
          doctorId: query.doctorId,
          date: query.date,
          status: 'UPCOMING',
        },
        attributes: ['timeSlot'],
      });

      const bookedSlots = new Set(existingAppointments.map((appt) => appt.timeSlot));

      // Generate grouped slots with availability
      const groupedSlots: Record<string, { time: string; available: boolean }[]> = {};

      for (const [period, slots] of Object.entries(SLOT_PERIODS)) {
        groupedSlots[period] = slots.map((time) => ({
          time,
          available: !bookedSlots.has(time),
        }));
      }

      res.sendResponse(groupedSlots, 'Slots retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getSlots' });
    }
  },

  cancel: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      // Validate :id path parameter as UUID
      const params = AppointmentValidationSchemas.validate<{ id: string }>(
        AppointmentValidationSchemas.cancelParams,
        req.params as Record<string, unknown>
      );

      const userId = req.userId || req.user?.id;

      // Find appointment by ID
      const appointment = await Appointment.findOne({
        where: { id: params.id },
      });

      // Return 404 APPOINTMENT_NOT_FOUND if not found
      if (!appointment) {
        throw new GenericError(
          'Appointment not found',
          ErrorCodes.APPOINTMENT_NOT_FOUND,
          404,
          true
        );
      }

      // Check ownership - return 403 FORBIDDEN if mismatch
      if (appointment.dataValues.userId !== userId) {
        throw new GenericError(
          'You do not have permission to cancel this appointment',
          ErrorCodes.FORBIDDEN,
          403,
          true
        );
      }

      // Check status is UPCOMING - return 400 APPOINTMENT_NOT_CANCELLABLE if not
      if (appointment.dataValues.status !== 'UPCOMING') {
        throw new GenericError(
          'Only upcoming appointments can be cancelled',
          ErrorCodes.APPOINTMENT_NOT_CANCELLABLE,
          400,
          true
        );
      }

      // Update status to CANCELLED and set cancelledAt to current UTC timestamp
      const cancelledAt = new Date();
      await appointment.update({
        status: 'CANCELLED',
        cancelledAt,
      });

      // Return 200 with updated appointment
      res.sendResponse(
        {
          id: appointment.dataValues.id,
          status: 'CANCELLED',
          cancelledAt,
          doctorName: appointment.dataValues.doctorName,
          date: appointment.dataValues.date,
          timeSlot: appointment.dataValues.timeSlot,
        },
        'Appointment cancelled successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'cancel' });
    }
  },
};
