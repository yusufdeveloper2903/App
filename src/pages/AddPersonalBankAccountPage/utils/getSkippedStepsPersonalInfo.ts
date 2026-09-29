import {getCurrentAddress} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {PrivatePersonalDetails} from '@src/types/onyx';

const SUB_PAGE_NAMES = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES;

type SkippablePageName = typeof SUB_PAGE_NAMES.LEGAL_NAME | typeof SUB_PAGE_NAMES.ADDRESS | typeof SUB_PAGE_NAMES.PHONE_NUMBER;

/**
 * Returns the initial substep for the Personal Info step based on already existing data
 */
function getSkippedStepsPersonalInfo(data?: Partial<PrivatePersonalDetails>): SkippablePageName[] {
    const currentAddress = getCurrentAddress(data);
    const skippedSteps: SkippablePageName[] = [];
    if (!!data?.legalFirstName && !!data?.legalLastName) {
        skippedSteps.push(SUB_PAGE_NAMES.LEGAL_NAME);
    }

    const isUsOrCanada = currentAddress?.country === CONST.COUNTRY.US || currentAddress?.country === CONST.COUNTRY.CA;
    const hasValidState = !isUsOrCanada || !!currentAddress?.state;

    if (!!currentAddress?.street && !!currentAddress?.city && hasValidState && !!currentAddress?.zip) {
        skippedSteps.push(SUB_PAGE_NAMES.ADDRESS);
    }

    if (data?.phoneNumber) {
        skippedSteps.push(SUB_PAGE_NAMES.PHONE_NUMBER);
    }

    return skippedSteps;
}

export default getSkippedStepsPersonalInfo;
