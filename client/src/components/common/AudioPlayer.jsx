import React, { useEffect, useRef, useState } from 'react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

//https://stackoverflow.com/questions/48748063/react-refs-audio-playback-unhandled-rejection-notsupportederror-on-ios
const AudioPlayer = ({getUrl, songId, currentlyPlayingId, setCurrentlyPlayingId}) => {
  const audioPlayer = useRef(); 
  const [playing, setPlaying] = useState(false);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (currentlyPlayingId !== songId && playing) {
      stop();
    }
  }, [currentlyPlayingId]);

  const play = async () => {
    if (!url) {
      setLoading(true);
      const newUrl = await getUrl();
      setUrl(newUrl);
      if (audioPlayer.current) {
        audioPlayer.current.load();
      }
      setLoading(false);
    }
    setCurrentlyPlayingId(songId);
    setPlaying(true);
    audioPlayer.current.play();
  };

  const stop = () => {
    if (url) {
      audioPlayer.current.pause();
      audioPlayer.current.currentTime = 0;
    }
    setPlaying(false);
    if (currentlyPlayingId === songId) {
      setCurrentlyPlayingId(null);
    }
  };

  const onPlaying = () => {
    if (audioPlayer.current.paused) {
      setPlaying(false);
      if (currentlyPlayingId === songId) {
        setCurrentlyPlayingId(null);
      }
    }
  }
  
  return (
    <div>
      <audio
        src={url}
        ref={audioPlayer}         
        onTimeUpdate={onPlaying}
      >
        Your browser does not support the
        <code>audio</code> element.
      </audio>
      {/* <button onClick={(!playing ? play : stop)} disabled={loading}>
        {loading ? 'Loading...' : (playing ? 'Pause' : 'Play')}
      </button> */}
      <Tooltip title={playing ? 'Stop' : 'Play'} placement="top" arrow>
        <IconButton onClick={(!playing ? play : stop)} disabled={loading} size="large">
          {loading ? <PlayArrowOutlinedIcon fontSize="large"/> : (playing ? <StopIcon fontSize="large"/> : <PlayArrowIcon fontSize="large"/>)}
        </IconButton>
      </Tooltip>

    </div>
  )
}

export default AudioPlayer 