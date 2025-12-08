# Changelog Rules

This document defines the rules for maintaining the CHANGELOG.md file for the Delivery Locations Map App.

## Format

Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

## Structure

```markdown
# Delivery Locations Map App - Changelog

## [Unreleased]

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements

## [X.Y.Z] - YYYY-MM-DD

### Added
...
```

## Categories

### Added
For new features, capabilities, or functionality.

**Examples:**
- Added support for GeoJSON map uploads
- Added Spanish language translations
- Added export settings feature

### Changed
For changes in existing functionality.

**Examples:**
- Changed default button color to match brand
- Changed API response format for better performance
- Changed database schema for improved queries

### Deprecated
For soon-to-be removed features.

**Examples:**
- Deprecated legacy map upload API (use v2)
- Deprecated old button style options

### Removed
For removed features.

**Examples:**
- Removed support for Internet Explorer 11
- Removed deprecated REST endpoints

### Fixed
For bug fixes.

**Examples:**
- Fixed map not loading on mobile Safari
- Fixed button colors not applying correctly
- Fixed database migration error

### Security
For security-related changes.

**Examples:**
- Fixed XSS vulnerability in description field
- Updated dependencies to patch security issues
- Added input sanitization for custom URLs

## Version Numbers

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backward compatible)
- **PATCH** (0.0.X): Bug fixes (backward compatible)

## Rules

### 1. Always Update [Unreleased]
When making changes, add them under `[Unreleased]` section.

### 2. Use Present Tense
- ✅ "Add feature X"
- ❌ "Added feature X"

### 3. Be Specific
- ✅ "Fix map not loading on iOS Safari 15"
- ❌ "Fix bug"

### 4. Link to Issues/PRs
When applicable, reference issue or PR numbers:
- "Fix button alignment (#123)"
- "Add GeoJSON support (closes #45)"

### 5. Group Related Changes
Keep related changes together under the same category.

### 6. Date Format
Use ISO 8601 format: YYYY-MM-DD

### 7. Keep Unreleased at Top
The `[Unreleased]` section always stays at the top.

### 8. Release Process
When releasing:
1. Review all changes in `[Unreleased]`
2. Determine version bump (major/minor/patch)
3. Create new version section: `## [X.Y.Z] - YYYY-MM-DD`
4. Move all `[Unreleased]` items to new version section
5. Leave `[Unreleased]` section empty but present
6. Commit as: `release: Version X.Y.Z`
7. Create git tag: `git tag vX.Y.Z`
8. Push tag: `git push origin vX.Y.Z`

## Examples

### Good Changelog Entry
```markdown
## [Unreleased]

### Added
- Add support for custom GeoJSON map uploads (#42)
- Add button hover animation for better UX
- Add Spanish and French translations

### Fixed
- Fix map not displaying on iOS Safari 15 (#38)
- Fix color picker not saving hex values correctly
- Fix mobile layout breaking on screens < 320px

### Changed
- Change default button shape from square to rounded
- Improve API response time by 40% with query optimization
```

### Bad Changelog Entry
```markdown
## [Unreleased]

### Added
- New stuff
- More features

### Fixed
- Fixed bugs
- Various improvements
```

## Commit Messages

When updating the changelog, use conventional commit format:

- `docs(changelog): add feature X to unreleased`
- `docs(changelog): add fix for issue #123`
- `release: Version 1.2.0`

## Automation

### Pre-commit Hook
Consider adding a pre-commit hook to remind about changelog updates:

```bash
#!/bin/bash
if git diff --cached --name-only | grep -qE '^(app|extensions|prisma)/'; then
  if ! git diff --cached --name-only | grep -q 'CHANGELOG.md'; then
    echo "Warning: You're committing code changes without updating CHANGELOG.md"
    echo "Consider adding your changes to the [Unreleased] section"
    exit 1
  fi
fi
```

## Review Checklist

Before releasing, verify:
- [ ] All changes are documented
- [ ] Categories are correct
- [ ] Descriptions are clear and specific
- [ ] Version number follows semver
- [ ] Date is correct
- [ ] No typos or formatting issues
- [ ] Links to issues/PRs are correct

## Questions?

If unsure about:
- **Category**: Use the most specific one; when in doubt, use "Changed"
- **Version bump**: Patch for fixes, minor for features, major for breaking changes
- **Wording**: Be clear and concise; imagine explaining to a merchant

---

**Remember**: The changelog is for users (merchants and developers), not for internal tracking. Focus on what changed from their perspective.

