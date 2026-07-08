import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Image, Trash2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '請輸入商品詳細描述，支援圖片、文字格式與標號列表...'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync internal innerHTML with value prop only if they differ
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        // Insert image at cursor or append
        editorRef.current?.focus();
        document.execCommand('insertImage', false, base64);
        
        // Add a small spacing after image and style it
        setTimeout(() => {
          if (editorRef.current) {
            const images = editorRef.current.querySelectorAll('img');
            images.forEach(img => {
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.borderRadius = '8px';
              img.style.margin = '10px 0';
              img.style.display = 'block';
            });
            handleInput();
          }
        }, 10);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  const insertImageUrl = () => {
    const url = prompt('請輸入圖片網址 (URL):');
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand('insertImage', false, url);
    setTimeout(() => {
      if (editorRef.current) {
        const images = editorRef.current.querySelectorAll('img');
        images.forEach(img => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.borderRadius = '8px';
          img.style.margin = '10px 0';
          img.style.display = 'block';
        });
        handleInput();
      }
    }, 10);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rich-text-editor-container" style={{
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '200px'
    }}>
      {/* Toolbar */}
      <div className="rich-text-toolbar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '6px 8px',
        background: '#f8f9fa',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="toolbar-btn"
          style={buttonStyle}
          title="粗體"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="toolbar-btn"
          style={buttonStyle}
          title="斜體"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="toolbar-btn"
          style={buttonStyle}
          title="底線"
        >
          <Underline size={16} />
        </button>

        <span style={dividerStyle} />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="toolbar-btn"
          style={buttonStyle}
          title="項目符號"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="toolbar-btn"
          style={buttonStyle}
          title="編號列表"
        >
          <ListOrdered size={16} />
        </button>

        <span style={dividerStyle} />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="toolbar-btn"
          style={buttonStyle}
          title="上傳本機圖片"
        >
          <Image size={16} />
        </button>
        <button
          type="button"
          onClick={insertImageUrl}
          className="toolbar-btn"
          style={{ ...buttonStyle, fontSize: '0.75rem', fontWeight: 'bold' }}
          title="插入外部圖片網址"
        >
          URL
        </button>

        <span style={dividerStyle} />

        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="toolbar-btn"
          style={buttonStyle}
          title="清除格式"
        >
          <Trash2 size={16} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="rich-text-editor-content"
        style={{
          padding: '12px',
          flexGrow: 1,
          outline: 'none',
          minHeight: '150px',
          maxHeight: '400px',
          overflowY: 'auto',
          lineHeight: 1.6,
          fontSize: '0.9rem'
        }}
        data-placeholder={placeholder}
      />

      {/* Placeholder stylesheet */}
      <style>{`
        .rich-text-editor-content:empty:before {
          content: attr(data-placeholder);
          color: #a0aec0;
          cursor: text;
        }
        .rich-text-editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 10px 0;
          display: block;
        }
        .toolbar-btn:hover {
          background-color: #e2e8f0 !important;
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  borderRadius: '4px',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#4a5568',
  transition: 'background-color 0.2s',
  padding: 0
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '20px',
  background: '#cbd5e0',
  margin: '0 4px'
};
