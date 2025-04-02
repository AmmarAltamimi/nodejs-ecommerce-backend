const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const GroupOrder = require("../models/groupOrderModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel");
const Store = require("../models/storeModel");
const ShippingRate = require("../models/shippingRateModel");

const {
  calculateTotalPriceWithShippingFee,
  getNewTotalPriceAfterCouponDiscount,
  updateCartWithLatestForCheckout,
} = require("./cartService");
const {getShippingDatesRange} = require("../utils/shippingDatesRange")

const { getAll ,getOne} = require("../middlewares/handlersFactoryMiddleware");

const ApiError = require("../utils/apiError");

// after create the order there are some things you have to do such as (increase product sold and decrease qtyStock )  and  clear cart
const afterOrderCreated = async (createOrder, cart, cartId) => {
  if (createOrder) {
    //   increase product sold and decrease qtyStock
    const bulkOption = await Promise.all(
      cart.cartItem.map(async (item) => {
        const product = await Product.findById(item.product);

        return {
          updateOne: {
            filter: {
              _id: item.product,
              subcategoryType: product.subcategoryType,
            }, // Match the product
            update: {
              $inc: {
                sold: +item.quantity, // Increment sold
                "variant.$[objFilter].stockQuantity": -item.quantity, // Decrease stock
              },
            },
            arrayFilters: [
              { "objFilter._id": item.variantId }, // Match array elements by ID
            ],
          },
        };
      })
    );

    await Product.bulkWrite(bulkOption, {});

    // clear cart
    await Cart.findByIdAndDelete(cartId);
  }
};

const getShippingDetails = async (storeId, countryId) => {
  const defaultShipping = await Store.findOne({ _id: storeId });
  const shippingRate = await ShippingRate.findOne({
    store: storeId,
    country: countryId,
  });
  
  return {
    shippingService:
      shippingRate?.shippingService || defaultShipping.defaultShippingService,
    deliveryTimeMin:
      shippingRate?.deliveryTimeMin || defaultShipping.defaultDeliveryTimeMin,
    deliveryTimeMax:
      shippingRate?.deliveryTimeMax || defaultShipping.defaultDeliveryTimeMax,
  };
};

// Nested route (get)
exports.createFilterObj = async (req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
};

exports.groupFilterObj = async (req, res, next) => {
    if (req.body.storeId) {
      req.filterObj = { store:req.body.storeId };
    }
    next();
  };
  

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User
exports.getMyOrders = getAll(Order);


// @desc    Get all Group Order belongs to specific store
// @route   POST /api/v1/orders/groupedOrder
// @access  Protected/seller
exports.getGroupOrder = getAll(GroupOrder);



// @desc    create cash order
// @route   POST /api/v1/orders/cartId
// @access  Protected/User
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { cart, address } = req.body;
  // create  order

  // 1.get cart
  const getCart = await Cart.findById(cart);
  if (!cart) {
    return next(new ApiError(`Cart not found with id ${cart}`, 404));
  }

  //2.  updated cart + update  get total subTotalValue and total shippingFeesValue and total + apply coupon if exits and update new total price
  const updatedCart = await updateCartWithLatestForCheckout(getCart);
  console.log("1", updatedCart);

  //3. create order
  const createOrder = await Order.create({
    user: req.user._id,
    shippingFees: updatedCart.shippingFees,
    subTotal: updatedCart.subTotal,
    total: updatedCart.total,
    shippingAddress: address,
  });

  console.log("2", createOrder);

  // create group order

  //1. cart item is array of cartItemObj -> i will divide them to groups based in storeId
  // so i will make obj have storeId as key then its groups which array of cartItemObj
  const groupedItems = updatedCart.cartItem.reduce((acc, item) => {
    if (!acc[item.store]) acc[item.store] = [];
    acc[item.store].push(item);
    return acc;
  }, {});

  console.log("3", groupedItems);

  //2. i will defined groups which array of obj each obj is orderGrouped
  // i convert obj to array of arrays each array have first the store  and second the array of cartItemObj the belongs to this store
  // after that i will loop and in each iteration i have group so i will create groupOrder in each iteration
  await Promise.all(
    Object.entries(groupedItems).map(async ([storeId, items]) => {
      // 1. check if there any applied coupon that valid + belongs to this store

      let groupedCoupon;
      let coupon;
      if (updatedCart.appliedCoupon) {
         coupon = await Coupon.findOne({
          name: updatedCart.appliedCoupon,
          start: { $lt: Date.now() },
          expire: { $gt: Date.now() },
        });
        console.log(
          "5",
          updatedCart.appliedCoupon,
          coupon && coupon.store.toString() === storeId.toString(),

        );
        if (coupon && coupon.store.toString() === storeId.toString()) {
          groupedCoupon = coupon._id;
        }
      }
      console.log("6", groupedCoupon);

      //2. get the  groupShippingFees and groupSubTotal and total
      const { subTotalValue, shippingFeesValue } =
        calculateTotalPriceWithShippingFee(items);
      let groupTotal = subTotalValue + shippingFeesValue;
      // check if there is discount
      if (groupedCoupon) {
        const discountValue = (groupTotal * coupon?.discount) / 100;
        groupTotal = groupTotal - discountValue;
      }
      console.log("7", groupTotal);

      // 3. get shipping details for this storeId and this country
      // get country
      countryId = "67cda67e0edb0b1b1efe1bf5";
      // get shipping details
      const { shippingService, deliveryTimeMin, deliveryTimeMax } = await getShippingDetails(storeId, countryId);
      // Returns the shipping date range by adding the specified min and max days to the current date.
      const { minDate, maxDate } = getShippingDatesRange(
        deliveryTimeMin,
        deliveryTimeMax,
        new Date(createOrder.createdAt)
      );

      console.log(
        "8",
        storeId,
        countryId,
        shippingService,
        deliveryTimeMin,
        deliveryTimeMax,
        minDate,
        maxDate
      );

      // 4. create the GroupOrder
      const createGroupOrder = await GroupOrder.create({
        order: createOrder._id,
        store: storeId,
        coupon: groupedCoupon || null,
        OrderItem: items,
        groupShippingFees: shippingFeesValue,
        groupSubTotal: subTotalValue,
        total: groupTotal,
        shippingService: shippingService,
        shippingDeliveryMin: minDate,
        shippingDeliveryMax: maxDate,
      });

      console.log("9", createGroupOrder);
    })
  );


  //3. find Group order that belongs to this order
  const groupOrder = await GroupOrder.find({order:createOrder._id})

  //4. the res
  res.status(201).json({
    status: "success",
    message: "order created successfully",
    order: createOrder,
    groupOrder,
  });
});


// @desc    Get specific Order by id
// @route   GET /api/v1/Order/:id
// @access  user
exports.getOrderDetails = getOne(Order);


// @desc    Update order status
// @route   PUT /api/v1/orders/:id/updateOrderStatus
// @access  Protected/seller
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const updateOrderStatus = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderStatus: req.body.orderStatus,
    },
    { new: true }
  );

  if (!updateOrderStatus) {
    return next(
      new ApiError(`order not found with id ${req.params.id}`, 404)
    );
  }

  if (req.body.orderStatus === "Delivered") {
    updateOrderStatus.DeliveredAt = Date.now();
  }else{
    updateOrderStatus.DeliveredAt = null;
  }

  await updateOrderStatus.save();
  res.status(200).json({
    status: "success",
    message: "Order Status is updated successfully",
    data: updateOrderStatus,
  });
});

// @desc    Update group order status
// @route   PUT /api/v1/orders/:id/updateGroupOrderStatus
// @access  Protected/seller
exports.updateGroupOrderStatus = asyncHandler(async (req, res, next) => {
  const updateGroupOrderStatus = await GroupOrder.findByIdAndUpdate(
    req.params.groupId,
    {
      groupOrderStatus: req.body.groupOrderStatus,
    },
    { new: true }
  );

  if (!updateGroupOrderStatus) {
    return next(
      new ApiError(`group order not found with id ${req.params.groupId}`, 404)
    );
  }

  if (req.body.groupOrderStatus === "Delivered") {
    updateGroupOrderStatus.DeliveredAt = Date.now();
  }else{
    updateGroupOrderStatus.DeliveredAt = null;
  }


  res.status(200).json({
    status: "success",
    message: "Group Order Status is updated successfully",
    data: updateGroupOrderStatus,
  });
});

// @desc    Update item order status
// @route   PUT /api/v1/orders/:id/updateItemOrderStatus
// @access  Protected/seller
exports.updateItemOrderStatus = asyncHandler(async (req, res, next) => {
  const groupOrder = await GroupOrder.findById(req.params.groupId);
  if (!groupOrder) {
    return next(
      new ApiError(`group order not found with id ${req.params.groupId}`, 404)
    );
  }

  const ItemOrderToUpdateStatus = groupOrder.OrderItem.find(
    (item) => item.id.toString() === req.params.itemId
  );
  if (!ItemOrderToUpdateStatus) {
    return next(
      new ApiError(`item order not found with id ${req.params.itemId}`, 404)
    );
  }

  ItemOrderToUpdateStatus.productStatus = req.body.productStatus;
  if (req.body.productStatus === "Delivered") {
    ItemOrderToUpdateStatus.DeliveredAt = Date.now();
  }else{
    ItemOrderToUpdateStatus.DeliveredAt = null;
  }


  await groupOrder.save();

  res.status(200).json({
    status: "success",
    message: "item Order Status is updated successfully",
    data: groupOrder,
  });
});
