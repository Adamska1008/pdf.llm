import React, { useState } from "react";
import { List, ListItem, ListItemText, ListItemButton } from "@mui/material";

const PINNED_SNIPPET_COLOR = 'grey.100';
const SELECTED_SNIPPET_COLOR = '#757de8';


const SnippetsPanel = () => {
    // here selection means the text which use selected in pdf viewer
    const [selections, setSelections] = useState<string[]>(
        ['Hello world! What ever it is, it\'s a very long sentence, or maybe its not, anyway lets see whatis happening', 'Foobar']);
    const [selectedTexts, setSelectedTexts] = useState<Set<number>>(new Set<number>());

    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number
    ) => {
        setSelectedTexts(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        })
    };

    return (
        <List
            component="nav"
            sx={{ maxWidth: 360 }}
        >
            {selections.map((text, index) => (
                <ListItem>
                    <ListItemButton
                        selected={selectedTexts.has(index)}
                        onClick={(e) => { handleListItemClick(e, index) }}
                        sx={{
                            bgcolor: selectedTexts.has(index) ? SELECTED_SNIPPET_COLOR : PINNED_SNIPPET_COLOR,
                            '&.Mui-selected': {
                                bgcolor: SELECTED_SNIPPET_COLOR,
                                '&:hover': {
                                    bgcolor: SELECTED_SNIPPET_COLOR,
                                }
                            }
                        }}
                    >
                        <ListItemText
                            sx={{
                                color: selectedTexts.has(index) ? 'white' : 'inherit',
                                maxWidth: '15vh',
                                overflow: 'hidden',
                                display: '-webkit-box', // 使用盒子模型
                                WebkitBoxOrient: 'vertical', // 垂直排列
                                WebkitLineClamp: 3, // 限制显示行数为 2 行
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {text}
                        </ListItemText>
                    </ListItemButton>
                </ListItem>
            ))}
        </List >
    )
};


export default SnippetsPanel;