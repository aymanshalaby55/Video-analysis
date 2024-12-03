const express = require("express");

const router = express.Router();
const aiModelController = require("../controllers/AiModelsController");
const { protect, verifyTokenAndAdmin } = require("../middleware/verifyToken");

router.use(protect);

router.get("/user/getAllModels", aiModelController.getUserAllAiModels);

router.use(verifyTokenAndAdmin);
router.get("/admin/getAllModels", aiModelController.getAdminAllAiModels);
router.post("/createModel", aiModelController.createAiModel);
router.get("/user/getAllModels", aiModelController.getUserAllAiModels);

// router.use(verifyTokenAndAdmin);
router.post(
  "/createModel",
  verifyTokenAndAdmin,
  aiModelController.createAiModel,
);

router.get("/get/:id", verifyTokenAndAdmin, aiModelController.getAiModel);

router.delete(
  "/delete/:id",
  verifyTokenAndAdmin,
  aiModelController.deleteAiModel,
);

router.patch(
  "/update/:id",
  verifyTokenAndAdmin,
  aiModelController.updateAiModel,
);

module.exports = router;
