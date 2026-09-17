import useThemeStyles from '@hooks/useThemeStyles';

import React, {useContext, useState} from 'react';
import {View} from 'react-native';

import FocusTrapContainerElement from './FocusTrap/FocusTrapContainerElement';
import FocusTrapForScreens from './FocusTrap/FocusTrapForScreen';
import {OnboardingStickyHeaderElementContext} from './OnboardingStickyHeader/OnboardingStickyHeaderContext';

type OnboardingWrapperProps = {
    children: React.ReactNode;
};

function OnboardingWrapper({children}: OnboardingWrapperProps) {
    const styles = useThemeStyles();
    const stickyHeaderElement = useContext(OnboardingStickyHeaderElementContext);
    const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
    const containerElements = stickyHeaderElement && contentElement ? [stickyHeaderElement, contentElement] : undefined;

    return (
        <FocusTrapForScreens focusTrapSettings={containerElements ? {containerElements} : undefined}>
            <View style={styles.h100}>
                <FocusTrapContainerElement
                    onContainerElementChanged={setContentElement}
                    style={styles.h100}
                >
                    {children}
                </FocusTrapContainerElement>
            </View>
        </FocusTrapForScreens>
    );
}

export default OnboardingWrapper;
