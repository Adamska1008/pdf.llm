import { Typography } from "@mui/material";
import { useState } from "react";
import { List, ListItem, ListItemText, ListItemButton } from "@mui/material";



const SelectionPanel = () => {
    // here selection means the text which use selected in pdf viewer
    const [selections, setSelections] = useState<string[]>(['Hello world!', 'Foobar']);

    return (
        <List
            component="nav"
            sx={{ maxWidth: 360 }}
        >
            {selections.map(text => (
                <ListItem>
                    <ListItemButton>
                        <ListItemText>{text}</ListItemText>
                    </ListItemButton>
                </ListItem>
            ))}
        </List >
    )
};


export default SelectionPanel;