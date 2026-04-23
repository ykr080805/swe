const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const departmentController = require('../controllers/departmentController');

router.get('/', authenticate, departmentController.getDepartments);
router.post('/', authenticate, authorizeRoles('admin'), auditLogger('CREATE_DEPARTMENT'), departmentController.createDepartment);
router.put('/:id', authenticate, authorizeRoles('admin'), auditLogger('UPDATE_DEPARTMENT'), departmentController.updateDepartment);
router.delete('/:id', authenticate, authorizeRoles('admin'), auditLogger('DELETE_DEPARTMENT'), departmentController.deleteDepartment);

module.exports = router;
