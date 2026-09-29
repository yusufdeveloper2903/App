import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import type {PrivatePersonalDetails} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function getBankAccountOwnerDetails(privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) {
    const currentAddress = getCurrentAddress(privatePersonalDetails);
    const [addressStreet, street2] = getStreetLines(currentAddress?.street);

    return {
        legalFirstName: privatePersonalDetails?.legalFirstName,
        legalLastName: privatePersonalDetails?.legalLastName,
        addressStreet,
        addressStreet2: street2 ?? currentAddress?.street2 ?? currentAddress?.addressLine2,
        addressCity: currentAddress?.city,
        addressState: currentAddress?.state,
        addressZipCode: currentAddress?.zip,
        country: currentAddress?.country,
    };
}

export default getBankAccountOwnerDetails;
