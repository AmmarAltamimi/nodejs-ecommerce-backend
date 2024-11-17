const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');


exports.allowedTo = (...role) => asyncHandler(async(req,res,next)=> {

    const isAllowedToLoggedUser = role.includes(req.user.role);
    if(!isAllowedToLoggedUser){
        return next(new ApiError('You are not allowed to access this route',403));
    }

    next();
    
    }) 