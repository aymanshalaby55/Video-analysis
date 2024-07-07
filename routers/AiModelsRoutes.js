
const express = require('express');
const router = express.Router();
const aiModelController = require('../controllers/aiModelController');
const { protect } = require('../middleware/verifyToken');

router.use(protect);

router.route('/')
  .get(aiModelController.getAllAiModels)
  .post(aiModelController.createAiModel);

router.route('/:id')
  .get(aiModelController.getAiModel)
  .patch(aiModelController.updateAiModel)
  .delete(aiModelController.deleteAiModel);

module.exports = router;
