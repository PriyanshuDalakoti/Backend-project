class apiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errors=[],
        statck=""
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors

        if(statck){  //Dont worry if you dont get this part
            this.stack=statck
        }else{
            Error.captureStackTrace(this , this.constructor)
        }
    }
}

export {apiError}