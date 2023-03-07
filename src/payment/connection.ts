const oracledb = require('oracledb');

export class dbconnection{
    async connection(){
        let connection = await oracledb.getConnection({ user: "BWAYSFAS", password: "BWAYSFAS", connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = ERP3.erpcompserv.local)(PORT = 1521))(CONNECT_DATA =(SID= ORACLE)))" });
    }
}