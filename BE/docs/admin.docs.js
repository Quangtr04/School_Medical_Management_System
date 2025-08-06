/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API dành cho quản trị viên quản lý tài khoản và thông tin học sinh
 */

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Information'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */

/**
 * @swagger
 * /api/admin/parents:
 *   get:
 *     summary: Lấy danh sách tài khoản phụ huynh
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /api/admin/managers:
 *   get:
 *     summary: Lấy danh sách tài khoản hiệu trưởng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /api/admin/nurses:
 *   get:
 *     summary: Lấy danh sách tài khoản nhân viên y tế
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /api/admin/parents/{user_id}:
 *   get:
 *     summary: Lấy chi tiết phụ huynh theo user_id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /api/admin/managers/{user_id}:
 *   get:
 *     summary: Lấy chi tiết hiệu trưởng theo user_id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /api/admin/nurses/{user_id}:
 *   get:
 *     summary: Lấy chi tiết nhân viên y tế theo user_id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /api/admin/student/create:
 *   post:
 *     summary: Tạo thông tin học sinh
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentInformation'
 *     responses:
 *       201:
 *         description: Tạo thành công
 */

/**
 * @swagger
 * /api/admin/student/update/{student_id}:
 *   patch:
 *     summary: Cập nhật thông tin học sinh
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
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
 * /api/admin/parents/{user_id}:
 *   patch:
 *     summary: Cập nhật thông tin phụ huynh
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /api/admin/managers/{user_id}:
 *   patch:
 *     summary: Cập nhật thông tin hiệu trưởng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /api/admin/nurses/{user_id}:
 *   patch:
 *     summary: Cập nhật thông tin nhân viên y tế
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
