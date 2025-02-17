const express = require("express");

const router = express.Router();
const pipelineController = require("../controllers/pipelineController");
const { protect } = require("../middleware/verifyToken");

router.use(protect);
router.get("/getAllPipelines", pipelineController.getAllPipelines);
router.post("/createPipeline", pipelineController.createPipeline);
router.get("/getPipeline/:id", pipelineController.getPipeline);
router.put("/updatePipeline/:id", pipelineController.updatePipeline);
router.delete("/deletePipeline/:id", pipelineController.deletePipeline);

module.exports = router;
