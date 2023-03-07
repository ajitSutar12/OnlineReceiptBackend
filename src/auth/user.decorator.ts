import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { json } from 'body-parser'


// export const User = createParamDecorator(
//   json()(data, req) => {
//     console.log(',,,,,,')
//     console.log(req.args[0])
//     let obj =  JSON.stringify(req.user);
//     console.log(obj)
//     return req.user
//   },
// );

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // console.log(request);
    // console.log(request.rawBody);
    return request.rawBody || null;
  },
);
