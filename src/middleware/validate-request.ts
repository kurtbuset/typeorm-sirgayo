// import { Request, Response, NextFunction } from "express";
// import Joi from "joi";

// // Define validation middleware
// const validateUser = (req: Request, next: NextFunction, schema) => {
  
//   const { error } = schema.validate(req.body);

//   if (error) {
//     next(`Validation error: ${error.details.map(err => err.message)}`);
//   }

//   next();
// };

// export default validateUser