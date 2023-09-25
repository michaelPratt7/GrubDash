const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//route for dishId param
router
    .route("/:dishId")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed);

//main route for dishes-data
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);


module.exports = router;