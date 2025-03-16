module.exports = {
    preset: 'ts-jext',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/types/**',
        '!**/node_modules/**'
    ],
    coverageReporters: ['text', 'lcov', 'clover'],
    verbose: true
}
