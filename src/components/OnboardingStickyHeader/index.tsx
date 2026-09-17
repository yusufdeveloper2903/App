import CaretBackHeader from '@components/CaretBackHeader';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';

import type {ReactNode} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';
import Reanimated, {useAnimatedStyle} from 'react-native-reanimated';

import type {OnboardingStickyHeaderConfig} from './OnboardingStickyHeaderContext';

import {OnboardingStickyHeaderActionsContext, OnboardingStickyHeaderElementContext} from './OnboardingStickyHeaderContext';

type OnboardingStickyHeaderBarProps = {
    config: OnboardingStickyHeaderConfig;
    onContainerElementChanged: (element: HTMLElement | null) => void;
};

type OnboardingStickyHeaderProps = {
    children: ReactNode;
};

function OnboardingStickyHeaderBar({config, onContainerElementChanged}: OnboardingStickyHeaderBarProps) {
    const styles = useThemeStyles();
    const {paddingTop} = useSafeAreaPaddings();
    const viewportOffsetTop = useViewportOffsetTop();
    const {collapsibleHeader} = config;
    const top = paddingTop + (config.isViewportOffsetTopApplied ? viewportOffsetTop : 0);

    const clipStyle = useAnimatedStyle(() => {
        const collapsedHeight = collapsibleHeader?.get().collapsedHeight ?? -1;
        if (collapsedHeight < 0) {
            return {overflow: 'hidden', height: 'auto'};
        }
        return {overflow: 'hidden', height: collapsedHeight};
    });

    const translateStyle = useAnimatedStyle(() => ({transform: [{translateY: collapsibleHeader?.get().translateY ?? 0}]}));

    return (
        <Reanimated.View
            pointerEvents="box-none"
            style={[styles.pAbsolute, styles.l0, styles.r0, styles.zIndex10, {top}, clipStyle]}
        >
            <Reanimated.View
                pointerEvents="box-none"
                style={translateStyle}
            >
                <FocusTrapContainerElement onContainerElementChanged={onContainerElementChanged}>
                    <CaretBackHeader
                        onBackButtonPress={config.onBackButtonPress}
                        sentryLabel="OnboardingHeader-Back"
                    />
                </FocusTrapContainerElement>
            </Reanimated.View>
        </Reanimated.View>
    );
}

function OnboardingStickyHeader({children}: OnboardingStickyHeaderProps) {
    const styles = useThemeStyles();
    const [config, setConfig] = useState<OnboardingStickyHeaderConfig>();
    const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);

    return (
        <OnboardingStickyHeaderActionsContext.Provider value={setConfig}>
            <OnboardingStickyHeaderElementContext.Provider value={containerElement}>
                <View style={styles.flex1}>
                    {!!config?.shouldShowBackButton && (
                        <OnboardingStickyHeaderBar
                            config={config}
                            onContainerElementChanged={setContainerElement}
                        />
                    )}
                    {children}
                </View>
            </OnboardingStickyHeaderElementContext.Provider>
        </OnboardingStickyHeaderActionsContext.Provider>
    );
}

export default OnboardingStickyHeader;
