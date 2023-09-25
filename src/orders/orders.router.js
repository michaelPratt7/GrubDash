const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//route for orderId param
router.route("/:orderId")
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete)
    .all(methodNotAllowed);

//main route for orders-data
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);


module.exports = router;