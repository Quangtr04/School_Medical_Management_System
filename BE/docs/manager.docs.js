/**
 * @swagger
 * tags:
 *   name: Manager
 *   description: API dành cho Hiệu trưởng để quản lý lịch khám, tiêm chủng và thông tin
 */

/**
 * @swagger
 * /manager/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân hiệu trưởng
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin cá nhân
 *   patch:
 *     summary: Cập nhật thông tin cá nhân hiệu trưởng
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /manager/checkups/pending:
 *   get:
 *     summary: Lấy danh sách lịch khám đang chờ duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 */

/**
 * @swagger
 * /manager/checkups/{id}/respond:
 *   post:
 *     summary: Phản hồi (duyệt / từ chối) lịch khám
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, DECLINED]
 *     responses:
 *       200:
 *         description: Phản hồi thành công
 */

/**
 * @swagger
 * /manager/checkups/{checkup_id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái lịch khám
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: checkup_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, DECLINED]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /manager/checkups:
 *   get:
 *     summary: Lấy danh sách tất cả lịch khám
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 */

/**
 * @swagger
 * /manager/checkups/{id}:
 *   get:
 *     summary: Lấy chi tiết lịch khám theo ID
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết lịch khám
 *   delete:
 *     summary: Xóa lịch khám theo ID
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

/**
 * @swagger
 * /manager/checkups-approved:
 *   get:
 *     summary: Lấy lịch khám đã được duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám đã duyệt
 */

/**
 * @swagger
 * /manager/checkups-declined:
 *   get:
 *     summary: Lấy lịch khám đã bị từ chối
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám bị từ chối
 */

/**
 * @swagger
 * /manager/vaccine-campaigns:
 *   get:
 *     summary: Lấy danh sách lịch tiêm chủng
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách chiến dịch tiêm chủng
 */

/**
 * @swagger
 * /manager/vaccine-campaigns/{id}:
 *   get:
 *     summary: Lấy chi tiết lịch tiêm chủng theo ID
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết chiến dịch tiêm chủng
 *   delete:
 *     summary: Xóa chiến dịch tiêm chủng
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

/**
 * @swagger
 * /manager/vaccine-campaigns-pending:
 *   get:
 *     summary: Lấy danh sách chiến dịch tiêm chủng chờ duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách chiến dịch đang chờ
 */

/**
 * @swagger
 * /manager/vaccine-campaigns-approved:
 *   get:
 *     summary: Lấy danh sách chiến dịch đã duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách chiến dịch đã duyệt
 */

/**
 * @swagger
 * /manager/vaccine-campaigns-declined:
 *   get:
 *     summary: Lấy danh sách chiến dịch bị từ chối
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách chiến dịch bị từ chối
 */

/**
 * @swagger
 * /manager/vaccine-campaigns/{id}/respond:
 *   post:
 *     summary: Phản hồi chiến dịch tiêm chủng
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, DECLINED]
 *     responses:
 *       200:
 *         description: Phản hồi thành công
 */

/**
 * @swagger
 * /manager/vaccine-campaigns/{campaign_id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái chiến dịch tiêm chủng
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: campaign_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /manager/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo của hiệu trưởng
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
