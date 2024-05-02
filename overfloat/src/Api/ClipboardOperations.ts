/*****************************************************************************
 * @FilePath    : src/Api/ClipboardOperations.ts                             *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { readText, writeText } from "@tauri-apps/api/clipboard";

/**
 * @brief Function for reading the content of the clipboard
 * @returns Content of the clipboard
 */
export async function clipboardRead() {
    const content = await readText();
    return content == null ? "" : content;
}

/**
 * @brief Function for writing text to the clipboard
 * @param text Text to be written to the clipboard
 */
export async function clipboardWrite(text: string) {
    return writeText(text);
}
