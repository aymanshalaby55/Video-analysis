
const express = require('express');
const router = express.Router();
const aiModelController = require('../controllers/AiModelsController');
const { protect, verifyTokenAndAdmin } = require('../middleware/verifyToken');

router.use(protect);

router.get('/user/getAllModels', aiModelController.getUserAllAiModels)

app.use(verifyTokenAndAdmin);
router.route('/')
  .get('/admin/getAllModels', aiModelController.getAdminAllAiModels)
  .post('/createModel', aiModelController.createAiModel);

// router.route('/:id')
//   .get(aiModelController.getAiModel)
//   .patch(aiModelController.updateAiModel)
//   .delete(aiModelController.deleteAiModel);

// use axios local for flask

module.exports = router;
