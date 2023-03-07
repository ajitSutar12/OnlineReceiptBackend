import { Injectable } from '@nestjs/common';
import {getConnectionManager, ConnectionManager, Connection,createConnection } from "typeorm";

@Injectable()
export class AppService {
  connection
  constructor(){
    
  }
  async getHello() {
    let connectionManager  = new ConnectionManager()
    this.connection = connectionManager.create({
      type: 'oracle',
      username: 'BWAYSFAS',
      password: 'BWAYSFAS',
      port: 1521,
      host: 'ERP3',
      database: 'BWAYSFAS',
      serviceName: 'ORACLE',
  });
    let connection1 = await this.connection.connect();

    console.log(connection1);

  }
  
}
