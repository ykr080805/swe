const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const programController = require('../controllers/programController');

router.get('/', authenticate, programController.getPrograms);
router.post('/', authenticate, authorizeRoles('admin'), auditLogger('CREATE_PROGRAM'), programController.createProgram);
router.put('/:id', authenticate, authorizeRoles('admin'), auditLogger('UPDATE_PROGRAM'), programController.updateProgram);
router.delete('/:id', authenticate, authorizeRoles('admin'), auditLogger('DELETE_PROGRAM'), programController.deleteProgram);

module.exports = router;
