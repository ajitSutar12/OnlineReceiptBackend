import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RegistrationService } from './registration.service'
import { RegistrationDTO } from './dto/registrationDTO'

@Controller('registration')
export class RegistrationController {
    registration: any;
    constructor(private formService: RegistrationService) { }
    //Insertion 
    @Post('/insert')
    insert(@Body() register: RegistrationDTO) {
        return this.formService.insert(register);
    }

    @Get('/collegecode')
    getCollegeCode() {
        return this.formService.getCollegeCodeList()
    }

    @Post('/forgotPassword')
    forgotPassword(@Body() data) {
        return this.formService.forgotPassword(data);
    }

    @Post('/resetPassword')
    resetPassword(@Body() data) {
        return this.formService.resetPassword(data);
    }

    @Post('/updateprofile')
    updateProfile(@Body() data) {
        return this.formService.updateProfile(data);
    }

    @Post('/getUserData')
    getUserData(@Body() data) {
        return this.formService.getUserData(data);
    }

    @Get('/QUESTIONS')
    getPassRecoveryQuestion() {
        return this.formService.getQuestionsList()
    }

    @Get('/updatePassword')
    updatePassword() {
        return this.formService.updatePassword();
    }

    @Post('/Password')
    updatePasswordEncryt(@Body() data) {
        return this.formService.getEncrypTdata(data.id)
    }


    @Post('/Utility')
    utility(@Body() data) {
        return this.formService.utility(data);
    }



    /////////////////////////////////////////////////////
    ////////////////PMS data fetch//////////////////////////////

    @Get('/banklist')
    getmstbank() {
        return this.formService.getmstbank()
    }

    @Get('/paymentcode')
    getpaymentcode() {
        return this.formService.getpaymentcode()
    }

    @Get('/receiptList')
    getReceiptList() {
        return this.formService.getReceiptList()
    }


    @Get('/branchlist/:code')
    getmstbankbranch(@Param('code') code) {
        return this.formService.getmstbankbranch(code)
    }
}
