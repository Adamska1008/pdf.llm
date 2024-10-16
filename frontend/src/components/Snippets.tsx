import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemText, ListItemButton } from "@mui/material";
import { set } from "zod";

const PINNED_SNIPPET_COLOR = 'grey.100';
const SELECTED_SNIPPET_COLOR = '#757de8';

const listItemButtonStyle = (isSelected: boolean) => ({
    bgcolor: isSelected ? SELECTED_SNIPPET_COLOR : PINNED_SNIPPET_COLOR,
    '&.Mui-selected': {
        bgcolor: SELECTED_SNIPPET_COLOR,
        '&:hover': {
            bgcolor: SELECTED_SNIPPET_COLOR,
        }
    }
});

const listItemTextStyle = (isSelected: boolean) => ({
    color: isSelected ? 'white' : 'inherit',
    maxWidth: '15vh',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 4,
    textOverflow: 'ellipsis',
});

const SnippetsPanel = () => {
    // here selection means the text which use selected in pdf viewer
    const [snippets, setSnippets] = useState<string[]>(
        ['Hello world! What ever it is, it\'s a very long sentence, or maybe its not, anyway lets see whatis happening', 'Foobar']);
    const [selected, setSelected] = useState<Set<number>>(new Set<number>());
    const [textFromPdf, setTextFromPdf] = useState<string | null>(null);

    // Detect Selection From Pdf
    useEffect(() => {
        const handleMouseMove = () => {
            const selection = window.getSelection();
            if (selection && selection.toString()) {
                console.log("Selected" + selection.toString());
                setTextFromPdf(selection.toString());
            } else {
                setTextFromPdf(null);
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    const handleSnippetClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number
    ) => {
        setSelected(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        })
    };

    const handleUnpinnedSnippetClick = (text: string) => {
        setSnippets(prevArr => [...prevArr, text]);
        setTextFromPdf(null);
        const selection = window.getSelection();
        selection?.removeAllRanges();
    };

    return (
        <List
            component="nav"
            sx={{ maxWidth: 360 }}
        >
            {snippets.map((text, index) => (
                <ListItem>
                    <ListItemButton
                        selected={selected.has(index)}
                        onClick={(e) => { handleSnippetClick(e, index) }}
                        sx={listItemButtonStyle(selected.has(index))}
                    >
                        <ListItemText
                            sx={listItemTextStyle(selected.has(index))}
                        >
                            {text}
                        </ListItemText>
                    </ListItemButton>
                </ListItem>
            ))}
            {textFromPdf && (<ListItem>
                <ListItemButton>
                    <ListItemText
                        sx={listItemTextStyle(false)}
                        onClick={() => handleUnpinnedSnippetClick(textFromPdf)}
                    >
                        {textFromPdf}
                    </ListItemText>
                </ListItemButton>
            </ListItem>)}
        </List >
    )
};


export default SnippetsPanel;