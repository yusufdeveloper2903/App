import {createContext} from 'react';

type ScreenWrapperStatusContextType = {
    didScreenTransitionEnd: boolean;
    isSafeAreaTopPaddingApplied: boolean;
    isSafeAreaBottomPaddingApplied: boolean;
    isViewportOffsetTopApplied?: boolean;
};

const ScreenWrapperStatusContext = createContext<ScreenWrapperStatusContextType | undefined>(undefined);

export default ScreenWrapperStatusContext;
