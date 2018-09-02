# XML Documentation Comments Support for Visual Studio Code

Generate documentation comments for Visual Studio Code.


## Usage

Type "///", it auto-generates an XML documentation comment like this:
```
/// <summary>
/// 
/// </summary>
```

Type "/**" and push Enter, it auto-generates an documentation comment like this:
```
/** 
 * @brief  
 * @note   
 * @param  baudRate: 
 * @retval None
 */
```

## Configuration

The menu under File > Preferences (Code > Preferences on Mac) provides entries to configure user and workspace settings. You are provided with a list of Default Settings. Copy any setting that you want to change to the related `settings.json` file.

### settings.json

```json
{
	// Press the Enter key to activate a command (Default: false)
	"docomment.activateOnEnter": true,
	// Insert spaces when pressing Tab.
	"editor.insertSpaces": true,
	// The number of spaces a tab is equal to.
	"editor.tabSize": 4
}
```


## Installation

1. Install Visual Studio Code 1.8.0 or higher
1. Launch Code
1. From the extension view `Ctrl`-`Shift`-`X` (Windows, Linux) or `Cmd`-`Shift`-`X` (macOS)
1. Search and Choose the extension `C-family Documentation Comments`
1. Reload Visual Studio Code


## Supported Languages

- C#
- C++
- C

## Contributors

* [@AlexCoderCorp](https://github.com/AlexCoderCorp)


## License

This extension is [licensed under the MIT License](LICENSE.txt).
