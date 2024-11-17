class ApiError extends Error {
    constructor(message,stateCode){
        super(message);
        this.stateCode = stateCode;
        this.status = `${stateCode}`.startsWith(4) ? "fail": "error"
        this.isOperational = true;

    }
}


module.exports =ApiError;