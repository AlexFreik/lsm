function Tests() {
    Import.UnitTesting.init();

    // ===== Utils =====
    (() =>
        describe('format', () => {
            const i1 = new Instance('id1', 'test1', '0.0.0.0', 10);
            const i2 = new Instance('id1', 'test1', '0.0.0.0', 60 + 16);
            const i3 = new Instance('id1', 'test1', '0.0.0.0', 3600 + 60 * 2);
            const i4 = new Instance('id1', 'test1', '0.0.0.0', 3600 * 24 + 3600 * 10 + 60 * 2 + 5);
            const i5 = new Instance('id1', 'test1', '0.0.0.0', -1);
            it('less than minute', () => {
                assert.equals({
                    expected: '10s',
                    actual: i1.uptimeString,
                });
            });
            it('less than hour', () => {
                assert.equals({
                    expected: '1m 16s',
                    actual: i2.uptimeString,
                });
            });
            it('less than day', () => {
                assert.equals({
                    expected: '1h 2m 0s',
                    actual: i3.uptimeString,
                });
            });
            it('more then day', () => {
                assert.equals({
                    expected: '1d 10h 2m 5s',
                    actual: i4.uptimeString,
                });
            });
            it('uptime is -1', () => {
                assert.equals({
                    expected: '',
                    actual: i5.uptimeString,
                });
            });
        }))();
}

function logReminderMessage() {
    const i1 = new Instance('id1', 'test1', '0.0.0.0', new Date());
    console.log(i1.reminderMessage);
}

function logSummeryEmail() {
    const i1 = new Instance('id1', 'test1', '0.0.0.0', new Date(Date.now() - 1000 * 60 * 90));
    const i2 = new Instance('id2', 'test2', '0.0.0.0', new Date(Date.now() - 1000 * 60 * 50));

    const s1 = getSummeryEmail([i1]);
    const s2 = getSummeryEmail([i1, i2]);
    console.log(s1.subject + '\n' + s1.body);
    console.log(s2.subject + '\n' + s2.body);
}
