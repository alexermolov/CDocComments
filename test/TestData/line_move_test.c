// Test file to demonstrate the line move bug fix
// 
// Steps to test:
// 1. Type /** and press Enter to generate a comment block
// 2. Try moving lines inside the comment using Alt+Arrow
// 3. Verify that no duplicate comments are generated

/**
 * @brief Need to be run in application setup before at commands can be used
 * @note It will build whole structure
 * @param hterminal: Terminal handle pointer
 * @retval None
 */
void at_cmds_init(terminal_handle_t *hterminal);

/**
 * @brief Test function with multiple parameters
 * @note This is a test
 * @param param1: First parameter
 * @param param2: Second parameter
 * @param param3: Third parameter
 * @retval int Return value
 */
int test_function(int param1, char* param2, float param3);

// Before the fix:
// - Moving a line like "* @param param2: Second parameter" with Alt+Arrow 
//   would trigger unwanted comment generation
// - This resulted in duplicate and malformed comment blocks
//
// After the fix:
// - Line moves are detected and ignored
// - Only actual comment triggers (///, /**) generate comments
// - Copy/paste and other bulk operations are also ignored
