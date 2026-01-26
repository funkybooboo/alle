module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat', // New feature
                'fix', // Bug fix
                'docs', // Documentation only
                'style', // Code style (formatting, no logic change)
                'refactor', // Refactoring (no feat/fix)
                'perf', // Performance improvement
                'test', // Adding tests
                'build', // Build system or dependencies
                'ci', // CI/CD changes
                'chore', // Other changes (tooling, etc.)
                'revert', // Revert previous commit
            ],
        ],
        'subject-case': [2, 'never', ['upper-case']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'type-empty': [2, 'never'],
    },
};
