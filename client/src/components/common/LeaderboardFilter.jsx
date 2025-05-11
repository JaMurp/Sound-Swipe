
import React from 'react';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';



const LeaderboardFilter = ({ genres, setGenreList }) => {
    return (
        <div>
            <div>
                <Stack direction="row" spacing={1}>
                    <Autocomplete
                        multiple
                        size="small"
                        limitTags={2}
                        id="genre-select"
                        options={genres}
                        onChange={(event, value) => {
                            setGenreList(value);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Genres" placeholder="Genres" variant='filled' />
                        )}
                        sx={{ width: '20rem' }}
                    />
                </Stack>

            </div>
        </div>)
}

export default LeaderboardFilter;