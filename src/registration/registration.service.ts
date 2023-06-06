import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CNFUSERS } from './entity/registration.entity'
import { RegistrationDTO } from './dto/registrationDTO'
import { MSTACCTGLSUB } from './entity/college-code.entity'
import { PASSRECQUE } from './entity/passrecque.entity'
import * as encrpt from 'md5';
import * as md5 from 'apache-md5';
const oracledb = require('oracledb');

import { TRNACCTONLINERCPTH } from '../payment/entity/TRNACCTONLINERCPTH.entity'
import { TRNACCTCOMMRCPTH } from '../payment/entity/TRNACCTCOMMRCPTH.entity'
import { CNFONLINEBANKS } from '../payment/dropdown-entity/bank.entity'
import * as moment from 'moment';
@Injectable()
export class RegistrationService {
    constructor(@InjectRepository(CNFUSERS, 'BWAYSCOMMON') private readonly formPostRepository: Repository<CNFUSERS>,
        @InjectRepository(MSTACCTGLSUB) private readonly collegeRepository: Repository<MSTACCTGLSUB>,
        @InjectRepository(PASSRECQUE, 'BWAYSCOMMON') private readonly queRepository: Repository<PASSRECQUE>,
        @InjectRepository(TRNACCTONLINERCPTH, 'BWAYSCOMMON') private readonly onlinercpthRepository: Repository<TRNACCTONLINERCPTH>,
        @InjectRepository(TRNACCTCOMMRCPTH, 'BWAYSCOMMON') private readonly commontranRepository: Repository<TRNACCTCOMMRCPTH>,
        @InjectRepository(CNFONLINEBANKS) private readonly bankRepository: Repository<CNFONLINEBANKS>,) { }

    //insertion into BWAYSCOMM database
    async insert(register: RegistrationDTO) {
        register.PASSWORD = md5(register.PASSWORD)
        let userExist = await this.formPostRepository.query(`select NVL ((select 'Y' from  dual where exists (select  1 from cnfusers where USER_ID = '${register.USER_NAME}')),'N') as rec_exists from dual`)

        if (userExist[0].REC_EXISTS == 'N') {
            return this.formPostRepository.query(`insert into CNFUSERS (USER_ID,USER_TYPE,NAME,CELL_NO,EMAIL_ID,COLLEGE_CODE,PASSWORD,PASSREQQUE,PASSREQANS) values ('${register.USER_NAME}',${register.USER_TYPE}, '${register.NAME}', '${register.CELL_NO}', '${register.EMAIL_ID}', ${register.COLLEGE_CODE},'${register.PASSWORD}','${register.PASSREQQUE}' ,'${register.PASSREQANS}')`)
        } else {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'User Already Exists!',
            }, HttpStatus.FORBIDDEN);
        }
    }

    async getCollegeCodeList() {
        let collegeCodeList = await this.collegeRepository.query(`SELECT SUB_GLACNO as id , SUBGL_NAME as NAME FROM MSTACCTGLSUB where SUB_GLCODE=16`);
        return collegeCodeList
    }

    //forgot password
    async forgotPassword(data) {
        let question = data.question;
        let answer = data.answer;
        let result = false;
        //check question and answer details
        let query = await this.formPostRepository.query(`select * from CNFUSERS where EMAIL_ID = '${data.email}' and PASSREQQUE='${question}' and PASSREQANS='${answer}'`);
        if (query.length != 0) {
            result = true;
        } else {
            result = false;
        }
        return result;
    }

    //reset password
    async resetPassword(data) {
        let password = md5(data.PASSWORD);
        let query = await this.formPostRepository.query(`update CNFUSERS set PASSWORD = '${password}'  where EMAIL_ID = '${data.email}'`);
        return query;
    }

    async updateProfile(data) {
        let query = await this.formPostRepository.query(`update CNFUSERS set NAME= '${data.NAME}', CELL_NO = '${data.CELL_NO}',EMAIL_ID= '${data.EMAIL_ID}' where USER_ID = '${data.USER_ID}'`);
        return query;
    }
    async getUserData(data) {
        let query = await this.formPostRepository.query(`select * from cnfusers where USER_ID = '${data.USER_ID}'`);
        return query;
    }

    async getQuestionsList() {
        return this.queRepository.query(`select * from PASSRECQUE`)
    }


    async updatePassword() {
        // let updatePassword = await this.formPostRepository.query(`select CNFUSERS.USER_ID, CNFUSERS.PASSWORD FROM CNFUSERS where USER_ID='2018007535' and rownum <= 100
        // order by USER_ID`);
        let updatePassword = await this.formPostRepository.query(`select CNFUSERS.USER_ID, CNFUSERS.PASSWORD FROM CNFUSERS where password is null and rownum <= 50
        order by USER_ID`);
        updatePassword.forEach(async element => {
            let password = md5(element.USER_ID);
            let result = await this.formPostRepository.query(`update CNFUSERS SET PASSWORD = '${password}' WHERE USER_ID = '${element.USER_ID}'`);
        });
    }

    async getEncrypTdata(id) {
        let password = md5(id);
        // let result = await this.formPostRepository.query(`update CNFUSERS SET PASSWORD = '${password}' WHERE USER_ID = '${id}'`);

    }

    // Add new user using excel upload
    async utility(element) {
        let PASSWORD = await md5(element.PRNNO);
        let connection2 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });

        let userExist = await connection2.execute(`select NVL ((select 'Y' from  dual where exists (select  1 from cnfusers where USER_ID = '${element.PRNNO}')),'N') as rec_exists from dual`)
        await connection2.close();
        // console.log(userExist);

        if (await userExist.rows[0][0] == 'N') {
            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });

            let result = await connection1.execute(`insert into CNFUSERS (USER_ID,USER_TYPE,NAME,CELL_NO,EMAIL_ID,COLLEGE_CODE,PASSWORD,PASSREQQUE,PASSREQANS) values ('${element.PRNNO}',${element.TYPE}, '${element.STUDENTNAME}', '${element.STUDENTMOBILENO}', '${element.STUDENTMAILID}', 0,'${PASSWORD}',1 ,'${element.PRNNO}')`);
            await connection1.commit();
            await connection1.close();
            return result
        } else {
            return null
        }

        // if (index == data.length - 1) {
        //     return { msg: 'ok' }
        // }
        // })

    }

    async getCurrentFinancialYear() {
        var fiscalyear = "";
        var today = new Date();
        if ((today.getMonth() + 1) <= 3) {
            fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
        } else {
            fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
        }
        let data = fiscalyear.toString();
        let d = data.replace('20', '');
        let d1 = d.replace('-20', '');
        return d1
    }
    async next_transcationData() {
        let finacalYear = await this.getCurrentFinancialYear();
        let schema = 102;
        let condition = '10' + finacalYear + schema + '16'
        let query = await this.commontranRepository.query(`SELECT cast(max(tran_no) as char(19)) as tran from TRNACCTCOMMRCPTH where tran_no like '%${condition}%' AND rownum=1  order by tran_no desc`);

        let tran_no = query[0].TRAN;
        let newTransactionNo = '';
        if (tran_no == null) {
            newTransactionNo = '10' + finacalYear + '' + schema + '16' + '0000001';
        } else {
            let newTran = tran_no;
            newTransactionNo = await this.addOne(tran_no);
        }
        return newTransactionNo;
    }

    async addOne(s) {
        let newNumber = '';
        let continueAdding = true;
        for (let i = s.length - 1; i >= 0; i--) {
            if (continueAdding) {
                let num = parseInt(s[i], 10) + 1;
                if (num < 10) {
                    newNumber += num;
                    continueAdding = false;
                } else {
                    newNumber += '0'
                }
            } else {
                newNumber += s[i];
            }
        }
        let data;
        if (newNumber.length == 19) {
            let d = Array.from(newNumber);
            d.shift();
            d.reverse();
            data = d.join('');
        } else {
            data = newNumber
        }
        return data;
    }


    async staticuploadfile(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });
        let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${data.CRN}`);
        let particularData = await connection1.execute(`select * from  TRNACCTONLINERCPTI where TRAN_NO = ${data.CRN}`);
        var particular = await this.jsonConverter(particularData);
        let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
        systemDate = systemDate.replace('-', '');
        systemDate = systemDate.replace('-', '');
        systemDate = systemDate.replace(' ', '');
        let tran_date = moment().format('YYYYMMDD');
        let finacialYear = await this.getCurrentFinancialYear();
        let next_transaction = await this.next_transcationData();
        //get bank account Number
        let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
        let UTRDATE = tran_date;
        //insert data into TRNACCTCOMMRCPTH
        let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,EXT_REFNO)values(${next_transaction},102,62,'REC','${UTRDATE}',${finacialYear},'${recepit[0].PAID_BY}','${bankDetails[0].GL_ACNO}',${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTRDATE}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}',${data.TRANID})`);
        await connection1.commit();
        await connection1.close();
        //INSERT DATA INTO 
        let srno = 0;
        for (let element of particular) {
            if (element.AMOUNT != 0 && element.AMOUNT != null) {
                srno += 1
                let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });
                let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                await connection1.commit();
                await connection1.close();
            }
        }
        //update payment status 
        let connection11 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });
        let updateStatus = await connection11.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
        await connection11.commit();
        let update = await connection11.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
        await connection11.commit();
        await connection11.close();
    }




    /////////////////////////////////////////////////////
    ////////////////PMS data fetch//////////////////////////////
    //fetch purpose list for college type
    async getmstbank() {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "BWAYSFAS", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });

        let banklist = await connection.execute(`SELECT * FROM mstbanksgroup`);
        await connection.close();
        return this.jsonConverter(banklist);  //updated code
    }

    async getpaymentcode() {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "BWAYSFAS", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });

        let banklist = await connection.execute(`SELECT gl_acno, budget_code FROM MSTACCTGL WHERE SUBSTR(BUDGET_CODE,1,4) IN ('A.2.','D.1.','D.2.','D.3.','D.4.','E.3.') AND is_active = 1  AND status_code = 0 AND budget_side = 'P'`);
        await connection.close();
        return this.jsonConverter(banklist);  //updated code
    }

    async getReceiptList() {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "BWAYSFAS", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });

        let banklist = await connection.execute(`SELECT gl_acno, budget_code FROM MSTACCTGL WHERE SUBSTR(BUDGET_CODE,1,4) IN ('A.2.','D.1.','D.2.','D.3.','D.4.','E.3.') AND is_active = 1  AND status_code = 0 AND budget_side = 'R'`);
        await connection.close();
        return this.jsonConverter(banklist);  //updated code
    }


    async getmstbankbranch(code) {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "BWAYSFAS", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" });

        let banklist = await connection.execute(`SELECT sub_glacno, subgl_name, bank_acno FROM MSTACCTGLSUB WHERE sub_glcode = 12 AND is_active = 1 AND status_code = 0 AND bank_code = ${code}`);
        await connection.close();
        return this.jsonConverter(banklist);  //updated code
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
