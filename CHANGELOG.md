# Change Log

All notable changes to the "Function Visualizer" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.1] - 2026-02-07

### Fixed

- Downgraded minimum VS Code engine requirement to `^1.107.0` to support slightly older editor versions.
- Added explicit debug command `function-visualizer.debug`.
- Fixed multi-language support (Java, C, C++, Python, etc.) by correctly registering activation events.
- **Critical Fix**: Improved C/C++ parser to correctly handle pointer return types, struct definitions, and function calls within control flow statements.ly implemented but disabled in extension logic).

## [0.1.0] - 2026-02-06

### Added

- Initial release of Function Visualizer for VS Code.
- Interactive graph visualization using React Flow.
- Support for JavaScript, TypeScript, Python, and Java.
- "Visualize File" and "Visualize Selection" commands.
- Export functionality for JSON and JPEG.
- Dark/Light mode support matching VS Code themes.
