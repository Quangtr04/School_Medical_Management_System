/**
 * @swagger
 * tags:
 *   name: Nurse
 *   description: API danh cho y tá để quản lý khám sức khỏe, tiêm chủng, đơn thuốc và sự cố y tế
 */

/**
 * @swagger
 * /api/nurse/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân y tá
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thành công
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
 * /api/nurse/checkups/create:
 *   post:
 *     summary: Tạo lịch khám sức khỏe
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tạo thành công
 */

/**
 * @swagger
 * /api/nurse/checkups:
 *   get:
 *     summary: Xem tất cả lịch khám
 *     tags: [Nurse]
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 *
 * /api/nurse/checkups/{id}:
 *   get:
 *     summary: Lấy chi tiết lịch khám theo ID
 *     tags: [Nurse]
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
 * /api/nurse/checkups-approved/students/{checkup_id}:
 *   get:
 *     summary: Lấy danh sách học sinh đã duyệt theo checkup
 *     tags: [Nurse]
 *     parameters:
 *       - in: path
 *         name: checkup_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách học sinh
 *
 * /api/nurse/checkups-approved/{id}/students/{student_id}:
 *   get:
 *     summary: Lấy chi tiết học sinh trong checkup
 *     tags: [Nurse]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Chi tiết học sinh
 */

/**
 * @swagger
 * /api/nurse/checkups/students/{id}/update:
 *   patch:
 *     summary: Cập nhật kết quả khám sức khỏe học sinh
 *     tags: [Nurse]
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
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /api/nurse/create-incident:
 *   post:
 *     summary: Ghi nhận sự cố y tế
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalIncidentSchema'
 *     responses:
 *       200:
 *         description: Tạo thành công
 */

/**
 * @swagger
 * /api/nurse/incidents:
 *   get:
 *     summary: Lấy danh sách sự cố y tế
 *     tags: [Nurse]
 *     responses:
 *       200:
 *         description: Danh sách sự cố
 *
 * /api/nurse/incidents/{event_id}:
 *   get:
 *     summary: Lấy chi tiết sự cố theo event_id
 *     tags: [Nurse]
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
 * /api/nurse/medical-supplies:
 *   get:
 *     summary: Lấy danh sách vật tư y tế
 *     tags: [Nurse]
 *     responses:
 *       200:
 *         description: Danh sách vật tư
 */

/**
 * @swagger
 * /api/nurse/vaccine-campaigns:
 *   get:
 *     summary: Lấy danh sách chiến dịch tiêm chủng
 *     tags: [Nurse]
 *     responses:
 *       200:
 *         description: Danh sách chiến dịch
 *
 * /api/nurse/vaccine-campaigns/create:
 *   post:
 *     summary: Tạo chiến dịch tiêm chủng
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tạo thành công
 */

/**
 * @swagger
 * /api/nurse/medication-submissions:
 *   get:
 *     summary: Lấy danh sách đơn thuốc được gửi
 *     tags: [Nurse]
 *     responses:
 *       200:
 *         description: Danh sách đơn thuốc
 *
 * /api/nurse/medication-submissions/{ReqId}:
 *   get:
 *     summary: Lấy chi tiết đơn thuốc theo ID
 *     tags: [Nurse]
 *     parameters:
 *       - in: path
 *         name: ReqId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết đơn thuốc
 */

/**
 * @swagger
 * /api/nurse/logs/by-request/{id_req}:
 *   get:
 *     summary: Lấy nhật ký thuốc theo yêu cầu
 *     tags: [Nurse]
 *     parameters:
 *       - in: path
 *         name: id_req
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhật ký
 */

/**
 * @swagger
 * /api/nurse/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo y tá
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
