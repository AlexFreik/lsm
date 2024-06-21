function getEventsMock() {
    return JSON.stringify([
        [
            {
                name: 'IE 7 days',
                lang: 'English',
                allocation: [
                    [],
                    [
                        [
                            '131',
                            new Date('2024-06-07T13:30:00.000Z'),
                            new Date('2024-06-07T15:30:00.000Z'),
                        ],
                    ],
                ],
                details: ['xyz', '12345 12345', '2024-06-08T01:30:00.000Z'],
            },
            {
                name: 'Sadhguru Sahabhagi',
                lang: 'Hindi',
                allocation: [
                    [],
                    [
                        [
                            'upcoming',
                            new Date('2024-06-07T01:30:00.000Z'),
                            new Date('2024-06-07T05:00:00.000Z'),
                        ],
                    ],
                ],
                details: ['123', '12345 12345', '2024-06-08T01:30:00.000Z'],
            },
            {
                name: 'Sadhguru Sahabhagi long title blah blah',
                lang: 'Hindi',
                allocation: [
                    [],
                    [
                        [
                            '131',
                            new Date('2024-06-07T01:30:00.000Z'),
                            new Date('2024-06-07T05:00:00.000Z'),
                        ],
                    ],
                ],
                details: ['xyz123', '12345 12345', '2024-06-08T01:30:00.000Z'],
            },
            {
                name: 'Sadhguru Sahabhagi',
                lang: 'Hindi',
                allocation: [
                    [],
                    [
                        [
                            '132',
                            new Date('2024-06-08T01:30:00.000Z'),
                            new Date('2024-06-08T05:00:00.000Z'),
                        ],
                    ],
                ],
                details: ['abc', '12345 12345', '2024-06-08T01:30:00.000Z'],
            },
        ],
        [
            'Column 1',
            'WhatsApp number of streaming volunteer',
            'Session Start Time (including Yogapadhi)',
        ],
    ]);
}
