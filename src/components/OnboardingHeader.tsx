import useThemeStyles from '@hooks/useThemeStyles';

import {useFocusEffect} from '@react-navigation/native';
import React, {useContext, useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {OnboardingStickyHeaderConfig, SetOnboardingStickyHeaderConfig} from './OnboardingStickyHeader/OnboardingStickyHeaderContext';

import CaretBackHeader from './CaretBackHeader';
import CollapsibleHeaderOnKeyboardContext from './CollapsibleHeaderOnKeyboard/CollapsibleHeaderOnKeyboardContext';
import {OnboardingStickyHeaderActionsContext} from './OnboardingStickyHeader/OnboardingStickyHeaderContext';
import ScreenWrapperStatusContext from './ScreenWrapper/ScreenWrapperStatusContext';

type OnboardingHeaderProps = {
    onBackButtonPress?: () => void;

    shouldShowBackButton?: boolean;
};

type OnboardingHeaderSlotProps = OnboardingHeaderProps & {
    setConfig: SetOnboardingStickyHeaderConfig;
};

function OnboardingHeaderSlot({onBackButtonPress, shouldShowBackButton = true, setConfig}: OnboardingHeaderSlotProps) {
    const styles = useThemeStyles();
    const isViewportOffsetTopApplied = !!useContext(ScreenWrapperStatusContext)?.isViewportOffsetTopApplied;
    const collapsibleHeader = useContext(CollapsibleHeaderOnKeyboardContext);
    const onBackButtonPressRef = useRef(onBackButtonPress);

    useEffect(() => {
        onBackButtonPressRef.current = onBackButtonPress;
    }, [onBackButtonPress]);

    useFocusEffect(() => {
        const config: OnboardingStickyHeaderConfig = {
            shouldShowBackButton,
            isViewportOffsetTopApplied,
            collapsibleHeader,
            onBackButtonPress: () => onBackButtonPressRef.current?.(),
        };
        setConfig(config);

        return () => setConfig((currentConfig) => (currentConfig === config ? undefined : currentConfig));
    });

    return <View style={styles.onboardingHeaderContainer} />;
}

function OnboardingHeader({onBackButtonPress, shouldShowBackButton = true}: OnboardingHeaderProps) {
    const setStickyHeaderConfig = useContext(OnboardingStickyHeaderActionsContext);

    if (!setStickyHeaderConfig) {
        return (
            <CaretBackHeader
                onBackButtonPress={onBackButtonPress}
                shouldShowBackButton={shouldShowBackButton}
                sentryLabel="OnboardingHeader-Back"
            />
        );
    }

    return (
        <OnboardingHeaderSlot
            onBackButtonPress={onBackButtonPress}
            shouldShowBackButton={shouldShowBackButton}
            setConfig={setStickyHeaderConfig}
        />
    );
}

export default OnboardingHeader;
