/**
 * @swagger
 * tags:
 *   - name: Manager
 *     description: API dành cho người quản lý (manager)
 */

/**
 * @swagger
 * /checkups/pending:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy danh sách lịch khám đang chờ duyệt
 *     responses:
 *       200:
 *         description: Danh sách lịch khám đang chờ duyệt
 */

/**
 * @swagger
 * /checkups/{id}/respond:
 *   post:
 *     tags: [Manager]
 *     summary: Phản hồi chấp nhận hoặc từ chối lịch khám
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch khám
 *     requestBody:
 *       required: true
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
 *         description: Phản hồi lịch khám thành công
 */

/**
 * @swagger
 * /checkups/{checkup_id}/status:
 *   patch:
 *     tags: [Manager]
 *     summary: Cập nhật trạng thái lịch khám sức khỏe
 *     parameters:
 *       - in: path
 *         name: checkup_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch khám
 *     requestBody:
 *       required: true
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
 *         description: Trạng thái lịch khám đã được cập nhật
 */

/**
 * @swagger
 * /checkups:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy tất cả lịch khám
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 */

/**
 * @swagger
 * /checkups/{id}:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy thông tin chi tiết lịch khám
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch khám
 *     responses:
 *       200:
 *         description: Chi tiết lịch khám
 *   delete:
 *     tags: [Manager]
 *     summary: Xóa lịch khám theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch khám
 *     responses:
 *       200:
 *         description: Lịch khám đã bị xóa
 */

/**
 * @swagger
 * /checkups-approved:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy danh sách lịch khám đã duyệt
 *     responses:
 *       200:
 *         description: Danh sách lịch khám đã duyệt
 */

/**
 * @swagger
 * /checkups-declined:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy danh sách lịch khám bị từ chối
 *     responses:
 *       200:
 *         description: Danh sách lịch khám bị từ chối
 */

/**
 * @swagger
 * /vaccine-campaigns:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy danh sách lịch tiêm chủng
 *     responses:
 *       200:
 *         description: Danh sách lịch tiêm chủng
 */

/**
 * @swagger
 * /vaccine-campaigns/{id}:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy chi tiết lịch tiêm chủng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID chiến dịch
 *     responses:
 *       200:
 *         description: Chi tiết chiến dịch tiêm
 *   delete:
 *     tags: [Manager]
 *     summary: Xóa lịch tiêm chủng theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID chiến dịch
 *     responses:
 *       200:
 *         description: Xóa chiến dịch thành công
 */

/**
 * @swagger
 * /vaccine-campaigns-declined:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy danh sách lịch tiêm chủng bị từ chối
 *     responses:
 *       200:
 *         description: Danh sách lịch tiêm bị từ chối
 */

/**
 * @swagger
 * /vaccine-campaigns-approved:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy danh sách lịch tiêm chủng đã duyệt
 *     responses:
 *       200:
 *         description: Danh sách lịch tiêm đã duyệt
 */

/**
 * @swagger
 * /vaccine-campaigns/{id}/respond:
 *   post:
 *     tags: [Manager]
 *     summary: Phản hồi lịch tiêm chủng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID chiến dịch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gửi phản hồi thành công
 */

/**
 * @swagger
 * /vaccine-campaigns/{campaign_id}/status:
 *   patch:
 *     tags: [Manager]
 *     summary: Cập nhật trạng thái chiến dịch tiêm
 *     parameters:
 *       - in: path
 *         name: campaign_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID chiến dịch tiêm
 *     requestBody:
 *       required: true
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
 *         description: Cập nhật trạng thái thành công
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Manager]
 *     summary: Lấy danh sách thông báo của quản lý
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
