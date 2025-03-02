import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Textarea } from '@/components/ui/textarea';
import { DragEventHandler, FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function tokenize(input: string): string[] {
    const tokens = [];
    const lines = input.split('\n').filter(line => line.length > 0).map(line => line.trim());
    for (const line of lines) {
        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                const start = i + 1;
                let end = start;
                while (end < line.length && line[end] !== '"') {
                    end++;
                }
                tokens.push(line.substring(start, end));
                i = end + 1;
            } else {
                const start = i;
                let end = i;
                while (end < line.length && line[end] !== ' ' && line[end] !== '"') {
                    end++;
                }
                tokens.push(line.substring(start, end));
                i = end;
            }
        }
    }
    return tokens;
}

function parseTrack(tokens: string[], startIndex: number) {
    // console.assert(tokens[startIndex].toLowerCase() === 'track')
    let trackTitle = '';
    let artist = '';
    let startTime = '';

    let i = startIndex + 1;
    for (; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.toLowerCase() === 'track') {
            break;
        }

        if (token.toLowerCase() === 'title') {
            i += 1;
            trackTitle = tokens[i];
        } else if (token.toLowerCase() === 'performer') {
            i += 1;
            artist = tokens[i];
        } else if (token.toLowerCase() === 'index') {
            i += 2;
            startTime = tokens[i];
        }
    }

    return {
        output: `${startTime}: ${artist} - ${trackTitle}\n`,
        tokensParsed: i - startIndex
    };
}

function parse(tokens: string[]) {
    let result = '';

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.toLowerCase() === 'track') {
            const { output, tokensParsed } = parseTrack(tokens, i);
            result += output;
            i += tokensParsed;
        }
    }

    return result;
}

/**
 * A button that copies the given text to the clipboard when clicked.
 *
 * @note Use within a container with the `relative group` classes.
 */
function CopyToClipboardButton(props: { text: string }) {
    return <Button variant={'outline'} className={'absolute top-2 right-2 hidden group-hover:block'}
                   onClick={() => navigator.clipboard.writeText(props.text)}>
        Copy to clipboard
    </Button>;
}

function RekordboxTimestampsWidgetOutput({ output }: { output: string }) {
    if (output.length === 0) {
        return null;
    }

    return <ScrollArea className={'flex-1 h-36 border p-2 rounded-lg group'}>
        <CopyToClipboardButton text={output} />
        <pre className="text-sm">{output}</pre>
    </ScrollArea>;
}

function RekordboxTimestampsWidgetInput({ onInputChange, input }: {
    input: string,
    onInputChange: (value: (((prevState: string) => string) | string)) => void
}) {
    const dropContainer = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<boolean>(false);

    const handleDrop: DragEventHandler<HTMLTextAreaElement> = async (event) => {
        event.preventDefault();

        let text = '';

        if (event.dataTransfer.items) {
            for (const item of [...event.dataTransfer.items]) {
                if (item.kind !== 'file') {
                    continue;
                }

                const file = item.getAsFile();
                text += await file?.text();
            }
        }

        onInputChange(text);
    };

    useEffect(() => {
        function handleDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            setDragging(true);
        }

        function handleDragLeave(e) {
            e.preventDefault();
            e.stopPropagation();
            setDragging(false);
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
    })}>
        <Textarea onChange={(e) => onInputChange(e.target.value)}
                  value={input}
                  onDrop={handleDrop}
                  placeholder={'Paste or drag & drop your Rekordbox .cue file here'}
                  className={'h-36 border-none'} />
    </div>;
}

function RekordboxTimestampsWidget() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const tokens = tokenize(input);
        console.log(tokens);
        const output = parse(tokens);

        setOutput(output);
    }

    return <Card>
        <CardHeader><CardTitle>Rekordbox Timestamps Generator</CardTitle>
            <CardDescription>Copy Rekordbox <pre className={'inline'}>.cue</pre> files here to generate a
                Youtube-friendly description</CardDescription></CardHeader>
        <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
                <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                    <RekordboxTimestampsWidgetInput input={input} onInputChange={setInput} />
                    <Button type="submit" disabled={input.length === 0}>Generate</Button>
                </form>

                <RekordboxTimestampsWidgetOutput output={output} />
            </div>
        </CardContent>
    </Card>;
}

export default function Welcome() {
    return (
        <AppLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <RekordboxTimestampsWidget />
            </div>
        </AppLayout>
    );
}
