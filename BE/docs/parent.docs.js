/**
 * @swagger
 * tags:
 *   name: Parent
 *   description: API dành cho phụ huynh quản lý thông tin học sinh, khám sức khỏe, tiêm chủng và thuốc
 */

/**
 * @swagger
 * /parent/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân phụ huynh
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin cá nhân
 *
 *   patch:
 *     summary: Cập nhật thông tin cá nhân phụ huynh
 *     tags: [Parent]
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
 * /parent/students:
 *   get:
 *     summary: Lấy danh sách học sinh của phụ huynh
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách học sinh
 */

/**
 * @swagger
 * /parent/students/{student_id}:
 *   get:
 *     summary: Lấy thông tin chi tiết học sinh
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin học sinh
 */

/**
 * @swagger
 * /parent/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo của phụ huynh
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
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
