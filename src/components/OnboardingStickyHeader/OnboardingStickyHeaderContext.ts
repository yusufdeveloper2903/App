import type {CollapsibleHeaderOnKeyboardContextType} from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderOnKeyboardContext';

import type {Dispatch, SetStateAction} from 'react';

import {createContext} from 'react';

type OnboardingStickyHeaderConfig = {
    shouldShowBackButton: boolean;
    onBackButtonPress: () => void;
    isViewportOffsetTopApplied: boolean;
    collapsibleHeader?: CollapsibleHeaderOnKeyboardContextType;
};

type SetOnboardingStickyHeaderConfig = Dispatch<SetStateAction<OnboardingStickyHeaderConfig | undefined>>;

const OnboardingStickyHeaderActionsContext = createContext<SetOnboardingStickyHeaderConfig | undefined>(undefined);

const OnboardingStickyHeaderElementContext = createContext<HTMLElement | null>(null);

export {OnboardingStickyHeaderActionsContext, OnboardingStickyHeaderElementContext};
export type {OnboardingStickyHeaderConfig, SetOnboardingStickyHeaderConfig};
