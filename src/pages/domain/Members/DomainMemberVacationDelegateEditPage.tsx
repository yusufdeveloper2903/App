import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import VacationDelegateForm from '@components/VacationDelegateForm';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {clearVacationDelegateError, setDomainVacationDelegate} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {vacationDelegateSelector} from '@selectors/Domain';
import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';

type DomainMemberVacationDelegateEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE_EDIT>;

function DomainMemberVacationDelegateEditPage({route}: DomainMemberVacationDelegateEditPageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: vacationDelegateSelector(accountID),
    });
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(accountID),
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);
    const memberLogin = personalDetails?.login ?? '';
    const memberDetailsRoute = ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID);

    const saveClearAfter = (clearAfter: string) => {
        const delegate = vacationDelegate?.delegate;
        if (memberLogin && delegate && clearAfter !== (vacationDelegate?.clearAfter ?? '')) {
            setDomainVacationDelegate(domainAccountID, accountID, currentUserLogin ?? '', memberLogin, delegate, vacationDelegate, clearAfter);
        }
        Navigation.goBack(memberDetailsRoute);
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DomainMemberVacationDelegateEdit"
            >
                <HeaderWithBackButton
                    title={translate('common.vacationDelegate')}
                    onBackButtonPress={() => Navigation.goBack(memberDetailsRoute)}
                />
                <VacationDelegateForm
                    key={`${vacationDelegate?.delegate}-${vacationDelegate?.clearAfter}`}
                    vacationDelegate={vacationDelegate}
                    description={translate('statusPage.setVacationDelegate')}
                    errors={getLatestError(domainErrors?.memberErrors?.[memberLogin]?.vacationDelegateErrors)}
                    pendingAction={domainPendingActions?.member?.[memberLogin]?.vacationDelegate}
                    onCloseError={() => clearVacationDelegateError(domainAccountID, accountID, memberLogin, vacationDelegate?.previousDelegate)}
                    onChooseDelegate={() => Navigation.navigate(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(domainAccountID, accountID))}
                    onSave={saveClearAfter}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainMemberVacationDelegateEditPage;
