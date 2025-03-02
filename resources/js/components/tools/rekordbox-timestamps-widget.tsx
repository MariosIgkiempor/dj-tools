import { FormEvent, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { CopyToClipboardButton } from '@/components/copy-to-clipboard-button';
import { DropContainer } from '@/components/drop-container';


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
    const handleDrop = async (event: DragEvent) => {
        event.preventDefault();

        let text = '';

        if (event.dataTransfer?.items) {
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


    return <DropContainer onDrop={handleDrop}>
        <Textarea onChange={(e) => onInputChange(e.target.value)}
                  value={input}
                  placeholder={'Paste or drag & drop your Rekordbox .cue file here'}
                  className={'h-36 border-none'} />
    </DropContainer>;
}


export function RekordboxTimestampsWidget() {
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
        <CardHeader>
            <CardTitle>
                Rekordbox Timestamps Generator
            </CardTitle>
            <CardDescription>
                Copy Rekordbox <pre className={'inline'}>.cue</pre> files here to generate a Youtube-friendly description
            </CardDescription>
        </CardHeader>
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
