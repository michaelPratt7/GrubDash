const path = require("path");


// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


//list function for all dishes
function list(req, res) {
    res.json({data: dishes})
}

//create function for a new dish
function create(req, res) {
    const {data: {name, description, price, image_url} = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish});
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
        message: `Dish must include a ${propertyName}` 
    });
    };
  }

//function to determine properties aren't empty
function propertyIsNotEmpty(propertyName) {
    return function (req, res, next) {
    const {data = {}} = req.body;
    if (data[propertyName] === "") {
        return next ({
            status: 400,
            message: `Dish must include a ${propertyName}`
        })
    };
    next();
    };
}

//function to determine validity of price as number
function priceIsValidNumber(req, res, next) {
    const { data: { price }  = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)){
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        });
    }
    next();
  }

//read function for specific dish
function read(req, res, next) {
    res.json({data: res.locals.dish});
  }

  //function to validate dishId param
  function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id == Number(dishId));
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }

//update function for a current dish
function update(req, res) {
    const dish = res.locals.dish;
    const {data: {name, description, price, image_url} = {}} = req.body;

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({data: dish})
  }

  //function to determine ids match when updating
  function dishIdMatches(req, res, next) {
    const {data: {id} = {}} = req.body;
    const {dishId} = req.params;
    if (id) {
        if (id != Number(dishId)) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}.`
        })
    }
    }
    next();
}

  
//exports
module.exports = {
    list,
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        propertyIsNotEmpty("name"),
        propertyIsNotEmpty("description"),
        propertyIsNotEmpty("image_url"),
        priceIsValidNumber,
        create,
    ],
    read: [dishExists, read],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        propertyIsNotEmpty("name"),
        propertyIsNotEmpty("description"),
        propertyIsNotEmpty("image_url"),
        priceIsValidNumber,
        dishIdMatches,
        update
    ],
};