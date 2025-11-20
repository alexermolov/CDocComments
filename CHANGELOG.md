# Change Log

## 1.1.5 (Nov 20, 2025)

* **Publisher Migration**: Moved to alexermolov publisher (original author)
* **Major Code Refactoring**: Fixed logic errors and improved performance
  * Fixed regex patterns in SyntacticAnalysisCSharp for better code detection
  * Improved parameter parsing for generic types and method parameters
  * Optimized VSCodeApi methods to reduce unnecessary iterations
  * Fixed StringUtil indentation handling
  * Enhanced error handling and null safety throughout the codebase
  * Improved comment generation logic for both C# and C++ styles

## 1.0.5 (Apr 22, 2020)

* Fix issue with new comment line.

* Fix auto indentation for cpp and c comments block.

## 1.0.4 (Sep 3, 2018)

* Fix auto indentation for comments block. Both types of comments indentation was fixed.

## 1.0.3 (Sep 16, 2017)

* Fix c++ comments.

## 1.0.2 (Sep 11, 2017)

* Add generic class support for C#.
* Fix empty method comments for C#.
* Remove enter command for C# comments.

## 1.0.0 (Sep 7, 2017)

* Start repo.
