
const express = require('express');
const router = express.Router();
const aiModelController = require('../controllers/AiModelsController');
const { protect, verifyTokenAndAdmin } = require('../middleware/verifyToken');

router.use(protect , verifyTokenAndAdmin);

router.route('/')
  .get(aiModelController.getAllAiModels)
  .post(aiModelController.createAiModel);

router.route('/:id')
  .get(aiModelController.getAiModel)
  .patch(aiModelController.updateAiModel)
  .delete(aiModelController.deleteAiModel);

// use axios local for flask

module.exports = router;
