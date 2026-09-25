import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import React, {useState} from 'react';
import {View} from 'react-native';

import Button from './Button';
import DatePicker from './DatePicker';
import FixedFooter from './FixedFooter';
import ScrollView from './ScrollView';
import Text from './Text';
import VacationDelegateMenuItem from './VacationDelegateMenuItem';

type VacationDelegateFormProps = {
    vacationDelegate?: BaseVacationDelegate;
    description: string;
    errors?: Errors;
    pendingAction?: PendingAction;
    onCloseError: () => void;
    onChooseDelegate: () => void;
    onSave: (clearAfter: string) => void;
};

function VacationDelegateForm({vacationDelegate, description, errors, pendingAction, onCloseError, onChooseDelegate, onSave}: VacationDelegateFormProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const [clearAfter, setClearAfter] = useState(vacationDelegate?.clearAfter ?? '');
    const hasDelegate = !!vacationDelegate?.delegate;
    const clearAfterDisplay = clearAfter ? DateUtils.formatWithUTCTimeZone(clearAfter, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, dateFnsLocale) : '';

    return (
        <>
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.mh5, styles.mb4]}>{description}</Text>
                <VacationDelegateMenuItem
                    vacationDelegate={vacationDelegate}
                    errors={errors}
                    pendingAction={pendingAction}
                    onCloseError={onCloseError}
                    onPress={onChooseDelegate}
                />
                {hasDelegate && (
                    <View style={[styles.mh5, styles.mt5]}>
                        <DatePicker
                            inputID="clearAfter"
                            label={translate('statusPage.clearAfterRecommended')}
                            value={clearAfter}
                            onInputChange={setClearAfter}
                            minDate={new Date()}
                        />
                        {!!clearAfterDisplay && <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('statusPage.vacationDelegateWillClearOn', clearAfterDisplay)}</Text>}
                    </View>
                )}
            </ScrollView>
            <FixedFooter>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={styles.w100}
                    isDisabled={!hasDelegate}
                    onPress={() => onSave(clearAfter)}
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PROFILE.VACATION_DELEGATE_SAVE}
                >
                    <Button.Text>{translate('common.save')}</Button.Text>
                </Button>
            </FixedFooter>
        </>
    );
}

export default VacationDelegateForm;
