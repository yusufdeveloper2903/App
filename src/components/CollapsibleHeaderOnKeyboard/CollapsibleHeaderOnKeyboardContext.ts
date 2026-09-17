import type {SharedValue} from 'react-native-reanimated';

import {createContext} from 'react';

type CollapsibleHeaderOnKeyboardContextType = SharedValue<{
    collapsedHeight: number;
    translateY: number;
}>;

const CollapsibleHeaderOnKeyboardContext = createContext<CollapsibleHeaderOnKeyboardContextType | undefined>(undefined);

export default CollapsibleHeaderOnKeyboardContext;
export type {CollapsibleHeaderOnKeyboardContextType};
