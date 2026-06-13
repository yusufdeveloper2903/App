import CONST from '@src/CONST';

const {EXPENSE_COLUMN_AVAILABILITY, TYPE_CUSTOM_COLUMNS, REPORT_DETAILS_CUSTOM_COLUMNS} = CONST.SEARCH;

const availabilityEntries = Object.values(EXPENSE_COLUMN_AVAILABILITY);
const searchColumns: string[] = Object.values(TYPE_CUSTOM_COLUMNS.EXPENSE);
const reportColumns: string[] = Object.values(REPORT_DETAILS_CUSTOM_COLUMNS);

describe('Expense column availability', () => {
    it('declares every Search expense column in the availability map', () => {
        const searchAvailableColumns = availabilityEntries.filter((meta) => meta.search).map((meta) => meta.column);
        expect(new Set(searchColumns)).toEqual(new Set(searchAvailableColumns));
    });

    it('does not allow a search column without a deliberate availability declaration', () => {
        for (const column of searchColumns) {
            const meta = availabilityEntries.find((entry) => entry.column === column);
            expect(meta).toBeDefined();
            expect(meta?.search).toBe(true);
        }
    });

    it('derives the report details columns from the reportView flag', () => {
        const reportAvailableColumns = availabilityEntries.filter((meta) => meta.reportView).map((meta) => meta.column);
        expect(reportColumns).toEqual(reportAvailableColumns);
    });

    it('aligns the four transaction-level columns into the report details view', () => {
        const expectedAligned = [
            CONST.SEARCH.TABLE_COLUMNS.POSTED,
            CONST.SEARCH.TABLE_COLUMNS.ATTENDEES,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE,
            CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT,
        ];
        for (const column of expectedAligned) {
            expect(reportColumns).toContain(column);
            expect(searchColumns).toContain(column);
        }
    });

    it('keeps report-level columns out of the report details view', () => {
        const reportLevelColumns = [
            CONST.SEARCH.TABLE_COLUMNS.STATUS,
            CONST.SEARCH.TABLE_COLUMNS.SUBMITTED,
            CONST.SEARCH.TABLE_COLUMNS.APPROVED,
            CONST.SEARCH.TABLE_COLUMNS.EXPORTED,
            CONST.SEARCH.TABLE_COLUMNS.FROM,
            CONST.SEARCH.TABLE_COLUMNS.TO,
            CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME,
            CONST.SEARCH.TABLE_COLUMNS.REPORT_ID,
            CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID,
            CONST.SEARCH.TABLE_COLUMNS.TITLE,
            CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO,
            CONST.SEARCH.TABLE_COLUMNS.ACTION,
        ];
        for (const column of reportLevelColumns) {
            expect(reportColumns).not.toContain(column);
            expect(searchColumns).toContain(column);
        }
    });

    it('keeps TOTAL as the only report-details-only column', () => {
        const reportOnlyColumns = reportColumns.filter((column) => !searchColumns.includes(column));
        expect(reportOnlyColumns).toEqual([CONST.SEARCH.TABLE_COLUMNS.TOTAL]);
    });
});
