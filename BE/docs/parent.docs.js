/**
 * @swagger
 * tags:
 *   - name: Parent
 *     description: API dành cho phụ huynh
 *
 * # === STUDENTS ===
 * /students:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy danh sách con cái của phụ huynh
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách học sinh
 *
 * /students/{student_id}:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy thông tin chi tiết của một học sinh
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin học sinh
 *
 * /profile/{user_id}:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy thông tin cá nhân của phụ huynh
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin cá nhân
 *
 *   patch:
 *     tags: [Parent]
 *     summary: Cập nhật thông tin cá nhân của phụ huynh
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công

 *
 * # === CHECKUPS ===
 * /checkups/approved:
 *   get:
 *     tags: [Parent]
 *     summary: Danh sách lịch khám sức khỏe đã duyệt
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đã duyệt
 *
 * /consents-checkups/approved:
 *   get:
 *     tags: [Parent]
 *     summary: Danh sách phiếu đồng ý khám sức khỏe đã duyệt
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phiếu khám
 *
 * /consents-checkups/{id}:
 *   get:
 *     tags: [Parent]
 *     summary: Chi tiết phiếu khám sức khỏe
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chi tiết phiếu khám
 *
 * /consents-checkups/pending:
 *   get:
 *     tags: [Parent]
 *     summary: Danh sách phiếu khám chưa phản hồi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phiếu pending
 *
 * /consents-checkups/{form_id}/respond:
 *   post:
 *     tags: [Parent]
 *     summary: Phản hồi phiếu khám (AGREED / DECLINED)
 *     parameters:
 *       - in: path
 *         name: form_id
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
 *               status:
 *                 type: string
 *                 enum: [AGREED, DECLINED]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Phản hồi thành công
 *
 * /checkups/{checkup_id}/consent:
 *   patch:
 *     tags: [Parent]
 *     summary: Cập nhật lại trạng thái đồng ý/từ chối
 *     parameters:
 *       - in: path
 *         name: checkup_id
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
 *               status:
 *                 type: string
 *                 enum: [AGREED, DECLINED]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *
 * # === HEALTH DECLARATION ===
 * /students/{student_id}/health-declaration:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy thông tin khai báo y tế
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Khai báo y tế
 *
 * /students/{studentId}/health-declarations:
 *   post:
 *     tags: [Parent]
 *     summary: Tạo khai báo y tế cho học sinh
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthDeclaration'
 *     responses:
 *       200:
 *         description: Tạo khai báo y tế thành công
 *
 * # === INCIDENTS ===
 * /incidents/{user_id}:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy sự cố y tế theo user ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sự cố
 *
 * /incidents/{incident_id}:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy chi tiết sự cố y tế theo ID
 *     parameters:
 *       - in: path
 *         name: incident_id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chi tiết sự cố
 *
 * # === MEDICAL SUBMISSIONS ===
 * /medical-submissions:
 *   post:
 *     tags: [Parent]
 *     summary: Gửi yêu cầu gửi thuốc
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalSubmissionRequest'
 *     responses:
 *       200:
 *         description: Gửi yêu cầu thành công
 *
 * # === VACCINATION CAMPAIGNS ===
 * /vaccine-campaigns:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy danh sách lịch tiêm chủng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách lịch tiêm chủng
 *
 * /vaccine-campaigns/{id}:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy lịch tiêm chủng theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chi tiết chiến dịch tiêm
 *
 * /vaccine-campaigns/approved:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy danh sách lịch tiêm chủng đã chấp thuận
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đã duyệt
 *
 * /vaccine-campaigns/declined:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy danh sách lịch tiêm chủng bị từ chối
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bị từ chối
 *
 * /vaccine-campaigns/{id}/respond:
 *   post:
 *     tags: [Parent]
 *     summary: Phản hồi lịch tiêm chủng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gửi phản hồi thành công
 *
 * /vaccine-campaigns/{id}/status:
 *   patch:
 *     tags: [Parent]
 *     summary: Cập nhật trạng thái lịch tiêm chủng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
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
 *
 * # === NOTIFICATIONS ===
 * /notifications:
 *   get:
 *     tags: [Parent]
 *     summary: Lấy danh sách thông báo của phụ huynh
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
