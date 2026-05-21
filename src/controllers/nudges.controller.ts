import { LoggerFactory } from '@adapters';
import { NotFoundError, ValidationError } from '@errors';
import { Nudge, Doctor } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { NudgeValidationSchemas } from '@validators/nudges/NudgeValidationSchemas';
import { handleControllerError } from '@utils/errorHandler';

const logger = new LoggerFactory().createLogger('NudgesController');

const buildNudgeResponse = (nudge: Nudge) => ({
  id: nudge.dataValues.id,
  title: nudge.dataValues.title,
  body: nudge.dataValues.body,
  type: nudge.dataValues.type,
  nudgedBy: nudge.dataValues.nudgedByDoctorId
    ? {
        id: (nudge as any).nudgedByDoctor?.dataValues?.id,
        firstName: (nudge as any).nudgedByDoctor?.dataValues?.firstName,
        lastName: (nudge as any).nudgedByDoctor?.dataValues?.lastName,
        specialization: (nudge as any).nudgedByDoctor?.dataValues?.specialization || null,
        hospitalName: (nudge as any).nudgedByDoctor?.dataValues?.hospitalName || null,
        profilePicture: (nudge as any).nudgedByDoctor?.dataValues?.profilePicture || null,
        isVerified: (nudge as any).nudgedByDoctor?.dataValues?.isVerified || false,
        status: (nudge as any).nudgedByDoctor?.dataValues?.status || null,
      }
    : null,
  uniqueComponentName: nudge.dataValues.uniqueComponentName || null,
  actionUrl: nudge.dataValues.actionUrl || null,
  isRead: nudge.dataValues.isRead,
  createdAt: nudge.dataValues.createdAt,
});

export const nudgesController = {
  list: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const query = NudgeValidationSchemas.validate<{ page: number; limit: number }>(
        NudgeValidationSchemas.listQuery,
        req.query as Record<string, unknown>
      );

      const offset = (query.page - 1) * query.limit;
      const rows = await Nudge.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: query.limit + 1,
        offset,
        include: [
          {
            model: Doctor,
            as: 'nudgedByDoctor',
            attributes: ['id', 'firstName', 'lastName', 'specialization', 'hospitalName', 'profilePicture', 'isVerified', 'status'],
          },
        ],
      });

      const hasNextPage = rows.length > query.limit;
      const items = rows.slice(0, query.limit).map(buildNudgeResponse);

      res.sendResponse(
        {
          page: query.page,
          pageSize: query.limit,
          items,
          hasNextPage,
          nextPage: hasNextPage ? query.page + 1 : null,
        },
        'Nudges retrieved successfully'
      );
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'list' });
    }
  },

  markRead: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const params = NudgeValidationSchemas.validate<{ id: string }>(
        NudgeValidationSchemas.markReadParams,
        req.params as Record<string, unknown>
      );
      NudgeValidationSchemas.validate<{ isRead: boolean }>(NudgeValidationSchemas.markReadBody, req.body as Record<string, unknown>);

      const nudge = await Nudge.findOne({ where: { id: params.id, userId } });
      if (!nudge) {
        throw new NotFoundError('Nudge not found');
      }

      await nudge.update({ isRead: true, readAt: nudge.dataValues.readAt || new Date() });

      res.sendResponse({ id: nudge.dataValues.id, isRead: nudge.dataValues.isRead, readAt: nudge.dataValues.readAt }, 'Nudge marked as read successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'markRead' });
    }
  },
};
