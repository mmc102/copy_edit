'use client'
import React, { useState } from 'react'

export default function FindAndReplace() {
    const [findString, setFindString] = useState('');
    const [replaceString, setReplaceString] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = {
            findString: findString,
            replaceString: replaceString,
        };
        // TODO

    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Find String:
                    <input
                        type="text"
                        value={findString}
                        onChange={(e) => setFindString(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Replace String:
                    <input
                        type="text"
                        value={replaceString}
                        onChange={(e) => setReplaceString(e.target.value)}
                    />
                </label>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
}
