/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: API xác thực người dùng

 * /login:
 *   post:
 *     tags: [Login]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai thông tin đăng nhập

 * /login/forgot-password:
 *   post:
 *     tags: [Login]
 *     summary: Quên mật khẩu - gửi email khôi phục
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Gửi email thành công
 *       404:
 *         description: Email không tồn tại

 * /login/reset-password:
 *   post:
 *     tags: [Login]
 *     summary: Đặt lại mật khẩu mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
