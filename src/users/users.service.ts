import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CNFUSERS } from 'src/registration/entity/registration.entity';
import { Repository } from 'typeorm';
import { UrlWithStringQuery } from 'url';
const oracledb = require('oracledb');

export type User = any;
@Injectable()
export class UsersService {
  userData: any;

  constructor(
    @InjectRepository(CNFUSERS, 'BWAYSCOMMON') private readonly formPostRepository: Repository<CNFUSERS>,
  ) { }
  private readonly users = [
    {
      userId: 1,
      username: '9090909090',
      password: 'Admin@21',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];



  async findOne(username: string): Promise<User | undefined> {
    let connection1 = await oracledb.getConnection({ user: "paysuk", password: "sukpay$321#", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.121)(PORT = 1521))(CONNECT_DATA =(SID= payg1)))" });
    let result = await connection1.execute(`select * from CNFUSERS where USER_ID='${username}'`);
    connection1.close();
    this.userData = await this.jsonConverter(result);
    return this.userData.find(user => user.USER_ID === username);
    // return Object.keys(this.userData).find(key=> this.userData['USER_NAME'] === username)
  }

  async jsonConverter(jsonData) {
    let metadata = jsonData.metaData;
    let rowData = jsonData.rows;

    let finalObject = new Array();

    rowData.forEach((ele, index) => {

      let array = new Array();
      let obj = {}

      ele.forEach((element, index) => {
        let key = metadata[index].name;
        obj[metadata[index].name] = element;
      })
      finalObject.push(obj);
    })
    return finalObject;
  }
}
