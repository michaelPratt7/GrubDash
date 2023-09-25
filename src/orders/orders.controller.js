const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//list function for all orders
function list(req, res) {
    res.json({data: orders});
};

//create function for a new order
function create(req, res) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({data: newOrder})
}

//function to determine existence of properties
function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({
        status: 400,
        message: `Order must include a ${propertyName}` 
    });
    };
  }

  //function to determine property values are not empty
  function propertyIsNotEmpty(propertyName) {
    return function (req, res, next) {
    const {data = {}} = req.body;
    if (data[propertyName] == "") {
        return next ({
            status: 400,
            message: `Order must include a ${propertyName}`
        })
    };
    next();
    };
}

//function to determine dishes is a valid array
function dishesPropIsArray(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if(dishes.length === 0 || !Array.isArray(dishes)) {
       return next({
          status: 400,
          message: "Order must include at least one dish"
        })
    }
    next();
}

//function to validate quantity value as number
function validDishQuantity(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    dishes.map((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
            next ({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })
    next();
}

//function to validate the orderId param
function orderExists(req, res, next) {
    const {orderId} = req.params;
    const foundOrder = orders.find((order) => order.id == Number(orderId));
    if(foundOrder) {
        res.locals.order = foundOrder;
        next();
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`,
    })
};

//read function for specific order
function read(req, res, next) {
    res.json({data: res.locals.order})
};

//function to validate the status prop of an order
function statusPropIsValid(req, res, next) {
    const {data: {status} = {}} = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if(!status || status === "" || !validStatus.includes(status)) {
        next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        })
    }
    if(status === "delivered") {
        next({
            status: 400,
            message: "A delivered order cannot be changed"
        })
    }
    next();
};

//function to determine ids match when updating
function orderIdMatches(req, res, next) {
    const {data: {id} = {}} = req.body;
    const {orderId} = req.params;
    if (id) {
        if (id != Number(orderId)) {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        })
    }
    }
    next();
};

//update function for a current order
function update(req, res, next) {
    const order = res.locals.order;
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({data: order})
}

//delete function for a current order
function destroy(req, res, next) {
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
    const deletedOrder = orders.splice(index, 1);
    res.sendStatus(204);
}

//function to validate order to be deleted
function statusPropIsPending(req, res, next) {
    const {status} = res.locals.order;
    if(status !== "pending") {
       return next({
        status: 400,
        message: "An order cannot be deleted unless it is pending. Returns a 400 status code"
    })
    }
    next();
}

//exports
module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        propertyIsNotEmpty("deliverTo"),
        propertyIsNotEmpty("mobileNumber"),
        dishesPropIsArray,
        validDishQuantity,
        create,
    ],
    read: [orderExists, read],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        propertyIsNotEmpty("deliverTo"),
        propertyIsNotEmpty("mobileNumber"),
        propertyIsNotEmpty("dishes"),
        dishesPropIsArray,
        validDishQuantity,
        statusPropIsValid,
        orderIdMatches,
        update,
    ],
    delete: [orderExists, statusPropIsPending, destroy,],
}