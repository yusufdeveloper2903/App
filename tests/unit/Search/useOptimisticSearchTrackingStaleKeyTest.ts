import {act, renderHook, waitFor} from '@testing-library/react-native';

import useOptimisticSearchTracking from '@components/Search/hooks/useOptimisticSearchTracking';

import {flushDeferredWrite, getOptimisticWatchKey, hasDeferredWrite, registerDeferredWrite, reserveDeferredWriteChannel, resetForTesting} from '@libs/deferredLayoutWrite';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';

const STALE_TRANSACTION_ID = '4636459667746018396';
const MATCHING_TRANSACTION_ID = '2440027151381789592';
const STALE_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}${STALE_TRANSACTION_ID}` as const;
const MATCHING_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}${MATCHING_TRANSACTION_ID}` as const;

const staleTransaction: Transaction = {...createRandomTransaction(1), transactionID: STALE_TRANSACTION_ID, reportID: '1234', merchant: 'ZZ99450A'};
const matchingTransaction: Transaction = {...createRandomTransaction(2), transactionID: MATCHING_TRANSACTION_ID, reportID: '5678', merchant: 'Blue Bottle Cafe'};

const allTransactions: OnyxCollection<Transaction> = {[STALE_KEY]: staleTransaction, [MATCHING_KEY]: matchingTransaction};
const matchingOnlyTransactions: OnyxCollection<Transaction> = {[MATCHING_KEY]: matchingTransaction};

const parsedQuery = buildSearchQueryJSON('type:expense sortBy:date sortOrder:desc Blue Bottle Cafe');
if (!parsedQuery) {
    throw new Error('query did not parse');
}
const queryJSON = parsedQuery;

const searchResults: SearchResults = {
    search: {
        offset: 0,
        hash: queryJSON.hash,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        hasMoreResults: false,
        hasResults: true,
        isLoading: false,
    },
    data: {[MATCHING_KEY]: matchingTransaction},
};

beforeEach(() => {
    jest.useFakeTimers();
    resetForTesting();
});

afterEach(() => {
    resetForTesting();
    jest.useRealTimers();
});

describe('useOptimisticSearchTracking - stale optimistic watch key', () => {
    it('does not inject the last created expense into a later, unrelated query', () => {
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, () => {}, {optimisticWatchKey: STALE_KEY});

        expect(hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(false);
        expect(getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(STALE_KEY);

        const {result} = renderHook(() => useOptimisticSearchTracking({searchResults, queryJSON, transactions: allTransactions, reportActions: {}}));

        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(STALE_KEY);
        expect(result.current.searchDataWithOptimisticTransaction).toHaveProperty(MATCHING_KEY);
    });

    it('still injects the optimistic transaction while a Search write is pending', () => {
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, () => {}, {optimisticWatchKey: STALE_KEY});

        expect(hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(true);

        const {result} = renderHook(() => useOptimisticSearchTracking({searchResults, queryJSON, transactions: allTransactions, reportActions: {}}));

        expect(result.current.searchDataWithOptimisticTransaction).toHaveProperty(STALE_KEY);
    });

    it('still resolves the parked key lazily when the write registers after the mount', async () => {
        jest.useRealTimers();
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);

        const {result, rerender} = renderHook(
            (props: {transactions: OnyxCollection<Transaction>}) => useOptimisticSearchTracking({searchResults, queryJSON, transactions: props.transactions, reportActions: {}}),
            {initialProps: {transactions: matchingOnlyTransactions}},
        );

        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(STALE_KEY);

        act(() => {
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, () => {}, {optimisticWatchKey: STALE_KEY});
        });

        expect(hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(false);

        rerender({transactions: allTransactions});

        await waitFor(() => expect(result.current.searchDataWithOptimisticTransaction).toHaveProperty(STALE_KEY));
    });
});
