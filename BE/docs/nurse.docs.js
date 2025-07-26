/**
 * @swagger
 * tags:
 *   name: Nurse
 *   description: API danh cho y tá để quản lý lịch khám, sự cố y tế, vật tư, tiêm chủng và thuốc
 */

/**
 * @swagger
 * /nurse/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân y tá
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin y tá
 *
 *   patch:
 *     summary: Cập nhật thông tin y tá
 *     tags: [Nurse]
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
 * /nurse/checkups/create:
 *   post:
 *     summary: Tạo lịch khám sức khỏe
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 */

/**
 * @swagger
 * /nurse/checkups:
 *   get:
 *     summary: Xem danh sách tất cả lịch khám
 *     tags: [Nurse]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 */

/**
 * @swagger
 * /nurse/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo cho y tá
 *     tags: [Nurse]
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
