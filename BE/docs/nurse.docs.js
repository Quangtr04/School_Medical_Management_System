/**
 * @swagger
 * tags:
 *   - name: Nurse
 *     description: API dành cho nhân viên y tế (nurse)
 */

/**
 * @swagger
 * /checkups/create:
 *   post:
 *     tags: [Nurse]
 *     summary: Tạo lịch khám sức khỏe
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Lịch khám đã được tạo thành công
 */

/**
 * @swagger
 * /checkups:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách tất cả lịch khám
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 */

/**
 * @swagger
 * /checkups/{id}:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy thông tin chi tiết lịch khám
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết lịch khám
 */

/**
 * @swagger
 * /checkups-approved/students:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách học sinh đã được duyệt khám
 *     responses:
 *       200:
 *         description: Danh sách học sinh đã duyệt
 */

/**
 * @swagger
 * /checkups-approved/{checkup_id}/students:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách học sinh trong lịch khám cụ thể
 *     parameters:
 *       - in: path
 *         name: checkup_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách học sinh theo lịch khám
 */

/**
 * @swagger
 * /checkups/{checkup_id}/students/{student_id}/result:
 *   post:
 *     tags: [Nurse]
 *     summary: Lưu kết quả khám cho học sinh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Checkup_Result'
 *     parameters:
 *       - in: path
 *         name: checkup_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lưu kết quả thành công
 */

/**
 * @swagger
 * /checkups/{checkup_id}/students/{student_id}/note:
 *   patch:
 *     tags: [Nurse]
 *     summary: Cập nhật ghi chú cho học sinh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     parameters:
 *       - in: path
 *         name: checkup_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ghi chú đã được cập nhật
 */

/**
 * @swagger
 * /checkups-approved:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách lịch khám đã được duyệt
 *     responses:
 *       200:
 *         description: Danh sách đã duyệt
 */

/**
 * @swagger
 * /checkups-declined:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách lịch khám bị từ chối
 *     responses:
 *       200:
 *         description: Danh sách bị từ chối
 */

/**
 * @swagger
 * /checkups-pending:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách lịch khám đang chờ duyệt
 *     responses:
 *       200:
 *         description: Danh sách chờ duyệt
 */

/**
 * @swagger
 * /create-incident:
 *   post:
 *     tags: [Nurse]
 *     summary: Ghi nhận sự cố y tế
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalIncidentSchema'
 *     responses:
 *       201:
 *         description: Ghi nhận thành công
 */

/**
 * @swagger
 * /incidents:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy tất cả sự cố y tế
 *     responses:
 *       200:
 *         description: Danh sách sự cố
 */

/**
 * @swagger
 * /incidents/{event_id}:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy chi tiết sự cố y tế
 *     parameters:
 *       - in: path
 *         name: event_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết sự cố
 */

/**
 * @swagger
 * /incidents/user:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy sự cố y tế theo user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách theo người dùng
 */

/**
 * @swagger
 * /incidents/student/{student_id}:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy sự cố y tế theo học sinh
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách theo học sinh
 */

/**
 * @swagger
 * /medical-supplies:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách vật tư y tế
 *     responses:
 *       200:
 *         description: Danh sách vật tư
 */

/**
 * @swagger
 * /medical-supplies/{supplyId}:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy chi tiết vật tư theo ID
 *     parameters:
 *       - in: path
 *         name: supplyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết vật tư
 */

/**
 * @swagger
 * /vaccine-campaigns:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách lịch tiêm chủng
 *     responses:
 *       200:
 *         description: Danh sách lịch tiêm chủng
 */

/**
 * @swagger
 * /vaccine-campaigns/{id}:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy chi tiết lịch tiêm
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết chiến dịch
 */

/**
 * @swagger
 * /vaccine-campaigns-declined:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách lịch tiêm bị từ chối
 *     responses:
 *       200:
 *         description: Danh sách bị từ chối
 */

/**
 * @swagger
 * /vaccine-campaigns-approved:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách lịch tiêm đã duyệt
 *     responses:
 *       200:
 *         description: Danh sách đã duyệt
 */

/**
 * @swagger
 * /vaccine-campaigns/create:
 *   post:
 *     tags: [Nurse]
 *     summary: Tạo lịch tiêm chủng mới
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tạo lịch tiêm thành công
 */

/**
 * @swagger
 * /vaccine-campaigns-students:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách học sinh đã duyệt tiêm
 *     responses:
 *       200:
 *         description: Danh sách học sinh
 */

/**
 * @swagger
 * /vaccine-campaigns-students/{id}:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy thông tin học sinh theo chiến dịch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách học sinh theo chiến dịch
 *   patch:
 *     tags: [Nurse]
 *     summary: Cập nhật kết quả tiêm của học sinh
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật kết quả thành công
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách thông báo của nurse
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */

/**
 * @swagger
 * /nurse/students/health-declaration:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy danh sách sức khỏe học sinh
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách thông tin sức khỏe của tất cả học sinh
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentHealthInfo'
 */

/**
 * @swagger
 * /nurse/students/health-declaration/{student_id}:
 *   get:
 *     tags: [Nurse]
 *     summary: Lấy thông tin sức khỏe của học sinh theo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của học sinh
 *     responses:
 *       200:
 *         description: Trả về thông tin sức khỏe của học sinh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentHealthInfo'
 *       404:
 *         description: Không tìm thấy học sinh
 *
 *   patch:
 *     tags: [Nurse]
 *     summary: Cập nhật thông tin sức khỏe của học sinh theo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của học sinh cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthDeclaration'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy học sinh
 */
