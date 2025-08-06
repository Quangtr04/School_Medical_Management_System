/**
 * @swagger
 * tags:
 *   name: Manager
 *   description: API dành cho hiệu trưởng để quản lý khám sức khỏe và tiêm chủng
 */

/**
 * @swagger
 * /api/manager/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân của hiệu trưởng
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin cá nhân
 *
 *   patch:
 *     summary: Cập nhật thông tin hiệu trưởng
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
 * /api/manager/checkups/pending:
 *   get:
 *     summary: Lấy danh sách lịch khám chờ duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám chờ duyệt
 */

/**
 * @swagger
 * /api/manager/checkups/{id}/respond:
 *   post:
 *     summary: Phản hồi chấp nhận hoặc từ chối lịch khám
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
 * /api/manager/checkups/{checkup_id}/status:
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
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /api/manager/checkups:
 *   get:
 *     summary: Lấy danh sách tất cả lịch khám
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 */

/**
 * @swagger
 * /api/manager/checkups/{id}:
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
 *
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
 * /api/manager/checkups-approved:
 *   get:
 *     summary: Lấy danh sách lịch khám đã duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách đã duyệt
 */

/**
 * @swagger
 * /api/manager/checkups-declined:
 *   get:
 *     summary: Lấy danh sách lịch khám bị từ chối
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách bị từ chối
 */

/**
 * @swagger
 * /api/manager/vaccine-campaigns:
 *   get:
 *     summary: Lấy danh sách chiến dịch tiêm chủng
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách chiến dịch
 */

/**
 * @swagger
 * /api/manager/vaccine-campaigns/{id}:
 *   get:
 *     summary: Lấy chi tiết chiến dịch tiêm chủng theo ID
 *     tags: [Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết chiến dịch
 *
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
 * /api/manager/vaccine-campaigns-pending:
 *   get:
 *     summary: Lấy danh sách chiến dịch tiêm chủng chờ duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách chờ duyệt
 */

/**
 * @swagger
 * /api/manager/vaccine-campaigns-approved:
 *   get:
 *     summary: Lấy danh sách chiến dịch tiêm chủng đã duyệt
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách đã duyệt
 */

/**
 * @swagger
 * /api/manager/vaccine-campaigns-declined:
 *   get:
 *     summary: Lấy danh sách chiến dịch tiêm chủng bị từ chối
 *     tags: [Manager]
 *     responses:
 *       200:
 *         description: Danh sách bị từ chối
 */

/**
 * @swagger
 * /api/manager/vaccine-campaigns/{id}/respond:
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
 * /api/manager/vaccine-campaigns/{campaign_id}/status:
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
 * /api/manager/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo của hiệu trưởng
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
