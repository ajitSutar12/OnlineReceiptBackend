import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CNFRECPURPOSEH } from './dropdown-entity/purpose.entity'
import { MSTCOMMDEPARTMENT } from './dropdown-entity/department.entity'
import { CNFRECPURPOSEI } from './dropdown-entity/dept.entity'
import { MSTACCTFEESSTRUH } from './dropdown-entity/challan.entity'
import { CNFONLINEBANKS } from './dropdown-entity/bank.entity'
import { TRNACCTONLINERCPTH } from './entity/TRNACCTONLINERCPTH.entity'
import { TRNACCTONLINERCPTI } from './entity/TRNACCTONLINERCPTI.entity'
import { TRNACCTCOMMRCPTH } from './entity/TRNACCTCOMMRCPTH.entity'
import { TRNACCTMATH } from './entity/TRNACCTMATH.entity'
import { TRNACCTCOMMRCPTI } from './entity/TRNACCTCOMMRCPTI.entity'
import { MSTACCTGLSUB } from '../registration/entity/college-code.entity'
import { EntityManager, Connection } from 'typeorm';
import * as moment from 'moment';
import { threadId } from 'worker_threads';
import { FEEDBACK } from './entity/FEEDBACK.entity';
import { Cron } from '@nestjs/schedule'
import { elementAt } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { response } from 'express';
const oracledb = require('oracledb');


@Injectable()
export class PaymentService {

    constructor(
        @InjectRepository(MSTCOMMDEPARTMENT) private readonly departmentRepository: Repository<MSTCOMMDEPARTMENT>,
        @InjectRepository(CNFRECPURPOSEH) private readonly purposeRepository: Repository<CNFRECPURPOSEH>,
        @InjectRepository(CNFRECPURPOSEI) private readonly deptRepository: Repository<CNFRECPURPOSEI>,
        @InjectRepository(MSTACCTFEESSTRUH) private readonly challanRepository: Repository<MSTACCTFEESSTRUH>,
        @InjectRepository(CNFONLINEBANKS) private readonly bankRepository: Repository<CNFONLINEBANKS>,
        @InjectRepository(MSTACCTGLSUB) private readonly depositRepository: Repository<MSTACCTGLSUB>,
        @InjectRepository(FEEDBACK) private readonly feedbackRepository: Repository<FEEDBACK>,
        @InjectRepository(TRNACCTONLINERCPTH, 'BWAYSCOMMON') private readonly onlinercpthRepository: Repository<TRNACCTONLINERCPTH>,
        @InjectRepository(TRNACCTONLINERCPTI, 'BWAYSCOMMON') private readonly commanOnlineRepository: Repository<TRNACCTONLINERCPTI>,
        @InjectRepository(TRNACCTCOMMRCPTH, 'BWAYSCOMMON') private readonly commontranRepository: Repository<TRNACCTCOMMRCPTH>,
        @InjectRepository(TRNACCTCOMMRCPTI, 'BWAYSCOMMON') private readonly TRNACCTCOMMRCPTIRepository: Repository<TRNACCTCOMMRCPTI>,
        @InjectRepository(TRNACCTMATH) private readonly mathRepository: Repository<TRNACCTMATH>,
        private manager: EntityManager,
        private readonly connection: Connection,
        private httpService: HttpService,

    ) { }

    statusCode = 0;

    async getTransactionNO() {
        let outdata
        let data = await this.onlinercpthRepository.query(`CALL GET_NEXT_ONLINE_APPLICATION_ID(${101},${20170116},'TRNACCTONLINERCPTH',${outdata})`);
        return data
    }

    //fetch department dropdown option
    async getDepartmentList() {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
        let departmentList = await connection.execute(`SELECT CODE as id,NAME as NAME,DEPT_TYPE,IS_AUDIT FROM MSTCOMMDEPARTMENT where DEPT_TYPE = 'D' AND STATUS_CODE=0  order by NAME asc`);
        await connection.close();
        return this.jsonConverter(departmentList);
    }

    async getDeptList(term) {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
        let deptList = await connection.execute(`SELECT CODE as id  FROM CNFRECPURPOSEI Where CODE Like '%${term.term}%' AND STATUS_CODE=0`);//updated code
        await connection.close();
        return this.jsonConverter(deptList);
    }

    //fetch purpose list for student type
    async getPurposeForStudList(id) {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
        if (id.id <= 4) {
            let query = await connection.execute(`SELECT CODE as id, NAME as NAME FROM CNFRECPURPOSEH where TYPE = 0 and status_code=0 and SUB_TYPE = ${id.id}  order by NAME asc`);
            await connection.close();
            return this.jsonConverter(query);
        } else {
            let purposeList = await connection.execute(`SELECT CODE as id, NAME as NAME FROM CNFRECPURPOSEH where TYPE = 0  and status_code=0 order by NAME asc`);

            await connection.close();
            return this.jsonConverter(purposeList);  //updated code
        }

    }
    //fetch purpose list for college type
    async getPurposeForCollegeList() {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let purposeList = await connection.execute(`SELECT CODE as id, NAME as NAME FROM CNFRECPURPOSEH where TYPE = 1 and status_code=0 order by NAME asc`);
        await connection.close();
        return this.jsonConverter(purposeList);  //updated code
    }
    //fetch purpose list for anyone type
    async getPurposeForAnyoneList() {

        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let purposeList = await connection.execute(`SELECT CODE as id, NAME as NAME FROM CNFRECPURPOSEH where TYPE = 2 and status_code=0 order by NAME asc`);

        await connection.close();
        return this.jsonConverter(purposeList);  //updated code
    }

    //fetch challan dropdown
    async getChallanList(term) {

        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let challanList = await connection.execute(`SELECT CODE as id,NAME as NAME,DEPT_CODE,AMOUNT,STRU_TYPE FROM MSTACCTFEESSTRUH where DEPT_CODE Like '%${term.term}%' and status_code=0 order by NAME asc`); //updated code
        await connection.close();
        return this.jsonConverter(challanList);
    }

    //Student Table details fetch via Tution fees
    async getStudentTableList(data) {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let result = await connection.execute(`select MSTACCTGL.BUDGET_CODE,MSTACCTGL.GL_NAME,MSTACCTGL.GL_ACNO,MSTACCTFEES.NAME,MSTACCTFEESSTRUD.AMOUNT,MSTACCTFEESSTRUD.FEES_CODE from MSTACCTFEESSTRUD 
        inner join MSTACCTGL on MSTACCTGL.GL_ACNO = MSTACCTFEESSTRUD.GL_ACNO 
        inner join MSTACCTFEES on MSTACCTFEES.CODE = MSTACCTFEESSTRUD.FEES_CODE 
        where MSTACCTFEESSTRUD.CODE =${data.challanId} AND  MSTACCTFEESSTRUD.IS_ACTIVE=0  AND  MSTACCTFEESSTRUD.STATUS_CODE=0`);

        await connection.close();
        return this.jsonConverter(result);
        //updated code
    }

    //Student Table detail fetch via purpose details
    async getStudetTableUsingDept(data) {

        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let result = await connection.execute(`SELECT MSTACCTGL.BUDGET_CODE,MSTACCTGL.GL_NAME,CNFRECPURPOSEI.GL_ACNO,CNFRECPURPOSEI.AMOUNT from MSTACCTGL INNER JOIN CNFRECPURPOSEI ON 
        MSTACCTGL.GL_ACNO=CNFRECPURPOSEI.GL_ACNO WHERE CNFRECPURPOSEI.CODE=${data.DeptId}  and CNFRECPURPOSEI.status_code=0`)  //updated code

        await connection.close();
        return this.jsonConverter(result);
    }

    //College Table detail fetch via purpose details
    async getCollegeTableUsingDept(data) {

        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let result = await connection.execute(`SELECT MSTACCTGL.BUDGET_CODE,MSTACCTGL.GL_NAME,CNFRECPURPOSEI.AMOUNT from MSTACCTGL INNER JOIN CNFRECPURPOSEI ON 
        MSTACCTGL.GL_ACNO=CNFRECPURPOSEI.GL_ACNO WHERE CNFRECPURPOSEI.CODE=${data.DeptId} and CNFRECPURPOSEI.status_code=0`)//updated code

        await connection.close();
        return this.jsonConverter(result);
    }

    //Anyone Table detail fetch via purpose details
    async getAnyoneTableUsingDept(data) {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let result = await connection.execute(`SELECT MSTACCTGL.BUDGET_CODE,MSTACCTGL.GL_NAME,CNFRECPURPOSEI.AMOUNT from MSTACCTGL INNER JOIN CNFRECPURPOSEI ON 
        MSTACCTGL.GL_ACNO=CNFRECPURPOSEI.GL_ACNO WHERE CNFRECPURPOSEI.CODE=${data.DeptId} and CNFRECPURPOSEI.status_code=0`) //updated code

        await connection.close();
        return this.jsonConverter(result);
    }

    async getBankList() {
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let result = await connection.execute(`select CODE as ID, NAME as NAME from CNFONLINEBANKS  where is_active=0 order by code `);

        await connection.close();
        return this.jsonConverter(result);
    }

    async getStudentDraftData(id) {
        let result = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRAN_NO = ${id.id}`);
        let result1 = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${id.id}`);
        let obj = {
            'main': result,
            'details': result1
        }
        return obj;
    }

    async submitDraft(user, draft) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let connectionFAS = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });

        let undefindGlacnoArr = draft.studentDescriptionDetails.filter(function (ele, i) {
            return (ele.GL_ACNO == undefined || ele.GL_ACNO == null || ele.GL_ACNO == '');
        });
        if (undefindGlacnoArr.length != 0) {
            for (let i = 0; i < draft.studentDescriptionDetails.length; i++) {
                if (draft.studentDescriptionDetails[i].GL_ACNO == undefined || draft.studentDescriptionDetails[i].GL_ACNO == null || draft.studentDescriptionDetails[i].GL_ACNO == '') {
                    let glacnoupdate = await connectionFAS.execute(`SELECT * FROM MSTACCTGL WHERE BUDGET_CODE='${draft.studentDescriptionDetails[i].BUDGET_CODE}' and STATUS_CODE=0`);
                    let convertedData = await this.jsonConverter(glacnoupdate);
                    if (convertedData.length == 0) {
                        let msg
                        return msg = { message: "There is Some Issue in Receipt. Please Contact To Mobile Number: 02312609078 Or Send an Email To receipt@unishivaji.ac.in With Selected Purpose for payment and Your Login Username" }
                    }
                    else {
                        draft.studentDescriptionDetails[i]['GL_ACNO'] = convertedData[0]['GL_ACNO']
                    }
                }
            }
        }

        let userId = draft.user_id;
        let TRAN_DATE: string = draft.Application_Date
        TRAN_DATE = TRAN_DATE.replace(/\-/g, "");
        let SYSADD_DATETIME = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Calcutta'
        });
        SYSADD_DATETIME = SYSADD_DATETIME.replace(/\//g, "");
        SYSADD_DATETIME = SYSADD_DATETIME.replace(/AM,/g, '')
        let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
        systemDate = systemDate.replace('-', '');
        systemDate = systemDate.replace('-', '');
        systemDate = systemDate.replace(' ', '');

        //insert Data in TRNACCTONLINERCPTH // main Data
        let transactionNo = await this.transactionData();
        let query = await connection1.execute(`insert into TRNACCTONLINERCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,TRAN_DATE,PAID_BY,TRAN_AMT,PURPOSE_CODE,DEPT_CODE,FEESTRU_CODE,EXAM_NAME,DEPT_NAME,PAY_MODE,FEESTRU_NAME,REMARK,SUB_GLACNO,SYSADD_DATETIME,SYSCHNG_DATETIME,SYS_DATE,STATUS_CODE,SYSADD_LOGIN,BANK_CODE)values(${transactionNo},112,22,'${TRAN_DATE}','${draft.Received_From}',${draft.Total_Amount},${draft.purpose},${draft?.Select_Department == undefined ? null : draft?.Select_Department},${draft?.Challan_Structure == undefined ? null : draft?.Challan_Structure},'${draft.Exam}','${draft?.Dept_NAME == undefined ? null : draft?.Dept_NAME}',10006,'${draft?.Challan_NAME == undefined ? null : draft?.Challan_NAME}','${draft.Particular}',${draft?.College_Code == undefined ? null : draft.College_Code},'${systemDate}','${systemDate}','${systemDate}',31,'${userId}',${draft.bank_code == undefined ? null : draft.bank_code})`);
        await connection1.commit();
        let srno = 0
        for (let element of draft.studentDescriptionDetails) {
            srno += 1
            let result = await connection1.execute(`insert into TRNACCTONLINERCPTI(TRAN_NO,SR_NO,GL_ACNO,FEES_CODE,AMOUNT,BUDGET_CODE,BUDGET_HEAD,SYS_DATE,STATUS_CODE,PARTICULARS)values(${transactionNo},${srno},${element?.GL_ACNO == undefined ? null : element.GL_ACNO},${element?.FEES_CODE == undefined ? null : element.FEES_CODE},${element.AMOUNT},'${element.BUDGET_CODE}','${element.NAME}','${systemDate}',31,'${element.GL_NAME}')`);
            await connection1.commit();
        }
        await connection1.close();
        return transactionNo;
    }

    async function() {
        let result = await this.connection.query(`variable outdata refcursor;
                      exec procedures.GET_NEXT_ONLINE_APPLICATION_ID(101,'20170116','TRNACCTONLINERCPTH',:outdata);`);
        return result;
    }

    async studentDraftList() {
        let result = await this.onlinercpthRepository.query(`select TRNACCTONLINERCPTH.TRAN_NO from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.STATUS_CODE = 31`);
        return result;
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

    async transactionData() {
        let finacalYear = await this.getCurrentFinancialYear();
        let schema = 116;
        // TRNACCTONLINERCPTH
        let par_key = "chr(39) || tempyear_id || intTranType || '%' || chr(39)";

        let condition = finacalYear + schema
        let query = await this.onlinercpthRepository.query(`SELECT tran_no as tran from TRNACCTONLINERCPTH where tran_no like '%${condition}%' AND rownum=1  order by tran_no desc`);
        let newTransactionNo = '';
        if (query.length == 0) {
            newTransactionNo = finacalYear + '' + schema + '' + '0000001';
        } else {
            let tran_no = query[0].TRAN;
            newTransactionNo = tran_no + 1;
        }
        return newTransactionNo;
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


    async printData(id) {
        let object = {}
        if (id?.id != undefined) {
            let recepit = await this.commontranRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.REF_TRANNO = cast('${id?.id}' as char(19))`);
            let recepittran = await this.commontranRepository.query(`SELECT cast(tran_no as char(19)) as tran from TRNACCTCOMMRCPTH where REF_TRANNO = '${id.id}'  order by tran_no desc`);
            let userId = await this.onlinercpthRepository.query(`select sysadd_login from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.REF_TRANNO ='${id?.id}'`)
            if (recepit.length != 0) {
                recepit[0].TRAN_NO = recepittran[0].TRAN
                recepit[0].userId = userId[0].SYSADD_LOGIN
                if (recepit[0].DEPT_CODE == null) {
                    recepit[0]['Dept_Name'] = ''
                }
                else {
                    let deptName = await this.departmentRepository.query(`select NAME from MSTCOMMDEPARTMENT WHERE CODE= ${recepit[0].DEPT_CODE} and status_code=0`) //updated code
                    recepit[0]['Dept_Name'] = deptName[0].NAME
                }
                let purposeName = await this.purposeRepository.query(`select NAME from CNFRECPURPOSEH WHERE CODE= ${recepit[0]?.PURPOSE_CODE} and status_code=0`) //updated code
                let depositAcName = await this.depositRepository.query(`SELECT SUBGL_NAME FROM MSTACCTGLSUB WHERE SUB_GLCODE IN(11,12) AND SUB_GLACNO = ${recepit[0]?.GL_ACNO} and status_code=0`) //updated code
                let remark = await this.commanOnlineRepository.query(`select remark from TRNACCTONLINERCPTh where TRAN_NO = ${id.id}`);
                recepit[0]['Purpose_Name'] = purposeName.length != 0 ? purposeName[0].NAME : null
                recepit[0]['Deposit_ACNAME'] = depositAcName.length != 0 ? depositAcName[0]?.SUBGL_NAME : null
                recepit[0]['remark'] = remark.length != 0 ? remark[0]?.REMARK : null
                object['main'] = recepit;
                let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${id.id}`);
                let receiptParticular = null
                if (particular.length == 0) {
                    receiptParticular = await this.getInvoiceDetail(id)
                }
                object['particular'] = particular.length == 0 ? receiptParticular.details : particular;
                return object;
            }
            else {
                object['particular'] = null
                object['main'] = null
                return object
            }
        }
        else {
            object['particular'] = null
            object['main'] = null
            return object
        }
    }

    ///////////
    //////////////////////////////Axis /////////////////////////////
    //////////////////////
    async getResponse(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        if (data.RMK == 'success' || data.RMK == 'Success') {
            let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${data.CRN}`);
            let UTR_NO = data.BRN;
            let checkexist = await this.TRNACCTCOMMRCPTIRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.ref_tranno=${data.CRN} `)
            if (checkexist.length == 0) {
                if (recepit.length != 0) {
                    let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${data.CRN}`);
                    let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace(' ', '');
                    let tran_date = moment().format('YYYYMMDD');
                    let finacialYear = await this.getCurrentFinancialYear();
                    let next_transaction = await this.next_transcationData();
                    //get bank account Number
                    let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                    let UTR_NO = data.BRN;
                    let UTR_DATE = data.TET.replace('/', '');
                    let UTRDATE = UTR_DATE.replace('/', '');
                    //insert data into TRNACCTCOMMRCPTH
                    let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}',${bankDetails[0].GL_ACNO},${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${UTRDATE}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}','${recepit[0].SYSADD_LOGIN}')`);
                    await connection1.commit();

                    //INSERT DATA INTO 
                    let srno = 0;
                    for (let element of particular) {
                        if (element.AMOUNT != 0 && element.AMOUNT != null) {
                            srno += 1
                            let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                            await connection1.commit();
                        }
                    }

                    //update payment status 
                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
                    await connection1.commit();
                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
                    await connection1.commit();
                }
                else {
                    let connection11 = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
                    let recepit = await connection11.execute(`select * from TRNACCTMATH where tran_no =${data.CRN}`)
                    let tableData = await this.jsonConverter(recepit)
                    if (tableData.length != 0) {
                        let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace(' ', '');
                        let tran_date = moment().format('YYYYMMDD');
                        let finacialYear = await this.getCurrentFinancialYear();
                        let next_transaction = await this.next_transcationData();
                        let id = { id: data.CRN }
                        let particular = await this.getInvoiceDetail(id)
                        let connection2 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                        let userType = data.VER.split('.');
                        let userdetails = await connection2.execute(`select * from cnfusers where USER_ID = '${userType[2]}'`)
                        let users = await this.jsonConverter(userdetails)
                        //get bank account Number
                        let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = 101`);
                        let UTR_NO = data.BRN;
                        console.log(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,EXT_REFNO,EXT_REFDATE,BANK_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${users[0].NAME}',${bankDetails[0].GL_ACNO},'${UTR_NO}','${tran_date}',101,${Number(data.AMT)},'INR',0,${data.CRN},'${tran_date}',${finacialYear},0,'${systemDate}','${userType[2]}')`);
                        let mainData = await connection2.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,EXT_REFNO,EXT_REFDATE,BANK_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${users[0].NAME}',${bankDetails[0].GL_ACNO},'${UTR_NO}','${tran_date}',103,${Number(data.AMT)},'INR',0,${data.CRN},'${tran_date}',${finacialYear},0,'${systemDate}','${userType[2]}')`);
                        await connection2.commit();
                        for (let element of particular.details) {
                            if (element.AMOUNT != 0 && element.AMOUNT != null) {
                                let particularData = await connection2.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${element.SR_NO})`);
                                await connection2.commit();
                            }
                        }
                        await connection11.close();
                        await connection2.close();
                    }
                }
            }
        } else {
            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
            let expiry = moment(systemDate).add(72, 'hours').format('YYYY-MM-DD hh:mm:ss');
            let expiryDate = expiry.toString()
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace(' ', '');

            let CRN: any;
            CRN = this.getKeyByValue(data, "CNY")
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21, EXPIRE_DATE='${expiryDate}' where TRAN_NO = ${CRN}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${CRN}`);
            await connection1.commit();
        }
        await connection1.close();
    }

    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    async success(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let userdata = await connection1.execute(`select * from cnfusers where USER_ID='${data}'`)
        let userDetails = await this.jsonConverter(userdata);
        if (userDetails[0]?.USER_TYPE != 2) {
            let result = await connection1.execute(`select TRAN_NO,TRAN_DATE,TRAN_AMT,IS_PRINTED,STATUS_CODE,EXPIRE_DATE from TRNACCTONLINERCPTH where SYSADD_LOGIN='${data}' order by TRAN_NO desc`)
            await connection1.close();
            return this.jsonConverter(result);
        }
        else {
            let result = await connection1.execute(`select TRAN_NO,TRAN_DATE,TRAN_AMT,IS_PRINTED,STATUS_CODE,EXPIRE_DATE from TRNACCTONLINERCPTH where SYSADD_LOGIN='${data}' order by TRAN_NO desc`)
            let resultData = await this.jsonConverter(result);
            let result2 = await connection1.execute(`select cast(REF_TRANNO  as char(19)) AS TRAN_NO,TRAN_DATE,TRAN_AMT,IS_PRINT AS IS_PRINTED,STATUS_CODE from TRNACCTCOMMRCPTH  where SYSADD_LOGIN='${data}' order by TRAN_NO desc`)
            await connection1.close();
            let resultInvoice = await this.jsonConverter(result2);
            for (let ele of resultInvoice) {
                resultData.push(ele)
            }
            return resultData
        }
    }


    async unsuccess(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let result = await connection1.execute(`select TRAN_NO, TRAN_DATE, TRAN_AMT, IS_PRINTED,STATUS_CODE  from TRNACCTONLINERCPTH where STATUS_CODE = 21 and SYSADD_LOGIN='${data.USER_CODE}'`)
        await connection1.close();
        return this.jsonConverter(result);
    }

    async successNotprinted(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let result = await connection1.execute(`select TRAN_NO, TRAN_DATE, TRAN_AMT,IS_PRINTED,STATUS_CODE  from TRNACCTONLINERCPTH where STATUS_CODE = 0 and IS_PRINTED = 0 and SYSADD_LOGIN='${data.USER_CODE}'`)
        await connection1.close();
        return this.jsonConverter(result);
    }

    async draftListDetails(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let result = await connection1.execute(`select * from TRNACCTONLINERCPTH where STATUS_CODE = 31 AND SYSADD_LOGIN='${data.USER_CODE}'`);
        await connection1.close();
        return this.jsonConverter(result);
    }

    async updateReceipt(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let onlinercpth = await connection1.execute(`update TRNACCTONLINERCPTH set IS_PRINTED = 1 where TRAN_NO = ${data.tranno}`);
        await connection1.commit();
        let commercpth = await connection1.execute(`update TRNACCTCOMMRCPTH set IS_PRINT = 1 where TRNACCTCOMMRCPTH.REF_TRANNO = ${data.tranno}`);
        await connection1.commit();
        // return commercpth
    }

    async studentUpdateDetails(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let result;
        let onlinercpthUpdate = await connection1.execute(`update TRNACCTONLINERCPTH set TRAN_AMT = ${data.amount}, REMARK= '${data.particular}' where TRAN_NO=${data.tran_no}`);
        await connection1.commit();
        for (let element of data?.tableArr) {
            result = await connection1.execute(`update TRNACCTONLINERCPTI set AMOUNT = ${element.AMOUNT} where TRAN_NO=${element.TRAN_NO} and SR_NO = ${element.SR_NO}`);
            await connection1.commit();
        }
        await connection1.close()
        let connection = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let onlineData = await connection.execute(`select * from TRNACCTONLINERCPTH where TRAN_NO = ${data.tran_no}`);
        let main = await this.jsonConverter(onlineData)
        let onlineDataParticulars = await connection.execute(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${data.tran_no}`);
        let details = await this.jsonConverter(onlineDataParticulars)
        let obj = {
            main: main,
            details: details
        }
        await connection.close();
        return obj;
    }

    //save feedback details
    async feedback(data) {
        let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
        systemDate = systemDate.replace('-', '');
        systemDate = systemDate.replace('-', '');
        systemDate = systemDate.replace(' ', '');
        return await this.feedbackRepository.query(`insert into FEEDBACK(REASON_ID,DESCRIPTION,EMAIL_ID,SYSADD_LOGIN,SYSADD_DATETIME)VALUES(${data.reason},'${data.description}','${data.user.EMAIL_ID}','${data.user.USER_ID}','${systemDate}')`);
    }

    async updateriddetails(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        //update rid in TRNACCTONLINERCPTH
        await connection1.execute(`update TRNACCTONLINERCPTH set RID='${data.rid}',STATUS_CODE='21' where TRAN_NO = ${data.crn}`);
        await connection1.commit();
        await connection1.close();
    }

    async addData(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let particulars = await connection1.execute(`select * from TRNACCTCOMMRCPTI  where tran_no=${data.TRAN_NO}`)
        var result = await this.jsonConverter(particulars);
        let srno = 0
        for (let element of result) {
            srno += 1
            let result1 = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO,USER_NAME)values('102122102160094440','${element.TRAN_DATE}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,null,${srno},'PAYSUK')`);
            await connection1.commit();
        }
        await connection1.close()
    }


    offset = 0;
    limit = 1;
    @Cron('0 30 * * * *')
    // @Cron('*/40 * * * *')
    async offsetUpdate() {
        this.offset = 0
        console.log('Cron job');
    }

    @Cron('0 30 * * * *')
    // @Cron('*/40 * * * *')
    async handleCron() {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let result1 = await connection1.execute(`select * from ( select rownum offset, rs.* from  ( select * from TRNACCTONLINERCPTH where status_code in (21,32) and tran_type=112 and bank_code in (101,102) order by sysadd_datetime desc 
        ) rs  ) where rownum <=${this.limit} and offset >= ${this.offset}`)
        var resultDB = await this.jsonConverter(result1);
        await connection1.close();
        // let count = 0
        // let recordSize = result.length
        if (resultDB.length != 0) {
            let element = resultDB[0]
            // for (let element of result) {
            //bank code 104:easebuzz /BOM
            // if (element.BANK_CODE == 104) {
            //     let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //     let userdetails = await connection1.execute(`select * from cnfusers where USER_ID= '${element.SYSADD_LOGIN}'`)
            //     var userDetail = await this.jsonConverter(userdetails);
            //     await connection1.close();
            //     let obj = {
            //         "txnid": element.TRAN_NO + '',
            //         "amount": parseFloat(element.TRAN_AMT).toFixed(2),
            //         "email": userDetail[0].EMAIL_ID,
            //         "phone": userDetail[0].CELL_NO
            //     }
            //     this.httpService.post('http://localhost:81/transaction', obj).subscribe(async (response) => {
            //         let data = response.data
            //         if (data.status == true) {
            //             let msg = data.msg
            //             if (msg.status == 'success' || msg.status == 'Success' || msg.status == 'SUCCESS') {
            //                 let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                 var query1 = await connection1.execute(`select * from TRNACCTONLINERCPTH where TRAN_NO ='${element.TRAN_NO}'`)
            //                 var result1 = await connection1.execute(`select * from TRNACCTONLINERCPTI where TRAN_NO = '${element.TRAN_NO}'`)
            //                 await connection1.close();
            //                 var recepit = await this.jsonConverter(query1);
            //                 var particular = await this.jsonConverter(result1);
            //                 let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
            //                 systemDate = systemDate.replace('-', '');
            //                 systemDate = systemDate.replace('-', '');
            //                 systemDate = systemDate.replace(' ', '');
            //                 let tran_date = moment().format('YYYYMMDD');
            //                 let finacialYear = await this.getCurrentFinancialYear();
            //                 let next_transaction = await this.next_transcationData();
            //                 //get bank account Number
            //                 let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
            //                 // let UTR_NO = data.spTxnId;
            //                 let UTR_NO = msg.easepayid;
            //                 let UTRDATE = moment(data.transCompleteDate).format('YYYYMMDD');
            //                 //insert data into TRNACCTCOMMRCPTH
            //                 let connection12 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                 let mainData = await connection12.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}','${bankDetails[0].GL_ACNO}',${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${UTRDATE}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}')`);
            //                 await connection12.commit();
            //                 await connection12.close();
            //                 //INSERT DATA INTO 
            //                 let srno = 0;
            //                 for (let element of particular) {
            //                     if (element.AMOUNT != 0 && element.AMOUNT != null) {
            //                         srno += 1
            //                         let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                         // let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                         let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
            //                         await connection1.commit();
            //                         await connection1.close();
            //                     }
            //                 }
            //                 //update payment status 
            //                 let connection3 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                 let updateStatus = await connection3.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO = ${element.TRAN_NO}`);
            //                 connection3.commit();
            //                 let update = await connection3.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO = ${element.TRAN_NO}`);
            //                 await connection3.commit();
            //                 await connection3.close();
            //                 this.offset = this.offset + 1
            //                 await this.handleCron()
            //             }
            //             else {
            //                 let datestring = element.SYSADD_DATETIME == null ? moment().format('YYYY-MM-DD HH:mm:ss') : element.SYSADD_DATETIME;
            //                 var output = [datestring?.slice(0, 3 + 1), '-', datestring?.slice(4)].join('');
            //                 var output1 = [output?.slice(0, 6 + 1), '-', output?.slice(7)].join('');
            //                 var output2 = [output1?.slice(0, 9 + 1), ' ', output1?.slice(10)].join('');
            //                 let hours = moment().diff(moment(output2), 'hours');
            //                 if (hours > 72) {
            //                     let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                     let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
            //                     let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
            //                     connection1.commit();
            //                     await connection1.close();
            //                     this.offset = this.offset + 1
            //                     await this.handleCron()
            //                 } else {
            //                     let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                     let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
            //                     connection1.commit();
            //                     let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
            //                     connection1.commit();
            //                     await connection1.close();
            //                     this.offset = this.offset + 1
            //                     await this.handleCron()
            //                 }
            //             }
            //         }
            //         else if (data.status == false) {
            //             let datestring = element.SYSADD_DATETIME == null ? moment().format('YYYY-MM-DD HH:mm:ss') : element.SYSADD_DATETIME;
            //             var output = [datestring?.slice(0, 3 + 1), '-', datestring?.slice(4)].join('');
            //             var output1 = [output?.slice(0, 6 + 1), '-', output?.slice(7)].join('');
            //             var output2 = [output1?.slice(0, 9 + 1), ' ', output1?.slice(10)].join('');
            //             let hours = moment().diff(moment(output2), 'hours');
            //             if (hours > 72) {
            //                 let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                 let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
            //                 let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
            //                 connection1.commit();
            //                 await connection1.close();
            //                 this.offset = this.offset + 1
            //                 await this.handleCron()
            //             } else {
            //                 let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            //                 let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
            //                 connection1.commit();
            //                 let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
            //                 connection1.commit();
            //                 await connection1.close();
            //                 this.offset = this.offset + 1
            //                 await this.handleCron()
            //             }
            //         }
            //     }, (error) => {
            //         // console.log(error,'err')
            //         // if (error.response.status == 404) {
            //         //     throw 'Break';
            //         // }
            //     })
            // }
            //bank code 103:billdesk / BOM
            // else 
            if (element.BANK_CODE == 103) {
                let obj = {
                    tranNo: element.TRAN_NO,
                    date: moment(new Date()).format("YYYYMMDDHHmmss")
                }
                let string = '0122|BOMSHIVUNI|' + obj.tranNo + '|' + obj.date
                // let result = await this.httpService.get('http://localhost/billdesk/onlineQueryAPI.php?string=' + string).subscribe(async (response) => {
                let result = await this.httpService.get('http://210.212.190.40/billdesk/onlineQueryAPI.php?string=' + string).subscribe(async (response) => {
                    let msg = string + '|' + response.data;
                    let result = await this.httpService.get('https://www.billdesk.com/pgidsk/PGIQueryController?msg=' + msg).subscribe(async (resp) => {
                        // let result = new Promise((resolve, reject) => {
                        //     this.httpService.get('http://localhost/billdesk/onlineQueryAPIresponse.php?msg=' + resp.data).subscribe(async (res) => {                 
                        // let result = new Promise((resolve, reject) => {
                        this.httpService.get('http://210.212.190.40/billdesk/onlineQueryAPIresponse.php?msg=' + resp.data).subscribe(async (res) => {
                            var response = []
                            var respValue = res.data;
                            response = respValue.split('|');
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            // let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            if (response[15] == '0300') {

                                let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${response[2]}`);
                                let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${response[2]}`);
                                let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                                systemDate = systemDate.replace('-', '');
                                systemDate = systemDate.replace('-', '');
                                systemDate = systemDate.replace(' ', '');
                                let tran_date = moment().format('YYYYMMDD');
                                let finacialYear = await this.getCurrentFinancialYear();
                                let next_transaction = await this.next_transcationData();
                                //get bank account Number
                                let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                                let UTR_NO = response[3];
                                let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}',${bankDetails[0].GL_ACNO},${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${tran_date}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}','${recepit[0].SYSADD_LOGIN}')`);
                                await connection1.commit();
                                await connection1.close();

                                //INSERT DATA INTO 
                                let srno = 0;
                                for (let element of particular) {
                                    if (element.AMOUNT != 0 && element.AMOUNT != null) {
                                        srno += 1
                                        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                        // let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                        let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                                        await connection1.commit();
                                        await connection1.close();
                                    }
                                }
                                //update payment status 
                                let connection12 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                // let connection12 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                let updateStatus = await connection12.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO =  ${response[2]}`);
                                await connection12.commit();
                                let update = await connection12.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO =  ${response[2]}`);
                                await connection12.commit();
                                await connection12.close();
                                this.offset = this.offset + 1
                                await this.handleCron()
                            }
                            else if (response[15] == '0399' || response[15] == '0002' || response[15] == '0001' || response[15] == 'NA') {
                                let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                                let expiry = moment(systemDate).add(72, 'hours').format('YYYY-MM-DD hh:mm:ss');
                                let expiryDate = expiry.toString()
                                expiryDate = expiryDate.replace('-', '');
                                expiryDate = expiryDate.replace('-', '');
                                expiryDate = expiryDate.replace(' ', '');
                                let datestring = element.SYSADD_DATETIME == null ? moment().format('YYYY-MM-DD HH:mm:ss') : element.SYSADD_DATETIME;
                                var output = [datestring?.slice(0, 3 + 1), '-', datestring?.slice(4)].join('');
                                var output1 = [output?.slice(0, 6 + 1), '-', output?.slice(7)].join('');
                                var output2 = [output1?.slice(0, 9 + 1), ' ', output1?.slice(10)].join('');
                                let hours = moment().diff(moment(output2), 'hours');
                                if (hours > 72) {
                                    let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                                    await connection1.commit();
                                    await connection1.close();
                                    this.offset = this.offset + 1
                                    await this.handleCron()
                                } else {
                                    let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21, EXPIRE_DATE='${expiryDate}' where TRAN_NO = ${response[2]}`);
                                    await connection1.commit();
                                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${response[2]}`);
                                    await connection1.commit();
                                    await connection1.close();
                                    this.offset = this.offset + 1
                                    await this.handleCron()
                                }
                            }
                            else {
                                let datestring = element.SYSADD_DATETIME == null ? moment().format('YYYY-MM-DD HH:mm:ss') : element.SYSADD_DATETIME;
                                var output = [datestring?.slice(0, 3 + 1), '-', datestring?.slice(4)].join('');
                                var output1 = [output?.slice(0, 6 + 1), '-', output?.slice(7)].join('');
                                var output2 = [output1?.slice(0, 9 + 1), ' ', output1?.slice(10)].join('');
                                let hours = moment().diff(moment(output2), 'hours');
                                if (hours > 72) {
                                    let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                                    await connection1.commit();
                                    await connection1.close();
                                    this.offset = this.offset + 1
                                    await this.handleCron()
                                } else {
                                    let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
                                    await connection1.commit();
                                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
                                    await connection1.commit();
                                    await connection1.close();
                                    this.offset = this.offset + 1
                                    await this.handleCron()
                                }
                            }
                        })
                    })
                })
            }
            //bank code 102:sabpaisa /BOI
            else if (element.BANK_CODE == 102) {
                this.httpService.get(`https://txnenquiry.sabpaisa.in/SPTxtnEnquiry/TransactionEnquiry?clientCode=SHIVJU&clientXtnId=${element.TRAN_NO}&resultType=json
                `).subscribe(async (response) => {
                    let data = response.data
                    // if (data.txnStatus == 'success' || data.txnStatus == 'Success' || data.txnStatus == 'SUCCESS') {
                    if (data.status == 'success' || data.status == 'Success' || data.status == 'SUCCESS') {
                        let UTR_NO = data.txnId;
                        let checkexist = await this.TRNACCTCOMMRCPTIRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.ref_tranno=${data.clientTxnId} `)
                        if (checkexist.length == 0) {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            // let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            var query1 = await connection1.execute(`select * from TRNACCTONLINERCPTH where TRAN_NO ='${data.clientTxnId}'`)
                            var result1 = await connection1.execute(`select * from TRNACCTONLINERCPTI where TRAN_NO = '${data.clientTxnId}'`)
                            await connection1.close();
                            var recepit = await this.jsonConverter(query1);
                            var particular = await this.jsonConverter(result1);
                            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                            systemDate = systemDate.replace('-', '');
                            systemDate = systemDate.replace('-', '');
                            systemDate = systemDate.replace(' ', '');
                            let tran_date = moment().format('YYYYMMDD');
                            let finacialYear = await this.getCurrentFinancialYear();
                            let next_transaction = await this.next_transcationData();
                            //get bank account Number
                            let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                            // let UTR_NO = data.spTxnId;
                            let UTR_NO = data.txnId;
                            let UTRDATE = moment(data.transCompleteDate).format('YYYYMMDD');
                            //insert data into TRNACCTCOMMRCPTH
                            let connection12 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            // let connection12 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let mainData = await connection12.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}','${bankDetails[0].GL_ACNO}',${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${UTRDATE}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}')`);
                            await connection12.commit();
                            await connection12.close();
                            //INSERT DATA INTO 
                            let srno = 0;
                            for (let element of particular) {
                                if (element.AMOUNT != 0 && element.AMOUNT != null) {
                                    srno += 1
                                    let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                    // let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                    let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                                    await connection1.commit();
                                    await connection1.close();
                                }
                            }
                            //update payment status 
                            let connection3 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection3.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO = ${data.clientTxnId}`);
                            connection3.commit();
                            let update = await connection3.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO = ${data.clientTxnId}`);
                            await connection3.commit();
                            await connection3.close();
                            this.offset = this.offset + 1
                            await this.handleCron()
                        }
                    }
                    // else if (data.txnStatus == 'CHALLAN_GENERATED' && data.paymentMode == 'CASH') {
                    else if (data.status == 'CHALLAN_GENERATED' && data.paymentMode == 'CASH') {
                        let datestring = element.SYSADD_DATETIME;
                        var output = [datestring?.slice(0, 3 + 1), '-', datestring?.slice(4)].join('');
                        var output1 = [output?.slice(0, 6 + 1), '-', output?.slice(7)].join('');
                        var output2 = [output1?.slice(0, 9 + 1), ' ', output1?.slice(10)].join('');

                        let hours = moment().diff(moment(output2), 'hours');
                        if (hours > 96) {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            await connection1.close();
                            this.offset = this.offset + 1
                            await this.handleCron()
                        } else {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=32 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=32 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            await connection1.close()
                            this.offset = this.offset + 1
                            await this.handleCron()
                        }
                    }
                    else {
                        let datestring = element.SYSADD_DATETIME == null ? moment().format('YYYY-MM-DD HH:mm:ss') : element.SYSADD_DATETIME;
                        var output = [datestring?.slice(0, 3 + 1), '-', datestring?.slice(4)].join('');
                        var output1 = [output?.slice(0, 6 + 1), '-', output?.slice(7)].join('');
                        var output2 = [output1?.slice(0, 9 + 1), ' ', output1?.slice(10)].join('');
                        let hours = moment().diff(moment(output2), 'hours');
                        if (hours > 72) {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            await connection1.close();
                            this.offset = this.offset + 1
                            await this.handleCron()
                        } else {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            await connection1.close();
                            this.offset = this.offset + 1
                            await this.handleCron()
                        }
                    }
                }, (error) => {
                    // console.log(error,'err')
                    // if (error.response.status == 404) {
                    //     throw 'Break';
                    // }
                })
            }
            //bank code 101:axis
            else if (element.BANK_CODE == 101) {
                this.httpService.get('http://localhost/PHP_Algo/sampleEasyPayEnquiry.php?rid=' + element.RID + '&crn=' + element.TRAN_NO).subscribe(async (response) => {
                    let data = response.data
                    if (data.RMK == 'success' || data.RMK == 'Success') {
                        let UTR_NO = data.BRN;
                        let checkexist = await this.TRNACCTCOMMRCPTIRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.ref_tranno=${data.CRN} `)
                        if (checkexist.length == 0) {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${data.CRN}`);
                            let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${data.CRN}`);
                            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                            systemDate = systemDate.replace('-', '');
                            systemDate = systemDate.replace('-', '');
                            systemDate = systemDate.replace(' ', '');
                            let tran_date = moment().format('YYYYMMDD');
                            let finacialYear = await this.getCurrentFinancialYear();
                            let next_transaction = await this.next_transcationData();
                            //get bank account Number
                            let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                            let UTR_NO = data.BRN;
                            let UTR_DATE = data.TET.replace('/', '');
                            let UTRDATE = UTR_DATE.replace('/', '');
                            //insert data into TRNACCTCOMMRCPTH
                            let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}',${bankDetails[0].GL_ACNO},${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${UTRDATE}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}')`);
                            await connection1.commit();
                            await connection1.close();
                            //INSERT DATA INTO 
                            let srno = 0;
                            for (let element of particular) {
                                if (element.AMOUNT != 0 && element.AMOUNT != null) {
                                    srno += 1
                                    let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                                    let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                                    await connection1.commit();
                                    await connection1.close();
                                }
                            }

                            //update payment status 
                            let connection11 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection11.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
                            await connection11.commit();
                            let update = await connection11.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
                            await connection11.commit();
                            await connection11.close();
                            this.offset = this.offset + 1
                            await this.handleCron()
                        }
                    } else {
                        let datestring = element.SYSADD_DATETIME == null ? moment().format('YYYY-MM-DD HH:mm:ss') : element.SYSADD_DATETIME;
                        var output = [datestring.slice(0, 3 + 1), '-', datestring.slice(4)].join('');
                        var output1 = [output.slice(0, 6 + 1), '-', output.slice(7)].join('');
                        var output2 = [output1.slice(0, 9 + 1), ' ', output1.slice(10)].join('');
                        let hours = moment().diff(moment(output2), 'hours');
                        if (hours > 72) {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            await connection1.close();
                            this.offset = this.offset + 1
                            await this.handleCron()
                        } else {
                            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${element.TRAN_NO}`);
                            await connection1.commit();
                            await connection1.close();
                            this.offset = this.offset + 1
                            await this.handleCron()
                        }
                    }

                });
            }
            // }
        }
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


    async staticupdate(data) {
        let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${data.CRN}`);
        if (recepit.length != 0) {
            let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
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
            let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,EXT_REFNO,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${UTRDATE}',${finacialYear},'${recepit[0].PAID_BY}','${bankDetails[0].GL_ACNO}',${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTRDATE}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}','${data.EXT_REFNO}','${recepit[0].SYSADD_LOGIN}')`);
            await connection1.commit();
            await connection1.close();
            //INSERT DATA INTO 
            let srno = 0;
            for (let element of particular) {
                if (element.AMOUNT != 0 && element.AMOUNT != null) {
                    srno += 1
                    let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                    let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                    await connection1.commit();
                    await connection1.close();
                }
            }
            //update payment status 
            let connection11 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
            let updateStatus = await connection11.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
            await connection11.commit();
            let update = await connection11.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO = ${data.CRN}`);
            await connection11.commit();
            await connection11.close();
        }
        else {
            let connection1 = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
            let check = await connection1.execute(`select * from TRNACCTMATH where TRNACCTMATH.TRAN_NO = cast('${data.CRN}' as char(19))`)
            let checkdata = await this.jsonConverter(check)
            let recepit = await connection1.execute(`select * from TRNACCTMATH where tran_no =${data.CRN}`)
            let tableData = await this.jsonConverter(recepit)
            if (tableData.length != 0) {
                let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                systemDate = systemDate.replace('-', '');
                systemDate = systemDate.replace('-', '');
                systemDate = systemDate.replace(' ', '');
                let tran_date = moment().format('YYYYMMDD');
                let finacialYear = await this.getCurrentFinancialYear();
                let next_transaction = await this.next_transcationData();
                let id = { id: data.CRN }
                let particular = await this.getInvoiceDetail(id)
                let connection2 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                let userdetails = await connection2.execute(`select * from cnfusers where USER_ID= '${data.USER}'`)
                let users = await this.jsonConverter(userdetails)
                //get bank account Number
                let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${data.BANK}`);
                let UTR_NO = data.EXT_REFNO;
                let mainData = await connection2.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,EXT_REFNO,EXT_REFDATE,BANK_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${users[0].NAME}',${bankDetails[0].GL_ACNO},'${UTR_NO}','${tran_date}',${data.BANK},${data.AMOUNT},'INR',0,${data.CRN},'${tran_date}',${finacialYear},0,'${systemDate}','${users[0].USER_ID}')`);
                await connection2.commit();
                for (let element of particular.details) {
                    if (element.AMOUNT != 0 && element.AMOUNT != null) {
                        let particularData = await connection2.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${element.SR_NO})`);
                        await connection2.commit();
                    }
                }
                await connection1.close();
                await connection2.close();
            }
        }

    }



    async updateDetails(data) {
        let connection11 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let updateStatus = await connection11.execute(`select * from  TRNACCTONLINERCPTI where TRAN_NO = ${data.CRN}`);
        var result = await this.jsonConverter(updateStatus);
        await connection11.close();
        let srno1 = 0;
        let tran_date = data.tran_date;
        for (let element of result) {
            if (element.AMOUNT != 0 && element.AMOUNT != null) {
                srno1 += 1
                let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${data.TRANCRN},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${data.SYS_DATE}',${element.SR_NO})`);
                await connection1.commit();
                await connection1.close();
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////-----------Bank Of India--------------/////////////////////////////////////////////
    //###############################################################################################################################//

    async getResponseBOI(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        if (data.spRespStatus == 'SUCCESS' || data.spRespStatus == 'Success') {
            let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${data.clientTxnId}`);
            let UTR_NO = data?.SabPaisaTxId;
            let checkexist = await this.TRNACCTCOMMRCPTIRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.ref_tranno=${data.clientTxnId} `)
            if (checkexist.length == 0) {
                if (recepit.length != 0) {
                    let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${data.clientTxnId}`);
                    // let date = '';
                    // date = data.TRAN_DATE;
                    let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace(' ', '');
                    let tran_date = moment().format('YYYYMMDD');
                    let finacialYear = await this.getCurrentFinancialYear();
                    let next_transaction = await this.next_transcationData();
                    //get bank account Number
                    let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                    let UTR_NO = data?.SabPaisaTxId;
                    let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}',${bankDetails[0].GL_ACNO},${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${tran_date}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}','${recepit[0].SYSADD_LOGIN}')`);
                    await connection1.commit();

                    //INSERT DATA INTO 
                    let srno = 0;
                    for (let element of particular) {
                        if (element.AMOUNT != 0 && element.AMOUNT != null) {
                            srno += 1
                            let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                            await connection1.commit();
                        }
                    }

                    //update payment status 
                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO = ${data.clientTxnId}`);
                    await connection1.commit();
                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO = ${data.clientTxnId}`);
                    await connection1.commit();
                }
                else {
                    let connection1 = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
                    let recepit = await connection1.execute(`select * from TRNACCTMATH where tran_no =${data.clientTxnId}`)
                    let tableData = await this.jsonConverter(recepit)
                    if (tableData.length != 0) {
                        let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace(' ', '');
                        let tran_date = moment().format('YYYYMMDD');
                        let finacialYear = await this.getCurrentFinancialYear();
                        let next_transaction = await this.next_transcationData();
                        let id = { id: data.clientTxnId }
                        let particular = await this.getInvoiceDetail(id)
                        let connection2 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                        let userdetails = await connection2.execute(`select * from cnfusers where EMAIL_ID = '${data.email}' AND CELL_NO='${data.mobileNo}' and NAME='${data.Add}'`)
                        let users = await this.jsonConverter(userdetails)
                        //get bank account Number
                        let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = 102`);
                        let UTR_NO = data?.SabPaisaTxId;
                        let mainData = await connection2.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,EXT_REFNO,EXT_REFDATE,BANK_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${users[0].NAME}',${bankDetails[0].GL_ACNO},'${UTR_NO}','${tran_date}',103,${Number(data.amount)},'INR',0,${data.clientTxnId},'${tran_date}',${finacialYear},0,'${systemDate}','${users[0].USER_ID}')`);
                        await connection2.commit();
                        for (let element of particular.details) {
                            if (element.AMOUNT != 0 && element.AMOUNT != null) {
                                let particularData = await connection2.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${element.SR_NO})`);
                                await connection2.commit();
                            }
                        }
                        await connection1.close();
                        await connection2.close();
                    }
                }
            }
        }
        else if (data.spRespStatus == 'CHALLAN_GENERATED') {
            //update payment status 
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=32 where TRAN_NO = ${data.clientTxnId}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=32 where TRAN_NO = ${data.clientTxnId}`);
            await connection1.commit();
        }
        else {
            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
            let expiry = moment(systemDate).add(72, 'hours').format('YYYY-MM-DD hh:mm:ss');
            let expiryDate = expiry.toString()
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace(' ', '');

            let CRN: any;
            CRN = this.getKeyByValue(data, "CNY")
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21, EXPIRE_DATE='${expiryDate}' where TRAN_NO = ${data.clientTxnId}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${data.clientTxnId}`);
            await connection1.commit();
            //update STATUS_CODE 
        }
        await connection1.close()
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////-----------Bank Of Maharashtra--------------/////////////////////////////////////////////
    //###############################################################################################################################//

    async getBillDeskResponse(data) {
        var response = []
        var respValue = data['0'];
        response = respValue.split('|');
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        //success status
        if (response[14] == '0300') {
            let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${response[1]}`);
            let UTR_NO = response[2];
            let checkexist = await this.TRNACCTCOMMRCPTIRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.ref_tranno=${response[1]} `)
            if (checkexist.length == 0) {
                if (recepit.length != 0) {
                    let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${response[1]}`);
                    let date = '';
                    date = data.TRAN_DATE;
                    let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace(' ', '');
                    let tran_date = moment().format('YYYYMMDD');
                    let finacialYear = await this.getCurrentFinancialYear();
                    let next_transaction = await this.next_transcationData();
                    //get bank account Number
                    let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                    let UTR_NO = response[2];
                    let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}',${bankDetails[0].GL_ACNO},${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${tran_date}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}','${recepit[0].SYSADD_LOGIN}')`);
                    connection1.commit();

                    //INSERT DATA INTO 
                    let srno = 0;
                    for (let element of particular) {
                        if (element.AMOUNT != 0 && element.AMOUNT != null) {
                            srno += 1
                            let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                            connection1.commit();
                        }
                    }
                    //update payment status 
                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO =  ${response[1]}`);
                    connection1.commit();
                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO =  ${response[1]}`);
                    connection1.commit();
                }
                else {
                    let connection1 = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
                    let recepit = await connection1.execute(`select * from TRNACCTMATH where tran_no =${response[1]}`)
                    let tableData = await this.jsonConverter(recepit)
                    if (tableData.length != 0) {
                        let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace(' ', '');
                        let tran_date = moment().format('YYYYMMDD');
                        let finacialYear = await this.getCurrentFinancialYear();
                        let next_transaction = await this.next_transcationData();
                        let id = { id: response[1] }
                        let particular = await this.getInvoiceDetail(id)
                        let connection2 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                        let userdetails = await connection2.execute(`select * from cnfusers where EMAIL_ID = '${response[16]}' AND CELL_NO='${response[17]}'`)
                        let users = await this.jsonConverter(userdetails)
                        //get bank account Number
                        let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = 103`);
                        let UTR_NO = response[2]
                        let mainData = await connection2.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,EXT_REFNO,EXT_REFDATE,BANK_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${users[0].NAME}',${bankDetails[0].GL_ACNO},'${UTR_NO}','${tran_date}',103,${Number(response[4])},'INR',0,${response[1]},'${tran_date}',${finacialYear},0,'${systemDate}','${users[0].USER_ID}')`);
                        connection2.commit();
                        for (let element of particular.details) {
                            if (element.AMOUNT != 0 && element.AMOUNT != null) {
                                let particularData = await connection2.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${element.SR_NO})`);
                                connection2.commit();
                            }
                        }
                        connection1.close();
                        connection2.close();
                    }
                }
            }
        }
        // fail/technical/pending/abandoned/error condition status
        else if (response[14] == '0399' || response[14] == '0002' || response[14] == '0001' || response[14] == 'NA') {
            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
            let expiry = moment(systemDate).add(72, 'hours').format('YYYY-MM-DD hh:mm:ss');
            let expiryDate = expiry.toString()
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace(' ', '');
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21, EXPIRE_DATE='${expiryDate}' where TRAN_NO = ${response[1]}`);
            connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${response[1]}`);
            connection1.commit();
        }
        connection1.close()
    }


    //////////////////////////////////// ---- Update Bank ----- /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    async updateBankStatus(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21 where TRAN_NO = ${data.tran_no}`);
        await connection1.commit();
        let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${data.tran_no}`);
        await connection1.commit();
        await connection1.close()
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////invoice payment////////////////////////////////////////
    async invoiceList() {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        let query = await connection1.execute(`SELECT CAST(TRNACCTMATH.TRAN_NO AS VARCHAR(18)) AS REFTRAN_NO, FORMAT_DATE(TRNACCTMATH.TRAN_DATE) 
        trandate, TRNACCTMATH.TRAN_DATE, TRAN_AMT, TRNACCTMATH.TRANFORMAT_NO,  NVL(TRNACCTMATH.TRANFORMAT_NO,TRNACCTMATH.FIN_YEAR
        || ' - ' || CAST(CAST(SUBSTR(CAST(TRNACCTMATH.TRAN_NO AS VARCHAR(18)),12,7) AS NUMBER) AS VARCHAR(7))) || ' - ' || 
        (CASE WHEN MSTACCTGLSUB.SUB_GLCODE=21 THEN MSTACCTGLSUB.SUBGL_NAME ELSE PAID_TO END) applicationId, TRNACCTMATH.SUB_GLACNO,
        (CASE WHEN MSTACCTGLSUB.SUB_GLCODE=21 THEN MSTACCTGLSUB.SUBGL_NAME ELSE PAID_TO END) PARTY_NAME, MSTACCTGLSUB.GSTIN_NO FROM 
        ( SELECT  FIN_YEAR,TRAN_NO,TRANFORMAT_NO,SUB_GLACNO,PAID_TO, TRAN_DATE, TRAN_AMT  FROM TRNACCTMATH@fasdblink  
        WHERE TRNACCTMATH.TRAN_TYPE=115  AND TRNACCTMATH.STATUS_CODE=0)TRNACCTMATH  INNER JOIN MSTACCTGLSUB@fasdblink
        ON MSTACCTGLSUB.SUB_GLACNO=TRNACCTMATH.SUB_GLACNO WHERE   NOT EXISTS (	SELECT  trnacctcommrcpth.REF_TRANNO     FROM  trnacctcommrcpth  WHERE trnacctcommrcpth.REF_TRANNO = TRNACCTMATH.TRAN_NO   AND trnacctcommrcpth.STATUS_CODE=0) order by TRNACCTMATH.TRAN_NO`)
        return await this.jsonConverter(query);

    }

    ////invoice budget details
    async getInvoiceDetail(id) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
        let query = await connection1.execute(
            ` SELECT
            ROW_NUMBER() OVER (ORDER BY TMP.GL_ACNO) SR_NO,
            TMP.GL_ACNO,
            MSTACCTGL.BUDGET_CODE,
            MSTACCTGL.GL_NAME AS GL_NAME,
            MSTACCTGL.GL_NAME AS PARTICULARS,
            CASE WHEN AMOUNT>0 THEN 'Credit' ELSE 'Debit' END DRCR,
            TMP.AMOUNT
        FROM (  SELECT  GL_ACNO,
                        sum(CASE WHEN DR_CR='D' THEN AMOUNT ELSE AMOUNT*-1 END) AMOUNT
                FROM    TRNACCTMATITAX
                WHERE   TRAN_NO=${id.id}
                        AND POST_KEY IN(101,300)
                        AND NVL(AMOUNT,0)<>0
                        AND STATUS_CODE=0
                GROUP BY GL_ACNO
                UNION ALL
                SELECT  CNFCONSTANT.GL_ACNO,
                        NVL(sum(CASE WHEN DR_CR='D' THEN CGST_AMOUNT ELSE CGST_AMOUNT*-1 END),0) AMOUNT
                FROM    TRNACCTMATITAX
                        , (SELECT REF_VALUE AS GL_ACNO FROM CNFCONSTANT WHERE CODE=1221)CNFCONSTANT
                WHERE   TRAN_NO=${id.id}
                        AND POST_KEY=101
                        AND NVL(CGST_AMOUNT,0)<>0
                        AND STATUS_CODE=0
                GROUP BY CNFCONSTANT.GL_ACNO
                UNION ALL
                SELECT  CNFCONSTANT.GL_ACNO,
                        NVL(sum(CASE WHEN DR_CR='D' THEN SGST_AMOUNT ELSE SGST_AMOUNT*-1 END),0) AMOUNT
                FROM    TRNACCTMATITAX
                        , (SELECT REF_VALUE AS GL_ACNO FROM CNFCONSTANT WHERE CODE=1222)CNFCONSTANT
                WHERE   TRAN_NO=${id.id}
                        AND POST_KEY=101
                        AND NVL(SGST_AMOUNT,0)<>0
                        AND STATUS_CODE=0
                GROUP BY CNFCONSTANT.GL_ACNO
                UNION ALL
                SELECT  CNFCONSTANT.GL_ACNO,
                        NVL(sum(CASE WHEN DR_CR='D' THEN IGST_AMOUNT ELSE IGST_AMOUNT*-1 END),0) AMOUNT
                FROM    TRNACCTMATITAX
                        , (SELECT REF_VALUE AS GL_ACNO FROM CNFCONSTANT WHERE CODE=1223)CNFCONSTANT
                WHERE   TRAN_NO=${id.id}
                        AND POST_KEY=101
                        AND NVL(IGST_AMOUNT,0)<>0
                        AND STATUS_CODE=0
                GROUP BY CNFCONSTANT.GL_ACNO
        )TMP    LEFT OUTER JOIN MSTACCTGL ON MSTACCTGL.GL_ACNO=TMP.GL_ACNO
        WHERE   TMP.AMOUNT<>0`)
        let obj = {
            details: await this.jsonConverter(query)
        }
        return obj
    }

    ///////////////////////////////Easebuzz//////////////////////////   
    async easebuzz(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        //success status
        if (data.status == 'success') {
            let UTR_NO = data.easepayid;
            let checkexist = await this.TRNACCTCOMMRCPTIRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.ref_tranno=${data.txnid} `)
            if (checkexist.length == 0) {
                let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${data.txnid}`);
                if (recepit.length != 0) {
                    let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${data.txnid}`);
                    let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace('-', '');
                    systemDate = systemDate.replace(' ', '');
                    let tran_date = moment().format('YYYYMMDD');
                    let finacialYear = await this.getCurrentFinancialYear();
                    let next_transaction = await this.next_transcationData();
                    //get bank account Number
                    let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                    let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}',${bankDetails[0].GL_ACNO},${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${tran_date}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}','${recepit[0].SYSADD_LOGIN}')`);
                    await connection1.commit();

                    //INSERT DATA INTO 
                    let srno = 0;
                    for (let element of particular) {
                        if (element.AMOUNT != 0 && element.AMOUNT != null) {
                            srno += 1
                            let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                            await connection1.commit();
                        }
                    }
                    //update payment status          
                    let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO =  ${data.txnid}`);
                    await connection1.commit();
                    let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO =  ${data.txnid}`);
                    await connection1.commit();
                }
                else {
                    let connection1 = await oracledb.getConnection({ user: "BWAYSFAS", password: "bwaysfas", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.4.92)(PORT = 1521))(CONNECT_DATA =(SID= fas21)))" });
                    let recepit = await connection1.execute(`select * from TRNACCTMATH where tran_no =${data.txnid}`)
                    let tableData = await this.jsonConverter(recepit)
                    if (tableData.length != 0) {
                        let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace('-', '');
                        systemDate = systemDate.replace(' ', '');
                        let tran_date = moment().format('YYYYMMDD');
                        let finacialYear = await this.getCurrentFinancialYear();
                        let next_transaction = await this.next_transcationData();
                        let id = { id: data.txnid }
                        let particular = await this.getInvoiceDetail(id)
                        let connection2 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
                        let userdetails = await connection2.execute(`select * from cnfusers where EMAIL_ID= '${data.email}' AND CELL_NO=${data.phone} and NAME='${data.firstname}'`)
                        let users = await this.jsonConverter(userdetails)
                        //get bank account Number
                        let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = 104`);
                        let UTR_NO = data.easepayid;
                        let mainData = await connection2.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,EXT_REFNO,EXT_REFDATE,BANK_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${data.firstname}',${bankDetails[0].GL_ACNO},'${UTR_NO}','${tran_date}',104,${data.amount},'INR',0,${data.txnid},'${tran_date}',${finacialYear},0,'${systemDate}','${users[0].USER_ID}')`);
                        await connection2.commit();
                        for (let element of particular.details) {
                            if (element.AMOUNT != 0 && element.AMOUNT != null) {
                                let particularData = await connection2.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${element.SR_NO})`);
                                await connection2.commit();
                            }
                        }
                        await connection1.close();
                        await connection2.close();
                    }
                }
            }
        }
        // fail/technical/pending/abandoned/error condition status
        else if (data.status == 'failure') {
            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
            let expiry = moment(systemDate).add(72, 'hours').format('YYYY-MM-DD hh:mm:ss');
            let expiryDate = expiry.toString()
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace(' ', '');
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21, EXPIRE_DATE='${expiryDate}' where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
        }
        //status pending for challan 
        else if (data.status == 'pending') {
            //update payment status 
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=32 where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=32 where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
        }
        else if (data.status == 'userCancelled') {
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11 where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
        }
        await connection1.close()
    }
    //webhook response entry if transaction is success/fail/usercanelled
    async easebuzzWebhook(data) {
        let connection1 = await oracledb.getConnection({ user: "BWAYSCOMM", password: "BWAYSCOMM", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-R4UE9QT)(PORT = 1521))(CONNECT_DATA =(SID= bankdb)))" })
        //success status
        if (data.status == 'success') {
            let UTR_NO = data.easepayid;
            let checkexist = await this.TRNACCTCOMMRCPTIRepository.query(`select * from TRNACCTCOMMRCPTH where TRNACCTCOMMRCPTH.ref_tranno=${data.txnid} `)
            if (checkexist.length == 0) {
                let recepit = await this.onlinercpthRepository.query(`select * from TRNACCTONLINERCPTH where TRNACCTONLINERCPTH.TRAN_NO =${data.txnid}`);
                let particular = await this.commanOnlineRepository.query(`select * from TRNACCTONLINERCPTI where TRAN_NO = ${data.txnid}`);
                let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
                systemDate = systemDate.replace('-', '');
                systemDate = systemDate.replace('-', '');
                systemDate = systemDate.replace(' ', '');
                let tran_date = moment().format('YYYYMMDD');
                let finacialYear = await this.getCurrentFinancialYear();
                let next_transaction = await this.next_transcationData();
                //get bank account Number
                let bankDetails = await this.bankRepository.query(`select GL_ACNO,CODE from CNFONLINEBANKS where CODE = ${recepit[0].BANK_CODE}`);
                let UTR_NO = data.easepayid;
                let mainData = await connection1.execute(`insert into TRNACCTCOMMRCPTH(TRAN_NO,TRAN_TYPE,TRAN_SUBTYPE,SHORT_NAME,TRAN_DATE,FIN_YEAR,PAID_BY,GL_ACNO,PURPOSE_CODE,EXAM_NAME,EXT_REFNO,EXT_REFDATE,BANK_CODE,DEPT_CODE,FEESTRU_CODE,TRAN_AMT,CURRENCY,STUDENT_CODE,REF_TRANNO,REF_TRANDATE,REF_TRANYEAR,STATUS_CODE,SYS_DATE,SYSADD_LOGIN)values(${next_transaction},102,62,'REC','${tran_date}',${finacialYear},'${recepit[0].PAID_BY}',${bankDetails[0].GL_ACNO},${recepit[0].PURPOSE_CODE},'${recepit[0].EXAM_NAME}','${UTR_NO}','${tran_date}',${recepit[0].BANK_CODE},${recepit[0].DEPT_CODE},${recepit[0].FEESTRU_CODE},${recepit[0].TRAN_AMT},'INR',0,${recepit[0].TRAN_NO},'${recepit[0].TRAN_DATE}',${finacialYear},0,'${systemDate}','${recepit[0].SYSADD_LOGIN}')`);
                await connection1.commit();

                //INSERT DATA INTO 
                let srno = 0;
                for (let element of particular) {
                    if (element.AMOUNT != 0 && element.AMOUNT != null) {
                        srno += 1
                        let particularData = await connection1.execute(`insert into TRNACCTCOMMRCPTI(TRAN_NO,TRAN_DATE,GL_ACNO,AMOUNT,BUDGET_CODE,IS_DEBT,STATUS_CODE,SYS_DATE,SR_NO)values(${next_transaction},'${tran_date}',${element.GL_ACNO},${element.AMOUNT},'${element.BUDGET_CODE}',0,0,'${systemDate}',${srno})`);
                        await connection1.commit();
                    }
                }
                //update payment status          
                let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=0 where TRAN_NO =  ${data.txnid}`);
                await connection1.commit();
                let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=0 where TRAN_NO =  ${data.txnid}`);
                await connection1.commit();
            }
        }
        // fail/technical/pending/abandoned/error condition status
        else if (data.status == 'failure') {
            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
            let expiry = moment(systemDate).add(72, 'hours').format('YYYY-MM-DD hh:mm:ss');
            let expiryDate = expiry.toString()
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace(' ', '');
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=21, EXPIRE_DATE='${expiryDate}' where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=21 where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
        }
        // fail/technical/pending/abandoned/error condition status
        else if (data.status == 'userCancelled') {
            let systemDate = moment().format("YYYY-MM-DD HH:mm:ss");
            let expiry = moment(systemDate).add(72, 'hours').format('YYYY-MM-DD hh:mm:ss');
            let expiryDate = expiry.toString()
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace('-', '');
            expiryDate = expiryDate.replace(' ', '');
            let updateStatus = await connection1.execute(`update TRNACCTONLINERCPTH set STATUS_CODE=11, EXPIRE_DATE='${expiryDate}' where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
            let update = await connection1.execute(`update TRNACCTONLINERCPTI set STATUS_CODE=11 where TRAN_NO = ${data.txnid}`);
            await connection1.commit();
        }
        await connection1.close()
        return { status: 200 }
    }
}
