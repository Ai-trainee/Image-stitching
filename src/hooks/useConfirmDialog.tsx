import React, { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UseConfirmDialogOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  dangerConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface UseConfirmDialogResult {
  showDialog: (options?: UseConfirmDialogOptions) => void;
  hideDialog: () => void;
  ConfirmDialog: () => JSX.Element;
}

/**
 * 自定义Hook，提供确认对话框功能
 * 
 * @example
 * ```tsx
 * const { showDialog, ConfirmDialog } = useConfirmDialog();
 * 
 * // 在需要确认的地方
 * const handleDeleteClick = () => {
 *   showDialog({
 *     title: '确认删除',
 *     description: '该操作无法撤销，是否继续？',
 *     confirmText: '删除',
 *     dangerConfirm: true,
 *     onConfirm: performDelete
 *   });
 * }
 * 
 * // 在组件中渲染对话框组件
 * return (
 *   <>
 *     <button onClick={handleDeleteClick}>删除</button>
 *     <ConfirmDialog />
 *   </>
 * )
 * ```
 */
export default function useConfirmDialog(
  defaultOptions?: UseConfirmDialogOptions
): UseConfirmDialogResult {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmDialogOptions>(defaultOptions || {});

  const showDialog = useCallback((dialogOptions?: UseConfirmDialogOptions) => {
    setOptions(prev => ({ ...prev, ...dialogOptions }));
    setOpen(true);
  }, []);

  const hideDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    options.onConfirm?.();
    hideDialog();
  }, [options, hideDialog]);

  const handleCancel = useCallback(() => {
    options.onCancel?.();
    hideDialog();
  }, [options, hideDialog]);

  const ConfirmDialog = useCallback(() => {
    const {
      title = '确认操作',
      description = '您确定要执行此操作吗？',
      confirmText = '确认',
      cancelText = '取消',
      dangerConfirm = false,
    } = options;

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-tool-surface border border-tool-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              className="bg-black/50 border-tool-border/50 text-gray-300 hover:bg-black/80 hover:text-white"
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                dangerConfirm
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-tool-primary text-black hover:bg-tool-primary/90'
              }
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [open, options, handleConfirm, handleCancel]);

  return {
    showDialog,
    hideDialog,
    ConfirmDialog,
  };
} 