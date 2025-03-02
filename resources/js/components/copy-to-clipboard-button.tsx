import { Button } from '@/components/ui/button';

/**
 * A button that copies the given text to the clipboard when clicked.
 *
 * @note Use within a container with the `relative group` classes.
 */
export function CopyToClipboardButton(props: { text: string }) {
    return <Button variant={'outline'} className={'absolute top-2 right-2 hidden group-hover:block'}
                   onClick={() => navigator.clipboard.writeText(props.text)}>
        Copy to clipboard
    </Button>;
}
