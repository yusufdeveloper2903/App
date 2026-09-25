import DelegatorList from '@components/DelegatorList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import VacationDelegateForm from '@components/VacationDelegateForm';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getVacationDelegateErrors from '@libs/getVacationDelegateErrors';
import Navigation from '@libs/Navigation/Navigation';

import {clearVacationDelegateError, setVacationDelegate} from '@userActions/VacationDelegate';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

function VacationDelegateEditPage() {
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
    const hasActiveDelegations = !!vacationDelegate?.delegatorFor?.length;

    const saveClearAfter = (clearAfter: string) => {
        const delegate = vacationDelegate?.delegate;
        if (delegate && clearAfter !== (vacationDelegate?.clearAfter ?? '')) {
            setVacationDelegate({creator: currentUserLogin, delegate, currentDelegate: delegate, clearAfter, shouldOverridePolicyDiffWarning: true});
        }
        Navigation.goBack(ROUTES.SETTINGS_PROFILE.route);
    };

    return (
        <ScreenWrapper
            testID="VacationDelegateEditPage"
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('common.vacationDelegate')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE.route)}
            />
            {hasActiveDelegations ? (
                <DelegatorList
                    delegators={vacationDelegate?.delegatorFor}
                    message={translate('statusPage.cannotSetVacationDelegate')}
                />
            ) : (
                <VacationDelegateForm
                    key={`${vacationDelegate?.delegate}-${vacationDelegate?.clearAfter}`}
                    vacationDelegate={vacationDelegate}
                    description={translate('statusPage.setVacationDelegate')}
                    errors={getVacationDelegateErrors(vacationDelegate)}
                    pendingAction={vacationDelegate?.pendingAction}
                    onCloseError={() => clearVacationDelegateError(vacationDelegate?.previousDelegate)}
                    onChooseDelegate={() => Navigation.navigate(ROUTES.SETTINGS_VACATION_DELEGATE)}
                    onSave={saveClearAfter}
                />
            )}
        </ScreenWrapper>
    );
}

export default VacationDelegateEditPage;
