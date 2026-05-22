import { Op } from 'sequelize';
import { LoggerFactory } from '@adapters';
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';
import { Doctor } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { DoctorValidationSchemas } from '@validators';
import { buildDoctorResponse } from '@utils/consent-utils';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('DoctorsController');

export const doctorsController = {
  getAll: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const query = DoctorValidationSchemas.validate<{ page: number; limit: number; specialization?: string; status: string }>(
        DoctorValidationSchemas.doctorListQuery,
        req.query as Record<string, unknown>
      );

      const offset = (query.page - 1) * query.limit;
      const whereClause: Record<string, unknown> = { status: query.status };

      if (query.specialization) {
        whereClause.specialization = { [Op.iLike]: `%${query.specialization}%` };
      }

      const { rows, count } = await Doctor.findAndCountAll({
        where: whereClause,
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        limit: query.limit,
        offset,
      });

      const items = rows.map((doctor) => buildDoctorResponse(doctor));

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          totalCount: count,
          items,
          hasNextPage: offset + query.limit < count,
          nextPage: offset + query.limit < count ? query.page + 1 : null,
        },
        'Doctors retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getAll' });
    }
  },

  getById: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const params = DoctorValidationSchemas.validate<{ id: string }>(
        DoctorValidationSchemas.doctorIdParams,
        req.params as Record<string, unknown>
      );

      const doctor = await Doctor.findOne({
        where: { id: params.id, status: 'ACTIVE' },
      });

      if (!doctor) {
        throw new GenericError('Doctor not found', ErrorCodes.DOCTOR_NOT_FOUND, 404, true);
      }

      res.sendResponse(buildDoctorResponse(doctor), 'Doctor retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getById' });
    }
  },

  search: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const query = DoctorValidationSchemas.validate<{ query: string; page: number; limit: number }>(
        DoctorValidationSchemas.doctorSearchQuery,
        req.query as Record<string, unknown>
      );

      const needle = query.query.trim().toLowerCase();
      const doctors = await Doctor.findAll({
        where: {
          status: 'ACTIVE',
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${needle}%` } },
            { lastName: { [Op.iLike]: `%${needle}%` } },
            { specialization: { [Op.iLike]: `%${needle}%` } },
            { hospitalName: { [Op.iLike]: `%${needle}%` } },
          ],
        },
      });

      const scored = doctors
        .map((doctor) => {
          const fullName = `${doctor.dataValues.firstName} ${doctor.dataValues.lastName}`.toLowerCase();
          const fields = [fullName, doctor.dataValues.firstName.toLowerCase(), doctor.dataValues.lastName.toLowerCase(), doctor.dataValues.specialization || '', doctor.dataValues.hospitalName || ''];
          const prefixMatch = fields.some((field) => field.startsWith(needle)) ? 0 : 1;
          const containsMatch = fields.some((field) => field.includes(needle)) ? 0 : 1;
          return { doctor, score: prefixMatch * 10 + containsMatch };
        })
        .sort((left, right) => left.score - right.score || left.doctor.dataValues.firstName.localeCompare(right.doctor.dataValues.firstName));

      const offset = (query.page - 1) * query.limit;
      const items = scored.slice(offset, offset + query.limit).map(({ doctor }) => buildDoctorResponse(doctor));

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items,
          hasNextPage: offset + query.limit < scored.length,
          nextPage: offset + query.limit < scored.length ? query.page + 1 : null,
        },
        'Doctors retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'search' });
    }
  },
};
