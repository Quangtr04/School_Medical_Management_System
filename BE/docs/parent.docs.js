/**
 * @swagger
 * tags:
 *   name: Parent
 *   description: API dành cho phụ huynh quản lý thông tin học sinh, khám sức khỏe, tiêm chủng và thuốc
 */

/**
 * @swagger
 * /api/parent/profile:
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
 * /api/parent/students:
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
 * /api/parent/students/{student_id}:
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
 * /api/parent/notifications:
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
 * /api/parent/medical-submissions:
 *   post:
 *     summary: Gửi yêu cầu gửi thuốc
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: integer
 *               nurse_id:
 *                 type: integer
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Gửi thành công
 */

/**
 * @swagger
 * /api/parent/medical-submissions:
 *   get:
 *     summary: Lấy danh sách yêu cầu gửi thuốc
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn gửi thuốc
 */

/**
 * @swagger
 * /api/parent/medical-submissions/{id_req}:
 *   get:
 *     summary: Lấy chi tiết đơn yêu cầu gửi thuốc
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_req
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết đơn
 */

/**
 * @swagger
 * /api/parent/medical-submissions/{id_req}/cancel:
 *   patch:
 *     summary: Hủy yêu cầu gửi thuốc
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_req
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hủy thành công
 */

/**
 * @swagger
 * /api/parent/incidents:
 *   get:
 *     summary: Lấy danh sách sự cố y tế của phụ huynh
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sự cố
 */

/**
 * @swagger
 * /api/parent/students/{student_id}/health-declaration:
 *   get:
 *     summary: Lấy khai báo y tế của học sinh
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
 *         description: Thông tin khai báo y tế
 *
 *   patch:
 *     summary: Cập nhật khai báo y tế của học sinh
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthDeclaration'
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
