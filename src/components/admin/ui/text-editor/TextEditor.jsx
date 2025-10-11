import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
    AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent,
    Link, Image, Table, Minus, Undo, Redo, Search, Quote, RemoveFormatting,
    Eraser, ExternalLink, Heading, Palette, Highlighter, Code,
} from 'lucide-react';

const RichTextEditor = ({ value, onChange }) => {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [activeCommands, setActiveCommands] = useState({});
    const editorRef = useRef(null);

    // REMOVED: fonts, sizes
    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'];

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            // Only update the DOM if the internal content differs from the prop value
            editorRef.current.innerHTML = value || '';
            updateWordCount();
            // Initial history save when value changes (e.g., loading an existing post)
            setTimeout(() => saveToHistory(value || ''), 0);
        }
    }, [value]);

    const checkActiveCommands = useCallback(() => {
        if (!editorRef.current) return;

        const currentBlock = document.queryCommandValue('formatBlock').toLowerCase();

        const commands = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikethrough: document.queryCommandState('strikeThrough'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            quote: currentBlock === 'blockquote',
            code: currentBlock === 'pre',
            // UPDATED: Only track Paragraph and H2
            paragraph: currentBlock === 'p' || currentBlock === '',
            subheading: currentBlock === 'h2',
        };

        setActiveCommands(commands);
    }, []);

    const saveToHistory = useCallback((contentToSave = null) => {
        if (!editorRef.current) return;
        const currentContent = contentToSave !== null ? contentToSave : editorRef.current.innerHTML;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentContent);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const updateWordCount = useCallback(() => {
        if (editorRef.current) {
            const text = editorRef.current.innerText || '';
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
        }
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            const newContent = cleanHtmlContent(editorRef.current.innerHTML);
            if (onChange) {
                onChange(newContent);
            }
            updateWordCount();
        }
    }, [onChange, updateWordCount]);

    const handleBlur = useCallback(() => {
        saveToHistory();
        if (editorRef.current && onChange) {
            onChange(cleanHtmlContent(editorRef.current.innerHTML));
        }
    }, [saveToHistory, onChange]);

    const execCommand = (command, value = null) => {
        editorRef.current?.focus();

        if (command === 'insertUnorderedList' || command === 'insertOrderedList' || command === 'removeFormat') {
            document.execCommand(command, false, value);
            if (command === 'removeFormat') {
                document.execCommand('formatBlock', false, 'p'); // Always reset to <p>
            }
        }
        else if (command === 'formatBlock') {
            const currentBlock = document.queryCommandValue('formatBlock').toLowerCase();

            if (value === 'h2') {
                const newBlock = (currentBlock === 'h2' || currentBlock === '') ? 'p' : 'h2';
                document.execCommand('formatBlock', false, newBlock);
            } else if (value === 'p') {
                document.execCommand('formatBlock', false, 'p');
            } else {
                document.execCommand(command, false, value);
            }
        }
        else {
            document.execCommand(command, false, value);
        }

        checkActiveCommands();
        setTimeout(() => saveToHistory(), 0);
    };

    // Event listener for selection change to update active commands
    useEffect(() => {
        document.addEventListener('selectionchange', checkActiveCommands);
        if (value) {
            setTimeout(() => saveToHistory(value), 0);
        }
        return () => document.removeEventListener('selectionchange', checkActiveCommands);
    }, [checkActiveCommands, saveToHistory, value]);


    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            if (editorRef.current) {
                editorRef.current.innerHTML = history[newIndex];
                updateWordCount();
                checkActiveCommands();
            }
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            if (editorRef.current) {
                editorRef.current.innerHTML = history[newIndex];
                updateWordCount();
                checkActiveCommands();
            }
        }
    };

    const insertLink = () => {
        if (linkUrl) {
            editorRef.current?.focus();
            const selection = window.getSelection();
            if (selection.toString().length > 0) {
                execCommand('createLink', linkUrl);
            } else if (linkText) {
                const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
                execCommand('insertHTML', link);
            } else {
                const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>`;
                execCommand('insertHTML', link);
            }

            setShowLinkModal(false);
            setLinkUrl('');
            setLinkText('');
        }
    };

    const insertImage = () => {
        if (imageUrl) {
            if (imageUrl.startsWith('data:')) {
                execCommand('insertImage', imageUrl);
                setShowImageModal(false);
                setImageUrl('');
            } else {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 800;
                    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    execCommand('insertImage', base64);
                    setShowImageModal(false);
                    setImageUrl('');
                };
                img.onerror = () => {
                    execCommand('insertImage', imageUrl);
                    setShowImageModal(false);
                    setImageUrl('');
                };
                img.src = imageUrl;
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageUrl(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const insertTable = () => {
        let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
        for (let i = 0; i < tableRows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < tableCols; j++) {
                tableHTML += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 50px;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        execCommand('insertHTML', tableHTML);
        setShowTableModal(false);
    };


    const handleFindReplace = () => {
        if (!findText) return;
        const content = editorRef.current?.innerHTML || '';
        const regex = new RegExp(findText, 'gi');
        const newContent = content.replace(regex, replaceText);
        if (editorRef.current) {
            editorRef.current.innerHTML = newContent;
            saveToHistory();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                execCommand('outdent');
            } else {
                execCommand('indent');
            }
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const currentBlock = document.queryCommandValue('formatBlock').toLowerCase();
            if (currentBlock !== 'h2' && currentBlock !== 'blockquote' && currentBlock !== 'pre') {
                document.execCommand('insertHTML', false, '</div><p>');
            } else {
                document.execCommand('insertLineBreak');
            }
            return;
        }

        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                case 'i':
                case 'u':
                case 'z':
                case 'y':
                case 'f':
                    // Use existing logic
                    // ... (keep the original ctrl/meta key logic)
                    if (e.key.toLowerCase() === 'b') { e.preventDefault(); execCommand('bold'); }
                    if (e.key.toLowerCase() === 'i') { e.preventDefault(); execCommand('italic'); }
                    if (e.key.toLowerCase() === 'u') { e.preventDefault(); execCommand('underline'); }
                    if (e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) handleRedo(); else handleUndo(); }
                    if (e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); }
                    if (e.key.toLowerCase() === 'f') { e.preventDefault(); setShowFindReplace(!showFindReplace); }
                    break;
            }
        }
    };

    const ToolbarButton = ({ onClick, icon: Icon, title, commandName }) => {
        const isActive = activeCommands[commandName];

        return (
            <button
                onMouseDown={(e) => {
                    e.preventDefault();
                    onClick();
                }}
                title={title}
                className={`
                    p-[8px] bg-none border border-transparent rounded-lg cursor-pointer flex items-center justify-center text-slate-700 transition-all duration-200 ease-out
                    hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 hover:-translate-y-[1px]
                    ${isActive
                        ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-inner'
                        : 'bg-transparent'
                    }
                `}
                type="button"
            >
                <Icon size={18} />
            </button>
        );
    };

    const ToolbarDivider = () => <div className="w-px h-6 bg-slate-300 mx-1.5" />;

    const handleSubheadingToggle = () => {
        execCommand('formatBlock', 'h2');
    };

    const cleanHtmlContent = (html) => {
        if (!html) return '';

        let cleaned = html.replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '');

        cleaned = cleaned.replace(/<br\s*\/?>/g, '</p><p>');

        if (!cleaned.match(/^\s*<(p|h[1-6]|ul|ol|table|blockquote|pre)/i)) {
            cleaned = `<p>${cleaned}</p>`;
        }

        cleaned = cleaned.replace(/<p>\s*<\/p>/g, '')
            .replace(/<p>(<h2|<ul|<ol|<table|<blockquote|<pre)/g, '$1')
            .replace(/(<\/h2|<\/ul|<\/ol|<\/table|<\/blockquote|<\/pre>)<\/p>/g, '$1');

        return cleaned.trim();
    };

    return (
        <div className="w-full flex flex-col bg-slate-50">
            <div className="p-3 shadow-md bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="flex flex-wrap items-center gap-1 max-w-7xl mx-auto">
                    {/* Text Formatting */}
                    <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold (Ctrl+B)" commandName="bold" />
                    <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic (Ctrl+I)" commandName="italic" />
                    <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline (Ctrl+U)" commandName="underline" />
                    <ToolbarButton onClick={() => execCommand('strikeThrough')} icon={Strikethrough} title="Strikethrough" commandName="strikethrough" />
                    <ToolbarButton onClick={() => execCommand('removeFormat')} icon={RemoveFormatting} title="Clear Formatting" />
                    <ToolbarDivider />

                    {/* UPDATED: Subheading/Paragraph Toggle */}
                    <ToolbarButton
                        onClick={handleSubheadingToggle}
                        icon={Heading}
                        title={activeCommands.subheading ? "Change to Paragraph" : "Change to Subheading (H2)"}
                        commandName={activeCommands.subheading ? "subheading" : "paragraph"}
                    />
                    <ToolbarDivider />

                    {/* Alignment */}
                    <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Align Left" commandName="justifyLeft" />
                    <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Align Center" commandName="justifyCenter" />
                    <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Align Right" commandName="justifyRight" />
                    <ToolbarButton onClick={() => execCommand('justifyFull')} icon={AlignJustify} title="Justify" commandName="justifyFull" />
                    <ToolbarDivider />

                    {/* Lists */}
                    <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" commandName="insertUnorderedList" />
                    <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" commandName="insertOrderedList" />
                    <ToolbarButton onClick={() => execCommand('indent')} icon={Indent} title="Indent" />
                    <ToolbarButton onClick={() => execCommand('outdent')} icon={Outdent} title="Outdent" />
                    <ToolbarDivider />

                    {/* REMOVED: Font and Size Selects */}

                    {/* Colors */}
                    <div className="relative">
                        <ToolbarButton onClick={() => setShowColorPicker(!showColorPicker)} icon={Palette} title="Text Color" />
                        {showColorPicker && (
                            <div className="absolute top-12 left-0 p-2 bg-white rounded-lg shadow-xl z-50 flex gap-1 flex-wrap w-48 border border-slate-200" onMouseDown={(e) => e.preventDefault()}>
                                {colors.map(color => (
                                    <div
                                        key={color}
                                        className="w-8 h-8 rounded-md cursor-pointer border-2 border-transparent transition-all duration-200 hover:scale-110 hover:border-blue-400"
                                        style={{ background: color }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            execCommand('foreColor', color);
                                            setShowColorPicker(false);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <ToolbarButton onClick={() => setShowHighlightPicker(!showHighlightPicker)} icon={Highlighter} title="Highlight Color" />
                        {showHighlightPicker && (
                            <div className="absolute top-12 left-0 p-2 bg-white rounded-lg shadow-xl z-50 flex gap-1 flex-wrap w-48 border border-slate-200" onMouseDown={(e) => e.preventDefault()}>
                                {colors.map(color => (
                                    <div
                                        key={color}
                                        className="w-8 h-8 rounded-md cursor-pointer border-2 border-transparent transition-all duration-200 hover:scale-110 hover:border-blue-400"
                                        style={{ background: color }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            execCommand('backColor', color);
                                            setShowHighlightPicker(false);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <ToolbarDivider />

                    {/* Insert Elements */}
                    <ToolbarButton onClick={() => setShowLinkModal(true)} icon={Link} title="Insert/Edit Link" />
                    <ToolbarButton onClick={() => execCommand('unlink')} icon={ExternalLink} title="Remove Link" />
                    <ToolbarButton onClick={() => setShowImageModal(true)} icon={Image} title="Insert Image" />
                    <ToolbarButton onClick={() => setShowTableModal(true)} icon={Table} title="Insert Table" />
                    <ToolbarButton onClick={() => execCommand('insertHorizontalRule')} icon={Minus} title="Horizontal Rule" />
                    <ToolbarButton onClick={() => execCommand('formatBlock', 'blockquote')} icon={Quote} title="Blockquote" commandName="quote" />
                    <ToolbarButton onClick={() => execCommand('formatBlock', 'pre')} icon={Code} title="Code Block" commandName="code" />
                    <ToolbarDivider />

                    {/* History */}
                    <ToolbarButton onClick={handleUndo} icon={Undo} title="Undo (Ctrl+Z)" />
                    <ToolbarButton onClick={handleRedo} icon={Redo} title="Redo (Ctrl+Y)" />
                    <ToolbarButton onClick={() => setShowFindReplace(!showFindReplace)} icon={Search} title="Find & Replace (Ctrl+F)" />

                    {/* Word Count */}
                    <div className="ml-auto text-sm text-slate-600 font-medium px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 shadow-inner">
                        {wordCount} words
                    </div>
                </div>

                {/* Find & Replace Bar (no change) */}
                {showFindReplace && (
                    <div className="mt-3 flex gap-2 items-center max-w-7xl mx-auto p-3 bg-white rounded-lg border border-slate-200 shadow-md">
                        <input
                            type="text"
                            placeholder="Find..."
                            value={findText}
                            onChange={(e) => setFindText(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Replace..."
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                        {/* FIX: Add type="button" to prevent form submission */}
                        <button
                            onClick={handleFindReplace}
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                            type="button" // <--- ADDED THIS
                        >
                            Replace All
                        </button>
                        {/* FIX: Add type="button" to prevent form submission */}
                        <button
                            onClick={() => setShowFindReplace(false)}
                            className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg shadow-md hover:bg-slate-300 transition duration-150"
                            type="button" // <--- ADDED THIS
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-auto p-4">
                <div className="w-full mx-auto">
                    <div
                        ref={editorRef}
                        contentEditable
                        className="bg-white border border-slate-300 rounded-lg p-12 min-h-[200px] shadow-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200 editor-styles"
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur} // USED new handleBlur function
                        suppressContentEditableWarning
                    />
                </div>
            </div>

            {/* Global Styles (unchanged, still required for contentEditable output styling) */}
            <style global jsx>{`
                .editor-styles table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1rem 0;
                }
                .editor-styles table td {
                    border: 1px solid #cbd5e1;
                    padding: 8px;
                    min-width: 50px;
                }
                .editor-styles blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 16px;
                    margin: 1rem 0;
                    color: #64748b;
                    font-style: italic;
                }
                .editor-styles code {
                    background: #f1f5f9;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                }
                .editor-styles pre {
                    background: #1e293b;
                    color: #e2e8f0;
                    padding: 1rem;
                    border-radius: 6px;
                    overflow-x: auto;
                    font-family: 'Courier New', monospace;
                }
                .editor-styles ul, .editor-styles ol {
                    margin: 0.75rem 0;
                    padding-left: 40px;
                }
                .editor-styles ul li {
                    list-style-type: disc;
                    margin: 4px 0;
                }
                .editor-styles ol li {
                    list-style-type: decimal;
                    margin: 4px 0;
                }
                .editor-styles a {
                    color: #2563eb;
                    text-decoration: underline;
                    cursor: pointer;
                }
                /* UPDATED: Only H2 styling is kept, all others removed */
                .editor-styles h2 { font-size: 28px; font-weight: bold; margin: 18px 0 10px; }
                .editor-styles p { font-size: 16px; margin: 12px 0; } /* Added explicit P styling for consistency */

            `}</style>

            {/* Link Modal (no change) */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowLinkModal(false)}>
                    <div className="bg-white p-6 w-96 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Insert/Edit Link</h3>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-slate-700">Link URL *</label>
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-slate-700">Link Text (optional)</label>
                            <input
                                type="text"
                                placeholder="Click here"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">Leave empty if you have text selected</p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setShowLinkModal(false); setLinkUrl(''); setLinkText(''); }} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition duration-150">Cancel</button>
                            <button onClick={insertLink} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150">Insert Link</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal (no change) */}
            {showImageModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
                    <div className="bg-white p-6 w-96 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Insert Image</h3>
                        <input type="url" placeholder="Enter image URL..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 mb-2" />
                        <div className="text-center text-sm text-slate-500 my-2">or</div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowImageModal(false)} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition duration-150">Cancel</button>
                            <button onClick={insertImage} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150">Insert</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Modal (no change) */}
            {showTableModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTableModal(false)}>
                    <div className="bg-white p-6 w-96 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Insert Table</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-slate-700">Rows</label>
                            <input type="number" min="1" value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-slate-700">Columns</label>
                            <input type="number" min="1" value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowTableModal(false)} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition duration-150">Cancel</button>
                            <button onClick={insertTable} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150">Insert</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;