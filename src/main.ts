import { NestFactory } from '@nestjs/core';
import express from 'express';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as process from "process";
var https = require('https');
var http = require('http');
const fs = require('node:fs');
// import { AppClusterService } from './app-cluster.service';

async function bootstrap() {

  const rawBodyBuffer = (req, res, buffer, encoding) => {
    if (buffer && buffer.length) {
      req.rawBody = buffer.toString(encoding || 'utf8');
    }
  };
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, 
    // httpsOptions: {
    //   key: fs.readFileSync('src\\STAR_unishivaji_ac_in.key'),
    //   cert: fs.readFileSync('src\\STAR_unishivaji_ac_in.cert'),
    //   ca: fs.readFileSync('src\\Sectigo DV Intermediate CA.txt')
    // }
  });
  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));
  app.enableCors()
  await app.listen(88);
  // await app.listen(83);
  // await app.listen(443);
  // http.createServer(app).listen(88);
  // https.createServer(app).listen(443); 
  // console.log(process.memoryUsage())
}
bootstrap();
// AppClusterService.clusterize(bootstrap);

