import {useNavigation} from '@react-navigation/core';
import type {NavigationState, PartialState} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';
import useThemeStyles from '@hooks/useThemeStyles';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';
import Navigation, {getDeepestFocusedScreen, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';

/**
 * Recursively checks whether any 2FA setup screen is mounted anywhere in the navigation tree.
 * The 2FA modal can be open while a different modal (e.g. the onboarding modal) is the focused route,
 * so the focused-path check alone (getDeepestFocusedScreen) can miss it and leave the overlay stuck.
 */
function stateContainsTwoFactorSetupScreen(state: NavigationState | PartialState<NavigationState> | undefined): boolean {
    if (!state?.routes) {
        return false;
    }
    return state.routes.some((route) => {
        if (isTwoFactorSetupScreen(route.name)) {
            return true;
        }
        const screen = (route.params as {screen?: string} | undefined)?.screen;
        if (screen && isTwoFactorSetupScreen(screen)) {
            return true;
        }
        return stateContainsTwoFactorSetupScreen(route.state);
    });
}

/**
 * Checks if the 2FA is required because of Xero.
 * - User is an admin of a workspace
 * - Xero connection is enabled in the workspace
 */
const is2FARequiredBecauseOfXeroSelector = (email?: string) => {
    return (workspaces: OnyxCollection<Policy>) => {
        return Object.values(workspaces ?? {})?.some((workspace) => {
            const isXeroConnectionEnabled = workspace?.connections?.xero;
            const isAdmin = email && workspace?.employeeList?.[email]?.role === CONST.POLICY.ROLE.ADMIN;
            return !!isXeroConnectionEnabled && !!isAdmin;
        });
    };
};

function RequireTwoFactorAuthenticationOverlay() {
    const navigation = useNavigation();
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();
    const isIn2FASetupFlow = useRootNavigationState((state) => {
        // When navigation is not ready yet, use the navigation state from the navigation hook.
        const rootState = state ?? navigation.getState();
        // The 2FA modal can be open while another modal (e.g. the onboarding modal) is the focused route,
        // so check the focused path first and then fall back to scanning the whole tree for a 2FA screen.
        return isTwoFactorSetupScreen(getDeepestFocusedScreen(rootState)?.name) || stateContainsTwoFactorSetupScreen(rootState);
    });

    const illustrations = useMemoizedLazyIllustrations(['Encryption']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getTwoFactorAuthRoute} = useTwoFactorAuthRoute();
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const requires2FAForXeroSelector = useCallback((workspaces: OnyxCollection<Policy>) => is2FARequiredBecauseOfXeroSelector(email)(workspaces), [email]);
    const [is2FARequiredBecauseOfXero = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: requires2FAForXeroSelector});

    const handleOnPress = () => {
        // Anchor the 2FA dynamic route to a stable, always-resolvable base (settings/security) instead of
        // the transient screen behind the overlay. While onboarding, the active route is the onboarding
        // modal, which cannot host the `two-factor-auth/...` suffix, so the dynamic route would fail to
        // resolve. The OnboardingGuard pauses its onboarding redirect while 2FA setup is pending so this
        // navigation reaches the 2FA flow instead of bouncing back to onboarding.
        Navigation.navigate(getTwoFactorAuthRoute(ROUTES.SETTINGS_SECURITY));
    };

    if (!shouldShowRequire2FAPage || isIn2FASetupFlow) {
        return null;
    }

    return (
        <FocusTrapForModal active>
            <View
                style={[StyleSheet.absoluteFill, styles.twoFARequiredOverlay]}
                testID="RequireTwoFactorAuthenticationOverlay"
            >
                <View style={[styles.flex1, styles.appBG]}>
                    <View style={styles.twoFARequiredContainer}>
                        <View style={[styles.twoFAIllustration, styles.alignItemsCenter]}>
                            <Icon
                                src={illustrations.Encryption}
                                width={variables.twoFAIconHeight}
                                height={variables.twoFAIconHeight}
                            />
                        </View>
                        <View style={[styles.mt2, styles.mh5, styles.dFlex, styles.alignItemsCenter]}>
                            <View style={styles.mb5}>
                                <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mv2]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsHeader')}</Text>
                                <Text style={[styles.textSupporting, styles.textAlignCenter]}>
                                    {translate(is2FARequiredBecauseOfXero ? 'twoFactorAuth.twoFactorAuthIsRequiredXero' : 'twoFactorAuth.twoFactorAuthIsRequiredCompany')}
                                </Text>
                            </View>
                            <Button
                                large
                                success
                                pressOnEnter
                                onPress={handleOnPress}
                                text={translate('twoFactorAuth.enableTwoFactorAuth')}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </FocusTrapForModal>
    );
}

export default RequireTwoFactorAuthenticationOverlay;
