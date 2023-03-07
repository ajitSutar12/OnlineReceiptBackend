import { NestFactory } from '@nestjs/core';
import express from 'express';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as process from "process";
var https = require('https');
var http = require('http');

// import { AppClusterService } from './app-cluster.service';

async function bootstrap() {

  const rawBodyBuffer = (req, res, buffer, encoding) => {
    if (buffer && buffer.length) {
      req.rawBody = buffer.toString(encoding || 'utf8');
    }
  };
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));
  app.enableCors()
  await app.listen(4000);
}
bootstrap();
// AppClusterService.clusterize(bootstrap);

