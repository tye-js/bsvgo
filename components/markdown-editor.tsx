'use client';

import React, { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  className?: string;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  className,
  placeholder = '开始编写您的 Markdown 内容...',
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant={isPreview ? 'outline' : 'default'}
            size="sm"
            onClick={togglePreview}
          >
            {isPreview ? (
              <>
                <Edit className="w-4 h-4 mr-1" />
                编辑
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                预览
              </>
            )}
          </Button>
        </div>
        {onSave && (
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
        )}
      </div>

      {/* 编辑器/预览区域 */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div className="p-4 prose prose-slate max-w-none">
            <ReactMarkdown>{value || '暂无内容'}</ReactMarkdown>
          </div>
        ) : (
          <CodeMirror
            value={value}
            onChange={handleChange}
            extensions={[markdown()]}
            theme={oneDark}
            placeholder={placeholder}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
            }}
            className="text-sm"
          />
        )}
      </div>
    </div>
  );
}
