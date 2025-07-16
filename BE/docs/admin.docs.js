/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API dành cho Admin để quản lý người dùng và học sinh
 */

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Information'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /admin/parents:
 *   get:
 *     summary: Lấy danh sách phụ huynh
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Danh sách phụ huynh
 */

/**
 * @swagger
 * /admin/managers:
 *   get:
 *     summary: Lấy danh sách hiệu trưởng
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Danh sách hiệu trưởng
 */

/**
 * @swagger
 * /admin/nurses:
 *   get:
 *     summary: Lấy danh sách y tá
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Danh sách y tá
 */

/**
 * @swagger
 * /admin/parents/{user_id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của phụ huynh
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 */

/**
 * @swagger
 * /admin/student/create:
 *   post:
 *     summary: Tạo thông tin học sinh
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentInformation'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /admin/student/update/{student_id}:
 *   patch:
 *     summary: Cập nhật thông tin học sinh
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentInformation'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /admin/parents/{user_id}:
 *   patch:
 *     summary: Cập nhật thông tin phụ huynh
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
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
 * /admin/parents/{user_id}:
 *   delete:
 *     summary: Xóa tài khoản phụ huynh
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Information:
 *       type: object
 *       properties:
 *         fullname:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [PARENT, MANAGER, NURSE]
 *         phone:
 *           type: string
 *       required:
 *         - fullname
 *         - email
 *         - password
 *         - role
 *         - phone
 *
 *     StudentInformation:
 *       type: object
 *       properties:
 *         full_name:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *         birth_date:
 *           type: string
 *           format: date
 *         parent_id:
 *           type: integer
 *         class_name:
 *           type: string
 *       required:
 *         - full_name
 *         - gender
 *         - birth_date
 *         - parent_id
 *         - class_name
 */
