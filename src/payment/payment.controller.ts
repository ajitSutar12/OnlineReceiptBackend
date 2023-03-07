import { Body, Request, Controller, Get, Param, Post, UseGuards, Query, Put } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
    constructor(private formService: PaymentService) { }

    @Get('/studpurpose:id')
    getStudPurpose(@Param() id) {
        return this.formService.getPurposeForStudList(id)
    }

    @Get('/collegepurpose')
    getCollegePurpose() {
        return this.formService.getPurposeForCollegeList()
    }

    @Get('/anyonepurpose')
    getAnyonePurpose() {
        return this.formService.getPurposeForAnyoneList()
    }

    @Get('/department')
    getDepartment() {
        return this.formService.getDepartmentList()
    }

    @Get('/dept:term')
    getDeptList(@Param() term) {
        return this.formService.getDeptList(term)
    }

    @Get('/challan:term')
    getChallan(@Param() term) {
        return this.formService.getChallanList(term)
    }

    @Get('/getPurposeForStud:DeptId')
    getStudentTableListDept(@Param() DeptId) {
        return this.formService.getStudetTableUsingDept(DeptId);
    }

    @Get('/ListCollegePurpose:DeptId')
    getCollegeTableListDept(@Param() DeptId) {
        return this.formService.getCollegeTableUsingDept(DeptId);
    }

    @Get('/TableOfAnyone:DeptId')
    getAnyoneTableListDept(@Param() DeptId) {
        return this.formService.getAnyoneTableUsingDept(DeptId);
    }

    @Get('/StudentTableList:challanId')
    getStudetTableList(@Param() challanId) {
        return this.formService.getStudentTableList(challanId);
    }

    @Get('/bankList')
    getBankList() {
        return this.formService.getBankList()
    }
    @UseGuards(JwtAuthGuard)
    @Post('/draft')
    submitAsDraft(@Body() draft, @Request() user: any) {
        return this.formService.submitDraft(user, draft)
    }

    @Get('/function')
    function() {
        return this.formService.function();
    }

    @Get('/draftList')
    draftList() {
        return this.formService.studentDraftList();
    }

    @Get('/finacialYear')
    finacialYear() {
        return this.formService.transactionData();
    }

    @Get('/finacialYear1')
    finacial() {
        return this.formService.next_transcationData();
    }

    @Get('/getPrintData:id')
    printData(@Param() id) {
        return this.formService.printData(id);
    }

    @Post('/getPaymentResponse')
    getResponse(@Body() data) {
        return this.formService.getResponse(data);
    }

    @Get('/success:UserCode')
    success(@Param() UserCode) {
        return this.formService.success(UserCode.UserCode);
    }
    // UnSuccess
    @Get('/unsuccess:UserCode')
    unsuccess(@Param() UserCode) {
        return this.formService.unsuccess(UserCode.UserCode);
    }
    // Success but not printed
    @Get('/Notprinted:UserCode')
    successNotprinted(@Param() UserCode) {
        return this.formService.successNotprinted(UserCode.UserCode);
    }

    @Post('/draftListDetails')
    draftListDetails(@Body() data) {
        return this.formService.draftListDetails(data);
    }

    @Get('/receiptupdate:tranno')
    updateReceipt(@Param() tranno) {
        return this.formService.updateReceipt(tranno);
    }

    @Get('/getStudentDraftData:id')
    getDetails(@Param() id) {
        return this.formService.getStudentDraftData(id);
    }

    @Post('/StudentUpdateDetails')
    studentUpdateDetails(@Body() data) {
        return this.formService.studentUpdateDetails(data);
    }


    @Post('/submit_feedback')
    feedback(@Body() data) {
        return this.formService.feedback(data);
    }

    @Post('/updateriddetails')
    updateriddetails(@Body() data) {
        return this.formService.updateriddetails(data);
    }

    @Post('/staticupdate')
    staticupdate(@Body() data) {
        return this.formService.staticupdate(data);
    }

    @Post('/updateDetails')
    updateDetails(@Body() data) {
        return this.formService.updateDetails(data);
    }
    @Post('/tableRecords')
    addData(@Body() data) {
        return this.formService.addData(data);
    }

    @Get('/getwayResponse')
    getwayResponse(@Query() data: any) {
        this.formService.getResponseBOI(data);
        let htmlData
        if (data.spRespStatus == 'SUCCESS') {
            htmlData = `<div style="text-align:center;"><h1>Your Payment Was Successful </h1><br><a href="http://paysuk.unishivaji.ac.in/BWaysReceipt/dashboard"><button onclick="window.close();">Close</button></a></div>`;
        }
        else if (data.spRespStatus == 'CHALLAN_GENERATED') {
            htmlData = `<div style="text-align:center;"><h1>Challan Generated</h1><br><a href="http://paysuk.unishivaji.ac.in/BWaysReceipt/dashboard"><button onclick="window.close();">Close</button></a></div>`;
        }
        else {
            htmlData = `<div style="text-align:center;"><h1>Your Payment Was Failed </h1><br><a href="http://paysuk.unishivaji.ac.in/BWaysReceipt/dashboard"><button onclick="window.close();">Close</button></a></div>`;
        }
        return htmlData;
    }

    @Post('/getBilldeskRepsonse')
    getBillDeskResponse(@Body() data) {
        return this.formService.getBillDeskResponse(data)
    }


    // @Put('/updateMIS')
    // updateMIS(@Body() data) {
    //     return this.formService.updateMIS(data);
    // }

    @Post('/updateBankStatus')
    updateBankStatus(@Body() data) {
        return this.formService.updateBankStatus(data);
    }

    @Post('/easebuzz')
    easebuzz(@Body() data) {
        this.formService.easebuzz(data);
        let htmlData
        if (data.status == 'success') {
            htmlData = `<div style="text-align:center;"><h1>Your Payment Was Successful </h1><br><a href="http://localhost:5000/dashboard"><button onclick="window.close();">Close</button></a></div>`;
            // htmlData = `<div style="text-align:center;"><h1>Your Payment Was Successful </h1><br><a href="http://paysuk.unishivaji.ac.in/BWaysReceipt/dashboard"><button onclick="window.close();">Close</button></a></div>`;
        }
        else if (data.status == 'CHALLAN_GENERATED') {
            htmlData = `<div style="text-align:center;"><h1>Challan Generated</h1><br><a href="http://paysuk.unishivaji.ac.in/BWaysReceipt/dashboard"><button onclick="window.close();">Close</button></a></div>`;
        }
        else {
            htmlData = `<div style="text-align:center;"><h1>Your Payment Was Failed </h1><br><a href="http://paysuk.unishivaji.ac.in/BWaysReceipt/dashboard"><button onclick="window.close();">Close</button></a></div>`;
        }
        return htmlData;
    }
}
