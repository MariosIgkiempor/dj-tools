import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function DropContainer({ onDragOver, onDrop, onDragLeave, children }: PropsWithChildren<{
    onDragOver?: (e: DragEvent) => void;
    onDragLeave?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
}>) {
    const dropContainer = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<boolean>(false);

    useEffect(() => {
        function handleDragOver(event: DragEvent) {
            event.preventDefault();
            event.stopPropagation();
            setDragging(true);
            onDragOver?.(event);
        }

        function handleDrop(event: DragEvent) {
            event.preventDefault();
            event.stopPropagation();
            setDragging(false);
            onDrop?.(event);
        }

        function handleDragLeave(event: DragEvent) {
            event.preventDefault();
            event.stopPropagation();
            setDragging(false);
            onDragLeave?.(event);
        }

        dropContainer.current?.addEventListener('dragover', handleDragOver);
        dropContainer.current?.addEventListener('drop', handleDrop);
        dropContainer.current?.addEventListener('dragleave', handleDragLeave);

        return () => {
            if (dropContainer.current) {
                dropContainer.current?.removeEventListener('dragover', handleDragOver);
                dropContainer.current?.removeEventListener('drop', handleDrop);
                dropContainer.current?.removeEventListener('dragleave', handleDragLeave);
            }
        };
    }, []);

    return <div ref={dropContainer} className={cn('border border-muted rounded-lg', {
        'border-yellow-500 border-2 border-spacing-2': dragging
    })}>{children}</div>;
}
