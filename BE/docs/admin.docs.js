/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: API dành cho quản trị viên
 */

// ----------------------- Đăng ký tài khoản -----------------------

/**
 * @swagger
 * /admin/register:
 *   post:
 *     tags: [Admin]
 *     summary: Đăng ký tài khoản mới (tạo user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Information'
 *     responses:
 *       200:
 *         description: Tạo tài khoản thành công
 */

// ----------------------- Quản lý Phụ huynh -----------------------

/**
 * @swagger
 * /admin/parents:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy danh sách phụ huynh
 *     responses:
 *       200:
 *         description: Danh sách phụ huynh
 */

/**
 * @swagger
 * /admin/parents/{user_id}:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy thông tin phụ huynh theo ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin phụ huynh
 *   patch:
 *     tags: [Admin]
 *     summary: Cập nhật tài khoản phụ huynh
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *   delete:
 *     tags: [Admin]
 *     summary: Xóa tài khoản phụ huynh
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

// ----------------------- Quản lý Quản lý (Manager) -----------------------

/**
 * @swagger
 * /admin/managers:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy danh sách quản lý
 *     responses:
 *       200:
 *         description: Danh sách quản lý
 */

/**
 * @swagger
 * /admin/managers/{user_id}:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy thông tin quản lý theo ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin quản lý
 *   patch:
 *     tags: [Admin]
 *     summary: Cập nhật tài khoản quản lý
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *   delete:
 *     tags: [Admin]
 *     summary: Xóa tài khoản quản lý
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

// ----------------------- Quản lý Y tá -----------------------

/**
 * @swagger
 * /admin/nurses:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy danh sách y tá
 *     responses:
 *       200:
 *         description: Danh sách y tá
 */

/**
 * @swagger
 * /admin/nurses/{user_id}:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy thông tin y tá theo ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin y tá
 *   patch:
 *     tags: [Admin]
 *     summary: Cập nhật tài khoản y tá
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *   delete:
 *     tags: [Admin]
 *     summary: Xóa tài khoản y tá
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

// ----------------------- Học sinh -----------------------

/**
 * @swagger
 * /admin/student/create:
 *   post:
 *     tags: [Admin]
 *     summary: Tạo thông tin học sinh mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentInformation'
 *     responses:
 *       200:
 *         description: Tạo thông tin học sinh thành công
 */

/**
 * @swagger
 * /admin/student/update/{student_id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Cập nhật thông tin học sinh
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
 *             $ref: '#/components/schemas/StudentInformation'
 *     responses:
 *       200:
 *         description: Cập nhật thông tin học sinh thành công
 */
