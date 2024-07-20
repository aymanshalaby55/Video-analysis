const express = require("express");
const router = express.Router();
const aiModelController = require("../controllers/AiModelsController");
const { protect, verifyTokenAndAdmin } = require("../middleware/verifyToken");

router.use(protect);

router.get("/user/getAllModels", aiModelController.getUserAllAiModels);

router.use(verifyTokenAndAdmin);
router
  .route("/")
  .get("/admin/getAllModels", aiModelController.getAdminAllAiModels)
  .post("/createModel", aiModelController.createAiModel);
router.get("/user/getAllModels", aiModelController.getUserAllAiModels);

// router.use(verifyTokenAndAdmin);
router.post(
  "/createModel",
  verifyTokenAndAdmin,
  aiModelController.createAiModel,
);
// .get("/admin/getAllModels", aiModelController.getAdminAllAiModels)

// router.route('/:id')
//   .get(aiModelController.getAiModel)
//   .patch(aiModelController.updateAiModel)
//   .delete(aiModelController.deleteAiModel);

// use axios local for flask

module.exports = router;
